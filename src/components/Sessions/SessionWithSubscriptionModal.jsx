import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Clock, User, Monitor, CreditCard, AlertCircle, 
  Check, X, Star, Gift, Info 
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
// import { useLanguage } from '../../contexts/LanguageContext'; // TODO: Ajouter les traductions
import { useNotification } from '../../contexts/NotificationContext';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';
import { useCalculateSubscriptionBenefit } from '../../hooks/useSessions';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const SessionWithSubscriptionModal = ({ 
  isOpen, 
  onClose, 
  poste, 
  onStartSession,
  isLoading = false 
}) => {
  const { effectiveTheme } = useTheme();
  // const { translations } = useLanguage(); // TODO: Ajouter les traductions
  const { showError } = useNotification();

  // États locaux
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAbonnement, setSelectedAbonnement] = useState(null);
  const [dureeMinutes, setDureeMinutes] = useState(60);
  const [planTarifaire, setPlanTarifaire] = useState('PLAN_TARIFAIRE');
  const [avantageApplique, setAvantageApplique] = useState(null);
  const [step, setStep] = useState(1); // 1: Client, 2: Abonnement, 3: Confirmation

  const isDarkMode = effectiveTheme === 'dark';

  // Hooks pour les données
  const { 
    data: clientsData, 
    isLoading: clientsLoading, 
    error: clientsError 
  } = useClients();

  const { 
    data: abonnementsData, 
    isLoading: abonnementsLoading 
  } = useAbonnements(selectedClient?.id);

  // Hook pour calculer l'avantage en temps réel
  const calculateSubscriptionBenefitMutation = useCalculateSubscriptionBenefit();

  // Données normalisées
  const clients = useMemo(() => {
    if (!clientsData) return [];
    return Array.isArray(clientsData) ? clientsData : (clientsData.data || []);
  }, [clientsData]);

  const abonnements = useMemo(() => {
    if (!abonnementsData || !selectedClient) return [];
    const abonnements = Array.isArray(abonnementsData) ? abonnementsData : (abonnementsData.data || []);
    return abonnements.filter(abo => 
      abo.clientId === selectedClient.id && 
      abo.statut === 'ACTIF' &&
      new Date(abo.dateFinValidite) > new Date()
    );
  }, [abonnementsData, selectedClient]);

  // Calcul de l'avantage
  const calculerAvantage = useCallback((abonnement, duree, tarif) => {
    if (!abonnement || !duree || !tarif) return null;

    const tarifHoraire = parseFloat(poste?.TypePoste?.tarifHoraire || 0);
    const montantSansReduction = (tarifHoraire * duree) / 60;

    let avantage = {
      type: abonnement.TypeAbonnement?.typeBenefice,
      valeur: abonnement.TypeAbonnement?.valeurBenefice,
      montantOriginal: montantSansReduction,
      montantFinal: montantSansReduction,
      reductionMontant: 0,
      heuresOffertes: 0
    };

    switch (abonnement.TypeAbonnement?.typeBenefice) {
      case 'REDUCTION_POURCENTAGE':
        avantage.reductionMontant = montantSansReduction * (avantage.valeur / 100);
        avantage.montantFinal = montantSansReduction - avantage.reductionMontant;
        break;
      case 'HEURES_OFFERTES':
        // Si le client a des heures offertes disponibles
        if (abonnement.heuresRestantes > 0) {
          const heuresAConsommer = Math.min(duree / 60, abonnement.heuresRestantes);
          avantage.heuresOffertes = heuresAConsommer;
          avantage.montantFinal = Math.max(0, montantSansReduction - (tarifHoraire * heuresAConsommer));
          avantage.reductionMontant = tarifHoraire * heuresAConsommer;
        }
        break;
      case 'TARIF_FIXE':
        avantage.montantFinal = abonnement.TypeAbonnement?.valeurBenefice || 0;
        avantage.reductionMontant = Math.max(0, montantSansReduction - avantage.montantFinal);
        break;
      default:
        break;
    }

    return avantage;
  }, [poste]);

  // Effet pour calculer l'avantage quand les paramètres changent
  useEffect(() => {
    if (selectedAbonnement && dureeMinutes && poste?.id) {
      console.log('🧮 [MODAL] Calcul avantage abonnement en cours...');
      
      calculateSubscriptionBenefitMutation.mutate({
        abonnementId: selectedAbonnement.id,
        dureeMinutes: dureeMinutes,
        posteId: poste.id
      }, {
        onSuccess: (data) => {
          console.log('✅ [MODAL] Avantage calculé:', data);
          setAvantageApplique(data.avantage || data);
        },
        onError: (error) => {
          console.error('❌ [MODAL] Erreur calcul avantage:', error);
          // Fallback vers le calcul local
          const avantageLocal = calculerAvantage(selectedAbonnement, dureeMinutes, planTarifaire);
          setAvantageApplique(avantageLocal);
        }
      });
    } else {
      setAvantageApplique(null);
    }
  }, [selectedAbonnement, dureeMinutes, planTarifaire, poste?.id, calculateSubscriptionBenefitMutation, calculerAvantage]);

  // Gestionnaires d'événements
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setSelectedAbonnement(null);
    setAvantageApplique(null);
    setStep(2);
  };

  const handleAbonnementSelect = (abonnement) => {
    setSelectedAbonnement(abonnement);
    setStep(3);
  };

  const handleStartSession = () => {
    if (!selectedClient || !poste) {
      showError("Veuillez sélectionner un client et un poste");
      return;
    }

    const sessionData = {
      posteId: poste.id,
      clientId: selectedClient.id,
      dureeEstimeeMinutes: dureeMinutes,
      planTarifaireUtilise: planTarifaire,
      abonnementId: selectedAbonnement?.id || null,
      avantageAbonnement: avantageApplique,
      typeSession: 'AVEC_ABONNEMENT'
    };

    onStartSession(sessionData);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        setSelectedClient(null);
        setSelectedAbonnement(null);
      } else if (step === 3) {
        setSelectedAbonnement(null);
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((stepNum) => (
        <React.Fragment key={stepNum}>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${step >= stepNum 
              ? isDarkMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-500 text-white'
              : isDarkMode 
                ? 'bg-gray-700 text-gray-400' 
                : 'bg-gray-200 text-gray-500'
            }
          `}>
            {step > stepNum ? <Check size={16} /> : stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`
              w-16 h-1 mx-2
              ${step > stepNum 
                ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderClientSelection = () => (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Sélectionner un client
      </h3>
      
      {clientsLoading && <LoadingSpinner />}
      
      {clientsError && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">Erreur lors du chargement des clients</span>
          </div>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto space-y-2">
        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => handleClientSelect(client)}
            className={`
              p-4 rounded-lg border cursor-pointer transition-colors
              ${isDarkMode 
                ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-700' 
                : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
              }
            `}
          >
            <div className="flex items-center">
              <User className={`h-5 w-5 mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {client.nom} {client.prenom}
                </p>
                {client.email && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {client.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAbonnementSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Abonnements de {selectedClient?.nom} {selectedClient?.prenom}
        </h3>
        <button
          onClick={handleBack}
          className={`
            px-3 py-1 text-sm rounded border
            ${isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          Retour
        </button>
      </div>

      {abonnementsLoading && <LoadingSpinner />}

      {abonnements.length === 0 && !abonnementsLoading && (
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center">
            <Info className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Aucun abonnement actif trouvé pour ce client
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedAbonnement(null);
              setStep(3);
            }}
            className={`
              mt-3 px-4 py-2 text-sm rounded
              ${isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            Continuer sans abonnement
          </button>
        </div>
      )}

      <div className="space-y-2">
        {abonnements.map((abonnement) => (
          <div
            key={abonnement.id}
            onClick={() => handleAbonnementSelect(abonnement)}
            className={`
              p-4 rounded-lg border cursor-pointer transition-colors
              ${isDarkMode 
                ? 'border-gray-700 hover:border-green-500 hover:bg-gray-700' 
                : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
              }
            `}
          >
            <div className="flex items-start">
              <Star className={`h-5 w-5 mr-3 mt-0.5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {abonnement.TypeAbonnement?.nom}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {abonnement.TypeAbonnement?.description}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                    Valide jusqu'au {new Date(abonnement.dateFinValidite).toLocaleDateString()}
                  </span>
                  {abonnement.heuresRestantes > 0 && (
                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                      {abonnement.heuresRestantes}h restantes
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Confirmation de la session
        </h3>
        <button
          onClick={handleBack}
          className={`
            px-3 py-1 text-sm rounded border
            ${isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          Retour
        </button>
      </div>

      {/* Résumé de la session */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Détails de la session
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Poste :</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{poste?.nom}</span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Client :</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {selectedClient?.nom} {selectedClient?.prenom}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Durée estimée :</span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dureeMinutes} minutes</span>
          </div>
          
          {selectedAbonnement && (
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Abonnement :</span>
              <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                {selectedAbonnement.TypeAbonnement?.nom}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Calcul des coûts */}
      {avantageApplique && (
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center mb-3">
            <Gift className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h4 className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
              Avantage abonnement appliqué
            </h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-green-300' : 'text-green-700'}>Tarif normal :</span>
              <span className={`line-through ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                {avantageApplique.montantOriginal.toFixed(2)} €
              </span>
            </div>
            
            {avantageApplique.reductionMontant > 0 && (
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-green-300' : 'text-green-700'}>Réduction :</span>
                <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  -{avantageApplique.reductionMontant.toFixed(2)} €
                </span>
              </div>
            )}
            
            {avantageApplique.heuresOffertes > 0 && (
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-green-300' : 'text-green-700'}>Heures offertes utilisées :</span>
                <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {avantageApplique.heuresOffertes.toFixed(1)}h
                </span>
              </div>
            )}
            
            <div className={`flex justify-between pt-2 border-t ${isDarkMode ? 'border-green-700' : 'border-green-300'}`}>
              <span className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Montant final :</span>
              <span className={`font-bold text-lg ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {avantageApplique.montantFinal.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Durée et plan tarifaire */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Durée (minutes)
          </label>
          <input
            type="number"
            min="15"
            max="480"
            step="15"
            value={dureeMinutes}
            onChange={(e) => setDureeMinutes(parseInt(e.target.value) || 60)}
            className={`
              w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
              }
            `}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Plan tarifaire
          </label>
          <select
            value={planTarifaire}
            onChange={(e) => setPlanTarifaire(e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
              }
            `}
          >
            <option value="PLAN_TARIFAIRE">Plan tarifaire standard</option>
            <option value="ABONNEMENT">Tarif abonnement</option>
          </select>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`
        w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl
        ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
      `}>
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Monitor className={`h-6 w-6 mr-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nouvelle session avec abonnement
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Poste: {poste?.nom}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
            >
              <X size={20} />
            </button>
          </div>

          {/* Indicateur d'étapes */}
          {renderStepIndicator()}

          {/* Contenu selon l'étape */}
          {step === 1 && renderClientSelection()}
          {step === 2 && renderAbonnementSelection()}
          {step === 3 && renderConfirmation()}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              Annuler
            </button>
            
            {step === 3 && (
              <button
                onClick={handleStartSession}
                disabled={isLoading || !selectedClient}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-colors flex items-center
                  ${isDarkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Démarrage...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Démarrer la session
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWithSubscriptionModal;

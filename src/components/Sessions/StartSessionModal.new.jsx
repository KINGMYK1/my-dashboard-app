import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSessionActions, useStartSessionWithSubscription } from '../../hooks/useSessions';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';
import { useNotification } from '../../contexts/NotificationContext';
import { usePayment } from '../../contexts/PaymentContext';
import PricingService from '../../services/pricingService';
import { Star, Clock, CreditCard, DollarSign, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StartSessionModal = ({ isOpen, onClose, poste, onSessionStarted }) => {
  const [duration, setDuration] = useState(60); // Durée par défaut en minutes
  const [startTime, setStartTime] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionType, setSessionType] = useState('standard'); // standard ou subscription
  const [prixCalcule, setPrixCalcule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calculEnCours, setCalculEnCours] = useState(false);
  const [paiementAnticipe, setPaiementAnticipe] = useState(false);
  const [montantPaye, setMontantPaye] = useState('');
  const [modePaiement, setModePaiement] = useState('ESPECES');
  const [marquerCommePayee, setMarquerCommePayee] = useState(false);
  
  const { startSession } = useSessionActions();
  const { startSessionWithSubscription } = useStartSessionWithSubscription();
  const { showSuccess, showError } = useNotification();
  const { marquerSessionPayee } = usePayment();
  const { clients } = useClients();
  const { abonnements } = useAbonnements();
  
  // Options de durée prédéfinies
  const durationOptions = [30, 60, 90, 120, 180, 240];
  
  // Formatage de l'heure de début pour affichage
  const formattedStartTime = useMemo(() => {
    return format(startTime, "dd MMMM yyyy à HH:mm", { locale: fr });
  }, [startTime]);
  
  // Filtrage des clients en fonction du terme de recherche
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    return clients.filter(client => {
      const fullName = `${client.nom} ${client.prenom}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    }).slice(0, 5); // Limite à 5 résultats pour éviter une liste trop longue
  }, [clients, searchTerm]);
  
  // Vérifier si le client sélectionné a des abonnements actifs
  const activeAbonnements = useMemo(() => {
    if (!selectedClient) return [];
    
    return abonnements.filter(abo => 
      abo.client_id === selectedClient.id && 
      new Date(abo.date_fin_validite) >= new Date() &&
      abo.est_actif
    );
  }, [selectedClient, abonnements]);
  
  // Calcul du prix via l'API PricingService
  const calculerPrix = useCallback(async () => {
    if (!poste || !poste.type_poste) return;
    
    try {
      setCalculEnCours(true);
      console.log('💰 [START_SESSION_MODAL] Calcul prix via API:', {
        posteId: poste.id,
        dureeMinutes: duration
      });
      
      const result = await PricingService.calculerPrixEstime(
        poste.id,
        parseInt(duration)
      );
      
      console.log('✅ [START_SESSION_MODAL] Prix calculé par API:', result);
      
      if (result && result.data) {
        setPrixCalcule(result.data);
        
        // Mettre à jour le montant payé pour le paiement anticipé
        if (paiementAnticipe) {
          setMontantPaye(result.data.montantTotal.toString());
        }
      } else {
        console.error('❌ [START_SESSION_MODAL] Format de réponse invalide:', result);
        setPrixCalcule(null);
      }
    } catch (error) {
      console.error('❌ [START_SESSION_MODAL] Erreur calcul prix:', error);
      setPrixCalcule(null);
      showError('Erreur lors du calcul du prix');
    } finally {
      setCalculEnCours(false);
    }
  }, [poste, duration, paiementAnticipe, showError]);
  
  // Calcul automatique du prix quand poste ou durée change
  useEffect(() => {
    if (poste && duration > 0) {
      const timeoutId = setTimeout(() => {
        calculerPrix();
      }, 500); // Délai pour éviter trop d'appels API
      
      return () => clearTimeout(timeoutId);
    } else {
      setPrixCalcule(null);
    }
  }, [poste, duration, calculerPrix]);
  
  // Mise à jour du montant payé quand le paiement anticipé est activé/désactivé
  useEffect(() => {
    if (paiementAnticipe && prixCalcule) {
      setMontantPaye(prixCalcule.montantTotal.toString());
    } else if (!paiementAnticipe) {
      setMontantPaye('');
      setMarquerCommePayee(false);
    }
  }, [paiementAnticipe, prixCalcule]);
  
  // Gestion du changement de client
  const handleClientChange = (client) => {
    setSelectedClient(client);
    setSearchTerm(`${client.nom} ${client.prenom}`);
    // Si le client a des abonnements, propose automatiquement de les utiliser
    if (client && abonnements.some(abo => 
      abo.client_id === client.id && 
      new Date(abo.date_fin_validite) >= new Date() &&
      abo.est_actif)) {
      setSessionType('subscription');
    }
  };
  
  // Soumission du formulaire pour démarrer une session
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!poste || !poste.id) {
      showError('Poste invalide');
      return;
    }

    if (!duration || duration <= 0) {
      showError('Veuillez saisir une durée valide');
      return;
    }

    if (!prixCalcule) {
      showError('Impossible de calculer le prix. Veuillez réessayer.');
      return;
    }
    
    // Validation du paiement anticipé
    if (paiementAnticipe) {
      const montantPayeFloat = parseFloat(montantPaye || 0);
      if (montantPayeFloat <= 0) {
        showError('Veuillez saisir un montant payé valide');
        return;
      }
      if (montantPayeFloat > prixCalcule.montantTotal * 1.5) {
        showError('Le montant payé semble trop élevé');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      let sessionData = {
        posteId: poste.id,
        dureeMinutes: parseInt(duration),
        clientId: selectedClient?.id || null,
        notes: '',
        // Paramètres de paiement anticipé
        paiementAnticipe: paiementAnticipe,
        montantPaye: paiementAnticipe ? parseFloat(montantPaye || 0) : 0,
        marquerCommePayee: paiementAnticipe && marquerCommePayee,
        modePaiement: paiementAnticipe ? modePaiement : null,
      };
      
      console.log('📤 [START_SESSION_MODAL] Envoi données:', sessionData);
      console.log('💰 [START_SESSION_MODAL] Prix calculé:', prixCalcule);
      
      let result;
      
      if (sessionType === 'subscription' && activeAbonnements.length > 0) {
        // Démarrer une session avec abonnement
        sessionData.abonnementId = activeAbonnements[0].id;
        result = await startSessionWithSubscription(sessionData);
      } else {
        // Démarrer une session standard
        result = await startSession(sessionData);
      }
      
      // Si paiement anticipé, marquer la session comme payée dans le contexte
      if (paiementAnticipe && result) {
        // Essayer différentes structures de réponse possibles
        const sessionId = result.sessionId || result.data?.sessionId || result.data?.id || result.id;
        
        if (sessionId) {
          console.log('💳 [START_SESSION_MODAL] Marquage paiement anticipé session:', sessionId);
          marquerSessionPayee(sessionId, {
            montantPaye: parseFloat(montantPaye),
            modePaiement: modePaiement,
            marquerCommePayee: marquerCommePayee
          });
        } else {
          console.warn('⚠️ [START_SESSION_MODAL] Impossible de récupérer ID session:', result);
        }
      }
      
      showSuccess('Session démarrée avec succès');
      if (onSessionStarted) onSessionStarted(result);
      onClose();
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error);
      showError(`Erreur: ${error.message || 'Problème lors du démarrage de la session'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialisation du formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setDuration(60);
      setStartTime(new Date());
      setSelectedClient(null);
      setSearchTerm('');
      setSessionType('standard');
      setPrixCalcule(null);
      setPaiementAnticipe(false);
      setMontantPaye('');
      setModePaiement('ESPECES');
      setMarquerCommePayee(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Démarrer une session - {poste?.nom || ''}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Type de session */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Type de session
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setSessionType('standard')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  sessionType === 'standard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Clock size={18} className="mr-2" />
                Standard
              </button>
              <button
                type="button"
                onClick={() => setSessionType('subscription')}
                disabled={!activeAbonnements.length}
                className={`flex items-center px-4 py-2 rounded-md ${
                  sessionType === 'subscription' && activeAbonnements.length
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                } ${!activeAbonnements.length ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Star size={18} className="mr-2" />
                Abonnement
                {activeAbonnements.length ? ` (${activeAbonnements.length})` : ''}
              </button>
            </div>
          </div>
          
          {/* Durée */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Durée (minutes)
            </label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDuration(option)}
                  className={`px-3 py-1 rounded-md ${
                    duration === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
              <input
                type="number"
                min="15"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-20 px-3 py-1 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          
          {/* Heure de début */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Heure de début
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="datetime-local"
                value={format(startTime, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setStartTime(new Date(e.target.value))}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formattedStartTime}
            </p>
          </div>
          
          {/* Sélection du client */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Client (optionnel)
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
              {searchTerm && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientChange(client)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {client.nom} {client.prenom}
                      {abonnements.some(abo => 
                        abo.client_id === client.id && 
                        new Date(abo.date_fin_validite) >= new Date() &&
                        abo.est_actif) && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Star size={12} className="mr-1" />
                          Abonné
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {selectedClient && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md flex justify-between items-center">
                  <span className="dark:text-gray-200">
                    {selectedClient.nom} {selectedClient.prenom}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setSearchTerm('');
                      setSessionType('standard');
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Résumé et prix */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Résumé</h3>
            
            {calculEnCours ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">Calcul en cours...</span>
              </div>
            ) : prixCalcule ? (
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Poste:</span>
                  <span className="font-medium">{poste?.nom || ''}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Type de poste:</span>
                  <span className="font-medium">{poste?.type_poste?.nom || ''}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tarif horaire:</span>
                  <span className="font-medium">
                    {poste?.type_poste?.tarif_horaire?.toFixed(2) || '0.00'} €/h
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Durée:</span>
                  <span className="font-medium">{duration} minutes</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Type:</span>
                  <span className="font-medium">
                    {sessionType === 'subscription' ? 'Abonnement' : 'Standard'}
                  </span>
                </li>
                {selectedClient && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Client:</span>
                    <span className="font-medium">{selectedClient.nom} {selectedClient.prenom}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Plan tarifaire:</span>
                  <span className="font-medium text-green-600">
                    {prixCalcule.planUtilise?.nom || 'Standard'}
                  </span>
                </li>
                <li className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Prix total:</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {prixCalcule.montantTotal?.toFixed(2) || '0.00'} €
                  </span>
                </li>
              </ul>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-500">Calcul du prix...</p>
              </div>
            )}
          </div>
          
          {/* Paiement anticipé */}
          {prixCalcule && (
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="paiementAnticipe"
                  checked={paiementAnticipe}
                  onChange={(e) => setPaiementAnticipe(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="paiementAnticipe" className="flex items-center space-x-2 cursor-pointer">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    💳 Effectuer un paiement anticipé
                  </span>
                </label>
              </div>

              {paiementAnticipe && (
                <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <h5 className="font-medium text-green-800 dark:text-green-200">
                      Détails du paiement
                    </h5>
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-800 dark:text-green-200">
                      Mode de paiement
                    </label>
                    <select
                      value={modePaiement}
                      onChange={(e) => setModePaiement(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    >
                      <option value="ESPECES">💵 Espèces</option>
                      <option value="CARTE">💳 Carte</option>
                      <option value="VIREMENT">🏦 Virement</option>
                      <option value="CHEQUE">📄 Chèque</option>
                    </select>
                  </div>

                  {/* Montant à payer */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-800 dark:text-green-200">
                      Montant à payer (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={prixCalcule.montantTotal * 1.5}
                      value={montantPaye}
                      onChange={(e) => setMontantPaye(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-lg font-semibold"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      Montant estimé: {prixCalcule.montantTotal.toFixed(2)} €
                    </p>
                  </div>

                  {/* Marquer comme payée */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="marquerCommePayee"
                      checked={marquerCommePayee}
                      onChange={(e) => setMarquerCommePayee(e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="marquerCommePayee" className="text-sm text-green-800 dark:text-green-200">
                      Marquer la session comme entièrement payée
                    </label>
                  </div>

                  {/* Résumé du paiement */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Montant total:</span>
                        <span className="font-medium">{prixCalcule.montantTotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant payé:</span>
                        <span className="font-medium text-green-600">
                          {parseFloat(montantPaye || 0).toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Reste à payer:</span>
                        <span className={
                          (prixCalcule.montantTotal - parseFloat(montantPaye || 0)) <= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }>
                          {Math.max(0, prixCalcule.montantTotal - parseFloat(montantPaye || 0)).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Bouton de soumission */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 mr-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || calculEnCours || !prixCalcule}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard size={18} className="mr-2" />
                  {paiementAnticipe ? 'Payer et démarrer la session' : 'Démarrer la session'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartSessionModal;

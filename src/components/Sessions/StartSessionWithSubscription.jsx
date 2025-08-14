import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, User, Calendar, DollarSign, Check, AlertCircle, CreditCard, Star } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';
import { sessionService } from '../../services/sessionService';

const StartSessionWithSubscription = ({ 
  poste, 
  onSessionStarted, 
  onCancel,
  show = false 
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  // États du formulaire
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('duration'); // 'duration', 'client', 'subscription', 'payment'
  const [formData, setFormData] = useState({
    dureeMinutes: 60,
    clientId: null,
    abonnementId: null,
    forceUtiliserAbonnement: false,
    paiementAnticipe: false,
    montantPaye: 0,
    modePaiement: 'ESPECES',
    marquerCommePayee: false,
    notes: ''
  });

  // États calculés
  const [coutCalcule, setCoutCalcule] = useState(null);
  const [abonnementsDisponibles, setAbonnementsDisponibles] = useState([]);
  const [abonnementSelectionne, setAbonnementSelectionne] = useState(null);

  const isDarkMode = effectiveTheme === 'dark';

  // Hooks de données
  const { data: clientsData, isLoading: loadingClients } = useClients({
    enabled: show
  });

  const { data: abonnementsData, isLoading: loadingAbonnements } = useAbonnements({
    enabled: show && formData.clientId
  });

  // ✅ ÉTAPE 1: Calcul automatique du coût
  useEffect(() => {
    if (!show || !poste || !formData.dureeMinutes) return;

    const calculateCost = async () => {
      try {
        const response = await sessionService.calculerPrixSession({
          posteId: poste.id,
          dureeMinutes: formData.dureeMinutes,
          abonnementId: formData.abonnementId
        });

        setCoutCalcule(response.data);
      } catch (error) {
        console.error('❌ [START_SESSION] Erreur calcul coût:', error);
        showError('Erreur lors du calcul du coût');
      }
    };

    calculateCost();
  }, [show, poste, formData.dureeMinutes, formData.abonnementId]);

  // ✅ ÉTAPE 2: Filtrer les abonnements actifs du client sélectionné
  useEffect(() => {
    if (!formData.clientId || !abonnementsData) {
      setAbonnementsDisponibles([]);
      setAbonnementSelectionne(null);
      return;
    }

    const abonnementsClient = abonnementsData.filter(abonnement => 
      abonnement.clientId === formData.clientId && 
      abonnement.statut === 'ACTIF' &&
      abonnement.heuresRestantes > 0
    );

    setAbonnementsDisponibles(abonnementsClient);

    // Auto-sélectionner le premier abonnement si disponible
    if (abonnementsClient.length > 0) {
      const premierAbonnement = abonnementsClient[0];
      setAbonnementSelectionne(premierAbonnement);
      setFormData(prev => ({
        ...prev,
        abonnementId: premierAbonnement.id,
        forceUtiliserAbonnement: true
      }));
    } else {
      setAbonnementSelectionne(null);
      setFormData(prev => ({
        ...prev,
        abonnementId: null,
        forceUtiliserAbonnement: false
      }));
    }
  }, [formData.clientId, abonnementsData]);

  // ✅ Vérifier si l'abonnement peut couvrir la session
  const abonnementPeutCouvrir = useMemo(() => {
    if (!abonnementSelectionne) return false;
    const heuresNecessaires = formData.dureeMinutes / 60;
    return abonnementSelectionne.heuresRestantes >= heuresNecessaires;
  }, [abonnementSelectionne, formData.dureeMinutes]);

  // ✅ Gérer le changement de client
  const handleClientChange = (clientId) => {
    setFormData(prev => ({
      ...prev,
      clientId: clientId === 'none' ? null : parseInt(clientId),
      abonnementId: null,
      forceUtiliserAbonnement: false
    }));
  };

  // ✅ Gérer le changement d'abonnement
  const handleAbonnementChange = (abonnementId) => {
    const abonnement = abonnementsDisponibles.find(a => a.id === parseInt(abonnementId));
    setAbonnementSelectionne(abonnement);
    setFormData(prev => ({
      ...prev,
      abonnementId: abonnement ? abonnement.id : null,
      forceUtiliserAbonnement: Boolean(abonnement)
    }));
  };

  // ✅ Démarrer la session
  const handleStartSession = async () => {
    if (!poste || !formData.dureeMinutes) {
      showError('Données incomplètes pour démarrer la session');
      return;
    }

    setLoading(true);

    try {
      const sessionData = {
        posteId: poste.id,
        dureeMinutes: formData.dureeMinutes,
        clientId: formData.clientId,
        abonnementId: formData.abonnementId,
        forceUtiliserAbonnement: formData.forceUtiliserAbonnement,
        paiementAnticipe: formData.paiementAnticipe,
        montantPaye: formData.montantPaye,
        modePaiement: formData.modePaiement,
        marquerCommePayee: formData.marquerCommePayee,
        notes: formData.notes
      };

      console.log('🚀 [START_SESSION] Données envoyées:', sessionData);

      const response = await sessionService.demarrerSession(sessionData);

      if (response.success) {
        showSuccess(
          formData.abonnementId 
            ? `Session démarrée avec abonnement sur ${poste.nom}` 
            : `Session démarrée sur ${poste.nom}`
        );

        // Rafraîchir les données
        queryClient.invalidateQueries(['sessions']);
        queryClient.invalidateQueries(['postes']);
        queryClient.invalidateQueries(['abonnements']);

        onSessionStarted?.(response.data, poste);
      } else {
        showError(response.message || 'Erreur lors du démarrage de la session');
      }
    } catch (error) {
      console.error('❌ [START_SESSION] Erreur:', error);
      showError(error.response?.data?.message || 'Erreur lors du démarrage de la session');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`
        w-full max-w-2xl rounded-xl shadow-2xl
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        max-h-[90vh] overflow-y-auto
      `}>
        {/* Header */}
        <div className={`
          p-6 border-b
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Clock className="text-blue-500" />
            Démarrer une Session - {poste?.nom}
          </h2>
          <p className="text-sm opacity-75 mt-1">
            {poste?.typePoste?.nom} • Tarif: {poste?.typePoste?.tarifHoraireBase || 0} MAD/h
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* ÉTAPE 1: Durée */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Durée de la session
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[30, 60, 120].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => setFormData(prev => ({ ...prev, dureeMinutes: minutes }))}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${formData.dureeMinutes === minutes
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                    }
                    ${isDarkMode && formData.dureeMinutes !== minutes ? 'border-gray-600 hover:border-blue-400' : ''}
                  `}
                >
                  <div className="text-center">
                    <div className="font-semibold">{minutes} min</div>
                    <div className="text-sm opacity-75">
                      {minutes === 30 ? '½ heure' : minutes === 60 ? '1 heure' : '2 heures'}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="480"
                value={formData.dureeMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, dureeMinutes: parseInt(e.target.value) }))}
                className={`
                  px-3 py-2 border rounded-lg w-24
                  ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
                `}
              />
              <span className="text-sm opacity-75">minutes (5-480)</span>
            </div>
          </div>

          {/* ÉTAPE 2: Client (optionnel) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-green-500" />
              Client (optionnel)
            </h3>
            
            <select
              value={formData.clientId || 'none'}
              onChange={(e) => handleClientChange(e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-lg
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
              disabled={loadingClients}
            >
              <option value="none">Session sans client spécifique</option>
              {clientsData?.map(client => (
                <option key={client.id} value={client.id}>
                  {client.prenom} {client.nom} {client.numeroClient ? `(${client.numeroClient})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* ÉTAPE 3: Abonnements (si client sélectionné) */}
          {formData.clientId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Abonnements disponibles
              </h3>

              {loadingAbonnements ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm opacity-75">Chargement des abonnements...</p>
                </div>
              ) : abonnementsDisponibles.length > 0 ? (
                <div className="space-y-3">
                  {abonnementsDisponibles.map(abonnement => (
                    <div
                      key={abonnement.id}
                      className={`
                        p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${formData.abonnementId === abonnement.id
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-300'
                        }
                        ${isDarkMode && formData.abonnementId !== abonnement.id ? 'border-gray-600 hover:border-yellow-400' : ''}
                      `}
                      onClick={() => handleAbonnementChange(abonnement.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{abonnement.typeAbonnement?.nom}</div>
                          <div className="text-sm opacity-75">
                            {abonnement.heuresRestantes}h restantes sur {abonnement.nombreHeuresAchetees}h
                          </div>
                          <div className="text-xs opacity-60">
                            Expire le {new Date(abonnement.dateExpiration).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {abonnementPeutCouvrir ? (
                            <span className="text-green-600 text-sm flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Compatible
                            </span>
                          ) : (
                            <span className="text-orange-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              Heures insuffisantes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.forceUtiliserAbonnement}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          forceUtiliserAbonnement: e.target.checked 
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm">
                        Utiliser cet abonnement (consommera {(formData.dureeMinutes / 60).toFixed(1)}h)
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 opacity-75">
                  <Star className="w-8 h-8 mx-auto opacity-50 mb-2" />
                  <p>Aucun abonnement actif trouvé pour ce client</p>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 4: Paiement */}
          {!formData.forceUtiliserAbonnement && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-500" />
                Options de paiement
              </h3>

              {coutCalcule && (
                <div className={`
                  p-4 rounded-lg
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
                `}>
                  <div className="flex justify-between items-center">
                    <span>Coût estimé:</span>
                    <span className="text-xl font-bold text-green-600">
                      {coutCalcule.montantTotal} MAD
                    </span>
                  </div>
                  <div className="text-sm opacity-75 mt-1">
                    {coutCalcule.details}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.paiementAnticipe}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paiementAnticipe: e.target.checked,
                      montantPaye: e.target.checked ? coutCalcule?.montantTotal || 0 : 0,
                      marquerCommePayee: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span>Paiement anticipé (payer maintenant)</span>
                </label>

                {formData.paiementAnticipe && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mode de paiement</label>
                      <select
                        value={formData.modePaiement}
                        onChange={(e) => setFormData(prev => ({ ...prev, modePaiement: e.target.value }))}
                        className={`
                          w-full px-3 py-2 border rounded-lg
                          ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
                        `}
                      >
                        <option value="ESPECES">Espèces</option>
                        <option value="CARTE">Carte</option>
                        <option value="VIREMENT">Virement</option>
                        <option value="CHEQUE">Chèque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Montant payé</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.montantPaye}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          montantPaye: parseFloat(e.target.value) || 0 
                        }))}
                        className={`
                          w-full px-3 py-2 border rounded-lg
                          ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
                        `}
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.marquerCommePayee}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          marquerCommePayee: e.target.checked 
                        }))}
                        className="rounded"
                      />
                      <span>Marquer comme entièrement payée</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes (optionnel)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg resize-none
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
              placeholder="Notes sur cette session..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`
          p-6 border-t flex gap-3 justify-end
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <button
            onClick={onCancel}
            disabled={loading}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            Annuler
          </button>
          <button
            onClick={handleStartSession}
            disabled={loading || !formData.dureeMinutes}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Démarrage...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Démarrer la session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartSessionWithSubscription;

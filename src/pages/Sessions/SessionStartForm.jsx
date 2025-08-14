import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Clock, User, Calculator, CreditCard, DollarSign, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { usePayment } from '../../contexts/PaymentContext';
import { useClients } from '../../hooks/useClients';
import { useDemarrerSession } from '../../hooks/useSessions';
import PricingService from '../../services/pricingService';
import Portal from '../../components/Portal/Portal';

const SessionStartForm = ({ 
  open,
  onClose, 
  preselectedPoste,
  onSessionStarted
}) => {
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const { marquerSessionPayee } = usePayment();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ États du formulaire
  const [formData, setFormData] = useState({
    posteId: preselectedPoste?.id || '',
    clientId: '',
    dureeEstimeeMinutes: 60,
    notes: '',
    jeuPrincipal: '',
    paiementAnticipe: false,
    modePaiement: 'ESPECES',
    montantPaye: '',
    marquerCommePayee: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prixCalcule, setPrixCalcule] = useState(null);
  const [calculEnCours, setCalculEnCours] = useState(false);

  // ✅ Hooks
  const { data: clientsData, isLoading: isLoadingClients } = useClients();
  const demarrerSessionMutation = useDemarrerSession();

  // ✅ Traitement des données clients
  const clients = useMemo(() => {
    if (!clientsData) return [];
    return Array.isArray(clientsData) ? clientsData : clientsData.clients || [];
  }, [clientsData]);

  // ✅ Calcul du prix via l'API
  const calculerPrix = async () => {
    if (!formData.posteId || !formData.dureeEstimeeMinutes) return;

    try {
      setCalculEnCours(true);
      console.log('💰 [SESSION_START_FORM] Calcul prix via API:', {
        posteId: formData.posteId,
        dureeMinutes: formData.dureeEstimeeMinutes
      });

      const result = await PricingService.calculerPrixEstime(
        parseInt(formData.posteId),
        parseInt(formData.dureeEstimeeMinutes)
      );

      console.log('✅ [SESSION_START_FORM] Prix calculé par API:', result);

      if (result && result.data) {
        setPrixCalcule(result.data);
        
        // Mettre à jour le montant payé pour le paiement anticipé
        if (formData.paiementAnticipe) {
          setFormData(prev => ({
            ...prev,
            montantPaye: result.data.montantTotal.toString()
          }));
        }
      } else {
        console.error('❌ [SESSION_START_FORM] Format de réponse invalide:', result);
        setPrixCalcule(null);
      }
    } catch (error) {
      console.error('❌ [SESSION_START_FORM] Erreur calcul prix:', error);
      setPrixCalcule(null);
      showError('Erreur lors du calcul du prix');
    } finally {
      setCalculEnCours(false);
    }
  };

  // ✅ Initialisation du formulaire
  useEffect(() => {
    if (open && preselectedPoste) {
      setFormData(prev => ({
        ...prev,
        posteId: preselectedPoste.id
      }));
      setPrixCalcule(null);
    }
  }, [open, preselectedPoste]);

  // ✅ Calcul automatique du prix UNIQUEMENT quand poste ou durée change
  useEffect(() => {
    if (formData.posteId && formData.dureeEstimeeMinutes > 0) {
      const timeoutId = setTimeout(() => {
        calculerPrix();
      }, 500); // Délai pour éviter trop d'appels API

      return () => clearTimeout(timeoutId);
    } else {
      setPrixCalcule(null);
    }
  }, [formData.posteId, formData.dureeEstimeeMinutes]); // ✅ CORRECTION: Retirer calculerPrix des dépendances

  // ✅ Mise à jour automatique du montant payé pour le paiement anticipé
  useEffect(() => {
    if (formData.paiementAnticipe && prixCalcule) {
      setFormData(prev => ({
        ...prev,
        montantPaye: prixCalcule.montantTotal.toString()
      }));
    } else if (!formData.paiementAnticipe) {
      setFormData(prev => ({
        ...prev,
        montantPaye: '',
        marquerCommePayee: false
      }));
    }
  }, [formData.paiementAnticipe, prixCalcule]);

  // ✅ Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.posteId) {
      showError('Veuillez sélectionner un poste');
      return;
    }

    if (!formData.dureeEstimeeMinutes || formData.dureeEstimeeMinutes <= 0) {
      showError('Veuillez saisir une durée valide');
      return;
    }

    if (!prixCalcule) {
      showError('Impossible de calculer le prix. Veuillez réessayer.');
      return;
    }

    // Validation du paiement anticipé
    if (formData.paiementAnticipe) {
      const montantPaye = parseFloat(formData.montantPaye || 0);
      if (montantPaye <= 0) {
        showError('Veuillez saisir un montant payé valide');
        return;
      }
      if (montantPaye > prixCalcule.montantTotal * 1.5) {
        showError('Le montant payé semble trop élevé');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const sessionData = {
        posteId: parseInt(formData.posteId),
        dureeMinutes: parseInt(formData.dureeEstimeeMinutes),
        clientId: formData.clientId || null,
        notes: formData.notes,
        jeuPrincipal: formData.jeuPrincipal,
        // ✅ Paramètres de paiement anticipé
        paiementAnticipe: formData.paiementAnticipe,
        montantPaye: formData.paiementAnticipe ? parseFloat(formData.montantPaye || 0) : 0,
        marquerCommePayee: formData.paiementAnticipe && formData.marquerCommePayee,
        modePaiement: formData.paiementAnticipe ? formData.modePaiement : null,
      };

      console.log('📤 [SESSION_START_FORM] Envoi données:', sessionData);
      console.log('💰 [SESSION_START_FORM] Prix calculé:', prixCalcule);

      const result = await demarrerSessionMutation.mutateAsync(sessionData);
      
      // ✅ Si paiement anticipé, marquer la session comme payée dans le contexte
      if (formData.paiementAnticipe && result) {
        // Essayer différentes structures de réponse possibles
        const sessionId = result.sessionId || result.data?.sessionId || result.data?.id || result.id;
        
        if (sessionId) {
          console.log('💳 [SESSION_START_FORM] Marquage paiement anticipé session:', sessionId);
          marquerSessionPayee(sessionId, {
            montantPaye: parseFloat(formData.montantPaye),
            modePaiement: formData.modePaiement,
            marquerCommePayee: formData.marquerCommePayee
          });
        } else {
          console.warn('⚠️ [SESSION_START_FORM] Impossible de récupérer ID session:', result);
        }
      }
      
      showSuccess('Session démarrée avec succès');
      if (onSessionStarted) onSessionStarted(sessionData, preselectedPoste);
      onClose();
      
    } catch (error) {
      console.error('❌ [SESSION_START_FORM] Erreur démarrage:', error);
      showError(`Erreur lors du démarrage: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Helpers de style
  const getInputClass = () => `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  if (!open || !preselectedPoste) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🚀 Démarrer une session
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {preselectedPoste.nom} - {preselectedPoste.typePoste?.nom}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Colonne gauche - Paramètres de session */}
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ⚙️ Paramètres de session
                </h3>

                {/* Durée */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Clock className="w-4 h-4 inline mr-2" />
                    Durée estimée (minutes) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="720"
                    step="15"
                    value={formData.dureeEstimeeMinutes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      dureeEstimeeMinutes: parseInt(e.target.value) || 60 
                    }))}
                    className={getInputClass()}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Entre 15 minutes et 12 heures (par tranches de 15min)
                  </p>
                </div>

                {/* Client */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-4 h-4 inline mr-2" />
                    Client (optionnel)
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                    className={getInputClass()}
                    disabled={isLoadingClients}
                  >
                    <option value="">-- Session libre --</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.prenom} {client.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jeu principal */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    🎮 Jeu principal (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.jeuPrincipal}
                    onChange={(e) => setFormData(prev => ({ ...prev, jeuPrincipal: e.target.value }))}
                    placeholder="Ex: Fortnite, FIFA 24..."
                    className={getInputClass()}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    📝 Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Notes sur la session..."
                    className={getInputClass()}
                  />
                </div>
              </div>

              {/* Colonne droite - Prix et paiement */}
              <div className="space-y-6">
                
                {/* Affichage du prix calculé */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    💰 Estimation du coût
                  </h3>
                  
                  {calculEnCours ? (
                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-3 text-gray-500">Calcul en cours...</span>
                    </div>
                  ) : prixCalcule ? (
                    <div className={`p-4 rounded-lg border-2 ${
                      isDarkMode ? 'border-green-500 bg-green-900/20' : 'border-green-300 bg-green-50'
                    }`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <Calculator className="w-5 h-5 text-green-600" />
                        <span className={`text-xs px-2 py-1 rounded bg-green-200 text-green-800`}>
                          📋 Plan tarifaire
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                            Durée: {Math.floor(formData.dureeEstimeeMinutes / 60)}h {formData.dureeEstimeeMinutes % 60}min
                          </span>
                          <span className="font-medium text-green-600">
                            {prixCalcule.planUtilise?.nom || 'Plan tarifaire'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between font-bold text-xl border-t pt-2">
                          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                            Total estimé:
                          </span>
                          <span className="text-green-600">
                            {prixCalcule.montantTotal.toFixed(2)} MAD
                          </span>
                        </div>
                        
                        {prixCalcule.details && (
                          <p className="text-sm text-gray-500 mt-2">
                            {prixCalcule.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        {formData.dureeEstimeeMinutes ? 'Calcul du prix...' : 'Saisissez une durée pour voir le prix'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Paiement anticipé */}
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="paiementAnticipe"
                      checked={formData.paiementAnticipe}
                      onChange={(e) => setFormData(prev => ({ ...prev, paiementAnticipe: e.target.checked }))}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="paiementAnticipe" className="flex items-center space-x-2 cursor-pointer">
                      <CreditCard className="w-5 h-5 text-green-500" />
                      <span className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        💳 Effectuer un paiement anticipé
                      </span>
                    </label>
                  </div>

                  {formData.paiementAnticipe && prixCalcule && (
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
                          value={formData.modePaiement}
                          onChange={(e) => setFormData(prev => ({ ...prev, modePaiement: e.target.value }))}
                          className={`${getInputClass()} text-sm`}
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
                          Montant à payer (MAD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={prixCalcule.montantTotal * 1.5}
                          value={formData.montantPaye}
                          onChange={(e) => setFormData(prev => ({ ...prev, montantPaye: e.target.value }))}
                          className={`${getInputClass()} text-lg font-semibold`}
                        />
                        <p className="text-xs text-green-600 mt-1">
                          Montant estimé: {prixCalcule.montantTotal.toFixed(2)} MAD
                        </p>
                      </div>

                      {/* Marquer comme payée */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="marquerCommePayee"
                          checked={formData.marquerCommePayee}
                          onChange={(e) => setFormData(prev => ({ ...prev, marquerCommePayee: e.target.checked }))}
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
                            <span className="font-medium">{prixCalcule.montantTotal.toFixed(2)} MAD</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Montant payé:</span>
                            <span className="font-medium text-green-600">
                              {parseFloat(formData.montantPaye || 0).toFixed(2)} MAD
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-1">
                            <span>Reste à payer:</span>
                            <span className={
                              (prixCalcule.montantTotal - parseFloat(formData.montantPaye || 0)) <= 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }>
                              {Math.max(0, prixCalcule.montantTotal - parseFloat(formData.montantPaye || 0)).toFixed(2)} MAD
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-6 py-2 border rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !prixCalcule || calculEnCours}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Démarrage...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Démarrer la session</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export default SessionStartForm;

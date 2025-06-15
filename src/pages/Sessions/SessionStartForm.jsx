import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, User, CreditCard, Play, Calculator, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useClients } from '../../hooks/useClients';
import { useStartSession } from '../../hooks/useSessions';
import Portal from '../../components/Portal/Portal';

const SessionStartForm = ({ 
  open, 
  onClose, 
  preselectedPoste, // ✅ CORRECTION: Poste pré-sélectionné depuis la card
  onSessionStarted // ✅ Callback pour notifier le parent
}) => {
  const [formData, setFormData] = useState({
    posteId: '', // ✅ Sera rempli automatiquement
    clientId: '',
    dureeEstimeeMinutes: 60,
    typeSession: 'STANDARD',
    jeuPrincipal: '',
    notes: '',
    // ✅ Gestion du paiement anticipé
    paiementAnticipe: false,
    modePaiement: 'ESPECES',
    montantPaye: '',
    marquerCommePayee: false
  });
  
  const [validation, setValidation] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState(0);

  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ CORRECTION: Hooks simplifiés
  const { data: clientsData = {}, isLoading: loadingClients } = useClients({
    includeInactive: false,
    limit: 100
  });
  const startSessionMutation = useStartSession();

  // ✅ CORRECTION: Extraction sécurisée des clients
  const clients = clientsData?.data?.clients || clientsData?.clients || clientsData?.data || [];

  // ✅ CORRECTION: Calcul automatique du coût en temps réel
  const calculateCost = useCallback(() => {
    if (preselectedPoste?.typePoste?.tarifHoraireBase && formData.dureeEstimeeMinutes) {
      const tarifHoraire = preselectedPoste.typePoste.tarifHoraireBase;
      const cost = (tarifHoraire / 60) * formData.dureeEstimeeMinutes;
      setCalculatedCost(cost);
      
      // ✅ Auto-remplissage du montant si paiement anticipé
      if (formData.paiementAnticipe && !formData.montantPaye) {
        setFormData(prev => ({ ...prev, montantPaye: cost.toFixed(2) }));
      }
    }
  }, [preselectedPoste, formData.dureeEstimeeMinutes, formData.paiementAnticipe, formData.montantPaye]);

  // ✅ CORRECTION: Initialisation avec poste pré-sélectionné
  useEffect(() => {
    if (open && preselectedPoste) {
      console.log('🎯 [SESSION_FORM] Initialisation avec poste:', preselectedPoste);
      
      setFormData({
        posteId: preselectedPoste.id.toString(), // ✅ Poste automatiquement sélectionné
        clientId: '',
        dureeEstimeeMinutes: 60,
        typeSession: 'STANDARD',
        jeuPrincipal: '',
        notes: '',
        paiementAnticipe: false,
        modePaiement: 'ESPECES',
        montantPaye: '',
        marquerCommePayee: false
      });
      
      setValidation({});
      setCalculatedCost(0);
    }
  }, [open, preselectedPoste]);

  // ✅ Calcul du coût à chaque changement
  useEffect(() => {
    calculateCost();
  }, [calculateCost]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validation[field]) {
      setValidation(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // ✅ Le poste est déjà pré-sélectionné, pas besoin de validation
    if (!preselectedPoste) {
      errors.poste = 'Erreur: Aucun poste sélectionné';
    }

    if (!formData.dureeEstimeeMinutes || formData.dureeEstimeeMinutes < 15) {
      errors.dureeEstimeeMinutes = 'La durée doit être d\'au moins 15 minutes';
    }

    if (formData.paiementAnticipe) {
      if (!formData.modePaiement) {
        errors.modePaiement = 'Veuillez sélectionner un mode de paiement';
      }
      if (!formData.montantPaye || parseFloat(formData.montantPaye) <= 0) {
        errors.montantPaye = 'Veuillez saisir un montant valide';
      }
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!preselectedPoste) {
      showError('Veuillez sélectionner un poste');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ✅ CORRECTION: S'assurer que dureeMinutes est bien transmis
      const sessionData = {
        posteId: preselectedPoste.id,
        dureeMinutes: parseInt(formData.dureeEstimeeMinutes), // ✅ CORRECTION: Convertir en entier
        clientId: formData.clientId ? parseInt(formData.clientId) : null,
        abonnementId: null,
        notes: formData.notes?.trim() || null,
        jeuPrincipal: formData.jeuPrincipal?.trim() || null,
        // ✅ Données de paiement
        paiementAnticipe: formData.paiementAnticipe,
        modePaiement: formData.paiementAnticipe ? formData.modePaiement : null,
        montantPaye: formData.paiementAnticipe ? parseFloat(formData.montantPaye) : null,
        marquerCommePayee: formData.paiementAnticipe && formData.marquerCommePayee
      };

      // ✅ DEBUG: Log pour vérifier les données envoyées
      console.log('📤 [SESSION_START_FORM] Données envoyées:', sessionData);
      console.log('⏰ [SESSION_START_FORM] Durée spécifiée:', formData.dureeEstimeeMinutes, 'minutes');

      const result = await startSessionMutation.mutateAsync(sessionData);
      
      showSuccess(
        formData.paiementAnticipe 
          ? `Session démarrée avec paiement sur ${preselectedPoste.nom}`
          : `Session démarrée sur ${preselectedPoste.nom}`
      );
      
      // ✅ Notifier le parent du succès
      if (onSessionStarted) {
        onSessionStarted(result, preselectedPoste);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ [SESSION_FORM] Erreur démarrage:', error);
      showError(error.message || 'Erreur lors du démarrage de la session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    overlay: 'fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4',
    modal: `max-w-2xl w-full rounded-xl shadow-2xl ${
      isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`,
    input: `w-full px-3 py-2 border rounded-lg transition-colors ${
      isDarkMode 
        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`,
    label: `block text-sm font-medium mb-2 ${
      isDarkMode ? 'text-gray-300' : 'text-gray-700'
    }`,
    error: 'text-red-500 text-sm mt-1'
  };

  if (!open || !preselectedPoste) return null;

  return (
    <Portal>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          {/* ✅ En-tête avec info du poste */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Play className="w-6 h-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold">Démarrer une Session</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Monitor className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {preselectedPoste.nom} - {preselectedPoste.typePoste?.nom}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ✅ Information du poste (lecture seule) */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    {preselectedPoste.nom}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Type: {preselectedPoste.typePoste?.nom} • 
                    Tarif: {preselectedPoste.typePoste?.tarifHoraireBase || 0} DH/h
                  </p>
                </div>
              </div>
            </div>

            {/* Client et durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Client (optionnel)</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleChange('clientId', e.target.value)}
                  className={styles.input}
                  disabled={loadingClients}
                >
                  <option value="">-- Session anonyme --</option>
                  {Array.isArray(clients) && clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.prenom} {client.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.label}>
                  Durée estimée (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={formData.dureeEstimeeMinutes}
                  onChange={(e) => handleChange('dureeEstimeeMinutes', parseInt(e.target.value) || 0)}
                  className={styles.input}
                />
                {validation.dureeEstimeeMinutes && (
                  <p className={styles.error}>{validation.dureeEstimeeMinutes}</p>
                )}
              </div>
            </div>

            {/* Type de session et coût */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Type de session</label>
                <select
                  value={formData.typeSession}
                  onChange={(e) => handleChange('typeSession', e.target.value)}
                  className={styles.input}
                >
                  <option value="STANDARD">Standard</option>
                  <option value="VIP">VIP</option>
                  <option value="TOURNOI">Tournoi</option>
                  <option value="FORMATION">Formation</option>
                </select>
              </div>

              <div>
                <label className={styles.label}>Coût estimé</label>
                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {calculatedCost.toFixed(2)} DH
                  </span>
                </div>
              </div>
            </div>

            {/* Jeu principal */}
            <div>
              <label className={styles.label}>Jeu principal (optionnel)</label>
              <input
                type="text"
                value={formData.jeuPrincipal}
                onChange={(e) => handleChange('jeuPrincipal', e.target.value)}
                className={styles.input}
                placeholder="ex: FIFA 24, Fortnite, Call of Duty..."
              />
            </div>

            {/* ✅ Section paiement anticipé */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="paiementAnticipe"
                  checked={formData.paiementAnticipe}
                  onChange={(e) => handleChange('paiementAnticipe', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="paiementAnticipe" className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Paiement anticipé</span>
                </label>
              </div>

              {formData.paiementAnticipe && (
                <div className="ml-7 space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={styles.label}>
                        Mode de paiement <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.modePaiement}
                        onChange={(e) => handleChange('modePaiement', e.target.value)}
                        className={styles.input}
                      >
                        <option value="ESPECES">Espèces</option>
                        <option value="CARTE">Carte bancaire</option>
                        <option value="VIREMENT">Virement</option>
                        <option value="CHEQUE">Chèque</option>
                      </select>
                      {validation.modePaiement && (
                        <p className={styles.error}>{validation.modePaiement}</p>
                      )}
                    </div>

                    <div>
                      <label className={styles.label}>
                        Montant payé (DH) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.montantPaye}
                        onChange={(e) => handleChange('montantPaye', e.target.value)}
                        className={styles.input}
                        placeholder={calculatedCost.toFixed(2)}
                      />
                      {validation.montantPaye && (
                        <p className={styles.error}>{validation.montantPaye}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="marquerCommePayee"
                      checked={formData.marquerCommePayee}
                      onChange={(e) => handleChange('marquerCommePayee', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="marquerCommePayee" className="text-sm text-green-700 dark:text-green-300">
                      Marquer la session comme entièrement payée
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={styles.label}>Notes (optionnel)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={styles.input}
                rows={3}
                placeholder="Notes sur la session, observations particulières..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Démarrage...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Démarrer sur {preselectedPoste.nom}</span>
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
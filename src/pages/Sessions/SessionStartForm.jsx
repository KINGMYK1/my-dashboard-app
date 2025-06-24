import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Clock, CreditCard, Play, Calculator, DollarSign, Tag } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useClients } from '../../hooks/useClients';
import { useCalculerPrixSession } from '../../hooks/useTypePostes';
import Portal from '../../components/Portal/Portal';

const SessionStartForm = ({ 
  open,
  onClose, 
  preselectedPoste,
  onSessionStarted
}) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ États du formulaire avec plans tarifaires
  const [formData, setFormData] = useState({
    posteId: '',
    clientId: '',
    dureeEstimeeMinutes: 60,
    notes: '',
    jeuPrincipal: '',
    planTarifaireId: '', // ✅ NOUVEAU
    paiementAnticipe: false,
    modePaiement: 'ESPECES',
    montantPaye: '',
    marquerCommePayee: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Hook pour les clients
  const { 
    data: clientsData, 
    isLoading: loadingClients 
  } = useClients();

  // ✅ Traitement des données clients
  const clients = useMemo(() => {
    const rawClients = clientsData?.data?.clients || clientsData?.clients || clientsData?.data || [];
    return Array.isArray(rawClients) ? rawClients : [];
  }, [clientsData]);

  // ✅ NOUVEAU: Plans tarifaires disponibles
  const plansTarifaires = useMemo(() => {
    if (!preselectedPoste?.typePoste?.plansTarifaires) return [];
    return preselectedPoste.typePoste.plansTarifaires.filter(plan => plan.estActif);
  }, [preselectedPoste]);

  // ✅ NOUVEAU: Hook pour calculer le prix avec plan
  const { 
    data: prixCalcule, 
    isLoading: calculPrixLoading,
    refetch: recalculerPrix
  } = useCalculerPrixSession(
    preselectedPoste?.typePoste?.id,
    formData.dureeEstimeeMinutes,
    {
      planTarifaireId: formData.planTarifaireId || null,
      enabled: !!preselectedPoste?.typePoste?.id && formData.dureeEstimeeMinutes > 0
    }
  );

  // ✅ AMÉLIORATION: Calcul du coût avec plans tarifaires
  const coutEstime = useMemo(() => {
    if (prixCalcule?.data) {
      return {
        montant: prixCalcule.data.prix,
        details: prixCalcule.data,
        typeTarif: prixCalcule.data.typeTarif || 'HORAIRE'
      };
    }

    // Fallback calcul simple
    if (!preselectedPoste?.typePoste?.tarifHoraireBase || !formData.dureeEstimeeMinutes) {
      return { montant: 0, details: null, typeTarif: 'HORAIRE' };
    }

    const tarifHoraire = preselectedPoste.typePoste.tarifHoraireBase;
    const montant = (formData.dureeEstimeeMinutes / 60) * tarifHoraire;
    
    return {
      montant,
      details: {
        typePoste: preselectedPoste.typePoste.nom,
        tarifHoraire,
        dureeMinutes: formData.dureeEstimeeMinutes
      },
      typeTarif: 'HORAIRE'
    };
  }, [prixCalcule, formData.dureeEstimeeMinutes, preselectedPoste]);

  // ✅ Initialisation du formulaire
  useEffect(() => {
    if (open && preselectedPoste) {
      setFormData({
        posteId: preselectedPoste.id.toString(),
        clientId: '',
        dureeEstimeeMinutes: 60,
        notes: '',
        jeuPrincipal: '',
        planTarifaireId: '',
        paiementAnticipe: false,
        modePaiement: 'ESPECES',
        montantPaye: '',
        marquerCommePayee: false
      });
      setErrors({});
    }
  }, [open, preselectedPoste]);

  // ✅ Recalcul automatique du prix
  useEffect(() => {
    if (preselectedPoste?.typePoste?.id && formData.dureeEstimeeMinutes > 0) {
      const timer = setTimeout(() => {
        recalculerPrix();
      }, 500); // Debounce
      
      return () => clearTimeout(timer);
    }
  }, [formData.dureeEstimeeMinutes, formData.planTarifaireId, recalculerPrix, preselectedPoste]);

  // ✅ Mise à jour du montant si paiement anticipé
  useEffect(() => {
    if (formData.paiementAnticipe && coutEstime.montant > 0 && !formData.montantPaye) {
      setFormData(prev => ({ 
        ...prev, 
        montantPaye: coutEstime.montant.toFixed(2) 
      }));
    }
  }, [formData.paiementAnticipe, coutEstime.montant, formData.montantPaye]);

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.posteId) {
      newErrors.posteId = 'Poste requis';
    }

    if (!formData.dureeEstimeeMinutes || formData.dureeEstimeeMinutes < 15) {
      newErrors.dureeEstimeeMinutes = 'Durée minimum de 15 minutes';
    }

    // ✅ NOUVEAU: Validation plan tarifaire
    if (formData.planTarifaireId) {
      const planSelectionne = plansTarifaires.find(p => p.id === parseInt(formData.planTarifaireId));
      if (planSelectionne) {
        if (formData.dureeEstimeeMinutes < planSelectionne.dureeMinutesMin) {
          newErrors.dureeEstimeeMinutes = `Durée minimum pour ce plan: ${planSelectionne.dureeMinutesMin} minutes`;
        }
        if (planSelectionne.dureeMinutesMax && formData.dureeEstimeeMinutes > planSelectionne.dureeMinutesMax) {
          newErrors.dureeEstimeeMinutes = `Durée maximum pour ce plan: ${planSelectionne.dureeMinutesMax} minutes`;
        }
      }
    }

    if (formData.paiementAnticipe) {
      if (!formData.modePaiement) {
        newErrors.modePaiement = 'Mode de paiement requis';
      }
      if (!formData.montantPaye || parseFloat(formData.montantPaye) <= 0) {
        newErrors.montantPaye = 'Montant invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionData = {
        posteId: parseInt(formData.posteId),
        clientId: formData.clientId ? parseInt(formData.clientId) : null,
        dureeMinutes: parseInt(formData.dureeEstimeeMinutes),
        notes: formData.notes.trim() || null,
        jeuPrincipal: formData.jeuPrincipal.trim() || null,
        planTarifaireId: formData.planTarifaireId ? parseInt(formData.planTarifaireId) : null, // ✅ NOUVEAU
        paiementAnticipe: formData.paiementAnticipe,
        modePaiement: formData.paiementAnticipe ? formData.modePaiement : null,
        montantPaye: formData.paiementAnticipe ? parseFloat(formData.montantPaye) : null,
        marquerCommePayee: formData.paiementAnticipe && formData.marquerCommePayee
      };

      console.log('📤 [SESSION_START_FORM] Données envoyées:', sessionData);

      if (onSessionStarted) {
        await onSessionStarted(sessionData, preselectedPoste);
      }

      onClose();
    } catch (error) {
      console.error('❌ [SESSION_START_FORM] Erreur:', error);
      setErrors({ submit: error.message || 'Erreur lors du démarrage' });
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
        <div className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🚀 Démarrer une Session
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Poste: {preselectedPoste.nom} - {preselectedPoste.typePoste?.nom}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Client (optionnel)
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  className={getInputClass()}
                  disabled={loadingClients}
                >
                  <option value="">-- Session anonyme --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.prenom} {client.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Durée */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Durée estimée (minutes) <span className="text-red-500">*</span>
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
                />
                {errors.dureeEstimeeMinutes && (
                  <p className="mt-1 text-sm text-red-600">{errors.dureeEstimeeMinutes}</p>
                )}
              </div>
            </div>

            {/* ✅ NOUVEAU: Plans tarifaires */}
            {plansTarifaires.length > 0 && (
              <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="w-5 h-5 text-purple-600" />
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Plan tarifaire (optionnel)
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      !formData.planTarifaireId 
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-800' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, planTarifaireId: '' }))}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="planTarifaire"
                        checked={!formData.planTarifaireId}
                        onChange={() => setFormData(prev => ({ ...prev, planTarifaireId: '' }))}
                        className="text-purple-600"
                      />
                      <div>
                        <p className="font-medium text-sm">Tarif horaire</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {preselectedPoste.typePoste?.tarifHoraireBase} {preselectedPoste.typePoste?.devise || 'MAD'}/h
                        </p>
                      </div>
                    </div>
                  </div>

                  {plansTarifaires.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.planTarifaireId === plan.id.toString()
                          ? 'border-purple-500 bg-purple-100 dark:bg-purple-800' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, planTarifaireId: plan.id.toString() }))}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="planTarifaire"
                          checked={formData.planTarifaireId === plan.id.toString()}
                          onChange={() => setFormData(prev => ({ ...prev, planTarifaireId: plan.id.toString() }))}
                          className="text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{plan.nom}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {plan.dureeMinutesMin}-{plan.dureeMinutesMax || '∞'} min
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-green-600">
                                {plan.prix} {preselectedPoste.typePoste?.devise || 'MAD'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {plan.tarifHoraireEquivalent?.toFixed(2) || 'N/A'}/h
                              </p>
                            </div>
                          </div>
                          {plan.estPromo && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                              Promo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jeu principal */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Jeu principal (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.jeuPrincipal}
                  onChange={(e) => setFormData(prev => ({ ...prev, jeuPrincipal: e.target.value }))}
                  placeholder="Ex: Fortnite, FIFA 24, Call of Duty..."
                  className={getInputClass()}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notes (optionnel)
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

            {/* Paiement anticipé */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="paiementAnticipe"
                  checked={formData.paiementAnticipe}
                  onChange={(e) => setFormData(prev => ({ ...prev, paiementAnticipe: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="paiementAnticipe" className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Paiement anticipé
                  </span>
                </label>
              </div>

              {formData.paiementAnticipe && (
                <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Mode de paiement
                      </label>
                      <select
                        value={formData.modePaiement}
                        onChange={(e) => setFormData(prev => ({ ...prev, modePaiement: e.target.value }))}
                        className={getInputClass()}
                      >
                        <option value="ESPECES">Espèces</option>
                        <option value="CARTE">Carte bancaire</option>
                        <option value="VIREMENT">Virement</option>
                        <option value="CHEQUE">Chèque</option>
                      </select>
                      {errors.modePaiement && (
                        <p className="mt-1 text-sm text-red-600">{errors.modePaiement}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Montant ({preselectedPoste.typePoste?.devise || 'MAD'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.montantPaye}
                        onChange={(e) => setFormData(prev => ({ ...prev, montantPaye: e.target.value }))}
                        placeholder={coutEstime.montant.toFixed(2)}
                        className={getInputClass()}
                      />
                      {errors.montantPaye && (
                        <p className="mt-1 text-sm text-red-600">{errors.montantPaye}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="marquerCommePayee"
                      checked={formData.marquerCommePayee}
                      onChange={(e) => setFormData(prev => ({ ...prev, marquerCommePayee: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="marquerCommePayee" className="text-sm text-green-700 dark:text-green-300">
                      Marquer comme entièrement payée
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ AMÉLIORATION: Résumé détaillé */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Résumé de la session
                </h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Durée:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {Math.floor(formData.dureeEstimeeMinutes / 60)}h {formData.dureeEstimeeMinutes % 60}min
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Type de tarif:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {coutEstime.typeTarif === 'FORFAIT' ? 'Plan tarifaire' : 'Tarif horaire'}
                  </span>
                </div>
                
                {calculPrixLoading ? (
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Calcul en cours...</span>
                    <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
                  </div>
                ) : (
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Coût estimé:</span>
                    <span className="text-green-600">
                      {coutEstime.montant.toFixed(2)} {preselectedPoste.typePoste?.devise || 'MAD'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Erreur générale */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || calculPrixLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Démarrage...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
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
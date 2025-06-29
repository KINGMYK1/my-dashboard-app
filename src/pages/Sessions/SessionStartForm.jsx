import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Clock, CreditCard, Play, Calculator, DollarSign, Tag } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useClients } from '../../hooks/useClients';
import { useDemarrerSession } from '../../hooks/useSessions';
import Portal from '../../components/Portal/Portal';

const SessionStartForm = ({ 
  open,
  onClose, 
  preselectedPoste,
  onSessionStarted
}) => {
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ États du formulaire avec plans tarifaires
  const [formData, setFormData] = useState({
    posteId: preselectedPoste?.id || '',
    clientId: '',
    dureeEstimeeMinutes: 60,
    notes: '',
    jeuPrincipal: '',
    planTarifaireId: '', // ✅ Plan tarifaire sélectionné
    paiementAnticipe: false,
    modePaiement: 'ESPECES',
    montantPaye: '',
    marquerCommePayee: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Hooks
  const { data: clientsData, isLoading: isLoadingClients } = useClients();
  const demarrerSessionMutation = useDemarrerSession();

  // ✅ Traitement des données clients
  const clients = useMemo(() => {
    if (!clientsData) return [];
    const rawClients = clientsData.data?.clients || clientsData.clients || clientsData.data || clientsData;
    return Array.isArray(rawClients) ? rawClients : [];
  }, [clientsData]);

  // ✅ Plans tarifaires disponibles pour le poste sélectionné
  const plansDisponibles = useMemo(() => {
    if (!preselectedPoste?.typePoste?.plansTarifaires) return [];
    return preselectedPoste.typePoste.plansTarifaires
      .filter(plan => plan.estActif)
      .sort((a, b) => (a.dureeMinutesMin || 0) - (b.dureeMinutesMin || 0));
  }, [preselectedPoste]);

  // ✅ CALCUL CÔTÉ FRONTEND - Plan optimal automatique
  const planOptimal = useMemo(() => {
    if (!plansDisponibles.length || !formData.dureeEstimeeMinutes) return null;
    
    // Chercher le plan qui correspond exactement à la durée
    const planCorrespondant = plansDisponibles.find(plan => {
      const dureeMin = plan.dureeMinutesMin || 0;
      const dureeMax = plan.dureeMinutesMax || Infinity;
      return formData.dureeEstimeeMinutes >= dureeMin && formData.dureeEstimeeMinutes <= dureeMax;
    });

    // Si aucun plan exact n'est trouvé, prendre le plan le plus proche (plus grand)
    if (!planCorrespondant) {
      const plansSuperieurs = plansDisponibles.filter(plan => {
        const dureeMin = plan.dureeMinutesMin || 0;
        return formData.dureeEstimeeMinutes <= dureeMin;
      });
      
      if (plansSuperieurs.length > 0) {
        // Prendre le plan avec la durée minimum la plus proche
        const planLePlusProche = plansSuperieurs.reduce((prev, current) => {
          const prevDiff = (prev.dureeMinutesMin || 0) - formData.dureeEstimeeMinutes;
          const currentDiff = (current.dureeMinutesMin || 0) - formData.dureeEstimeeMinutes;
          return currentDiff < prevDiff ? current : prev;
        });
        
        console.log('🎯 [CALCUL] Plan le plus proche trouvé:', planLePlusProche.nom);
        return planLePlusProche;
      }
    }

    console.log('🎯 [CALCUL] Recherche plan optimal pour', formData.dureeEstimeeMinutes, 'min');
    console.log('🎯 [CALCUL] Plans disponibles:', plansDisponibles.map(p => ({
      nom: p.nom,
      min: p.dureeMinutesMin,
      max: p.dureeMinutesMax,
      prix: p.prix
    })));
    console.log('🎯 [CALCUL] Plan trouvé:', planCorrespondant);

    return planCorrespondant;
  }, [plansDisponibles, formData.dureeEstimeeMinutes]);

  // ✅ CALCUL CÔTÉ FRONTEND - Prix calculé (CORRIGÉ)
  const prixCalcule = useMemo(() => {
    if (!preselectedPoste || !formData.dureeEstimeeMinutes) return null;

    let montantTotal = 0;
    let details = '';
    let typeCalcul = '';
    let planUtilise = null;

    // Si un plan tarifaire est sélectionné manuellement
    if (formData.planTarifaireId) {
      const planSelectionne = plansDisponibles.find(p => p.id.toString() === formData.planTarifaireId);
      if (planSelectionne) {
        montantTotal = parseFloat(planSelectionne.prix) || 0;
        details = `Plan "${planSelectionne.nom}" pour ${formData.dureeEstimeeMinutes}min`;
        typeCalcul = 'PLAN_TARIFAIRE';
        planUtilise = planSelectionne;
      }
    }
    // Sinon, utiliser le plan optimal automatique
    else if (planOptimal) {
      montantTotal = parseFloat(planOptimal.prix) || 0;
      details = `Plan optimal "${planOptimal.nom}" pour ${formData.dureeEstimeeMinutes}min`;
      typeCalcul = 'PLAN_TARIFAIRE_AUTO';
      planUtilise = planOptimal;
    }
    // ✅ CORRECTION: Toujours utiliser un plan tarifaire, jamais de tarif horaire
    else if (plansDisponibles.length > 0) {
      // Utiliser le plan le plus approprié selon la durée
      const planLePlusApproprié = plansDisponibles.find(p => 
        formData.dureeEstimeeMinutes >= p.dureeMinutesMin && 
        formData.dureeEstimeeMinutes <= (p.dureeMinutesMax || Infinity)
      ) || plansDisponibles[0]; // Plan par défaut si aucun ne correspond
      
      montantTotal = parseFloat(planLePlusApproprié.prix) || 0;
      details = `Plan "${planLePlusApproprié.nom}" pour ${formData.dureeEstimeeMinutes}min`;
      typeCalcul = 'PLAN_TARIFAIRE_AUTO';
      planUtilise = planLePlusApproprié;
    }
    // Si vraiment aucun plan n'est disponible, refuser la session
    else {
      montantTotal = 0;
      details = 'Aucun plan tarifaire disponible pour ce poste';
      typeCalcul = 'ERREUR_PLANS';
      planUtilise = null;
    }

    console.log('💰 [CALCUL] Prix calculé:', {
      montantTotal,
      details,
      typeCalcul,
      planUtilise: planUtilise?.nom
    });

    return {
      montantTotal: parseFloat(montantTotal.toFixed(2)),
      details,
      typeCalcul,
      planUtilise
    };
  }, [preselectedPoste, formData.dureeEstimeeMinutes, formData.planTarifaireId, plansDisponibles, planOptimal]);

  // ✅ Initialisation du formulaire
  useEffect(() => {
    if (open && preselectedPoste) {
      setFormData(prev => ({
        ...prev,
        posteId: preselectedPoste.id.toString(),
        planTarifaireId: '' // Reset du plan sélectionné
      }));
    }
  }, [open, preselectedPoste]);

  // ✅ Mise à jour automatique du montant payé pour le paiement anticipé
  useEffect(() => {
    if (formData.paiementAnticipe && prixCalcule?.montantTotal) {
      setFormData(prev => ({
        ...prev,
        montantPaye: prixCalcule.montantTotal.toString(),
        marquerCommePayee: true // Par défaut, marquer comme payée si paiement anticipé
      }));
    } else if (!formData.paiementAnticipe) {
      setFormData(prev => ({
        ...prev,
        montantPaye: '',
        marquerCommePayee: false
      }));
    }
  }, [formData.paiementAnticipe, prixCalcule?.montantTotal]);

  // ✅ Sélection d'un plan tarifaire
  const handlePlanSelection = (planId) => {
    const plan = plansDisponibles.find(p => p.id === planId);
    if (plan) {
      setFormData(prev => ({
        ...prev,
        planTarifaireId: planId.toString(),
        // Optionnel : ajuster la durée au plan
        // dureeEstimeeMinutes: plan.dureeMinutesMax || plan.dureeMinutesMin || 60
      }));
    } else {
      // Mode tarif horaire libre
      setFormData(prev => ({
        ...prev,
        planTarifaireId: ''
      }));
    }
  };

  // ✅ Soumission du formulaire
 // Dans handleSubmit du SessionStartForm.jsx
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

  if (!prixCalcule || prixCalcule.typeCalcul === 'ERREUR_PLANS') {
    showError('Aucun plan tarifaire disponible pour ce poste');
    return;
  }

  // Validation du paiement anticipé
  if (formData.paiementAnticipe) {
    const montantPaye = parseFloat(formData.montantPaye || 0);
    if (montantPaye <= 0) {
      showError('Veuillez saisir un montant payé valide');
      return;
    }
    if (montantPaye > prixCalcule.montantTotal * 1.5) { // Limite de sécurité
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
      // ✅ CORRECTION: Envoyer le plan utilisé (sélectionné ou optimal)
      planTarifaireId: formData.planTarifaireId ? 
        parseInt(formData.planTarifaireId) : 
        (prixCalcule.planUtilise?.id || null),
      // ✅ CORRECTION: Paramètres de paiement anticipé
      paiementAnticipe: formData.paiementAnticipe,
      montantPaye: formData.paiementAnticipe ? parseFloat(formData.montantPaye || 0) : 0,
      marquerCommePayee: formData.paiementAnticipe && formData.marquerCommePayee,
      modePaiement: formData.paiementAnticipe ? formData.modePaiement : null,
    };

    console.log('📤 [SESSION_START_FORM] Envoi données:', sessionData);
    console.log('💰 [SESSION_START_FORM] Prix calculé:', prixCalcule);

    await demarrerSessionMutation.mutateAsync(sessionData);
    
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

  const getCardClass = (isSelected) => `p-4 border-2 rounded-lg cursor-pointer transition-all ${
    isSelected
      ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30'
      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500'
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
            
            {/* Section Plans Tarifaires */}
            {plansDisponibles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="w-5 h-5 text-purple-600" />
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Choisir un plan tarifaire
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Option tarif libre */}
                  <div 
                    className={getCardClass(!formData.planTarifaireId && !planOptimal)}
                    onClick={() => handlePlanSelection(null)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="radio"
                        name="planTarifaire"
                        checked={!formData.planTarifaireId && !planOptimal}
                        onChange={() => handlePlanSelection(null)}
                        className="text-purple-600"
                      />
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        Libre
                      </span>
                    </div>
                    <h4 className="font-medium">Tarif horaire</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {preselectedPoste.typePoste?.tarifHoraireBase} MAD/heure
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Facturation à la minute
                    </p>
                  </div>

                  {/* Option plan optimal automatique */}
                  {planOptimal && !formData.planTarifaireId && (
                    <div className="p-4 border-2 border-green-500 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                          ✨ Recommandé
                        </span>
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Auto
                        </span>
                      </div>
                      <h4 className="font-medium text-lg">{planOptimal.nom}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-2xl font-bold text-green-600">
                          {planOptimal.prix} MAD
                        </span>
                        <span className="text-sm text-gray-500">
                          {planOptimal.dureeMinutesMin}-{planOptimal.dureeMinutesMax || '∞'} min
                        </span>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Plan optimal pour {formData.dureeEstimeeMinutes} minutes
                      </p>
                    </div>
                  )}

                  {/* Plans tarifaires */}
                  {plansDisponibles.map((plan) => {
                    const isSelected = formData.planTarifaireId === plan.id.toString();
                    const isOptimalPlan = planOptimal?.id === plan.id;
                    
                    return (
                      <div 
                        key={plan.id}
                        className={getCardClass(isSelected)}
                        onClick={() => handlePlanSelection(plan.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="radio"
                            name="planTarifaire"
                            checked={isSelected}
                            onChange={() => handlePlanSelection(plan.id)}
                            className="text-purple-600"
                          />
                          <div className="flex gap-1">
                            {isOptimalPlan && !isSelected && (
                              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                Optimal
                              </span>
                            )}
                            {plan.estPromo && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                                Promo
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-lg">{plan.nom}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-2xl font-bold text-purple-600">
                            {plan.prix} MAD
                          </span>
                          <span className="text-sm text-gray-500">
                            {plan.dureeMinutesMin}-{plan.dureeMinutesMax || '∞'} min
                          </span>
                        </div>
                        
                        {plan.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            {plan.description}
                          </p>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          ≈ {((plan.prix / (plan.dureeMinutesMax || plan.dureeMinutesMin)) * 60).toFixed(2)} MAD/h
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Durée estimée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  required
                />
                {planOptimal && !formData.planTarifaireId && (
                  <p className="text-xs text-green-600 mt-1">
                    ✨ Compatible avec le plan "{planOptimal.nom}"
                  </p>
                )}
              </div>

              {/* Client */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
            </div>

            {/* Affichage du prix calculé */}
            {prixCalcule && (
              <div className={`p-4 rounded-lg border-2 ${
                isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-300 bg-blue-50'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    💰 Estimation du coût
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    prixCalcule.typeCalcul === 'ERREUR_PLANS'
                      ? 'bg-red-200 text-red-800' 
                      : 'bg-green-200 text-green-800'
                  }`}>
                    {prixCalcule.typeCalcul === 'ERREUR_PLANS' ? '❌ Erreur' : '📋 Plan tarifaire'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Durée: {Math.floor(formData.dureeEstimeeMinutes / 60)}h {formData.dureeEstimeeMinutes % 60}min
                    </span>
                    <span className={`font-medium ${
                      prixCalcule.typeCalcul === 'ERREUR_PLANS'
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {prixCalcule.planUtilise?.nom || (prixCalcule.typeCalcul === 'ERREUR_PLANS' ? 'Aucun plan' : 'Plan tarifaire')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-xl border-t pt-2">
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      Total estimé:
                    </span>
                    <span className={prixCalcule.typeCalcul === 'ERREUR_PLANS' ? 'text-red-600' : 'text-green-600'}>
                      {prixCalcule.montantTotal.toFixed(2)} MAD
                    </span>
                  </div>
                  
                  {prixCalcule.details && (
                    <p className="text-sm text-gray-500 mt-2">
                      {prixCalcule.details}
                    </p>
                  )}

                  {/* Indication si calcul optimal */}
                  {prixCalcule.typeCalcul === 'PLAN_TARIFAIRE_AUTO' && (
                    <div className="flex items-center space-x-1 text-sm text-green-600 mt-2">
                      <span>✨</span>
                      <span>Plan optimal sélectionné automatiquement</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Jeu principal et Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Jeu principal (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.jeuPrincipal}
                  onChange={(e) => setFormData(prev => ({ ...prev, jeuPrincipal: e.target.value }))}
                  placeholder="Ex: Fortnite, FIFA 24..."
                  className={getInputClass()}
                />
              </div>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Mode de paiement *
                      </label>
                      <select
                        value={formData.modePaiement}
                        onChange={(e) => setFormData(prev => ({ ...prev, modePaiement: e.target.value }))}
                        className={getInputClass()}
                        required
                      >
                        <option value="ESPECES">💵 Espèces</option>
                        <option value="CARTE">💳 Carte bancaire</option>
                        <option value="VIREMENT">🏦 Virement</option>
                        <option value="CHEQUE">📝 Chèque</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Montant payé (MAD) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={prixCalcule.montantTotal * 1.5} // Limite de sécurité
                        step="0.01"
                        value={formData.montantPaye}
                        onChange={(e) => setFormData(prev => ({ ...prev, montantPaye: e.target.value }))}
                        placeholder={prixCalcule.montantTotal.toFixed(2)}
                        className={getInputClass()}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Montant estimé: {prixCalcule.montantTotal.toFixed(2)} MAD
                      </p>
                    </div>
                  </div>

                  {/* Résumé du paiement */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    <h6 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      📋 Résumé du paiement
                    </h6>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Montant total estimé:</span>
                        <span className="font-medium">{prixCalcule.montantTotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant payé:</span>
                        <span className="font-medium text-green-600">
                          {parseFloat(formData.montantPaye || 0).toFixed(2)} MAD
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-medium">
                        <span>Reste à payer:</span>
                        <span className={
                          (prixCalcule.montantTotal - parseFloat(formData.montantPaye || 0)) <= 0 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }>
                          {Math.max(0, prixCalcule.montantTotal - parseFloat(formData.montantPaye || 0)).toFixed(2)} MAD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="marquerCommePayee"
                      checked={formData.marquerCommePayee}
                      onChange={(e) => setFormData(prev => ({ ...prev, marquerCommePayee: e.target.checked }))}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="marquerCommePayee" className="text-sm text-green-700 dark:text-green-300">
                      ✅ Marquer comme entièrement payée
                      {parseFloat(formData.montantPaye || 0) < prixCalcule.montantTotal && (
                        <span className="text-orange-600 ml-2">
                          (paiement partiel de {((parseFloat(formData.montantPaye || 0) / prixCalcule.montantTotal) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

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
                disabled={isSubmitting || !prixCalcule}
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
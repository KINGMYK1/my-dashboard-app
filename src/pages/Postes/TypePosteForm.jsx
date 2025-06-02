import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Palette, Tag, DollarSign, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateTypePoste, useUpdateTypePoste } from '../../hooks/useTypePostes';
import Portal from '../../components/Portal/Portal';

const TypePosteForm = ({ typePoste, onClose }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();

  const isEdit = !!typePoste;
  const title = isEdit 
    ? (translations.editTypePoste || 'Modifier le type de poste')
    : (translations.addTypePoste || 'Nouveau type de poste');

  const createTypePosteMutation = useCreateTypePoste();
  const updateTypePosteMutation = useUpdateTypePoste();

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    tarifHoraireBase: '',
    icone: '',
    couleur: '#8b5cf6',
    estActif: true,
  });
  const [plansTarifaires, setPlansTarifaires] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => 
    isDarkMode 
      ? (isPrimary ? 'text-white' : 'text-gray-300') 
      : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  
  const getBgColorClass = () => 
    isDarkMode ? 'bg-gray-800' : 'bg-[var(--background-modal-card)]';
  
  const getBorderColorClass = () => 
    isDarkMode ? 'border-gray-700' : 'border-[var(--border-color)]';
  
  const getInputBgClass = () => 
    isDarkMode ? 'bg-gray-700' : 'bg-[var(--background-input)]';
  
  const getInputTextColorClass = () => 
    isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  
  const getButtonBgClass = () => 
    isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  
  const getButtonHoverBgClass = () => 
    isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  
  const getCancelButtonBgClass = () => 
    isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';
  
  const getCancelButtonHoverBgClass = () => 
    isDarkMode ? 'hover:bg-gray-600/50' : 'hover:opacity-80';

  useEffect(() => {
    if (isEdit && typePoste) {
      setFormData({
        nom: typePoste.nom || '',
        description: typePoste.description || '',
        tarifHoraireBase: typePoste.tarifHoraireBase || '',
        icone: typePoste.icone || '',
        couleur: typePoste.couleur || '#8b5cf6',
        estActif: typePoste.estActif !== undefined ? typePoste.estActif : true,
      });
      setPlansTarifaires(typePoste.plansTarifaires || []);
    } else {
      setFormData({
        nom: '',
        description: '',
        tarifHoraireBase: '',
        icone: '',
        couleur: '#8b5cf6',
        estActif: true,
      });
      setPlansTarifaires([]);
    }
    setValidationErrors({});
  }, [isEdit, typePoste]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer les erreurs de validation lors de la saisie
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePlanChange = (index, field, value) => {
    const newPlans = [...plansTarifaires];
    newPlans[index] = {
      ...newPlans[index],
      [field]: value
    };
    setPlansTarifaires(newPlans);
  };

  const addPlan = () => {
    setPlansTarifaires(prev => [
      ...prev,
      {
        nom: '',
        dureeMinutes: '',
        prix: '',
        description: '',
        estActif: true,
        ordre: prev.length
      }
    ]);
  };

  const removePlan = (index) => {
    setPlansTarifaires(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = translations.nameRequired || 'Le nom est requis';
    } else if (formData.nom.trim().length < 2) {
      errors.nom = translations.nameTooShort || 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!formData.tarifHoraireBase || isNaN(formData.tarifHoraireBase) || parseFloat(formData.tarifHoraireBase) <= 0) {
      errors.tarifHoraireBase = translations.hourlyRateInvalid || 'Le tarif horaire doit être un nombre positif';
    }
    
    if (formData.couleur && !/^#[0-9A-F]{6}$/i.test(formData.couleur)) {
      errors.couleur = translations.colorInvalid || 'Le code couleur doit être au format hexadécimal (#000000)';
    }
    
    // Validation des plans tarifaires
    plansTarifaires.forEach((plan, index) => {
      if (plan.dureeMinutes && (isNaN(plan.dureeMinutes) || parseInt(plan.dureeMinutes) <= 0)) {
        errors[`plan_${index}_duree`] = translations.planDurationInvalid || 'La durée doit être supérieure à 0';
      }
      if (plan.prix && (isNaN(plan.prix) || parseFloat(plan.prix) <= 0)) {
        errors[`plan_${index}_prix`] = translations.planPriceInvalid || 'Le prix doit être supérieur à 0';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 [TYPE_POSTE_FORM] Début soumission');
    console.log('📝 [TYPE_POSTE_FORM] FormData avant validation:', formData);
    console.log('📝 [TYPE_POSTE_FORM] Plans tarifaires:', plansTarifaires);
    
    if (!validateForm()) {
      console.log('❌ [TYPE_POSTE_FORM] Validation échouée');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ✅ CORRECTION: Nettoyer et structurer les données correctement
      const cleanFormData = {
        nom: formData.nom?.trim(),
        description: formData.description?.trim() || null,
        tarifHoraireBase: parseFloat(formData.tarifHoraireBase),
        devise: 'DH',
        dureeMinSession: 15,
        intervalleFacturation: 15,
        icone: formData.icone?.trim() || null,
        couleur: formData.couleur || '#8b5cf6',
        ordreAffichage: 999,
        estActif: Boolean(formData.estActif)
      };

      // ✅ Nettoyer les plans tarifaires
      const cleanPlans = plansTarifaires.map((plan, index) => ({
        nom: plan.nom?.trim() || `Plan ${plan.dureeMinutes || index + 1} min`,
        dureeMinutes: parseInt(plan.dureeMinutes) || 60,
        prix: parseFloat(plan.prix) || 0,
        description: plan.description?.trim() || null,
        estActif: Boolean(plan.estActif !== false),
        ordre: index
      })).filter(plan => plan.dureeMinutes > 0 && plan.prix >= 0);

      console.log('📝 [TYPE_POSTE_FORM] Données nettoyées:', cleanFormData);
      console.log('📝 [TYPE_POSTE_FORM] Plans nettoyés:', cleanPlans);

      // ✅ Structure selon ce que le hook attend
      const dataToSubmit = {
        typePosteData: cleanFormData,
        plansTarifaires: cleanPlans
      };

      console.log('📝 [TYPE_POSTE_FORM] Payload final:', dataToSubmit);

      if (isEdit) {
        await updateTypePosteMutation.mutateAsync({
          id: typePoste.id,
          typePosteData: cleanFormData,
          plansTarifaires: cleanPlans
        });
      } else {
        await createTypePosteMutation.mutateAsync(dataToSubmit);
      }
      
      console.log('✅ [TYPE_POSTE_FORM] Soumission réussie');
      onClose();
    } catch (error) {
      console.error('❌ [TYPE_POSTE_FORM] Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
        <div className={`relative ${getBgColorClass()} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${getBorderColorClass()} border`}>
          
          {/* Header */}
          <div className={`flex justify-between items-center p-5 rounded-t-lg ${getBorderColorClass()} border-b`}>
            <h2 className={`text-xl font-semibold ${getTextColorClass(true)}`}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${getCancelButtonBgClass()} ${getCancelButtonHoverBgClass()} ${getTextColorClass(false)} transition-colors`}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="nom" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                  {translations.typePosteName || "Nom du type de poste"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder={translations.typePosteNamePlaceholder || "Nom du type (ex: Gaming Standard, VIP)"}
                    className={`w-full p-3 pl-10 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                    disabled={isSubmitting}
                  />
                  <Tag size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                </div>
                {validationErrors.nom && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.nom}</p>
                )}
              </div>

              <div>
                <label htmlFor="tarifHoraireBase" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                  {translations.hourlyRate || "Tarif horaire de base"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="tarifHoraireBase"
                    name="tarifHoraireBase"
                    value={formData.tarifHoraireBase}
                    onChange={handleChange}
                    placeholder={translations.hourlyRatePlaceholder || "Tarif en DH/heure"}
                    className={`w-full p-3 pl-10 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                    disabled={isSubmitting}
                  />
                  <DollarSign size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                </div>
                {validationErrors.tarifHoraireBase && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.tarifHoraireBase}</p>
                )}
              </div>

              <div>
                <label htmlFor="couleur" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                  {translations.color || "Couleur"}
                </label>
                <div className="relative">
                  <input
                    type="color"
                    id="couleur"
                    name="couleur"
                    value={formData.couleur}
                    onChange={handleChange}
                    className={`w-full h-12 p-1 rounded-md ${getInputBgClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                    disabled={isSubmitting}
                  />
                </div>
                {validationErrors.couleur && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.couleur}</p>
                )}
              </div>
            </div>

            {/* Description et icône */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="description" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                  {translations.description || "Description"}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={translations.descriptionPlaceholder || "Description du type de poste..."}
                  rows={3}
                  className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors resize-vertical`}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="icone" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                  {translations.icon || "Icône"}
                </label>
                <input
                  type="text"
                  id="icone"
                  name="icone"
                  value={formData.icone}
                  onChange={handleChange}
                  placeholder={translations.iconPlaceholder || "URL de l'icône ou emoji"}
                  className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* État actif */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="estActif"
                name="estActif"
                checked={formData.estActif}
                onChange={handleChange}
                className={`mr-3 h-4 w-4 rounded border ${isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]'} ${isDarkMode ? 'bg-gray-700' : 'bg-[var(--background-input)]'} focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} transition-colors`}
                disabled={isSubmitting}
              />
              <label htmlFor="estActif" className={`text-sm font-medium ${getTextColorClass(false)}`}>
                {translations.isActive || "Type de poste actif"}
              </label>
            </div>

            {/* Plans tarifaires */}
            <div className={`border-t ${getBorderColorClass()} pt-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${getTextColorClass(true)}`}>
                  {translations.pricingPlans || "Plans tarifaires"}
                </h3>
                <button
                  type="button"
                  onClick={addPlan}
                  className={`flex items-center space-x-2 px-3 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors`}
                  disabled={isSubmitting}
                >
                  <Plus size={16} />
                  <span>{translations.addPricingPlan || "Ajouter un plan"}</span>
                </button>
              </div>

              <div className="space-y-4">
                {plansTarifaires.map((plan, index) => (
                  <div key={index} className={`p-4 ${getInputBgClass()} rounded-lg ${getBorderColorClass()} border`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${getTextColorClass(false)}`}>
                          {translations.planName || "Nom du plan"}
                        </label>
                        <input
                          type="text"
                          value={plan.nom || ''}
                          onChange={(e) => handlePlanChange(index, 'nom', e.target.value)}
                          placeholder={translations.planNamePlaceholder || "ex: 1 heure, 30 minutes"}
                          className={`w-full p-2 text-sm rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-1 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${getTextColorClass(false)}`}>
                          {translations.planDuration || "Durée (minutes)"}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={plan.dureeMinutes || ''}
                            onChange={(e) => handlePlanChange(index, 'dureeMinutes', e.target.value)}
                            className={`w-full p-2 text-sm rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-1 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                            disabled={isSubmitting}
                          />
                          <Clock size={14} className={`absolute right-2 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                        </div>
                        {validationErrors[`plan_${index}_duree`] && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors[`plan_${index}_duree`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${getTextColorClass(false)}`}>
                          {translations.planPrice || "Prix (DH)"}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={plan.prix || ''}
                            onChange={(e) => handlePlanChange(index, 'prix', e.target.value)}
                            className={`w-full p-2 text-sm rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-1 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                            disabled={isSubmitting}
                          />
                          <DollarSign size={14} className={`absolute right-2 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                        </div>
                        {validationErrors[`plan_${index}_prix`] && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors[`plan_${index}_prix`]}</p>
                        )}
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removePlan(index)}
                          className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={14} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {plansTarifaires.length === 0 && (
                  <p className={`text-center ${getTextColorClass(false)} text-sm py-4`}>
                    {translations.noPricingPlans || "Aucun plan tarifaire. Les prix seront calculés selon le tarif horaire de base."}
                  </p>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className={`flex justify-end space-x-3 pt-6 border-t ${getBorderColorClass()}`}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getCancelButtonBgClass()} ${getCancelButtonHoverBgClass()} ${getTextColorClass(false)}`}
              >
                {translations.cancel || 'Annuler'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-6 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>
                      {isEdit 
                        ? (translations.processingUpdate || 'Modification...') 
                        : (translations.processingCreate || 'Création...')
                      }
                    </span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>
                      {isEdit 
                        ? (translations.update || 'Modifier') 
                        : (translations.create || 'Créer')
                      }
                    </span>
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

export default TypePosteForm;

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, DollarSign, Clock, Tag, Palette, Info, Code } from 'lucide-react';
import Portal from '../../components/Portal/Portal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateTypePoste, useUpdateTypePoste } from '../../hooks/useTypePostes';
import { useNotification } from '../../contexts/NotificationContext';

const TypePosteForm = ({ typePoste, onClose }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();

  const isEdit = !!typePoste;
  const title = isEdit ? translations.editTypePoste : translations.addTypePoste;

  const createTypePosteMutation = useCreateTypePoste();
  const updateTypePosteMutation = useUpdateTypePoste();

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    tarifHoraireBase: '',
    icone: '',
    couleur: '',
    estActif: true,
  });
  const [plansTarifaires, setPlansTarifaires] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBgColorClass = () => isDarkMode ? 'bg-gray-800' : 'bg-[var(--background-card)]';
  const getBorderColorClass = () => isDarkMode ? 'border-gray-700' : 'border-[var(--border-color)]';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700' : 'bg-[var(--background-input)]';
  const getInputTextColorClass = () => isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  const getButtonBgClass = () => isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  const getButtonHoverBgClass = () => isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  const getCancelButtonBgClass = () => isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';
  const getCancelButtonHoverBgClass = () => isDarkMode ? 'hover:bg-gray-600/50' : 'hover:opacity-80';

  useEffect(() => {
    if (isEdit && typePoste) {
      setFormData({
        nom: typePoste.nom || '',
        description: typePoste.description || '',
        tarifHoraireBase: typePoste.tarifHoraireBase || '',
        icone: typePoste.icone || '',
        couleur: typePoste.couleur || '',
        estActif: typePoste.estActif ?? true,
      });
      setPlansTarifaires(typePoste.plansTarifaires ? typePoste.plansTarifaires.filter(p => p.estActif).map(p => ({
        id: p.id,
        dureeMinutes: p.dureeMinutes,
        prix: p.prix
      })) : []);
    } else {
      setFormData({
        nom: '',
        description: '',
        tarifHoraireBase: '',
        icone: '',
        couleur: '',
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
  };

  const handlePlanChange = (index, field, value) => {
    const newPlans = [...plansTarifaires];
    newPlans[index] = { ...newPlans[index], [field]: parseFloat(value) || 0 };
    setPlansTarifaires(newPlans);
  };

  const addPlan = () => {
    setPlansTarifaires(prev => [...prev, { dureeMinutes: '', prix: '' }]);
  };

  const removePlan = (index) => {
    setPlansTarifaires(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom) errors.nom = translations.nameRequired || "Le nom est requis.";
    if (!formData.tarifHoraireBase || isNaN(parseFloat(formData.tarifHoraireBase)) || parseFloat(formData.tarifHoraireBase) <= 0) {
      errors.tarifHoraireBase = translations.hourlyRatePositiveNumber || "Le tarif horaire doit être un nombre positif.";
    }

    plansTarifaires.forEach((plan, index) => {
      if (!plan.dureeMinutes || isNaN(parseFloat(plan.dureeMinutes)) || parseFloat(plan.dureeMinutes) <= 0) {
        errors[`planDuree-${index}`] = translations.durationPositiveNumber || "La durée doit être un nombre positif.";
      }
      if (!plan.prix || isNaN(parseFloat(plan.prix)) || parseFloat(plan.prix) <= 0) {
        errors[`planPrix-${index}`] = translations.pricePositiveNumber || "Le prix doit être un nombre positif.";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showError(translations.formValidationErrors || "Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        tarifHoraireBase: parseFloat(formData.tarifHoraireBase),
      };

      const plansToSubmit = plansTarifaires.map(plan => ({
        dureeMinutes: parseInt(plan.dureeMinutes),
        prix: parseFloat(plan.prix)
      }));

      if (isEdit) {
        await updateTypePosteMutation.mutateAsync({ id: typePoste.id, data: dataToSubmit, plansTarifaires: plansToSubmit });
      } else {
        await createTypePosteMutation.mutateAsync({ data: dataToSubmit, plansTarifaires: plansToSubmit });
      }
      onClose();
    } catch (error) {
      // Erreurs gérées par useNotification dans les hooks de mutation
      console.error("Erreur de soumission du formulaire TypePoste:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
        <div className={`relative ${getBgColorClass()} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${getBorderColorClass()} border`}>
          {/* Header */}
          <div className={`flex justify-between items-center p-5 rounded-t-lg ${getBorderColorClass()} border-b`}>
            <h2 className={`text-xl font-semibold ${getTextColorClass(true)}`}>{title}</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${getCancelButtonBgClass()} ${getCancelButtonHoverBgClass()} ${getTextColorClass(false)}`}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Nom et Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                  {translations.name || "Nom"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                  disabled={isSubmitting}
                />
                {validationErrors.nom && <p className="text-red-500 text-xs mt-1">{validationErrors.nom}</p>}
              </div>
              <div>
                <label htmlFor="description" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                  {translations.description || "Description"}
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Tarif Horaire Base, Icône, Couleur */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tarifHoraireBase" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                  {translations.hourlyRate || "Tarif Horaire Base"} (€/h) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="tarifHoraireBase"
                    name="tarifHoraireBase"
                    value={formData.tarifHoraireBase}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                    disabled={isSubmitting}
                  />
                  <DollarSign size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                </div>
                {validationErrors.tarifHoraireBase && <p className="text-red-500 text-xs mt-1">{validationErrors.tarifHoraireBase}</p>}
              </div>
              <div>
                <label htmlFor="icone" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                  {translations.icon || "Icône (Lucide-React)"} <Info size={14} className="inline-block ml-1 text-gray-400" title="Nom de l'icône Lucide-React, ex: 'Monitor'" />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="icone"
                    name="icone"
                    value={formData.icone}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                    disabled={isSubmitting}
                  />
                  <Code size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                </div>
              </div>
              <div>
                <label htmlFor="couleur" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                  {translations.color || "Couleur (Hex)"} <Info size={14} className="inline-block ml-1 text-gray-400" title="Code couleur Hexadécimal, ex: '#FF0000'" />
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="couleur"
                    name="couleur"
                    value={formData.couleur}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-md cursor-pointer border-none p-0"
                    disabled={isSubmitting}
                    style={{ backgroundColor: formData.couleur || '#ffffff' }}
                  />
                  <input
                    type="text"
                    name="couleur"
                    value={formData.couleur}
                    onChange={handleChange}
                    placeholder="#RRGGBB"
                    className={`flex-grow p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Statut Actif */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="estActif"
                name="estActif"
                checked={formData.estActif}
                onChange={handleChange}
                className={`mr-2 h-4 w-4 rounded border ${isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]'} ${isDarkMode ? 'bg-gray-700' : 'bg-[var(--background-input)]'} focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'}`}
                disabled={isSubmitting}
              />
              <label htmlFor="estActif" className={`text-sm font-medium ${getTextColorClass(false)}`}>
                {translations.isActive || "Est actif"}
              </label>
            </div>

            {/* Plans Tarifaires */}
            <div className="space-y-3 pt-4 border-t border-dashed border-gray-600">
              <h3 className={`text-lg font-semibold ${getTextColorClass(true)} flex items-center`}>
                <DollarSign size={18} className="mr-2" />
                {translations.pricingPlans || "Plans Tarifaires"}
              </h3>
              {plansTarifaires.map((plan, index) => (
                <div key={index} className={`flex flex-col md:flex-row gap-3 p-4 rounded-md ${getInputBgClass()} border ${getBorderColorClass()} items-center`}>
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <div>
                      <label htmlFor={`dureeMinutes-${index}`} className={`block text-xs font-medium mb-1 ${getTextColorClass(false)}`}>
                        {translations.durationMinutes || "Durée (minutes)"} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id={`dureeMinutes-${index}`}
                          value={plan.dureeMinutes}
                          onChange={(e) => handlePlanChange(index, 'dureeMinutes', e.target.value)}
                          min="1"
                          className={`w-full p-2 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                          disabled={isSubmitting}
                        />
                        <Clock size={16} className={`absolute right-2 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                      </div>
                      {validationErrors[`planDuree-${index}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`planDuree-${index}`]}</p>}
                    </div>
                    <div>
                      <label htmlFor={`prix-${index}`} className={`block text-xs font-medium mb-1 ${getTextColorClass(false)}`}>
                        {translations.price || "Prix"} (€) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id={`prix-${index}`}
                          value={plan.prix}
                          onChange={(e) => handlePlanChange(index, 'prix', e.target.value)}
                          step="0.01"
                          min="0"
                          className={`w-full p-2 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                          disabled={isSubmitting}
                        />
                        <Tag size={16} className={`absolute right-2 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                      </div>
                      {validationErrors[`planPrix-${index}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`planPrix-${index}`]}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlan(index)}
                    className={`p-2 rounded-full text-red-400 hover:bg-red-900/30 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                    title={translations.removePlan || "Supprimer le plan"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPlan}
                className={`w-full flex items-center justify-center px-4 py-2 mt-3 rounded-md ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                <Plus size={16} className="mr-2" />
                {translations.addPricingPlan || "Ajouter un plan tarifaire"}
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
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
                className={`flex items-center space-x-2 px-4 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEdit ? (translations.processingUpdate || 'Modification...') : (translations.processingCreate || 'Création...')}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isEdit ? (translations.update || 'Modifier') : (translations.create || 'Créer')}</span>
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

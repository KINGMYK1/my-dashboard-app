import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Palette, Tag, DollarSign, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateTypePoste, useUpdateTypePoste } from '../../hooks/useTypePostes';
import Portal from '../../components/Portal/Portal';
import GamingIcon, { GamingIconSelector } from '../../components/GamingIcon/GamingIcon';
import GamingIconService from '../../services/gamingIconService';

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
  const [showIconSelector, setShowIconSelector] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Suggestions d'icônes basées sur le nom
  const suggestedIcons = GamingIconService.getSuggestedIcons(formData.nom);

  // ✅ Styles compacts et modérés
  const styles = {
    container: `fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4`,
    modal: `relative bg-gradient-to-br ${isDarkMode 
      ? 'from-gray-900 via-gray-800 to-purple-900/10' 
      : 'from-white via-gray-50 to-purple-50/50'
    } rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border ${isDarkMode 
      ? 'border-purple-500/20' 
      : 'border-purple-200'
    }`,
    header: `flex justify-between items-center p-4 rounded-t-xl bg-gradient-to-r ${isDarkMode
      ? 'from-purple-600/10 to-blue-600/10 border-b border-purple-500/20'
      : 'from-purple-50 to-blue-50 border-b border-purple-200'
    }`,
    input: `w-full p-3 rounded-lg transition-all ${isDarkMode 
      ? 'bg-gray-800/50 border-gray-600 text-white focus:border-purple-400' 
      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-400'
    } border focus:ring-2 focus:ring-purple-400/20 outline-none text-sm`,
    button: `px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${isDarkMode 
      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
    } text-sm`,
    cancelButton: `px-4 py-2 rounded-lg font-medium transition-all ${isDarkMode 
      ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300' 
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
    } text-sm`,
    card: `p-4 rounded-lg ${isDarkMode 
      ? 'bg-gray-800/20 border-gray-700/30' 
      : 'bg-white/60 border-gray-200'
    } border`,
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
  };

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
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
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

      const cleanPlans = plansTarifaires.map((plan, index) => ({
        nom: plan.nom?.trim() || `Plan ${plan.dureeMinutes || index + 1} min`,
        dureeMinutes: parseInt(plan.dureeMinutes) || 60,
        prix: parseFloat(plan.prix) || 0,
        description: plan.description?.trim() || null,
        estActif: Boolean(plan.estActif !== false),
        ordre: index
      })).filter(plan => plan.dureeMinutes > 0 && plan.prix >= 0);

      const dataToSubmit = {
        typePosteData: cleanFormData,
        plansTarifaires: cleanPlans
      };

      if (isEdit) {
        await updateTypePosteMutation.mutateAsync({
          id: typePoste.id,
          typePosteData: cleanFormData,
          plansTarifaires: cleanPlans
        });
      } else {
        await createTypePosteMutation.mutateAsync(dataToSubmit);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ [TYPE_POSTE_FORM] Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className={styles.container}>
        <div className={styles.modal}>
          
          {/* ✅ Header compact */}
          <div className={styles.header}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
                  {title}
                </h2>
                <p className={`text-xs ${styles.textSecondary}`}>
                  🎮 Configuration gaming
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${styles.cancelButton} hover:scale-105 transition-transform`}
              disabled={isSubmitting}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form compact */}
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            
            {/* ✅ Section Informations de base - Compact */}
            <div className={styles.card}>
              <div className="flex items-center space-x-2 mb-4">
                <Tag size={16} className="text-purple-400" />
                <h3 className={`text-base font-semibold ${styles.textPrimary}`}>
                  Informations de base
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2">
                  <label htmlFor="nom" className={`block text-sm font-medium mb-2 ${styles.textSecondary}`}>
                    Nom du type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="ex: PlayStation 5, Xbox Zone..."
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                  {validationErrors.nom && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.nom}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tarifHoraireBase" className={`block text-sm font-medium mb-2 ${styles.textSecondary}`}>
                    Tarif/heure <span className="text-red-500">*</span>
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
                      placeholder="25.00"
                      className={`${styles.input} pl-12`}
                      disabled={isSubmitting}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-sm font-medium">
                      DH
                    </div>
                  </div>
                  {validationErrors.tarifHoraireBase && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.tarifHoraireBase}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${styles.textSecondary}`}>
                    Couleur thématique
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      name="couleur"
                      value={formData.couleur}
                      onChange={handleChange}
                      className="w-12 h-10 rounded border cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      name="couleur"
                      value={formData.couleur}
                      onChange={handleChange}
                      placeholder="#8b5cf6"
                      className={`${styles.input} flex-1`}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="description" className={`block text-sm font-medium mb-2 ${styles.textSecondary}`}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez ce type de poste..."
                  rows={2}
                  className={`${styles.input} resize-none`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* ✅ Section Icône - Compact */}
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Palette size={16} className="text-blue-400" />
                  <h3 className={`text-base font-semibold ${styles.textPrimary}`}>
                    Icône Gaming
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconSelector(!showIconSelector)}
                  className={`px-3 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  {showIconSelector ? 'Masquer' : 'Choisir'}
                </button>
              </div>

              {/* Aperçu compact */}
              <div className="flex items-center space-x-3 mb-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <div className="p-2 rounded-lg bg-white/10">
                  {formData.icone ? (
                    <GamingIcon iconKey={formData.icone} size={32} />
                  ) : (
                    <div className={`w-8 h-8 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center ${styles.textSecondary} text-xs`}>
                      ?
                    </div>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${styles.textPrimary}`}>
                    {formData.icone || 'Aucune icône'}
                  </p>
                </div>
              </div>

              {/* Sélecteur compact */}
              {showIconSelector && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white/5">
                  <GamingIconSelector
                    selectedIcon={formData.icone}
                    onSelect={(iconKey) => {
                      setFormData(prev => ({ ...prev, icone: iconKey }));
                      setShowIconSelector(false);
                    }}
                    suggestedIcons={suggestedIcons}
                    compact={true}
                  />
                </div>
              )}
            </div>

            {/* ✅ Section Plans - Compact */}
            <div className={styles.card}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-green-400" />
                  <h3 className={`text-base font-semibold ${styles.textPrimary}`}>
                    Plans ({plansTarifaires.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addPlan}
                  className={`flex items-center space-x-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all text-xs`}
                  disabled={isSubmitting}
                >
                  <Plus size={14} />
                  <span>Ajouter</span>
                </button>
              </div>

              <div className="space-y-3">
                {plansTarifaires.map((plan, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 p-3 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
                    <input
                      type="text"
                      value={plan.nom || ''}
                      onChange={(e) => handlePlanChange(index, 'nom', e.target.value)}
                      placeholder="Nom du plan"
                      className={`${styles.input} text-xs`}
                      disabled={isSubmitting}
                    />
                    
                    <input
                      type="number"
                      min="1"
                      value={plan.dureeMinutes || ''}
                      onChange={(e) => handlePlanChange(index, 'dureeMinutes', e.target.value)}
                      placeholder="Min"
                      className={`${styles.input} text-xs`}
                      disabled={isSubmitting}
                    />
                    
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={plan.prix || ''}
                      onChange={(e) => handlePlanChange(index, 'prix', e.target.value)}
                      placeholder="Prix DH"
                      className={`${styles.input} text-xs`}
                      disabled={isSubmitting}
                    />
                    
                    <button
                      type="button"
                      onClick={() => removePlan(index)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-all"
                      disabled={isSubmitting}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                {plansTarifaires.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <Clock className={`mx-auto mb-2 ${styles.textSecondary}`} size={24} />
                    <p className={`${styles.textSecondary} text-sm`}>
                      Aucun plan - Tarif horaire utilisé
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* État actif compact */}
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <input
                type="checkbox"
                id="estActif"
                name="estActif"
                checked={formData.estActif}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                disabled={isSubmitting}
              />
              <label htmlFor="estActif" className={`text-sm font-medium ${styles.textPrimary}`}>
                Type de poste actif
              </label>
            </div>

            {/* ✅ Boutons compacts */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`${styles.cancelButton} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${styles.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEdit ? 'Modification...' : 'Création...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isEdit ? 'Modifier' : 'Créer'}</span>
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
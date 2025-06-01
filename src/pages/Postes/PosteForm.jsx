import React, { useState, useEffect } from 'react';
import { X, Save, Monitor, Tag, Hash, Wrench, CheckCircle, XCircle } from 'lucide-react';
import Portal from '../../components/Portal/Portal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreatePoste, useUpdatePoste } from '../../hooks/usePostes';
import { useTypesPostes } from '../../hooks/useTypePostes';
import { useNotification } from '../../contexts/NotificationContext';

const PosteForm = ({ poste, onClose }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();

  const isEdit = !!poste;
  const title = isEdit ? translations.editPoste : translations.addPoste;

  const createPosteMutation = useCreatePoste();
  const updatePosteMutation = useUpdatePoste();
  const { data: typesPostes, isLoading: isLoadingTypes, isError: isErrorTypes } = useTypesPostes();

  const [formData, setFormData] = useState({
    nom: '',
    typePosteId: '',
    position: '',
    notesMaintenance: '',
    estActif: true,
    etat: 'Disponible', // Default state
  });
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
    if (isEdit && poste) {
      setFormData({
        nom: poste.nom || '',
        typePosteId: poste.typePosteId || '',
        position: poste.position || '',
        notesMaintenance: poste.notesMaintenance || '',
        estActif: poste.estActif ?? true,
        etat: poste.etat || 'Disponible',
      });
    } else {
      setFormData({
        nom: '',
        typePosteId: '',
        position: '',
        notesMaintenance: '',
        estActif: true,
        etat: 'Disponible',
      });
    }
    setValidationErrors({});
  }, [isEdit, poste]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom) errors.nom = translations.nameRequired || "Le nom est requis.";
    if (!formData.typePosteId) errors.typePosteId = translations.typePosteRequired || "Le type de poste est requis.";
    
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
        typePosteId: parseInt(formData.typePosteId),
      };

      if (isEdit) {
        await updatePosteMutation.mutateAsync({ id: poste.id, posteData: dataToSubmit });
      } else {
        await createPosteMutation.mutateAsync(dataToSubmit);
      }
      onClose();
    } catch (error) {
      // Erreurs gérées par useNotification dans les hooks de mutation
      console.error("Erreur de soumission du formulaire Poste:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTypes) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className={`relative ${getBgColorClass()} rounded-lg shadow-xl max-w-md w-full p-8 text-center ${getBorderColorClass()} border`}>
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className={`ml-3 ${getTextColorClass(false)}`}>{translations.loadingTypesPostes || "Chargement des types de postes..."}</span>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  if (isErrorTypes) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className={`relative ${getBgColorClass()} rounded-lg shadow-xl max-w-md w-full p-8 text-center ${getBorderColorClass()} border`}>
            <div className="flex justify-center items-center text-red-500">
              <XCircle size={24} className="mr-2" />
              <span>{translations.errorLoadingTypesPostes || "Erreur lors du chargement des types de postes."}</span>
            </div>
            <button
              onClick={onClose}
              className={`mt-4 px-4 py-2 rounded-md ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white transition-colors`}
            >
              {translations.close || "Fermer"}
            </button>
          </div>
        </div>
      </Portal>
    );
  }

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
            {/* Nom et Type de Poste */}
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
                <label htmlFor="typePosteId" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                  {translations.typePoste || "Type de Poste"} <span className="text-red-500">*</span>
                </label>
                <select
                  id="typePosteId"
                  name="typePosteId"
                  value={formData.typePosteId}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                  disabled={isSubmitting}
                >
                  <option value="">{translations.selectTypePoste || "Sélectionner un type de poste"}</option>
                  {typesPostes?.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.nom}
                    </option>
                  ))}
                </select>
                {validationErrors.typePosteId && <p className="text-red-500 text-xs mt-1">{validationErrors.typePosteId}</p>}
              </div>
            </div>

            {/* Position et Notes de Maintenance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="position" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                  {translations.position || "Position"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                    disabled={isSubmitting}
                  />
                  <Hash size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                </div>
              </div>
              <div>
                <label htmlFor="notesMaintenance" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                  {translations.maintenanceNotes || "Notes de Maintenance"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="notesMaintenance"
                    name="notesMaintenance"
                    value={formData.notesMaintenance}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
                    disabled={isSubmitting}
                  />
                  <Wrench size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
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

export default PosteForm;

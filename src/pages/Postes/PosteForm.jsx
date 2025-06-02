import React, { useState, useEffect } from 'react';
import { X, Save, Monitor, MapPin, Settings, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreatePoste, useUpdatePoste } from '../../hooks/usePostes';
import { useTypesPostes } from '../../hooks/useTypePostes';
import Portal from '../../components/Portal/Portal';

const PosteForm = ({ poste, onClose }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();

  const isEdit = !!poste;
  const title = isEdit 
    ? (translations.editPoste || 'Modifier le poste')
    : (translations.addPoste || 'Nouveau poste');

  const createPosteMutation = useCreatePoste();
  const updatePosteMutation = useUpdatePoste();
  const { data: typesPostes = [], isLoading: loadingTypes } = useTypesPostes();

  const [formData, setFormData] = useState({
    nom: '',
    typePosteId: '',
    position: '',
    notesMaintenance: '',
    estActif: true,
    etat: 'Disponible'
  });
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
    if (isEdit && poste) {
      setFormData({
        nom: poste.nom || '',
        typePosteId: poste.typePosteId || '',
        position: poste.position || '',
        notesMaintenance: poste.notesMaintenance || '',
        estActif: poste.estActif !== undefined ? poste.estActif : true,
        etat: poste.etat || 'Disponible'
      });
    } else {
      setFormData({
        nom: '',
        typePosteId: '',
        position: '',
        notesMaintenance: '',
        estActif: true,
        etat: 'Disponible'
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
    
    // Effacer les erreurs de validation lors de la saisie
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = translations.nameRequired || 'Le nom est requis';
    } else if (formData.nom.trim().length < 2) {
      errors.nom = translations.nameTooShort || 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!formData.typePosteId) {
      errors.typePosteId = translations.typePosteRequired || 'Le type de poste est requis';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 [POSTE_FORM] Début soumission');
    console.log('📝 [POSTE_FORM] FormData:', formData);
    console.log('📝 [POSTE_FORM] Mode édition:', isEdit);
    
    if (!validateForm()) {
      console.log('❌ [POSTE_FORM] Validation échouée');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ✅ CORRECTION: Nettoyer et structurer les données correctement
      const cleanData = {
        nom: formData.nom?.trim(),
        typePosteId: parseInt(formData.typePosteId),
        position: formData.position?.trim() || null,
        notesMaintenance: formData.notesMaintenance?.trim() || '',
        estActif: Boolean(formData.estActif),
        etat: formData.etat || 'Disponible'
      };

      console.log('📝 [POSTE_FORM] Données nettoyées:', cleanData);

      // ✅ Validation supplémentaire avant envoi
      if (!cleanData.nom) {
        throw new Error('Le nom du poste ne peut pas être vide');
      }
      
      if (isNaN(cleanData.typePosteId) || cleanData.typePosteId <= 0) {
        throw new Error('Le type de poste sélectionné est invalide');
      }

      if (isEdit) {
        console.log('📝 [POSTE_FORM] Mode édition - ID du poste:', poste.id);
        
        // ✅ Structure correcte pour la mise à jour
        await updatePosteMutation.mutateAsync({
          id: poste.id,
          data: cleanData  // ✅ Utiliser 'data' comme clé
        });
      } else {
        console.log('📝 [POSTE_FORM] Mode création');
        await createPosteMutation.mutateAsync(cleanData);
      }
      
      console.log('✅ [POSTE_FORM] Soumission réussie');
      onClose();
    } catch (error) {
      console.error('❌ [POSTE_FORM] Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const etatsOptions = [
    { value: 'Disponible', label: translations.disponible || 'Disponible', color: 'text-green-600' },
    { value: 'Occupé', label: translations.occupe || 'Occupé', color: 'text-red-600' },
    { value: 'Maintenance', label: translations.maintenance || 'En maintenance', color: 'text-orange-600' }
  ];

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
        <div className={`relative ${getBgColorClass()} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${getBorderColorClass()} border`}>
          
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
                  {translations.posteName || "Nom du poste"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder={translations.posteNamePlaceholder || "Nom du poste"}
                    className={`w-full p-3 pl-10 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                    disabled={isSubmitting}
                  />
                  <Monitor size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                </div>
                {validationErrors.nom && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.nom}</p>
                )}
              </div>

              <div>
                <label htmlFor="typePosteId" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                  {translations.typePoste || "Type de poste"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="typePosteId"
                    name="typePosteId"
                    value={formData.typePosteId}
                    onChange={handleChange}
                    className={`w-full p-3 pl-10 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                    disabled={isSubmitting || loadingTypes}
                  >
                    <option value="">
                      {loadingTypes 
                        ? (translations.loading || 'Chargement...') 
                        : (translations.selectTypePoste || 'Sélectionner un type de poste')
                      }
                    </option>
                    {typesPostes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.nom} - {type.tarifHoraireBase} DH/h
                      </option>
                    ))}
                  </select>
                  <Settings size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                </div>
                {validationErrors.typePosteId && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.typePosteId}</p>
                )}
              </div>

              <div>
                <label htmlFor="position" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                  {translations.position || "Position"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder={translations.positionPlaceholder || "Position physique (ex: A1, B2)"}
                    className={`w-full p-3 pl-10 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                    disabled={isSubmitting}
                  />
                  <MapPin size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
                </div>
              </div>
            </div>

            {/* État du poste */}
            {isEdit && (
              <div>
                <label htmlFor="etat" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                  {translations.etatPoste || "État du poste"}
                </label>
                <select
                  id="etat"
                  name="etat"
                  value={formData.etat}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
                  disabled={isSubmitting}
                >
                  {etatsOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes de maintenance */}
            <div>
              <label htmlFor="notesMaintenance" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                {translations.maintenanceNotes || "Notes de maintenance"}
              </label>
              <div className="relative">
                <textarea
                  id="notesMaintenance"
                  name="notesMaintenance"
                  value={formData.notesMaintenance}
                  onChange={handleChange}
                  placeholder={translations.maintenanceNotesPlaceholder || "Notes ou observations..."}
                  rows={3}
                  className={`w-full p-3 pl-10 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors resize-vertical`}
                  disabled={isSubmitting}
                />
                <AlertTriangle size={18} className={`absolute left-3 top-4 ${getTextColorClass(false)}`} />
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
                {translations.isActive || "Poste actif"}
              </label>
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

export default PosteForm;
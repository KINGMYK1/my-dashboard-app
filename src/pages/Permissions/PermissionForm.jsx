import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import permissionService from '../../services/permissionService';

const PermissionForm = ({ permission, onClose, onSuccess, onError }) => {
  const { translations } = useLanguage();
  const isEdit = !!permission;
  const title = isEdit ? 
    (translations.editPermission || "Modifier la permission") : 
    (translations.addPermission || "Ajouter une permission");

  // Permissions critiques qui ne peuvent pas être modifiées
  const criticalPermissions = ['ADMIN', 'ROLES_MANAGE', 'PERMISSIONS_MANAGE', 'USERS_ADMIN'];
  const isCritical = isEdit && permission && criticalPermissions.includes(permission.name);

  // État initial du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // État pour afficher les erreurs de validation
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données de la permission si en mode édition
  useEffect(() => {
    if (isEdit && permission) {
      setFormData({
        name: permission.name || '',
        description: permission.description || ''
      });
    } else {
      // Réinitialiser pour une nouvelle permission
      setFormData({
        name: '',
        description: ''
      });
    }
    setValidationErrors({});
  }, [isEdit, permission]);

  // Gérer les changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = translations.nameRequired || 'Le nom est requis';
    } else if (formData.name.length < 2) {
      errors.name = translations.nameTooShort || 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.description.trim()) {
      errors.description = translations.descriptionRequired || 'La description est requise';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Vérifier si c'est une permission critique
    if (isCritical) {
      onError && onError('Cette permission système ne peut pas être modifiée');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        name: formData.name.trim().toUpperCase(),
        description: formData.description.trim()
      };

      console.log('📝 Données à soumettre:', dataToSubmit);

      let response;
      
      if (isEdit) {
        console.log(`✏️ [PERMISSIONS] Modification de la permission: ${permission.name}`);
        response = await permissionService.updatePermission(permission.id, dataToSubmit);
      } else {
        console.log(`➕ [PERMISSIONS] Création de la permission: ${dataToSubmit.name}`);
        response = await permissionService.createPermission(dataToSubmit);
      }

      if (response.success) {
        const action = isEdit ? 'modifiée' : 'créée';
        onSuccess && onSuccess(`Permission "${dataToSubmit.name}" ${action} avec succès`);
        // Attendre un peu avant de fermer pour montrer le toast
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(response.message || `Erreur lors de la ${isEdit ? 'modification' : 'création'}`);
      }
    } catch (error) {
      console.error(`❌ [PERMISSIONS] Erreur ${isEdit ? 'modification' : 'création'}:`, error);
      
      // Gestion des erreurs de validation côté serveur
      if (error.response?.data?.validationErrors) {
        setValidationErrors(error.response.data.validationErrors);
      } else {
        onError && onError(error.message || `Erreur lors de la ${isEdit ? 'modification' : 'création'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isSubmitting]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-purple-400/20"
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                {isCritical && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Lock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">Permission système protégée</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avertissement pour permissions critiques */}
          {isCritical && (
            <div className="p-3 bg-yellow-600/20 border border-yellow-500/50 rounded-md text-yellow-300">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm">
                  Cette permission système ne peut pas être modifiée pour des raisons de sécurité.
                </span>
              </div>
            </div>
          )}

          {/* Erreur générale */}
          {validationErrors.general && (
            <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-md text-red-300">
              {validationErrors.general}
            </div>
          )}

          {/* Nom de la permission */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
              {translations.permissionName || 'Nom de la permission'} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isCritical || isSubmitting}
              className={`w-full rounded-md border ${
                validationErrors.name ? 'border-red-500' : 'border-gray-600'
              } ${
                isCritical ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-700/50 text-white'
              } py-2 px-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase disabled:cursor-not-allowed`}
              placeholder="EX: USERS_VIEW"
              maxLength={50}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format recommandé: RESOURCE_ACTION (ex: USERS_VIEW, POSTS_MANAGE)
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-300">
              {translations.description || 'Description'} *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isCritical || isSubmitting}
              rows={3}
              className={`w-full rounded-md border ${
                validationErrors.description ? 'border-red-500' : 'border-gray-600'
              } ${
                isCritical ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-700/50 text-white'
              } py-2 px-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed resize-none`}
              placeholder={translations.permissionDescriptionPlaceholder || "Description de la permission..."}
              maxLength={255}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/255 caractères
            </p>
          </div>

          {/* Exemples d'utilisation */}
          {!isEdit && (
            <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-md">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Exemples de permissions :</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• <span className="text-blue-300">USERS_VIEW</span> - Voir les utilisateurs</div>
                <div>• <span className="text-blue-300">POSTS_MANAGE</span> - Gérer les publications</div>
                <div>• <span className="text-blue-300">REPORTS_EXPORT</span> - Exporter les rapports</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translations.cancel || 'Annuler'}
            </button>
            
            {!isCritical && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEdit ? 'Modification...' : 'Création...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isEdit ? (translations.update || 'Modifier') : (translations.create || 'Créer')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionForm;
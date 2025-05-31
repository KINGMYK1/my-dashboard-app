import React, { useState, useEffect } from 'react';
import { X, Save, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import roleService from '../../services/roleService';

const RoleForm = ({ role, permissions, onClose, onSuccess, onError }) => {
  const { translations } = useLanguage();
  const isEdit = !!role;
  const title = isEdit ? 
    (translations.editRole || "Modifier le rôle") : 
    (translations.addRole || "Ajouter un rôle");

  // État initial du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  // État pour afficher les erreurs de validation
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données du rôle si en mode édition
  useEffect(() => {
    if (isEdit && role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions ? role.permissions.map(p => p.id) : []
      });
    } else {
      // Réinitialiser pour un nouveau rôle
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setValidationErrors({});
  }, [isEdit, role]);

  // Gérer les changements dans les champs de texte
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

  // Gérer les changements de permissions (cases à cocher)
  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => {
      const currentIds = prev.permissions || [];
      return {
        ...prev,
        permissions: currentIds.includes(permissionId)
          ? currentIds.filter(id => id !== permissionId)
          : [...currentIds, permissionId]
      };
    });
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = translations?.nameRequired || 'Le nom du rôle est requis';
    } else if (formData.name.length < 3) {
      errors.name = translations?.nameTooShort || 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.description.trim()) {
      errors.description = translations?.descriptionRequired || 'La description est requise';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions
      };

      console.log('📝 Données à soumettre:', dataToSubmit);

      let response;
      
      if (isEdit) {
        console.log(`✏️ [ROLES] Modification du rôle: ${role.name}`);
        response = await roleService.updateRole(role.id, dataToSubmit);
      } else {
        console.log(`➕ [ROLES] Création du rôle: ${dataToSubmit.name}`);
        response = await roleService.createRole(dataToSubmit);
      }

      if (response.success) {
        const action = isEdit ? 'modifié' : 'créé';
        onSuccess && onSuccess(`Rôle "${dataToSubmit.name}" ${action} avec succès`);
        // Attendre un peu avant de fermer pour montrer le toast
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(response.message || `Erreur lors de la ${isEdit ? 'modification' : 'création'}`);
      }
    } catch (error) {
      console.error(`❌ [ROLES] Erreur ${isEdit ? 'modification' : 'création'}:`, error);
      
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

  // Grouper les permissions par catégorie
  const groupedPermissions = React.useMemo(() => {
    if (!permissions || permissions.length === 0) return {};
    
    // Grouper par préfixe (avant le premier '_')
    return permissions.reduce((groups, permission) => {
      const prefix = permission.name.split('_')[0] || 'GENERAL';
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(permission);
      return groups;
    }, {});
  }, [permissions]);

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
        className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-purple-400/20"
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
              <h2 className="text-xl font-semibold text-white">{title}</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Erreur générale */}
          {validationErrors.general && (
            <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-md text-red-300">
              {validationErrors.general}
            </div>
          )}

          {/* Nom du rôle */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
              {translations?.roleName || 'Nom du rôle'} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                validationErrors.name ? 'border-red-500' : 'border-gray-600'
              } bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={translations?.roleNamePlaceholder || "Ex: Manager"}
              disabled={isSubmitting}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-300">
              {translations?.description || 'Description'} *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full rounded-md border ${
                validationErrors.description ? 'border-red-500' : 'border-gray-600'
              } bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={translations?.descriptionPlaceholder || "Description du rôle"}
              disabled={isSubmitting}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
            )}
          </div>
          
          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">
              {translations?.permissions || 'Permissions'}
            </label>
            
            {!permissions || permissions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto border border-gray-600 rounded-md p-4 bg-gray-700/30">
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-semibold mb-3 text-purple-300 border-b border-gray-600 pb-2">
                      {group}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map(permission => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            disabled={isSubmitting}
                            className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-600 focus:ring-purple-500 bg-gray-700"
                          />
                          <label 
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm text-gray-300 cursor-pointer flex-1"
                          >
                            <div className="font-medium">{permission.name}</div>
                            {permission.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {permission.description}
                              </div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {Object.keys(groupedPermissions).length === 0 && (
                  <p className="text-center text-gray-400 py-4">
                    {translations?.noPermissionsAvailable || 'Aucune permission disponible'}
                  </p>
                )}
              </div>
            )}
            
            {/* Compteur de permissions sélectionnées */}
            <div className="mt-2 text-sm text-gray-400">
              {formData.permissions.length} {translations?.permissionsSelected || 'permission(s) sélectionnée(s)'}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={isSubmitting}
            >
              {translations?.cancel || 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-2 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {translations?.processing || "Traitement en cours..."}
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>
                    {isEdit 
                      ? (translations?.update || 'Mettre à jour') 
                      : (translations?.create || 'Créer')}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
import React, { useState, useEffect } from 'react';
import { X, Save, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateRole, useUpdateRole } from '../../hooks/useRoles';
import { useNotification } from '../../contexts/NotificationContext';

const RoleForm = ({ role, permissions, onClose }) => {
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const { effectiveTheme } = useTheme();
  
  const isEdit = !!role;
  const title = isEdit ? 
    (translations.editRole) : 
    (translations.addRole);

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

  // Dynamic styles based on theme
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';
  const getInputTextClass = () => isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  const getInputPlaceholderClass = () => isDarkMode ? 'placeholder-gray-400' : 'placeholder-[var(--text-secondary)]';
  const getInputFocusRingClass = () => isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]';
  const getAccentColorClass = () => isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]';
  const getButtonBgClass = () => isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  const getButtonHoverBgClass = () => isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  const getErrorColorClass = () => isDarkMode ? 'text-red-400' : 'text-[var(--error-color)]';
  const getErrorBgClass = () => isDarkMode ? 'bg-red-600/20' : 'bg-[var(--error-color)]20';
  const getErrorBorderClass = () => isDarkMode ? 'border-red-500/50' : 'border-[var(--error-color)]';
  const getPurpleAccentColorClass = () => isDarkMode ? 'text-purple-300' : 'text-[var(--accent-color-primary)]';
  const getPurpleAccentBgClass = () => isDarkMode ? 'bg-purple-600/20' : 'bg-[var(--accent-color-primary)]20';


  useEffect(() => {
    if (isEdit && role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions ? role.permissions.map(p => p.id) : []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setValidationErrors({});
  }, [isEdit, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = translations?.nameRequired;
    } else if (formData.name.length < 3) {
      errors.name = translations?.nameTooShort;
    }

    if (!formData.description.trim()) {
      errors.description = translations?.descriptionRequired;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

      console.log('📝 Data to submit:', dataToSubmit);

      if (isEdit) {
        console.log(`✏️ [ROLES] Updating role: ${role.name}`);
        await updateRoleMutation.mutateAsync({ id: role.id, roleData: dataToSubmit });
      } else {
        console.log(`➕ [ROLES] Creating role: ${dataToSubmit.name}`);
        await createRoleMutation.mutateAsync(dataToSubmit);
      }
      
      onClose();

    } catch (error) {
      console.error(`❌ [ROLES] Error ${isEdit ? 'updating' : 'creating'} role:`, error);
      if (error.response?.data?.validationErrors) {
        setValidationErrors(error.response.data.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedPermissions = React.useMemo(() => {
    if (!permissions || permissions.length === 0) return {};
    
    return permissions.reduce((groups, permission) => {
      const prefix = permission.name.split('_')[0] || 'GENERAL';
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(permission);
      return groups;
    }, {});
  }, [permissions]);

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
        className={`rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${getBorderColorClass()}`}
        style={{
          background: 'var(--background-modal-card)', // Use new CSS variable
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header */}
        <div className={`p-6 border-b ${getBorderColorClass()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className={`h-6 w-6 ${getAccentColorClass()}`} />
              <h2 className={`text-xl font-semibold ${getTextColorClass(true)}`}>{title}</h2>
            </div>
            <button
              onClick={onClose}
              className={`transition-colors ${getTextColorClass(false)} hover:text-white`}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General error */}
          {validationErrors.general && (
            <div className={`p-3 rounded-md border ${getErrorBgClass()} ${getErrorBorderClass()} ${getErrorColorClass()}`}>
              {validationErrors.general}
            </div>
          )}

          {/* Role name */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
              {translations?.roleName} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 ${getInputBgClass()} ${getInputTextClass()} ${getInputPlaceholderClass()}
                ${validationErrors.name ? getErrorBorderClass() : (isDarkMode ? 'border-gray-500' : getBorderColorClass())} ${getInputFocusRingClass()}`}
              placeholder={translations?.roleNamePlaceholder}
              disabled={isSubmitting}
            />
            {validationErrors.name && (
              <p className={`mt-1 text-sm ${getErrorColorClass()}`}>{validationErrors.name}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
              {translations?.description} *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 ${getInputBgClass()} ${getInputTextClass()} ${getInputPlaceholderClass()}
                ${validationErrors.description ? getErrorBorderClass() : (isDarkMode ? 'border-gray-500' : getBorderColorClass())} ${getInputFocusRingClass()}`}
              placeholder={translations?.descriptionPlaceholder}
              disabled={isSubmitting}
            />
            {validationErrors.description && (
              <p className={`mt-1 text-sm ${getErrorColorClass()}`}>{validationErrors.description}</p>
            )}
          </div>
          
          {/* Permissions */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${getTextColorClass(false)}`}>
              {translations?.permissions}
            </label>
            
            {!permissions || permissions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-purple-600' : 'border-[var(--accent-color-primary)]'}`}></div>
              </div>
            ) : (
              <div className={`max-h-80 overflow-y-auto border ${getBorderColorClass()} rounded-md p-4 ${getInputBgClass()}`}>
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className="mb-6 last:mb-0">
                    <h3 className={`text-sm font-semibold mb-3 border-b pb-2 ${getPurpleAccentColorClass()} ${getBorderColorClass()}`}>
                      {translations.permissionCategories?.[group.toLowerCase()] || group}
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
                            className={`mt-1 h-4 w-4 rounded border ${isDarkMode ? 'border-gray-500' : getBorderColorClass()} ${getInputBgClass()} focus:ring-2 ${getInputFocusRingClass()}`}
                            style={{ 
                              color: isDarkMode ? 'purple' : 'var(--accent-color-primary)', 
                              '--tw-ring-color': isDarkMode ? 'purple' : 'var(--accent-color-primary)' 
                            }}
                          />
                          <label 
                            htmlFor={`permission-${permission.id}`}
                            className={`text-sm cursor-pointer flex-1 ${getTextColorClass(false)}`}
                          >
                            <div className={`font-medium ${getTextColorClass(true)}`}>
                              {translations.permissionNames?.[permission.name] || permission.name}
                            </div>
                            {permission.description && (
                              <div className={`text-xs mt-1 ${getTextColorClass(false)}`}>
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
                  <p className={`text-center py-4 ${getTextColorClass(false)}`}>
                    {translations?.noPermissionsAvailable}
                  </p>
                )}
              </div>
            )}
            
            {/* Selected permissions count */}
            <div className={`mt-2 text-sm ${getTextColorClass(false)}`}>
              {formData.permissions.length} {translations?.permissionsSelected}
            </div>
          </div>
          
          {/* Actions */}
          <div className={`flex justify-end space-x-3 pt-4 border-t ${getBorderColorClass()}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-[var(--background-input)] text-[var(--text-secondary)] hover:opacity-80'}`}
              disabled={isSubmitting}
            >
              {translations?.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 flex items-center space-x-2 transition-colors ${getButtonBgClass()} ${getButtonHoverBgClass()} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ '--tw-ring-color': isDarkMode ? 'purple' : 'var(--accent-color-primary)' }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {translations?.processing}
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>
                    {isEdit 
                      ? translations?.update 
                      : translations?.create}
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

import React, { useState } from 'react';
import { Shield, Plus, Edit3, Trash2, Users, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRoles, useDeleteRole } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import RoleForm from './RoleForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';

const Roles = () => {
  const { hasPermission } = useAuth();
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  
  const { data: roles, isLoading, error } = useRoles();
  const { data: permissions } = usePermissions();
  const deleteRoleMutation = useDeleteRole();

  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    role: null, 
    title: '', 
    message: '' 
  });

  const isDarkMode = effectiveTheme === 'dark';

  console.log('🔍 Debug Roles Component:', { roles, permissions, isLoading, error, isDarkMode });

  const canViewRoles = hasPermission('ROLES_VIEW');
  const canManageRoles = hasPermission('ADMIN') || hasPermission('ROLES_MANAGE');

  const handleCreateRole = () => {
    if (!canManageRoles) {
      return;
    }
    console.log('➕ Création rôle');
    setEditingRole(null);
    setShowRoleForm(true);
  };

  const handleEditRole = (role) => {
    if (!canManageRoles) {
      return;
    }
    console.log('✏️ Édition rôle:', role);
    setEditingRole(role);
    setShowRoleForm(true);
  };

  const handleDeleteRole = (role) => {
    if (!canManageRoles) {
      return;
    }
    console.log('🗑️ Suppression rôle:', role);
    setConfirmDialog({
      show: true,
      role,
      title: translations.deleteRole,
      message: `${translations.deleteRoleConfirmation} "${role.name}" ? ${translations.thisActionCannot}`
    });
  };

  const confirmDeleteRole = () => {
    const { role } = confirmDialog;
    console.log('✅ Confirmation suppression rôle:', role);
    
    deleteRoleMutation.mutate(role.id);
    
    setConfirmDialog({ 
      show: false, 
      role: null, 
      title: '', 
      message: '' 
    });
  };

  const cancelDeleteRole = () => {
    console.log('❌ Suppression annulée');
    setConfirmDialog({ 
      show: false, 
      role: null, 
      title: '', 
      message: '' 
    });
  };

  const closeRoleForm = () => {
    console.log('❌ Fermeture formulaire');
    setShowRoleForm(false);
    setEditingRole(null);
  };

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-400') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-purple-400/20' : 'border-[var(--border-color)]';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';
  const getInputTextClass = () => isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  const getInputPlaceholderClass = () => isDarkMode ? 'placeholder-gray-400' : 'placeholder-[var(--text-secondary)]';
  const getInputFocusRingClass = () => isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]';
  const getAccentColorClass = () => isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]';
  const getButtonBgClass = () => isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  const getButtonHoverBgClass = () => isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  const getPurpleAccentColorClass = () => isDarkMode ? 'text-purple-300' : 'text-[var(--accent-color-primary)]';
  const getPurpleAccentBgClass = () => isDarkMode ? 'bg-purple-600/20' : 'bg-[var(--accent-color-primary)]20';
  const getRedAccentColorClass = () => isDarkMode ? 'text-red-400' : 'text-[var(--error-color)]';
  const getRedAccentBgClass = () => isDarkMode ? 'hover:bg-red-600/20' : 'hover:bg-[var(--error-color)]20';
  const getBlueAccentColorClass = () => isDarkMode ? 'text-blue-400' : 'text-[var(--accent-color-secondary)]';
  const getBlueAccentBgClass = () => isDarkMode ? 'hover:bg-blue-600/20' : 'hover:bg-[var(--accent-color-secondary)]20';


  if (!canViewRoles) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${getTextColorClass(true)}`}>
            {translations.roleManagement}
          </h1>
        </div>
        <div className="text-center py-12">
          <div className={`${getTextColorClass(false)} text-lg mb-4`}>
            Accès refusé
          </div>
          <div className={getTextColorClass(false)}>
            Vous n'avez pas les permissions pour accéder à cette page.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${getTextColorClass(true)}`}>
            {translations.roleManagement}
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-purple-600' : 'border-[var(--accent-color-primary)]'}`}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${getTextColorClass(true)}`}>
            {translations.roleManagement}
          </h1>
        </div>
        <div className="text-center py-12">
          <div className={`${getTextColorClass(false)} text-lg mb-4`}>
            {translations.errorLoadingRoles}
          </div>
          <div className={getTextColorClass(false)}>
            {error.message || translations.unknownError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className={`h-8 w-8 ${getAccentColorClass()}`} />
          <h1 className={`text-3xl font-bold ${getTextColorClass(true)}`}>
            {translations.roleManagement}
          </h1>
        </div>
        
        {canManageRoles && (
          <button
            onClick={handleCreateRole}
            className={`flex items-center space-x-2 px-4 py-2 ${getButtonBgClass()} text-white rounded-lg ${getButtonHoverBgClass()} transition-colors disabled:opacity-50`}
            disabled={showRoleForm}
          >
            <Plus size={16} />
            <span>{translations.addRole}</span>
          </button>
        )}
      </div>

      {/* Liste des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles?.map(role => (
          <div
            key={role.id}
            className={`rounded-lg border ${getBorderColorClass()} p-6`}
            style={{
              background: 'var(--background-card)', // Utilise la variable CSS
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-[var(--accent-color-primary)] to-[var(--accent-color-secondary)]'}`}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${getTextColorClass(true)}`}>{role.name}</h3>
                  <p className={`text-sm ${getTextColorClass(false)}`}>{role.description}</p>
                </div>
              </div>
              
              {canManageRoles && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditRole(role)}
                    className={`p-2 ${getBlueAccentColorClass()} ${getBlueAccentBgClass()} rounded-lg transition-colors`}
                    title={translations.edit}
                    disabled={showRoleForm}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className={`p-2 ${getRedAccentColorClass()} ${getRedAccentBgClass()} rounded-lg transition-colors`}
                    title={translations.delete}
                    disabled={deleteRoleMutation.isLoading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Statistiques du rôle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className={`flex items-center space-x-2 ${getTextColorClass(false)}`}>
                  <Users size={14} />
                  <span>{translations.users}</span>
                </span>
                <span className={`font-medium ${getTextColorClass(true)}`}>
                  {role.userCount || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className={`flex items-center space-x-2 ${getTextColorClass(false)}`}>
                  <Key size={14} />
                  <span>{translations.permissions}</span>
                </span>
                <span className={`font-medium ${getTextColorClass(true)}`}>
                  {role.permissions?.length || 0}
                </span>
              </div>
            </div>

            {/* Aperçu des permissions */}
            {role.permissions && role.permissions.length > 0 && (
              <div className="mt-4">
                <div className={`text-xs mb-2 ${getTextColorClass(false)}`}>
                  {translations.mainPermissions}
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map(permission => (
                    <span
                      key={permission.id}
                      className={`inline-block px-2 py-1 text-xs rounded ${getPurpleAccentBgClass()} ${getPurpleAccentColorClass()}`}
                    >
                      {translations.permissionNames?.[permission.name] || permission.name}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className={`inline-block px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600/20 text-gray-400' : 'bg-[var(--text-secondary)]20 text-[var(--text-secondary)]'}`}>
                      +{role.permissions.length - 3} {translations.others}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message si aucun rôle */}
      {(!roles || roles.length === 0) && (
        <div className="text-center py-12">
          <Shield className={`h-12 w-12 ${getTextColorClass(false)} mx-auto mb-4`} />
          <p className={`${getTextColorClass(false)} text-lg`}>
            {translations.noRolesFound}
          </p>
          <p className={`${getTextColorClass(false)} text-sm`}>
            {translations.startByCreatingRole}
          </p>
        </div>
      )}

      {/* Formulaire de rôle */}
      {showRoleForm && (
        <RoleForm
          role={editingRole}
          permissions={permissions}
          onClose={closeRoleForm}
        />
      )}

      {/* Dialog de confirmation */}
      <ConfirmationDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDeleteRole}
        onCancel={cancelDeleteRole}
        confirmText={translations.delete}
        cancelText={translations.cancel}
        type="danger"
        loading={deleteRoleMutation.isLoading}
      />
    </div>
  );
};

export default Roles;

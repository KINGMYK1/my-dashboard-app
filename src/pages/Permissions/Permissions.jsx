import React, { useState, useMemo } from 'react';
import { Shield, Search, Plus, Edit3, Trash2, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions, useDeletePermission } from '../../hooks/usePermissions';
import PermissionForm from './PermissionForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';

const Permissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    permission: null, 
    title: '', 
    message: '' 
  });

  const { translations } = useLanguage();
  const { hasPermission } = useAuth();
  const { effectiveTheme } = useTheme();
  
  const { data: permissions, isLoading, error } = usePermissions();
  const deletePermissionMutation = useDeletePermission();

  const isDarkMode = effectiveTheme === 'dark';

  const canViewPermissions = hasPermission('PERMISSIONS_VIEW');
  const canManagePermissions = hasPermission('PERMISSIONS_MANAGE') || hasPermission('ADMIN');

  const criticalPermissions = ['ADMIN', 'ROLES_MANAGE', 'PERMISSIONS_MANAGE', 'USERS_ADMIN'];

  console.log('🔍 Debug Permissions Component:', { permissions, isLoading, error, canManagePermissions, isDarkMode });
  
  const filteredPermissions = useMemo(() => {
    if (!Array.isArray(permissions)) return [];
    
    return permissions.filter(permission => 
      (translations.permissionNames?.[permission.name] || permission.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permissions, searchTerm, translations.permissionNames]);

  const groupPermissionsByCategory = (perms) => {
    const permissionGroups = {
      system: [],
      users: [],
      roles: [],
      permissions: [],
      postes: [],
      customers: [],
      sales: [],
      inventory: [],
      finance: [],
      events: [],
      monitoring: [],
      sessions: [],
      typesPostes: [],
      other: []
    };
    
    perms.forEach(permission => {
      const name = permission.name?.toUpperCase() || '';
      
      if (name === 'ADMIN') {
        permissionGroups.system.unshift(permission);
      } else if (name.startsWith('USERS_')) {
        permissionGroups.users.push(permission);
      } else if (name.startsWith('ROLES_')) {
        permissionGroups.roles.push(permission);
      } else if (name.startsWith('PERMISSIONS_')) {
        permissionGroups.permissions.push(permission);
      } else if (name.startsWith('POSTES_')) {
        permissionGroups.postes.push(permission);
      } else if (name.startsWith('CUSTOMERS_')) {
        permissionGroups.customers.push(permission);
      } else if (name.startsWith('SALES_')) {
        permissionGroups.sales.push(permission);
      } else if (name.startsWith('INVENTORY_')) {
        permissionGroups.inventory.push(permission);
      } else if (name.startsWith('FINANCE_')) {
        permissionGroups.finance.push(permission);
      } else if (name.startsWith('EVENTS_')) {
        permissionGroups.events.push(permission);
      } else if (name.startsWith('MONITORING_')) {
        permissionGroups.monitoring.push(permission);
      } else if (name.startsWith('SESSIONS_')) {
        permissionGroups.sessions.push(permission);
      } else if (name.startsWith('TYPES_POSTES_')) {
        permissionGroups.typesPostes.push(permission);
      } else {
        permissionGroups.other.push(permission);
      }
    });
    
    return permissionGroups;
  };

  const groupedPermissions = groupPermissionsByCategory(filteredPermissions);

  const handleCreatePermission = () => {
    if (!canManagePermissions) {
      return;
    }
    console.log('➕ Création permission');
    setEditingPermission(null);
    setShowPermissionForm(true);
  };

  const handleEditPermission = (permission) => {
    if (!canManagePermissions) {
      return;
    }
    if (criticalPermissions.includes(permission.name)) {
      return;
    }
    console.log('✏️ Édition permission:', permission);
    setEditingPermission(permission);
    setShowPermissionForm(true);
  };

  const handleDeletePermission = (permission) => {
    if (!canManagePermissions) {
      return;
    }
    if (criticalPermissions.includes(permission.name)) {
      return;
    }
    console.log('🗑️ Suppression permission:', permission);
    setConfirmDialog({
      show: true,
      permission,
      title: translations.deletePermission,
      message: `${translations.deletePermissionConfirmation} "${translations.permissionNames?.[permission.name] || permission.name}" ? ${translations.thisActionCannot}`
    });
  };

  const confirmDeletePermission = () => {
    const { permission } = confirmDialog;
    console.log('✅ Confirmation suppression permission:', permission);
    
    deletePermissionMutation.mutate(permission.id);
    
    setConfirmDialog({ 
      show: false, 
      permission: null, 
      title: '', 
      message: '' 
    });
  };

  const cancelDeletePermission = () => {
    console.log('❌ Suppression annulée');
    setConfirmDialog({ 
      show: false, 
      permission: null, 
      title: '', 
      message: '' 
    });
  };

  const closePermissionForm = () => {
    console.log('❌ Fermeture formulaire');
    setShowPermissionForm(false);
    setEditingPermission(null);
  };

  const isCriticalPermission = (permissionName) => {
    return criticalPermissions.includes(permissionName);
  };

  const categoryLabels = {
    system: translations.permissionCategories?.system,
    users: translations.permissionCategories?.users,
    roles: translations.permissionCategories?.roles, 
    permissions: translations.permissionCategories?.permissions,
    postes: translations.permissionCategories?.postes,
    customers: translations.permissionCategories?.customers,
    sales: translations.permissionCategories?.sales,
    inventory: translations.permissionCategories?.inventory,
    finance: translations.permissionCategories?.finance,
    events: translations.permissionCategories?.events,
    monitoring: translations.permissionCategories?.monitoring,
    sessions: translations.permissionCategories?.sessions,
    typesPostes: translations.permissionCategories?.typesPostes,
    other: translations.permissionCategories?.other
  };

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-400') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-purple-400/20' : 'border-[var(--border-color)]';
  const getInputBorderClass = () => isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]'; // Added this line
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';
  const getInputTextClass = () => isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  const getInputPlaceholderClass = () => isDarkMode ? 'placeholder-gray-400' : 'placeholder-[var(--text-secondary)]';
  const getInputFocusRingClass = () => isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]';
  const getAccentColorClass = () => isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]';
  const getButtonBgClass = () => isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  const getButtonHoverBgClass = () => isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  const getPurpleAccentColorClass = () => isDarkMode ? 'text-purple-300' : 'text-[var(--accent-color-primary)]';
  const getPurpleAccentBgClass = () => isDarkMode ? 'bg-purple-600/20' : 'bg-[var(--accent-color-primary)]20';
  const getGreenAccentColorClass = () => isDarkMode ? 'text-green-300' : 'text-[var(--success-color)]';
  const getGreenAccentBgClass = () => isDarkMode ? 'bg-green-600/20' : 'bg-[var(--success-color)]20';
  const getRedAccentColorClass = () => isDarkMode ? 'text-red-400' : 'text-[var(--error-color)]';
  const getRedAccentBgClass = () => isDarkMode ? 'hover:bg-red-600/20' : 'hover:bg-[var(--error-color)]20';
  const getBlueAccentColorClass = () => isDarkMode ? 'text-blue-400' : 'text-[var(--accent-color-secondary)]';
  const getBlueAccentBgClass = () => isDarkMode ? 'hover:bg-blue-600/20' : 'hover:bg-[var(--accent-color-secondary)]20';
  const getOrangeAccentColorClass = () => isDarkMode ? 'text-yellow-400' : 'text-[var(--warning-color)]';
  const getOrangeAccentBgClass = () => isDarkMode ? 'bg-yellow-600/20' : 'bg-[var(--warning-color)]20';


  if (!canViewPermissions) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${getTextColorClass(true)}`}>
            {translations.permissionManagement}
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
            {translations.permissionManagement}
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
            {translations.permissionManagement}
          </h1>
        </div>
        <div className="text-center py-12">
          <div className={`${getTextColorClass(false)} text-lg mb-4`}>
            {translations.errorLoadingPermissions}
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
            {translations.permissionManagement}
          </h1>
        </div>
        
        {canManagePermissions && (
          <button
            onClick={handleCreatePermission}
            className={`flex items-center space-x-2 px-4 py-2 ${getButtonBgClass()} text-white rounded-lg ${getButtonHoverBgClass()} transition-colors disabled:opacity-50`}
            disabled={showPermissionForm}
          >
            <Plus size={16} />
            <span>{translations.addPermission}</span>
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <div 
        className={`p-6 rounded-lg border ${getBorderColorClass()}`}
        style={{
          background: 'var(--background-card)', // Utilise la variable CSS
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getTextColorClass(false)}`} size={16} />
          <input
            type="text"
            placeholder={translations.searchPermissions}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 ${getInputBgClass()} border ${getInputBorderClass()} rounded-lg ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
          />
        </div>
      </div>
        
      {/* Affichage des permissions par catégorie */}
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, perms]) => {
          if (perms.length === 0) return null;
          
          const categoryTitle = categoryLabels[category] || category;
          
          return (
            <div 
              key={category}
              className={`rounded-lg border ${getBorderColorClass()}`}
              style={{
                background: 'var(--background-card)', // Utilise la variable CSS
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]'}`}>
                <h2 className={`text-xl font-semibold ${getTextColorClass(true)}`}>
                  {categoryTitle} ({perms.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={getInputBgClass()}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                        {translations.name}
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                        {translations.description}
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                        {translations.status}
                      </th>
                      {canManagePermissions && (
                        <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                          {translations.actions}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/50' : 'divide-[var(--border-color)]'}`}>
                    {perms.map(permission => {
                      const isCritical = isCriticalPermission(permission.name);
                      
                      return (
                        <tr key={permission.id} className={isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-[var(--background-secondary)]'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className={`font-medium ${getTextColorClass(true)}`}>
                                {translations.permissionNames?.[permission.name] || permission.name}
                              </div>
                              {isCritical && (
                                <div className={`flex items-center px-2 py-1 text-xs rounded ${getOrangeAccentBgClass()} ${getOrangeAccentColorClass()}`}>
                                  <Lock className="w-3 h-3 mr-1" />
                                  {translations.system}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm ${getTextColorClass(false)}`}>
                              {permission.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs rounded ${
                              isCritical 
                                ? `${getOrangeAccentBgClass()} ${getOrangeAccentColorClass()}` 
                                : `${getGreenAccentBgClass()} ${getGreenAccentColorClass()}`
                            }`}>
                              {isCritical ? translations.system : translations.modifiable}
                            </span>
                          </td>
                          {canManagePermissions && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditPermission(permission)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isCritical 
                                      ? `${isDarkMode ? 'text-gray-500' : 'text-[var(--text-secondary)]'} cursor-not-allowed` 
                                      : `${getBlueAccentColorClass()} ${getBlueAccentBgClass()}`
                                  }`}
                                  title={isCritical ? translations.permissionSystemNotModifiable : translations.edit}
                                  disabled={showPermissionForm || isCritical}
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeletePermission(permission)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isCritical 
                                      ? `${isDarkMode ? 'text-gray-500' : 'text-[var(--text-secondary)]'} cursor-not-allowed` 
                                      : `${getRedAccentColorClass()} ${getRedAccentBgClass()}`
                                  }`}
                                  title={isCritical ? translations.permissionSystemNotDeletable : translations.delete}
                                  disabled={isCritical || deletePermissionMutation.isLoading}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Message si aucune permission */}
      {filteredPermissions.length === 0 && (
        <div className="text-center py-12">
          <Shield className={`h-12 w-12 ${getTextColorClass(false)} mx-auto mb-4`} />
          <p className={`${getTextColorClass(false)} text-lg`}>
            {searchTerm ? 
              translations.noPermissionsFound :
              translations.noPermissions
            }
          </p>
          {searchTerm && (
            <p className={`${getTextColorClass(false)} text-sm`}>
              {translations.tryModifySearch}
            </p>
          )}
        </div>
      )}
      
      {/* Formulaire de permission */}
      {showPermissionForm && (
        <PermissionForm
          permission={editingPermission}
          onClose={closePermissionForm}
        />
      )}
      
      {/* Dialog de confirmation */}
      <ConfirmationDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDeletePermission}
        onCancel={cancelDeletePermission}
        confirmText={translations.delete}
        cancelText={translations.cancel}
        type="danger"
        loading={deletePermissionMutation.isLoading}
      />
    </div>
  );
};

export default Permissions;

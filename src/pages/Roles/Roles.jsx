import React, { useState } from 'react';
import { Shield, Plus, Edit3, Trash2, Users, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import roleService from '../../services/roleService';
import permissionService from '../../services/permissionService';
import RoleForm from './RoleForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import Toast from '../../components/Toast/Toast';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    role: null, 
    title: '', 
    message: '' 
  });
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { hasPermission } = useAuth();
  const { translations } = useLanguage();

  // ✅ Vérifications des permissions
  const canViewRoles = hasPermission('ROLES_VIEW');
  const canManageRoles = hasPermission('ADMIN') || hasPermission('ROLES_MANAGE');

  React.useEffect(() => {
    if (canViewRoles) {
      loadRoles();
      loadPermissions();
    } else {
      setError('Vous n\'avez pas les permissions pour voir les rôles');
      setLoading(false);
    }
  }, [canViewRoles]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      console.log('📋 [ROLES] Chargement des rôles...');
      
      const response = await roleService.getAllRoles();
      console.log('✅ [ROLES] Rôles reçus:', response);
      
      if (response.success && response.data) {
        setRoles(response.data);
        setError(null);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des rôles');
      }
    } catch (error) {
      console.error('❌ [ROLES] Erreur chargement:', error);
      setError(error.message || 'Erreur lors du chargement des rôles');
      showToast('Erreur lors du chargement des rôles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      console.log('🔑 [PERMISSIONS] Chargement des permissions...');
      
      const response = await permissionService.getAllPermissions();
      console.log('✅ [PERMISSIONS] Permissions reçues:', response);
      
      if (response.success && response.data) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error('❌ [PERMISSIONS] Erreur chargement:', error);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateRole = () => {
    if (!canManageRoles) {
      showToast('Vous n\'avez pas les permissions pour créer des rôles', 'error');
      return;
    }
    
    console.log('➕ Création rôle');
    setEditingRole(null);
    setShowRoleForm(true);
  };

  const handleEditRole = (role) => {
    if (!canManageRoles) {
      showToast('Vous n\'avez pas les permissions pour modifier des rôles', 'error');
      return;
    }

    console.log('✏️ Édition rôle:', role);
    setEditingRole(role);
    setShowRoleForm(true);
  };

  const handleDeleteRole = (role) => {
    if (!canManageRoles) {
      showToast('Vous n\'avez pas les permissions pour supprimer des rôles', 'error');
      return;
    }

    console.log('🗑️ Suppression rôle:', role);
    setConfirmDialog({
      show: true,
      role,
      title: translations.deleteRole || 'Supprimer le rôle',
      message: `${translations.deleteRoleConfirmation || 'Êtes-vous sûr de vouloir supprimer le rôle'} "${role.name}" ? ${translations.thisActionCannot || 'Cette action est irréversible.'}`
    });
  };

  const confirmDeleteRole = async () => {
    const { role } = confirmDialog;
    
    try {
      setIsDeleting(true);
      console.log('✅ Confirmation suppression rôle:', role);
      
      const response = await roleService.deleteRole(role.id);
      
      if (response.success) {
        showToast(`Rôle "${role.name}" supprimé avec succès`, 'success');
        await loadRoles();
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ [ROLES] Erreur suppression:', error);
      showToast(error.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleting(false);
      setConfirmDialog({ 
        show: false, 
        role: null, 
        title: '', 
        message: '' 
      });
    }
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
    // Recharger les rôles après fermeture du formulaire
    loadRoles();
  };

  // Vérification des permissions d'accès
  if (!canViewRoles) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {translations.roleManagement || "Gestion des Rôles"}
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">
            Accès refusé
          </div>
          <div className="text-gray-400">
            Vous n'avez pas les permissions pour accéder à cette page.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {translations.roleManagement || "Gestion des Rôles"}
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {translations.roleManagement || "Gestion des Rôles"}
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">
            {translations.errorLoadingRoles || "Erreur lors du chargement des rôles"}
          </div>
          <div className="text-gray-400">
            {error || translations.unknownError || 'Une erreur est survenue'}
          </div>
          <button
            onClick={loadRoles}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">
            {translations.roleManagement || "Gestion des Rôles"}
          </h1>
        </div>
        
        {canManageRoles && (
          <button
            onClick={handleCreateRole}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={showRoleForm}
          >
            <Plus size={16} />
            <span>{translations.addRole || "Nouveau Rôle"}</span>
          </button>
        )}
      </div>

      {/* Liste des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles?.map(role => (
          <div
            key={role.id}
            className="rounded-lg border border-purple-400/20 p-6"
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                  <p className="text-gray-400 text-sm">{role.description}</p>
                </div>
              </div>
              
              {canManageRoles && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                    title={translations.edit || "Modifier"}
                    disabled={showRoleForm}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                    title={translations.delete || "Supprimer"}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Statistiques du rôle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2 text-gray-400">
                  <Users size={14} />
                  <span>{translations.users || "Utilisateurs"}</span>
                </span>
                <span className="text-white font-medium">
                  {role.userCount || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2 text-gray-400">
                  <Key size={14} />
                  <span>{translations.permissions || "Permissions"}</span>
                </span>
                <span className="text-white font-medium">
                  {role.permissions?.length || 0}
                </span>
              </div>
            </div>

            {/* Aperçu des permissions */}
            {role.permissions && role.permissions.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-2">
                  {translations.mainPermissions || "Principales permissions:"}
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map(permission => (
                    <span
                      key={permission.id}
                      className="inline-block px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded"
                    >
                      {permission.name}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded">
                      +{role.permissions.length - 3} {translations.others || "autres"}
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
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {translations.noRolesFound || "Aucun rôle trouvé"}
          </p>
          <p className="text-gray-500 text-sm">
            {translations.startByCreatingRole || "Commencez par créer un rôle"}
          </p>
        </div>
      )}

      {/* Formulaire de rôle */}
      {showRoleForm && (
        <RoleForm
          role={editingRole}
          permissions={permissions}
          onClose={closeRoleForm}
          onSuccess={(message) => showToast(message, 'success')}
          onError={(message) => showToast(message, 'error')}
        />
      )}

      {/* Dialog de confirmation */}
      <ConfirmationDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDeleteRole}
        onCancel={cancelDeleteRole}
        confirmText={translations.delete || "Supprimer"}
        cancelText={translations.cancel || "Annuler"}
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default Roles;
import React, { useState, useMemo } from 'react';
import { Shield, Search, Plus, Edit3, Trash2, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import permissionService from '../../services/permissionService';
import PermissionForm from './PermissionForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import Toast from '../../components/Toast/Toast';

const Permissions = () => {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    permission: null, 
    title: '', 
    message: '' 
  });
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hooks
  const { translations } = useLanguage();
  const { hasPermission } = useAuth();
  
  const canViewPermissions = hasPermission('PERMISSIONS_VIEW');
  const canManagePermissions = hasPermission('PERMISSIONS_MANAGE') || hasPermission('ADMIN');

  // Permissions critiques qui ne peuvent pas être modifiées/supprimées
  const criticalPermissions = ['ADMIN', 'ROLES_MANAGE', 'PERMISSIONS_MANAGE', 'USERS_ADMIN'];

  React.useEffect(() => {
    if (canViewPermissions) {
      loadPermissions();
    } else {
      setError('Vous n\'avez pas les permissions pour voir les permissions');
      setLoading(false);
    }
  }, [canViewPermissions]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      console.log('🔑 [PERMISSIONS] Chargement des permissions...');
      
      const response = await permissionService.getAllPermissions();
      console.log('✅ [PERMISSIONS] Permissions reçues:', response);
      
      if (response.success && response.data) {
        setPermissions(response.data);
        setError(null);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des permissions');
      }
    } catch (error) {
      console.error('❌ [PERMISSIONS] Erreur chargement:', error);
      setError(error.message || 'Erreur lors du chargement des permissions');
      showToast('Erreur lors du chargement des permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  console.log('🔍 Debug Permissions Component:', { permissions, loading, error, canManagePermissions });
  
  // Filtrage des permissions
  const filteredPermissions = useMemo(() => {
    if (!Array.isArray(permissions)) return [];
    
    return permissions.filter(permission => 
      permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permissions, searchTerm]);

  // Grouper les permissions par catégorie
  const groupPermissionsByCategory = (permissions) => {
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
    
    permissions.forEach(permission => {
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

  // Handlers
  const handleCreatePermission = () => {
    if (!canManagePermissions) {
      showToast('Vous n\'avez pas les permissions pour créer des permissions', 'error');
      return;
    }

    console.log('➕ Création permission');
    setEditingPermission(null);
    setShowPermissionForm(true);
  };

  const handleEditPermission = (permission) => {
    if (!canManagePermissions) {
      showToast('Vous n\'avez pas les permissions pour modifier des permissions', 'error');
      return;
    }

    if (criticalPermissions.includes(permission.name)) {
      showToast('Cette permission système ne peut pas être modifiée', 'warning');
      return;
    }

    console.log('✏️ Édition permission:', permission);
    setEditingPermission(permission);
    setShowPermissionForm(true);
  };

  const handleDeletePermission = (permission) => {
    if (!canManagePermissions) {
      showToast('Vous n\'avez pas les permissions pour supprimer des permissions', 'error');
      return;
    }

    if (criticalPermissions.includes(permission.name)) {
      showToast('Cette permission système ne peut pas être supprimée', 'warning');
      return;
    }

    console.log('🗑️ Suppression permission:', permission);
    setConfirmDialog({
      show: true,
      permission,
      title: translations.deletePermission || 'Supprimer la permission',
      message: `${translations.deletePermissionConfirmation || 'Êtes-vous sûr de vouloir supprimer la permission'} "${permission.name}" ? ${translations.thisActionCannot || 'Cette action est irréversible.'}`
    });
  };

  const confirmDeletePermission = async () => {
    const { permission } = confirmDialog;
    
    try {
      setIsDeleting(true);
      console.log('✅ Confirmation suppression permission:', permission);
      
      const response = await permissionService.deletePermission(permission.id);
      
      if (response.success) {
        showToast(`Permission "${permission.name}" supprimée avec succès`, 'success');
        await loadPermissions();
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ [PERMISSIONS] Erreur suppression:', error);
      showToast(error.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleting(false);
      setConfirmDialog({ 
        show: false, 
        permission: null, 
        title: '', 
        message: '' 
      });
    }
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
    // Recharger les permissions après fermeture du formulaire
    loadPermissions();
  };

  const isCriticalPermission = (permissionName) => {
    return criticalPermissions.includes(permissionName);
  };

  // Catégories avec traductions
  const categoryLabels = {
    system: translations.permissionCategories?.system || 'Système',
    users: translations.permissionCategories?.users || 'Utilisateurs',
    roles: translations.permissionCategories?.roles || 'Rôles', 
    permissions: translations.permissionCategories?.permissions || 'Permissions',
    postes: translations.permissionCategories?.postes || 'Postes Gaming',
    customers: translations.permissionCategories?.customers || 'Clients',
    sales: translations.permissionCategories?.sales || 'Ventes',
    inventory: translations.permissionCategories?.inventory || 'Inventaire',
    finance: translations.permissionCategories?.finance || 'Finances',
    events: translations.permissionCategories?.events || 'Événements',
    monitoring: translations.permissionCategories?.monitoring || 'Monitoring',
    sessions: translations.permissionCategories?.sessions || 'Sessions',
    typesPostes: translations.permissionCategories?.typesPostes || 'Types de Postes',
    other: translations.permissionCategories?.other || 'Autres'
  };

  // Vérification des permissions d'accès
  if (!canViewPermissions) {
    return (
      <div className="space-y-6">
        {/* Toast de notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {translations.permissionManagement || "Gestion des Permissions"}
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

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Toast de notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {translations.permissionManagement || "Gestion des Permissions"}
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="space-y-6">
        {/* Toast de notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {translations.permissionManagement || "Gestion des Permissions"}
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">
            {translations.errorLoadingPermissions || "Erreur lors du chargement des permissions"}
          </div>
          <div className="text-gray-400">
            {error || translations.unknownError || 'Une erreur est survenue'}
          </div>
          <button
            onClick={loadPermissions}
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
      {/* Toast de notification - TOUJOURS EN PREMIER */}
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
            {translations.permissionManagement || "Gestion des Permissions"}
          </h1>
        </div>
        
        {canManagePermissions && (
          <button
            onClick={handleCreatePermission}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={showPermissionForm}
          >
            <Plus size={16} />
            <span>{translations.addPermission || "Nouvelle Permission"}</span>
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <div 
        className="p-6 rounded-lg border border-purple-400/20"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={translations.searchPermissions || "Rechercher des permissions..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="rounded-lg border border-purple-400/20"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="px-6 py-4 border-b border-gray-600">
                <h2 className="text-xl font-semibold text-white">
                  {categoryTitle} ({perms.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {translations.name || 'Nom'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {translations.description || 'Description'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {translations.status || 'Statut'}
                      </th>
                      {canManagePermissions && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {translations.actions || 'Actions'}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {perms.map(permission => {
                      const isCritical = isCriticalPermission(permission.name);
                      
                      return (
                        <tr key={permission.id} className="hover:bg-gray-700/30">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="text-white font-medium">
                                {translations.permissionNames?.[permission.name] || permission.name}
                              </div>
                              {isCritical && (
                                <div className="flex items-center px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Système
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-400 text-sm">
                              {permission.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs rounded ${
                              isCritical 
                                ? 'bg-yellow-600/20 text-yellow-300' 
                                : 'bg-green-600/20 text-green-300'
                            }`}>
                              {isCritical ? 'Système' : 'Modifiable'}
                            </span>
                          </td>
                          {canManagePermissions && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditPermission(permission)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isCritical 
                                      ? 'text-gray-500 cursor-not-allowed' 
                                      : 'text-blue-400 hover:text-blue-300 hover:bg-blue-600/20'
                                  }`}
                                  title={isCritical ? 'Permission système non modifiable' : (translations.edit || "Modifier")}
                                  disabled={showPermissionForm || isCritical}
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeletePermission(permission)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isCritical 
                                      ? 'text-gray-500 cursor-not-allowed' 
                                      : 'text-red-400 hover:text-red-300 hover:bg-red-600/20'
                                  }`}
                                  title={isCritical ? 'Permission système non supprimable' : (translations.delete || "Supprimer")}
                                  disabled={isCritical || isDeleting}
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
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {searchTerm ? 
              (translations.noPermissionsFound || 'Aucune permission trouvée') :
              (translations.noPermissions || 'Aucune permission disponible')
            }
          </p>
          {searchTerm && (
            <p className="text-gray-500 text-sm">
              {translations.tryModifySearch || 'Essayez de modifier votre recherche'}
            </p>
          )}
        </div>
      )}
      
      {/* Formulaire de permission */}
      {showPermissionForm && (
        <PermissionForm
          permission={editingPermission}
          onClose={closePermissionForm}
          onSuccess={(message) => showToast(message, 'success')}
          onError={(message) => showToast(message, 'error')}
        />
      )}
      
      {/* Dialog de confirmation */}
      <ConfirmationDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDeletePermission}
        onCancel={cancelDeletePermission}
        confirmText={translations.delete || "Supprimer"}
        cancelText={translations.cancel || "Annuler"}
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default Permissions;
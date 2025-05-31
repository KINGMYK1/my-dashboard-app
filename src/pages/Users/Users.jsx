import React, { useState } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useUsers, useToggleUserStatus, useDeleteUser, useChangeUserRole } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import UserForm from './UserForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';

const Users = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const { translations } = useLanguage();
  const { data: users, isLoading, error } = useUsers();
  const { data: roles } = useRoles();
  const toggleUserStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();
  const changeUserRole = useChangeUserRole();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    type: '', 
    user: null, 
    title: '', 
    message: '' 
  });
  const [showInactive, setShowInactive] = useState(false);

  console.log('🔍 Debug Users Component:', { users, isLoading, error });

  // Filtrage des utilisateurs
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !selectedRole || user.role?.name === selectedRole;
    const matchesStatus = showInactive || user.isActive;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const handleToggleStatus = (user) => {
    console.log('🔄 Toggle status pour:', user);
    setConfirmDialog({
      show: true,
      type: 'toggleStatus',
      user,
      title: user.isActive ? 
        (translations.deactivateUser || 'Désactiver l\'utilisateur') : 
        (translations.activateUser || 'Activer l\'utilisateur'),
      message: `${translations.confirmToggleStatus || 'Êtes-vous sûr de vouloir'} ${user.isActive ? 
        (translations.deactivate || 'désactiver') : 
        (translations.activate || 'activer')} ${translations.theUser || 'l\'utilisateur'} ${user.firstName} ${user.lastName} ?`
    });
  };

  const handleDelete = (user) => {
    console.log('🗑️ Suppression pour:', user);
    setConfirmDialog({
      show: true,
      type: 'delete',
      user,
      title: translations.deleteUser || 'Supprimer l\'utilisateur',
      message: `${translations.deleteUserConfirmation || 'Êtes-vous sûr de vouloir supprimer définitivement l\'utilisateur'} ${user.firstName} ${user.lastName} ? ${translations.thisActionCannot || 'Cette action est irréversible.'}`
    });
  };

  const handleRoleChange = (user, newRoleId) => {
    console.log('🔄 Changement de rôle:', { user, newRoleId });
    
    // Vérifier que le rôle a vraiment changé
    if (parseInt(newRoleId) === user.roleId) {
      console.log('⚠️ Le rôle n\'a pas changé');
      return;
    }
    
    changeUserRole.mutate({ 
      userId: user.id, 
      roleId: parseInt(newRoleId) 
    });
  };

  const confirmAction = () => {
    const { type, user } = confirmDialog;
    
    console.log('✅ Confirmation action:', { type, user });
    
    switch (type) {
      case 'toggleStatus':
        toggleUserStatus.mutate({ 
          userId: user.id, 
          activate: !user.isActive 
        });
        break;
      case 'delete':
        deleteUser.mutate(user.id);
        break;
      default:
        console.warn('Type d\'action inconnu:', type);
    }
    
    // Fermer le dialogue
    setConfirmDialog({ 
      show: false, 
      type: '', 
      user: null, 
      title: '', 
      message: '' 
    });
  };

  const cancelAction = () => {
    console.log('❌ Action annulée');
    setConfirmDialog({ 
      show: false, 
      type: '', 
      user: null, 
      title: '', 
      message: '' 
    });
  };

  const handleEditUser = (user) => {
    console.log('✏️ Édition utilisateur:', user);
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleCreateUser = () => {
    console.log('➕ Création utilisateur');
    setEditingUser(null);
    setShowUserForm(true);
  };

  const closeUserForm = () => {
    console.log('❌ Fermeture formulaire');
    setShowUserForm(false);
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {translations.userManagement || "Gestion des Utilisateurs"}
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
            {translations.userManagement || "Gestion des Utilisateurs"}
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">
            {translations.errorLoadingUsers || "Erreur lors du chargement des utilisateurs"}
          </div>
          <div className="text-gray-400">
            {error.message || translations.unknownError || 'Une erreur est survenue'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UsersIcon className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">
            {translations.userManagement || "Gestion des Utilisateurs"}
          </h1>
        </div>
        
        {hasPermission('USERS_ADMIN') && (
          <button
            onClick={handleCreateUser}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={showUserForm}
          >
            <UserPlus size={16} />
            <span>{translations.addUser || "Nouvel Utilisateur"}</span>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div 
        className="p-6 rounded-lg border border-purple-400/20"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={translations.searchUsers || "Rechercher un utilisateur..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filtre par rôle */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">{translations.allRoles || "Tous les rôles"}</option>
            {roles?.map(role => (
              <option key={role.id} value={role.name}>
                {translations.roleNames?.[role.name] || role.name}
              </option>
            ))}
          </select>

          {/* Toggle utilisateurs inactifs */}
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showInactive 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700/50 text-gray-300 hover:text-white'
            }`}
          >
            {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{translations.showInactive || "Utilisateurs inactifs"}</span>
          </button>

          {/* Statistiques */}
          <div className="text-gray-300 text-sm">
            <div>{translations.total || "Total"}: {users?.length || 0} {translations.users || "utilisateurs"}</div>
            <div>{translations.active || "Actifs"}: {users?.filter(u => u.isActive).length || 0}</div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div 
        className="rounded-lg border border-purple-400/20 overflow-hidden"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{translations.noUsersFound || "Aucun utilisateur trouvé"}</p>
            <p className="text-gray-500 text-sm">
              {searchTerm || selectedRole ? 
                (translations.tryModifyFilters || 'Essayez de modifier vos filtres') : 
                (translations.startByCreatingUser || 'Commencez par créer un utilisateur')
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {translations.user || "Utilisateur"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {translations.role || "Rôle"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {translations.status || "Statut"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {translations.lastLogin || "Dernière connexion"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {translations.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-white font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {user.username} • {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasPermission('USERS_ADMIN') ? (
                        <select
                          value={user.roleId}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          disabled={user.id === currentUser?.id || changeUserRole.isLoading}
                          className="bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          {roles?.map(role => (
                            <option key={role.id} value={role.id}>
                              {translations.roleNames?.[role.name] || role.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-600/20 text-purple-300">
                          <Shield size={12} className="mr-1" />
                          {translations.roleNames?.[user.role?.name] || user.role?.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-600/20 text-green-300' 
                          : 'bg-red-600/20 text-red-300'
                      }`}>
                        {user.isActive ? <UserCheck size={12} className="mr-1" /> : <UserX size={12} className="mr-1" />}
                        {user.isActive ? 
                          (translations.active || 'Actif') : 
                          (translations.inactive || 'Inactif')
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {user.lastLoginDate 
                        ? new Date(user.lastLoginDate).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : (translations.neverConnected || 'Jamais connecté')
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {hasPermission('USERS_ADMIN') && (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                              title={translations.edit || "Modifier"}
                              disabled={showUserForm}
                            >
                              <Edit3 size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={user.id === currentUser?.id || toggleUserStatus.isLoading}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive
                                  ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-600/20'
                                  : 'text-green-400 hover:text-green-300 hover:bg-green-600/20'
                              } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={user.isActive ? 
                                (translations.deactivate || 'Désactiver') : 
                                (translations.activate || 'Activer')
                              }
                            >
                              {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={user.id === currentUser?.id || deleteUser.isLoading}
                              className={`p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors ${
                                user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title={translations.delete || "Supprimer"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulaire d'utilisateur */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onClose={closeUserForm}
          roles={roles}
        />
      )}

      {/* Dialog de confirmation */}
      <ConfirmationDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmAction}
        onCancel={cancelAction}
        confirmButtonText={confirmDialog.type === 'delete' ? 
          (translations.delete || 'Supprimer') : 
          (translations.confirm || 'Confirmer')
        }
        confirmButtonClassName={confirmDialog.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}
        loading={
          confirmDialog.type === 'toggleStatus' ? toggleUserStatus.isLoading :
          confirmDialog.type === 'delete' ? deleteUser.isLoading :
          false
        }
      />
    </div>
  );
};

export default Users;
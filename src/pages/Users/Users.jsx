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
import { useTheme } from '../../contexts/ThemeContext';
import UserForm from './UserForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';

const Users = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
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

  const isDarkMode = effectiveTheme === 'dark';

  console.log('🔍 Debug Users Component:', { users, isLoading, error, isDarkMode });

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

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-400') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-purple-400/20' : 'border-[var(--border-color)]';
  const getInputBorderClass = () => isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';
  const getInputTextClass = () => isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  const getInputPlaceholderClass = () => isDarkMode ? 'placeholder-gray-400' : 'placeholder-[var(--text-secondary)]';
  const getInputFocusRingClass = () => isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]';
  const getAccentColorClass = () => isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]';
  const getButtonBgClass = () => isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  const getButtonHoverBgClass = () => isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  const getStatusBgClass = (isActive) => isDarkMode ? (isActive ? 'bg-green-600/20' : 'bg-red-600/20') : (isActive ? 'bg-[var(--success-color)]20' : 'bg-[var(--error-color)]20');
  const getStatusTextColorClass = (isActive) => isDarkMode ? (isActive ? 'text-green-300' : 'text-red-300') : (isActive ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]');
  const getActionBtnColorClass = (colorName) => {
    if (isDarkMode) {
      switch (colorName) {
        case 'blue': return 'text-blue-400 hover:text-blue-300';
        case 'orange': return 'text-orange-400 hover:text-orange-300';
        case 'green': return 'text-green-400 hover:text-green-300';
        case 'red': return 'text-red-400 hover:text-red-300';
        default: return '';
      }
    } else {
      switch (colorName) {
        case 'blue': return 'text-[var(--accent-color-secondary)]';
        case 'orange': return 'text-[var(--warning-color)]';
        case 'green': return 'text-[var(--success-color)]';
        case 'red': return 'text-[var(--error-color)]';
        default: return '';
      }
    }
  };
  const getActionBtnBgClass = (colorName) => {
    if (isDarkMode) {
      switch (colorName) {
        case 'blue': return 'hover:bg-blue-600/20';
        case 'orange': return 'hover:bg-orange-600/20';
        case 'green': return 'hover:bg-green-600/20';
        case 'red': return 'hover:bg-red-600/20';
        default: return '';
      }
    } else {
      switch (colorName) {
        case 'blue': return 'hover:bg-[var(--accent-color-secondary)]20';
        case 'orange': return 'hover:bg-[var(--warning-color)]20';
        case 'green': return 'hover:bg-[var(--success-color)]20';
        case 'red': return 'hover:bg-[var(--error-color)]20';
        default: return '';
      }
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${getTextColorClass(true)}`}>
            {translations.userManagement || "Gestion des Utilisateurs"}
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${getTextColorClass(true)}`}>
            {translations.userManagement || "Gestion des Utilisateurs"}
          </h1>
        </div>
        <div className="text-center py-12">
          <div className={`${getTextColorClass(false)} text-lg mb-4`}>
            {translations.errorLoadingUsers || "Erreur lors du chargement des utilisateurs"}
          </div>
          <div className={getTextColorClass(false)}>
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
          <UsersIcon className={`h-8 w-8 ${getAccentColorClass()}`} />
          <h1 className={`text-3xl font-bold ${getTextColorClass(true)}`}>
            {translations.userManagement || "Gestion des Utilisateurs"}
          </h1>
        </div>
        
        {hasPermission('USERS_ADMIN') && (
          <button
            onClick={handleCreateUser}
            className={`flex items-center space-x-2 px-4 py-2 ${getButtonBgClass()} text-white rounded-lg ${getButtonHoverBgClass()} transition-colors disabled:opacity-50`}
            disabled={showUserForm}
          >
            <UserPlus size={16} />
            <span>{translations.addUser || "Nouvel Utilisateur"}</span>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div 
        className={`p-6 rounded-lg border ${getBorderColorClass()}`}
        style={{
          background: 'var(--background-card)', // Utilise la variable CSS
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getTextColorClass(false)}`} size={16} />
            <input
              type="text"
              placeholder={translations.searchUsers || "Rechercher un utilisateur..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${getInputBgClass()} border ${getInputBorderClass()} rounded-lg ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
            />
          </div>

          {/* Filtre par rôle */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`w-full px-4 py-2 ${getInputBgClass()} border ${getInputBorderClass()} rounded-lg ${getInputTextClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
          >
            <option value="" className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-[var(--background-primary)] text-[var(--text-primary)]'}>{translations.allRoles || "Tous les rôles"}</option>
            {roles?.map(role => (
              <option key={role.id} value={role.name} className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-[var(--background-primary)] text-[var(--text-primary)]'}>
                {translations.roleNames?.[role.name] || role.name}
              </option>
            ))}
          </select>

          {/* Toggle utilisateurs inactifs */}
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showInactive 
                ? `${getButtonBgClass()} text-white` 
                : `${getInputBgClass()} ${getTextColorClass(false)} ${isDarkMode ? 'hover:text-white' : 'hover:opacity-80'}`
            }`}
          >
            {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{translations.showInactive || "Utilisateurs inactifs"}</span>
          </button>

          {/* Statistiques */}
          <div className={`${getTextColorClass(false)} text-sm`}>
            <div>{translations.total || "Total"}: {users?.length || 0} {translations.users || "utilisateurs"}</div>
            <div>{translations.active || "Actifs"}: {users?.filter(u => u.isActive).length || 0}</div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div 
        className={`rounded-lg border ${getBorderColorClass()} overflow-hidden`}
        style={{
          background: 'var(--background-card)', // Utilise la variable CSS
          backdropFilter: 'blur(10px)'
        }}
      >
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className={`h-12 w-12 ${getTextColorClass(false)} mx-auto mb-4`} />
            <p className={`${getTextColorClass(false)} text-lg`}>{translations.noUsersFound || "Aucun utilisateur trouvé"}</p>
            <p className={`${getTextColorClass(false)} text-sm`}>
              {searchTerm || selectedRole ? 
                (translations.tryModifyFilters || 'Essayez de modifier vos filtres') : 
                (translations.startByCreatingUser || 'Commencez par créer un utilisateur')
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${getInputBgClass()} border-b ${getBorderColorClass()}`}> {/* Added border-b and getBorderColorClass() here */}
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations.user || "Utilisateur"}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations.role || "Rôle"}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations.status || "Statut"}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations.lastLogin || "Dernière connexion"}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/50' : 'divide-[var(--border-color)]'}`}>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-[var(--background-secondary)]'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-[var(--accent-color-primary)] to-[var(--accent-color-secondary)]'}`}>
                          <span className="text-white font-semibold text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className={`font-medium ${getTextColorClass(true)}`}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div className={`text-sm ${getTextColorClass(false)}`}>
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
                          className={`${getInputBgClass()} border ${getInputBorderClass()} rounded px-2 py-1 ${getInputTextClass()} text-sm focus:outline-none focus:ring-2 ${getInputFocusRingClass()} disabled:opacity-50`}
                        >
                          {roles?.map(role => (
                            <option key={role.id} value={role.id} className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-[var(--background-primary)] text-[var(--text-primary)]'}>
                              {translations.roleNames?.[role.name] || role.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-purple-600/20 text-purple-300' : 'bg-[var(--accent-color-primary)]20 text-[var(--accent-color-primary)]'}`}>
                          <Shield size={12} className="mr-1" />
                          {translations.roleNames?.[user.role?.name] || user.role?.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBgClass(user.isActive)} ${getStatusTextColorClass(user.isActive)}`}>
                        {user.isActive ? <UserCheck size={12} className="mr-1" /> : <UserX size={12} className="mr-1" />}
                        {user.isActive ? 
                          (translations.active || 'Actif') : 
                          (translations.inactive || 'Inactif')
                        }
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getTextColorClass(false)}`}>
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
                              className={`p-2 ${getActionBtnColorClass('blue')} ${getActionBtnBgClass('blue')} rounded-lg transition-colors`}
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
                                  ? `${getActionBtnColorClass('orange')} ${getActionBtnBgClass('orange')}`
                                  : `${getActionBtnColorClass('green')} ${getActionBtnBgClass('green')}`
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
                              className={`p-2 ${getActionBtnColorClass('red')} ${getActionBtnBgClass('red')} rounded-lg transition-colors ${
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

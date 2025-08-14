// Utilitaire pour la gestion des permissions côté frontend
export const PERMISSIONS = {
  // Gestion des postes
  POSTES_VIEW: 'POSTES_VIEW',
  POSTES_CREATE: 'POSTES_CREATE',
  POSTES_UPDATE: 'POSTES_UPDATE',
  POSTES_DELETE: 'POSTES_DELETE',
  
  // Gestion des sessions
  SESSIONS_VIEW: 'SESSIONS_VIEW',
  SESSIONS_CREATE: 'SESSIONS_CREATE',
  SESSIONS_UPDATE: 'SESSIONS_UPDATE',
  SESSIONS_DELETE: 'SESSIONS_DELETE',
  SESSIONS_MANAGE: 'SESSIONS_MANAGE',
  
  // Gestion des clients
  CLIENTS_VIEW: 'CLIENTS_VIEW',
  CLIENTS_CREATE: 'CLIENTS_CREATE',
  CLIENTS_UPDATE: 'CLIENTS_UPDATE',
  CLIENTS_DELETE: 'CLIENTS_DELETE',
  
  // Gestion des transactions
  TRANSACTIONS_VIEW: 'TRANSACTIONS_VIEW',
  TRANSACTIONS_CREATE: 'TRANSACTIONS_CREATE',
  
  // Gestion financière
  FINANCES_VIEW: 'FINANCES_VIEW',
  STATISTICS_VIEW: 'STATISTICS_VIEW',
  
  // Administration
  USERS_MANAGE: 'USERS_MANAGE',
  ROLES_MANAGE: 'ROLES_MANAGE',
  PERMISSIONS_MANAGE: 'PERMISSIONS_MANAGE',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG'
};

// Groupes de permissions par rôle type
export const ROLE_PERMISSIONS = {
  ADMINISTRATEUR: Object.values(PERMISSIONS),
  EMPLOYE_CAISSIER: [
    PERMISSIONS.POSTES_VIEW,
    PERMISSIONS.SESSIONS_VIEW,
    PERMISSIONS.SESSIONS_CREATE,
    PERMISSIONS.SESSIONS_UPDATE,
    PERMISSIONS.SESSIONS_MANAGE,
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,
    PERMISSIONS.TRANSACTIONS_VIEW,
    PERMISSIONS.TRANSACTIONS_CREATE
  ]
};

/**
 * Vérifie si l'utilisateur a une permission spécifique
 * @param {Object} user - Objet utilisateur avec rôle et permissions
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;
  
  // Admin a toutes les permissions
  if (user.role?.nom === 'ADMINISTRATEUR') return true;
  
  // Vérifier dans les permissions directes
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.some(p => 
      (typeof p === 'string' ? p : p.nom) === permission
    );
  }
  
  // Vérifier dans le rôle
  if (user.role?.permissions && Array.isArray(user.role.permissions)) {
    return user.role.permissions.some(p => 
      (typeof p === 'string' ? p : p.nom) === permission
    );
  }
  
  // Fallback: vérifier par nom de rôle
  const rolePermissions = ROLE_PERMISSIONS[user.role?.nom];
  if (rolePermissions) {
    return rolePermissions.includes(permission);
  }
  
  return false;
};

/**
 * Vérifie si l'utilisateur a au moins une des permissions listées
 * @param {Object} user - Objet utilisateur
 * @param {string[]} permissions - Liste de permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Vérifie si l'utilisateur a toutes les permissions listées
 * @param {Object} user - Objet utilisateur
 * @param {string[]} permissions - Liste de permissions
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Filtre les éléments de menu selon les permissions
 * @param {Array} menuItems - Items de menu
 * @param {Object} user - Utilisateur
 * @returns {Array}
 */
export const filterMenuByPermissions = (menuItems, user) => {
  if (!user) return [];
  
  return menuItems.filter(item => {
    if (!item.requiredPermissions) return true;
    return hasAnyPermission(user, item.requiredPermissions);
  });
};

/**
 * Composant HOC pour protéger les composants par permissions
 * TODO: Implémenter avec le contexte React approprié
 */
import React from 'react';

// export const withPermission = (WrappedComponent, requiredPermission) => {
//   return function PermissionProtectedComponent(props) {
//     // Ceci nécessiterait d'être dans un contexte React avec useAuth
//     // Pour l'instant, on retourne juste le composant
//     return <WrappedComponent {...props} />;
//   };
// };

/**
 * Hook personnalisé pour utiliser les permissions
 */
export const useUserPermissions = (user) => {
  const checkPermission = (permission) => hasPermission(user, permission);
  const checkAnyPermission = (permissions) => hasAnyPermission(user, permissions);
  const checkAllPermissions = (permissions) => hasAllPermissions(user, permissions);
  
  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    isAdmin: user?.role?.nom === 'ADMINISTRATEUR',
    isEmployee: user?.role?.nom === 'EMPLOYE_CAISSIER'
  };
};

/**
 * Messages d'erreur standardisés pour les permissions
 */
export const PERMISSION_ERRORS = {
  ACCESS_DENIED: "Accès refusé : Vous n'avez pas les permissions nécessaires",
  INSUFFICIENT_PERMISSIONS: "Permissions insuffisantes pour cette action",
  ADMIN_REQUIRED: "Droits administrateur requis",
  ROLE_REQUIRED: "Rôle spécifique requis"
};

/**
 * Composant d'affichage conditionnel basé sur les permissions
 */
export const PermissionGuard = ({ 
  children, 
  permission, 
  permissions, 
  user, 
  fallback = null,
  requireAll = false 
}) => {
  if (!user) return fallback;
  
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasPermission(user, permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(user, permissions)
      : hasAnyPermission(user, permissions);
  } else {
    hasAccess = true; // Pas de restriction
  }
  
  return hasAccess ? children : fallback;
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  filterMenuByPermissions,
  useUserPermissions,
  PERMISSION_ERRORS,
  PermissionGuard
};

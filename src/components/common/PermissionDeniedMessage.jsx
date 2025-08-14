import React from 'react';
import { Shield, AlertCircle, Lock, User, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const PermissionDeniedMessage = ({ 
  requiredPermission, 
  message, 
  showRoleInfo = true,
  showContactAdmin = true,
  className = ""
}) => {
  const { effectiveTheme } = useTheme();
  const { user } = useAuth();
  const isDarkMode = effectiveTheme === 'dark';

  const getPermissionDisplayName = (permission) => {
    const permissionNames = {
      'POSTES_VIEW': 'Voir les postes',
      'POSTES_CREATE': 'Créer des postes',
      'POSTES_UPDATE': 'Modifier les postes',
      'POSTES_DELETE': 'Supprimer les postes',
      'SESSIONS_VIEW': 'Voir les sessions',
      'SESSIONS_CREATE': 'Créer des sessions',
      'SESSIONS_UPDATE': 'Modifier les sessions',
      'SESSIONS_DELETE': 'Supprimer les sessions',
      'SESSIONS_MANAGE': 'Gérer les sessions',
      'CLIENTS_VIEW': 'Voir les clients',
      'CLIENTS_CREATE': 'Créer des clients',
      'CLIENTS_UPDATE': 'Modifier les clients',
      'CLIENTS_DELETE': 'Supprimer les clients',
      'TRANSACTIONS_VIEW': 'Voir les transactions',
      'TRANSACTIONS_CREATE': 'Créer des transactions',
      'FINANCES_VIEW': 'Voir les finances',
      'STATISTICS_VIEW': 'Voir les statistiques',
      'USERS_MANAGE': 'Gérer les utilisateurs',
      'ROLES_MANAGE': 'Gérer les rôles',
      'PERMISSIONS_MANAGE': 'Gérer les permissions',
      'SYSTEM_CONFIG': 'Configuration système'
    };
    
    return permissionNames[permission] || permission;
  };

  return (
    <div className={`
      p-6 rounded-lg border-2 border-dashed max-w-2xl mx-auto ${className}
      ${isDarkMode 
        ? 'bg-red-900/20 border-red-700 text-red-300' 
        : 'bg-red-50 border-red-300 text-red-700'
      }
    `}>
      <div className="text-center">
        {/* Icône principale */}
        <div className={`
          w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
          ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}
        `}>
          <Shield className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
        </div>

        {/* Message principal */}
        <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
          Accès Refusé
        </h3>
        
        <p className={`mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
          {message || "Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité."}
        </p>

        {/* Détails de la permission requise */}
        {requiredPermission && (
          <div className={`
            p-4 rounded-lg mb-4 text-left
            ${isDarkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-100 border border-red-200'}
          `}>
            <div className="flex items-center mb-2">
              <Lock className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                Permission requise :
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {getPermissionDisplayName(requiredPermission)}
            </p>
          </div>
        )}

        {/* Informations sur le rôle actuel */}
        {showRoleInfo && user && (
          <div className={`
            p-4 rounded-lg mb-4 text-left
            ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}
          `}>
            <div className="flex items-center mb-2">
              <User className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Votre rôle actuel :
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {user.role?.nom || 'Non défini'}
            </p>
          </div>
        )}

        {/* Message pour contacter l'administrateur */}
        {showContactAdmin && (
          <div className={`
            p-4 rounded-lg border-l-4 border-blue-500
            ${isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}
          `}>
            <div className="flex items-start">
              <AlertCircle className={`w-5 h-5 mr-3 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="text-left">
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  Besoin d'accès ?
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Contactez votre administrateur pour obtenir les permissions nécessaires.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bouton pour les paramètres de compte (si applicable) */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => window.location.reload()}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            Actualiser la page
          </button>
          
          {user?.role?.nom === 'ADMINISTRATEUR' && (
            <div className="text-center">
              <button
                onClick={() => {
                  // Redirection vers la gestion des permissions
                  window.location.href = '/permissions';
                }}
                className={`
                  inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors
                  ${isDarkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }
                `}
              >
                <Settings className="w-4 h-4 mr-2" />
                Gérer les permissions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionDeniedMessage;

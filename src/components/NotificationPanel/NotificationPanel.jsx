import React, { useState } from 'react';
import { Bell, X, Eye, EyeOff, Check, Trash2, Filter, Settings, ChevronRight, RefreshCw } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ onClose }) => {
  const [filter, setFilter] = useState('all');
  const {
    notifications, // ✅ Toutes les notifications (visibles et historique)
    getNotificationStats,
    dismissNotification,
    deleteNotification, // ✅ NOUVEAU: Suppression définitive
    markAsRead,
    clearAllNotifications,
    clearByCategory,
    showNotificationAgain // ✅ NOUVEAU: Réafficher une notification
  } = useNotification();
  
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const stats = getNotificationStats();

  // ✅ CORRECTION: Filtrer sur toutes les notifications (pas seulement visibles)
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      case 'visible':
        return notification.isVisible;
      case 'hidden':
        return !notification.isVisible;
      case 'system':
        return notification.category === 'system';
      case 'user':
        return notification.category === 'user';
      case 'data':
        return notification.category === 'data';
      case 'security':
        return notification.category === 'security';
      default:
        return true;
    }
  });

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    });
  };

  const handleToggleRead = (notification) => {
    markAsRead(notification.id, !notification.isRead);
  };

  // ✅ NOUVEAU: Réafficher une notification masquée
  const handleShowAgain = (notificationId) => {
    showNotificationAgain(notificationId);
  };

  const handleGoToSettings = () => {
    navigate('/dashboard/notifications');
    onClose();
  };

  // Styles cohérents avec le header
  const panelBg = 'rgba(30, 41, 59, 0.95)';
  const borderColor = 'border-purple-400/20';
  const textPrimary = 'text-gray-300';
  const textSecondary = 'text-gray-400';
  const hoverBg = 'hover:bg-purple-600/20';

  return (
    <div 
      className={`w-80 max-h-96 rounded-lg shadow-xl border ${borderColor} overflow-hidden`}
      style={{
        background: panelBg,
        backdropFilter: 'blur(15px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Header */}
      <div className={`p-4 border-b ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="text-purple-400" size={18} />
            <h3 className={`font-semibold ${textPrimary}`}>
              {translations?.notificationsHeader || 'Notifications'}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {stats.unread > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                {stats.unread}
              </span>
            )}
            {stats.visible > 0 && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold">
                {stats.visible} visibles
              </span>
            )}
            <button
              onClick={onClose}
              className={`p-1 rounded ${textSecondary} ${hoverBg} transition-colors`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ✅ NOUVEAU: Filtres étendus */}
        <div className="flex items-center space-x-2 mb-3">
          <Filter size={14} className={textSecondary} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`text-xs px-2 py-1 rounded bg-gray-800/50 border ${borderColor} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-400/50`}
          >
            <option value="all">Toutes ({notifications.length})</option>
            <option value="unread">Non lues ({stats.unread})</option>
            <option value="read">Lues ({notifications.length - stats.unread})</option>
            <option value="visible">Visibles ({stats.visible})</option>
            <option value="hidden">Masquées ({notifications.length - stats.visible})</option>
            <optgroup label="Par catégorie">
              <option value="system">Système ({stats.byCategory.system || 0})</option>
              <option value="user">Utilisateur ({stats.byCategory.user || 0})</option>
              <option value="data">Données ({stats.byCategory.data || 0})</option>
              <option value="security">Sécurité ({stats.byCategory.security || 0})</option>
            </optgroup>
          </select>
        </div>

        {/* Actions globales */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className={`text-xs px-2 py-1 rounded flex items-center space-x-1 bg-green-600/20 text-green-400 ${hoverBg} border border-green-600/30 transition-colors`}
                >
                  <Check size={10} />
                  <span>Tout lire</span>
                </button>
              )}
              <button
                onClick={() => clearAllNotifications()}
                className={`text-xs px-2 py-1 rounded flex items-center space-x-1 bg-red-600/20 text-red-400 ${hoverBg} border border-red-600/30 transition-colors`}
              >
                <Trash2 size={10} />
                <span>Effacer</span>
              </button>
            </div>
            
            <button
              onClick={handleGoToSettings}
              className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${textSecondary} ${hoverBg} border ${borderColor} transition-colors`}
            >
              <Settings size={10} />
              <span>Gérer</span>
            </button>
          </div>
        )}
      </div>

      {/* Liste des notifications */}
      <div className="max-h-64 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className={`mx-auto mb-2 ${textSecondary}`} size={24} />
            <p className={`text-sm ${textSecondary}`}>
              {filter === 'all' 
                ? (translations?.noNewNotifications || 'Aucune notification')
                : `Aucune notification ${filter === 'unread' ? 'non lue' : filter}`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b border-gray-700/50 transition-colors ${hoverBg} ${
                !notification.isRead ? 'border-l-2 border-l-blue-400' : ''
              } ${
                !notification.isVisible ? 'opacity-60 bg-gray-800/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-medium truncate ${textPrimary} ${
                      !notification.isRead ? 'font-semibold' : ''
                    }`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center space-x-1 ml-2">
                      {/* ✅ NOUVEAU: Bouton pour réafficher si masqué */}
                      {!notification.isVisible && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowAgain(notification.id);
                          }}
                          className="p-1 rounded transition-colors text-green-400 hover:text-green-300"
                          title="Réafficher cette notification"
                        >
                          <RefreshCw size={12} />
                        </button>
                      )}
                      
                      {/* Bouton œil pour marquer comme lu/non lu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRead(notification);
                        }}
                        className={`p-1 rounded transition-colors ${
                          notification.isRead
                            ? `${textSecondary} hover:text-blue-400`
                            : 'text-blue-400 hover:text-blue-300'
                        }`}
                        title={notification.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                      >
                        {notification.isRead ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      
                      {/* ✅ CORRECTION: Bouton supprimer définitivement */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className={`p-1 rounded transition-colors ${textSecondary} hover:text-red-400`}
                        title="Supprimer définitivement"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <p className={`text-xs mt-1 ${textSecondary} line-clamp-2`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${textSecondary}`}>
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {/* ✅ Badge d'état de visibilité */}
                      {!notification.isVisible && (
                        <span className="text-xs px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full">
                          masqué
                        </span>
                      )}
                      
                      {/* Badge de catégorie */}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        notification.category === 'system' 
                          ? 'bg-blue-600/20 text-blue-400'
                          : notification.category === 'security'
                          ? 'bg-red-600/20 text-red-400'
                          : notification.category === 'data'
                          ? 'bg-purple-600/20 text-purple-400'
                          : 'bg-green-600/20 text-green-400'
                      }`}>
                        {notification.category}
                      </span>
                      
                      {/* Badge de priorité */}
                      {notification.priority === 'high' && (
                        <span className="text-xs px-2 py-1 bg-orange-600/20 text-orange-400 rounded-full">
                          URGENT
                        </span>
                      )}
                      
                      {notification.priority === 'critical' && (
                        <span className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded-full animate-pulse">
                          CRITIQUE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer avec lien vers la page de gestion */}
      {notifications.length > 0 && (
        <div className={`p-3 border-t ${borderColor}`}>
          <button
            onClick={handleGoToSettings}
            className={`w-full text-xs ${textSecondary} ${hoverBg} py-2 rounded flex items-center justify-center space-x-1 transition-colors`}
          >
            <span>Voir toutes les notifications ({notifications.length})</span>
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
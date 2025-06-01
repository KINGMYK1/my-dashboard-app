import React, { useState } from 'react';
import { Bell, Settings, Trash2, Eye, EyeOff, Check, Filter, Download, Upload, AlertTriangle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import  Card  from '../../components/ui/Card';
import  Button  from '../../components/ui/Button';
import  Badge  from '../../components/ui/Badge';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    enabledCategories: {
      system: true,
      user: true,
      data: true,
      security: true
    },
    enabledTypes: {
      success: true,
      error: true,
      warning: true,
      info: true
    },
    autoDeleteAfter: 30, // jours
    maxNotifications: 100,
    playSound: true,
    showDesktopNotifications: false
  });

  const {
    notifications,
    getNotificationStats,
    dismissNotification,
    markAsRead,
    clearAllNotifications,
    clearByCategory
  } = useNotification();
  
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const stats = getNotificationStats();

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      case 'system':
        return notification.category === 'system';
      case 'user':
        return notification.category === 'user';
      case 'data':
        return notification.category === 'data';
      case 'security':
        return notification.category === 'security';
      case 'success':
        return notification.type === 'success';
      case 'error':
        return notification.type === 'error';
      case 'warning':
        return notification.type === 'warning';
      case 'info':
        return notification.type === 'info';
      default:
        return true;
    }
  });

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkAction = (action) => {
    selectedNotifications.forEach(id => {
      switch (action) {
        case 'markRead':
          markAsRead(id);
          break;
        case 'delete':
          dismissNotification(id);
          break;
        default:
          break;
      }
    });
    setSelectedNotifications([]);
  };

  const handleToggleRead = (notification) => {
    markAsRead(notification.id, !notification.read);
  };

  const handleUpdateSettings = (newSettings) => {
    setNotificationSettings(newSettings);
    // Ici vous pourriez sauvegarder dans localStorage ou envoyer au backend
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const getTypeIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      system: 'bg-blue-500/20 text-blue-400',
      user: 'bg-green-500/20 text-green-400',
      data: 'bg-purple-500/20 text-purple-400',
      security: 'bg-red-500/20 text-red-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos notifications et préférences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {stats.total} notifications
          </Badge>
          {stats.unread > 0 && (
            <Badge variant="destructive">
              {stats.unread} non lues
            </Badge>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Non lues</p>
              <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Système</p>
              <p className="text-2xl font-bold text-purple-600">{stats.byCategory.system || 0}</p>
            </div>
            <Settings className="h-8 w-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sécurité</p>
              <p className="text-2xl font-bold text-red-600">{stats.byCategory.security || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Filtres et Actions */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Toutes ({notifications.length})</option>
                <option value="unread">Non lues ({stats.unread})</option>
                <option value="read">Lues ({stats.read})</option>
                <optgroup label="Par catégorie">
                  <option value="system">Système ({stats.byCategory.system || 0})</option>
                  <option value="user">Utilisateur ({stats.byCategory.user || 0})</option>
                  <option value="data">Données ({stats.byCategory.data || 0})</option>
                  <option value="security">Sécurité ({stats.byCategory.security || 0})</option>
                </optgroup>
                <optgroup label="Par type">
                  <option value="success">Succès ({stats.byType.success || 0})</option>
                  <option value="error">Erreur ({stats.byType.error || 0})</option>
                  <option value="warning">Avertissement ({stats.byType.warning || 0})</option>
                  <option value="info">Information ({stats.byType.info || 0})</option>
                </optgroup>
              </select>
            </div>

            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotifications.length} sélectionnées
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('markRead')}
                >
                  <Check size={14} className="mr-1" />
                  Marquer lues
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 size={14} className="mr-1" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedNotifications.length === filteredNotifications.length ? 'Désélectionner tout' : 'Sélectionner tout'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearAllNotifications()}
              disabled={notifications.length === 0}
            >
              <Trash2 size={14} className="mr-1" />
              Vider tout
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Export des notifications
                const dataStr = JSON.stringify(notifications, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `notifications_${new Date().toISOString().split('T')[0]}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
            >
              <Download size={14} className="mr-1" />
              Exporter
            </Button>
          </div>
        </div>
      </Card>

      {/* Liste des notifications */}
      <Card>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'all' 
                  ? 'Aucune notification'
                  : `Aucune notification ${filter}`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="mt-1"
                  />
                  
                  <div className="text-2xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${
                        !notification.read ? 'font-bold' : ''
                      } text-gray-900 dark:text-white`}>
                        {notification.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getCategoryColor(notification.category)}>
                          {notification.category}
                        </Badge>
                        
                        {notification.priority !== 'normal' && (
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        )}
                        
                        <button
                          onClick={() => handleToggleRead(notification)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title={notification.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                        >
                          {notification.read ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      
                      {notification.actionText && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={notification.onAction}
                        >
                          {notification.actionText}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Paramètres de notifications */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Paramètres des notifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Catégories activées */}
          <div>
            <h3 className="text-sm font-medium mb-3">Catégories activées</h3>
            <div className="space-y-2">
              {Object.entries(notificationSettings.enabledCategories).map(([category, enabled]) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleUpdateSettings({
                      ...notificationSettings,
                      enabledCategories: {
                        ...notificationSettings.enabledCategories,
                        [category]: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Types activés */}
          <div>
            <h3 className="text-sm font-medium mb-3">Types activés</h3>
            <div className="space-y-2">
              {Object.entries(notificationSettings.enabledTypes).map(([type, enabled]) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleUpdateSettings({
                      ...notificationSettings,
                      enabledTypes: {
                        ...notificationSettings.enabledTypes,
                        [type]: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Autres paramètres */}
          <div>
            <h3 className="text-sm font-medium mb-3">Rétention</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Supprimer automatiquement après (jours)
                </label>
                <input
                  type="number"
                  value={notificationSettings.autoDeleteAfter}
                  onChange={(e) => handleUpdateSettings({
                    ...notificationSettings,
                    autoDeleteAfter: parseInt(e.target.value)
                  })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  min="1"
                  max="365"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Nombre maximum de notifications
                </label>
                <input
                  type="number"
                  value={notificationSettings.maxNotifications}
                  onChange={(e) => handleUpdateSettings({
                    ...notificationSettings,
                    maxNotifications: parseInt(e.target.value)
                  })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  min="10"
                  max="1000"
                />
              </div>
            </div>
          </div>

          {/* Options d'affichage */}
          <div>
            <h3 className="text-sm font-medium mb-3">Options d'affichage</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.playSound}
                  onChange={(e) => handleUpdateSettings({
                    ...notificationSettings,
                    playSound: e.target.checked
                  })}
                  className="mr-2"
                />
                <span>Jouer un son</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.showDesktopNotifications}
                  onChange={(e) => handleUpdateSettings({
                    ...notificationSettings,
                    showDesktopNotifications: e.target.checked
                  })}
                  className="mr-2"
                />
                <span>Notifications système (desktop)</span>
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
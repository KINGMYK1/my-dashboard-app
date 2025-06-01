import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import Toast from '../components/Toast/Toast';

// Créer le contexte
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();

  // Générer un ID unique pour chaque notification
  const generateId = useCallback(() => 
    `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`, []);

  // Ajouter une notification avec support complet
  const showNotification = useCallback((type, message, options = {}) => {
    const {
      title,
      duration = 5000,
      persistent = false,
      onAction = null,
      actionText = null,
      position = 'top-right',
      priority = 'normal', // 'low', 'normal', 'high', 'critical'
      category = 'general', // 'system', 'user', 'data', 'security'
      data = null
    } = options;

    const id = generateId();
    
    const notification = {
      id,
      type,
      message,
      title: title || translations?.[`${type}Title`] || type,
      duration: persistent ? 0 : duration,
      position,
      priority,
      category,
      onAction,
      actionText,
      data,
      timestamp: new Date(),
      isDismissed: false,
      isRead: false
    };

    setNotifications(prev => {
      // Si priorité critique, remplacer les notifications normales
      if (priority === 'critical') {
        return [notification, ...prev.filter(n => n.priority === 'critical')];
      }
      
      // Limiter le nombre de notifications (max 5)
      const filtered = prev.slice(0, 4);
      return [notification, ...filtered];
    });

    // Auto-remove après la durée spécifiée (sauf si persistant)
    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }

    return id;
  }, [generateId, translations]);

  // Fonctions de raccourci améliorées
  const showSuccess = useCallback((message, options = {}) => {
    return showNotification('success', message, {
      title: options.title || translations?.successTitle || 'Succès',
      ...options
    });
  }, [showNotification, translations?.successTitle]);

  const showError = useCallback((errorOrMessage, options = {}) => {
    let message = errorOrMessage;
    
    // Si c'est un objet d'erreur, extraire le message
    if (typeof errorOrMessage === 'object' && errorOrMessage !== null) {
      message = errorOrMessage.message || 
                errorOrMessage.data?.message || 
                'Une erreur est survenue';
    }
    
    return showNotification('error', message, {
      title: options.title || translations?.errorTitle || 'Erreur',
      duration: options.duration || 8000, // Erreurs restent plus longtemps
      priority: options.priority || 'high',
      ...options
    });
  }, [showNotification, translations?.errorTitle]);

  const showWarning = useCallback((message, options = {}) => {
    return showNotification('warning', message, {
      title: options.title || translations?.warningTitle || 'Attention',
      duration: options.duration || 6000,
      ...options
    });
  }, [showNotification, translations?.warningTitle]);

  const showInfo = useCallback((message, options = {}) => {
    return showNotification('info', message, {
      title: options.title || translations?.infoTitle || 'Information',
      ...options
    });
  }, [showNotification, translations?.infoTitle]);

  // Notifications système spéciales
  const showSystemNotification = useCallback((message, options = {}) => {
    return showNotification('info', message, {
      title: options.title || translations?.systemTitle || 'Système',
      category: 'system',
      priority: 'high',
      persistent: true,
      ...options
    });
  }, [showNotification, translations?.systemTitle]);

  const showSessionExpired = useCallback(() => {
    return showError(
      translations?.sessionExpiredMessage || "Votre session a expiré. Veuillez vous reconnecter.",
      {
        title: translations?.sessionExpiredTitle || "Session expirée",
        duration: 0, // Persistant
        priority: 'critical',
        category: 'security'
      }
    );
  }, [showError, translations]);

  // Gestion des notifications
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearByCategory = useCallback((category) => {
    setNotifications(prev => prev.filter(n => n.category !== category));
  }, []);

  // Statistiques des notifications
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    const byCategory = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {});

    return { total, unread, byType, byCategory };
  }, [notifications]);

  // Valeur du contexte
  const contextValue = {
    // Fonctions principales
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSystemNotification,
    showSessionExpired,
    showNotification,
    
    // Gestion
    dismissNotification,
    markAsRead,
    clearAllNotifications,
    clearByCategory,
    
    // Données
    notifications,
    getNotificationStats,
    
    // Utils
    generateId
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Container des notifications avec groupement par position */}
      <NotificationContainer 
        notifications={notifications}
        onDismiss={dismissNotification}
        onMarkAsRead={markAsRead}
        theme={effectiveTheme}
      />
    </NotificationContext.Provider>
  );
};

// Composant conteneur pour gérer les positions
const NotificationContainer = ({ notifications, onDismiss, onMarkAsRead, theme }) => {
  // Grouper les notifications par position
  const groupedByPosition = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) acc[position] = [];
    acc[position].push(notification);
    return acc;
  }, {});

  // Positions possibles avec leurs classes CSS
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 space-y-2 z-50',
    'top-left': 'fixed top-4 left-4 space-y-2 z-50',
    'bottom-right': 'fixed bottom-4 right-4 space-y-2 z-50',
    'bottom-left': 'fixed bottom-4 left-4 space-y-2 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 space-y-2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 space-y-2 z-50'
  };

  return (
    <>
      {Object.entries(groupedByPosition).map(([position, positionNotifications]) => (
        <div key={position} className={positionClasses[position]}>
          {positionNotifications.map((notification) => (
            <Toast
              key={notification.id}
              type={notification.type}
              message={notification.message}
              title={notification.title}
              duration={notification.duration}
              isVisible={!notification.isDismissed}
              onClose={() => onDismiss(notification.id)}
              onAction={notification.onAction}
              actionText={notification.actionText}
              priority={notification.priority}
              category={notification.category}
              theme={theme}
              onMarkAsRead={() => onMarkAsRead(notification.id)}
              isRead={notification.isRead}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
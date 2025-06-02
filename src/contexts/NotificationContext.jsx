import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import Toast from '../components/Toast/Toast';

// Créer le contexte
const NotificationContext = createContext();

// ✅ NOUVEAU: Gestionnaire de persistance des notifications
class NotificationStorage {
  static STORAGE_KEY = 'gcm_notifications';
  static MAX_STORED_NOTIFICATIONS = 100;

  static save(notifications) {
    try {
      // Garder seulement les notifications importantes et récentes
      const toSave = notifications
        .filter(n => !n.isTemporary) // Exclure les notifications temporaires
        .slice(0, this.MAX_STORED_NOTIFICATIONS)
        .map(n => ({
          ...n,
          // Conserver l'état mais pas les fonctions
          onAction: null // Les fonctions ne peuvent pas être sérialisées
        }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.warn('Impossible de sauvegarder les notifications:', error);
    }
  }

  static load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const notifications = JSON.parse(saved);
        // Nettoyer les notifications trop anciennes (plus de 30 jours)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return notifications.filter(n => new Date(n.timestamp) > thirtyDaysAgo);
      }
    } catch (error) {
      console.warn('Impossible de charger les notifications:', error);
    }
    return [];
  }

  static clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Impossible de nettoyer les notifications:', error);
    }
  }
}

export const NotificationProvider = ({ children }) => {
  // ✅ CORRECTION: Charger les notifications sauvegardées au démarrage
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = NotificationStorage.load();
    console.log('📋 [NOTIFICATION_CONTEXT] Notifications chargées:', savedNotifications.length);
    return savedNotifications;
  });

  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();

  // ✅ NOUVEAU: Sauvegarder automatiquement les notifications quand elles changent
  useEffect(() => {
    NotificationStorage.save(notifications);
  }, [notifications]);

  // Générer un ID unique pour chaque notification
  const generateId = useCallback(() => 
    `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`, []);

  // ✅ CORRECTION: Ajouter une notification avec gestion de la persistance
  const showNotification = useCallback((type, message, options = {}) => {
    const {
      title,
      duration = 5000,
      persistent = false,
      isTemporary = false, // ✅ NOUVEAU: Marquer les notifications temporaires
      onAction = null,
      actionText = null,
      position = 'top-right',
      priority = 'normal',
      category = 'general',
      data = null,
      canDismiss = true // ✅ NOUVEAU: Contrôler si on peut masquer
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
      isRead: false,
      isTemporary, // ✅ Les notifications temporaires ne sont pas sauvegardées
      canDismiss,
      isVisible: true // ✅ NOUVEAU: Contrôler la visibilité du toast
    };

    console.log('📝 [NOTIFICATION_CONTEXT] Nouvelle notification:', {
      id,
      type,
      message: message.substring(0, 50) + '...',
      isTemporary,
      persistent
    });

    setNotifications(prev => {
      // Si priorité critique, remplacer les notifications normales
      if (priority === 'critical') {
        return [notification, ...prev.filter(n => n.priority === 'critical')];
      }
      
      // Limiter le nombre de notifications visibles (max 5 toasts)
      const visibleCount = prev.filter(n => n.isVisible).length;
      let updatedNotifications = [notification, ...prev];
      
      // Masquer les anciens toasts si trop nombreux
      if (visibleCount >= 5) {
        updatedNotifications = updatedNotifications.map((n, index) => 
          index >= 5 ? { ...n, isVisible: false } : n
        );
      }
      
      return updatedNotifications;
    });

    // ✅ CORRECTION: Auto-remove seulement le toast visible, pas la notification
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id); // Masquer le toast mais garder dans l'historique
      }, duration);
    }

    return id;
  }, [generateId, translations]);

  // ✅ NOUVEAU: Masquer le toast mais garder la notification dans l'historique
  const hideToast = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isVisible: false }
          : notification
      )
    );
  }, []);

  // Fonctions de raccourci améliorées
  const showSuccess = useCallback((message, options = {}) => {
    return showNotification('success', message, {
      title: options.title || translations?.successTitle || 'Succès',
      isTemporary: options.isTemporary || false,
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
      duration: options.duration || 8000,
      priority: options.priority || 'high',
      isTemporary: options.isTemporary || false,
      ...options
    });
  }, [showNotification, translations?.errorTitle]);

  const showWarning = useCallback((message, options = {}) => {
    return showNotification('warning', message, {
      title: options.title || translations?.warningTitle || 'Attention',
      duration: options.duration || 6000,
      isTemporary: options.isTemporary || false,
      ...options
    });
  }, [showNotification, translations?.warningTitle]);

  const showInfo = useCallback((message, options = {}) => {
    return showNotification('info', message, {
      title: options.title || translations?.infoTitle || 'Information',
      isTemporary: options.isTemporary || false,
      ...options
    });
  }, [showNotification, translations?.infoTitle]);

  // ✅ CORRECTION: Notifications système persistantes par défaut
  const showSystemNotification = useCallback((message, options = {}) => {
    return showNotification('info', message, {
      title: options.title || translations?.systemTitle || 'Système',
      category: 'system',
      priority: 'high',
      persistent: false,
      isTemporary: false, // ✅ Les notifications système sont sauvegardées
      duration: options.duration || 6000,
      ...options
    });
  }, [showNotification, translations?.systemTitle]);

  // ✅ CORRECTION: Session expirée comme notification critique persistante
  const showSessionExpired = useCallback(() => {
    return showError(
      translations?.sessionExpiredMessage || "Votre session a expiré. Veuillez vous reconnecter.",
      {
        title: translations?.sessionExpiredTitle || "Session expirée",
        duration: 0, // Persistant dans le toast
        priority: 'critical',
        category: 'security',
        isTemporary: false, // ✅ Garder dans l'historique
        canDismiss: true // ✅ Permettre de masquer le toast
      }
    );
  }, [showError, translations]);

  // ✅ CORRECTION: Masquer une notification (toast) mais la garder dans l'historique
  const dismissNotification = useCallback((id) => {
    console.log('👋 [NOTIFICATION_CONTEXT] Masquage du toast:', id);
    hideToast(id);
  }, [hideToast]);

  // ✅ NOUVEAU: Supprimer définitivement une notification de l'historique
  const deleteNotification = useCallback((id) => {
    console.log('🗑️ [NOTIFICATION_CONTEXT] Suppression définitive:', id);
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAsRead = useCallback((id, isRead = true) => {
    console.log('👁️ [NOTIFICATION_CONTEXT] Marquage comme lu:', id, isRead);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead }
          : notification
      )
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    console.log('🧹 [NOTIFICATION_CONTEXT] Nettoyage de toutes les notifications');
    setNotifications([]);
    NotificationStorage.clear();
  }, []);

  const clearByCategory = useCallback((category) => {
    console.log('🧹 [NOTIFICATION_CONTEXT] Nettoyage par catégorie:', category);
    setNotifications(prev => prev.filter(n => n.category !== category));
  }, []);

  // ✅ CORRECTION: Statistiques incluant toutes les notifications (pas seulement visibles)
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const visible = notifications.filter(n => n.isVisible).length;
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    const byCategory = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {});

    return { total, unread, visible, byType, byCategory };
  }, [notifications]);

  // ✅ NOUVEAU: Rendre une notification visible à nouveau (pour la réafficher)
  const showNotificationAgain = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isVisible: true }
          : notification
      )
    );
  }, []);

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
    dismissNotification, // ✅ Masque le toast mais garde dans l'historique
    deleteNotification, // ✅ NOUVEAU: Supprime définitivement
    markAsRead,
    clearAllNotifications,
    clearByCategory,
    showNotificationAgain, // ✅ NOUVEAU: Réafficher une notification
    
    // Données
    notifications, // ✅ Toutes les notifications (visibles et masquées)
    visibleNotifications: notifications.filter(n => n.isVisible), // ✅ NOUVEAU: Seulement les toasts visibles
    getNotificationStats,
    
    // Utils
    generateId
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* ✅ CORRECTION: Container ne montre que les notifications visibles */}
      <NotificationContainer 
        notifications={notifications.filter(n => n.isVisible)}
        onDismiss={dismissNotification}
        onMarkAsRead={markAsRead}
        theme={effectiveTheme}
      />
    </NotificationContext.Provider>
  );
};

// Composant conteneur pour gérer les positions (inchangé)
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
              isVisible={notification.isVisible}
              onClose={() => onDismiss(notification.id)}
              onAction={notification.onAction}
              actionText={notification.actionText}
              priority={notification.priority}
              category={notification.category}
              theme={theme}
              onMarkAsRead={() => onMarkAsRead(notification.id)}
              isRead={notification.isRead}
              canDismiss={notification.canDismiss}
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
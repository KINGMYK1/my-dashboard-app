import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import Toast from '../components/Toast/Toast';

// Créer le contexte
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { translations } = useLanguage();

  // Générer un ID unique pour chaque notification
  const generateId = useCallback(() => 
    `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`, []);

  // Ajouter une notification avec support des actions
  const showNotification = useCallback((type, message, title, duration = 5000, onAction = null, actionText = null) => {
    const id = generateId();
    
    const notification = {
      id,
      type,
      message,
      title: title || translations?.[`${type}Title`] || type,
      duration,
      onAction,
      actionText,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove après la durée spécifiée (sauf si durée = 0)
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, [generateId, translations]);

  // Fonctions de raccourci
  const showSuccess = useCallback((message, title = translations?.successTitle, duration) => {
    return showNotification('success', message, title, duration);
  }, [showNotification, translations?.successTitle]);

  const showError = useCallback((errorOrMessage, title = translations?.errorTitle, duration) => {
    let message = errorOrMessage;
    
    // Si c'est un objet d'erreur, extraire le message
    if (typeof errorOrMessage === 'object' && errorOrMessage !== null) {
      message = errorOrMessage.message || 
                errorOrMessage.data?.message || 
                'Une erreur est survenue';
    }
    
    return showNotification('error', message, title, duration);
  }, [showNotification, translations?.errorTitle]);

  const showWarning = useCallback((message, title = translations?.warningTitle, duration, onAction, actionText) => {
    return showNotification('warning', message, title, duration, onAction, actionText);
  }, [showNotification, translations?.warningTitle]);

  const showInfo = useCallback((message, title = translations?.infoTitle, duration) => {
    return showNotification('info', message, title, duration);
  }, [showNotification, translations?.infoTitle]);

  // Notification spécifique pour la session expirée
  const showSessionExpired = useCallback(() => {
    return showError(
      translations?.sessionExpiredMessage || "Votre session a expiré. Veuillez vous reconnecter.",
      translations?.sessionExpiredTitle || "Session expirée",
      10000 // 10 secondes
    );
  }, [showError, translations]);

  // Fermer une notification
  const closeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Valeur du contexte
  const contextValue = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSessionExpired,
    closeNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Container des notifications */}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            type={notification.type}
            message={notification.message}
            title={notification.title}
            duration={notification.duration}
            isVisible={true}
            onClose={() => closeNotification(notification.id)}
            onAction={notification.onAction}
            actionText={notification.actionText}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
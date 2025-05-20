import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast/Toast';
import { useLanguage } from './LanguageContext';

// Créer le contexte
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { translations } = useLanguage();

  // Générer un ID unique pour chaque notification
  const generateId = useCallback(() => `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`, []);

  // Ajouter une notification
  const showNotification = useCallback((type, message, title, duration = 5000) => {
    const id = generateId();
    
    setNotifications(prev => [
      ...prev,
      { id, type, message, title, duration }
    ]);
    
    return id;
  }, [generateId]);

  // Fonctions de raccourci
  const showSuccess = useCallback((message, title = translations?.successTitle, duration) => {
    return showNotification('success', message, title, duration);
  }, [showNotification, translations?.successTitle]);

  const showError = useCallback((message, title = translations?.errorTitle, duration) => {
    return showNotification('error', message, title, duration);
  }, [showNotification, translations?.errorTitle]);

  const showWarning = useCallback((message, title = translations?.warningTitle, duration) => {
    return showNotification('warning', message, title, duration);
  }, [showNotification, translations?.warningTitle]);

  const showInfo = useCallback((message, title = translations?.infoTitle, duration) => {
    return showNotification('info', message, title, duration);
  }, [showNotification, translations?.infoTitle]);

  const showSessionExpired = useCallback(() => {
    return showError(
      translations?.sessionExpiredMessage || 'Votre session a expiré. Veuillez vous reconnecter.',
      translations?.sessionExpiredTitle || 'Session expirée'
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
      {/* Render toasts */}
      <div className="notification-container">
        {notifications.map((notification, index) => (
          <Toast
            key={notification.id}
            type={notification.type}
            message={notification.message}
            title={notification.title}
            duration={notification.duration}
            isVisible={true}
            onClose={() => closeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook personnalisé
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
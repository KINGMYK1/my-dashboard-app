import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

export const useNotificationIntegration = () => {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSystemNotification
  } = useNotification();
  
  const { translations } = useLanguage();

  // Notifications pour les opérations CRUD
  const notifyCreate = (entity, name = '') => {
    showSuccess(
      `${entity} ${name ? `"${name}"` : ''} ${translations?.createdSuccessfully || 'créé avec succès'}`,
      {
        category: 'user',
        priority: 'normal',
        duration: 3000
      }
    );
  };

  const notifyUpdate = (entity, name = '') => {
    showSuccess(
      `${entity} ${name ? `"${name}"` : ''} ${translations?.updatedSuccessfully || 'modifié avec succès'}`,
      {
        category: 'user',
        priority: 'normal',
        duration: 3000
      }
    );
  };

  const notifyDelete = (entity, name = '') => {
    showSuccess(
      `${entity} ${name ? `"${name}"` : ''} ${translations?.deletedSuccessfully || 'supprimé avec succès'}`,
      {
        category: 'user',
        priority: 'normal',
        duration: 3000
      }
    );
  };

  const notifyError = (operation, entity, error) => {
    showError(
      `${translations?.errorDuring || 'Erreur lors de'} ${operation} ${translations?.of || 'de'} ${entity}: ${error.message || error}`,
      {
        category: 'system',
        priority: 'high',
        duration: 6000
      }
    );
  };

  // Notifications pour les opérations système
  const notifySystemOperation = (message, success = true) => {
    if (success) {
      showSystemNotification(message, {
        priority: 'normal',
        duration: 4000
      });
    } else {
      showError(message, {
        category: 'system',
        priority: 'high'
      });
    }
  };

  // Notifications pour les données
  const notifyDataOperation = (operation, success = true, details = '') => {
    const message = success 
      ? `${operation} ${translations?.completedSuccessfully || 'terminé avec succès'}${details ? `: ${details}` : ''}`
      : `${translations?.errorDuring || 'Erreur lors de'} ${operation}${details ? `: ${details}` : ''}`;
      
    if (success) {
      showInfo(message, {
        category: 'data',
        priority: 'normal',
        duration: 4000
      });
    } else {
      showError(message, {
        category: 'data',
        priority: 'high'
      });
    }
  };

  // Notifications de sécurité
  const notifySecurityEvent = (event, level = 'warning') => {
    const notifyFunc = level === 'critical' ? showError : level === 'high' ? showWarning : showInfo;
    
    notifyFunc(event, {
      category: 'security',
      priority: level === 'critical' ? 'critical' : level === 'high' ? 'high' : 'normal',
      duration: level === 'critical' ? 0 : 8000 // Persistant si critique
    });
  };

  return {
    // CRUD Operations
    notifyCreate,
    notifyUpdate,
    notifyDelete,
    notifyError,
    
    // System Operations
    notifySystemOperation,
    
    // Data Operations
    notifyDataOperation,
    
    // Security Events
    notifySecurityEvent,
    
    // Direct access to original functions
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSystemNotification
  };
};
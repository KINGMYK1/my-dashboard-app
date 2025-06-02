// d\Desktop\my-dashboard-app\src\components\SessionExpiryAlert\SessionExpiryAlert.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ AJOUT
import { useTheme } from '../../contexts/ThemeContext'; // ✅ AJOUT
import { formatTimeRemaining, getTimeUntilExpiry } from '../../utils/tokenUtils';
import { useNotification } from '../../contexts/NotificationContext';

const SessionExpiryAlert = () => {
  const { token, logout, sessionExpiresAt } = useAuth();
  const { showSessionExpired, showWarning } = useNotification(); // ✅ Utiliser le système de notifications
  const { translations } = useLanguage(); // ✅ AJOUT
  const { effectiveTheme } = useTheme(); // ✅ AJOUT
  const [timeLeft, setTimeLeft] = useState(0);
  const [isManuallyDismissed, setIsManuallyDismissed] = useState(false);
  const timerRef = useRef(null);

  // ✅ CORRECTION: Utiliser le système de notifications au lieu d'un composant séparé
  useEffect(() => {
    const handleSessionExpired = (event) => {
      console.log('Session expirée:', event.detail);
      // ✅ Créer une notification persistante
      showSessionExpired();
    };

    const handleSessionTerminated = (event) => {
      console.log('Session terminée détectée:', event.detail);
      // ✅ Créer une notification critique
      showWarning('Votre session a été terminée. Reconnectez-vous pour continuer.', {
        title: 'Session terminée',
        priority: 'critical',
        category: 'security',
        duration: 0, // Persistant
        isTemporary: false
      });
    };

    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    window.addEventListener('auth:sessionTerminated', handleSessionTerminated);

    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
      window.removeEventListener('auth:sessionTerminated', handleSessionTerminated);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showSessionExpired, showWarning]);

  useEffect(() => {
    if (token && !isManuallyDismissed) {
      const updateTimeLeft = () => {
        const remaining = getTimeUntilExpiry(token);
        setTimeLeft(remaining);
        
        // ✅ Avertissement à 3 minutes
        const threeMinutes = 3 * 60 * 1000;
        if (remaining > 0 && remaining <= threeMinutes && remaining > 2 * 60 * 1000) {
          showWarning(`Votre session expire dans ${formatTimeRemaining(remaining)}`, {
            title: 'Session expire bientôt',
            priority: 'high',
            category: 'security',
            duration: 8000,
            isTemporary: false // ✅ Garder dans l'historique
          });
        }
        
        if (remaining <= 0) {
          clearInterval(timerRef.current);
        }
      };
      
      updateTimeLeft();
      timerRef.current = setInterval(updateTimeLeft, 30000); // Vérifier toutes les 30 secondes
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [token, isManuallyDismissed, showWarning]);

  // ✅ Plus besoin de composant visuel - tout est géré par les notifications
  return null;
};

export default SessionExpiryAlert;
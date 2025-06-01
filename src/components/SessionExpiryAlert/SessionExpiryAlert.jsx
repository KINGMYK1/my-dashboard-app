// d\Desktop\my-dashboard-app\src\components\SessionExpiryAlert\SessionExpiryAlert.jsx
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, LogOut, WifiOff, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ AJOUT
import { useTheme } from '../../contexts/ThemeContext'; // ✅ AJOUT
import { formatTimeRemaining, getTimeUntilExpiry } from '../../utils/tokenUtils';

const SessionExpiryAlert = () => {
  const { token, logout, sessionExpiresAt } = useAuth();
  const { translations } = useLanguage(); // ✅ AJOUT
  const { effectiveTheme } = useTheme(); // ✅ AJOUT
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [sessionTerminated, setSessionTerminated] = useState(false);
  const [isManuallyDismissed, setIsManuallyDismissed] = useState(false); // ✅ AJOUT
  const timerRef = useRef(null);

  // ✅ AJOUT: Support des thèmes
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ AJOUT: Traductions par défaut
  const safeTranslations = {
    sessionExpiringSoon: 'Session expire bientôt',
    sessionExpiryWarning: 'Votre session expire dans',
    sessionExpiredTitle: 'Session expirée',
    sessionExpiredMessage: 'Votre session a été terminée. Vous allez être redirigé vers la page de connexion.',
    loginAgain: 'Se reconnecter',
    dismiss: 'Masquer',
    logout: 'Se déconnecter',
    sessionTerminatedTitle: 'Session terminée',
    close: 'Fermer',
    ...translations
  };

  useEffect(() => {
    // Écouter l'événement d'expiration de session
    const handleSessionExpired = (event) => {
      console.log('Session expirée:', event.detail);
      setShowAlert(false);
    };

    // Écouter l'événement de session terminée
    const handleSessionTerminated = (event) => {
      console.log('Session terminée détectée:', event.detail);
      setSessionTerminated(true);
      setShowAlert(false);
      
      // Masquer l'alerte après quelques secondes
      setTimeout(() => {
        setSessionTerminated(false);
      }, 5000);
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
  }, []);

  useEffect(() => {
    if (token && !isManuallyDismissed) { // ✅ AJOUT: Respecter le dismiss manuel
      // Calculer le temps restant
      const updateTimeLeft = () => {
        const remaining = getTimeUntilExpiry(token);
        setTimeLeft(remaining);
        
        // ✅ CORRECTION: Afficher l'alerte si moins de 3 minutes restantes
        const threeMinutes = 3 * 60 * 1000;
        setShowAlert(remaining > 0 && remaining <= threeMinutes);
        
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setShowAlert(false);
        }
      };
      
      // Mise à jour initiale
      updateTimeLeft();
      
      // Mettre à jour chaque seconde
      timerRef.current = setInterval(updateTimeLeft, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setShowAlert(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [token, isManuallyDismissed]); // ✅ AJOUT: Dépendance isManuallyDismissed

  const handleLogout = () => {
    logout('EXPLICIT');
  };

  // ✅ AJOUT: Fonction pour masquer manuellement
  const handleDismiss = () => {
    setIsManuallyDismissed(true);
    setShowAlert(false);
  };

  // ✅ AMÉLIORATION: Alerte de session terminée avec thème
  if (sessionTerminated) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 w-96 border rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 ${
        isDarkMode 
          ? 'bg-red-800 border-red-600' 
          : 'bg-red-100 border-red-300'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <WifiOff className={`mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} size={20} />
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-red-800'}`}>
                {safeTranslations.sessionTerminatedTitle}
              </h3>
            </div>
            <button
              onClick={() => setSessionTerminated(false)}
              className={`p-1 rounded transition-colors ${
                isDarkMode ? 'text-red-400 hover:text-red-200' : 'text-red-600 hover:text-red-800'
              }`}
            >
              <X size={16} />
            </button>
          </div>
          
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
            {safeTranslations.sessionExpiredMessage}
          </p>
          
          <div className="flex justify-end">
            <button
              onClick={() => setSessionTerminated(false)}
              className={`px-4 py-2 rounded-md transition-colors text-sm ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {safeTranslations.close}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ AMÉLIORATION: Alerte d'expiration normale avec thème
  if (!showAlert) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-96 border rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 ${
      isDarkMode 
        ? 'bg-gray-800 border-amber-500' 
        : 'bg-white border-amber-400'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <AlertTriangle className="text-amber-400 mr-2" size={20} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {safeTranslations.sessionExpiringSoon}
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className={`p-1 rounded transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex items-center mb-3">
          <Clock className="text-amber-400 mr-2" size={16} />
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {safeTranslations.sessionExpiryWarning}{' '}
            <span className="font-bold text-amber-400">
              {formatTimeRemaining(timeLeft)}
            </span>
          </p>
        </div>
        
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Vous devrez vous reconnecter pour continuer à utiliser l'application.
        </p>
        
        <div className="flex justify-between">
          <button
            onClick={handleDismiss}
            className={`px-4 py-2 rounded-md transition-colors text-sm ${
              isDarkMode 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {safeTranslations.dismiss}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors text-sm"
          >
            <LogOut size={16} className="mr-2" />
            {safeTranslations.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryAlert;
// d\Desktop\my-dashboard-app\src\components\SessionExpiryAlert\SessionExpiryAlert.jsx
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, LogOut, WifiOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatTimeRemaining, getTimeUntilExpiry } from '../../utils/tokenUtils';

const SessionExpiryAlert = () => {
  const { token, logout, sessionExpiresAt } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [sessionTerminated, setSessionTerminated] = useState(false);
  const timerRef = useRef(null);

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
    if (token) {
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
  }, [token]);

  const handleLogout = () => {
    logout('EXPLICIT');
  };

  // Alerte de session terminée
  if (sessionTerminated) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-96 bg-red-800 border border-red-600 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <WifiOff className="text-red-400 mr-2" size={20} />
            <h3 className="text-white font-semibold">Session terminée</h3>
          </div>
          
          <p className="text-red-200 text-sm mb-3">
            Votre session a été terminée. Vous allez être redirigé vers la page de connexion.
          </p>
          
          <div className="flex justify-end">
            <button
              onClick={() => setSessionTerminated(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Alerte d'expiration normale
  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-gray-800 border border-amber-500 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <AlertTriangle className="text-amber-400 mr-2" size={20} />
          <h3 className="text-white font-semibold">Session expirante</h3>
        </div>
        
        <div className="flex items-center mb-3">
          <Clock className="text-amber-400 mr-2" size={16} />
          <p className="text-gray-300 text-sm">
            Votre session expire dans{' '}
            <span className="font-bold text-amber-400">
              {formatTimeRemaining(timeLeft)}
            </span>
          </p>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">
          Vous devrez vous reconnecter pour continuer à utiliser l'application.
        </p>
        
        <div className="flex justify-between">
          <button
            onClick={() => setShowAlert(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm"
          >
            Masquer
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors text-sm"
          >
            <LogOut size={16} className="mr-2" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryAlert;
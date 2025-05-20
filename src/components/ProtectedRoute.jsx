import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import SplashScreen from './SplashScreen/SplashScreen';
import { isTokenExpired } from '../utils/tokenUtils';

const ProtectedRoute = ({ children }) => {
  const { user, loading, initialAuthCheckComplete } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const { showSessionExpired } = useNotification();
  
  // État local pour contrôler les transitions
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  // Vérification de l'expiration du token et autres conditions
  useEffect(() => {
    if (initialAuthCheckComplete && !loading) {
      // Délai minimal pour éviter les flashs
      const timer = setTimeout(() => {
        if (token && isTokenExpired(token)) {
          // Nettoyer les données d'authentification
          localStorage.removeItem('jwtToken');
          
          // Afficher la notification
          showSessionExpired();
          
          // Rediriger vers la page de connexion
          navigate('/', { replace: true });
        } else {
          // Token valide ou pas de token, indiquer que la vérification est terminée
          setVerificationComplete(true);
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, token, showSessionExpired, initialAuthCheckComplete, loading]);

  // Si l'une quelconque des vérifications est en cours, afficher le splash screen
  if (!initialAuthCheckComplete || loading || !verificationComplete) {
    return <SplashScreen />;
  }

  // Si le token est expiré ou l'utilisateur n'est pas connecté, rediriger
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est connecté et toutes les vérifications sont terminées, afficher le contenu
  return children;
};

export default ProtectedRoute;

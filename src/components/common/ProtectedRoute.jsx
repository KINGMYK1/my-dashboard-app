import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SplashScreen from '../SplashScreen/SplashScreen';
import { isTokenExpired } from '../../utils/tokenUtils';

const ProtectedRoute = ({ children, require2FACompleted = true }) => {
  const { 
    user, 
    token, 
    loadingInitial, 
    initialAuthCheckComplete, 
    twoFactorRequired,
    tempAuthData
  } = useAuth();
  
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Gérer le chargement initial
  useEffect(() => {
    if (initialAuthCheckComplete && !loadingInitial) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300); // Petit délai pour éviter les flashs
      
      return () => clearTimeout(timer);
    }
  }, [initialAuthCheckComplete, loadingInitial]);

  // Pendant le chargement initial, montrer le SplashScreen
  if (loadingInitial || !initialAuthCheckComplete || isLoading) {
    return <SplashScreen maxDuration={3000} />;
 

  // Si trop de tentatives de redirection, afficher le contenu directement pour éviter les boucles
 
  }

  // Cas spécial pour la page d'accueil - permettre l'accès direct même si authentifié
  if (location.pathname === "/" && location.state?.fromManualNavigation) {
    return children;
  }

  // Vérifications d'authentification
  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Session expirée
  if (location.pathname !== '/verify-2fa' && isTokenExpired(token)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Logique pour la page 2FA
  if (location.pathname === '/verify-2fa') {
    if (!twoFactorRequired) {
      return <Navigate to="/dashboard" replace />;
    }
    
    if (!tempAuthData?.token) {
      return <Navigate to="/" replace />;
    }
  }

  // Si 2FA est requis pour les autres pages
  if (twoFactorRequired && location.pathname !== '/verify-2fa') {
    return <Navigate to="/verify-2fa" replace />;
  }

  // Si on exige une authentification complète et qu'on n'a pas d'utilisateur
  if (require2FACompleted && !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Tout va bien, afficher le contenu
  return children;
};

export default ProtectedRoute;
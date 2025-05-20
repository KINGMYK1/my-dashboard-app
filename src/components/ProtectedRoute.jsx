import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from './SplashScreen/SplashScreen';

const ProtectedRoute = ({ children }) => {
  const { user, loading, initialAuthCheckComplete, isInternalNavigation } = useAuth();

  // Pendant le chargement initial (pas les navigations internes), afficher l'écran de chargement
  if (loading && !isInternalNavigation) {
    return <SplashScreen />;
  }

  // Attendre que la vérification d'authentification initiale soit terminée 
  // avant de prendre une décision de redirection
  if (!initialAuthCheckComplete) {
    return <SplashScreen />;
  }

  // Après la vérification, si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est connecté, afficher le contenu de la route
  return children;
};

export default ProtectedRoute;
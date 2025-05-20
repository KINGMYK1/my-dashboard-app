import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import LoginPage from './components/Login/Login';
import TwoFactorPage from './components/TwoFactorPage/TwoFactorPage';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import SplashScreen from './components/SplashScreen/SplashScreen';
import './index.css';

// Nouveau composant racine qui gère l'état de chargement initial
function AppRoot() {
  // État pour suivre si l'application est prête à être rendue
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simuler un délai pour assurer le chargement des ressources
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1000); // Donne au moins 1 seconde de chargement pour éviter les clignotements

    return () => clearTimeout(timer);
  }, []);

  // Si l'application n'est pas encore prête, afficher l'écran de chargement
  if (!isAppReady) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Séparation des routes dans un composant distinct
function AppRoutes() {
  return (
    <Routes>
      {/* Route pour la page de connexion à la racine */}
      <Route path="/" element={<LoginPage />} />
      
      {/* Route pour la vérification 2FA */}
      <Route path="/verify-2fa" element={<TwoFactorPage />} />

      {/* Route protégée pour le dashboard et ses sous-routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Redirection pour les routes non définies */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Exporter le composant racine au lieu de App
export default AppRoot;

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/Login/Login';
import TwoFactorPage from './components/TwoFactorPage/TwoFactorPage';
import SplashScreen from './components/SplashScreen/SplashScreen';
import TransitionPage from './components/TransitionPage/TransitionPage';

import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { initializeSessionNotification } from './api/apiService';
import './index.css';

// Composant intermédiaire pour initialiser les notifications
const NotificationInitializer = ({ children }) => {
  const { showSessionExpired } = useNotification();
  
  useEffect(() => {
    // Initialiser la fonction de notification dans apiService
    initializeSessionNotification(showSessionExpired);
  }, [showSessionExpired]);
  
  return <>{children}</>;
};

// Wrapper pour le contrôle de rendu initial
const AuthStateManager = ({ children }) => {
  // Contrôle si l'application est prête à être rendue
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Donner le temps aux contextes de s'initialiser
    // Cela empêche les flashs lors du chargement initial
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 700);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Afficher un splash screen jusqu'à ce que tout soit initialisé
  if (!appReady) {
    return <SplashScreen />;
  }
  
  return children;
};

// Composant racine de l'application
function App() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDestination, setTransitionDestination] = useState('');

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };

  return (
    <BrowserRouter>
      <LanguageProvider>
        <NotificationProvider>
          <NotificationInitializer>
            <AuthProvider>
              <AuthStateManager>
                {/* Afficher TransitionPage si en transition, sinon les routes normales */}
                {isTransitioning ? (
                  <TransitionPage 
                    onTransitionComplete={handleTransitionComplete}
                    destination={transitionDestination}
                  />
                ) : (
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
                )}
              </AuthStateManager>
            </AuthProvider>
          </NotificationInitializer>
        </NotificationProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './components/Login/Login';
import TwoFactorPage from './components/TwoFactorPage/TwoFactorPage';
import Dashboard from './components/Dashboard/Dashboard';
import SplashScreen from './components/SplashScreen/SplashScreen';
import SessionExpiryAlert from './components/SessionExpiryAlert/SessionExpiryAlert';

// Créer un client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      cacheTime: 300000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Composant pour gérer les événements de session expirée
const SessionManager = ({ children }) => {
  const [sessionExpired, setSessionExpired] = useState(false);
  
  useEffect(() => {
    const handleSessionExpiry = () => {
      setSessionExpired(true);
      setTimeout(() => setSessionExpired(false), 5000);
    };

    window.addEventListener('auth:sessionExpired', handleSessionExpiry);
    
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpiry);
    };
  }, []);

  return (
    <>
      {children}
      <SessionExpiryAlert />
      {sessionExpired && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <p className="font-semibold">Session expirée</p>
          <p className="text-sm">Vous allez être redirigé vers la page de connexion...</p>
        </div>
      )}
    </>
  );
};

// AuthStateManager simplifié
const AuthStateManager = ({ children }) => {
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Délai minimum pour éviter les flashs
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!appReady) {
    return <SplashScreen maxDuration={2000} />;
  }
  
  return <>{children}</>;
};

// Composant racine de l'application
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <AuthProvider>
                <SessionManager>
                  <AuthStateManager>
                    <Routes>
                      {/* Route publique - Login */}
                      <Route path="/" element={<LoginPage />} />
                      
                      {/* Route 2FA */}
                      {/* <Route 
                        path="/verify-2fa" 
                        element={
                          <ProtectedRoute require2FACompleted={false}>
                            <TwoFactorPage />
                          </ProtectedRoute>
                        }
                      /> */}
                            <Route path="/verify-2fa" element={<TwoFactorPage />} />

                      {/* Routes protégées - Dashboard */}
                      <Route 
                        path="/dashboard/*" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Redirection pour les routes non trouvées */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AuthStateManager>
                </SessionManager>
              </AuthProvider>
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

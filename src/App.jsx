import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { MonitoringProvider } from './contexts/MonitoringContext'; // ✅ AJOUT

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './components/Login/Login';
import TwoFactorPage from './components/TwoFactorPage/TwoFactorPage';
import Dashboard from './components/Dashboard/Dashboard';
import SplashScreen from './components/SplashScreen/SplashScreen';
import SessionExpiryAlert from './components/SessionExpiryAlert/SessionExpiryAlert';
import Monitoring from './pages/Monitoring/Monitoring';

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

// ✅ CORRECTION: Composant pour gérer les événements de session expirée
const SessionManager = ({ children }) => {
  const [sessionExpired, setSessionExpired] = useState(false);
  
  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpired(true);
      setTimeout(() => setSessionExpired(false), 5000);
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('sessionExpired', handleSessionExpired);
  }, []);

  return (
    <>
      {children}
      {/* ✅ DÉPLACER SessionExpiryAlert DANS AuthProvider */}
      {sessionExpired && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <p className="font-semibold">Session expirée</p>
          <p className="text-sm">Vous allez être redirigé vers la page de connexion...</p>
          <button 
            onClick={() => setSessionExpired(false)}
            className="mt-2 bg-red-800 hover:bg-red-900 px-3 py-1 rounded text-sm"
          >
            Masquer
          </button>
        </div>
      )}
    </>
  );
};

// AuthStateManager simplifié
const AuthStateManager = ({ children }) => {
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 700);
    
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
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <NotificationProvider>
              <SessionManager>
                <AuthProvider>
                                <MonitoringProvider> {/* ✅ AJOUT: Wrapper MonitoringProvider */}

                  <AuthStateManager>
                    {/* ✅ SessionExpiryAlert maintenant dans AuthProvider */}
                    <SessionExpiryAlert />
                    <Routes>
                      <Route path="/" element={<LoginPage />} />
                      <Route path="/verify-2fa" element={<TwoFactorPage />} />
                      <Route path="/dashboard/*" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AuthStateManager>
                             </MonitoringProvider> 

                </AuthProvider>

              </SessionManager>
            </NotificationProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

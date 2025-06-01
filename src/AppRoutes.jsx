import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Import synchrone de la page principale et des pages fréquemment utilisées
import HomePage from './pages/Home/Home';
import UsersPage from './pages/Users/Users';
import MonitoringPage from './pages/Monitoring/Monitoring';

// ✅ CORRECTION: Import des pages manquantes (lazy loading)
const SettingsPage = lazy(() => import('./pages/Settings/Settings'));
const PostesPage = lazy(() => import('./pages/Postes/Postes'));
const RolesPage = lazy(() => import('./pages/Roles/Roles'));
const PermissionsPage = lazy(() => import('./pages/Permissions/Permissions'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));

// Préchargez les modules de manière progressive
const preloadRoutes = () => {
  const timeout = setTimeout(() => {
    // Préchargement des routes moins utilisées
    import('./pages/Settings/Settings');
  }, 300);
  
  return () => clearTimeout(timeout);
};

// Composant de chargement invisible - aucun flash
const InvisibleLoader = () => null;

// Ce composant définit les routes internes au Dashboard
const AppRoutes = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  
  // Préchargement des routes au montage initial
  useEffect(() => {
    return preloadRoutes();
  }, []);

  return (
    <Suspense fallback={<InvisibleLoader />}>
      <Routes>
        {/* Route racine - correspond à /dashboard dans l'URL du navigateur */}
        <Route path="/" element={<HomePage />} />
        
        {/* Routes pour les postes gaming */}
        <Route path="/postes" element={
          hasPermission('POSTES_VIEW') 
            ? <PostesPage /> 
            : <Navigate to="/" replace />
        } />
        
        {/* Monitoring - pour les admins ou permission spécifique */}
        <Route path="/monitoring" element={
          (hasPermission('MONITORING_VIEW') || hasPermission('ADMIN'))
            ? <MonitoringPage />
            : <Navigate to="/" replace />
        } />
        
        {/* Routes pour l'administration système */}
        <Route path="/users" element={
          hasPermission('USERS_VIEW') 
            ? <UsersPage /> 
            : <Navigate to="/" replace />
        } />
        
        <Route path="/roles" element={
          hasPermission('ROLES_VIEW')
            ? <RolesPage /> 
            : <Navigate to="/" replace />
        } />
        
        <Route path="/permissions" element={
          hasPermission('PERMISSIONS_VIEW')
            ? <PermissionsPage /> 
            : <Navigate to="/" replace />
        } />
        
        {/* Page de notifications accessible à tous les utilisateurs connectés */}
        <Route path="/notifications" element={<Notifications />} />
        
        {/* Paramètres - accessible à tous */}
        <Route path="/settings" element={<SettingsPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
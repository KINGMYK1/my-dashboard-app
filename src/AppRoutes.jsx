import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Import des composants de pages avec lazy loading pour optimiser les performances
const Home = React.lazy(() => import('./pages/Home/Home'));
const PostesPage = React.lazy(() => import('./pages/Postes/Postes'));
const TypesPostesPage = React.lazy(() => import('./pages/Postes/TypesPostes'));
const SessionsPage = React.lazy(() => import('./pages/Sessions/Sessions'));
const TransactionsPage = React.lazy(() => import('./pages/Transactions/TransactionsPage'));
const ClientsPage = React.lazy(() => import('./pages/Clients/Clients'));
const AbonnementsPage = React.lazy(() => import('./pages/Abonnements/Abonnements'));
const TypesAbonnementsPage = React.lazy(() => import('./pages/TypesAbonnements/TypesAbonnements'));
const MonitoringPage = React.lazy(() => import('./pages/Monitoring/Monitoring'));
const StatistiquesPage = React.lazy(() => import('./pages/Statistiques/Statistiques'));
const DashboardPostesPage = React.lazy(() => import('./pages/Statistiques/DashboardPostes'));
const StatistiquesPostesPage = React.lazy(() => import('./pages/Statistiques/StatistiquesPostes'));
const StatistiquesTransactionsPage = React.lazy(() => import('./pages/Statistiques/StatistiquesTransactions'));
const HistoriqueSessionsPage = React.lazy(() => import('./pages/Statistiques/HistoriqueSessions'));
const ChiffreAffairesPage = React.lazy(() => import('./pages/Statistiques/ChiffreAffaires'));
const InventairePage = React.lazy(() => import('./pages/Inventaire/Inventaire'));
const UsersPage = React.lazy(() => import('./pages/Users/Users'));
const RolesPage = React.lazy(() => import('./pages/Roles/Roles'));
const PermissionsPage = React.lazy(() => import('./pages/Permissions/Permissions'));
const EvenementsPage = React.lazy(() => import('./pages/Evenements/Evenements'));
const NotificationsPage = React.lazy(() => import('./pages/Notifications/Notifications'));
const SettingsPage = React.lazy(() => import('./pages/Settings/Settings'));

// Fonction pour précharger certaines routes importantes
const preloadRoutes = () => {
  // Précharger les pages les plus utilisées
  import('./pages/Sessions/Sessions');
  import('./pages/Postes/Postes');
  import('./pages/Transactions/TransactionsPage');
};

// Composant de chargement invisible pour éviter les flash
const InvisibleLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

// Ce composant définit les routes internes au Dashboard
const AppRoutes = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();
  
  // Préchargement des routes au montage initial
  useEffect(() => {
    preloadRoutes();
  }, []);

  // Forcer le remontage des composants lors des changements de route
  const routeKey = location.pathname + location.search;

  // Log pour debug de navigation
  useEffect(() => {
    console.log('🧭 [ROUTES] Navigation vers:', location.pathname);
  }, [location.pathname]);

  return (
    <Suspense fallback={<InvisibleLoader />}>
      <Routes key={routeKey}>
        {/* Route racine - correspond à /dashboard dans l'URL du navigateur */}
        <Route path="/" element={<Home />} />
        
        {/* Routes pour les postes gaming */}
        <Route path="postes" element={
          hasPermission('POSTES_VIEW') 
            ? <PostesPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        <Route path="postes/types" element={
          hasPermission('POSTES_MANAGE') 
            ? <TypesPostesPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        {/* Monitoring - pour les admins ou permission spécifique */}
        <Route path="monitoring" element={
          (hasPermission('MONITORING_VIEW') || hasPermission('ADMIN'))
            ? <MonitoringPage />
            : <Navigate to="/dashboard" replace />
        } />
        
        {/* Routes pour l'administration système */}
        <Route path="users" element={
          hasPermission('USERS_VIEW') 
            ? <UsersPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        <Route path="roles" element={
          hasPermission('ROLES_VIEW')
            ? <RolesPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        <Route path="permissions" element={
          hasPermission('PERMISSIONS_VIEW')
            ? <PermissionsPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        <Route path="sessions" element={
          hasPermission('SESSIONS_VIEW')
            ? <SessionsPage />
            : <Navigate to="/dashboard" replace />
        } />
        
        {/* Gaming Center - Clients */}
        <Route path="clients" element={
          hasPermission('CLIENTS_VIEW')
            ? <ClientsPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        {/* Gaming Center - Abonnements */}
        <Route path="types-abonnements" element={
          hasPermission('ABONNEMENTS_MANAGE')
            ? <TypesAbonnementsPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        <Route path="abonnements" element={
          hasPermission('ABONNEMENTS_VIEW')
            ? <AbonnementsPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        {/* Autres pages business */}
        <Route path="inventaire" element={
          hasPermission('INVENTORY_VIEW')
            ? <InventairePage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        <Route path="evenements" element={
          hasPermission('EVENTS_VIEW')
            ? <EvenementsPage /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        {/* Route pour les transactions */}
        <Route path="transactions" element={
          hasPermission('TRANSACTIONS_VIEW') || hasPermission('SESSIONS_VIEW')
            ? <TransactionsPage /> 
            : <Navigate to="/dashboard" replace />
        } />

        {/* Page de notifications accessible à tous les utilisateurs connectés */}
        <Route path="notifications" element={<NotificationsPage />} />
        
        {/* Paramètres - accessible à tous */}
        <Route path="settings" element={<SettingsPage />} />
        
        {/* Routes pour les statistiques - accessible avec la permission SESSIONS_VIEW */}
        <Route 
          path="statistiques/*" 
          element={
            hasPermission('SESSIONS_VIEW') ? (
              <Routes>
                <Route index element={
                  <Suspense fallback={<InvisibleLoader />}>
                    <StatistiquesPage />
                  </Suspense>
                } />
                <Route path="dashboard-postes" element={
                  <Suspense fallback={<InvisibleLoader />}>
                    <DashboardPostesPage />
                  </Suspense>
                } />
                <Route path="postes" element={
                  <Suspense fallback={<InvisibleLoader />}>
                    <StatistiquesPostesPage />
                  </Suspense>
                } />
                <Route path="transactions" element={
                  <Suspense fallback={<InvisibleLoader />}>
                    <StatistiquesTransactionsPage />
                  </Suspense>
                } />
                <Route path="historique-sessions" element={
                  <Suspense fallback={<InvisibleLoader />}>
                    <HistoriqueSessionsPage />
                  </Suspense>
                } />
                <Route path="chiffre-affaires" element={
                  <Suspense fallback={<InvisibleLoader />}>
                    <ChiffreAffairesPage />
                  </Suspense>
                } />
              </Routes>
            ) : <Navigate to="/dashboard" replace />
          } 
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
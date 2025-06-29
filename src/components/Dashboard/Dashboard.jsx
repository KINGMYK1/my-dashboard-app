import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';

// ✅ Pages principales
import Home from '../../pages/Home/Home';
import Users from '../../pages/Users/Users';
import Roles from '../../pages/Roles/Roles';
import Permissions from '../../pages/Permissions/Permissions';
import Postes from '../../pages/Postes/Postes';
import TypesPostes from '../../pages/Postes/TypesPostes';
import Monitoring from '../../pages/Monitoring/Monitoring';
import Settings from '../../pages/Settings/Settings';
import Notifications from '../../pages/Notifications/Notifications';

// ✅ Gaming Center
import Clients from '../../pages/Clients/Clients';
import Sessions from '../../pages/Sessions/Sessions';
import TypesAbonnements from '../../pages/TypesAbonnements/TypesAbonnements';
import Abonnements from '../../pages/Abonnements/Abonnements';

// ✅ CORRECTION: Pages Statistiques avec les bons chemins
import StatistiquesPage from '../../pages/Statistiques/Statistiques';
import DashboardPostes from '../../pages/Statistiques/DashboardPostes';
import StatistiquesTransactions from '../../pages/Statistiques/StatistiquesTransactions';
import HistoriqueSessions from '../../pages/Sessions/HistoriqueSessions';

// ✅ Autres pages
import Ventes from '../../pages/Ventes/Ventes';
import Inventaire from '../../pages/Inventaire/Inventaire';
import Evenements from '../../pages/Evenements/Evenements';

const Dashboard = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, hasPermission } = useAuth();
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarExpanded(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const isDarkMode = effectiveTheme === 'dark';
  
  // Styles dynamiques
  const dashboardBackground = isDarkMode
    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div 
      className="flex flex-col h-screen relative overflow-hidden transition-all duration-500"
      style={{
        background: dashboardBackground,
        minHeight: '100vh'
      }}
    >
      <Header 
        toggleSidebar={toggleSidebar}
        sidebarExpanded={sidebarExpanded}
        isMobile={isMobile}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar
          expanded={sidebarExpanded}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        <main className="flex-1 overflow-auto p-7 transition-all duration-500">
          <div className="w-full h-full">
            <Routes>
              {/* ✅ CORRECTION: Route par défaut vers Home */}
              <Route path="/" element={<Home />} />
              
              {/* ✅ Pages principales */}
              <Route path="/users" element={
                hasPermission('USERS_VIEW') ? <Users /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/roles" element={
                hasPermission('ROLES_VIEW') ? <Roles /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/permissions" element={
                hasPermission('PERMISSIONS_VIEW') ? <Permissions /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* ✅ Postes */}
              <Route path="/postes" element={
                hasPermission('POSTES_VIEW') ? <Postes /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/postes/types" element={
                hasPermission('POSTES_MANAGE') ? <TypesPostes /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* ✅ Gaming Center */}
              <Route path="/clients" element={
                hasPermission('CLIENTS_VIEW') ? <Clients /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/sessions" element={
                hasPermission('SESSIONS_VIEW') ? <Sessions /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/types-abonnements" element={
                hasPermission('ABONNEMENTS_MANAGE') ? <TypesAbonnements /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/abonnements" element={
                hasPermission('ABONNEMENTS_VIEW') ? <Abonnements /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* ✅ CORRECTION: Routes Statistiques avec les bons chemins */}
              <Route path="/statistiques" element={
                hasPermission('SESSIONS_VIEW') ? <StatistiquesPage /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/dashboard-postes" element={
                hasPermission('SESSIONS_VIEW') ? <DashboardPostes /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/statistiques-transactions" element={
                hasPermission('SESSIONS_VIEW') ? <StatistiquesTransactions /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/historique-sessions" element={
                hasPermission('SESSIONS_VIEW') ? <HistoriqueSessions /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* ✅ Autres pages */}
              <Route path="/ventes" element={
                hasPermission('SALES_VIEW') ? <Ventes /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/inventaire" element={
                hasPermission('INVENTORY_VIEW') ? <Inventaire /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/evenements" element={
                hasPermission('EVENTS_VIEW') ? <Evenements /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/monitoring" element={
                hasPermission('MONITORING_VIEW') ? <Monitoring /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';

// Pages du dashboard
import Home from '../../pages/Home/Home';
import Users from '../../pages/Users/Users';
import Roles from '../../pages/Roles/Roles';
import Permissions from '../../pages/Permissions/Permissions';
import Postes from '../../pages/Postes/Postes';
import TypesPostes from '../../pages/Postes/TypesPostes'; // ✅ AJOUT
import Settings from '../../pages/Settings/Settings';
import Monitoring from '../../pages/Monitoring/Monitoring';
import Notifications from '../../pages/Notifications/Notifications';

const Dashboard = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, hasPermission } = useAuth();
  const { effectiveTheme } = useTheme(); // Utiliser effectiveTheme

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

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Debug des permissions
  useEffect(() => {
    if (user) {
      console.log('👤 Dashboard - Utilisateur:', {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name,
        permissions: user.role?.permissions?.map(p => p.name || p) // ✅ Gestion des deux formats
      });
    }
  }, [user]);

  // Détection du mode sombre/clair basé sur effectiveTheme
  const isDarkMode = effectiveTheme === 'dark';

  console.log('🎨 [DASHBOARD] Debug thème:', {
    effectiveTheme,
    isDarkMode,
    themeType: typeof effectiveTheme
  });

  // Styles dynamiques harmonisés pour le fond du dashboard
  const dashboardBackground = isDarkMode
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)'
    : 'linear-gradient(135deg, #e0f2f7 0%, #e0f7fa 25%, #e0f9fd 50%, #e0faff 75%, #e0faff 100%)'; // Couleurs plus douces pour le thème clair

  // Le fond du main content sera transparent, les pages géreront leur propre fond
  const mainContentBg = 'transparent'; 
  const mainContentBackdropFilter = 'none'; 

  // Styles pour les éléments décoratifs adaptés au thème
  const decorativeElementsOpacity = isDarkMode ? 0.05 : 0.03;
  const gridOpacity = isDarkMode ? 0.05 : 0.02;

  return (
    <div 
      className="flex flex-col h-screen relative overflow-hidden transition-all duration-500"
      style={{
        background: dashboardBackground,
        minHeight: '100vh'
      }}
    >
      {/* Éléments décoratifs adaptés au thème */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: decorativeElementsOpacity,
          backgroundImage: isDarkMode ? `
            radial-gradient(circle at 10% 20%, #6366f1 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, #8b5cf6 0%, transparent 50%),
            radial-gradient(circle at 30% 60%, #ec4899 0%, transparent 50%)
          ` : `
            radial-gradient(circle at 10% 20%, #81d4fa 0%, transparent 50%), /* Bleu clair */
            radial-gradient(circle at 90% 80%, #4fc3f7 0%, transparent 50%), /* Bleu ciel */
            radial-gradient(circle at 30% 60%, #29b6f6 0%, transparent 50%)  /* Bleu plus vif */
          `
        }}
      />
      
      {/* Grille de fond adaptée au thème */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: gridOpacity,
          backgroundImage: isDarkMode ? `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          ` : `
            linear-gradient(rgba(0, 188, 212, 0.1) 1px, transparent 1px), /* Cyan clair */
            linear-gradient(90deg, rgba(0, 188, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Header (couleurs fixes, non affectées par le thème global) */}
      <Header 
        toggleSidebar={toggleSidebar}
        sidebarExpanded={sidebarExpanded}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar (couleurs fixes, non affectées par le thème global) */}
        <Sidebar
          expanded={sidebarExpanded}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        {/* Main content transparent - padding minimal */}
        <main 
          className="flex-1 overflow-auto p-7 transition-all duration-500"
          style={{
            backgroundColor: mainContentBg,
            backdropFilter: mainContentBackdropFilter
          }}
        >
          <div className="w-full h-full">
            <Routes>
              <Route path="/" element={<Home />} />
              
              <Route path="/users" element={
                hasPermission('USERS_VIEW') ? <Users /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/roles" element={
                hasPermission('ROLES_VIEW') ? <Roles /> : <Navigate to="/dashboard" replace />
              } />
              
              <Route path="/permissions" element={
                hasPermission('PERMISSIONS_VIEW') ? <Permissions /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* ✅ CORRECTION: Routes postes complètes */}
              <Route path="/postes" element={
                hasPermission('POSTES_VIEW') ? <Postes /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* ✅ AJOUT: Route pour les types de postes */}
              <Route path="/postes/types" element={
                hasPermission('POSTES_MANAGE') ? <TypesPostes /> : <Navigate to="/dashboard" replace />
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

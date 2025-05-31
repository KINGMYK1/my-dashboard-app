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
import Settings from '../../pages/Settings/Settings';
import Monitoring from '../../pages/Monitoring/Monitoring';

const Dashboard = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, hasPermission } = useAuth();
  const { theme } = useTheme();

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

  // ✅ CORRECTION: Détection plus robuste du mode sombre
  const currentTheme = theme?.mode || theme || 'dark';
  const isDarkMode = currentTheme === 'dark';

  console.log('🎨 [DASHBOARD] Debug thème:', {
    theme,
    currentTheme,
    isDarkMode,
    themeType: typeof theme
  });

  // ✅ AMÉLIORATION: Styles dynamiques harmonisés
  const dashboardBackground = isDarkMode
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)';

  // ✅ NOUVEAU: Main content avec fond transparent - les pages gèrent leur propre fond
  const mainContentBg = 'transparent'; // ✅ Laissez les pages gérer leur fond
  const mainContentBackdropFilter = 'none'; // ✅ Pas de blur ici

  // ✅ NOUVEAU: Styles pour les éléments décoratifs adaptés au thème
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
      {/* ✅ AMÉLIORATION: Éléments décoratifs adaptés au thème */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: decorativeElementsOpacity,
          backgroundImage: isDarkMode ? `
            radial-gradient(circle at 10% 20%, #6366f1 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, #8b5cf6 0%, transparent 50%),
            radial-gradient(circle at 30% 60%, #ec4899 0%, transparent 50%)
          ` : `
            radial-gradient(circle at 10% 20%, #3b82f6 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, #6366f1 0%, transparent 50%),
            radial-gradient(circle at 30% 60%, #8b5cf6 0%, transparent 50%)
          `
        }}
      />
      
      {/* ✅ AMÉLIORATION: Grille de fond adaptée au thème */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: gridOpacity,
          backgroundImage: isDarkMode ? `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          ` : `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Header */}
      <Header 
        toggleSidebar={toggleSidebar}
        sidebarExpanded={sidebarExpanded}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar
          expanded={sidebarExpanded}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        {/* ✅ CORRECTION: Main content transparent - padding minimal */}
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
              
              {/* ✅ CORRECTION: Utiliser USERS_VIEW */}
              <Route path="/users" element={
                hasPermission('USERS_VIEW') ? <Users /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* ✅ CORRECTION: Utiliser ROLES_VIEW */}
              <Route path="/roles" element={
                hasPermission('ROLES_VIEW') ? <Roles /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* ✅ CORRECTION: Utiliser PERMISSIONS_VIEW */}
              <Route path="/permissions" element={
                hasPermission('PERMISSIONS_VIEW') ? <Permissions /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* Routes postes - Permission POSTES_VIEW */}
              <Route path="/postes" element={
                hasPermission('POSTES_VIEW') ? <Postes /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* Routes monitoring - Permission MONITORING_VIEW */}
              <Route path="/monitoring" element={
                hasPermission('MONITORING_VIEW') ? <Monitoring /> : <Navigate to="/dashboard" replace />
              } />
              
              {/* Settings - accessible à tous */}
              <Route path="/settings" element={<Settings />} />
              
              {/* Redirection par défaut */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

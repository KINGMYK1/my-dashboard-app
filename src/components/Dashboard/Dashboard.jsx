import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';

const Dashboard = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
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
    return null; // ProtectedRoute gère déjà la redirection
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
            {/* Le contenu sera fourni par children (les pages) */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

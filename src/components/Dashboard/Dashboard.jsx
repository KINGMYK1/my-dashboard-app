import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import MainContent from '../MainContent/MainContent';
import { isTokenExpired } from '../../utils/tokenUtils';
import { useNotification } from '../../contexts/NotificationContext';

const Dashboard = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { showSessionExpired } = useNotification();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarExpanded(!mobile);
      if (mobile) {
        setSidebarExpanded(false);
      } else {
        // Étend le sidebar par défaut sur desktop
        setSidebarExpanded(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    // Vérifie l'expiration du token lors du chargement du composant
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      showSessionExpired();
      navigate('/', { replace: true });
    }

    // Vérification périodique pendant que l'utilisateur est sur le tableau de bord
    const tokenCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem('jwtToken');
      if (!currentToken || isTokenExpired(currentToken)) {
        localStorage.removeItem('jwtToken');
        showSessionExpired();
        navigate('/', { replace: true });
      }
    }, 60000); // Vérifier chaque minute

    return () => clearInterval(tokenCheckInterval);
  }, [navigate, showSessionExpired]);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header - 10vh max */}
      <Header />

      {/* Main content area */}
      {/* MODIFICATION : Utilise flexbox en colonne sur mobile, grid sur desktop */}
      {/* La grille définit deux colonnes : 'auto' pour la largeur du sidebar, '1fr' pour le reste */}
      <div className="flex flex-1 overflow-hidden md:grid md:grid-cols-[auto,1fr]">
        {/* Sidebar */}
        {/* Le sidebar est rendu conditionnellement sur mobile pour qu'il apparaisse en superposition */}
        {/* MODIFICATION : Le sidebar est toujours rendu sur desktop, sa largeur est gérée par la grille */}
        {(!isMobile || (isMobile && sidebarExpanded)) && (
          <Sidebar
            expanded={sidebarExpanded}
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
          />
        )}

        {/* Main content */}
        {/* MODIFICATION : Le contenu principal prend l'espace restant géré par la grille sur desktop */}
        {/* Plus besoin de passer sidebarExpanded ici pour gérer la marge */}
        <MainContent />
      </div>
    </div>
  );
};

export default Dashboard;
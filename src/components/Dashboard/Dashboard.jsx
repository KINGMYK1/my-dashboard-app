import React, { useState, useEffect } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import MainContent from '../MainContent/MainContent';

// Composant principal du Dashboard
export default function Dashboard() {
  // État pour gérer l'expansion du sidebar
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Vérification de la taille de l'écran pour la responsive
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Rétracte le sidebar par défaut sur mobile
      if (mobile) {
        setSidebarExpanded(false);
      } else {
        // Étend le sidebar par défaut sur desktop
        setSidebarExpanded(true);
      }
    };

    // Appelle la fonction au montage et lors du redimensionnement
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Nettoyage de l'écouteur d'événement
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []); // Le tableau vide assure que cela ne s'exécute qu'une seule fois au montage

  // Fonction pour basculer l'état du sidebar
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
}

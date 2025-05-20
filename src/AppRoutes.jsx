import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Import synchrone de la page principale (affichée immédiatement)
import HomePage from './pages/Home/Home';

// Chargement différé des autres pages pour optimiser les performances
const UsersPage = lazy(() => import('./pages/Users/Users'));
// const SettingsPage = lazy(() => import('./pages/Settings/Settings'));

// Préchargez les modules de manière progressive
const preloadRoutes = () => {
  // Préchargement immédiat des routes principales
  const timeout = setTimeout(() => {
    // Préchargement après un court délai (laisser d'abord la page principale se rendre)
    import('./pages/Users/Users');
    // Décommentez quand Settings sera disponible
    // import('./pages/Settings/Settings');
  }, 2000);
  
  return () => clearTimeout(timeout);
};

// Composant de chargement amélioré
const PageLoader = () => (
  <div className="flex items-center justify-center h-16">
    <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
  </div>
);

// Ce composant définit les routes internes au Dashboard
const AppRoutes = () => {
  const location = useLocation();
  
  // Préchargement des routes au montage initial
  useEffect(() => {
    return preloadRoutes();
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Route pour la page d'accueil du dashboard (chemin relatif '/') */}
        <Route path="/" element={<HomePage />} />

        {/* Route pour la page de gestion des utilisateurs (chemin relatif '/users') */}
        <Route path="/users" element={<UsersPage />} />
        
        {/* Route pour la page de paramètres */}
        {/* <Route path="/settings" element={<SettingsPage />} /> */}

        {/* Fallback vers la page d'accueil si l'URL ne correspond à aucune route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

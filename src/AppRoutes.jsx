import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Import synchrone de la page principale et des pages fréquemment utilisées
import HomePage from './pages/Home/Home';
import UsersPage from './pages/Users/Users'; // Chargement direct au lieu de lazy pour éviter le flash

// Le chargement paresseux est réservé aux pages moins fréquemment utilisées
// const SettingsPage = lazy(() => import('./pages/Settings/Settings'));

// Préchargez les modules de manière progressive
const preloadRoutes = () => {
  // Préchargement immédiat des routes secondaires
  const timeout = setTimeout(() => {
    // import('./pages/Settings/Settings'); // Décommentez quand Settings sera disponible
  }, 300);
  
  return () => clearTimeout(timeout);
};

// Composant de chargement invisible - aucun flash
const InvisibleLoader = () => null;

// Ce composant définit les routes internes au Dashboard
const AppRoutes = () => {
  const location = useLocation();
  
  // Préchargement des routes au montage initial
  useEffect(() => {
    return preloadRoutes();
  }, []);

  return (
    <Suspense fallback={<InvisibleLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<UsersPage />} />
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

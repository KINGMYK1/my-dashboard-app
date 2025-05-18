import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/Home';
import UsersPage from './pages/Users/Users';
// Importez d'autres pages ici si nécessaire

// Ce composant définit toutes les routes de l'application
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route pour la page d'accueil */}
      <Route path="/" element={<HomePage />} />

      {/* Route pour la page de gestion des utilisateurs */}
      <Route path="/users" element={<UsersPage />} />

      {/* Ajoutez d'autres routes ici */}
      {/* <Route path="/settings" element={<SettingsPage />} /> */}

      {/* Optionnel: Route pour les pages non trouvées (404) */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

export default AppRoutes;

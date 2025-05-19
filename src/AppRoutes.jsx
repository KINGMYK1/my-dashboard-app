import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/Home';
import UsersPage from './pages/Users/Users';
// Importez d'autres pages ici si nécessaire
import LoginPage from './components/Login/Login';

// Ce composant définit les routes internes au Dashboard
const AppRoutes = () => {
  return (
    // MODIFICATION : Les routes ici sont relatives au chemin parent (/dashboard)
    <Routes>
      {/* Route pour la page d'accueil du dashboard (chemin relatif '/') */}
      {/* Cela correspondra à /dashboard */}
      <Route path="/" element={<HomePage />} />

      {/* Route pour la page de gestion des utilisateurs (chemin relatif '/users') */}
      {/* Cela correspondra à /dashboard/users */}
      <Route path="/users" element={<UsersPage />} />

      {/* Ajoutez d'autres routes internes au dashboard ici */}
      {/* <Route path="/settings" element={<SettingsPage />} /> */}

      {/* Optionnel: Rediriger toute autre route sous /dashboard/* vers la page d'accueil du dashboard */}
      {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
    </Routes>
  );
};

export default AppRoutes;

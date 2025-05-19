import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // MODIFICATION : Import de Routes, Route, Navigate
import Dashboard from './components/Dashboard/Dashboard';
import LoginPage from './components/Login/Login'; // MODIFICATION : Import de LoginPage
import { LanguageProvider } from './contexts/LanguageContext'; // Assurez-vous que le chemin est correct
import './index.css'; // Assurez-vous que votre fichier CSS principal (avec Tailwind et FA) est importé ici

function App() {
  // Dans une vraie application, vous géreriez l'état d'authentification ici
  // ou via un contexte/état global (par exemple, useState(false) initialement)
  // Pour l'instant, nous allons simuler l'état d'authentification
  // en vérifiant si l'utilisateur est sur la page de connexion ou non.
  // Une approche plus robuste utiliserait un état d'utilisateur connecté.

  return (
    // Enveloppez l'application avec BrowserRouter
    <BrowserRouter>
      {/* LanguageProvider enveloppe les routes qui pourraient avoir besoin de traductions (principalement le Dashboard) */}
      <LanguageProvider>
        {/* MODIFICATION : Définition des routes principales */}
        <Routes>
          {/* Route pour la page de connexion à la racine */}
          <Route path="/" element={<LoginPage />} />

          {/* Route pour le tableau de bord et ses sous-routes */}
          {/* Le '*' permet aux routes définies dans AppRoutes.jsx d'être imbriquées sous /dashboard */}
          <Route path="/dashboard/*" element={<Dashboard />} />

          {/* Optionnel: Rediriger toute autre route non définie vers la page de connexion ou le dashboard */}
          {/* Ici, redirige tout le reste vers la page de connexion */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

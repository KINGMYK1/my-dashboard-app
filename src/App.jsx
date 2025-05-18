import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import { LanguageProvider } from './contexts/LanguageContext'; // MODIFICATION : Import du LanguageProvider
import './index.css'; // Assurez-vous que votre fichier CSS principal (avec Tailwind) est importé ici

function App() {
  return (
    // Enveloppez l'application avec BrowserRouter et LanguageProvider
    <BrowserRouter>
      {/* MODIFICATION : Enveloppe avec LanguageProvider */}
      <LanguageProvider>
        <div className="App">
          <Dashboard />
        </div>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

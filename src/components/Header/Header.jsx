import React, { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

// Composant Header
const Header = () => {
  // Récupère l'utilisateur connecté et la fonction de déconnexion du contexte
  const { user, logout } = useAuth();

  // Debug de l'objet user
  useEffect(() => {
    console.log('Objet utilisateur dans Header:', user);
  }, [user]);

  // Vérification et extraction des données utilisateur avec la bonne structure
  // La réponse API contient user.data qui contient les infos utilisateur
  const userData = user?.data || user;
  
  // Calcul des informations d'affichage basées sur l'objet userData
  const firstName = userData?.firstName || '';
  const lastName = userData?.lastName || '';
  const username = userData?.username || '';

  // Affiche le nom complet, ou le username si nom/prénom non disponibles
  const userNameDisplay = (firstName || lastName) 
    ? `${firstName} ${lastName}`.trim() 
    : (username || "Utilisateur");
  
  // Calcul des initiales basé sur firstName et lastName, ou la première lettre du username
  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : username
      ? username.charAt(0).toUpperCase()
      : 'U';

  // État local pour gérer le thème et langue - reste inchangé
  const [theme, setTheme] = useState('light');
  const { language, changeLanguage, translations, loading: langLoading } = useLanguage();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Fonctions pour gérer le thème et langue - reste inchangé 
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const selectLanguage = (lang) => {
    changeLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg h-16 max-h-[10vh] flex items-center justify-between px-4 z-10">
      {/* Logo et nom de société */}
      <div className="flex items-center">
        <div className="bg-blue-600 rounded-lg w-10 h-10 flex items-center justify-center text-white font-bold text-xl mr-3 shadow-blue-500/50 shadow-lg">
          G
        </div>
        <span className="text-2xl font-bold text-blue-400 tracking-wide">Gaming<span className="text-gray-200">Hub</span></span>
      </div>

      {/* Zone centrale de recherche (cachée sur mobile) */}
      <div className="hidden md:flex items-center relative">
        <Search size={18} className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder={translations?.search || 'Rechercher...'}
          className="pl-10 pr-4 py-2 rounded-full bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 border border-gray-700"
        />
      </div>

      {/* Profil, notifications, thème et langue */}
      <div className="flex items-center space-x-4">
        {/* Bouton pour basculer le thème */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors duration-200"
          title={theme === 'light' ? (translations?.switchToDarkMode || 'Switch to dark mode') : (translations?.switchToLightMode || 'Switch to light mode')}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Sélecteur de langue */}
        <div className="relative">
          <button
            onClick={toggleLanguageMenu}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors duration-200 flex items-center"
          >
            <Globe size={20} className="text-gray-300 mr-1" />
            <span className="text-sm text-gray-300">{language?.toUpperCase() || 'FR'}</span>
          </button>
          {isLanguageMenuOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-gray-800 rounded-md shadow-lg z-20 overflow-hidden">
              <button onClick={() => selectLanguage('fr')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"> Français </button>
              <button onClick={() => selectLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"> English </button>
              <button onClick={() => selectLanguage('ar')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"> العربية </button>
            </div>
          )}
        </div>

        {/* Bouton de notification */}
        <button className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors duration-200">
          <Bell size={20} className="text-gray-300" />
          <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
        </button>

        {/* Bulle de profil utilisateur */}
        {user && (
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-full w-9 h-9 flex items-center justify-center text-white font-semibold text-lg shadow-blue-500/50 shadow-md">
              {initials}
            </div>
            <span className="ml-2 text-gray-300 hidden sm:inline">{userNameDisplay}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
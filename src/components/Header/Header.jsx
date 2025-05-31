import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar, sidebarExpanded, isMobile }) => {
  const { user, logout } = useAuth();
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ SOLUTION: Valeurs par défaut sécurisées
  const safeTranslations = {
    gamingClubTitle: 'Gaming Club',
    managementSystemSubtitle: 'Système de Gestion',
    notificationsHeader: 'Notifications',
    noNewNotifications: 'Aucune nouvelle notification',
    profileSettings: 'Paramètres',
    logout: 'Déconnexion',
    ...translations // Les vraies traductions écrasent les valeurs par défaut
  };

  // Styles fixes pour le header (toujours thème sombre)
  const headerBg = 'rgba(30, 41, 59, 0.9)';
  const headerBorder = 'border-purple-400/20';
  const iconButtonTextColor = 'text-gray-300';
  const iconButtonHoverBg = 'hover:bg-purple-600/20';
  const titleGradient = 'from-purple-400 to-blue-400';
  const subtitleColor = 'text-gray-400';
  const dropdownBg = 'rgba(30, 41, 59, 0.95)';
  const dropdownBorder = 'border-purple-400/20';
  const dropdownItemHoverBg = 'hover:bg-purple-600/20';
  const dropdownItemTextColor = 'text-gray-300';
  const logoutItemHoverBg = 'hover:bg-red-600/20';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/dashboard/settings');
    setShowUserMenu(false);
  };

  // ✅ FONCTION UTILITAIRE pour gérer le titre de manière sécurisée
  const renderGameTitle = () => {
    const title = safeTranslations.gamingClubTitle || 'Gaming Club';
    const titleParts = title.split(' ');
    
    if (titleParts.length >= 2) {
      return `${titleParts[0]} ${titleParts[1]}`;
    }
    
    return title; // Retourne le titre complet si pas de split possible
  };

  // ✅ FERMETURE DES MENUS au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header 
      className={`flex items-center justify-between px-4 py-2 border-b ${headerBorder} relative z-20`}
      style={{
        background: headerBg,
        backdropFilter: 'blur(15px)',
        height: '60px',
        minHeight: '60px',
        maxHeight: '80px'
      }}
    >
      {/* Logo et toggle sidebar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg ${iconButtonTextColor} ${iconButtonHoverBg} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50`}
          aria-label={sidebarExpanded ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {sidebarExpanded ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="flex items-center space-x-3">
          {/* Logo image optimisé */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <img 
              src="/logo2.png" 
              alt="Gaming Club Logo" 
              className="w-8 h-8 object-contain transition-transform duration-200 hover:scale-110"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span 
              className="text-white font-bold text-sm hidden items-center justify-center"
              style={{ display: 'none' }}
            >
              GC
            </span>
          </div>
          <div>
            <h1 className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${titleGradient} transition-all duration-300 hover:scale-105`}>
              {renderGameTitle()}
            </h1>
            <p className={`text-xs ${subtitleColor} hidden sm:block transition-colors duration-300`}>
              {safeTranslations.managementSystemSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <div className="relative dropdown-container">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false); // Fermer l'autre menu
            }}
            className={`p-2 rounded-lg ${iconButtonTextColor} ${iconButtonHoverBg} transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-purple-400/50`}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          {showNotifications && (
            <div 
              className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl border ${dropdownBorder} z-50 transform transition-all duration-200 ease-out`}
              style={{
                background: dropdownBg,
                backdropFilter: 'blur(15px)',
                animation: 'slideIn 0.2s ease-out'
              }}
            >
              <div className="p-4">
                <h3 className={`font-semibold mb-3 ${dropdownItemTextColor} flex items-center`}>
                  <Bell size={16} className="mr-2" />
                  {safeTranslations.notificationsHeader}
                </h3>
                <div className={`${subtitleColor} text-sm flex items-center justify-center py-8`}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
                      <Bell size={24} className="text-gray-500" />
                    </div>
                    <p>{safeTranslations.noNewNotifications}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu utilisateur */}
        <div className="relative dropdown-container">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false); // Fermer l'autre menu
            }}
            className={`flex items-center space-x-2 p-2 rounded-lg ${iconButtonTextColor} ${iconButtonHoverBg} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50`}
            aria-label="Menu utilisateur"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110">
              <span className="text-white font-semibold text-sm">
                {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className={`font-medium text-sm ${dropdownItemTextColor} transition-colors duration-300`}>
                {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
              </p>
              <p className={`${subtitleColor} text-xs transition-colors duration-300`}>
                {user?.role?.name || 'Rôle non défini'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div 
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border ${dropdownBorder} z-50 transform transition-all duration-200 ease-out`}
              style={{
                background: dropdownBg,
                backdropFilter: 'blur(15px)',
                animation: 'slideIn 0.2s ease-out'
              }}
            >
              <div className="py-2">
                {/* Info utilisateur en en-tête (version mobile) */}
                <div className="px-4 py-3 border-b border-gray-600/30 md:hidden">
                  <p className={`font-medium text-sm ${dropdownItemTextColor}`}>
                    {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
                  </p>
                  <p className={`${subtitleColor} text-xs`}>
                    {user?.role?.name || 'Rôle non défini'}
                  </p>
                </div>

                <button
                  onClick={handleSettingsClick}
                  className={`flex items-center space-x-3 w-full px-4 py-3 ${dropdownItemTextColor} ${dropdownItemHoverBg} transition-all duration-200 text-left`}
                >
                  <Settings size={16} />
                  <span>{safeTranslations.profileSettings}</span>
                </button>
                
                <div className="border-t border-gray-600/30 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-3 w-full px-4 py-3 text-red-300 ${logoutItemHoverBg} transition-all duration-200 text-left`}
                >
                  <LogOut size={16} />
                  <span>{safeTranslations.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;

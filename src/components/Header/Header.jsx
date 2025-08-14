import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from '../NotificationPanel/NotificationPanel';

const Header = ({ toggleSidebar = () => {}, sidebarExpanded = true, isMobile = false }) => {
  const { user, logout } = useAuth();
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme(); // ✅ CORRECTION
  const { getNotificationStats } = useNotification();
  const navigate = useNavigate();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';
  const notificationStats = getNotificationStats();

  // ✅ Valeurs par défaut sécurisées
  const safeTranslations = {
    gamingClubTitle: 'Gaming Club',
    managementSystemSubtitle: 'Système de Gestion',
    notificationsHeader: 'Notifications',
    noNewNotifications: 'Aucune nouvelle notification',
    profileSettings: 'Paramètres',
    logout: 'Déconnexion',
    ...translations
  };

  // ✅ Extraction sécurisée des données utilisateur
  const userData = user?.data || user || {};
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const username = userData.username || '';

  const userNameDisplay = (firstName || lastName) 
    ? `${firstName} ${lastName}`.trim() 
    : (username || "Utilisateur");

  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : username
      ? username.charAt(0).toUpperCase()
      : 'U';

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

  const renderGameTitle = () => {
    const title = safeTranslations.gamingClubTitle || 'Gaming Club';
    const titleParts = title.split(' ');
    
    if (titleParts.length >= 2) {
      return `${titleParts[0]} ${titleParts[1]}`;
    }
    
    return title;
  };

  // ✅ Fermeture des menus au clic extérieur
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
      className="flex items-center justify-between px-4 py-2 border-b border-purple-400/20 relative z-20"
      style={{
        background: 'rgba(30, 41, 59, 0.9)',
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
          className="p-2 rounded-lg text-gray-300 hover:bg-purple-600/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          aria-label={sidebarExpanded ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {sidebarExpanded ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <img 
              src="/logo2.png" 
              alt="Gaming Club Logo" 
              className="w-8 h-8 object-contain transition-transform duration-200 hover:scale-110"
              onError={(e) => {
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
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 hover:scale-105">
              {renderGameTitle()}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block transition-colors duration-300">
              {safeTranslations.managementSystemSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center space-x-4">
        {/* ✅ Bouton de notifications avec badge */}
        <div className="dropdown-container relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-lg text-gray-300 hover:bg-purple-600/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notificationStats.unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                {notificationStats.unread > 99 ? '99+' : notificationStats.unread}
              </span>
            )}
          </button>

          {/* ✅ Panel de notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 z-50">
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>
        
        {/* Menu utilisateur */}
        <div className="dropdown-container relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:bg-purple-600/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            aria-label="Menu utilisateur"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110">
              <span className="text-white font-semibold text-sm">
                {initials}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="font-medium text-sm text-gray-300 transition-colors duration-300">
                {userNameDisplay}
              </p>
              <p className="text-gray-400 text-xs transition-colors duration-300">
                {userData?.role?.name || 'Rôle non défini'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border border-purple-400/20 z-50 transform transition-all duration-200 ease-out"
              style={{
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(15px)',
                animation: 'slideIn 0.2s ease-out'
              }}
            >
              <div className="py-2">
                <div className="px-4 py-3 border-b border-gray-600/30 md:hidden">
                  <p className="font-medium text-sm text-gray-300">
                    {userNameDisplay}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {userData?.role?.name || 'Rôle non défini'}
                  </p>
                </div>

                <button
                  onClick={handleSettingsClick}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:bg-purple-600/20 transition-all duration-200 text-left"
                >
                  <Settings size={16} />
                  <span>{safeTranslations.profileSettings}</span>
                </button>
                
                <div className="border-t border-gray-600/30 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-red-300 hover:bg-red-600/20 transition-all duration-200 text-left"
                >
                  <LogOut size={16} />
                  <span>{safeTranslations.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx={true}>{`
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
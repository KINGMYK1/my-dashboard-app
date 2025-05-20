import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Settings, LogOut, Pin, PanelLeftClose, PanelRightOpen } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

// Composant Sidebar
const Sidebar = ({ expanded, toggleSidebar, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { translations } = useLanguage();
  const { logout, setIsInternalNavigation } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { icon: <Home size={20} />, label: translations.home, path: '/dashboard' },
    { icon: <Users size={20} />, label: translations.users, path: '/dashboard/users' },
    { icon: <Settings size={20} />, label: translations.settings, path: '/dashboard/settings' },
  ];

  const shouldExpandVisual = expanded || (!isMobile && isHovered);

  const renderToggleButtonIcon = () => {
    if (isMobile) {
      return expanded ? <PanelLeftClose size={20} /> : <PanelRightOpen size={20} />;
    } else {
      if (expanded) {
        return <PanelLeftClose size={20} />;
      } else {
        return <PanelRightOpen size={20} />;
      }
    }
  };

  const renderPinIcon = () => {
    if (!isMobile && expanded) {
      return <Pin size={20} className="ml-1 text-gray-400" />;
    }
    return null;
  };

  const handleNavigation = (e, path) => {
    e.preventDefault(); // Empêche le comportement par défaut
    
    // Gérer la fermeture du sidebar sur mobile
    if (isMobile && expanded) {
      toggleSidebar();
    }
    
    // Marquer comme navigation interne pour éviter les effets de chargement
    if (setIsInternalNavigation) {
      setIsInternalNavigation(true);
    }
    
    // Utiliser navigate au lieu du comportement par défaut de <Link>
    navigate(path);
  };
  
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <aside
      className={`
        bg-gray-900 text-white
        transition-all duration-300 ease-in-out
        ${shouldExpandVisual ? 'w-54' : 'w-16'}
        ${isMobile ?
          (expanded ? 'fixed inset-y-0 left-0 w-54' : 'hidden')
          : 'relative h-full'
        }
        z-30
        flex flex-col
        overflow-y-auto
        overflow-x-hidden
      `}
      onMouseEnter={() => !isMobile && !expanded && setIsHovered(true)}
      onMouseLeave={() => !isMobile && !expanded && setIsHovered(false)}
    >
      {/* Bouton pour basculer le sidebar */}
      {(!isMobile || (isMobile && expanded)) && (
        <div className={`flex ${shouldExpandVisual ? 'justify-end' : 'justify-center'} p-2'}`}>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none flex items-center"
          >
            {renderToggleButtonIcon()}
            {renderPinIcon()}
          </button>
        </div>
      )}


      {/* Menu items */}
      <nav className="mt-6 flex-1">
        <ul className="space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`
                  flex items-center py-2 px-3 rounded-lg
                  ${location.pathname === item.path || 
                    (location.pathname === '/dashboard' && item.path === '/dashboard') ? 
                    'bg-blue-600' : 'hover:bg-gray-800'}
                  transition-colors duration-200
                  ${!shouldExpandVisual && 'justify-center'}
                `}
                title={!shouldExpandVisual ? item.label : ''}
                onClick={(e) => handleNavigation(e, item.path)}
              >
                <span className="text-lg">{item.icon}</span>
                {shouldExpandVisual && <span className="ml-4">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section (Déconnexion) */}
      <div className={`p-4 ${!shouldExpandVisual && 'flex justify-center'}`}>
        <button
          onClick={handleLogout}
          className={`
            flex items-center py-2 px-3 w-full rounded-lg
            text-red-300 hover:bg-red-800 hover:bg-opacity-30
            transition-colors duration-300
            ${!shouldExpandVisual && 'justify-center w-auto'}
          `}
          title={!shouldExpandVisual ? translations.logout : ''}
        >
          <LogOut size={20} />
          {shouldExpandVisual && <span className="ml-4">{translations.logout}</span>}
        </button>
      </div>

       {/* Overlay sombre pour mobile lorsque le sidebar est ouvert */}
       {isMobile && expanded && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={toggleSidebar}
          ></div>
        )}
    </aside>
  );
};

export default Sidebar;

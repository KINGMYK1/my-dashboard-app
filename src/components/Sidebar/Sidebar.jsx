import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Shield, 
  Key, 
  Settings, 
  Monitor, Activity ,Receipt ,
  UserPlus, 
  ShoppingCart, 
  Package, 
  Calendar,
  BarChart3,
  DollarSign,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Gamepad2,PlayCircle,
  CreditCard, // ✅ NOUVEAU : Pour les abonnements
  Star, // ✅ NOUVEAU : Pour les types d'abonnements
  TrendingUp, 
  FileText, 
  Clock, 
  Target, 
  PieChart 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = ({ expanded, toggleSidebar, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, hasPermission } = useAuth();
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug des permissions
  useEffect(() => {
    if (user) {
      console.log('👤 Utilisateur sidebar:', user);
      console.log('🔑 Permissions:', user.role?.permissions);
      console.log('✅ Test POSTES_VIEW:', hasPermission('POSTES_VIEW'));
      console.log('✅ Test POSTES_MANAGE:', hasPermission('POSTES_MANAGE'));
      console.log('✅ Test ABONNEMENTS_VIEW:', hasPermission('ABONNEMENTS_VIEW'));
      console.log('✅ Test ABONNEMENTS_MANAGE:', hasPermission('ABONNEMENTS_MANAGE'));
    }
  }, [user, hasPermission]);

  const shouldExpandVisual = expanded || (!isMobile && isHovered);

  // Fonction pour basculer l'expansion d'un sous-menu
  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Vérifier si un menu parent est actif
  const isParentActive = (parentPath, children) => {
    return children.some(child => location.pathname === child.path) || location.pathname === parentPath;
  };

  // Menu principal adapté selon les permissions utilisateur
  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: translations.home || 'Accueil', 
      path: '/dashboard' 
    },
    // Menu Postes Gaming avec sous-menu
    {
      icon: <Monitor size={20} />,
      label: translations.postes || 'Postes Gaming',
      path: '/dashboard/postes',
      permission: 'POSTES_VIEW',
      hasSubmenu: true,
      submenuKey: 'postes',
      children: [
        {
          icon: <Gamepad2 size={18} />,
          label: translations.postes || 'Postes',
          path: '/dashboard/postes',
          permission: 'POSTES_VIEW'
        },
        {
          icon: <Settings size={18} />,
          label: translations.typesPostes || 'Types de Postes',
          path: '/dashboard/postes/types',
          permission: 'POSTES_MANAGE'
        }
      ]
    }, { 
    icon: <PlayCircle size={20} />, 
    label: translations.sessions || 'Sessions', 
    path: '/dashboard/sessions',
    permission: 'SESSIONS_VIEW' 
  },
    { 
      icon: <DollarSign size={20} />, 
      label: translations.transactions || 'Transactions', 
      path: '/dashboard/transactions',
      permission: 'SESSIONS_VIEW' 
    },
    { 
      icon: <UserPlus size={20} />, 
      label: translations.customers || 'Clients', 
      path: '/dashboard/clients',
      permission: 'CLIENTS_VIEW' 
    },
    // ✅ CORRECTION: Menu Abonnements avec les bonnes routes
    {
      icon: <CreditCard size={20} />,
      label: translations.subscriptions || 'Abonnements',
      path: '/dashboard/abonnements',
      permission: 'ABONNEMENTS_VIEW',
      hasSubmenu: true,
      submenuKey: 'abonnements',
      children: [
        {
          icon: <Star size={18} />,
          label: translations.subscriptionTypes || 'Types d\'Abonnements',
          path: '/dashboard/types-abonnements',
          permission: 'ABONNEMENTS_MANAGE'
        },
        {
          icon: <CreditCard size={18} />,
          label: translations.clientSubscriptions || 'Abonnements Clients',
          path: '/dashboard/abonnements',
          permission: 'ABONNEMENTS_VIEW'
        }
      ]
    },
    // ✅ CORRECTION: Menu Analyses avec les bonnes routes
    {
      icon: <BarChart3 size={20} />,
      label: translations.analytics || 'Analyses',
      path: '/dashboard/statistiques',
      permission: 'SESSIONS_VIEW',
      hasSubmenu: true,
      submenuKey: 'analytics',
      children: [
        {
          icon: <DollarSign size={18} />,
          label: translations.transactionStats || 'Statistiques Transactions',
          path: '/dashboard/statistiques-transactions',
          permission: 'SESSIONS_VIEW'
        }
      ]
    },
    // ✅ Ajouter cette section statistiques à votre sidebar existant
    // {
    //   title: 'Statistiques',
    //   icon: <BarChart3 className="w-5 h-5" />,
    //   items: [
    //     {
    //       title: 'Tableau de Bord',
    //       path: '/statistiques/tableau-de-bord',
    //       icon: <Activity className="w-4 h-4" />,
    //       permissions: ['DASHBOARD_VIEW']
    //     },
    //     {
    //       title: 'Chiffre d\'Affaires',
    //       path: '/statistiques/chiffre-affaires',
    //       icon: <DollarSign className="w-4 h-4" />,
    //       permissions: ['STATISTICS_VIEW']
    //     },
    //     {
    //       title: 'Transactions',
    //       path: '/statistiques/transactions',
    //       icon: <Receipt className="w-4 h-4" />,
    //       permissions: ['STATISTICS_VIEW']
    //     },
    //     {
    //       title: 'Performance',
    //       path: '/statistiques/performance',
    //       icon: <TrendingUp className="w-4 h-4" />,
    //       permissions: ['STATISTICS_VIEW']
    //     },
    //     {
    //       title: 'Rapports',
    //       path: '/statistiques/rapports',
    //       icon: <FileText className="w-4 h-4" />,
    //       permissions: ['REPORTS_VIEW']
    //     }
    //   ]
    // }
  ];

  // Filtrer les éléments du menu principal selon les permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    
    // Pour les menus avec sous-menus, vérifier si au moins un enfant est accessible
    if (item.hasSubmenu && item.children) {
      return item.children.some(child => 
        !child.permission || hasPermission(child.permission) || hasPermission('ADMIN')
      );
    }
    
    return hasPermission(item.permission) || hasPermission('ADMIN');
  });

  // Menu administration - avec permissions corrigées et fallback ADMIN
  const adminMenuItems = [
    // ✅ Utilisateurs - USERS_ADMIN ou ADMIN
    ...(hasPermission('USERS_ADMIN') || hasPermission('ADMIN') ? [{
      icon: <Users size={20} />, 
      label: translations.users || 'Utilisateurs', 
      path: '/dashboard/users'
    }] : []),
    
    // ✅ Rôles - ROLES_MANAGE ou ADMIN  
    ...(hasPermission('ROLES_MANAGE') || hasPermission('ADMIN') ? [{
      icon: <Shield size={20} />, 
      label: translations.roles || 'Rôles', 
      path: '/dashboard/roles'
    }] : []),
    
    // ✅ Permissions - PERMISSIONS_MANAGE ou ADMIN
    ...(hasPermission('PERMISSIONS_MANAGE') || hasPermission('ADMIN') ? [{
      icon: <Key size={20} />, 
      label: translations.permissions || 'Permissions', 
      path: '/dashboard/permissions'
    }] : []),
    
    
    // ✅ Monitoring - MONITORING_VIEW ou ADMIN
    ...(hasPermission('MONITORING_VIEW') || hasPermission('ADMIN') ? [{
      icon: <ClipboardList size={20} />, 
      label: translations.supervision || 'Supervision', 
      path: '/dashboard/monitoring'
    }] : [])
  ];

  // ✅ CORRECTION: Correction du handleNavigation pour forcer la navigation
  const handleNavigation = (e, path) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 [SIDEBAR] Navigation vers:', path, 'depuis:', location.pathname);
    
    // ✅ CORRECTION: Navigation avec force refresh pour éviter les problèmes de cache
    navigate(path, { replace: false });
    
    // Fermer le sidebar sur mobile APRÈS navigation
    if (isMobile && expanded) {
      // Délai pour laisser la navigation se faire d'abord
      setTimeout(() => {
        console.log('📱 [SIDEBAR] Fermeture sidebar mobile');
        toggleSidebar();
      }, 100);
    }
  };

  // Auto-expand les sous-menus si la page active est dedans
  useEffect(() => {
    filteredMenuItems.forEach(item => {
      if (item.hasSubmenu && item.children) {
        const isChildActive = item.children.some(child => location.pathname === child.path);
        if (isChildActive && !expandedMenus[item.submenuKey]) {
          setExpandedMenus(prev => ({
            ...prev,
            [item.submenuKey]: true
          }));
        }
      }
    });
  }, [location.pathname, expandedMenus, filteredMenuItems]);

  // Styles fixes pour le sidebar (toujours thème sombre)
  const sidebarBg = 'rgba(30, 41, 59, 0.9)';
  const sidebarBorder = 'border-purple-400/20';
  const linkTextColor = 'text-gray-300';
  const linkHoverBg = 'hover:bg-purple-600/20';
  const linkActiveBg = 'bg-purple-600/80 text-white shadow-lg';
  const submenuBg = 'bg-slate-800/50';
  const submenuItemBg = 'hover:bg-purple-600/10';
  const adminSectionBorder = 'border-purple-400/20';
  const adminSectionTitleColor = 'text-gray-400';

  const renderMenuItem = (item, index) => {
    if (!item.hasSubmenu) {
      // Menu simple
      return (
        <li key={index}>
          <Link
            to={item.path}
            className={`
              flex items-center py-3 px-3 rounded-lg
              ${location.pathname === item.path || 
                (location.pathname === '/dashboard' && item.path === '/dashboard') ? 
                linkActiveBg : 
                `${linkTextColor} ${linkHoverBg}`}
              transition-all duration-200
              ${!shouldExpandVisual && 'justify-center'}
            `}
            title={!shouldExpandVisual ? item.label : ''}
            onClick={(e) => handleNavigation(e, item.path)}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {shouldExpandVisual && <span className="ml-3 font-medium">{item.label}</span>}
          </Link>
        </li>
      );
    }

    // Menu avec sous-menu
    const isActive = isParentActive(item.path, item.children);
    const isExpanded = expandedMenus[item.submenuKey];
    const accessibleChildren = item.children.filter(child => 
      !child.permission || hasPermission(child.permission) || hasPermission('ADMIN')
    );

    return (
      <li key={index}>
        {/* Parent menu item */}
        <div
          className={`
            flex items-center py-3 px-3 rounded-lg cursor-pointer
            ${isActive ? linkActiveBg : `${linkTextColor} ${linkHoverBg}`}
            transition-all duration-200
            ${!shouldExpandVisual && 'justify-center'}
          `}
          onClick={() => {
            if (shouldExpandVisual) {
              toggleSubmenu(item.submenuKey);
            } else {
              handleNavigation({ preventDefault: () => {} }, item.path);
            }
          }}
          title={!shouldExpandVisual ? item.label : ''}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {shouldExpandVisual && (
            <>
              <span className="ml-3 font-medium flex-1">{item.label}</span>
              <span className="ml-2 flex-shrink-0">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            </>
          )}
        </div>

        {/* Sous-menu */}
        {shouldExpandVisual && isExpanded && accessibleChildren.length > 0 && (
          <ul className={`ml-4 mt-1 space-y-1 ${submenuBg} rounded-lg p-2`}>
            {accessibleChildren.map((child, childIndex) => (
              <li key={childIndex}>
                <Link
                  to={child.path}
                  className={`
                    flex items-center py-2 px-3 rounded-md text-sm
                    ${location.pathname === child.path ? 
                      linkActiveBg : 
                      `${linkTextColor} ${submenuItemBg}`}
                    transition-all duration-200
                  `}
                  onClick={(e) => handleNavigation(e, child.path)}
                >
                  <span className="flex-shrink-0">{child.icon}</span>
                  <span className="ml-3">{child.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <aside
        className={`
          transition-all duration-300 ease-in-out
          ${shouldExpandVisual ? 'w-64' : 'w-16'}
          ${isMobile ?
            (expanded ? 'fixed inset-y-0 left-0 w-64 z-50' : 'hidden')
            : 'relative h-full'
          }
          flex flex-col
          overflow-y-auto
          overflow-x-hidden
          border-r ${sidebarBorder}
        `}
        style={{
          background: sidebarBg,
          backdropFilter: 'blur(15px)'
        }}
        onMouseEnter={() => !isMobile && !expanded && setIsHovered(true)}
        onMouseLeave={() => !isMobile && !expanded && setIsHovered(false)}
      >
        {/* Menu principal */}
        <nav className="flex-1 py-4">
          {/* Menu général */}
          <div className="px-3">
            <ul className="space-y-1">
              {filteredMenuItems.map((item, index) => renderMenuItem(item, index))}
            </ul>
          </div>

          {/* Section Administration - uniquement si l'utilisateur a des permissions admin */}
          {adminMenuItems.length > 0 && (
            <>
              <div className="mx-3 my-4">
                <div className={`border-t ${adminSectionBorder}`}></div>
              </div>
              
              <div className="px-3">
                {shouldExpandVisual && (
                  <h3 className={`${adminSectionTitleColor} font-semibold text-xs uppercase tracking-wider mb-3 px-3`}>
                    {translations.administration || 'Administration'}
                  </h3>
                )}
                <ul className="space-y-1">
                  {adminMenuItems.map((item, index) => (
                    <li key={`admin-${index}`}>
                      <Link
                        to={item.path}
                        className={`
                          flex items-center py-3 px-3 rounded-lg
                          ${location.pathname === item.path ? 
                            linkActiveBg : 
                            `${linkTextColor} ${linkHoverBg}`}
                          transition-all duration-200
                          ${!shouldExpandVisual && 'justify-center'}
                        `}
                        title={!shouldExpandVisual ? item.label : ''}
                        onClick={(e) => handleNavigation(e, item.path)}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {shouldExpandVisual && <span className="ml-3 font-medium">{item.label}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </nav>

        {/* Section inférieure - Déconnexion */}
        
      </aside>

      {/* Overlay pour mobile */}
      {isMobile && expanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;

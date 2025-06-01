import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Shield, 
  Key, 
  Monitor, 
  Activity,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext'; // Import useTheme

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'purple' }) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const colorClasses = {
    purple: 'from-purple-600 to-blue-600',
    green: 'from-green-600 to-teal-600',
    orange: 'from-orange-600 to-red-600',
    blue: 'from-blue-600 to-indigo-600'
  };

  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-purple-400/20' : 'border-[var(--border-color)]';
  const getCardBgClass = () => 'var(--background-card)'; // Use CSS variable for card background

  return (
    <div 
      className={`p-6 rounded-xl border ${getBorderColorClass()} hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105`}
      style={{
        background: getCardBgClass(), // Use CSS variable
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center space-x-4">
        <div 
          className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}
        >
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${getTextColorClass(false)}`}>{title}</h3>
          <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${getTextColorClass(false)}`}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Page d'accueil d'exemple
const Home = () => {
  const { user, hasPermission } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-purple-400/20' : 'border-[var(--border-color)]';
  const getCardBgClass = () => 'var(--background-card)'; // Use CSS variable for card background
  const getAccentColorClass = () => isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]';
  const getWarningColorClass = () => isDarkMode ? 'text-orange-400' : 'text-[var(--warning-color)]';
  const getWarningBorderClass = () => isDarkMode ? 'border-orange-400/20' : 'border-[var(--warning-color)]20';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Données d'exemples pour le dashboard
  const stats = [
    // Utilisation des traductions pour les titres si le contexte de langue est présent
    { title: translations?.activeUsers || 'Active Users', value: '8,249', change: '+5.25%' },
    { title: translations?.revenue || 'Revenue', value: '12,540 €', change: '+10.32%' },
    { title: translations?.projects || 'Projects', value: '142', change: '+2.15%' },
    { title: translations?.successRate || 'Success Rate', value: '89.4%', change: '+1.25%' }
  ];

  const quickActions = [
    {
      title: translations.userManagement || 'Gestion Utilisateurs',
      description: translations.manageUserAccounts || 'Créer et gérer les comptes utilisateurs',
      icon: Users,
      permission: 'USERS_VIEW', // Changed to actual permission
      color: 'purple',
      path: '/dashboard/users'
    },
    {
      title: translations.roleManagement || 'Gestion Rôles',
      description: translations.configureRolesAndPermissions || 'Configurer les rôles et permissions',
      icon: Shield,
      permission: 'ROLES_VIEW', // Changed to actual permission
      color: 'green',
      path: '/dashboard/roles'
    },
    {
      title: translations.permissions || 'Permissions',
      description: translations.manageSystemPermissions || 'Gérer les permissions système',
      icon: Key,
      permission: 'PERMISSIONS_VIEW', // Changed to actual permission
      color: 'orange',
      path: '/dashboard/permissions'
    },
    {
      title: translations.gamingStations || 'Postes Gaming',
      description: translations.configureGamingStations || 'Configurer les postes de jeu',
      icon: Monitor,
      permission: 'POSTES_VIEW', // Changed to actual permission
      color: 'blue',
      path: '/dashboard/postes'
    }
  ];

  const availableActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  return (
    <div className="p-6 space-y-6">
      {/* En-tête de bienvenue */}
      <div 
        className={`p-6 rounded-xl border ${getBorderColorClass()}`}
        style={{
          background: getCardBgClass(), // Use CSS variable
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${getTextColorClass(true)} mb-2`}>
              {translations.welcome || "Bienvenue"}, {user?.firstName} !
            </h1>
            <p className={`${getTextColorClass(false)}`}>
              {translations.dashboardTitle || "Tableau de bord"} - Gaming Center Management
            </p>
            <p className={`${getTextColorClass(false)} text-sm mt-1`}>
              {translations.role || "Rôle"}: <span className={`${getAccentColorClass()} font-medium`}>{translations.roleNames?.[user?.role?.name] || user?.role?.name}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className={`flex items-center space-x-2 ${getTextColorClass(false)}`}>
              <Clock size={16} />
              <span className="text-sm">
                {currentTime.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <p className={`text-xl font-mono ${getTextColorClass(true)}`}>
              {currentTime.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div>
        <h2 className={`text-xl font-bold ${getTextColorClass(true)} mb-4`}>{translations.systemOverview || "Aperçu du système"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title={translations.activeUsers || "Utilisateurs Actifs"}
            value="12"
            subtitle={translations.newThisWeek || "2 nouveaux cette semaine"}
            color="purple"
          />
          <StatCard
            icon={Shield}
            title={translations.configuredRoles || "Rôles Configurés"}
            value="3"
            subtitle={translations.rolesList || "Admin, Employé, Caissier"}
            color="green"
          />
          <StatCard
            icon={Monitor}
            title={translations.gamingStations || "Postes Gaming"}
            value="24"
            subtitle={translations.availableStations || "18 disponibles"}
            color="blue"
          />
          <StatCard
            icon={Activity}
            title={translations.activeSessions || "Sessions Actives"}
            value="8"
            subtitle={translations.occupationRate || "66% d'occupation"}
            color="orange"
          />
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className={`text-xl font-bold ${getTextColorClass(true)} mb-4`}>{translations.quickActions || "Actions rapides"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableActions.map((action, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border ${getBorderColorClass()} hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
              style={{
                background: getCardBgClass(), // Use CSS variable
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${
                  action.color === 'purple' ? 'from-purple-600 to-blue-600' :
                  action.color === 'green' ? 'from-green-600 to-teal-600' :
                  action.color === 'orange' ? 'from-orange-600 to-red-600' :
                  'from-blue-600 to-indigo-600'
                } shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <action.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`${getTextColorClass(true)} font-semibold group-hover:text-purple-300 transition-colors`}>
                    {action.title}
                  </h3>
                  <p className={`${getTextColorClass(false)} text-sm mt-1`}>
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications système */}
      <div 
        className={`p-6 rounded-xl border ${getWarningBorderClass()}`}
        style={{
          background: getCardBgClass(), // Use CSS variable
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className={`${getWarningColorClass()} mt-1`} size={20} />
          <div>
            <h3 className={`${getTextColorClass(true)} font-semibold`}>{translations.systemNotifications || "Notifications système"}</h3>
            <p className={`${getTextColorClass(false)} text-sm mt-1`}>
              {translations.systemOperational || "Système opérationnel"} - {translations.noCriticalAlerts || "Aucune alerte critique"}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className={`${getTextColorClass(false)} text-xs`}>{translations.databaseStatus || "Base de données: Connectée"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className={`${getTextColorClass(false)} text-xs`}>{translations.servicesStatus || "Services: Opérationnels"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h1 className={`text-2xl font-bold ${getTextColorClass(true)}`}>{translations?.dashboard || 'Dashboard'}</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className={`text-sm mt-2 ${
              stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
            }`}>
              {stat.change} {translations?.lastMonth || 'since last month'}
            </p>
          </div>
        ))}
      </div>

      {/* Graphique placeholder */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          {translations?.recentActivity || 'Recent Activity'}
        </h2>
        <div className="h-64 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
          <p className="text-gray-400 dark:text-gray-300">
            {translations?.activityChartPlaceholder || 'Activity Chart (to be implemented)'}
          </p>
        </div>
      </div>

      {/* Table placeholder */}
      <div 
        className="rounded-lg shadow overflow-hidden"
        style={{ 
          background: 'var(--background-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="p-6 border-b border-purple-400/20">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {translations?.latestTransactions || 'Latest Transactions'}
          </h2>
        </div>
        <div className="p-6">
          <table className="min-w-full divide-y border-purple-400/20">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {translations?.id || 'ID'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {translations?.client || 'Client'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {translations?.amount || 'Amount'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {translations?.status || 'Status'}
                </th>
              </tr>
            </thead>
            <tbody 
              className="divide-y border-purple-400/20"
              style={{ background: 'var(--background-card)' }}
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    TX-{Math.floor(Math.random() * 1000)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    Client {item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {Math.floor(Math.random() * 1000)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item % 3 === 0 ? 'bg-yellow-100 text-yellow-800' :
                      item % 2 === 0 ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item % 3 === 0 ? 
                        (translations?.pending || 'Pending') : 
                        item % 2 === 0 ? 
                        (translations?.completed || 'Completed') : 
                        (translations?.cancelled || 'Cancelled')
                      }
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;

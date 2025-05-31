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
import { useLanguage } from '../../contexts/LanguageContext'; // Importez le hook de langue si déjà mis en place

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'purple' }) => {
  const colorClasses = {
    purple: 'from-purple-600 to-blue-600',
    green: 'from-green-600 to-teal-600',
    orange: 'from-orange-600 to-red-600',
    blue: 'from-blue-600 to-indigo-600'
  };

  return (
    <div 
      className="p-6 rounded-xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105"
      style={{
        background: 'rgba(30, 41, 59, 0.6)',
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
          <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
          <p className="text-white text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
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
      title: 'Gestion Utilisateurs',
      description: 'Créer et gérer les comptes utilisateurs',
      icon: Users,
      permission: 'MANAGE_USERS',
      color: 'purple',
      path: '/dashboard/users'
    },
    {
      title: 'Gestion Rôles',
      description: 'Configurer les rôles et permissions',
      icon: Shield,
      permission: 'MANAGE_ROLES',
      color: 'green',
      path: '/dashboard/roles'
    },
    {
      title: 'Permissions',
      description: 'Gérer les permissions système',
      icon: Key,
      permission: 'MANAGE_PERMISSIONS',
      color: 'orange',
      path: '/dashboard/permissions'
    },
    {
      title: 'Postes Gaming',
      description: 'Configurer les postes de jeu',
      icon: Monitor,
      permission: 'MANAGE_POSTES',
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
        className="p-6 rounded-xl border border-purple-400/20"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenue, {user?.firstName} !
            </h1>
            <p className="text-gray-300">
              Tableau de bord - Gaming Center Management
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Rôle: <span className="text-purple-400 font-medium">{user?.role?.name}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="flex items-center space-x-2 text-gray-300">
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
            <p className="text-white text-xl font-mono">
              {currentTime.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Aperçu du système</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Utilisateurs Actifs"
            value="12"
            subtitle="2 nouveaux cette semaine"
            color="purple"
          />
          <StatCard
            icon={Shield}
            title="Rôles Configurés"
            value="3"
            subtitle="Admin, Employé, Caissier"
            color="green"
          />
          <StatCard
            icon={Monitor}
            title="Postes Gaming"
            value="24"
            subtitle="18 disponibles"
            color="blue"
          />
          <StatCard
            icon={Activity}
            title="Sessions Actives"
            value="8"
            subtitle="66% d'occupation"
            color="orange"
          />
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableActions.map((action, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
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
                  <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
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
        className="p-6 rounded-xl border border-orange-400/20"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-orange-400 mt-1" size={20} />
          <div>
            <h3 className="text-white font-semibold">Notifications système</h3>
            <p className="text-gray-300 text-sm mt-1">
              Système opérationnel - Aucune alerte critique
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400 text-xs">Base de données: Connectée</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400 text-xs">Services: Opérationnels</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODIFICATION : Utilisation de la traduction pour le titre et ajout dark: */}
      {/* text-gray-800 en mode clair, dark:text-gray-200 en mode sombre */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{translations?.dashboard || 'Dashboard'}</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          // MODIFICATION : Ajout de classes dark: pour les cartes de statistiques
          // bg-white en mode clair, dark:bg-gray-700 en mode sombre
          <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
            {/* text-gray-500 en mode clair, dark:text-gray-400 en mode sombre */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
            {/* text-gray-900 en mode clair, dark:text-gray-100 en mode sombre */}
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className={`text-sm mt-2 ${
              stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
            }`}>
              {stat.change} {translations?.lastMonth || 'since last month'} {/* Utilisation de la traduction */}
            </p>
          </div>
        ))}
      </div>

      {/* Graphique placeholder */}
      {/* MODIFICATION : Ajout de classes dark: pour le placeholder du graphique */}
      {/* bg-white en mode clair, dark:bg-gray-700 en mode sombre */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        {/* MODIFICATION : Utilisation de la traduction pour le titre et ajout dark: */}
        {/* text-gray-800 en mode clair, dark:text-gray-200 en mode sombre */}
        <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">{translations?.recentActivity || 'Recent Activity'}</h2>
        {/* MODIFICATION : Ajout de classes dark: et utilisation de la traduction */}
        {/* bg-gray-100 en mode clair, dark:bg-gray-600 en mode sombre */}
        {/* text-gray-400 en mode clair, dark:text-gray-300 en mode sombre */}
        <div className="h-64 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
          <p className="text-gray-400 dark:text-gray-300">{translations?.activityChartPlaceholder || 'Activity Chart (to be implemented)'}</p>
        </div>
      </div>

      {/* Table placeholder */}
      {/* MODIFICATION : Ajout de classes dark: pour le tableau */}
      {/* bg-white en mode clair, dark:bg-gray-700 en mode sombre */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
        {/* MODIFICATION : Utilisation de la traduction pour le titre et ajout dark: */}
        {/* border-gray-200 en mode clair, dark:border-gray-600 en mode sombre */}
        {/* text-gray-800 en mode clair, dark:text-gray-200 en mode sombre */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">{translations?.latestTransactions || 'Latest Transactions'}</h2>
        </div>
        <div className="p-6">
          {/* divide-y divide-gray-200 en mode clair, dark:divide-gray-600 en mode sombre */}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead>
              <tr>
                {/* MODIFICATION : Utilisation des traductions pour les en-têtes et ajout dark: */}
                {/* text-gray-500 en mode clair, dark:text-gray-400 en mode sombre */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{translations?.id || 'ID'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{translations?.client || 'Client'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{translations?.amount || 'Amount'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{translations?.status || 'Status'}</th>
              </tr>
            </thead>
            {/* bg-white en mode clair, dark:bg-gray-700 en mode sombre */}
            {/* divide-y divide-gray-200 en mode clair, dark:divide-gray-600 en mode sombre */}
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {[1, 2, 3, 4, 5].map((item) => (
                // hover:bg-gray-50 en mode clair, dark:hover:bg-gray-600 en mode sombre
                <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  {/* text-gray-500 en mode clair, dark:text-gray-300 en mode sombre */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">TX-{Math.floor(Math.random() * 1000)}</td>
                   {/* text-gray-900 en mode clair, dark:text-gray-100 en mode sombre */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Client {item}</td>
                   {/* text-gray-900 en mode clair, dark:text-gray-100 en mode sombre */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{Math.floor(Math.random() * 1000)} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item % 3 === 0 ? 'bg-yellow-100 text-yellow-800' :
                      item % 2 === 0 ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {/* MODIFICATION : Utilisation des traductions pour le statut */}
                      {item % 3 === 0 ? (translations?.pending || 'Pending') : item % 2 === 0 ? (translations?.completed || 'Completed') : (translations?.cancelled || 'Cancelled')}
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

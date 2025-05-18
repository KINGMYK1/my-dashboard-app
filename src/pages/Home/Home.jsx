import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext'; // Importez le hook de langue si déjà mis en place

// Page d'accueil d'exemple
const Home = () => {
  // Si vous avez déjà mis en place le contexte de langue, utilisez le hook
  const { translations } = useLanguage();

  // Données d'exemples pour le dashboard
  const stats = [
    // Utilisation des traductions pour les titres si le contexte de langue est présent
    { title: translations?.activeUsers || 'Active Users', value: '8,249', change: '+5.25%' },
    { title: translations?.revenue || 'Revenue', value: '12,540 €', change: '+10.32%' },
    { title: translations?.projects || 'Projects', value: '142', change: '+2.15%' },
    { title: translations?.successRate || 'Success Rate', value: '89.4%', change: '+1.25%' }
  ];

  return (
    <div className="space-y-6">
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

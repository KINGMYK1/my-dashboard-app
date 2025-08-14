import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const TransactionsSimple = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // Données d'exemple pour commencer
  const statsData = [
    {
      title: 'Total des transactions',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Chiffre d\'affaires',
      value: '12,450 MAD',
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'En attente',
      value: '8',
      change: '-3',
      changeType: 'negative',
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Complétées',
      value: '148',
      change: '+15',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'emerald'
    }
  ];

  const recentTransactions = [
    {
      id: 'TR001',
      client: 'Ahmed Ben Ali',
      montant: 45.00,
      modePaiement: 'Espèces',
      statut: 'Complétée',
      date: '2025-06-30 14:30'
    },
    {
      id: 'TR002',
      client: 'Fatima Zahra',
      montant: 60.00,
      modePaiement: 'Carte',
      statut: 'Complétée',
      date: '2025-06-30 13:15'
    },
    {
      id: 'TR003',
      client: 'Mohamed Alami',
      montant: 120.00,
      modePaiement: 'Virement',
      statut: 'En attente',
      date: '2025-06-30 12:45'
    },
    {
      id: 'TR004',
      client: 'Nadia Idrissi',
      montant: 75.00,
      modePaiement: 'Espèces',
      statut: 'Complétée',
      date: '2025-06-30 11:20'
    }
  ];

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Complétée': return 'text-green-600 bg-green-100';
      case 'En attente': return 'text-orange-600 bg-orange-100';
      case 'Échouée': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100',
      emerald: 'text-emerald-600 bg-emerald-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Transactions
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestion et suivi des transactions du gaming center
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <DollarSign className="w-4 h-4 mr-2" />
            Nouvelle transaction
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`
              ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              border rounded-xl p-6 transition-all hover:shadow-lg
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} ce mois
                </p>
              </div>
              <div className={`p-3 rounded-xl ${getIconColor(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions récentes */}
      <div className={`
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border rounded-xl
      `}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Transactions récentes
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Client
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Montant
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Mode de paiement
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Statut
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {transaction.id}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {transaction.client}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {transaction.montant.toFixed(2)} MAD
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {transaction.modePaiement}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      getStatutColor(transaction.statut)
                    }`}>
                      {transaction.statut}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {transaction.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message informatif temporaire */}
      <div className={`
        ${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}
        border rounded-xl p-4
      `}>
        <div className="flex items-start">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              Système de gestion des transactions
            </h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              La gestion complète des transactions est intégrée dans le modal de fin de session. 
              Cette page affiche un aperçu des transactions récentes et des statistiques.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsSimple;

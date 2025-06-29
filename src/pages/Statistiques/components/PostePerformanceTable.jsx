import React from 'react';
import { Monitor, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';

const PostePerformanceTable = ({ postes = [], loading = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'EXCELLENTE': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'BONNE': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'MOYENNE': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'FAIBLE': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Poste
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Revenus
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Sessions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Heures
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Performance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tendance
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {postes.map((poste) => (
            <tr key={poste.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Monitor className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {poste.nom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {poste.typePoste}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(poste.revenus)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {poste.nombreSessions}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDuration(poste.heuresUtilisation * 60)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(poste.performance)}`}>
                  {poste.performance}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {poste.tendance === 'CROISSANTE' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : poste.tendance === 'DECROISSANTE' ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : (
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {postes.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun poste à afficher</p>
        </div>
      )}
    </div>
  );
};

export default PostePerformanceTable;
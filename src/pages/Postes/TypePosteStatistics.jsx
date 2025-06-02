import React from 'react';
import { X, BarChart3, TrendingUp, DollarSign, Clock, Users, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTypePosteStatistics } from '../../hooks/useTypePostes';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const TypePosteStatistics = ({ typePoste, onClose }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const { data: statistics, isLoading, isError } = useTypePosteStatistics(typePoste?.id);

  // Styles dynamiques basés sur le thème
  const getBgColorClass = () => isDarkMode ? 'bg-gray-800' : 'bg-white';
  const getTextColorClass = (isPrimary) => isDarkMode 
    ? (isPrimary ? 'text-white' : 'text-gray-300') 
    : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  const getBorderColorClass = () => isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const getCardBgClass = () => isDarkMode ? 'bg-gray-700' : 'bg-gray-50';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (!typePoste) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${getBgColorClass()} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 ${getBorderColorClass()} border-b`}>
          <div>
            <h2 className={`text-xl font-bold ${getTextColorClass(true)}`}>
              {translations.statistics || 'Statistiques'} - {typePoste.nom}
            </h2>
            <p className={`${getTextColorClass(false)} mt-1`}>
              {translations.detailedAnalysis || 'Analyse détaillée des performances'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${getTextColorClass(false)}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="large" />
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <BarChart3 className={`mx-auto mb-4 ${getTextColorClass(false)}`} size={48} />
              <p className={`${getTextColorClass(false)}`}>
                {translations.errorLoadingStatistics || 'Erreur lors du chargement des statistiques'}
              </p>
            </div>
          ) : statistics ? (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className={`${getCardBgClass()} rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                  <BarChart3 className="mr-2" size={20} />
                  {translations.generalInfo || 'Informations générales'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTextColorClass(true)} mb-1`}>
                      {typePoste.tarifHoraireBase || 0} DH
                    </div>
                    <div className={`text-sm ${getTextColorClass(false)}`}>
                      {translations.hourlyRate || 'Tarif horaire'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTextColorClass(true)} mb-1`}>
                      {statistics.postes?.nombrePostes || 0}
                    </div>
                    <div className={`text-sm ${getTextColorClass(false)}`}>
                      {translations.totalStations || 'Postes total'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTextColorClass(true)} mb-1`}>
                      {statistics.plans?.nombrePlans || 0}
                    </div>
                    <div className={`text-sm ${getTextColorClass(false)}`}>
                      {translations.pricingPlans || 'Plans tarifaires'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques d'utilisation */}
              <div className={`${getCardBgClass()} rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                  <Clock className="mr-2" size={20} />
                  {translations.usageStatistics || 'Statistiques d\'utilisation'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Clock size={20} />}
                    title={translations.totalHours || 'Heures totales'}
                    value={`${parseFloat(statistics.postes?.heuresUtilisationTotales || 0).toFixed(1)}h`}
                    themeClasses={{ getTextColorClass, getCardBgClass }}
                  />
                  
                  <StatCard
                    icon={<Users size={20} />}
                    title={translations.totalSessions || 'Sessions totales'}
                    value={statistics.postes?.nombreSessionsTotales || 0}
                    themeClasses={{ getTextColorClass, getCardBgClass }}
                  />
                  
                  <StatCard
                    icon={<TrendingUp size={20} />}
                    title={translations.occupancyRate || 'Taux d\'occupation'}
                    value={formatPercentage(statistics.postes?.tauxOccupationMoyen)}
                    themeClasses={{ getTextColorClass, getCardBgClass }}
                  />
                  
                  <StatCard
                    icon={<BarChart3 size={20} />}
                    title={translations.planUsage || 'Utilisation plans'}
                    value={statistics.plans?.utilisationsTotales || 0}
                    themeClasses={{ getTextColorClass, getCardBgClass }}
                  />
                </div>
              </div>

              {/* Statistiques financières */}
              <div className={`${getCardBgClass()} rounded-lg p-4`}>
                <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                  <DollarSign className="mr-2" size={20} />
                  {translations.financialStatistics || 'Statistiques financières'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard
                    icon={<DollarSign size={20} />}
                    title={translations.totalRevenue || 'CA total généré'}
                    value={formatCurrency(statistics.postes?.chiffreAffaireTotalGenere)}
                    themeClasses={{ getTextColorClass, getCardBgClass }}
                    highlight={true}
                  />
                  
                  <StatCard
                    icon={<TrendingUp size={20} />}
                    title={translations.planRevenue || 'CA par plans'}
                    value={formatCurrency(statistics.plans?.caGenereParPlans)}
                    themeClasses={{ getTextColorClass, getCardBgClass }}
                  />
                  
                  <StatCard
                    icon={<BarChart3 size={20} />}
                    title={translations.averageRevenuePerHour || 'CA moyen/heure'}
                    value={formatCurrency(
                      statistics.postes?.heuresUtilisationTotales > 0 
                        ? statistics.postes?.chiffreAffaireTotalGenere / statistics.postes?.heuresUtilisationTotales
                        : 0
                    )}
                    themeClasses={{ getTextColorClass, getCardBgClass }}
                  />
                </div>
              </div>

              {/* Plans tarifaires détaillés */}
              {typePoste.plansTarifaires && typePoste.plansTarifaires.length > 0 && (
                <div className={`${getCardBgClass()} rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                    <Calendar className="mr-2" size={20} />
                    {translations.pricingPlansDetails || 'Détails des plans tarifaires'}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`${getBorderColorClass()} border-b`}>
                          <th className={`text-left py-2 px-3 ${getTextColorClass(true)}`}>
                            {translations.plan || 'Plan'}
                          </th>
                          <th className={`text-left py-2 px-3 ${getTextColorClass(true)}`}>
                            {translations.duration || 'Durée'}
                          </th>
                          <th className={`text-left py-2 px-3 ${getTextColorClass(true)}`}>
                            {translations.price || 'Prix'}
                          </th>
                          <th className={`text-left py-2 px-3 ${getTextColorClass(true)}`}>
                            {translations.hourlyEquivalent || 'Équivalent/h'}
                          </th>
                          <th className={`text-left py-2 px-3 ${getTextColorClass(true)}`}>
                            {translations.status || 'Statut'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {typePoste.plansTarifaires.map((plan, index) => (
                          <tr key={index} className={`${getBorderColorClass()} border-b border-opacity-50`}>
                            <td className={`py-2 px-3 ${getTextColorClass(true)}`}>
                              {plan.nom || `Plan ${plan.dureeMinutes}min`}
                            </td>
                            <td className={`py-2 px-3 ${getTextColorClass(false)}`}>
                              {plan.dureeMinutes < 60 
                                ? `${plan.dureeMinutes} min`
                                : `${(plan.dureeMinutes / 60).toFixed(1)}h`
                              }
                            </td>
                            <td className={`py-2 px-3 ${getTextColorClass(true)} font-medium`}>
                              {formatCurrency(plan.prix)}
                            </td>
                            <td className={`py-2 px-3 ${getTextColorClass(false)}`}>
                              {formatCurrency((plan.prix / plan.dureeMinutes) * 60)}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                plan.estActif 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {plan.estActif ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Date de dernière mise à jour */}
              <div className="text-center">
                <p className={`text-sm ${getTextColorClass(false)}`}>
                  {translations.lastUpdate || 'Dernière mise à jour'}: {' '}
                  {statistics.dateCalcul ? new Date(statistics.dateCalcul).toLocaleString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className={`mx-auto mb-4 ${getTextColorClass(false)}`} size={48} />
              <p className={`${getTextColorClass(false)}`}>
                {translations.noStatisticsAvailable || 'Aucune statistique disponible'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour les cartes de statistiques
const StatCard = ({ icon, title, value, highlight = false, themeClasses }) => {
  const { getTextColorClass, getCardBgClass } = themeClasses;
  
  return (
    <div className={`${getCardBgClass()} rounded-lg p-4 text-center ${highlight ? 'ring-2 ring-blue-500' : ''}`}>
      <div className={`${getTextColorClass(false)} mb-2 flex justify-center`}>
        {icon}
      </div>
      <div className={`text-2xl font-bold mb-1 ${getTextColorClass(true)} ${highlight ? 'text-blue-600 dark:text-blue-400' : ''}`}>
        {value}
      </div>
      <div className={`text-sm ${getTextColorClass(false)}`}>
        {title}
      </div>
    </div>
  );
};

export default TypePosteStatistics;
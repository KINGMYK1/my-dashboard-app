import React from 'react';
import { X, BarChart3, TrendingUp, DollarSign, Clock, Users, Calendar, Star, Package, Euro } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTypeAbonnementStatistiques } from '../../hooks/useTypesAbonnements';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Portal from '../../components/Portal/Portal';

const TypeAbonnementStatistics = ({ type, onClose }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const { data: statistics, isLoading, isError } = useTypeAbonnementStatistiques(type?.id);

  // Styles dynamiques basés sur le thème
  const getBgColorClass = () => isDarkMode ? 'bg-gray-800' : 'bg-white';
  const getTextColorClass = (isPrimary) => isDarkMode 
    ? (isPrimary ? 'text-white' : 'text-gray-300') 
    : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  const getBorderColorClass = () => isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const getCardBgClass = () => isDarkMode ? 'bg-gray-750' : 'bg-gray-50';

  // Fonctions de formatage
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    return (value || 0).toLocaleString('fr-FR');
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${getBgColorClass()} rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden`}>
          
          {/* En-tête */}
          <div className={`flex justify-between items-center p-6 ${getBorderColorClass()} border-b`}>
            <div>
              <h2 className={`text-xl font-bold ${getTextColorClass(true)} flex items-center`}>
                <BarChart3 className="w-6 h-6 mr-3 text-purple-600" />
                {translations.statistics || 'Statistiques'} - {type.nom}
              </h2>
              <p className={`${getTextColorClass(false)} mt-1`}>
                {translations.detailedAnalysis || 'Analyse détaillée des performances du type d\'abonnement'}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${getTextColorClass(false)}`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Corps */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
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
                
                {/* Informations générales du type */}
                <div className={`${getCardBgClass()} rounded-lg p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                    <Package className="mr-2" size={20} />
                    {translations.generalInfo || 'Informations générales'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getTextColorClass(true)} mb-2`}>
                        {formatCurrency(type.prixPackage)}
                      </div>
                      <div className={`text-sm ${getTextColorClass(false)}`}>
                        Prix du package
                      </div>
                      <div className={`text-xs ${getTextColorClass(false)} mt-1`}>
                        pour {type.nombreHeures}h
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getTextColorClass(true)} mb-2`}>
                        {formatCurrency(type.prixPackage / type.nombreHeures)}
                      </div>
                      <div className={`text-sm ${getTextColorClass(false)}`}>
                        Prix/heure équivalent
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getTextColorClass(true)} mb-2`}>
                        {type.dureeValiditeMois}
                      </div>
                      <div className={`text-sm ${getTextColorClass(false)}`}>
                        Mois de validité
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getTextColorClass(true)} mb-2 flex items-center justify-center`}>
                        {type.estPromo ? (
                          <Star className="w-8 h-8 text-yellow-500" />
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                      <div className={`text-sm ${getTextColorClass(false)}`}>
                        {type.estPromo ? 'Promotion active' : 'Type normal'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques de vente */}
                <div className={`${getCardBgClass()} rounded-lg p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                    <TrendingUp className="mr-2" size={20} />
                    {translations.salesStatistics || 'Statistiques de vente'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={<Package size={20} />}
                      title={translations.totalSales || 'Ventes totales'}
                      value={formatNumber(statistics.ventes?.nombreVentes || 0)}
                      themeClasses={{ getTextColorClass, getCardBgClass }}
                    />
                    
                    <StatCard
                      icon={<DollarSign size={20} />}
                      title={translations.totalRevenue || 'CA total généré'}
                      value={formatCurrency(statistics.ventes?.chiffreAffaireTotal || 0)}
                      themeClasses={{ getTextColorClass, getCardBgClass }}
                      highlight={true}
                    />
                    
                    <StatCard
                      icon={<TrendingUp size={20} />}
                      title={translations.averageSaleValue || 'Valeur moyenne'}
                      value={formatCurrency(statistics.ventes?.valeurMoyenne || 0)}
                      themeClasses={{ getTextColorClass, getCardBgClass }}
                    />
                    
                    <StatCard
                      icon={<BarChart3 size={20} />}
                      title={translations.conversionRate || 'Taux de conversion'}
                      value={formatPercentage(statistics.ventes?.tauxConversion || 0)}
                      themeClasses={{ getTextColorClass, getCardBgClass }}
                    />
                  </div>
                </div>

                {/* Statistiques d'utilisation */}
                <div className={`${getCardBgClass()} rounded-lg p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                    <Clock className="mr-2" size={20} />
                    {translations.usageStatistics || 'Statistiques d\'utilisation'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={<Clock size={20} />}
                      title={translations.totalHours || 'Heures consommées'}
                      value={`${parseFloat(statistics.utilisation?.heuresConsommees || 0).toFixed(1)}h`}
                      themeClasses={{ getTextColorClass, getCardBgClass }}
                    />
                    
                    <StatCard
                      icon={<Users size={20} />}
                      title={translations.activeSessions || 'Sessions actives'}
                      value={formatNumber(statistics.utilisation?.sessionsActives || 0)}
                      themeClasses={{ getTextColorClass, getCardBgClass }}
                    />
                    
                    <StatCard
                      icon={<TrendingUp size={20} />}
                      title={translations.utilizationRate || 'Taux d\'utilisation'}
                      value={formatPercentage(statistics.utilisation?.tauxUtilisation || 0)}
                      themeClasses={{ getTextColorClass, getCardBgClass }}
                    />
                    
                    <StatCard
                      icon={<BarChart3 size={20} />}
                      title={translations.averageSessionDuration || 'Durée moy. session'}
                      value={`${parseFloat(statistics.utilisation?.dureeMoyenneSession || 0).toFixed(1)}h`}
                      themeClasses={{ getTextColorClass, getCardBgClass }}
                    />
                  </div>
                </div>

                {/* Comparaison avec d'autres types */}
                {statistics.comparaison && (
                  <div className={`${getCardBgClass()} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                      <BarChart3 className="mr-2" size={20} />
                      {translations.comparison || 'Comparaison avec autres types'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className={`text-2xl font-bold ${getTextColorClass(true)} mb-2`}>
                          #{statistics.comparaison.rangVentes || '-'}
                        </div>
                        <div className={`text-sm ${getTextColorClass(false)}`}>
                          Rang par ventes
                        </div>
                      </div>
                      
                      <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className={`text-2xl font-bold ${getTextColorClass(true)} mb-2`}>
                          #{statistics.comparaison.rangChiffreAffaire || '-'}
                        </div>
                        <div className={`text-sm ${getTextColorClass(false)}`}>
                          Rang par CA
                        </div>
                      </div>
                      
                      <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className={`text-2xl font-bold ${getTextColorClass(true)} mb-2`}>
                          {formatPercentage(statistics.comparaison.partMarche || 0)}
                        </div>
                        <div className={`text-sm ${getTextColorClass(false)}`}>
                          Part de marché
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Évolution temporelle */}
                {statistics.evolution && statistics.evolution.length > 0 && (
                  <div className={`${getCardBgClass()} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                      <Calendar className="mr-2" size={20} />
                      {translations.timeEvolution || 'Évolution dans le temps'}
                    </h3>
                    
                    <div className="space-y-4">
                      {statistics.evolution.map((periode, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                          <div>
                            <div className={`font-medium ${getTextColorClass(true)}`}>
                              {periode.periode}
                            </div>
                            <div className={`text-sm ${getTextColorClass(false)}`}>
                              {periode.nombreVentes} ventes
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${getTextColorClass(true)}`}>
                              {formatCurrency(periode.chiffreAffaire)}
                            </div>
                            <div className={`text-sm ${periode.evolution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {periode.evolution >= 0 ? '+' : ''}{formatPercentage(periode.evolution)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Types de postes utilisés */}
                {statistics.typePostesUtilises && statistics.typePostesUtilises.length > 0 && (
                  <div className={`${getCardBgClass()} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                      <Users className="mr-2" size={20} />
                      {translations.stationTypesUsed || 'Types de postes utilisés'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {statistics.typePostesUtilises.map((typePoste, index) => (
                        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className={`font-medium ${getTextColorClass(true)} mb-2`}>
                            {typePoste.nom}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className={getTextColorClass(false)}>Sessions:</span>
                              <span className={getTextColorClass(true)}>{typePoste.nombreSessions}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className={getTextColorClass(false)}>Heures:</span>
                              <span className={getTextColorClass(true)}>{typePoste.heuresUtilisees}h</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className={getTextColorClass(false)}>Part:</span>
                              <span className={getTextColorClass(true)}>{formatPercentage(typePoste.pourcentage)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommandations */}
                {statistics.recommandations && statistics.recommandations.length > 0 && (
                  <div className={`${getCardBgClass()} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)} flex items-center`}>
                      <Star className="mr-2" size={20} />
                      {translations.recommendations || 'Recommandations'}
                    </h3>
                    
                    <div className="space-y-3">
                      {statistics.recommandations.map((recommandation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className={`font-medium ${getTextColorClass(true)} mb-1`}>
                              {recommandation.titre}
                            </div>
                            <div className={`text-sm ${getTextColorClass(false)}`}>
                              {recommandation.description}
                            </div>
                            {recommandation.impact && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Impact estimé: {recommandation.impact}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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
    </Portal>
  );
};

// Composant pour les cartes de statistiques
const StatCard = ({ icon, title, value, highlight = false, themeClasses }) => {
  const { getTextColorClass, getCardBgClass } = themeClasses;
  
  return (
    <div className={`${getCardBgClass()} rounded-lg p-4 text-center ${highlight ? 'ring-2 ring-purple-500' : 'border border-gray-200 dark:border-gray-700'}`}>
      <div className={`${getTextColorClass(false)} mb-2 flex justify-center`}>
        {icon}
      </div>
      <div className={`text-2xl font-bold mb-1 ${getTextColorClass(true)} ${highlight ? 'text-purple-600 dark:text-purple-400' : ''}`}>
        {value}
      </div>
      <div className={`text-sm ${getTextColorClass(false)}`}>
        {title}
      </div>
    </div>
  );
};

export default TypeAbonnementStatistics;
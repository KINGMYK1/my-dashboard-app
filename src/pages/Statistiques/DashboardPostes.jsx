import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDashboardPostes } from '../../hooks/useStatistiques';
import { 
  formatDuree, 
  formatMontant, 
  formatPourcentage, 
  getCouleursPerformance 
} from '../../utils/statistiquesUtils';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

const DashboardPostes = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';

  const [periode, setPeriode] = useState('semaine');
  const [filtrePerformance, setFiltrePerformance] = useState('all');

  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useDashboardPostes(periode);

  const handleExport = () => {
    // TODO: Implémenter l'export des données
    console.log('Export dashboard postes');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" text="Chargement du dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>Erreur lors du chargement du dashboard</p>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="mt-4"
            >
              <RefreshCw size={16} className="mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { postes, totaux, moyenne } = dashboardData?.data || {};

  // Filtrer les postes selon la performance
  const postesFiltres = postes?.filter(poste => {
    if (filtrePerformance === 'all') return true;
    return poste.performance === filtrePerformance;
  }) || [];

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard des Postes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vue d'ensemble des performances de vos postes gaming
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            options={[
              { value: 'jour', label: 'Aujourd\'hui' },
              { value: 'semaine', label: 'Cette semaine' },
              { value: 'mois', label: 'Ce mois' },
              { value: 'trimestre', label: 'Ce trimestre' }
            ]}
          />

          <Select
            value={filtrePerformance}
            onChange={(e) => setFiltrePerformance(e.target.value)}
            options={[
              { value: 'all', label: 'Toutes performances' },
              { value: 'EXCELLENTE', label: 'Excellente' },
              { value: 'BONNE', label: 'Bonne' },
              { value: 'MOYENNE', label: 'Moyenne' },
              { value: 'FAIBLE', label: 'Faible' }
            ]}
          />

          <Button variant="outline" onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Exporter
          </Button>

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Métriques générales */}
      {totaux && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetriqueGeneraleCard
            icon={DollarSign}
            title="Revenus totaux"
            value={formatMontant(totaux.totalRevenus)}
            moyenne={formatMontant(moyenne.revenuParPoste)}
            subtitle="Moyenne par poste"
            color="green"
            isDarkMode={isDarkMode}
          />
          
          <MetriqueGeneraleCard
            icon={Clock}
            title="Heures d'utilisation"
            value={formatDuree(totaux.totalHeures * 60)}
            moyenne={formatDuree(moyenne.heuresParPoste * 60)}
            subtitle="Moyenne par poste"
            color="blue"
            isDarkMode={isDarkMode}
          />
          
          <MetriqueGeneraleCard
            icon={Users}
            title="Sessions totales"
            value={totaux.totalSessions.toString()}
            moyenne={Math.round(moyenne.sessionsParPoste).toString()}
            subtitle="Moyenne par poste"
            color="purple"
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Liste des postes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 size={20} />
            <span>Performance des Postes</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({postesFiltres.length} postes)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {postesFiltres.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun poste trouvé avec les filtres sélectionnés
            </div>
          ) : (
            <div className="space-y-4">
              {postesFiltres.map((poste) => (
                <PostePerformanceCard 
                  key={poste.id} 
                  poste={poste} 
                  isDarkMode={isDarkMode} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Composant pour les métriques générales
const MetriqueGeneraleCard = ({ 
  icon: Icon, 
  title, 
  value, 
  moyenne, 
  subtitle, 
  color, 
  isDarkMode 
}) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-indigo-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}:</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{moyenne}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour la performance d'un poste
const PostePerformanceCard = ({ poste, isDarkMode }) => {
  const couleursPerformance = getCouleursPerformance(poste.performance);

  return (
    <div className={`p-4 rounded-lg border ${couleursPerformance.border} ${couleursPerformance.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className={`font-semibold ${couleursPerformance.text}`}>
              {poste.nom}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs ${couleursPerformance.bg} ${couleursPerformance.text}`}>
              {poste.typePoste}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${couleursPerformance.bg} ${couleursPerformance.text}`}>
              {poste.performance}
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Revenus</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatMontant(poste.statsPeriode.revenus)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Heures</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDuree(poste.statsPeriode.heuresUtilisees * 60)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sessions</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {poste.statsPeriode.nombreSessions}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Occupation</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatPourcentage(poste.statsPeriode.tauxOccupation)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-lg font-bold ${couleursPerformance.text}`}>
            {formatMontant(poste.statsPeriode.revenuMoyenParHeure)}/h
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Revenu/heure</p>
        </div>
      </div>

      {/* Alertes du poste */}
      {poste.alertes && poste.alertes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Alertes:</span>
            <div className="flex space-x-1">
              {poste.alertes.slice(0, 2).map((alerte, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-1 rounded ${
                    alerte.type === 'WARNING' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : alerte.type === 'ERROR'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  }`}
                >
                  {alerte.titre}
                </span>
              ))}
              {poste.alertes.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{poste.alertes.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPostes;
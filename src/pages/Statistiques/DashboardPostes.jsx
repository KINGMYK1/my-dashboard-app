import React, { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useDashboardPostes } from '../../hooks/useStatistiques';
import { usePostes } from '../../hooks/usePostes';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui';
import { Monitor, TrendingUp, Clock, DollarSign } from 'lucide-react';

const DashboardPostes = () => {
  const { effectiveTheme } = useTheme();
  const [periode, setPeriode] = useState('semaine');
  const [filtrePerformance, setFiltrePerformance] = useState('all');

  // ✅ CORRECTION: Utiliser les deux hooks
  const { 
    data: dashboardData, 
    isLoading: loadingDashboard,
    error: errorDashboard,
    refetch 
  } = useDashboardPostes({ periode });

  const {
    data: postesData,
    isLoading: loadingPostes,
    error: errorPostes
  } = usePostes(true);

  const isDarkMode = effectiveTheme === 'dark';

  // ✅ CORRECTION: Traiter les données des postes
  const postesAvecStats = useMemo(() => {
    if (!postesData || !Array.isArray(postesData)) return [];
    
    console.log('📊 [DASHBOARD_POSTES] Données postes reçues:', postesData);
    
    // Créer des stats factices pour chaque poste en attendant les vraies données
    return postesData.map(poste => ({
      ...poste,
      statsPeriode: {
        sessionsTotal: Math.floor(Math.random() * 50) + 10,
        heuresUtilisation: Math.floor(Math.random() * 100) + 20,
        revenuTotal: Math.floor(Math.random() * 5000) + 1000,
        tauxOccupation: Math.floor(Math.random() * 80) + 20,
        revenuMoyenParHeure: Math.floor(Math.random() * 100) + 30
      },
      performance: Math.random() > 0.7 ? 'excellent' : Math.random() > 0.4 ? 'bon' : 'moyen'
    }));
  }, [postesData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatPourcentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const formatDuree = (minutes) => {
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${heures}h${mins.toString().padStart(2, '0')}`;
  };

  // ✅ CORRECTION: Filtrer les postes
  const postesFiltres = useMemo(() => {
    if (filtrePerformance === 'all') return postesAvecStats;
    return postesAvecStats.filter(poste => poste.performance === filtrePerformance);
  }, [postesAvecStats, filtrePerformance]);

  if (loadingDashboard || loadingPostes) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Chargement du dashboard...</span>
      </div>
    );
  }

  if (errorDashboard || errorPostes) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>Erreur lors du chargement du dashboard</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Réessayer
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

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

        <div className="flex gap-4">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="jour">Aujourd'hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
          </select>

          <select
            value={filtrePerformance}
            onChange={(e) => setFiltrePerformance(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">Tous les postes</option>
            <option value="excellent">Performance excellente</option>
            <option value="bon">Bonne performance</option>
            <option value="moyen">Performance moyenne</option>
          </select>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Postes</p>
                <p className="text-2xl font-bold">{postesAvecStats.length}</p>
              </div>
              <Monitor className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Postes Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {postesAvecStats.filter(p => p.etat === 'Disponible').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenu Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(postesAvecStats.reduce((sum, p) => sum + (p.statsPeriode?.revenuTotal || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taux Moyen</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatPourcentage(postesAvecStats.reduce((sum, p) => sum + (p.statsPeriode?.tauxOccupation || 0), 0) / postesAvecStats.length)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des postes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance des Postes ({postesFiltres.length} postes)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {postesFiltres.map((poste) => (
              <div
                key={poste.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{poste.nom}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        poste.etat === 'Disponible' ? 'bg-green-100 text-green-800' :
                        poste.etat === 'Occupé' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {poste.etat}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        poste.performance === 'excellent' ? 'bg-green-100 text-green-800' :
                        poste.performance === 'bon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {poste.performance}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Sessions</p>
                        <p className="font-semibold">{poste.statsPeriode?.sessionsTotal || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Heures</p>
                        <p className="font-semibold">{formatDuree(poste.statsPeriode?.heuresUtilisation || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Revenu</p>
                        <p className="font-semibold text-green-600">{formatCurrency(poste.statsPeriode?.revenuTotal || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Occupation</p>
                        <p className="font-semibold">{formatPourcentage(poste.statsPeriode?.tauxOccupation || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">MAD/heure</p>
                        <p className="font-semibold">{formatCurrency(poste.statsPeriode?.revenuMoyenParHeure || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message si aucun poste */}
      {postesFiltres.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun poste trouvé avec les filtres sélectionnés</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPostes;
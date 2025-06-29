import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Users, 
  Clock, AlertTriangle, RefreshCw, Download,
  Calendar, Filter, PieChart, Activity
} from 'lucide-react';
import { Card, Button, Select, DatePicker, Badge } from '../../components/ui';
import { useStatistiques, useTableauDeBord, useEvolutionCA } from '../../hooks/useStatistiques';
import { useNotification } from '../../contexts/NotificationContext';
import StatistiquesChart from '../Statistiques/components/StatistiquesChart';
import MetriquesRapides from './components/MetriquesRapides';
import AlertesFinancieres from './components/AlertesFinancieres';
import TopPostes from './components/TopPostes';

const DashboardStatistiques = () => {
  const { showSuccess, showError } = useNotification();
  
  // États pour les filtres
  const [periode, setPeriode] = useState('mois');
  const [groupBy, setGroupBy] = useState('day');
  const [dateDebut, setDateDebut] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateFin, setDateFin] = useState(new Date());

  // Hooks personnalisés
  const { statistiques, loading: statsLoading, refresh: refreshStats } = useStatistiques({
    dateDebut,
    dateFin,
    groupBy,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  });

  const { tableauDeBord, loading: dashboardLoading, refresh: refreshDashboard } = useTableauDeBord({
    dateDebut,
    dateFin
  });

  const { evolution, loading: evolutionLoading } = useEvolutionCA(periode, groupBy);

  const loading = statsLoading || dashboardLoading || evolutionLoading;

  // Gestion du refresh global
  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refreshStats(),
        refreshDashboard()
      ]);
      showSuccess('Données actualisées avec succès');
    } catch (error) {
      showError('Erreur lors de l\'actualisation des données');
    }
  };

  // Export des données
  const handleExport = async (type) => {
    try {
      await statistiquesService.exporterDonnees(type, {
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString()
      });
      showSuccess(`Export ${type.toUpperCase()} généré avec succès`);
    } catch (error) {
      showError('Erreur lors de l\'export');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading && !statistiques) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            Tableau de Bord Statistiques
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Vue d'ensemble des performances financières et opérationnelles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={periode}
            onChange={setPeriode}
            options={[
              { value: 'semaine', label: 'Cette semaine', icon: <Calendar className="w-4 h-4" /> },
              { value: 'mois', label: 'Ce mois', icon: <Calendar className="w-4 h-4" /> },
              { value: 'trimestre', label: 'Ce trimestre', icon: <Calendar className="w-4 h-4" /> },
              { value: 'annee', label: 'Cette année', icon: <Calendar className="w-4 h-4" /> }
            ]}
          />

          <Select
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { value: 'hour', label: 'Par heure' },
              { value: 'day', label: 'Par jour' },
              { value: 'week', label: 'Par semaine' },
              { value: 'month', label: 'Par mois' }
            ]}
          />

          <DatePicker
            value={dateDebut}
            onChange={setDateDebut}
            label="Du"
          />

          <DatePicker
            value={dateFin}
            onChange={setDateFin}
            label="Au"
          />

          <Button
            onClick={handleRefreshAll}
            disabled={loading}
            variant="outline"
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Actualiser
          </Button>

          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Métriques rapides */}
      {statistiques && (
        <MetriquesRapides 
          statistiques={statistiques}
          tableauDeBord={tableauDeBord}
          loading={loading}
        />
      )}

      {/* Alertes financières */}
      {tableauDeBord?.alertes && (
        <AlertesFinancieres alertes={tableauDeBord.alertes} />
      )}

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution du CA */}
        {statistiques?.evolutionTemporelle && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Évolution du Chiffre d'Affaires
              </h3>
              <Badge variant="info">
                {formatCurrency(statistiques.resume.chiffreAffaireBrut)}
              </Badge>
            </div>
            <StatistiquesChart 
              data={statistiques.evolutionTemporelle}
              type="area"
              dataKey="chiffreAffaire"
              xAxisKey="periode"
              height={300}
              colors={['#10B981']}
            />
          </Card>
        )}

        {/* Répartition par statut */}
        {statistiques?.repartitions?.parStatut && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                Répartition par Statut
              </h3>
              <Badge variant="secondary">
                {statistiques.resume.totalTransactions} transactions
              </Badge>
            </div>
            <StatistiquesChart 
              data={statistiques.repartitions.parStatut}
              type="pie"
              dataKey="montantTotal"
              nameKey="statut"
              height={300}
            />
          </Card>
        )}
      </div>

      {/* Tableau de bord détaillé */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance par poste */}
        {statistiques?.topPostes && (
          <Card className="lg:col-span-2">
            <TopPostes 
              postes={statistiques.topPostes}
              loading={loading}
            />
          </Card>
        )}

        {/* Indicateurs clés */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Indicateurs Clés
          </h3>
          
          {statistiques && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-700">Taux de Paiement</span>
                <span className="text-lg font-bold text-green-600">
                  {formatPercentage(statistiques.performance?.tauxPaiementComplet)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Panier Moyen</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(statistiques.resume.panierMoyen)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-700">En Attente</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(statistiques.resume.montantEnAttente)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-700">Taux d'Encaissement</span>
                <span className="text-lg font-bold text-purple-600">
                  {formatPercentage(statistiques.performance?.tauxEncaissement)}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Graphiques par mode de paiement et type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statistiques?.repartitions?.parModePaiement && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Modes de Paiement</h3>
            <StatistiquesChart 
              data={statistiques.repartitions.parModePaiement}
              type="bar"
              dataKey="montantTotal"
              xAxisKey="mode"
              height={250}
            />
          </Card>
        )}

        {statistiques?.repartitions?.parType && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Types de Transaction</h3>
            <StatistiquesChart 
              data={statistiques.repartitions.parType}
              type="bar"
              dataKey="montantTotal"
              xAxisKey="type"
              height={250}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardStatistiques;
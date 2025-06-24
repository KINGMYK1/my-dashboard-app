import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, BarChart3, 
  PieChart, Activity, Clock, AlertTriangle 
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, Button, Select, DatePicker } from '../../components/ui';
import StatistiquesChart from './components/StatistiquesChart';
import TransactionsTable from './components/TransactionsTable';
import PerformanceMetrics from './components/PerformanceMetrics';
import { statistiquesService } from '../../services/statistiquesService';

const StatistiquesTransactions = () => {
  const { showSuccess, showError } = useNotification();
  
  // États
  const [loading, setLoading] = useState(false);
  const [periode, setPeriode] = useState('mois');
  const [groupBy, setGroupBy] = useState('day');
  const [dateDebut, setDateDebut] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateFin, setDateFin] = useState(new Date());
  
  // Données
  const [statistiques, setStatistiques] = useState(null);
  const [tableauDeBord, setTableauDeBord] = useState(null);
  const [transactionsEnAttente, setTransactionsEnAttente] = useState([]);
  const [comparaison, setComparaison] = useState(null);

  // Charger les données
  useEffect(() => {
    chargerDonnees();
  }, [periode, groupBy, dateDebut, dateFin]);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [statsResult, dashboardResult, enAttenteResult] = await Promise.all([
        statistiquesService.obtenirStatistiquesCompletes({
          dateDebut: dateDebut.toISOString(),
          dateFin: dateFin.toISOString(),
          groupBy
        }),
        statistiquesService.obtenirTableauDeBordFinancier(),
        statistiquesService.getTransactionsEnAttente({ limit: 10 })
      ]);

      setStatistiques(statsResult.data);
      setTableauDeBord(dashboardResult.data);
      setTransactionsEnAttente(enAttenteResult.data.transactions);

      showSuccess('Statistiques mises à jour');
    } catch (error) {
      showError('Erreur lors du chargement des statistiques');
      console.error('Erreur statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const chargerComparaison = async () => {
    try {
      const duree = dateFin - dateDebut;
      const dateFinComparaison = new Date(dateDebut);
      const dateDebutComparaison = new Date(dateDebut - duree);

      const result = await statistiquesService.comparerPeriodes({
        dateDebutActuelle: dateDebut.toISOString(),
        dateFinActuelle: dateFin.toISOString(),
        dateDebutComparaison: dateDebutComparaison.toISOString(),
        dateFinComparaison: dateFinComparaison.toISOString(),
        groupBy
      });

      setComparaison(result.data);
    } catch (error) {
      showError('Erreur lors de la comparaison');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Statistiques des Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analyse détaillée des performances financières
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={periode}
            onChange={setPeriode}
            options={[
              { value: 'semaine', label: 'Cette semaine' },
              { value: 'mois', label: 'Ce mois' },
              { value: 'trimestre', label: 'Ce trimestre' },
              { value: 'annee', label: 'Cette année' }
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
            label="Date début"
          />

          <DatePicker
            value={dateFin}
            onChange={setDateFin}
            label="Date fin"
          />

          <Button
            onClick={chargerComparaison}
            variant="outline"
            icon={<BarChart3 className="w-4 h-4" />}
          >
            Comparer
          </Button>

          <Button
            onClick={chargerDonnees}
            disabled={loading}
            icon={<Activity className="w-4 h-4" />}
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      {statistiques && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chiffre d'Affaires
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(statistiques.resume.chiffreAffaireBrut)}
                </p>
                <p className="text-sm text-gray-500">
                  Encaissé: {formatCurrency(statistiques.resume.chiffreAffaireEncaisse)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            {comparaison && (
              <div className="mt-2 flex items-center">
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  comparaison.evolution.chiffreAffaire >= 0 ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className={`text-sm ${
                  comparaison.evolution.chiffreAffaire >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(comparaison.evolution.chiffreAffaire)}
                </span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {statistiques.resume.totalTransactions}
                </p>
                <p className="text-sm text-gray-500">
                  Validées: {statistiques.resume.transactionsValidees}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Panier Moyen
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(statistiques.resume.panierMoyen)}
                </p>
                <p className="text-sm text-gray-500">
                  Performance: {formatPercentage(statistiques.performance.tauxPaiementComplet)}
                </p>
              </div>
              <PieChart className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  En Attente
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(statistiques.resume.montantEnAttente)}
                </p>
                <p className="text-sm text-gray-500">
                  {statistiques.resume.transactionsEnAttente} transactions
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution temporelle */}
        {statistiques && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution du Chiffre d'Affaires</h3>
            <StatistiquesChart 
              data={statistiques.evolutionTemporelle}
              type="line"
              dataKey="chiffreAffaire"
              xAxisKey="periode"
            />
          </Card>
        )}

        {/* Répartition par statut */}
        {statistiques && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Répartition par Statut</h3>
            <StatistiquesChart 
              data={statistiques.repartitions.parStatut}
              type="pie"
              dataKey="montantTotal"
              nameKey="statut"
            />
          </Card>
        )}
      </div>

      {/* Transactions en attente */}
      {transactionsEnAttente.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Transactions en Attente de Paiement
            </h3>
            <Button
              variant="outline"
              size=
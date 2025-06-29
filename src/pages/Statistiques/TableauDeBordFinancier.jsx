import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Clock, AlertTriangle, 
  Users, Calendar, Award, BarChart3, RefreshCw 
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { useTableauDeBord } from '../../hooks/useStatistiques';
import { useTransactionsEnAttente } from '../../hooks/useStatistiques';
import StatistiquesChart from './components/StatistiquesChart';
import TransactionsTable from './components/TransactionsTable';
import MetriquesTempsReel from './components/MetriquesTempsReel';

const TableauDeBordFinancier = () => {
  const { 
    loading: loadingDashboard, 
    tableauDeBord, 
    actualiser: actualiserDashboard 
  } = useTableauDeBord();
  
  const { 
    loading: loadingTransactions, 
    transactions, 
    statistiques: statsTransactions,
    actualiser: actualiserTransactions 
  } = useTransactionsEnAttente({ limit: 10 });

  const [derniereActualisation, setDerniereActualisation] = useState(new Date());

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActualiserTout = async () => {
    await Promise.all([
      actualiserDashboard(),
      actualiserTransactions()
    ]);
    setDerniereActualisation(new Date());
  };

  const loading = loadingDashboard || loadingTransactions;

  return (
    <div className="space-y-6">
      {/* Header avec actualisation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Tableau de Bord Financier
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vue d'ensemble en temps réel de la performance financière
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Dernière MAJ: {formatDate(derniereActualisation)}
          </span>
          <Button
            onClick={handleActualiserTout}
            disabled={loading}
            variant="outline"
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques temps réel */}
      <MetriquesTempsReel tableauDeBord={tableauDeBord} />

      {/* Vue d'ensemble du jour */}
      {tableauDeBord?.jour && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  CA Aujourd'hui
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(tableauDeBord.jour.resume.chiffreAffaireBrut)}
                </p>
                <p className="text-sm text-gray-500">
                  Encaissé: {formatCurrency(tableauDeBord.jour.resume.chiffreAffaireEncaisse)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  {((tableauDeBord.jour.resume.chiffreAffaireEncaisse / tableauDeBord.jour.resume.chiffreAffaireBrut) * 100).toFixed(1)}% encaissé
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transactions Jour
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {tableauDeBord.jour.resume.totalTransactions}
                </p>
                <p className="text-sm text-gray-500">
                  Panier: {formatCurrency(tableauDeBord.jour.resume.panierMoyen)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  CA Mensuel
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(tableauDeBord.mois?.resume?.chiffreAffaireBrut || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {tableauDeBord.mois?.resume?.totalTransactions || 0} transactions
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Alertes
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {tableauDeBord.alertes?.transactionsUrgentes || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(tableauDeBord.alertes?.montantEnAttente || 0)} en attente
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution horaire du jour */}
        {tableauDeBord?.jour?.evolutionTemporelle && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution Horaire - Aujourd'hui</h3>
            <StatistiquesChart 
              data={tableauDeBord.jour.evolutionTemporelle}
              type="area"
              dataKey="chiffreAffaire"
              xAxisKey="periode"
              height={300}
              formatValue={(value) => formatCurrency(value)}
            />
          </Card>
        )}

        {/* Évolution mensuelle */}
        {tableauDeBord?.mois?.evolutionTemporelle && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution Mensuelle</h3>
            <StatistiquesChart 
              data={tableauDeBord.mois.evolutionTemporelle.slice(-15)} // 15 derniers jours
              type="bar"
              dataKey="chiffreAffaire"
              xAxisKey="periode"
              height={300}
              formatValue={(value) => formatCurrency(value)}
            />
          </Card>
        )}
      </div>

      {/* Top postes et heures de pointe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top postes du jour */}
        {tableauDeBord?.topPostes && tableauDeBord.topPostes.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Top Postes - Aujourd'hui
            </h3>
            <div className="space-y-3">
              {tableauDeBord.topPostes.map((poste, index) => (
                <div key={poste.posteId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{poste.nom}</p>
                      <p className="text-sm text-gray-500">{poste.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(poste.chiffreAffaire)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Heures de pointe */}
        {tableauDeBord?.jour?.heuresPeak && tableauDeBord.jour.heuresPeak.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Heures de Pointe
            </h3>
            <div className="space-y-3">
              {tableauDeBord.jour.heuresPeak.map((heure, index) => (
                <div key={heure.heure} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">{heure.heure}</p>
                      <p className="text-sm text-gray-500">{heure.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{formatCurrency(heure.chiffreAffaire)}</p>
                    <Badge variant="success" size="sm">Peak #{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Transactions en attente */}
      {transactions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Transactions en Attente Urgentes
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {transactions.length} transaction(s) • {formatCurrency(statsTransactions?.montantTotalEnAttente || 0)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/transactions?statut=EN_ATTENTE'}
              >
                Voir tout
              </Button>
            </div>
          </div>
          <TransactionsTable 
            transactions={transactions}
            showActions={true}
            onUpdate={actualiserTransactions}
          />
        </Card>
      )}

      {/* Alertes et notifications */}
      {tableauDeBord?.alertes && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Alertes Système
          </h3>
          
          <div className="space-y-3">
            {tableauDeBord.alertes.transactionsUrgentes > 0 && (
              <div className="flex items-center p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">
                    {tableauDeBord.alertes.transactionsUrgentes} transaction(s) urgente(s)
                  </p>
                  <p className="text-sm text-red-600">
                    Montant total: {formatCurrency(tableauDeBord.alertes.montantEnAttente)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => window.location.href = '/transactions?statut=EN_ATTENTE&urgent=true'}
                >
                  Traiter
                </Button>
              </div>
            )}

            {/* Autres alertes basées sur les seuils */}
            {tableauDeBord.jour?.resume?.chiffreAffaireBrut < 1000 && (
              <div className="flex items-center p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <TrendingUp className="w-5 h-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">Chiffre d'affaires du jour faible</p>
                  <p className="text-sm text-yellow-600">
                    Objectif journalier non atteint • Actions recommandées
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TableauDeBordFinancier;
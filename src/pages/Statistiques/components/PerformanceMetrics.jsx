import React from 'react';
import { TrendingUp, TrendingDown, Target, Users, Clock, DollarSign } from 'lucide-react';
import { Card } from '../../../components/ui';
import StatistiquesChart from './StatistiquesChart';

const PerformanceMetrics = ({ statistiques, tableauDeBord }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value || 0);
  };

  const getPerformanceColor = (value, threshold = 80) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIndicatorIcon = (value, isGood = true) => {
    const isPositive = isGood ? value >= 0 : value < 0;
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Métriques de performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Indicateurs de Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Taux de paiement complet */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Taux de Paiement</h4>
            <p className={`text-2xl font-bold ${getPerformanceColor(statistiques?.performance?.tauxPaiementComplet)}`}>
              {formatPercentage(statistiques?.performance?.tauxPaiementComplet)}
            </p>
            <p className="text-xs text-gray-500">Transactions complètes</p>
          </div>

          {/* Taux d'encaissement */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Taux d'Encaissement</h4>
            <p className={`text-2xl font-bold ${getPerformanceColor(statistiques?.performance?.tauxEncaissement)}`}>
              {formatPercentage(statistiques?.performance?.tauxEncaissement)}
            </p>
            <p className="text-xs text-gray-500">CA encaissé / CA total</p>
          </div>

          {/* Délai moyen de paiement */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Délai Moyen</h4>
            <p className="text-2xl font-bold text-gray-900">
              {statistiques?.performance?.delaiPaiementMoyen || 0}j
            </p>
            <p className="text-xs text-gray-500">Temps de paiement</p>
          </div>

          {/* Panier moyen */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Panier Moyen</h4>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(statistiques?.resume?.panierMoyen)}
            </p>
            <p className="text-xs text-gray-500">Par transaction</p>
          </div>
        </div>
      </Card>

      {/* Répartitions détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par mode de paiement */}
        {statistiques?.repartitions?.parModePaiement && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Modes de Paiement</h3>
            <StatistiquesChart 
              data={statistiques.repartitions.parModePaiement}
              type="pie"
              dataKey="montantTotal"
              nameKey="mode"
              height={250}
              showLegend={true}
            />
          </Card>
        )}

        {/* Répartition par type de transaction */}
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

      {/* Top postes */}
      {statistiques?.topPostes && statistiques.topPostes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Postes par Performance</h3>
          <div className="space-y-3">
            {statistiques.topPostes.slice(0, 5).map((poste, index) => (
              <div key={poste.posteId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{poste.nomPoste}</p>
                    <p className="text-sm text-gray-500">{formatNumber(poste.nombreTransactions)} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(poste.chiffreAffaire)}</p>
                  <p className="text-sm text-gray-500">Panier: {formatCurrency(poste.panierMoyen)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Alertes et recommandations */}
      {tableauDeBord?.alertes && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Alertes et Recommandations
          </h3>
          
          <div className="space-y-3">
            {tableauDeBord.alertes.transactionsUrgentes > 0 && (
              <div className="flex items-center p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <p className="font-medium text-orange-800">Transactions en attente urgentes</p>
                  <p className="text-sm text-orange-600">
                    {tableauDeBord.alertes.transactionsUrgentes} transactions en attente depuis plus de 24h
                    ({formatCurrency(tableauDeBord.alertes.montantEnAttente)} au total)
                  </p>
                </div>
              </div>
            )}

            {statistiques?.performance?.tauxEncaissement < 90 && (
              <div className="flex items-center p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <TrendingDown className="w-5 h-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">Taux d'encaissement faible</p>
                  <p className="text-sm text-yellow-600">
                    Seulement {formatPercentage(statistiques.performance.tauxEncaissement)} du CA est encaissé
                  </p>
                </div>
              </div>
            )}

            {statistiques?.resume?.transactionsPartielles > statistiques?.resume?.transactionsValidees * 0.3 && (
              <div className="flex items-center p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <Clock className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-blue-800">Nombreuses transactions partielles</p>
                  <p className="text-sm text-blue-600">
                    {statistiques.resume.transactionsPartielles} transactions partiellement payées à finaliser
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recommandations */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">💡 Recommandations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Suivre régulièrement les transactions en attente</li>
              <li>• Encourager les paiements immédiats avec des remises</li>
              <li>• Analyser les heures de pointe pour optimiser le personnel</li>
              <li>• Évaluer la performance des postes moins rentables</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PerformanceMetrics;
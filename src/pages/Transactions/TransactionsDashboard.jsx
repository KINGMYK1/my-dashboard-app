import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTransactionsEnAttente, useChiffreAffaireStats } from '../../hooks/useTransactions';

const TransactionsDashboard = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const [selectedPeriod, setSelectedPeriod] = useState('mois');

  // Hooks pour les données
  const { data: transactionsEnAttente, isLoading: loadingTransactions } = useTransactionsEnAttente({
    includePartielles: true
  });

  const { data: statsCA, isLoading: loadingStats } = useChiffreAffaireStats(selectedPeriod);

  // Calculs dérivés
  const statsTransactions = useMemo(() => {
    if (!transactionsEnAttente?.transactions) return null;

    const transactions = transactionsEnAttente.transactions;
    const totalEnAttente = transactions.filter(t => t.statutTransaction === 'EN_ATTENTE').length;
    const totalPartielles = transactions.filter(t => t.statutTransaction === 'PARTIELLEMENT_PAYEE').length;
    const montantTotal = transactions.reduce((sum, t) => sum + parseFloat(t.resteAPayer || 0), 0);

    return {
      totalEnAttente,
      totalPartielles,
      montantTotal,
      total: transactions.length
    };
  }, [transactionsEnAttente]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const cardClass = `p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl ${
    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  }`;

  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  if (loadingTransactions || loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord Financier</h1>
          <p className={textMuted}>Vue d'ensemble des transactions et du chiffre d'affaire</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="jour">Aujourd'hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chiffre d'affaire */}
        <div className={`${cardClass} border-l-4 border-green-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={textMuted}>Chiffre d'Affaire</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(statsCA?.chiffreAffaireTotal || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          {statsCA?.evolutionPourcentage && (
            <div className="mt-2 flex items-center">
              {statsCA.evolutionPourcentage > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${statsCA.evolutionPourcentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(statsCA.evolutionPourcentage).toFixed(1)}% vs période précédente
              </span>
            </div>
          )}
        </div>

        {/* Transactions validées */}
        <div className={`${cardClass} border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={textMuted}>Transactions Validées</p>
              <p className="text-2xl font-bold text-blue-600">
                {statsCA?.nombreTransactionsValidees || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Ticket moyen: {formatCurrency(statsCA?.ticketMoyen || 0)}
          </p>
        </div>

        {/* Transactions en attente */}
        <div className={`${cardClass} border-l-4 border-orange-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={textMuted}>En Attente de Paiement</p>
              <p className="text-2xl font-bold text-orange-600">
                {statsTransactions?.totalEnAttente || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Montant: {formatCurrency(statsTransactions?.montantTotal || 0)}
          </p>
        </div>

        {/* Paiements partiels */}
        <div className={`${cardClass} border-l-4 border-yellow-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={textMuted}>Paiements Partiels</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statsTransactions?.totalPartielles || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Nécessitent un suivi
          </p>
        </div>
      </div>

      {/* Graphiques et détails supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution du chiffre d'affaire */}
        <div className={cardClass}>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Évolution du Chiffre d'Affaire
          </h3>
          {/* Ici vous pouvez ajouter un graphique */}
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className={textMuted}>Graphique d'évolution</p>
          </div>
        </div>

        {/* Répartition par mode de paiement */}
        <div className={cardClass}>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-green-500" />
            Modes de Paiement
          </h3>
          {/* Ici vous pouvez ajouter un graphique en camembert */}
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className={textMuted}>Répartition des modes de paiement</p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className={cardClass}>
        <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <FileText className="w-5 h-5 mr-2" />
            Voir Toutes les Transactions
          </button>
          <button className="flex items-center justify-center p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
            <Clock className="w-5 h-5 mr-2" />
            Gérer les Impayés
          </button>
          <button className="flex items-center justify-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
            <TrendingUp className="w-5 h-5 mr-2" />
            Rapport Financier
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsDashboard;
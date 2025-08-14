import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Filter, 
  Search, 
  Download, 
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  BarChart3,
  Eye
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTransactions } from '../../hooks/useTransactions';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import TransactionManager from '../../components/Sessions/TransactionManager';

const TransactionsOverview = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess } = useNotification();
  
  const isDarkMode = effectiveTheme === 'dark';

  // États locaux
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    dateDebut: '',
    dateFin: '',
    statut: '',
    modePaiement: '',
    search: ''
  });

  // Récupération des données
  const { 
    data: transactionsData, 
    isLoading, 
    isError, 
    error 
  } = useTransactions(filters);

  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination || {};
  const stats = transactionsData?.stats || {};

  // Session fictive pour le gestionnaire de transactions (pour les tests)
  const sessionTest = {
    id: 'nouvelle-session',
    montantTotal: 0,
    transactions: []
  };

  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toFixed(2)} MAD`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (statut) => {
    const config = {
      'COMPLETE': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Complète'
      },
      'EN_ATTENTE': { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', 
        icon: <Clock className="w-3 h-3" />,
        text: 'En attente'
      },
      'ECHOUEE': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
        icon: <AlertCircle className="w-3 h-3" />,
        text: 'Échouée'
      }
    };

    const { color, icon, text } = config[statut] || config['EN_ATTENTE'];

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon}
        <span>{text}</span>
      </span>
    );
  };

  const getModePaymentIcon = (mode) => {
    switch (mode) {
      case 'CARTE': return '💳';
      case 'ESPECES': return '💵';
      case 'VIREMENT': return '🏦';
      case 'CHEQUE': return '📝';
      default: return '💰';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-800 dark:text-red-200">
              Erreur lors du chargement des transactions
            </span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            {error?.message || 'Une erreur inattendue s\'est produite'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {translations.transactions || 'Transactions'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestion et suivi de toutes les transactions
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border p-6`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total du jour</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalJour)}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border p-6`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.nombreJour || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border p-6`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.enAttente || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gestionnaire de transactions pour les nouvelles transactions */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Nouvelle Transaction</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Créer une nouvelle transaction manuelle
          </p>
        </div>
        <div className="p-6">
          <TransactionManager
            session={sessionTest}
            onTransactionAdded={() => {
              showSuccess('Transaction ajoutée avec succès');
              // Rafraîchir les données
            }}
            onTransactionUpdated={() => {
              showSuccess('Transaction modifiée avec succès');
            }}
            onTransactionDeleted={() => {
              showSuccess('Transaction supprimée avec succès');
            }}
          />
        </div>
      </div>

      {/* Liste des transactions récentes */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Transactions Récentes</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune transaction
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Les transactions apparaîtront ici une fois créées
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                    Date/Heure
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                    Montant
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                    Mode
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                    Statut
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                    Session
                  </th>
                  <th className="text-right py-3 px-6 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr 
                    key={transaction.id}
                    className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDateTime(transaction.dateCreation)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(transaction.montant)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {getModePaymentIcon(transaction.modePaiement)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.modePaiement}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(transaction.statut)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.session?.poste?.nom || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Affichage {((pagination.currentPage - 1) * pagination.limit) + 1} à{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.total)} sur{' '}
                {pagination.total} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Précédent
                </button>
                <span className="px-3 py-1 text-sm">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsOverview;

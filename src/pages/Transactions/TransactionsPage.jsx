import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Download, Plus, Edit, Trash2, Eye, DollarSign, Clock, User, CreditCard } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useTransactions, useCreateTransaction, useModifierTransaction, useSupprimerTransaction } from '../../hooks/useTransactions';
import TransactionDetailsModal from '../../components/Transactions/TransactionDetailsModal';
import TransactionManagementModal from '../../components/Transactions/TransactionManagementModal';

const TransactionsPage = () => {
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const isDarkMode = effectiveTheme === 'dark';

  // États locaux pour les filtres et la pagination
  const [filters, setFilters] = useState({
    search: '',
    dateDebut: '',
    dateFin: '',
    modePaiement: '',
    statutTransaction: '',
    posteId: '',
    clientId: '',
    page: 1,
    limit: 30,
    sortBy: 'dateTransaction',
    sortOrder: 'DESC'
    
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Période pour les statistiques
  const [statsPeriod, setStatsPeriod] = useState('day'); // day, week, month

  // Récupération des données avec useMemo pour éviter les re-renders
  const {
    data: transactionsData,
    isLoading,
    isError,
    error,
    refetch
  } = useTransactions(filters);

  // ✅ AJOUT: Log pour diagnostiquer la structure des données reçues
  React.useEffect(() => {
    console.log('🕵️ [TransactionsPage] Données reçues de useTransactions:', transactionsData);
  }, [transactionsData]);

  const transactions = useMemo(() => {
    // ✅ SIMPLIFICATION: Standardiser l'accès aux données.
    // La structure attendue est { data: { transactions: [], pagination: {} } }
    // ou { transactions: [], pagination: {} } comme fallback.
    return transactionsData?.data?.transactions || transactionsData?.transactions || [];
  }, [transactionsData]);
  
  const pagination = useMemo(() => {
    return transactionsData?.data?.pagination || transactionsData?.pagination || { total: transactions.length, page: 1, limit: filters.limit };
  }, [transactionsData, transactions.length, filters.limit]);

  const totalTransactions = pagination.total;
  const totalPages = Math.ceil(totalTransactions / pagination.limit);

  // Mutations
  const _createTransactionMutation = useCreateTransaction();
  const _updateTransactionMutation = useModifierTransaction();
  const deleteTransactionMutation = useSupprimerTransaction();

  // Calculer les statistiques
  const stats = useMemo(() => {
    if (!transactions.length) return {
      total: 0,
      montantTotal: 0,
      montantEncaisse: 0,
      enAttente: 0,
      completees: 0
    };

    return {
      total: transactions.length,
      montantTotal: transactions.reduce((sum, t) => sum + parseFloat(t.montantTTC || 0), 0), // ✅ CORRECTION: Renommé pour clarté
      montantEncaisse: transactions.reduce((sum, t) => sum + parseFloat(t.montantPaye || 0), 0),
      enAttente: transactions.filter(t => t.statutTransaction === 'EN_ATTENTE' || t.statutTransaction === 'PARTIELLEMENT_PAYEE').length,
      completees: transactions.filter(t => t.statutTransaction === 'VALIDEE').length // ✅ CORRECTION: Utiliser 'VALIDEE'
    };
  }, [transactions]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'EN_ATTENTE': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'En attente' },
      'VALIDEE': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Validée' }, // ✅ CORRECTION: Utiliser 'VALIDEE'
      'PARTIELLEMENT_PAYEE': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', label: 'Partielle' },
      'ANNULEE': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Annulée' },
      'REMBOURSEE': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Remboursée' }
    };

    const config = statusConfig[status] || statusConfig['EN_ATTENTE'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentIcon = (mode) => {
    const icons = {
      'ESPECES': '💵',
      'CARTE': '💳',
      'VIREMENT': '🏦',
      'CHEQUE': '📝',
      'AUTRE': '💰'
    };
    return icons[mode] || '💰';
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset à la première page lors du changement de filtre
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      return;
    }

    try {
      await deleteTransactionMutation.mutateAsync(transactionId);
      showSuccess('Transaction supprimée avec succès');
      refetch();
    } catch (err) {
      showError('Erreur lors de la suppression');
      console.error('Erreur suppression transaction:', err);
    }
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const exportTransactions = () => {
    // TODO: Implémenter l'export CSV/Excel
    const csvData = transactions.map(t => ({
      numero: t.numeroTransaction,
      date: new Date(t.dateTransaction).toLocaleDateString('fr-FR'),
      poste: t.session?.poste?.nom || t.poste?.nom || 'N/A',
      client: t.client ? `${t.client.prenom} ${t.client.nom}` : 'Client anonyme',
      montant: t.montantTTC,
      paye: t.montantPaye,
      mode: t.modePaiement,
      statut: t.statutTransaction
    }));
    
    console.log('Export CSV data:', csvData);
    showSuccess('Export en cours de développement');
  };

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">
            Erreur lors du chargement des transactions: {error?.message}
          </p>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez toutes les transactions du gaming center
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Période:</label>
            <select
              value={statsPeriod}
              onChange={(e) => setStatsPeriod(e.target.value)}
              className={`px-3 py-1 border rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
          </div>
          
          <button
            onClick={exportTransactions}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Transaction</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.montantTotal)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant Encaissé</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.montantPaye)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complétées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completees}</p>
            </div>
            <User className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Numéro, client, poste..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date début</label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date fin</label>
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => handleFilterChange('dateFin', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mode paiement</label>
            <select
              value={filters.modePaiement}
              onChange={(e) => handleFilterChange('modePaiement', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Tous les modes</option>
              <option value="ESPECES">Espèces</option>
              <option value="CARTE">Carte bancaire</option>
              <option value="VIREMENT">Virement</option>
              <option value="CHEQUE">Chèque</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={filters.statutTransaction}
              onChange={(e) => handleFilterChange('statutTransaction', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDEE">Validée</option>
              <option value="PARTIELLEMENT_PAYEE">Partiellement payée</option>
              <option value="ANNULEE">Annulée</option>
              <option value="REMBOURSEE">Remboursée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Transactions ({totalTransactions})</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Aucune transaction trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    N° Transaction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Session/Poste
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm">{transaction.numeroTransaction}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {formatDate(transaction.dateTransaction)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {transaction.session ? (
                          <div>
                            <p className="font-medium">Session #{transaction.session.numeroSession}</p>
                            <p className="text-gray-500">{transaction.session.poste?.nom || 'Poste inconnu'}</p>
                          </div>
                        ) : transaction.poste ? (
                          <p className="font-medium">{transaction.poste.nom}</p>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {transaction.client ? (
                        <div className="text-sm">
                          <p className="font-medium">{transaction.client.prenom} {transaction.client.nom}</p>
                          {transaction.client.telephone && (
                            <p className="text-gray-500">{transaction.client.telephone}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Client anonyme</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium">{formatCurrency(transaction.montantTTC)}</p>
                        <p className="text-green-600">{formatCurrency(transaction.montantPaye)} payé</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{getPaymentIcon(transaction.modePaiement)}</span>
                        <span className="text-sm">{transaction.modePaiement}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.statutTransaction)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-1 text-yellow-600 hover:text-yellow-700"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className={`p-1 text-red-600 hover:text-red-700 ${transaction.statutTransaction === 'VALIDEE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={transaction.statutTransaction === 'VALIDEE' ? 'Impossible de supprimer une transaction validée' : 'Supprimer'}
                          disabled={transaction.statutTransaction === 'VALIDEE'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {filters.page} sur {totalPages} ({totalTransactions} transactions)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showDetailsModal && selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {/* Modal de gestion/modification */}
      {showEditModal && selectedTransaction && (
        <TransactionManagementModal
          transaction={selectedTransaction}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTransaction(null);
          }}
          onUpdate={() => {
            refetch();
            setShowEditModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {/* Modal de création */}
      {showAddModal && (
        <TransactionManagementModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onUpdate={() => {
            refetch();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TransactionsPage;

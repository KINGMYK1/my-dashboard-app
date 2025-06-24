import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { Card, Button, Input, Select, DatePicker, Pagination, Badge, Spinner } from '../../components/ui';
import { Search, Download, Eye, CreditCard, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import TransactionDetailsModal from '../../components/Transactions/TransactionDetailsModal';
import PaymentUpdateModal from '../../components/Transactions/PaymentUpdateModal';

const TransactionsHistorique = () => {
  const { translations } = useLanguage();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    dateDebut: '',
    dateFin: '',
    statut: '',
    modePaiement: '',
    search: '',
    montantMin: '',
    montantMax: ''
  });

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ✅ CORRECTION: Utilisation du hook avec filtres
  const { 
    data: transactionsData, 
    isLoading, 
    error,
    refetch 
  } = useTransactions(filters);

  // ✅ CORRECTION: Extraction des données avec vérification
  const transactions = useMemo(() => {
    if (!transactionsData?.data) return [];
    return Array.isArray(transactionsData.data) ? transactionsData.data : [];
  }, [transactionsData]);

  const pagination = useMemo(() => {
    return transactionsData?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20
    };
  }, [transactionsData]);

  // ✅ CORRECTION: Gestion des filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 })
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // ✅ CORRECTION: Reset des filtres
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      dateDebut: '',
      dateFin: '',
      statut: '',
      modePaiement: '',
      search: '',
      montantMin: '',
      montantMax: ''
    });
  };

  // ✅ CORRECTION: Fonction pour formater les montants
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0,00 DH';
    return `${parseFloat(amount).toFixed(2)} DH`;
  };

  // ✅ CORRECTION: Fonction pour obtenir le badge de statut de transaction
  const getTransactionStatusBadge = (transaction) => {
    const statusConfig = {
      'TERMINEE': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
        label: 'Terminée' 
      },
      'EN_ATTENTE': { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', 
        label: 'En attente' 
      },
      'ANNULEE': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
        label: 'Annulée' 
      },
      'PARTIELLE': { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
        label: 'Paiement partiel' 
      }
    };

    const config = statusConfig[transaction.statutTransaction] || statusConfig['EN_ATTENTE'];
    
    return (
      <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  // ✅ CORRECTION: Fonction pour obtenir le badge de paiement avec calculs corrects
  const getPaymentStatusBadge = (transaction) => {
    const montantTotal = parseFloat(transaction.montantTotal) || 0;
    const montantPaye = parseFloat(transaction.montantPaye) || 0;
    const resteAPayer = Math.max(0, montantTotal - montantPaye);

    if (resteAPayer <= 0.01) {
      return (
        <Badge className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Payée intégralement
        </Badge>
      );
    } else if (montantPaye > 0) {
      return (
        <Badge className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
          Paiement partiel
        </Badge>
      );
    } else {
      return (
        <Badge className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          Non payée
        </Badge>
      );
    }
  };

  // ✅ CORRECTION: Fonction pour ouvrir les détails d'une transaction
  const handleOpenDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  // ✅ CORRECTION: Fonction pour ouvrir le paiement d'une transaction
  const handleOpenPayment = (transaction) => {
    setSelectedTransaction(transaction);
    setShowPaymentModal(true);
  };

  // ✅ CORRECTION: Export des données
  const handleExport = () => {
    console.log('🎯 [TRANSACTIONS_HISTORIQUE] Export des transactions:', transactions);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
        <span className="ml-2">Chargement de l'historique...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Erreur lors du chargement: {error.message}</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historique des Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {pagination.totalItems} transaction(s) trouvée(s)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Exporter</span>
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* ✅ CORRECTION: Filtres améliorés */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher (numéro, client...)"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Statut */}
          <Select
            placeholder="Statut"
            value={filters.statut}
            onChange={(value) => handleFilterChange('statut', value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'TERMINEE', label: 'Terminée' },
              { value: 'EN_ATTENTE', label: 'En attente' },
              { value: 'ANNULEE', label: 'Annulée' },
              { value: 'PARTIELLE', label: 'Paiement partiel' }
            ]}
          />

          {/* Mode de paiement */}
          <Select
            placeholder="Mode de paiement"
            value={filters.modePaiement}
            onChange={(value) => handleFilterChange('modePaiement', value)}
            options={[
              { value: '', label: 'Tous les modes' },
              { value: 'ESPECES', label: 'Espèces' },
              { value: 'CARTE_BANCAIRE', label: 'Carte bancaire' },
              { value: 'VIREMENT', label: 'Virement' },
              { value: 'AUTRE', label: 'Autre' }
            ]}
          />

          {/* Date de début */}
          <DatePicker
            placeholder="Date de début"
            value={filters.dateDebut}
            onChange={(date) => handleFilterChange('dateDebut', date)}
          />
        </div>

        {/* Filtres de montant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <DatePicker
            placeholder="Date de fin"
            value={filters.dateFin}
            onChange={(date) => handleFilterChange('dateFin', date)}
          />
          <Input
            placeholder="Montant min"
            type="number"
            value={filters.montantMin}
            onChange={(e) => handleFilterChange('montantMin', e.target.value)}
          />
          <Input
            placeholder="Montant max"
            type="number"
            value={filters.montantMax}
            onChange={(e) => handleFilterChange('montantMax', e.target.value)}
          />
        </div>
      </Card>

      {/* ✅ CORRECTION: Tableau des transactions avec calculs corrects */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Montants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => {
                // ✅ CORRECTION: Calculs de montants corrects
                const montantTotal = parseFloat(transaction.montantTotal) || 0;
                const montantPaye = parseFloat(transaction.montantPaye) || 0;
                const resteAPayer = Math.max(0, montantTotal - montantPaye);
                const hasPaymentIssue = resteAPayer > 0;

                return (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{transaction.numeroTransaction}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.dateTransaction).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {transaction.client ? 
                          `${transaction.client.prenom} ${transaction.client.nom}` : 
                          'Client anonyme'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Total: {formatCurrency(montantTotal)}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Payé: {formatCurrency(montantPaye)}
                        </div>
                        {resteAPayer > 0 && (
                          <div className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                            <AlertTriangle size={12} />
                            <span>Reste: {formatCurrency(resteAPayer)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getPaymentStatusBadge(transaction)}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.modePaiement?.replace('_', ' ') || 'Non défini'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTransactionStatusBadge(transaction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        onClick={() => handleOpenDetails(transaction)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                      </Button>
                      {hasPaymentIssue && (
                        <Button
                          onClick={() => handleOpenPayment(transaction)}
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800"
                        >
                          <CreditCard size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ✅ CORRECTION: Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
            />
          </div>
        )}
      </Card>

      {/* ✅ CORRECTION: Modales */}
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

      {showPaymentModal && selectedTransaction && (
        <PaymentUpdateModal
          transaction={selectedTransaction}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTransaction(null);
          }}
          onSuccess={() => {
            refetch();
            setShowPaymentModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
};

export default TransactionsHistorique;
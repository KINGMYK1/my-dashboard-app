import React, { useState, useMemo } from 'react';
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
  XCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  useTransactions,
  useTransactionsEnAttente,
  useUpdatePayment,
  useDeleteTransaction,
  useRefundTransaction,
  useSalesStatistics
} from '../../hooks/useTransactions';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import PaymentUpdateModal from './PaymentUpdateModal';

const Transactions = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const isDarkMode = effectiveTheme === 'dark';

  // États locaux
  const [activeTab, setActiveTab] = useState('en-attente');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    statut: '',
    typeTransaction: '',
    modePaiement: '',
    dateDebut: '',
    dateFin: '',
    montantMin: '',
    montantMax: '',
    search: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Hooks de données
  const { 
    data: transactionsData, 
    isLoading: loadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions
  } = useTransactions(activeTab === 'toutes' ? filters : {});

  const { 
    data: transactionsEnAttenteData, 
    isLoading: loadingEnAttente,
    error: enAttenteError,
    refetch: refetchEnAttente
  } = useTransactionsEnAttente(activeTab === 'en-attente' ? { includePartielles: true } : {});

  const { 
    data: statsData, 
    isLoading: loadingStats 
  } = useSalesStatistics({ periode: 'mois' });

  // Mutations
  const updatePaymentMutation = useUpdatePayment();
  const deleteTransactionMutation = useDeleteTransaction();
  const refundTransactionMutation = useRefundTransaction();

  // Permissions
  const canViewTransactions = hasPermission('TRANSACTIONS_VIEW');
  const canManageTransactions = hasPermission('TRANSACTIONS_MANAGE');

  // Données selon l'onglet actif
  const currentData = activeTab === 'en-attente' ? transactionsEnAttenteData : transactionsData;
  const currentLoading = activeTab === 'en-attente' ? loadingEnAttente : loadingTransactions;
  const currentError = activeTab === 'en-attente' ? enAttenteError : transactionsError;

  const transactions = currentData?.data?.transactions || [];
  const pagination = currentData?.data?.pagination || {};
  const stats = statsData?.data || {};

  // Styles dynamiques
  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // Gestionnaires d'événements
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'en-attente') {
      refetchEnAttente();
    } else {
      refetchTransactions();
    }
  };

  const handleUpdatePayment = async (paiementData) => {
    if (!selectedTransaction) return;

    try {
      await updatePaymentMutation.mutateAsync({
        transactionId: selectedTransaction.id,
        paiementData
      });
      setShowPaymentModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      // Erreur gérée par le hook
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      await deleteTransactionMutation.mutateAsync(selectedTransaction.id);
      setShowDeleteConfirm(false);
      setSelectedTransaction(null);
    } catch (error) {
      // Erreur gérée par le hook
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatutBadge = (statut) => {
    const variants = {
      'EN_ATTENTE': { variant: 'yellow', icon: Clock, label: 'En attente' },
      'PARTIELLEMENT_PAYEE': { variant: 'orange', icon: AlertCircle, label: 'Partiel' },
      'VALIDEE': { variant: 'green', icon: CheckCircle, label: 'Validée' },
      'ANNULEE': { variant: 'red', icon: XCircle, label: 'Annulée' },
      'REMBOURSEE': { variant: 'purple', icon: RefreshCw, label: 'Remboursée' }
    };

    const config = variants[statut] || variants['EN_ATTENTE'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  if (!canViewTransactions) {
    return (
      <div className={`min-h-screen p-6 ${bgClass}`}>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-lg font-semibold mb-2">Accès refusé</h2>
            <p className={textSecondary}>
              Vous n'avez pas les permissions nécessaires pour voir les transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${bgClass}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
              💰 Transactions
            </h1>
            <p className={textSecondary}>
              Gestion des paiements et transactions
            </p>
          </div>
          
          {canManageTransactions && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {}}>
                <Download size={16} className="mr-2" />
                Exporter
              </Button>
              <Button onClick={() => {}}>
                <Plus size={16} className="mr-2" />
                Nouvelle transaction
              </Button>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        {!loadingStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textSecondary}`}>CA du mois</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                      {formatCurrency(stats.chiffreAffaireMois)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textSecondary}`}>En attente</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                      {stats.transactionsEnAttente || 0}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textSecondary}`}>Validées</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                      {stats.transactionsValidees || 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${textSecondary}`}>Montant en attente</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                      {formatCurrency(stats.montantEnAttente)}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglets */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                {[
                  { id: 'en-attente', label: 'En attente', icon: Clock },
                  { id: 'toutes', label: 'Toutes', icon: CreditCard }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                        ${isActive 
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                          : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`
                        }
                      `}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              
              {/* Filtres rapides */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className={`
                      pl-10 pr-4 py-2 border rounded-lg bg-transparent
                      ${borderColor} ${textPrimary}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    `}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {currentLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : currentError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className={textPrimary}>Erreur lors du chargement</p>
                <p className={textSecondary}>{currentError.message}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
                <p className={textPrimary}>Aucune transaction trouvée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className={`
                      p-4 border rounded-lg hover:shadow-md transition-shadow
                      ${borderColor} ${cardBg}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`font-medium ${textPrimary}`}>
                            {transaction.numeroTransaction}
                          </span>
                          {getStatutBadge(transaction.statutTransaction)}
                          <span className={`text-xs ${textSecondary}`}>
                            {transaction.typeTransaction}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className={textSecondary}>Montant total:</span>
                            <div className={`font-medium ${textPrimary}`}>
                              {formatCurrency(transaction.montantTTC)}
                            </div>
                          </div>
                          
                          <div>
                            <span className={textSecondary}>Payé:</span>
                            <div className={`font-medium ${textPrimary}`}>
                              {formatCurrency(transaction.montantPaye)}
                            </div>
                          </div>
                          
                          <div>
                            <span className={textSecondary}>Reste:</span>
                            <div className={`font-medium ${transaction.resteAPayer > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                              {formatCurrency(transaction.resteAPayer)}
                            </div>
                          </div>
                          
                          <div>
                            <span className={textSecondary}>Date:</span>
                            <div className={`font-medium ${textPrimary}`}>
                              {formatDate(transaction.dateTransaction)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {canManageTransactions && (
                        <div className="flex items-center gap-2">
                          {transaction.resteAPayer > 0 && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowPaymentModal(true);
                              }}
                            >
                              <CreditCard size={14} className="mr-1" />
                              Payer
                            </Button>
                          )}
                          
                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <MoreVertical size={14} />
                            </Button>
                            
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  // Ouvrir modal de détails
                                }}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Eye size={14} className="inline mr-2" />
                                Voir détails
                              </button>
                              
                              {transaction.statutTransaction === 'VALIDEE' && (
                                <button
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setShowRefundModal(true);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-orange-600"
                                >
                                  <RefreshCw size={14} className="inline mr-2" />
                                  Rembourser
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setShowDeleteConfirm(true);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                              >
                                <Trash2 size={14} className="inline mr-2" />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de mise à jour de paiement */}
      <PaymentUpdateModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onUpdate={handleUpdatePayment}
        loading={updatePaymentMutation.isLoading}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Transactions;
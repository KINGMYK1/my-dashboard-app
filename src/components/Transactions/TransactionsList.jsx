import React, { useState } from 'react';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Download,
  ArrowUpDown
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const TransactionsList = ({
  transactions = [],
  loading = false,
  error = null,
  pagination = {},
  onTransactionSelect,
  onPaymentUpdate,
  onTransactionRefund,
  onTransactionDelete,
  onFiltersChange,
  filters = {},
  canManageTransactions = false,
  formatCurrency,
  formatDate
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';

  const [sortConfig, setSortConfig] = useState({
    key: 'dateTransaction',
    direction: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Styles dynamiques
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';

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

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    
    onFiltersChange({
      ...filters,
      sortBy: key,
      sortOrder: sortConfig.key === key && sortConfig.direction === 'asc' ? 'DESC' : 'ASC'
    });
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className={textPrimary}>Erreur lors du chargement</p>
        <p className={textSecondary}>{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
        <p className={textPrimary}>Aucune transaction trouvée</p>
        <p className={textSecondary}>
          {filters.search || Object.values(filters).some(v => v) 
            ? 'Essayez de modifier vos filtres' 
            : 'Les transactions apparaîtront ici'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" />
            Filtres
            {Object.values(filters).some(v => v) && (
              <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </Button>
          
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Exporter
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          {pagination.total} transactions • Page {pagination.page || 1} sur {pagination.totalPages || 1}
        </div>
      </div>

      {/* Filtres expandables */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select
                value={filters.statut || ''}
                onChange={(e) => handleFilterChange('statut', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${borderColor}`}
              >
                <option value="">Tous</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PARTIELLEMENT_PAYEE">Partiel</option>
                <option value="VALIDEE">Validée</option>
                <option value="ANNULEE">Annulée</option>
                <option value="REMBOURSEE">Remboursée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={filters.typeTransaction || ''}
                onChange={(e) => handleFilterChange('typeTransaction', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${borderColor}`}
              >
                <option value="">Tous</option>
                <option value="PAIEMENT_SESSION">Session</option>
                <option value="VENTE_PRODUIT">Produit</option>
                <option value="VENTE_SERVICE">Service</option>
                <option value="VENTE_ABONNEMENT">Abonnement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Paiement</label>
              <select
                value={filters.modePaiement || ''}
                onChange={(e) => handleFilterChange('modePaiement', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${borderColor}`}
              >
                <option value="">Tous</option>
                <option value="ESPECES">Espèces</option>
                <option value="CARTE">Carte</option>
                <option value="VIREMENT">Virement</option>
                <option value="CHEQUE">Chèque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date début</label>
              <input
                type="date"
                value={filters.dateDebut || ''}
                onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${borderColor}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date fin</label>
              <input
                type="date"
                value={filters.dateFin || ''}
                onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${borderColor}`}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({})}
            >
              Réinitialiser
            </Button>
          </div>
        </Card>
      )}

      {/* En-têtes de colonnes */}
      <div className={`hidden md:grid md:grid-cols-6 gap-4 px-4 py-2 border-b ${borderColor} text-sm font-medium ${textSecondary}`}>
        <button
          onClick={() => handleSort('numeroTransaction')}
          className="flex items-center gap-1 hover:text-blue-600"
        >
          Transaction
          <ArrowUpDown size={14} />
        </button>
        <button
          onClick={() => handleSort('dateTransaction')}
          className="flex items-center gap-1 hover:text-blue-600"
        >
          Date
          <ArrowUpDown size={14} />
        </button>
        <div>Statut</div>
        <button
          onClick={() => handleSort('montantTTC')}
          className="flex items-center gap-1 hover:text-blue-600"
        >
          Montant
          <ArrowUpDown size={14} />
        </button>
        <div>Paiement</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Liste des transactions */}
      <div className="space-y-3">
        {transactions.map(transaction => (
          <Card
            key={transaction.id}
            className={`
              p-4 hover:shadow-md transition-shadow cursor-pointer
              ${cardBg} ${borderColor}
            `}
            onClick={() => onTransactionSelect && onTransactionSelect(transaction)}
          >
            {/* Version mobile */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${textPrimary}`}>
                  {transaction.numeroTransaction}
                </span>
                {getStatutBadge(transaction.statutTransaction)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
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

              {canManageTransactions && (
                <div className="flex gap-2 pt-3 border-t">
                  {transaction.resteAPayer > 0 && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPaymentUpdate(transaction);
                      }}
                    >
                      <CreditCard size={14} className="mr-1" />
                      Payer
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Menu d'actions
                    }}
                  >
                    <MoreVertical size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* Version desktop */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
              <div>
                <div className={`font-medium ${textPrimary}`}>
                  {transaction.numeroTransaction}
                </div>
                <div className={`text-xs ${textSecondary}`}>
                  {transaction.typeTransaction}
                </div>
              </div>

              <div className={`text-sm ${textPrimary}`}>
                {formatDate(transaction.dateTransaction)}
              </div>

              <div>
                {getStatutBadge(transaction.statutTransaction)}
              </div>

              <div>
                <div className={`font-medium ${textPrimary}`}>
                  {formatCurrency(transaction.montantTTC)}
                </div>
                <div className={`text-xs ${textSecondary}`}>
                  Payé: {formatCurrency(transaction.montantPaye)}
                </div>
                {transaction.resteAPayer > 0 && (
                  <div className="text-xs text-orange-500">
                    Reste: {formatCurrency(transaction.resteAPayer)}
                  </div>
                )}
              </div>

              <div className={`text-sm ${textPrimary}`}>
                {transaction.modePaiement}
                {transaction.derniersChiffresCarte && (
                  <div className={`text-xs ${textSecondary}`}>
                    •••• {transaction.derniersChiffresCarte}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-1">
                {canManageTransactions && (
                  <>
                    {transaction.resteAPayer > 0 && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPaymentUpdate(transaction);
                        }}
                      >
                        <CreditCard size={14} />
                      </Button>
                    )}
                    
                    <div className="relative group">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={14} />
                      </Button>
                      
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[160px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTransactionSelect(transaction);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Eye size={14} className="inline mr-2" />
                          Voir détails
                        </button>
                        
                        {transaction.statutTransaction === 'VALIDEE' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTransactionRefund(transaction);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-orange-600"
                          >
                            <RefreshCw size={14} className="inline mr-2" />
                            Rembourser
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTransactionDelete(transaction);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                        >
                          <Trash2 size={14} className="inline mr-2" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} transactions
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handleFilterChange('page', pagination.page - 1)}
            >
              Précédent
            </Button>
            
            <span className="px-3 py-2 text-sm">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handleFilterChange('page', pagination.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
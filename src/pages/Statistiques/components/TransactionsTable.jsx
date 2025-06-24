import React, { useState } from 'react';
import { 
  Edit, Eye, DollarSign, Clock, CheckCircle, 
  AlertCircle, User, Calendar, CreditCard 
} from 'lucide-react';
import { Button, Badge, Modal } from '../../../components/ui';
import { statistiquesService } from '../../../services/statistiquesService';
import { useNotification } from '../../../contexts/NotificationContext';
import PaiementModal from './PaiementModal';

const TransactionsTable = ({ transactions, showActions = true, onUpdate }) => {
  const { showSuccess, showError } = useNotification();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutBadge = (statut) => {
    const variants = {
      'VALIDEE': 'success',
      'EN_ATTENTE': 'warning',
      'PARTIELLEMENT_PAYEE': 'info',
      'ANNULEE': 'error',
      'REMBOURSEE': 'secondary'
    };

    const labels = {
      'VALIDEE': 'Validée',
      'EN_ATTENTE': 'En attente',
      'PARTIELLEMENT_PAYEE': 'Partiel',
      'ANNULEE': 'Annulée',
      'REMBOURSEE': 'Remboursée'
    };

    return (
      <Badge variant={variants[statut] || 'default'}>
        {labels[statut] || statut}
      </Badge>
    );
  };

  const getModePaiementIcon = (mode) => {
    switch (mode) {
      case 'CARTE_BANCAIRE':
        return <CreditCard className="w-4 h-4" />;
      case 'ESPECES':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const handleVoirDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleModifierPaiement = (transaction) => {
    setSelectedTransaction(transaction);
    setShowPaiementModal(true);
  };

  const handleFinaliserPaiement = async (transaction) => {
    setLoading(true);
    try {
      await statistiquesService.mettreAJourPaiement(transaction.id, {
        marquerCommePayee: true,
        notes: 'Paiement finalisé depuis les statistiques'
      });
      
      showSuccess('Transaction finalisée avec succès');
      onUpdate && onUpdate();
    } catch (error) {
      showError('Erreur lors de la finalisation du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handlePaiementUpdate = async (paiementData) => {
    setLoading(true);
    try {
      await statistiquesService.mettreAJourPaiement(selectedTransaction.id, paiementData);
      showSuccess('Paiement mis à jour avec succès');
      setShowPaiementModal(false);
      onUpdate && onUpdate();
    } catch (error) {
      showError('Erreur lors de la mise à jour du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Transaction
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Client/Poste
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date
            </th>
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.numeroTransaction}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.typeTransaction}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {transaction.client ? (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {transaction.client.prenom} {transaction.client.nom}
                    </div>
                  ) : transaction.poste ? (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {transaction.poste.nom}
                    </div>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  <div>Total: {formatCurrency(transaction.montantTTC)}</div>
                  <div className="text-green-600">Payé: {formatCurrency(transaction.montantPaye)}</div>
                  {transaction.resteAPayer > 0 && (
                    <div className="text-orange-600">Reste: {formatCurrency(transaction.resteAPayer)}</div>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  {getModePaiementIcon(transaction.modePaiement)}
                  <span className="ml-2">{transaction.modePaiement}</span>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {getStatutBadge(transaction.statutTransaction)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(transaction.dateTransaction)}
                </div>
              </td>

              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVoirDetails(transaction)}
                      icon={<Eye className="w-4 h-4" />}
                    >
                      Voir
                    </Button>
                    
                    {transaction.statutTransaction !== 'VALIDEE' && transaction.statutTransaction !== 'ANNULEE' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModifierPaiement(transaction)}
                          icon={<Edit className="w-4 h-4" />}
                        >
                          Modifier
                        </Button>
                        
                        {transaction.resteAPayer > 0 && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleFinaliserPaiement(transaction)}
                            disabled={loading}
                            icon={<CheckCircle className="w-4 h-4" />}
                          >
                            Finaliser
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Aucune transaction trouvée</p>
        </div>
      )}

      {/* Modal détails transaction */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la Transaction"
        size="lg"
      >
        {selectedTransaction && (
          <TransactionDetails transaction={selectedTransaction} />
        )}
      </Modal>

      {/* Modal paiement */}
      <PaiementModal
        isOpen={showPaiementModal}
        onClose={() => setShowPaiementModal(false)}
        transaction={selectedTransaction}
        onUpdate={handlePaiementUpdate}
        loading={loading}
      />
    </div>
  );
};

// Composant détails transaction
const TransactionDetails = ({ transaction }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Numéro</label>
          <p className="text-lg font-semibold">{transaction.numeroTransaction}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Type</label>
          <p className="text-lg">{transaction.typeTransaction}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Date</label>
          <p className="text-lg">{formatDate(transaction.dateTransaction)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Statut</label>
          <div className="mt-1">
            <Badge variant={transaction.statutTransaction === 'VALIDEE' ? 'success' : 'warning'}>
              {transaction.statutTransaction}
            </Badge>
          </div>
        </div>
      </div>

      {/* Montants */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Détails Financiers</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Montant Total</label>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(transaction.montantTTC)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Montant Payé</label>
            <p className="text-xl font-bold text-green-600">{formatCurrency(transaction.montantPaye)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Reste à Payer</label>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(transaction.resteAPayer)}</p>
          </div>
        </div>
      </div>

      {/* Historique des paiements */}
      {transaction.detailsPaiementsPartiels && transaction.detailsPaiementsPartiels.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Historique des Paiements</h4>
          <div className="space-y-2">
            {transaction.detailsPaiementsPartiels.map((paiement, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{formatCurrency(paiement.montant)}</span>
                  <span className="text-gray-500 ml-2">• {paiement.modePaiement}</span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(paiement.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {transaction.notesPaiement && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Notes</h4>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{transaction.notesPaiement}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
import React, { useState } from 'react';
import { Plus, Edit, Trash2, CreditCard, Check, AlertCircle, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

const TransactionManager = ({ 
  session, 
  onTransactionAdded, 
  onTransactionUpdated, 
  onTransactionDeleted 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    montant: '',
    modePaiement: 'ESPECES',
    notes: ''
  });

  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const isDarkMode = effectiveTheme === 'dark';

  // Calculer les totaux
  const montantTotal = parseFloat(session?.montantTotal || 0);
  const transactions = session?.transactions || [];
  const montantPaye = transactions.reduce((sum, t) => sum + parseFloat(t.montant || 0), 0);
  const soldeRestant = montantTotal - montantPaye;
  const estCompletementPaye = soldeRestant <= 0;

  const resetForm = () => {
    setFormData({
      montant: '',
      modePaiement: 'ESPECES',
      notes: ''
    });
    setShowAddForm(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        sessionId: session.id,
        montant: parseFloat(formData.montant),
        modePaiement: formData.modePaiement,
        notes: formData.notes
      };

      if (editingTransaction) {
        // Modification d'une transaction existante
        await onTransactionUpdated(editingTransaction.id, transactionData);
        showSuccess('Transaction modifiée avec succès');
      } else {
        // Ajout d'une nouvelle transaction
        await onTransactionAdded(transactionData);
        showSuccess('Transaction ajoutée avec succès');
      }

      resetForm();
    } catch (error) {
      console.error('Erreur transaction:', error);
      showError(error.message || 'Erreur lors de la transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      montant: transaction.montant.toString(),
      modePaiement: transaction.modePaiement,
      notes: transaction.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      return;
    }

    try {
      await onTransactionDeleted(transactionId);
      showSuccess('Transaction supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      showError(error.message || 'Erreur lors de la suppression');
    }
  };

  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toFixed(2)} MAD`;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="space-y-4">
      {/* En-tête avec résumé financier */}
      <div className={`
        ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-blue-50 border-blue-200'}
        border rounded-lg p-4
      `}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-blue-600 dark:text-blue-400">
              Gestion des transactions
            </h3>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(montantTotal)}
            </div>
            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Montant total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(montantPaye)}
            </div>
            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Montant payé
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              estCompletementPaye ? 'text-green-600' : 'text-orange-600'
            }`}>
              {formatCurrency(Math.max(0, soldeRestant))}
            </div>
            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Solde restant
            </div>
          </div>
        </div>

        {estCompletementPaye && (
          <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm">
            <Check className="w-4 h-4 inline text-green-600 mr-1" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              Session entièrement payée
            </span>
          </div>
        )}

        {soldeRestant > 0 && (
          <div className="mt-3 p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-sm">
            <AlertCircle className="w-4 h-4 inline text-orange-600 mr-1" />
            <span className="text-orange-700 dark:text-orange-300">
              Paiement incomplet - Reste {formatCurrency(soldeRestant)} à encaisser
            </span>
          </div>
        )}
      </div>

      {/* Liste des transactions */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">
          Transactions ({transactions.length})
        </h4>
        
        {transactions.length === 0 ? (
          <div className={`
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
            border rounded-lg p-4 text-center
          `}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Aucune transaction enregistrée
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className={`
                  ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  border rounded-lg p-3 flex items-center justify-between
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {getModePaymentIcon(transaction.modePaiement)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-green-600">
                        {formatCurrency(transaction.montant)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {transaction.modePaiement}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(transaction.dateCreation)}
                    </div>
                    {transaction.notes && (
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        📝 {transaction.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className={`
                      p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                      text-blue-600 dark:text-blue-400
                    `}
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className={`
                      p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                      text-red-600 dark:text-red-400
                    `}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {showAddForm && (
        <div className={`
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          border rounded-lg p-4
        `}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">
              {editingTransaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
            </h4>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Montant (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={editingTransaction ? undefined : soldeRestant}
                  value={formData.montant}
                  onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                  className={`
                    w-full px-3 py-2 border rounded-md text-sm
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                  required
                />
                {!editingTransaction && soldeRestant > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Max: {formatCurrency(soldeRestant)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mode de paiement *
                </label>
                <select
                  value={formData.modePaiement}
                  onChange={(e) => setFormData(prev => ({ ...prev, modePaiement: e.target.value }))}
                  className={`
                    w-full px-3 py-2 border rounded-md text-sm
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  `}
                  required
                >
                  <option value="ESPECES">💵 Espèces</option>
                  <option value="CARTE">💳 Carte bancaire</option>
                  <option value="VIREMENT">🏦 Virement</option>
                  <option value="CHEQUE">📝 Chèque</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className={`
                  w-full px-3 py-2 border rounded-md text-sm
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
                placeholder="Détails sur la transaction..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                {editingTransaction ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`
                  flex-1 px-4 py-2 border rounded-md text-sm font-medium
                  ${isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;

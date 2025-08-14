import React, { useState, useEffect, useMemo } from 'react';
import { useUpdatePayment } from '../../hooks/useTransactions';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '../ui';
import PricingService from '../../services/pricingService';

const TransactionManagementModal = ({ isOpen, onClose, transaction, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [editData, setEditData] = useState({
    montantSupplementaire: '',
    modePaiement: '',
    notes: '',
    adjustementRaison: '',
    nouveauMontantTotal: ''
  });
  const [loading, setLoading] = useState(false);

  const { effectiveTheme } = useTheme();
  const updatePaymentMutation = useUpdatePayment();
  const isDarkMode = effectiveTheme === 'dark';

  useEffect(() => {
    if (transaction && isOpen) {
      setEditData({
        montantSupplementaire: '',
        modePaiement: transaction.modePaiement || 'ESPECES',
        notes: transaction.notes || '',
        adjustementRaison: '',
        nouveauMontantTotal: transaction.montantTotal?.toString() || ''
      });
    }
  }, [transaction, isOpen]);

  const handlePaymentUpdate = async (type, data) => {
    try {
      setLoading(true);
      
      const updateData = {
        type,
        ...data
      };

      await updatePaymentMutation.mutateAsync({
        transactionId: transaction.id,
        paiementData: updateData
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Erreur mise à jour transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION: Calculs mémorisés et fiables pour les données financières
  const calculatedData = useMemo(() => {
    const montantTotal = parseFloat(transaction?.montantTTC || transaction?.montantTotal || 0);
    const montantPaye = parseFloat(transaction?.montantPaye || 0);
    const resteAPayer = Math.max(0, montantTotal - montantPaye);
    // Une transaction est payée si le reste à payer est (quasi) nul et que le montant total était positif.
    const estPayee = resteAPayer <= 0.001 && montantTotal > 0;

    return {
      montantTotal,
      montantPaye,
      resteAPayer,
      estPayee,
    };
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Gestion Transaction #{transaction.numeroTransaction || transaction.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b mb-6">
          {[
            { id: 'details', label: 'Détails' },
            { id: 'payment', label: 'Paiement' },
            { id: 'adjustments', label: 'Ajustements' },
            { id: 'history', label: 'Historique' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'details' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Informations de la transaction</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                    <p className="font-medium">
                      {new Date(transaction.dateHeure || transaction.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                    <p className="font-medium">{transaction.typeTransaction || 'VENTE'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Client:</span>
                    <p className="font-medium">
                      {transaction.client 
                        ? `${transaction.client.prenom} ${transaction.client.nom}`
                        : 'Client anonyme'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Montant total:</span>
                    <p className="font-medium text-lg">
                      {PricingService.formatCurrency(calculatedData.montantTotal)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Montant payé:</span>
                    <p className="font-medium text-green-600">
                      {PricingService.formatCurrency(calculatedData.montantPaye)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reste à payer:</span>
                    <p className={`font-medium ${calculatedData.resteAPayer > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {PricingService.formatCurrency(calculatedData.resteAPayer)}
                    </p>
                  </div>
                </div>
              </div>

              {transaction.lignes && transaction.lignes.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Détail des éléments</h4>
                  <div className="space-y-2">
                    {transaction.lignes.map((ligne, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <span className="font-medium">{ligne.nom}</span>
                          {ligne.quantite > 1 && (
                            <span className="text-sm text-gray-600 ml-2">x{ligne.quantite}</span>
                          )}
                        </div>
                        <span className="font-medium">
                          {PricingService.formatCurrency(ligne.sousTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'payment' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Gestion du paiement</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Statut actuel */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Statut de paiement:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      calculatedData.estPayee 
                        ? 'bg-green-100 text-green-800'
                        : calculatedData.montantPaye > 0 
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {calculatedData.estPayee ? 'Payée' : 
                       calculatedData.montantPaye > 0 ? 'Partiellement payée' : 'Non payée'}
                    </span>
                  </div>
                </div>

                {/* Ajouter un paiement */}
                {calculatedData.resteAPayer > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Ajouter un paiement</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Montant à payer
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={calculatedData.resteAPayer}
                          step="0.01"
                          value={editData.montantSupplementaire}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            montantSupplementaire: e.target.value
                          }))}
                          className="w-full p-2 border rounded-lg"
                          placeholder={`Max: ${PricingService.formatCurrency(calculatedData.resteAPayer)}`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Mode de paiement
                        </label>
                        <select
                          value={editData.modePaiement}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            modePaiement: e.target.value
                          }))}
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="ESPECES">Espèces</option>
                          <option value="CARTE">Carte bancaire</option>
                          <option value="VIREMENT">Virement</option>
                          <option value="CHEQUE">Chèque</option>
                          <option value="AUTRE">Autre</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Notes sur le paiement
                      </label>
                      <textarea
                        value={editData.notes}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        className="w-full p-2 border rounded-lg h-20"
                        placeholder="Notes optionnelles..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePaymentUpdate('PARTIAL_PAYMENT', {
                          montantSupplementaire: parseFloat(editData.montantSupplementaire),
                          modePaiement: editData.modePaiement,
                          notes: editData.notes
                        })}
                        disabled={loading || !editData.montantSupplementaire || parseFloat(editData.montantSupplementaire) <= 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Ajouter Paiement
                      </button>

                      <button
                        onClick={() => handlePaymentUpdate('MARK_AS_PAID', {
                          montantSupplementaire: calculatedData.resteAPayer,
                          modePaiement: editData.modePaiement,
                          notes: editData.notes
                        })}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Marquer comme Payée
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'adjustments' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Ajustements de la transaction</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    ⚠️ Les ajustements modifient définitivement la transaction. Utilisez avec précaution.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nouveau montant total
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editData.nouveauMontantTotal}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      nouveauMontantTotal: e.target.value
                    }))}
                    className="w-full p-2 border rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Montant actuel: {PricingService.formatCurrency(calculatedData.montantTotal)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Raison de l'ajustement
                  </label>
                  <select
                    value={editData.adjustementRaison}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      adjustementRaison: e.target.value
                    }))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Sélectionnez une raison...</option>
                    <option value="ERREUR_CALCUL">Erreur de calcul</option>
                    <option value="REMISE_COMMERCIALE">Remise commerciale</option>
                    <option value="COMPENSATION">Compensation client</option>
                    <option value="ERREUR_SAISIE">Erreur de saisie</option>
                    <option value="AUTRE">Autre raison</option>
                  </select>
                </div>

                <button
                  onClick={() => handlePaymentUpdate('ADJUST_TOTAL', {
                    nouveauMontantTotal: parseFloat(editData.nouveauMontantTotal),
                    raison: editData.adjustementRaison,
                    notes: editData.notes
                  })}
                  disabled={loading || !editData.nouveauMontantTotal || !editData.adjustementRaison}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  Appliquer l'Ajustement
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Historique des modifications</h3>
            </CardHeader>
            <CardContent>
              {transaction.historique && transaction.historique.length > 0 ? (
                <div className="space-y-3">
                  {transaction.historique.map((entry, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-sm text-gray-600">{entry.details}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{entry.utilisateur}</p>
                          <p>{new Date(entry.dateModification).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucune modification enregistrée pour cette transaction
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionManagementModal;
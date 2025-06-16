import React, { useState, useEffect } from 'react';
import { useUpdatePayment } from '../../hooks/useTransactions';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, Input, Label, Select } from '../ui';

const PaymentUpdateModal = ({ transaction, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    montantPaye: '',
    modePaiement: 'ESPECES',
    notesPaiement: '',
    marquerCommePayee: false
  });

  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const updatePaymentMutation = useUpdatePayment();

  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        montantPaye: transaction.montantPaye || '',
        modePaiement: transaction.modePaiement || 'ESPECES',
        notesPaiement: transaction.notesPaiement || '',
        marquerCommePayee: false
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updatePaymentMutation.mutateAsync({
        transactionId: transaction.id,
        paiementData: formData
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur mise à jour paiement:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resteAPayer = transaction?.montantTTC - (parseFloat(formData.montantPaye) || 0);

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`
        max-w-md w-full rounded-lg shadow-xl
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Mettre à jour le paiement
          </h2>
          
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <p className="text-sm">
              <strong>Transaction:</strong> {transaction.numeroTransaction}
            </p>
            <p className="text-sm">
              <strong>Montant total:</strong> {transaction.montantTTC} MAD
            </p>
            <p className="text-sm">
              <strong>Déjà payé:</strong> {transaction.montantPaye || 0} MAD
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Montant payé</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={transaction.montantTTC}
                value={formData.montantPaye}
                onChange={(e) => handleChange('montantPaye', e.target.value)}
                placeholder="Montant payé"
              />
              {resteAPayer > 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  Reste à payer: {resteAPayer.toFixed(2)} MAD
                </p>
              )}
            </div>

            <div>
              <Label>Mode de paiement</Label>
              <Select
                value={formData.modePaiement}
                onChange={(e) => handleChange('modePaiement', e.target.value)}
                options={[
                  { value: 'ESPECES', label: 'Espèces' },
                  { value: 'CARTE_BANCAIRE', label: 'Carte bancaire' },
                  { value: 'VIREMENT', label: 'Virement' },
                  { value: 'CHEQUE', label: 'Chèque' }
                ]}
              />
            </div>

            <div>
              <Label>Notes de paiement</Label>
              <Input
                value={formData.notesPaiement}
                onChange={(e) => handleChange('notesPaiement', e.target.value)}
                placeholder="Notes optionnelles..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="marquerCommePayee"
                checked={formData.marquerCommePayee}
                onChange={(e) => handleChange('marquerCommePayee', e.target.checked)}
              />
              <Label htmlFor="marquerCommePayee">
                Marquer comme entièrement payée
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={updatePaymentMutation.isPending}
                className="flex-1"
              >
                {updatePaymentMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentUpdateModal;
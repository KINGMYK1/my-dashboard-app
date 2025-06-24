import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Banknote } from 'lucide-react';
import { Modal, Button, Input, Select, TextArea } from '../../../components/ui';

const PaiementModal = ({ isOpen, onClose, transaction, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    action: 'ajouter_paiement_partiel',
    montantSupplementaire: '',
    modePaiement: 'ESPECES',
    notes: '',
    derniersChiffresCarte: '',
    typeCarte: '',
    marquerCommePayee: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      // Calculer le montant restant
      const resteAPayer = transaction.resteAPayer || 0;
      setFormData(prev => ({
        ...prev,
        montantSupplementaire: resteAPayer > 0 ? resteAPayer.toString() : '',
        modePaiement: transaction.modePaiement || 'ESPECES'
      }));
    }
  }, [transaction]);

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.action === 'ajouter_paiement_partiel') {
      const montant = parseFloat(formData.montantSupplementaire);
      if (!montant || montant <= 0) {
        newErrors.montantSupplementaire = 'Montant requis et doit être positif';
      }
      if (transaction && montant > transaction.resteAPayer) {
        newErrors.montantSupplementaire = 'Le montant ne peut pas dépasser le reste à payer';
      }
    }

    if (formData.modePaiement === 'CARTE_BANCAIRE') {
      if (!formData.derniersChiffresCarte || formData.derniersChiffresCarte.length !== 4) {
        newErrors.derniersChiffresCarte = 'Les 4 derniers chiffres sont requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const paiementData = {
      ...formData,
      montantSupplementaire: formData.action === 'ajouter_paiement_partiel' 
        ? parseFloat(formData.montantSupplementaire) 
        : undefined
    };

    onUpdate(paiementData);
  };

  const handleActionChange = (action) => {
    setFormData(prev => ({
      ...prev,
      action,
      marquerCommePayee: action === 'finaliser_paiement',
      montantSupplementaire: action === 'finaliser_paiement' 
        ? (transaction?.resteAPayer || 0).toString()
        : prev.montantSupplementaire
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le Paiement"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Résumé de la transaction */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Transaction #{transaction.numeroTransaction}</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total:</span>
              <span className="font-medium ml-2">{formatCurrency(transaction.montantTTC)}</span>
            </div>
            <div>
              <span className="text-gray-500">Payé:</span>
              <span className="font-medium ml-2 text-green-600">{formatCurrency(transaction.montantPaye)}</span>
            </div>
            <div>
              <span className="text-gray-500">Reste:</span>
              <span className="font-medium ml-2 text-orange-600">{formatCurrency(transaction.resteAPayer)}</span>
            </div>
          </div>
        </div>

        {/* Type d'action */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Type d'action</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="ajouter_paiement_partiel"
                checked={formData.action === 'ajouter_paiement_partiel'}
                onChange={(e) => handleActionChange(e.target.value)}
                className="mr-2"
              />
              <span>Ajouter un paiement partiel</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="finaliser_paiement"
                checked={formData.action === 'finaliser_paiement'}
                onChange={(e) => handleActionChange(e.target.value)}
                className="mr-2"
              />
              <span>Finaliser le paiement (marquer comme entièrement payé)</span>
            </label>
          </div>
        </div>

        {/* Montant */}
        {formData.action === 'ajouter_paiement_partiel' && (
          <Input
            label="Montant à ajouter"
            type="number"
            step="0.01"
            min="0.01"
            max={transaction.resteAPayer}
            value={formData.montantSupplementaire}
            onChange={(e) => setFormData(prev => ({ ...prev, montantSupplementaire: e.target.value }))}
            error={errors.montantSupplementaire}
            placeholder="0.00"
            suffix="MAD"
            required
          />
        )}

        {/* Mode de paiement */}
        <Select
          label="Mode de paiement"
          value={formData.modePaiement}
          onChange={(value) => setFormData(prev => ({ ...prev, modePaiement: value }))}
          options={[
            { value: 'ESPECES', label: 'Espèces', icon: <DollarSign className="w-4 h-4" /> },
            { value: 'CARTE_BANCAIRE', label: 'Carte bancaire', icon: <CreditCard className="w-4 h-4" /> },
            { value: 'VIREMENT', label: 'Virement', icon: <Banknote className="w-4 h-4" /> },
            { value: 'CHEQUE', label: 'Chèque', icon: <Banknote className="w-4 h-4" /> }
          ]}
          required
        />

        {/* Détails carte bancaire */}
        {formData.modePaiement === 'CARTE_BANCAIRE' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="4 derniers chiffres"
              type="text"
              maxLength={4}
              pattern="[0-9]{4}"
              value={formData.derniersChiffresCarte}
              onChange={(e) => setFormData(prev => ({ ...prev, derniersChiffresCarte: e.target.value }))}
              error={errors.derniersChiffresCarte}
              placeholder="1234"
            />
            <Select
              label="Type de carte"
              value={formData.typeCarte}
              onChange={(value) => setFormData(prev => ({ ...prev, typeCarte: value }))}
              options={[
                { value: '', label: 'Non spécifié' },
                { value: 'VISA', label: 'Visa' },
                { value: 'MASTERCARD', label: 'MasterCard' },
                { value: 'AMEX', label: 'American Express' }
              ]}
            />
          </div>
        )}

        {/* Notes */}
        <TextArea
          label="Notes (optionnel)"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Commentaires sur ce paiement..."
          rows={3}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {formData.action === 'finaliser_paiement' ? 'Finaliser le paiement' : 'Ajouter le paiement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PaiementModal;
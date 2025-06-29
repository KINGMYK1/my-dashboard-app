import React, { useState, useEffect } from 'react';
import { useSessionActions } from '../../hooks/useSessions';
import PricingService from '../../services/pricingService';

const SessionPaymentModal = ({ isOpen, onClose, session, onPaymentComplete }) => {
  const [paymentData, setPaymentData] = useState({
    montantPaye: 0,
    modePaiement: 'ESPECES',
    notes: '',
    marquerCommePayee: false
  });

  const [paiementInfo, setPaiementInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const { processSessionPayment } = useSessionActions();

  useEffect(() => {
    if (isOpen && session?.id) {
      chargerInfoPaiement();
    }
  }, [isOpen, session?.id]);

  const chargerInfoPaiement = async () => {
    try {
      setLoading(true);
      const info = await PricingService.verifierStatutPaiement(session.id);
      setPaiementInfo(info);
      
      // Préremplir le montant restant
      setPaymentData(prev => ({
        ...prev,
        montantPaye: info.resteAPayer
      }));
    } catch (error) {
      console.error('Erreur chargement info paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const result = await processSessionPayment(session.id, {
        ...paymentData,
        montantPaye: paymentData.marquerCommePayee 
          ? paiementInfo.resteAPayer 
          : paymentData.montantPaye
      });
      
      if (result.success) {
        onPaymentComplete?.(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Erreur traitement paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Paiement Session - {session.poste?.nom}
        </h2>

        {paiementInfo && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Informations de paiement</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Montant total:</span>
                <span className="font-medium">{paiementInfo.montantTotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between">
                <span>Déjà payé:</span>
                <span className="text-green-600">{paiementInfo.montantPaye.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Reste à payer:</span>
                <span className="font-bold text-red-600">{paiementInfo.resteAPayer.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  paiementInfo.statutPaiement === 'PAYEE' ? 'bg-green-100 text-green-800' :
                  paiementInfo.statutPaiement === 'PARTIELLE' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {paiementInfo.statutPaiement}
                </span>
              </div>
            </div>

            {/* Historique des paiements */}
            {paiementInfo.transactions.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="text-sm font-medium mb-2">Historique des paiements:</h4>
                <div className="space-y-1 text-xs">
                  {paiementInfo.transactions.map((transaction, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{transaction.modePaiement}</span>
                      <span>{transaction.montantPaye.toFixed(2)} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Option paiement complet */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="marquerCommePayee"
              checked={paymentData.marquerCommePayee}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                marquerCommePayee: e.target.checked,
                montantPaye: e.target.checked ? paiementInfo?.resteAPayer || 0 : 0
              }))}
            />
            <label htmlFor="marquerCommePayee" className="text-sm">
              Marquer comme entièrement payée
            </label>
          </div>

          {/* Montant à payer */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Montant à payer (MAD)
            </label>
            <input
              type="number"
              min="0"
              max={paiementInfo?.resteAPayer || 0}
              step="0.01"
              value={paymentData.montantPaye}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                montantPaye: parseFloat(e.target.value) || 0
              }))}
              className="w-full p-2 border rounded-lg"
              disabled={paymentData.marquerCommePayee}
              required
            />
          </div>

          {/* Mode de paiement */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mode de paiement
            </label>
            <select
              value={paymentData.modePaiement}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                modePaiement: e.target.value
              }))}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="ESPECES">Espèces</option>
              <option value="CARTE">Carte bancaire</option>
              <option value="VIREMENT">Virement</option>
              <option value="CHEQUE">Chèque</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="w-full p-2 border rounded-lg h-20"
              placeholder="Notes sur le paiement..."
            />
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading || !paiementInfo || paymentData.montantPaye <= 0}
            >
              {loading ? 'Traitement...' : 'Enregistrer Paiement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionPaymentModal;
import React, { useState, useEffect, useMemo } from 'react';
import { useSessionActions } from '../../hooks/useSessions';
import { useClients } from '../../hooks/useClients';
import PricingService from '../../services/pricingService';

const StartSessionModal = ({ isOpen, onClose, poste, onSessionStarted }) => {
  const [formData, setFormData] = useState({
    dureeMinutes: 60,
    clientId: null,
    abonnementId: null,
    notes: '',
    paiementImmediat: false,
    modePaiement: 'ESPECES',
    montantPaye: 0
  });

  const [prixEstime, setPrixEstime] = useState(null);
  const [loading, setLoading] = useState(false);

  const { startSession } = useSessionActions();
  const { data: clients } = useClients();

  // ✅ CALCUL DU PRIX EN TEMPS RÉEL
  useEffect(() => {
    if (poste?.id && formData.dureeMinutes > 0) {
      calculerPrixEstime();
    }
  }, [poste?.id, formData.dureeMinutes, formData.clientId]);

  const calculerPrixEstime = async () => {
    try {
      setLoading(true);
      const estimation = await PricingService.calculerPrixEstime(
        poste.id,
        formData.dureeMinutes,
        formData.abonnementId
      );
      setPrixEstime(estimation);
      
      // Mettre à jour le montant payé si paiement immédiat
      if (formData.paiementImmediat) {
        setFormData(prev => ({
          ...prev,
          montantPaye: estimation.prixFinal
        }));
      }
    } catch (error) {
      console.error('Erreur calcul prix:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const sessionData = {
        posteId: poste.id,
        dureeMinutes: formData.dureeMinutes,
        clientId: formData.clientId,
        notes: formData.notes,
        paiementImmediat: formData.paiementImmediat,
        modePaiement: formData.paiementImmediat ? formData.modePaiement : null,
        montantPaye: formData.paiementImmediat ? formData.montantPaye : 0
      };

      const result = await startSession(sessionData);
      
      if (result.success) {
        onSessionStarted?.(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Erreur démarrage session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Démarrer Session - {poste?.nom}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Durée estimée */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Durée estimée (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="480"
              step="15"
              value={formData.dureeMinutes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dureeMinutes: parseInt(e.target.value)
              }))}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          {/* Client (optionnel) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Client (optionnel)
            </label>
            <select
              value={formData.clientId || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                clientId: e.target.value ? parseInt(e.target.value) : null
              }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Aucun client</option>
              {clients?.map(client => (
                <option key={client.id} value={client.id}>
                  {client.prenom} {client.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Estimation de prix */}
          {prixEstime && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Estimation du prix
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Tarif horaire:</span>
                  <span>{prixEstime.tarifHoraire} MAD/h</span>
                </div>
                <div className="flex justify-between">
                  <span>Durée:</span>
                  <span>{prixEstime.dureeHeures.toFixed(2)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Prix de base:</span>
                  <span>{prixEstime.prixBase.toFixed(2)} MAD</span>
                </div>
                {prixEstime.reduction > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction:</span>
                    <span>-{prixEstime.reduction.toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-1">
                  <span>Prix estimé:</span>
                  <span className="text-blue-600">{prixEstime.prixFinal.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          )}

          {/* Option paiement immédiat */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="paiementImmediat"
              checked={formData.paiementImmediat}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                paiementImmediat: e.target.checked
              }))}
            />
            <label htmlFor="paiementImmediat" className="text-sm">
              Effectuer le paiement maintenant
            </label>
          </div>

          {/* Options de paiement si paiement immédiat */}
          {formData.paiementImmediat && (
            <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mode de paiement
                </label>
                <select
                  value={formData.modePaiement}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    modePaiement: e.target.value
                  }))}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="ESPECES">Espèces</option>
                  <option value="CARTE">Carte bancaire</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Montant payé (MAD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.montantPaye}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    montantPaye: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full p-2 border rounded-lg"
                  required={formData.paiementImmediat}
                />
                {prixEstime && formData.montantPaye < prixEstime.prixFinal && (
                  <p className="text-orange-600 text-xs mt-1">
                    Paiement partiel - Reste: {(prixEstime.prixFinal - formData.montantPaye).toFixed(2)} MAD
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="w-full p-2 border rounded-lg h-20"
              placeholder="Notes sur la session..."
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !prixEstime}
            >
              {loading ? 'Chargement...' : 'Démarrer Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartSessionModal;
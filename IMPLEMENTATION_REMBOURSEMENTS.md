# Implémentation des Remboursements dans le Gestionnaire de Transactions

## 🔍 Aperçu

Cette documentation détaille comment implémenter la fonctionnalité de remboursement dans le gestionnaire de transactions existant. Le remboursement permettra aux administrateurs de rembourser partiellement ou totalement les sessions payées.

## 📋 Exigences fonctionnelles

1. Permettre des remboursements partiels ou complets
2. Enregistrer les détails du remboursement (motif, montant, mode)
3. Mettre à jour l'historique des transactions
4. Générer des reçus de remboursement

## 📐 Architecture technique

### 1. Modèle de données

Nous allons ajouter un nouveau type de transaction `REMBOURSEMENT` et étendre le modèle de transaction existant :

```javascript
{
  id: 1,
  sessionId: 123,
  montant: 50.00,             // Montant positif même pour remboursement
  type: 'REMBOURSEMENT',      // Nouveau type (PAIEMENT, REMBOURSEMENT)
  modePaiement: 'ESPECES',
  motifRemboursement: 'Session interrompue par panne',
  referenceTransactionOriginale: 456,  // ID de la transaction remboursée
  dateCreation: '2023-08-15T14:30:00Z',
  utilisateurId: 789,         // Qui a effectué le remboursement
  notes: 'Remboursement partiel'
}
```

### 2. Modifications du backend

Ajouter ces endpoints à l'API :

```
POST /api/transactions/remboursement
GET /api/transactions/remboursements?sessionId=123
PATCH /api/transactions/remboursement/:id
```

### 3. Nouveaux hooks React

Créer de nouveaux hooks dans `useTransactions.js` :

```javascript
/**
 * Hook pour effectuer un remboursement
 */
export function useEffectuerRemboursement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  
  return useMutation({
    mutationFn: (remboursementData) => 
      transactionService.effectuerRemboursement(remboursementData),
    
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ 
        queryKey: ['session', variables.sessionId] 
      });
      
      showSuccess('Remboursement effectué avec succès');
    },
    
    onError: (error) => {
      console.error('❌ [USE_REMBOURSEMENT] Erreur:', error);
      showError(
        error.message || 
        'Erreur lors du remboursement'
      );
    }
  });
}

/**
 * Hook pour récupérer l'historique des remboursements
 */
export function useRemboursements(sessionId) {
  return useQuery({
    queryKey: ['remboursements', sessionId],
    queryFn: () => transactionService.getRemboursements(sessionId),
    enabled: !!sessionId
  });
}
```

### 4. Services

Étendre `transactionService.js` :

```javascript
/**
 * Effectuer un remboursement
 */
async effectuerRemboursement(remboursementData) {
  try {
    const response = await api.post(
      `${this.baseUrl}/remboursement`, 
      remboursementData
    );
    return response;
  } catch (error) {
    console.error('❌ [TRANSACTION_SERVICE] Erreur remboursement:', error);
    throw error;
  }
}

/**
 * Récupérer l'historique des remboursements
 */
async getRemboursements(sessionId) {
  try {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    
    const response = await api.get(
      `${this.baseUrl}/remboursements?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('❌ [TRANSACTION_SERVICE] Erreur récupération remboursements:', error);
    throw error;
  }
}
```

## 🛠 Implémentation des composants

### 1. Modal de remboursement

Créer un nouveau composant `RemboursementModal.jsx` :

```jsx
import React, { useState } from 'react';
import { useEffectuerRemboursement } from '../../hooks/useTransactions';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const RemboursementModal = ({ isOpen, onClose, session, transactionId }) => {
  const [formData, setFormData] = useState({
    montant: '',
    modePaiement: 'ESPECES',
    motifRemboursement: '',
    notes: ''
  });
  
  const remboursementMutation = useEffectuerRemboursement();
  const isLoading = remboursementMutation.isLoading;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await remboursementMutation.mutateAsync({
        sessionId: session.id,
        transactionId: transactionId, // Si remboursement d'une transaction spécifique
        montant: parseFloat(formData.montant),
        modePaiement: formData.modePaiement,
        motifRemboursement: formData.motifRemboursement,
        notes: formData.notes
      });
      
      onClose();
    } catch (error) {
      // Erreur déjà gérée par le hook
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Effectuer un remboursement
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Montant à rembourser (MAD)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={session.montantTotal}
              value={formData.montant}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                montant: e.target.value
              }))}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Mode de remboursement
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
              Motif du remboursement
            </label>
            <select
              value={formData.motifRemboursement}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                motifRemboursement: e.target.value
              }))}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un motif</option>
              <option value="SESSION_INTERROMPUE">Session interrompue</option>
              <option value="PROBLEME_TECHNIQUE">Problème technique</option>
              <option value="INSATISFACTION_CLIENT">Insatisfaction client</option>
              <option value="ERREUR_FACTURATION">Erreur de facturation</option>
              <option value="AUTRE">Autre motif</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes complémentaires
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="w-full p-2 border rounded-lg"
              rows={3}
              placeholder="Détails supplémentaires sur le remboursement..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Traitement...
                </>
              ) : (
                'Effectuer le remboursement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemboursementModal;
```

### 2. Extension du TransactionManager

Modifier le composant `TransactionManager.jsx` pour ajouter la fonctionnalité de remboursement :

```jsx
// Ajouter un bouton de remboursement
const [showRemboursementModal, setShowRemboursementModal] = useState(false);

// Ajouter dans la section des boutons
<button
  onClick={() => setShowRemboursementModal(true)}
  className="ml-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium flex items-center gap-2"
>
  <RefreshCw className="w-4 h-4" />
  Remboursement
</button>

// Ajouter le modal à la fin du composant
{showRemboursementModal && (
  <RemboursementModal
    isOpen={showRemboursementModal}
    onClose={() => setShowRemboursementModal(false)}
    session={session}
  />
)}
```

### 3. Affichage des remboursements

Modifier l'affichage des transactions pour différencier visuellement les remboursements :

```jsx
{transactions.map(transaction => (
  <div 
    key={transaction.id} 
    className={`p-3 border-b last:border-b-0 ${
      transaction.type === 'REMBOURSEMENT' 
        ? 'bg-orange-50 dark:bg-orange-900/20' 
        : ''
    }`}
  >
    <div className="flex justify-between items-center">
      <div>
        <span className={`font-medium ${
          transaction.type === 'REMBOURSEMENT' 
            ? 'text-orange-600' 
            : 'text-gray-800 dark:text-gray-200'
        }`}>
          {transaction.type === 'REMBOURSEMENT' 
            ? '↩️ Remboursement' 
            : '💰 Paiement'}: {formatCurrency(transaction.montant)}
        </span>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDateTime(transaction.dateCreation)} • 
          {getModePaiementLabel(transaction.modePaiement)}
        </div>
        {transaction.motifRemboursement && (
          <div className="mt-1 text-sm text-orange-600 dark:text-orange-400">
            Motif: {getMotifRemboursementLabel(transaction.motifRemboursement)}
          </div>
        )}
      </div>
      
      {/* Actions seulement pour les paiements, pas pour les remboursements */}
      {transaction.type !== 'REMBOURSEMENT' && (
        <div className="flex items-center space-x-2">
          {/* Boutons d'édition et suppression existants */}
        </div>
      )}
    </div>
  </div>
))}
```

## 📄 Gestion des reçus

Ajouter une fonction pour générer des reçus de remboursement :

```javascript
// Dans un nouveau fichier receiptService.js
export function genererRecuRemboursement(transaction, session) {
  return {
    title: `Reçu de remboursement #${transaction.id}`,
    date: new Date(transaction.dateCreation).toLocaleString(),
    sessionInfo: {
      id: session.id,
      poste: session.Poste?.nom || 'N/A',
      client: session.Client ? `${session.Client.prenom} ${session.Client.nom}` : 'Client occasionnel'
    },
    remboursementInfo: {
      montant: transaction.montant,
      modePaiement: transaction.modePaiement,
      motif: transaction.motifRemboursement,
      notes: transaction.notes
    },
    footer: {
      text: "Merci de votre visite. Nous espérons vous revoir bientôt.",
      adresse: "Gaming Center, 123 Rue des Jeux, Casablanca"
    }
  };
}
```

## 🧪 Tests à réaliser

1. Remboursement partiel d'une session
2. Remboursement total d'une session
3. Vérification des contraintes de montant maximum
4. Affichage correct dans l'historique des transactions
5. Génération correcte des reçus de remboursement

## 🚨 Considérations de sécurité

1. Seuls les utilisateurs avec le rôle admin ou les permissions spécifiques peuvent effectuer des remboursements
2. Validation stricte des montants côté serveur
3. Journalisation complète des opérations de remboursement
4. Confirmation en deux étapes pour les remboursements importants

## 📅 Plan d'implémentation

1. **Semaine 1**: Modifications du backend et des modèles de données
2. **Semaine 2**: Implémentation des services et hooks frontend
3. **Semaine 3**: Développement des composants UI
4. **Semaine 4**: Tests, corrections et documentation

Cette fonctionnalité apportera une grande valeur ajoutée au système en permettant une gestion financière complète et flexible des sessions.

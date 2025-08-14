# Tutoriel avancé: Gestionnaire de Transactions

## Introduction

Ce tutoriel explique en détail comment intégrer et utiliser le `TransactionManager` dans votre application React. Ce composant offre une solution complète pour gérer les transactions financières liées aux sessions.

## Prérequis

- React 16.8+ (hooks)
- TanStack Query v4+ (anciennement React Query)
- Un backend compatible avec l'API de transactions

## Installation et configuration

Le composant est déjà intégré dans le projet. Vous n'avez pas besoin de l'installer séparément.

## Cas d'utilisation typiques

### 1. Modal de fin de session

Le cas d'utilisation le plus courant est d'intégrer le gestionnaire dans le modal de fin de session :

```jsx
import React, { useState } from 'react';
import SimpleEndSessionModal from '../components/Sessions/SimpleEndSessionModal';
import { useSessionActions } from '../hooks/useSessions';

function SessionCard({ session }) {
  const [showEndModal, setShowEndModal] = useState(false);
  const { endSession } = useSessionActions();
  
  const handleSessionEnded = async (result) => {
    if (result.success) {
      // Traitement après la fin réussie de la session
      console.log('Session terminée avec succès:', result.data);
    }
  };
  
  return (
    <div>
      <h3>Session #{session.id}</h3>
      <button onClick={() => setShowEndModal(true)}>
        Terminer la session
      </button>
      
      {showEndModal && (
        <SimpleEndSessionModal
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
          session={session}
          onSessionEnded={handleSessionEnded}
        />
      )}
    </div>
  );
}
```

### 2. Utilisation autonome

Vous pouvez également utiliser le gestionnaire de transactions de manière autonome, par exemple dans une page de détails de session :

```jsx
import React from 'react';
import TransactionManager from '../components/Sessions/TransactionManager';
import { 
  useAjouterTransactionSession,
  useModifierTransaction,
  useSupprimerTransaction 
} from '../hooks/useTransactions';

function SessionDetailPage({ session }) {
  const ajouterTransactionMutation = useAjouterTransactionSession();
  const modifierTransactionMutation = useModifierTransaction();
  const supprimerTransactionMutation = useSupprimerTransaction();
  
  const handleAddTransaction = async (transactionData) => {
    try {
      await ajouterTransactionMutation.mutateAsync({
        sessionId: session.id,
        ...transactionData
      });
      return true; // Succès
    } catch (error) {
      console.error('Erreur ajout transaction:', error);
      return false; // Échec
    }
  };
  
  const handleUpdateTransaction = async (id, transactionData) => {
    try {
      await modifierTransactionMutation.mutateAsync({
        id, 
        data: transactionData
      });
      return true;
    } catch (error) {
      console.error('Erreur modification transaction:', error);
      return false;
    }
  };
  
  const handleDeleteTransaction = async (id) => {
    try {
      await supprimerTransactionMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Erreur suppression transaction:', error);
      return false;
    }
  };
  
  return (
    <div className="p-4">
      <h2>Détails de la session #{session.id}</h2>
      
      <div className="mt-6 border rounded-lg overflow-hidden">
        <TransactionManager
          session={session}
          onTransactionAdded={handleAddTransaction}
          onTransactionUpdated={handleUpdateTransaction}
          onTransactionDeleted={handleDeleteTransaction}
        />
      </div>
    </div>
  );
}
```

## API du composant

### Props

Le composant `TransactionManager` accepte les props suivantes :

| Prop | Type | Description |
|------|------|-------------|
| `session` | Object | **Obligatoire**. L'objet session avec les informations sur le montant et les transactions existantes. |
| `onTransactionAdded` | Function | **Obligatoire**. Fonction appelée lors de l'ajout d'une transaction. Signature : `(transactionData) => Promise<boolean>` |
| `onTransactionUpdated` | Function | **Obligatoire**. Fonction appelée lors de la modification d'une transaction. Signature : `(id, transactionData) => Promise<boolean>` |
| `onTransactionDeleted` | Function | **Obligatoire**. Fonction appelée lors de la suppression d'une transaction. Signature : `(id) => Promise<boolean>` |
| `hideHeader` | Boolean | Facultatif. Masque l'en-tête du composant. Par défaut : `false` |
| `hideAddButton` | Boolean | Facultatif. Masque le bouton d'ajout. Par défaut : `false` |
| `hideTransactionList` | Boolean | Facultatif. Masque la liste des transactions. Par défaut : `false` |

### Structure de l'objet session

L'objet `session` passé au composant doit avoir la structure suivante :

```javascript
{
  id: 123,                  // ID unique de la session
  montantTotal: 100.00,     // Montant total de la session
  transactions: [           // Tableau des transactions liées à la session
    {
      id: 1,
      montant: 50.00,
      modePaiement: 'ESPECES',
      dateCreation: '2023-08-15T14:30:00Z',
      notes: 'Paiement partiel'
    },
    // ...autres transactions
  ]
}
```

## Personnalisation de l'interface

Le composant utilise le contexte de thème de l'application pour s'adapter automatiquement aux thèmes clair et sombre. Voici comment vous pouvez personnaliser davantage son apparence :

```jsx
// Exemple avec surcharge de styles
import TransactionManager from '../components/Sessions/TransactionManager';

<div className="custom-transaction-container">
  <TransactionManager
    session={session}
    onTransactionAdded={handleAdd}
    onTransactionUpdated={handleUpdate}
    onTransactionDeleted={handleDelete}
  />
</div>

// CSS personnalisé
<style jsx>{`
  .custom-transaction-container {
    --tm-primary-color: #3b82f6;
    --tm-success-color: #10b981;
    --tm-warning-color: #f59e0b;
    --tm-danger-color: #ef4444;
    --tm-border-radius: 8px;
    
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-radius: var(--tm-border-radius);
    overflow: hidden;
  }
`}</style>
```

## Flux de travail complet

Voici un exemple de flux de travail complet pour une session :

1. **Démarrage de la session**
   - Création avec ou sans paiement initial

2. **Pendant la session**
   - Ajout de transactions partielles (acomptes)
   - Modification des transactions existantes si nécessaire

3. **Fin de session**
   - Vérification du solde restant
   - Ajout de la transaction finale si nécessaire
   - Clôture de la session une fois entièrement payée

## Bonnes pratiques

1. **Validation côté client**
   - Vérifiez que les montants sont positifs
   - Confirmez les actions destructives (suppressions)

2. **Gestion des erreurs**
   - Utilisez try/catch pour capturer les erreurs d'API
   - Affichez des messages d'erreur explicites

3. **UX optimisée**
   - Désactivez les boutons pendant les opérations asynchrones
   - Fournissez un feedback visuel immédiat

## Dépannage

### Problèmes courants et solutions

1. **Les transactions ne s'affichent pas**
   - Vérifiez que l'objet session contient bien un tableau `transactions`
   - Assurez-vous que le composant reçoit les données à jour après une mutation

2. **Erreurs lors de l'ajout/modification**
   - Vérifiez les logs de la console pour les erreurs détaillées
   - Assurez-vous que les fonctions de callback renvoient bien une Promise

3. **Problèmes de mise à jour d'interface**
   - Utilisez `queryClient.invalidateQueries()` après les mutations pour rafraîchir les données

## Conclusion

Le `TransactionManager` est un composant puissant qui simplifie considérablement la gestion des transactions dans votre application. En suivant ce tutoriel, vous devriez pouvoir l'intégrer efficacement dans votre flux de travail et tirer parti de toutes ses fonctionnalités.

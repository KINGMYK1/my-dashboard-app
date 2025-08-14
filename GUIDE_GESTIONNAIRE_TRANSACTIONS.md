# Guide du Gestionnaire de Transactions

## 📋 Vue d'ensemble

Le Gestionnaire de Transactions est un composant clé qui permet la gestion complète des paiements pour les sessions de jeu. Il offre une interface intuitive pour ajouter, modifier et supprimer des transactions, tout en affichant un résumé clair du statut financier de chaque session.

## 🚀 Fonctionnalités principales

### Affichage du statut financier

- **Montant total** : Prix calculé de la session
- **Montant payé** : Somme de toutes les transactions
- **Solde restant** : Différence entre le montant total et le montant payé
- **Indicateurs visuels** : Vert pour payé complètement, orange pour paiement partiel

### Gestion des transactions

- **Ajouter** une nouvelle transaction avec différents modes de paiement
- **Modifier** une transaction existante
- **Supprimer** une transaction avec confirmation
- **Historique** détaillé de toutes les transactions effectuées

## 💡 Comment utiliser

### 1. Dans le Modal de fin de session

Le composant est déjà intégré dans `SimpleEndSessionModal`. Il suffit d'utiliser ce modal pour terminer une session :

```jsx
import SimpleEndSessionModal from '../components/Sessions/SimpleEndSessionModal';

<SimpleEndSessionModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  session={sessionData}
  onSessionEnded={handleSessionEnded}
/>
```

### 2. Utilisation autonome

Pour utiliser le gestionnaire de transactions dans n'importe quelle partie de l'application :

```jsx
import TransactionManager from '../components/Sessions/TransactionManager';

<TransactionManager
  session={session}
  onTransactionAdded={handleAdd}
  onTransactionUpdated={handleUpdate}
  onTransactionDeleted={handleDelete}
/>
```

## 📝 Guide d'utilisation pas à pas

### Pour ajouter une transaction

1. Cliquer sur le bouton **"Ajouter une transaction"**
2. Remplir le formulaire avec :
   - **Montant** du paiement
   - **Mode de paiement** (Espèces, Carte, Virement, Chèque)
   - **Notes** (optionnel)
3. Cliquer sur **"Ajouter"** pour valider

### Pour modifier une transaction

1. Trouver la transaction dans la liste
2. Cliquer sur l'icône de **crayon** (✏️)
3. Modifier les champs souhaités
4. Cliquer sur **"Modifier"** pour sauvegarder

### Pour supprimer une transaction

1. Trouver la transaction dans la liste
2. Cliquer sur l'icône de **poubelle** (🗑️)
3. Confirmer la suppression dans la boîte de dialogue

## ⚠️ Points importants

- Une session ne peut être terminée que si elle est **entièrement payée**
- Les transactions sont synchronisées en temps réel avec le backend
- Toutes les opérations sont accompagnées de notifications (succès/erreur)
- Le composant s'adapte automatiquement au thème clair/sombre

## 🧪 Dépannage

Si vous rencontrez des problèmes avec le gestionnaire de transactions :

1. Vérifiez que la session est correctement chargée avec son ID
2. Assurez-vous que les hooks d'API sont disponibles dans le contexte
3. Consultez la console pour d'éventuels messages d'erreur
4. Vérifiez que tous les callbacks requis sont correctement passés au composant

## 🔧 Personnalisation avancée

Le gestionnaire de transactions peut être personnalisé avec des options supplémentaires :

```jsx
<TransactionManager
  session={session}
  onTransactionAdded={handleAdd}
  onTransactionUpdated={handleUpdate}
  onTransactionDeleted={handleDelete}
  hideHeader={false}        // Masquer l'en-tête du composant
  hideAddButton={false}     // Masquer le bouton d'ajout
  hideTransactionList={false} // Masquer la liste des transactions
  customTheme="blue"        // Thème personnalisé (blue, green, orange)
/>
```

Ce système de gestion des transactions apporte une solution robuste et intuitive pour gérer tous les aspects financiers des sessions de jeu du centre.

# 🔧 Guide de résolution des erreurs 403 pour l'employé MYK

## 📋 Problème identifié

L'employé **MYK** reçoit des erreurs **403 Forbidden** lors de l'accès aux ressources suivantes :
- `/api/postes` (nécessite permission `POSTES_VIEW`)
- `/api/clients` (nécessite permission `CLIENTS_VIEW`)
- `/api/sessions` (nécessite permission `SESSIONS_CREATE`)

## 🎯 Solutions implémentées côté Frontend

### 1. **Gestion des permissions améliorée**
- ✅ Nouveau système de permissions dans `src/utils/permissionUtils.js`
- ✅ Composant `PermissionGuard` pour l'affichage conditionnel
- ✅ Hook `useUserPermissions` pour vérifier les droits
- ✅ Message d'erreur informatif avec `PermissionDeniedMessage`

### 2. **Sessions avec abonnements**
- ✅ Nouveau modal `SessionWithSubscriptionModal` 
- ✅ Gestion des avantages d'abonnement (réductions, heures offertes)
- ✅ Calculs automatiques des tarifs préférentiels
- ✅ Interface intuitive en 3 étapes

### 3. **Interface améliorée**
- ✅ Boutons conditionnels selon les permissions
- ✅ Messages d'erreur clairs et informatifs
- ✅ Indicateurs visuels pour les restrictions d'accès

## 🔧 Solution recommandée côté Backend

Pour résoudre définitivement le problème de l'employé MYK, il faut **attribuer les permissions manquantes** à son rôle :

### Permissions nécessaires pour un employé caissier :
```sql
-- Supposons que MYK a le rôle 'EMPLOYE_CAISSIER'
INSERT INTO role_permissions (role_id, permission_id) VALUES
(
  (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER'),
  (SELECT id FROM permissions WHERE nom = 'POSTES_VIEW')
),
(
  (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER'),
  (SELECT id FROM permissions WHERE nom = 'CLIENTS_VIEW')
),
(
  (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER'),
  (SELECT id FROM permissions WHERE nom = 'CLIENTS_CREATE')
),
(
  (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER'),
  (SELECT id FROM permissions WHERE nom = 'SESSIONS_CREATE')
),
(
  (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER'),
  (SELECT id FROM permissions WHERE nom = 'SESSIONS_MANAGE')
),
(
  (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER'),
  (SELECT id FROM permissions WHERE nom = 'TRANSACTIONS_VIEW')
),
(
  (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER'),
  (SELECT id FROM permissions WHERE nom = 'TRANSACTIONS_CREATE')
);
```

## 🛠️ Corrections enum TARIF_HORAIRE

### Problème identifié :
```javascript
// ❌ Dans SessionService.js - INCORRECT
planTarifaireUtilise: 'TARIF_HORAIRE'  // Cette valeur n'existe pas dans l'enum

// ✅ Correction nécessaire - CORRECT  
planTarifaireUtilise: 'PLAN_TARIFAIRE' // Cette valeur existe dans l'enum
```

### Fichiers à corriger dans le backend :
1. **SessionService.js** - ligne où `terminaison` utilise `TARIF_HORAIRE`
2. Vérifier toutes les occurrences de cette enum dans le code

## 📱 Test des nouvelles fonctionnalités

### Pour tester les sessions avec abonnement :
1. Connectez-vous avec un compte ayant les bonnes permissions
2. Cliquez sur **"Session Abonnement"** (bouton violet)
3. Sélectionnez un client
4. Choisissez un abonnement actif 
5. Configurez la durée et confirmez
6. Vérifiez que les avantages sont appliqués automatiquement

### Pour tester la gestion des permissions :
1. Connectez-vous avec l'employé MYK
2. Observez les messages d'erreur informatifs
3. Vérifiez que seules les fonctions autorisées sont accessibles
4. Après correction backend, vérifiez l'accès complet

## 🎯 Statut des corrections

### ✅ Complété côté Frontend :
- [x] Système de permissions
- [x] Messages d'erreur informatifs
- [x] Sessions avec abonnements
- [x] Interface utilisateur améliorée
- [x] Gestion conditionnelle des boutons

### ⏳ À faire côté Backend :
- [ ] Corriger les valeurs enum TARIF_HORAIRE → PLAN_TARIFAIRE
- [ ] Attribuer permissions POSTES_VIEW à EMPLOYE_CAISSIER
- [ ] Attribuer permissions CLIENTS_VIEW à EMPLOYE_CAISSIER  
- [ ] Attribuer permissions SESSIONS_CREATE à EMPLOYE_CAISSIER
- [ ] Tester l'accès de l'employé MYK après corrections

## 🚀 Prochaines étapes

1. **Immédiat** : Corriger les permissions backend pour MYK
2. **Court terme** : Corriger les valeurs enum dans SessionService
3. **Moyen terme** : Tester les nouvelles fonctionnalités d'abonnement
4. **Long terme** : Optimiser les performances des sessions

Le frontend est maintenant prêt et peut gérer intelligemment les permissions manquantes ! 🎉

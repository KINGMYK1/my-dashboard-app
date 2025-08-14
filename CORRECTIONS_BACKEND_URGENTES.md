# 🔧 Corrections Backend Urgentes

## 🚨 Problème 1 : Erreur Enum TARIF_HORAIRE

### 📍 Localisation du problème

**Fichier backend** : `SessionService.js` (méthode `terminaison`)

### ❌ Code problématique actuel :

```javascript
// Dans la méthode de terminaison de session
planTarifaireUtilise: 'TARIF_HORAIRE'  // ← Cette valeur n'existe PAS dans l'enum PostgreSQL
```

### ✅ Correction à appliquer :

```javascript
// Remplacer par :
planTarifaireUtilise: 'PLAN_TARIFAIRE'  // ← Cette valeur existe dans l'enum
```

### 🔍 Comment trouver :

```bash
# Dans le backend, chercher toutes les occurrences
grep -r "TARIF_HORAIRE" ./src/
```

---

## 🚨 Problème 2 : Permissions manquantes pour l'employé MYK

### 📍 Problème identifié

L'employé **MYK** reçoit **403 Forbidden** car son rôle `EMPLOYE_CAISSIER` n'a pas les permissions nécessaires.

### ✅ Solution SQL directe :

```sql
-- 1. Vérifier les permissions existantes du rôle EMPLOYE_CAISSIER
SELECT r.nom as role_nom, p.nom as permission_nom 
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.nom = 'EMPLOYE_CAISSIER';

-- 2. Ajouter les permissions manquantes
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER') as role_id,
    p.id as permission_id
FROM permissions p 
WHERE p.nom IN (
    'POSTES_VIEW',
    'CLIENTS_VIEW', 
    'CLIENTS_CREATE',
    'SESSIONS_CREATE',
    'SESSIONS_MANAGE',
    'SESSIONS_VIEW',
    'TRANSACTIONS_VIEW',
    'TRANSACTIONS_CREATE'
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = (SELECT id FROM roles WHERE nom = 'EMPLOYE_CAISSIER')
    AND rp.permission_id = p.id
);

-- 3. Vérifier que les permissions ont été ajoutées
SELECT r.nom as role_nom, p.nom as permission_nom 
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.nom = 'EMPLOYE_CAISSIER'
ORDER BY p.nom;
```

### 🎯 Alternative via interface admin :

Si vous avez une interface d'administration :

1. Aller dans **Gestion des Rôles**
2. Sélectionner le rôle **EMPLOYE_CAISSIER**
3. Cocher les permissions :
   - ☑️ POSTES_VIEW
   - ☑️ CLIENTS_VIEW
   - ☑️ CLIENTS_CREATE
   - ☑️ SESSIONS_CREATE
   - ☑️ SESSIONS_MANAGE
   - ☑️ SESSIONS_VIEW
   - ☑️ TRANSACTIONS_VIEW
   - ☑️ TRANSACTIONS_CREATE

---

## 🧪 Tests après corrections

### 1. Test enum :

```bash
# Essayer de créer/terminer une session
curl -X POST /api/sessions/:id/terminer \
-H "Authorization: Bearer <token_myk>" \
-d '{"modePaiement":"ESPECES","montantPaye":10}'
```

### 2. Test permissions :

```bash
# Test accès postes
curl -X GET /api/postes \
-H "Authorization: Bearer <token_myk>"

# Test accès clients  
curl -X GET /api/clients \
-H "Authorization: Bearer <token_myk>"

# Test création session
curl -X POST /api/sessions \
-H "Authorization: Bearer <token_myk>" \
-d '{"posteId":1,"dureeEstimeeMinutes":60}'
```

### 3. Réponses attendues :

```json
// ✅ Succès (au lieu de 403)
{
  "success": true,
  "data": [...],
  "message": "Opération réussie"
}

// ❌ Avant correction (erreur 403)
{
  "error": "Forbidden", 
  "message": "Permission denied",
  "status": 403
}
```

---

## 📋 Checklist de validation

### Enum TARIF_HORAIRE :

- [ ] Trouver toutes les occurrences de `'TARIF_HORAIRE'` dans le code
- [ ] Remplacer par `'PLAN_TARIFAIRE'`
- [ ] Tester la terminaison de session
- [ ] Vérifier que plus d'erreur PostgreSQL

### Permissions MYK :

- [ ] Exécuter les requêtes SQL de permissions
- [ ] Vérifier que MYK peut accéder à `/api/postes`
- [ ] Vérifier que MYK peut accéder à `/api/clients`
- [ ] Vérifier que MYK peut créer des sessions
- [ ] Tester l'interface frontend avec le compte MYK

### Validation frontend :

- [ ] L'employé MYK peut accéder à la page Sessions
- [ ] Les boutons de création de session sont visibles
- [ ] Pas de message "Accès refusé"
- [ ] Les sessions avec abonnement fonctionnent

---

## 🚀 Impact des corrections

### Immédiat :

- ✅ Plus d'erreurs 403 pour l'employé MYK
- ✅ Plus d'erreurs enum lors de la terminaison de sessions
- ✅ Interface complètement fonctionnelle

### À moyen terme :

- ✅ Sessions avec abonnements opérationnelles
- ✅ Gestion des permissions robuste
- ✅ Meilleure expérience utilisateur

**🎯 Priorité** : Corriger les permissions en premier (plus critique pour le workflow quotidien), puis l'enum (empêche la terminaison des sessions).

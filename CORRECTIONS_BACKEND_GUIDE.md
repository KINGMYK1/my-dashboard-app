# 🔧 Guide de Corrections Backend

## Problème 1: Erreur SQL Statistiques (column "statuttransaction" does not exist)

**Fichier à corriger**: `Backend 2.0/gaming-center-backend/services/TransactionService.js`

**Ligne concernée**: Autour de la ligne 561 dans la méthode `obtenirStatistiquesCompletes`

### ❌ Code problématique :
```sql
COUNT(CASE WHEN statutTransaction = "VALIDEE" THEN 1 END) AS "transactionsValidees",
COUNT(CASE WHEN statutTransaction = "PARTIELLEMENT_PAYEE" THEN 1 END) AS "transactionsPartielles",
COUNT(CASE WHEN statutTransaction = "EN_ATTENTE" THEN 1 END) AS "transactionsEnAttente"
```

### ✅ Code corrigé :
```sql
COUNT(CASE WHEN "Transaction"."statutTransaction" = 'VALIDEE' THEN 1 END) AS "transactionsValidees",
COUNT(CASE WHEN "Transaction"."statutTransaction" = 'PARTIELLEMENT_PAYEE' THEN 1 END) AS "transactionsPartielles",
COUNT(CASE WHEN "Transaction"."statutTransaction" = 'EN_ATTENTE' THEN 1 END) AS "transactionsEnAttente"
```

**Changements nécessaires** :
1. Remplacer `statutTransaction` par `"Transaction"."statutTransaction"`
2. Remplacer les guillemets doubles par des guillemets simples pour les valeurs
3. S'assurer que toutes les références aux colonnes utilisent le bon alias de table

---

## Problème 2: Erreur 400 Démarrage Session (validation manquante)

**Fichier à corriger**: `Backend 2.0/gaming-center-backend/routes/sessionRoutes.js`

### ✅ Validation à ajouter/décommenter :
```javascript
// Validation pour le démarrage de session
router.post('/demarrer', [
  body('posteId').isInt({ min: 1 }).withMessage('ID poste requis'),
  body('dureeMinutes').isInt({ min: 15, max: 720 }).withMessage('Durée invalide (15-720 min)'),
  body('clientId').optional().isInt({ min: 1 }),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('jeuPrincipal').optional().isString().isLength({ max: 100 }),
  body('planTarifaireId').optional().isInt({ min: 1 }),
  body('montantEstime').optional().isFloat({ min: 0 }),
  
  // ✅ VALIDATION POUR LES PARAMÈTRES DE PAIEMENT
  body('paiementAnticipe').optional().isBoolean(),
  body('modePaiement').optional().isIn(['ESPECES', 'CARTE', 'VIREMENT', 'CHEQUE']),
  body('montantPaye').optional().isFloat({ min: 0 }),
  body('marquerCommePayee').optional().isBoolean()
], SessionController.demarrerSession);
```

---

## Problème 3: Controller Session (si nécessaire)

**Fichier**: `Backend 2.0/gaming-center-backend/controllers/SessionController.js`

### ✅ S'assurer que le controller gère les nouveaux paramètres :
```javascript
async demarrerSession(req, res, next) {
  try {
    const {
      posteId,
      dureeMinutes,
      clientId,
      notes,
      jeuPrincipal,
      planTarifaireId,
      montantEstime,
      // ✅ Paramètres de paiement
      paiementAnticipe,
      modePaiement,
      montantPaye,
      marquerCommePayee
    } = req.body;

    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    // Appel au service avec les nouveaux paramètres
    const session = await SessionService.demarrerSession(
      posteId,
      req.user.id,
      {
        dureeMinutes,
        clientId,
        notes,
        jeuPrincipal,
        planTarifaireId,
        montantEstime,
        // ✅ Options de paiement
        paiementAnticipe,
        modePaiement,
        montantPaye,
        marquerCommePayee
      }
    );

    res.status(201).json({
      success: true,
      message: 'Session démarrée avec succès',
      data: session
    });
  } catch (error) {
    next(error);
  }
}
```

---

## Test des Corrections

### 1. Test Statistiques
```bash
# Dans le terminal du backend
curl -X GET "http://localhost:5000/api/transactions/statistiques/completes?dateDebut=2025-05-29&dateFin=2025-06-28&groupBy=day"
```

**Résultat attendu** : Données statistiques sans erreur SQL

### 2. Test Démarrage Session
```bash
# Dans le terminal du backend
curl -X POST "http://localhost:5000/api/sessions/demarrer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "posteId": 1,
    "dureeMinutes": 60,
    "clientId": null,
    "notes": "Test session",
    "jeuPrincipal": "Fortnite",
    "paiementAnticipe": true,
    "modePaiement": "ESPECES",
    "montantPaye": 15,
    "marquerCommePayee": false
  }'
```

**Résultat attendu** : Status 201 avec les données de la session créée

---

## Actions à effectuer

1. **Arrêter le serveur backend**
2. **Appliquer les corrections dans les fichiers mentionnés**
3. **Redémarrer le serveur backend**
4. **Tester depuis le frontend** :
   - Aller sur la page des statistiques
   - Essayer de démarrer une session avec paiement anticipé

---

## Verification Frontend

Le frontend est déjà correctement configuré :
- ✅ Envoi des paramètres de paiement dans `SessionStartForm.jsx`
- ✅ Affichage des statuts de paiement dans `SessionsHistoriqueTab.jsx`
- ✅ Service d'appel des statistiques dans `transactionService.js`

Aucune modification frontend n'est nécessaire.

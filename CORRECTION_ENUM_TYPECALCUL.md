# 🔧 CORRECTION CRITIQUE : Erreur Enum typeCalcul

## ❌ PROBLÈME IDENTIFIÉ

L'erreur PostgreSQL indique que la valeur `'TARIF_HORAIRE'` ou `'STANDARD'` n'est pas acceptée par l'enum `enum_sessions_typeCalcul`.

### Erreur exacte :
```
invalid input value for enum enum_sessions_typeCalcul: "TARIF_HORAIRE"
```

## 🔍 ANALYSE DU CODE

Dans `SessionService.js` ligne 976 :
```javascript
let typeCalculFinal = session.typeCalcul || 'STANDARD';
```

**PROBLÈME** : La valeur par défaut `'STANDARD'` n'existe pas dans l'enum PostgreSQL.

## ✅ SOLUTION

### 1. Correction dans SessionService.js

Remplacer la ligne 976 :
```javascript
// ❌ AVANT
let typeCalculFinal = session.typeCalcul || 'STANDARD';

// ✅ APRÈS
let typeCalculFinal = session.typeCalcul || 'PLAN_TARIFAIRE';
```

### 2. Vérification des valeurs enum autorisées

D'après le code analysé, les valeurs valides sont :
- `'PLAN_TARIFAIRE'` - Pour les sessions normales avec tarification
- `'ABONNEMENT'` - Pour les sessions payées avec abonnement

### 3. Code corrigé complet

```javascript
// ✅ 3. GESTION SPÉCIALE POUR LES SESSIONS AVEC ABONNEMENT
let montantTotalFinal = 0;
let typeCalculFinal = session.typeCalcul || 'PLAN_TARIFAIRE'; // ✅ CORRECTION ICI
let ajustementAbonnement = null;

if (session.abonnementId && session.abonnement) {
  // Session payée avec abonnement
  console.log(`🎫 [SESSION] Session avec abonnement ${session.abonnement.numeroAbonnement}`);
  
  const dureeEstimeeMinutes = session.dureeEstimeeMinutes;
  const heuresEstimees = dureeEstimeeMinutes / 60;
  const heuresReelles = dureeReelleMinutes / 60;
  
  // ... reste du code abonnement ...
  
  montantTotalFinal = 0; // Pas de facturation supplémentaire
  typeCalculFinal = 'ABONNEMENT'; // ✅ Valeur correcte pour abonnement
  
} else {
  // ✅ 4. SESSION NORMALE - RECALCULER LE COÛT BASÉ SUR LA DURÉE RÉELLE
  const coutCalcule = await this.calculerCoutSession(session.posteId, dureeReelleMinutes);
  montantTotalFinal = parseFloat(coutCalcule.montantTotal) || 0;
  typeCalculFinal = coutCalcule.typeCalcul; // ✅ Déjà correct : 'PLAN_TARIFAIRE'
}
```

## 🎯 VALIDATION

Après cette correction :
1. ✅ Les sessions normales utiliseront `'PLAN_TARIFAIRE'`
2. ✅ Les sessions avec abonnement utiliseront `'ABONNEMENT'`
3. ✅ Plus d'erreur enum lors de la terminaison des sessions

## 📝 ACTION REQUISE

Modifiez le fichier `SessionService.js` dans le backend :
- **Fichier** : `gaming-center-backend/services/SessionService.js`
- **Ligne** : 976
- **Changement** : `'STANDARD'` → `'PLAN_TARIFAIRE'`

Cette simple correction devrait résoudre complètement l'erreur enum qui bloque la terminaison des sessions.

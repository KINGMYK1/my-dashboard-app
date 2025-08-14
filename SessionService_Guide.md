# 🎮 Guide complet du SessionService - Gestion des Abonnements

## 📋 Vue d'ensemble

Le **SessionService** a été entièrement refondu pour supporter les **abonnements gaming** avec une gestion intelligente des heures prépayées. Ce service permet désormais de :

- ✅ **Gérer les sessions standard** (paiement à l'heure)
- ✅ **Gérer les sessions avec abonnements** (consommation d'heures prépayées)
- ✅ **Calculer automatiquement** le coût optimal (abonnement vs standard)
- ✅ **Restituer les heures** en cas d'arrêt anticipé
- ✅ **Suivre la consommation** des abonnements en temps réel

---

## 🚀 Nouvelles Fonctionnalités Clés

### 1. 💡 Calcul Intelligent du Coût

```javascript
// Exemple d'utilisation
const resultat = await SessionService.calculerCoutSession(sessionId, dureeMinutes);

console.log(resultat);
// Sortie pour session avec abonnement valide :
{
  montantTotal: 0.00,        // Gratuit car couvert par l'abonnement
  utiliseAbonnement: true,
  heuresConsommees: 2.5,
  tarifHoraire: 15.00,
  abonnementDetails: { ... }
}

// Sortie pour session standard :
{
  montantTotal: 37.50,       // 2.5h × 15€/h
  utiliseAbonnement: false,
  tarifHoraire: 15.00,
  dureeFacturee: 150
}
```

### 2. 🔍 Vérification des Abonnements

```javascript
// Vérifier si un client peut utiliser son abonnement
const verification = await SessionService.verifierAbonnementUtilisable(clientId, dureeMinutes);

if (verification.utilisable) {
  console.log(`✅ Abonnement valide - ${verification.heuresRestantes}h disponibles`);
} else {
  console.log(`❌ ${verification.raison}`);
}
```

### 3. ⚡ Démarrage Intelligent de Session

```javascript
// Le service choisit automatiquement la meilleure option
const session = await SessionService.demarrerSession({
  posteId: 1,
  clientId: 2,        // Si le client a un abonnement valide, il sera utilisé
  utilisateurId: 1,
  dureeEstimeeMinutes: 120
});

console.log(session);
// {
//   id: 123,
//   numeroSession: "SESS-20250119-0001",
//   utiliseAbonnement: true,
//   heuresConsommees: 2.0,
//   abonnementDetails: { ... }
// }
```

### 4. 🔄 Arrêt avec Restitution d'Heures

```javascript
// Arrêt anticipé = restitution automatique des heures non utilisées
const resultat = await SessionService.terminerSession(sessionId, {
  utilisateurId: 1,
  forceArret: false
});

console.log(resultat);
// {
//   dureeReelleMinutes: 90,     // Session prévue 120min, arrêtée à 90min
//   coutFinal: 0.00,            // Toujours gratuit avec abonnement
//   heuresRestituees: 0.5,      // 30min restituées à l'abonnement
//   economiesRealisees: 7.50    // Économies par rapport au tarif standard
// }
```

---

## 📊 Nouvelles Méthodes de Statistiques

### 1. Sessions en Cours avec Détails Abonnements

```javascript
const sessions = await SessionService.getSessionsEnCoursAvecAbonnements();

sessions.forEach(session => {
  console.log(`Session ${session.numeroSession}:`);
  console.log(`- Temps écoulé: ${session.tempsEcouleMinutes} min`);
  console.log(`- Coût actuel: ${session.coutActuel}€`);
  console.log(`- Utilise abonnement: ${session.utiliseAbonnement}`);
  
  if (session.infoAbonnement) {
    console.log(`- Abonnement: ${session.infoAbonnement.numero}`);
    console.log(`- Heures restantes: ${session.infoAbonnement.heuresRestantes}h`);
  }
});
```

### 2. Statistiques d'Utilisation des Abonnements

```javascript
const stats = await SessionService.getStatistiquesAbonnements({
  dateDebut: new Date('2025-01-01'),
  dateFin: new Date('2025-01-31')
});

console.log(`📈 Statistiques d'abonnements pour janvier 2025:`);
console.log(`- Sessions avec abonnement: ${stats.nombreSessionsAbonnement}`);
console.log(`- Heures consommées total: ${stats.heuresConsommeesTotal}h`);
console.log(`- Abonnements uniques utilisés: ${stats.abonnementsUniques}`);

// Répartition par type d'abonnement
Object.entries(stats.repartitionParType).forEach(([type, data]) => {
  console.log(`📋 ${type}:`);
  console.log(`  - ${data.nombreSessions} sessions`);
  console.log(`  - ${data.heuresConsommees}h consommées`);
  console.log(`  - ${data.abonnementsActifs} abonnements actifs`);
});
```

### 3. Vérification de Cohérence

```javascript
const verification = await SessionService.verifierCoherenceAbonnements();

if (!verification.coherent) {
  console.log('🚨 Problèmes détectés:');
  verification.problemes.forEach(probleme => {
    console.log(`- ${probleme.type}: ${probleme.count} cas`);
  });
} else {
  console.log('✅ Toutes les données sont cohérentes');
}
```

---

## 🔄 Opérations en Lot

### 1. Arrêt Multiple de Sessions

```javascript
// Utile pour la fermeture du centre
const resultats = await SessionService.arreterSessionsEnLot(
  [1, 2, 3, 4], // IDs des sessions
  {
    forceArret: true,
    utilisateurId: 1,
    motifArret: 'Fermeture du centre'
  }
);

console.log(`✅ ${resultats.succes.length} sessions arrêtées`);
console.log(`❌ ${resultats.echecs.length} échecs`);
console.log(`💰 Total restitué: ${resultats.statistiques.heuresRestituees}h`);
```

### 2. Maintenance des Sessions Expirées

```javascript
// Simulation d'abord (dryRun)
const simulation = await SessionService.maintenanceSessionsExpirees({
  seuilExpirationMinutes: 60,
  dryRun: true
});

console.log(`🔍 ${simulation.sessionsDetectees} sessions expirées détectées`);

// Puis exécution réelle
const maintenance = await SessionService.maintenanceSessionsExpirees({
  seuilExpirationMinutes: 60,
  dryRun: false,
  utilisateurId: 1
});

console.log(`🔧 ${maintenance.sessionsTraitees} sessions nettoyées`);
```

### 3. Synchronisation des Statuts de Postes

```javascript
const sync = await SessionService.synchroniserStatutsPostes();

console.log(`🔄 ${sync.postesVerifies} postes vérifiés`);
console.log(`✏️ ${sync.correctionsEffectuees} corrections effectuées`);

sync.corrections.forEach(correction => {
  console.log(`Poste ${correction.posteNom}: ${correction.ancienStatut} → ${correction.nouveauStatut}`);
});
```

---

## 🎯 Scénarios d'Usage Courants

### Scénario 1: Client avec Abonnement Valide

```javascript
// 1. Vérification avant démarrage
const verification = await SessionService.verifierAbonnementUtilisable(clientId, 120);
if (!verification.utilisable) {
  return { error: verification.raison };
}

// 2. Démarrage automatique (abonnement détecté)
const session = await SessionService.demarrerSession({
  posteId: 5,
  clientId: clientId,
  utilisateurId: 1,
  dureeEstimeeMinutes: 120
});

// 3. Arrêt après 90 minutes (30min restituées)
const resultat = await SessionService.terminerSession(session.id, {
  utilisateurId: 1
});

console.log(`Session gratuite - ${resultat.heuresRestituees}h restituées`);
```

### Scénario 2: Client sans Abonnement

```javascript
// Démarrage session standard
const session = await SessionService.demarrerSession({
  posteId: 3,
  clientId: clientId,
  utilisateurId: 1,
  dureeEstimeeMinutes: 90
});

// Calcul du coût en cours de session
const cout = await SessionService.calculerCoutSession(session.id, 90);
console.log(`Coût actuel: ${cout.montantTotal}€`);

// Arrêt avec paiement
const resultat = await SessionService.terminerSession(session.id, {
  utilisateurId: 1,
  montantPaye: cout.montantTotal
});
```

### Scénario 3: Gestion Mixte

```javascript
// Session longue : commencer avec abonnement, finir en payant
const session = await SessionService.demarrerSession({
  posteId: 2,
  clientId: clientId,        // Abonnement avec 1h restante
  dureeEstimeeMinutes: 180   // Session de 3h prévue
});

// Après 3h : 1h gratuite + 2h payantes
const resultat = await SessionService.terminerSession(session.id, {
  utilisateurId: 1,
  montantPaye: 30.00  // 2h × 15€/h
});

console.log(`Économies abonnement: ${resultat.economiesRealisees}€`);
```

---

## ⚠️ Points d'Attention

### 1. Gestion des Transactions
- Toutes les opérations critiques utilisent des **transactions DB**
- En cas d'erreur, **rollback automatique** des modifications
- **Audit automatique** de toutes les actions importantes

### 2. Validation des Abonnements
- Vérification automatique de la **date d'expiration**
- Contrôle du **statut** (ACTIF/SUSPENDU/EXPIRE)
- Validation des **heures disponibles**

### 3. Calculs de Restitution
- Restitution uniquement si **session arrêtée avant estimation**
- Calcul au **prorata des minutes utilisées**
- **Minimum de facturation** : 15 minutes

### 4. Performance
- **Mise en cache** des calculs de tarifs
- **Requêtes optimisées** avec les bonnes relations
- **Logs détaillés** pour le debugging

---

## 🔧 Configuration

### Variables d'Environnement

```env
# Durée minimum de facturation (en minutes)
MIN_BILLING_DURATION=15

# Seuil d'alerte pour sessions longues (en minutes)
LONG_SESSION_THRESHOLD=480

# Activation des logs détaillés
SESSION_DEBUG_LOGS=true
```

### Constantes du Service

```javascript
const SESSION_STATES = {
  EN_COURS: 'EN_COURS',
  EN_PAUSE: 'EN_PAUSE',
  TERMINEE: 'TERMINEE',
  ANNULEE: 'ANNULEE'
};

const ABONNEMENT_STATES = {
  ACTIF: 'ACTIF',
  SUSPENDU: 'SUSPENDU',
  EXPIRE: 'EXPIRE'
};
```

---

## 📞 Support et Debugging

### Logs à Surveiller

```bash
# Sessions avec abonnements
grep "ABONNEMENT" logs/session.log

# Calculs de restitution
grep "RESTITUTION" logs/session.log

# Erreurs de cohérence
grep "COHERENCE" logs/session.log
```

### Métriques Importantes

- **Taux d'utilisation des abonnements** vs sessions standard
- **Heures restituées** par rapport aux heures consommées
- **Économies générées** par les abonnements
- **Sessions expirées** nécessitant une maintenance

---

Ce SessionService amélioré offre une **gestion complète et intelligente** des sessions gaming avec abonnements, optimisant l'expérience client tout en maximisant l'efficacité opérationnelle du centre de gaming ! 🎮✨

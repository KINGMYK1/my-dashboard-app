# 🧪 Guide de Test - Sessions avec Abonnements

## 🎯 Tests pratiques des nouvelles fonctionnalités

### 📝 **Prérequis pour les tests**

1. **Données de test nécessaires :**
   - Un client avec abonnement actif
   - Un poste disponible
   - Un utilisateur connecté avec permissions

2. **Outils recommandés :**
   - Postman ou Insomnia
   - Console navigateur
   - Logs backend

---

## 🔬 **Tests API - Étape par étape**

### **Test 1 : Vérification d'abonnement**

```bash
GET /api/sessions/abonnement/1/verification?dureeMinutes=60
Authorization: Bearer [token]
```

**Réponse attendue :**
```json
{
  "disponible": true,
  "heuresRestantes": 15.5,
  "heuresRequises": 1.0,
  "heuresApresUtilisation": 14.5,
  "typeAbonnement": "Premium",
  "dateExpiration": "2025-02-15T23:59:59.000Z"
}
```

### **Test 2 : Calcul de prix avec abonnement**

```bash
POST /api/sessions/calculer-prix
Content-Type: application/json
Authorization: Bearer [token]

{
  "posteId": 1,
  "dureeMinutes": 90,
  "abonnementId": 1
}
```

**Réponse attendue :**
```json
{
  "utiliseAbonnement": true,
  "coutOriginal": 15.00,
  "coutAvecAbonnement": 0.00,
  "economie": 15.00,
  "heuresConsommees": 1.5,
  "heuresRestantesApres": 14.0,
  "details": {
    "tarifHoraire": 10.00,
    "dureeHeures": 1.5
  }
}
```

### **Test 3 : Démarrage de session avec abonnement**

```bash
POST /api/sessions/demarrer
Content-Type: application/json
Authorization: Bearer [token]

{
  "posteId": 1,
  "dureeMinutes": 60,
  "clientId": 5,
  "abonnementId": 1
}
```

**Réponse attendue :**
```json
{
  "id": 123,
  "numeroSession": "SES-20250118-001",
  "dateHeureDebut": "2025-01-18T14:30:00.000Z",
  "dureeMinutes": 60,
  "statut": "active",
  "utiliseAbonnement": true,
  "abonnementId": 1,
  "heuresConsommees": 1.0,
  "cout": 0.00,
  "poste": {
    "id": 1,
    "nom": "PC-Gaming-01"
  },
  "client": {
    "id": 5,
    "prenom": "Ahmed",
    "nom": "Ben Ali"
  }
}
```

### **Test 4 : Liste des sessions avec abonnements**

```bash
GET /api/sessions/avec-abonnements?dateDebut=2025-01-01&dateFin=2025-01-31
Authorization: Bearer [token]
```

### **Test 5 : Statistiques des abonnements**

```bash
GET /api/sessions/statistiques/abonnements?dateDebut=2025-01-01&dateFin=2025-01-31
Authorization: Bearer [token]
```

---

## 🧪 **Tests d'erreurs et cas limites**

### **Test 6 : Abonnement expiré**

```bash
POST /api/sessions/demarrer
{
  "posteId": 1,
  "dureeMinutes": 60,
  "clientId": 5,
  "abonnementId": 999  // Abonnement expiré
}
```

**Réponse attendue :**
```json
{
  "error": "Abonnement expiré",
  "details": {
    "abonnementId": 999,
    "dateExpiration": "2024-12-31T23:59:59.000Z"
  }
}
```

### **Test 7 : Heures insuffisantes**

```bash
POST /api/sessions/demarrer
{
  "posteId": 1,
  "dureeMinutes": 300,  // 5 heures
  "clientId": 5,
  "abonnementId": 1     // Abonnement avec seulement 2 heures restantes
}
```

**Réponse attendue :**
```json
{
  "error": "Heures insuffisantes dans l'abonnement",
  "details": {
    "heuresRequises": 5.0,
    "heuresDisponibles": 2.0,
    "abonnementId": 1
  }
}
```

### **Test 8 : Abonnement d'un autre client**

```bash
POST /api/sessions/demarrer
{
  "posteId": 1,
  "dureeMinutes": 60,
  "clientId": 5,        // Client A
  "abonnementId": 2     // Abonnement du client B
}
```

**Réponse attendue :**
```json
{
  "error": "Abonnement non associé à ce client",
  "details": {
    "clientId": 5,
    "abonnementClientId": 8,
    "abonnementId": 2
  }
}
```

---

## 🔍 **Tests de compatibilité (IMPORTANT)**

### **Test 9 : Session normale (sans abonnement)**

```bash
POST /api/sessions/demarrer
{
  "posteId": 1,
  "dureeMinutes": 60,
  "clientId": 5
  // PAS d'abonnementId
}
```

**✅ DOIT fonctionner exactement comme avant**

### **Test 10 : API existantes**

```bash
# Toutes ces routes DOIVENT continuer à fonctionner :
GET /api/sessions/active
PATCH /api/sessions/123/pause
PATCH /api/sessions/123/reprendre
PATCH /api/sessions/123/terminer
GET /api/sessions/123
```

---

## 📊 **Tests de performance**

### **Test 11 : Session simultanées avec abonnements**

Créer 10 sessions simultanées avec différents abonnements pour tester :
- La cohérence des déductions d'heures
- L'absence de conditions de course (race conditions)
- Les performances des requêtes

---

## 🎮 **Tests Frontend (si disponible)**

### **Test 12 : Interface utilisateur**

1. **Sélection d'abonnement :**
   - Afficher les abonnements disponibles pour un client
   - Calculer le prix en temps réel
   - Valider avant création

2. **Gestion des erreurs :**
   - Message d'erreur clair pour abonnement expiré
   - Proposition d'alternatives (session normale, renouvellement)

3. **Affichage des sessions :**
   - Indicateur visuel pour sessions avec abonnement
   - Détails de l'abonnement utilisé

---

## 🔧 **Scripts de test automatisés**

### **Script Postman/Newman**

```json
{
  "info": {
    "name": "Tests Sessions Abonnements",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Vérifier abonnement",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/sessions/abonnement/1/verification?dureeMinutes=60"
      },
      "test": [
        "pm.test('Status code is 200', function () {",
        "    pm.response.to.have.status(200);",
        "});",
        "pm.test('Response has disponible field', function () {",
        "    pm.expect(pm.response.json()).to.have.property('disponible');",
        "});"
      ]
    }
  ]
}
```

### **Script de test Node.js**

```javascript
// test-sessions-abonnements.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'votre-jwt-token';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testSessionAvecAbonnement() {
  try {
    console.log('🧪 Test : Session avec abonnement');
    
    // 1. Vérifier abonnement
    const verification = await api.get('/sessions/abonnement/1/verification?dureeMinutes=60');
    console.log('✅ Vérification :', verification.data);
    
    if (!verification.data.disponible) {
      throw new Error('Abonnement non disponible');
    }
    
    // 2. Calculer prix
    const calcul = await api.post('/sessions/calculer-prix', {
      posteId: 1,
      dureeMinutes: 60,
      abonnementId: 1
    });
    console.log('✅ Calcul prix :', calcul.data);
    
    // 3. Créer session
    const session = await api.post('/sessions/demarrer', {
      posteId: 1,
      dureeMinutes: 60,
      clientId: 5,
      abonnementId: 1
    });
    console.log('✅ Session créée :', session.data);
    
    // 4. Terminer session
    await api.patch(`/sessions/${session.data.id}/terminer`);
    console.log('✅ Session terminée');
    
  } catch (error) {
    console.error('❌ Erreur :', error.response?.data || error.message);
  }
}

// Exécuter le test
testSessionAvecAbonnement();
```

---

## 📋 **Checklist de validation**

### ✅ **Tests de fonctionnalité**

- [ ] Vérification d'abonnement fonctionne
- [ ] Calcul de prix avec abonnement correct
- [ ] Création de session avec abonnement réussie
- [ ] Heures déduites correctement de l'abonnement
- [ ] Statistiques des abonnements disponibles

### ✅ **Tests d'erreur**

- [ ] Abonnement expiré géré correctement
- [ ] Heures insuffisantes gérées correctement
- [ ] Abonnement d'un autre client rejeté
- [ ] Messages d'erreur clairs et informatifs

### ✅ **Tests de compatibilité**

- [ ] Sessions normales fonctionnent comme avant
- [ ] API existantes non modifiées
- [ ] Pas de régression sur fonctionnalités existantes

### ✅ **Tests de performance**

- [ ] Temps de réponse acceptable (< 500ms)
- [ ] Sessions simultanées gérées correctement
- [ ] Pas de fuites mémoire

---

## 🎯 **Critères de succès**

1. **Fonctionnel :** Toutes les nouvelles API fonctionnent
2. **Compatible :** Aucune régression sur l'existant
3. **Performant :** Temps de réponse acceptable
4. **Robuste :** Gestion d'erreurs complète
5. **Documenté :** Tous les cas d'usage couverts

---

## 📞 **Support et débogage**

### **Logs à surveiller :**

```bash
# Backend logs
tail -f logs/application.log | grep "SESSION"

# Rechercher les erreurs spécifiques
grep "ABONNEMENT" logs/application.log
grep "ERROR.*session" logs/application.log
```

### **Points de contrôle en base :**

```sql
-- Vérifier les sessions avec abonnements
SELECT s.id, s.numeroSession, s.utiliseAbonnement, s.abonnementId, s.heuresConsommees
FROM sessions s 
WHERE s.utiliseAbonnement = true
ORDER BY s.dateHeureDebut DESC;

-- Vérifier l'état des abonnements
SELECT a.id, a.heuresRestantes, a.dateExpiration, ta.nom
FROM abonnements a
JOIN type_abonnements ta ON a.typeAbonnementId = ta.id
WHERE a.actif = true;
```

# 🎮 Plan d'Aménagement Gaming Center

## 📍 Layout du Gaming Center

```
    ÉCRAN PRINCIPAL / RÉCEPTION
    ═══════════════════════════
    
RANGÉE A: [A1] [A2] [A3] | [A4] [A5] [A6] [A7]
         🏎️ VOLANTS    |    🎮 PS4

RANGÉE B: [B1] | [B2] [B3] [B4] [B5]
         🎮 PS4 |    🚀 PS5

RANGÉE C: [C1] [C2] [C3] [C4]
         ⌨️ PC GAMING (PS4 + Clavier/Souris)
```

## 🏁 Détail des Rangées

### **RANGÉE A** (7 postes)

#### 🏎️ **Zone Volants** (Positions A1-A3)
- **A1** - Volant Premium Logitech G29 + Playseat Challenge
- **A2** - Volant Pro Thrustmaster T300RS + Playseat Evolution  
- **A3** - Volant Elite Fanatec CSL + Playseat F1 (32" Curved)

#### 🎮 **Zone PS4 Classique** (Positions A4-A7)
- **A4** - PS4 Pro + Jeux Sport/Action
- **A5** - PS4 Slim + Jeux Battle Royale
- **A6** - PS4 Pro + Jeux Combat
- **A7** - PS4 Slim + Jeux Casual/Family

### **RANGÉE B** (5 postes)

#### 🎮 **Transition PS4** (Position B1)
- **B1** - PS4 Pro Premium + Exclusivités Sony (27" 4K)

#### 🚀 **Zone PS5 Nouvelle Génération** (Positions B2-B5)
- **B2** - PS5 Standard + Jeux Sport/Action
- **B3** - PS5 Standard + Exclusivités PS5
- **B4** - PS5 Digital + Jeux Open World
- **B5** - PS5 Premium + Setup Ultra (32" 4K 144Hz)

### **RANGÉE C** (4 postes)

#### ⌨️ **Zone PC Gaming** (Positions C1-C4)
- **C1** - PS4 + Razer Setup + Jeux Competitifs
- **C2** - PS4 + Corsair Setup + FPS
- **C3** - PS4 + Logitech Setup + Sports  
- **C4** - PS4 Premium + Setup Elite + AAA Games

## 📊 Statistiques de l'Aménagement

| Type de Poste | Quantité | Pourcentage | Tarif/h |
|---------------|----------|-------------|---------|
| **Volants** | 3 | 20% | 20 DH |
| **PS4** | 9 | 60% | 15 DH |
| **PS5** | 4 | 27% | 20 DH |
| **PC Gaming** | 4 | 27% | 15 DH |
| **TOTAL** | **15** | **100%** | - |

## 🎯 Stratégie d'Aménagement

### **Zone Premium** (Rangée A - Volants)
- **Cible**: Passionnés de course automobile
- **Spécialité**: Simulation de conduite réaliste
- **Équipement**: Volants force feedback, sièges racing
- **Jeux**: F1 2024, Gran Turismo, Assetto Corsa

### **Zone Familiale** (Rangée A - PS4)
- **Cible**: Joueurs occasionnels, familles
- **Spécialité**: Jeux multijoueurs locaux
- **Équipement**: Manettes multiples, jeux accessibles
- **Jeux**: FIFA, Minecraft, Fall Guys

### **Zone Next-Gen** (Rangée B - PS5)
- **Cible**: Gamers exigeants, early adopters
- **Spécialité**: Dernières technologies gaming
- **Équipement**: Écrans 4K 120Hz, SSD haute vitesse
- **Jeux**: Exclusivités PS5, jeux optimisés

### **Zone Esport** (Rangée C - PC Gaming)
- **Cible**: Joueurs compétitifs, streamers
- **Spécialité**: Jeux compétitifs PC
- **Équipement**: Clavier/souris gaming, écrans 144Hz
- **Jeux**: Valorant, CS2, Overwatch

## 🔧 Spécifications Techniques

### **Équipements Volants**
```
A1: Logitech G29 + Playseat Challenge + 27" 144Hz
A2: Thrustmaster T300RS + Playseat Evolution + 27" 144Hz  
A3: Fanatec CSL Elite + Playseat F1 + 32" Curved 165Hz
```

### **Consoles & Écrans**
```
PS4 Standard: 24" Full HD
PS4 Premium: 27" 4K
PS5 Standard: 27" 4K 120Hz
PS5 Premium: 32" 4K 144Hz
PC Gaming: 24-27" Gaming 120-165Hz
```

### **Audio**
```
- Sony Pulse 3D (PS5)
- HyperX Cloud Series
- Razer Kraken Pro
- SteelSeries Arctis
```

## 📈 Optimisation des Revenus

### **Tarification Différenciée**
- **Volants**: 20 DH/h (Premium)
- **PS5**: 20 DH/h (Next-Gen) 
- **PS4**: 15 DH/h (Standard)

### **Plans Tarifaires Intelligents**
- **30min**: Tarif découverte
- **1h**: Tarif standard (mis en avant)
- **2h+**: Tarifs dégressifs

### **Rotation Optimale**
```
Durée moyenne cible: 1h30
Rotation journalière: 8-10 sessions/poste
Occupation cible: 70-80%
```

## 🎮 Catalogues de Jeux par Zone

### **Volants (A1-A3)**
- F1 2024, Gran Turismo 7, Forza Horizon
- Assetto Corsa, Dirt Rally, iRacing

### **PS4 Familial (A4-A7)**
- FIFA 24, Minecraft, Fall Guys
- GTA V, Rocket League, Among Us

### **PS4 Premium (B1)**
- The Last of Us 2, God of War
- Horizon Zero Dawn, Spider-Man

### **PS5 Next-Gen (B2-B5)**
- Spider-Man 2, Demon's Souls
- Ratchet & Clank, Returnal, GT7

### **PC Gaming (C1-C4)**
- Valorant, CS2, Overwatch
- Rocket League, Apex Legends

## 🔧 Scripts de Déploiement

### **Ordre d'Exécution**
```bash
# 1. Créer les types de postes et plans tarifaires
node scripts/createPlansTarifairesSimple.js

# 2. Créer tous les postes
node scripts/createPostesSimple.js

# 3. Tester les associations (optionnel)
node scripts/testPostesAssociations.js
```

### **Validation**
```bash
# Vérifier les postes créés
node scripts/validatePostes.js
```

---

**Date de création**: ${new Date().toLocaleDateString('fr-FR')}
**Version**: 1.0
**Total postes**: 15

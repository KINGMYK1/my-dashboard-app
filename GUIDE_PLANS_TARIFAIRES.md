# 🎯 Guide d'Utilisation des Scripts de Plans Tarifaires

## 📋 Vue d'ensemble

Ce guide explique comment utiliser les scripts pour créer et gérer les plans tarifaires selon votre logique de tarification.

## 🎮 Logique de Tarification Implémentée

### PS4 (Tarif horaire base : 15 DH/heure)
- **30 minutes** = 10 DH (durée flexible : 20-45 min)
- **1 heure** = 15 DH (durée flexible : 50-70 min) ⭐ *Recommandé*
- **1h30** = 20 DH (durée flexible : 80-100 min)
- **2 heures** = 25 DH (durée flexible : 110-130 min)
- **2h30** = 30 DH (durée flexible : 140-160 min)
- **3 heures** = 35 DH (durée flexible : 170-190 min)
- **3h30** = 40 DH (durée flexible : 200-220 min)
- **4 heures** = 45 DH (durée flexible : 230-250 min)

### PS5 & Volant (Tarif horaire base : 20 DH/heure)
- **30 minutes** = 10 DH (durée flexible : 20-45 min)
- **1 heure** = 20 DH (durée flexible : 50-70 min) ⭐ *Recommandé*
- **1h30** = 25 DH (durée flexible : 80-100 min)
- **2 heures** = 30 DH (durée flexible : 110-130 min)
- **2h30** = 40 DH (durée flexible : 140-160 min)
- **3 heures** = 50 DH (durée flexible : 170-190 min)
- **3h30** = 60 DH (durée flexible : 200-220 min) *(PS5 seulement)*
- **4 heures** = 70 DH (durée flexible : 230-250 min) *(PS5 seulement)*

## 🛠️ Utilisation des Scripts

### Script Simple (Automatique)

```bash
# Dans le dossier backend de votre projet
node scripts/createPlansTarifaires.js
```

Ce script :
- ✅ Crée automatiquement tous les types de postes (PS4, PS5, Volant)
- ✅ Génère tous les plans tarifaires selon votre logique
- ✅ Calcule automatiquement les tarifs horaires équivalents
- ✅ Supprime les anciens plans avant de créer les nouveaux

### Script Interactif (Choix personnalisés)

```bash
# Dans le dossier backend de votre projet
node scripts/planTarifairesInteractive.js
```

Ce script offre un menu interactif pour :
- 📋 Voir les plans tarifaires actuels
- 🎯 Choisir quels types de postes traiter
- 🔄 Mettre à jour sélectivement les plans

## 📁 Structure des Fichiers

```
scripts/
├── createPlansTarifaires.js          # Script principal simple
├── planTarifairesInteractive.js      # Script interactif avec menu
└── init/
    └── createPlansTarifaires.js      # Logique de création des plans
```

## 🔧 Configuration Requise

### Variables d'Environnement

Assurez-vous que votre fichier `.env` contient :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gaming_center
DB_USER=your_username
DB_PASSWORD=your_password

# Autres variables selon votre configuration...
```

### Modèles Sequelize Requis

Les scripts utilisent les modèles :
- `TypePoste` : Types de postes de jeu
- `PlanTarifaire` : Plans tarifaires associés

## 📊 Résultat Attendu

Après exécution, vous devriez avoir :

### PS4
- 8 plans tarifaires (30 min à 4h)
- Tarif horaire base : 15 DH/h
- Plan recommandé : 1 heure

### PS5
- 8 plans tarifaires (30 min à 4h)
- Tarif horaire base : 20 DH/h
- Plan recommandé : 1 heure

### Volant
- 6 plans tarifaires (30 min à 3h)
- Tarif horaire base : 20 DH/h
- Plan recommandé : 30 minutes

## 🚨 Points d'Attention

1. **Durées Flexibles** : Chaque plan a une durée min/max pour permettre une facturation flexible
2. **Tarifs Spéciaux** : Les prix 1h30 et 2h pour PS5/Volant suivent votre logique personnalisée
3. **Suppression** : Les anciens plans sont supprimés avant création des nouveaux
4. **Calculs Automatiques** : Les tarifs horaires équivalents sont calculés automatiquement

## 🔄 Mise à Jour

Pour mettre à jour les plans :

1. Modifiez les configurations dans `scripts/init/createPlansTarifaires.js`
2. Relancez le script
3. Les anciens plans seront automatiquement remplacés

## 🆘 Dépannage

### Erreur de Connexion DB
```bash
# Vérifiez vos variables d'environnement
cat .env | grep DB_

# Testez la connexion à la base
psql -h localhost -U your_username -d gaming_center
```

### Modèles Non Trouvés
```bash
# Vérifiez que vos modèles Sequelize sont bien configurés
ls models/
# Doit contenir TypePoste.js et PlanTarifaire.js
```

### Erreur de Permissions
```bash
# Assurez-vous que l'utilisateur DB a les droits
GRANT ALL PRIVILEGES ON DATABASE gaming_center TO your_username;
```

## 📈 Évolutions Futures

Le script est conçu pour être facilement extensible :
- ➕ Ajout de nouveaux types de postes
- 🎯 Plans promotionnels (Happy Hours)
- 👥 Plans de groupe
- 📅 Validité temporaire des plans

## 🎉 Utilisation dans l'Application

Une fois les plans créés, ils seront automatiquement disponibles dans :
- 🎮 Interface de création de sessions
- 💰 Calculs de prix en temps réel
- 📊 Statistiques de rentabilité
- 🎫 Système d'abonnements

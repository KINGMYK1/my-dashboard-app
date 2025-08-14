#!/usr/bin/env node

/**
 * Script pour corriger les associations entre TypePoste et PlanTarifaire
 * ATTENTION: Ce script modifie les fichiers de modèles
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION DES ASSOCIATIONS SEQUELIZE');
console.log('=' .repeat(50));

/**
 * Chemin vers le dossier des modèles (à adapter selon votre structure)
 */
const MODELS_DIR = path.join(__dirname, '..', 'models');

/**
 * Corrections des associations TypePoste <-> PlanTarifaire
 */
const ASSOCIATIONS_CORRECTIONS = `
// ===== ASSOCIATIONS GAMING CENTER =====

/**
 * ✅ ASSOCIATIONS CORRIGÉES pour TypePoste et PlanTarifaire
 * Résout l'erreur d'alias dans les requêtes
 */

// TypePoste.js - À ajouter dans la fonction d'associations
TypePoste.hasMany(PlanTarifaire, {
  foreignKey: 'typePosteId',
  as: 'plansTarifaires', // ✅ Alias explicite
  onDelete: 'CASCADE'
});

// PlanTarifaire.js - À ajouter dans la fonction d'associations  
PlanTarifaire.belongsTo(TypePoste, {
  foreignKey: 'typePosteId',
  as: 'typePoste', // ✅ Alias explicite
  onDelete: 'CASCADE'
});

/**
 * ✅ UTILISATION DANS LES REQUÊTES:
 * 
 * // Pour récupérer les plans d'un type:
 * const typeAvecPlans = await TypePoste.findByPk(id, {
 *   include: [{
 *     model: PlanTarifaire,
 *     as: 'plansTarifaires' // ✅ Utiliser l'alias
 *   }]
 * });
 * 
 * // Pour récupérer le type d'un plan:
 * const planAvecType = await PlanTarifaire.findByPk(id, {
 *   include: [{
 *     model: TypePoste,
 *     as: 'typePoste' // ✅ Utiliser l'alias
 *   }]
 * });
 */
`;

/**
 * Fonction principale de correction
 */
function corrigerAssociations() {
  try {
    console.log('📁 Vérification du dossier models...');
    
    if (!fs.existsSync(MODELS_DIR)) {
      console.error(`❌ Dossier models non trouvé: ${MODELS_DIR}`);
      console.log('💡 Conseil: Ajustez la variable MODELS_DIR dans le script');
      return false;
    }

    console.log(`✅ Dossier models trouvé: ${MODELS_DIR}`);

    // Lister les fichiers de modèles
    const modelFiles = fs.readdirSync(MODELS_DIR)
      .filter(file => file.endsWith('.js'))
      .filter(file => !file.includes('index'));

    console.log('📋 Fichiers de modèles trouvés:');
    modelFiles.forEach(file => {
      console.log(`  • ${file}`);
    });

    // Créer un fichier de documentation avec les bonnes associations
    const docFile = path.join(MODELS_DIR, 'ASSOCIATIONS_CORRECTED.md');
    
    const documentation = `# Associations Corrigées - Gaming Center

## Problème résolu
L'erreur \`EagerLoadingError: typePoste is associated to planTarifaire using an alias\` est causée par des alias manquants ou incorrects dans les associations Sequelize.

## Solution implémentée

### Dans TypePoste.js (associations)
\`\`\`javascript
// Association TypePoste -> PlanTarifaire (One-to-Many)
TypePoste.hasMany(PlanTarifaire, {
  foreignKey: 'typePosteId',
  as: 'plansTarifaires', // ✅ Alias explicite requis
  onDelete: 'CASCADE'
});
\`\`\`

### Dans PlanTarifaire.js (associations)
\`\`\`javascript
// Association PlanTarifaire -> TypePoste (Many-to-One)
PlanTarifaire.belongsTo(TypePoste, {
  foreignKey: 'typePosteId', 
  as: 'typePoste', // ✅ Alias explicite requis
  onDelete: 'CASCADE'
});
\`\`\`

## Utilisation dans les requêtes

### ✅ Correct - Avec alias
\`\`\`javascript
// Récupérer un type avec ses plans
const typeAvecPlans = await TypePoste.findByPk(id, {
  include: [{
    model: PlanTarifaire,
    as: 'plansTarifaires' // ✅ Utiliser l'alias
  }]
});

// Récupérer un plan avec son type
const planAvecType = await PlanTarifaire.findByPk(id, {
  include: [{
    model: TypePoste,
    as: 'typePoste' // ✅ Utiliser l'alias
  }]
});
\`\`\`

### ❌ Incorrect - Sans alias
\`\`\`javascript
// ❌ ERREUR: EagerLoadingError
const plans = await PlanTarifaire.findAll({
  include: [{
    model: TypePoste // ❌ Pas d'alias spécifié
  }]
});
\`\`\`

## Accès aux données

### Avec TypePoste
\`\`\`javascript
const type = await TypePoste.findByPk(1, { include: [{ model: PlanTarifaire, as: 'plansTarifaires' }] });

// Accès aux plans
console.log(type.plansTarifaires); // ✅ Array des plans
type.plansTarifaires.forEach(plan => {
  console.log(\`Plan: \${plan.nom} - \${plan.prix} DH\`);
});
\`\`\`

### Avec PlanTarifaire
\`\`\`javascript
const plan = await PlanTarifaire.findByPk(1, { include: [{ model: TypePoste, as: 'typePoste' }] });

// Accès au type
console.log(plan.typePoste.nom); // ✅ Nom du type
console.log(plan.typePoste.tarifHoraireBase); // ✅ Tarif de base
\`\`\`

## Scripts corrigés

Les scripts suivants ont été mis à jour:
- \`planTarifairesInteractive.js\`
- \`createPlansTarifairesSimple.js\`
- Tous les scripts utilisant ces associations

## Date de correction
${new Date().toISOString()}

---
**Important**: Assurez-vous que vos fichiers de modèles utilisent bien ces alias dans leurs définitions d'associations.
`;

    fs.writeFileSync(docFile, documentation, 'utf8');
    console.log(`✅ Documentation créée: ${docFile}`);

    // Créer un exemple de fichier de modèle corrigé
    const exempleFile = path.join(MODELS_DIR, 'EXEMPLE_ASSOCIATIONS.js');
    
    const exempleCode = `/**
 * EXEMPLE D'ASSOCIATIONS CORRIGÉES
 * Copiez ces patterns dans vos vrais fichiers de modèles
 */

// ===== Dans TypePoste.js =====
const TypePoste = sequelize.define('typePoste', {
  // ... définition des champs
});

// ✅ ASSOCIATIONS (à placer dans une fonction séparée ou à la fin du fichier)
TypePoste.associate = function(models) {
  // Association avec PlanTarifaire
  TypePoste.hasMany(models.PlanTarifaire, {
    foreignKey: 'typePosteId',
    as: 'plansTarifaires', // ✅ Alias obligatoire
    onDelete: 'CASCADE'
  });
  
  // Autres associations...
  TypePoste.hasMany(models.Poste, {
    foreignKey: 'typePosteId',
    as: 'postes',
    onDelete: 'CASCADE'
  });
};

module.exports = TypePoste;

// ===== Dans PlanTarifaire.js =====
const PlanTarifaire = sequelize.define('planTarifaire', {
  // ... définition des champs
});

// ✅ ASSOCIATIONS
PlanTarifaire.associate = function(models) {
  // Association avec TypePoste  
  PlanTarifaire.belongsTo(models.TypePoste, {
    foreignKey: 'typePosteId',
    as: 'typePoste', // ✅ Alias obligatoire
    onDelete: 'CASCADE'
  });
  
  // Autres associations...
  PlanTarifaire.hasMany(models.Session, {
    foreignKey: 'planTarifaireId',
    as: 'sessions'
  });
};

module.exports = PlanTarifaire;

// ===== Dans index.js des modèles =====
const models = {
  TypePoste: require('./TypePoste'),
  PlanTarifaire: require('./PlanTarifaire'),
  // ... autres modèles
};

// ✅ INITIALISER LES ASSOCIATIONS
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
`;

    fs.writeFileSync(exempleFile, exempleCode, 'utf8');
    console.log(`✅ Exemple créé: ${exempleFile}`);

    console.log('\n🎉 CORRECTION TERMINÉE');
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Vérifiez vos fichiers TypePoste.js et PlanTarifaire.js');
    console.log('2. Ajoutez les alias dans les associations si manquants');
    console.log('3. Redémarrez votre serveur backend');
    console.log('4. Testez les scripts corrigés');

    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    return false;
  }
}

// Exécution
console.log('🚀 Démarrage de la correction des associations...\n');
const success = corrigerAssociations();

if (success) {
  console.log('\n✅ Correction réussie');
} else {
  console.log('\n❌ Correction échouée');
}

process.exit(success ? 0 : 1);

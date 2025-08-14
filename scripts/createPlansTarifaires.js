#!/usr/bin/env node

/**
 * Script d'exécution pour créer les plans tarifaires
 * 
 * Utilisation :
 * node scripts/createPlansTarifaires.js
 * 
 * ou depuis le package.json :
 * npm run create:plans
 */

require('dotenv').config();
const { initDb } = require('../config/sequelize');
const { createPlansTarifaires } = require('./init/createPlansTarifaires');

async function main() {
  try {
    console.log('🚀 [SCRIPT] Démarrage de la création des plans tarifaires...\n');
    
    // Initialiser la connexion à la base de données
    console.log('🔌 [DB] Connexion à la base de données...');
    await initDb();
    console.log('✅ [DB] Connexion établie\n');
    
    // Créer les plans tarifaires
    await createPlansTarifaires();
    
    console.log('\n🎉 [SCRIPT] Plans tarifaires créés avec succès !');
    console.log('📝 [INFO] Vous pouvez maintenant utiliser ces plans dans votre application.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ [ERREUR] Échec de la création des plans tarifaires:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Gestion des signaux pour une fermeture propre
process.on('SIGINT', () => {
  console.log('\n⏹️ [SIGNAL] Interruption détectée, fermeture...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ [SIGNAL] Terminaison détectée, fermeture...');
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [ERREUR] Rejection non gérée à', promise, 'raison:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ [ERREUR] Exception non capturée:', error);
  process.exit(1);
});

// Exécution du script principal
main();

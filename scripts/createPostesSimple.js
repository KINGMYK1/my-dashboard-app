#!/usr/bin/env node

/**
 * Script simple pour créer tous les postes automatiquement
 * Version sans interaction pour déploiement rapide
 */

require('dotenv').config();
const { initPostes } = require('./createPostesGamingCenter');

/**
 * Fonction principale simplifiée
 */
async function main() {
  try {
    console.log('🚀 CRÉATION AUTOMATIQUE DES POSTES GAMING CENTER');
    console.log('📍 Plan: Rangée A (3 Volants + 4 PS4), Rangée B (1 PS4 + 4 PS5), Rangée C (4 PS4 PC Gaming)');
    console.log('');
    
    const success = await initPostes();
    
    if (success) {
      console.log('\n🎯 PROCHAINES ÉTAPES:');
      console.log('1. Vérifiez les postes créés dans votre interface admin');
      console.log('2. Configurez les alertes de maintenance si nécessaire');
      console.log('3. Testez les sessions sur chaque poste');
      console.log('4. Ajustez les spécifications selon vos équipements réels');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des postes:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n✅ Création des postes terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Échec de la création:', error);
    process.exit(1);
  });

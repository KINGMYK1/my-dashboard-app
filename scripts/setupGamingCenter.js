#!/usr/bin/env node

/**
 * Script principal pour initialiser complètement le Gaming Center
 * Exécute dans l'ordre: Types de postes → Plans tarifaires → Postes
 */

require('dotenv').config();

async function setupCompletGamingCenter() {
  console.log('🎮 SETUP COMPLET GAMING CENTER');
  console.log('=' .repeat(60));
  console.log('📋 Étapes: Types → Plans Tarifaires → Postes');
  console.log('');

  try {
    // ===== ÉTAPE 1: PLANS TARIFAIRES =====
    console.log('🔥 ÉTAPE 1/2: Création des types de postes et plans tarifaires');
    console.log('-'.repeat(50));
    
    const { initPlansTarifaires } = require('./createPlansTarifairesSimple');
    const planSuccess = await initPlansTarifaires();
    
    if (!planSuccess) {
      throw new Error('Échec de la création des plans tarifaires');
    }

    console.log('✅ Types de postes et plans tarifaires créés avec succès');
    console.log('');

    // ===== ÉTAPE 2: POSTES =====
    console.log('🏗️ ÉTAPE 2/2: Création des postes physiques');
    console.log('-'.repeat(50));
    
    const { initPostes } = require('./createPostesGamingCenter');
    const postesSuccess = await initPostes();
    
    if (!postesSuccess) {
      throw new Error('Échec de la création des postes');
    }

    console.log('✅ Postes créés avec succès');
    
    // ===== RÉSUMÉ FINAL =====
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SETUP GAMING CENTER TERMINÉ AVEC SUCCÈS!');
    console.log('');
    console.log('📊 RÉSUMÉ:');
    console.log('  ✅ 3 Types de postes créés (PS4, PS5, Volant)');
    console.log('  ✅ 22 Plans tarifaires générés (8 PS4 + 8 PS5 + 6 Volant)');
    console.log('  ✅ 15 Postes créés (9 PS4 + 4 PS5 + 3 Volants)');
    console.log('');
    console.log('🎯 AMÉNAGEMENT:');
    console.log('  🏁 Rangée A: 3 Volants (A1-A3) + 4 PS4 (A4-A7)');
    console.log('  🏁 Rangée B: 1 PS4 (B1) + 4 PS5 (B2-B5)');
    console.log('  🏁 Rangée C: 4 PS4 PC Gaming (C1-C4)');
    console.log('');
    console.log('💰 TARIFICATION:');
    console.log('  • PS4: 15 DH/h (8 plans de 30min à 4h)');
    console.log('  • PS5: 20 DH/h (8 plans de 30min à 4h)');
    console.log('  • Volant: 20 DH/h (6 plans de 30min à 3h)');
    console.log('');
    console.log('🚀 PROCHAINES ÉTAPES:');
    console.log('  1. Vérifiez les données dans votre interface admin');
    console.log('  2. Testez quelques sessions sur différents postes');
    console.log('  3. Ajustez les prix si nécessaire');
    console.log('  4. Configurez les alertes de maintenance');
    console.log('  5. Formez votre équipe sur le système');

    return true;

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU SETUP:', error.message);
    console.log('\n🔧 SOLUTIONS POSSIBLES:');
    console.log('  1. Vérifiez la connexion à la base de données');
    console.log('  2. Assurez-vous que les modèles Sequelize sont bien configurés');
    console.log('  3. Vérifiez les permissions sur la base de données');
    console.log('  4. Consultez les logs détaillés ci-dessus');
    
    return false;
  }
}

/**
 * Exécution principale
 */
if (require.main === module) {
  setupCompletGamingCenter()
    .then((success) => {
      if (success) {
        console.log('\n✅ Setup Gaming Center terminé avec succès!');
        process.exit(0);
      } else {
        console.log('\n❌ Setup Gaming Center échoué');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { setupCompletGamingCenter };

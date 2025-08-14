const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 DÉPLOIEMENT COMPLET DU GAMING CENTER');
console.log('=' .repeat(60));

/**
 * ✅ Script de déploiement complet du gaming center
 * 
 * Ce script exécute toutes les étapes nécessaires pour mettre en place
 * un gaming center fonctionnel avec :
 * - Types de postes et plans tarifaires
 * - 15 postes physiques avec spécifications détaillées
 * - Tests de validation
 */

const scripts = [
  {
    name: 'Setup Gaming Center Complet',
    script: 'setupGamingCenter.js',
    description: 'Déploie types, plans et postes automatiquement'
  },
  {
    name: 'Test Associations',
    script: 'testPostesAssociations.js', 
    description: 'Valide les associations Sequelize'
  }
];

async function executerScript(scriptInfo) {
  const { name, script, description } = scriptInfo;
  const scriptPath = path.join(__dirname, script);
  
  console.log(`\n📋 ÉTAPE: ${name}`);
  console.log(`📝 Description: ${description}`);
  console.log(`🎯 Script: ${script}`);
  console.log('-'.repeat(50));
  
  try {
    const result = execSync(`node "${scriptPath}"`, { 
      encoding: 'utf8', 
      cwd: __dirname,
      stdio: 'inherit' 
    });
    
    console.log(`✅ [${name}] SUCCÈS`);
    return true;
  } catch (error) {
    console.error(`❌ [${name}] ERREUR:`, error.message);
    return false;
  }
}

async function deploierGamingCenter() {
  console.log('🎮 Démarrage du déploiement gaming center...\n');
  
  let successCount = 0;
  const totalScripts = scripts.length;
  
  for (const scriptInfo of scripts) {
    const success = await executerScript(scriptInfo);
    if (success) {
      successCount++;
    }
    
    // Pause entre les scripts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DU DÉPLOIEMENT');
  console.log('='.repeat(60));
  console.log(`✅ Scripts réussis: ${successCount}/${totalScripts}`);
  console.log(`❌ Scripts échoués: ${totalScripts - successCount}/${totalScripts}`);
  
  if (successCount === totalScripts) {
    console.log('\n🎉 DÉPLOIEMENT GAMING CENTER TERMINÉ AVEC SUCCÈS !');
    console.log('\n🎮 Votre gaming center est maintenant opérationnel avec :');
    console.log('   • 3 types de postes (PS4, PS5, Volant)');
    console.log('   • 22 plans tarifaires automatiques');
    console.log('   • 15 postes physiques répartis sur 3 rangées');
    console.log('   • Associations base de données validées');
    console.log('\n🚀 Prochaines étapes :');
    console.log('   1. Démarrer le backend : npm start');
    console.log('   2. Tester l\'interface Sessions');
    console.log('   3. Créer des sessions avec abonnements');
  } else {
    console.log('\n⚠️  Déploiement partiel - Vérifiez les erreurs ci-dessus');
    console.log('\n🔧 Actions suggérées :');
    console.log('   1. Vérifier les logs d\'erreur');
    console.log('   2. Corriger les problèmes identifiés'); 
    console.log('   3. Relancer les scripts échoués');
  }
  
  console.log('\n📋 Gaming Center Layout:');
  console.log('   Rangée A: 3 Volants (A1-A3) + 4 PS4 (A4-A7)');
  console.log('   Rangée B: 1 PS4 (B1) + 4 PS5 (B2-B5)');
  console.log('   Rangée C: 4 PS4 PC Gaming (C1-C4)');
  console.log('\n💰 Tarification:');
  console.log('   • PS4: 15 DH/heure');
  console.log('   • PS5/Volant: 20 DH/heure');
}

// Exécution du déploiement
if (require.main === module) {
  deploierGamingCenter().catch(error => {
    console.error('💥 ERREUR CRITIQUE:', error);
    process.exit(1);
  });
}

module.exports = { deploierGamingCenter };

#!/usr/bin/env node

/**
 * Script de validation pour vérifier la configuration avant création des plans tarifaires
 */

require('dotenv').config();
const { initDb } = require('../config/sequelize');
const { TypePoste, PlanTarifaire } = require('../models');

async function validateEnvironment() {
  console.log('🔍 VALIDATION DE L\'ENVIRONNEMENT\n');

  // Vérifier les variables d'environnement
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  let envValid = true;

  console.log('📋 Variables d\'environnement :');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${varName.includes('PASSWORD') ? '***' : value}`);
    } else {
      console.log(`  ❌ ${varName}: MANQUANT`);
      envValid = false;
    }
  });

  if (!envValid) {
    console.log('\n❌ Variables d\'environnement manquantes. Vérifiez votre fichier .env');
    return false;
  }

  // Tester la connexion à la base de données
  console.log('\n🔌 Test de connexion à la base de données...');
  try {
    await initDb();
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.log('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }

  // Vérifier l'existence des tables
  console.log('\n📊 Vérification des tables...');
  try {
    await TypePoste.findAll({ limit: 1 });
    console.log('✅ Table TypePoste accessible');
    
    await PlanTarifaire.findAll({ limit: 1 });
    console.log('✅ Table PlanTarifaire accessible');
  } catch (error) {
    console.log('❌ Erreur d\'accès aux tables:', error.message);
    return false;
  }

  return true;
}

async function showCurrentState() {
  console.log('\n📈 ÉTAT ACTUEL DE LA BASE DE DONNÉES\n');

  // Compter les types de postes
  const typePostesCount = await TypePoste.count();
  console.log(`📊 Types de postes existants : ${typePostesCount}`);

  if (typePostesCount > 0) {
    const typesPostes = await TypePoste.findAll({
      attributes: ['id', 'nom', 'tarifHoraireBase', 'estActif'],
      order: [['nom', 'ASC']]
    });

    typesPostes.forEach(type => {
      const status = type.estActif ? '✅' : '❌';
      console.log(`  ${status} ${type.nom} (${type.tarifHoraireBase} DH/h)`);
    });
  }

  // Compter les plans tarifaires
  const plansCount = await PlanTarifaire.count();
  console.log(`\n💰 Plans tarifaires existants : ${plansCount}`);

  if (plansCount > 0) {
    const plansByType = await PlanTarifaire.findAll({
      include: [{
        model: TypePoste,
        attributes: ['nom']
      }],
      attributes: ['nom', 'prix', 'dureeMinutesMin', 'dureeMinutesMax', 'estActif'],
      order: [
        [TypePoste, 'nom', 'ASC'],
        ['ordreAffichage', 'ASC']
      ]
    });

    let currentType = '';
    plansByType.forEach(plan => {
      const typeName = plan.TypePoste?.nom || 'Inconnu';
      if (typeName !== currentType) {
        console.log(`\n  📁 ${typeName} :`);
        currentType = typeName;
      }
      const status = plan.estActif ? '✅' : '❌';
      console.log(`    ${status} ${plan.nom}: ${plan.prix} DH (${plan.dureeMinutesMin}-${plan.dureeMinutesMax} min)`);
    });
  }
}

async function checkForConflicts() {
  console.log('\n⚠️ VÉRIFICATION DES CONFLITS POTENTIELS\n');

  // Vérifier les doublons de noms de types de postes
  const duplicateTypes = await TypePoste.findAll({
    attributes: ['nom'],
    group: ['nom'],
    having: require('sequelize').literal('COUNT(*) > 1')
  });

  if (duplicateTypes.length > 0) {
    console.log('❌ Types de postes en doublon détectés :');
    duplicateTypes.forEach(type => {
      console.log(`  • ${type.nom}`);
    });
  } else {
    console.log('✅ Aucun doublon de type de poste');
  }

  // Vérifier les plans avec des durées qui se chevauchent
  const allPlans = await PlanTarifaire.findAll({
    include: [{
      model: TypePoste,
      attributes: ['nom']
    }],
    where: { estActif: true },
    order: [['typePosteId', 'ASC'], ['dureeMinutesMin', 'ASC']]
  });

  const conflictsByType = {};
  allPlans.forEach(plan => {
    const typeName = plan.TypePoste?.nom;
    if (!conflictsByType[typeName]) {
      conflictsByType[typeName] = [];
    }
    conflictsByType[typeName].push(plan);
  });

  let hasConflicts = false;
  Object.entries(conflictsByType).forEach(([typeName, plans]) => {
    for (let i = 0; i < plans.length - 1; i++) {
      const current = plans[i];
      const next = plans[i + 1];
      
      if (current.dureeMinutesMax >= next.dureeMinutesMin) {
        if (!hasConflicts) {
          console.log('⚠️ Chevauchements de durées détectés :');
          hasConflicts = true;
        }
        console.log(`  ${typeName}: "${current.nom}" (${current.dureeMinutesMin}-${current.dureeMinutesMax}) chevauche avec "${next.nom}" (${next.dureeMinutesMin}-${next.dureeMinutesMax})`);
      }
    }
  });

  if (!hasConflicts) {
    console.log('✅ Aucun chevauchement de durées détecté');
  }
}

async function generatePreview() {
  console.log('\n🎯 APERÇU DES PLANS QUI SERONT CRÉÉS\n');

  const configsPreview = {
    'PS4': { tarif: '15 DH/h', plans: 8 },
    'PS5': { tarif: '20 DH/h', plans: 8 },
    'Volant': { tarif: '20 DH/h', plans: 6 }
  };

  Object.entries(configsPreview).forEach(([type, info]) => {
    console.log(`🎮 ${type} (${info.tarif}) :`);
    console.log(`  • ${info.plans} plans tarifaires seront créés`);
    console.log(`  • De 30 minutes à ${type === 'Volant' ? '3 heures' : '4 heures'}`);
    console.log(`  • Durées flexibles avec min/max`);
    console.log('');
  });

  console.log('📝 Note : Les plans existants seront SUPPRIMÉS et remplacés');
}

async function main() {
  try {
    console.log('🔧 VALIDATION AVANT CRÉATION DES PLANS TARIFAIRES\n');
    console.log('=' .repeat(60));

    // Validation de l'environnement
    const isValid = await validateEnvironment();
    if (!isValid) {
      console.log('\n❌ Validation échouée. Corrigez les erreurs avant de continuer.');
      process.exit(1);
    }

    // État actuel
    await showCurrentState();

    // Vérification des conflits
    await checkForConflicts();

    // Aperçu des changements
    await generatePreview();

    console.log('=' .repeat(60));
    console.log('✅ VALIDATION COMPLÈTE');
    console.log('\n🚀 Vous pouvez maintenant exécuter :');
    console.log('   node scripts/createPlansTarifaires.js');
    console.log('   ou');
    console.log('   node scripts/planTarifairesInteractive.js');

  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();

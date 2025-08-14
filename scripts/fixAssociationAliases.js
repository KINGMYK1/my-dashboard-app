#!/usr/bin/env node

/**
 * Script pour vérifier et corriger les alias d'associations Sequelize
 * Résout l'erreur: "typePoste is associated to planTarifaire using an alias"
 */

require('dotenv').config();
const { initDb } = require('../config/sequelize');
const { TypePoste, PlanTarifaire } = require('../models');

async function checkAssociations() {
  console.log('🔍 VÉRIFICATION DES ASSOCIATIONS SEQUELIZE');
  console.log('=' .repeat(50));

  try {
    // ✅ 1. Vérifier les associations définies
    console.log('\n📋 ASSOCIATIONS DÉFINIES:');
    
    // Associations TypePoste
    console.log('\n🎮 TypePoste associations:');
    if (TypePoste.associations) {
      Object.keys(TypePoste.associations).forEach(assocName => {
        const assoc = TypePoste.associations[assocName];
        console.log(`  • ${assocName}: ${assoc.associationType} -> ${assoc.target.name}`);
        if (assoc.as) {
          console.log(`    Alias: "${assoc.as}"`);
        }
      });
    } else {
      console.log('  ❌ Aucune association trouvée');
    }

    // Associations PlanTarifaire
    console.log('\n💰 PlanTarifaire associations:');
    if (PlanTarifaire.associations) {
      Object.keys(PlanTarifaire.associations).forEach(assocName => {
        const assoc = PlanTarifaire.associations[assocName];
        console.log(`  • ${assocName}: ${assoc.associationType} -> ${assoc.target.name}`);
        if (assoc.as) {
          console.log(`    Alias: "${assoc.as}"`);
        }
      });
    } else {
      console.log('  ❌ Aucune association trouvée');
    }

    // ✅ 2. Test des requêtes avec les bons alias
    console.log('\n🔄 TEST DES REQUÊTES:');
    
    // Test 1: PlanTarifaire avec TypePoste
    try {
      console.log('\n📝 Test: PlanTarifaire.findAll avec include TypePoste...');
      
      const plans = await PlanTarifaire.findAll({
        include: [{
          model: TypePoste,
          as: 'typePoste', // ✅ Utiliser l'alias correct
          attributes: ['nom', 'tarifHoraireBase']
        }],
        limit: 3
      });
      
      console.log(`✅ Succès: ${plans.length} plans récupérés`);
      
      if (plans.length > 0) {
        console.log('\n📊 EXEMPLE DE DONNÉES:');
        plans.forEach((plan, index) => {
          console.log(`  Plan ${index + 1}:`);
          console.log(`    • Nom: ${plan.nom}`);
          console.log(`    • Prix: ${plan.prix} DH`);
          console.log(`    • Type: ${plan.typePoste?.nom || 'N/A'}`);
          console.log(`    • Tarif base: ${plan.typePoste?.tarifHoraireBase || 'N/A'} DH/h`);
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur test PlanTarifaire:', error.message);
      
      // Proposer des solutions alternatives
      console.log('\n🔧 TENTATIVES DE CORRECTION:');
      
      // Essayer sans alias
      try {
        console.log('  Essai sans alias...');
        const plansNoAlias = await PlanTarifaire.findAll({
          include: [{
            model: TypePoste,
            attributes: ['nom', 'tarifHoraireBase']
          }],
          limit: 1
        });
        console.log('  ✅ Succès sans alias');
      } catch (err) {
        console.log('  ❌ Échec sans alias:', err.message);
      }
      
      // Essayer avec d'autres alias possibles
      const possibleAliases = ['TypePoste', 'type', 'typePoste', 'Type'];
      for (const alias of possibleAliases) {
        try {
          console.log(`  Essai avec alias "${alias}"...`);
          const plansWithAlias = await PlanTarifaire.findAll({
            include: [{
              model: TypePoste,
              as: alias,
              attributes: ['nom', 'tarifHoraireBase']
            }],
            limit: 1
          });
          console.log(`  ✅ Succès avec alias "${alias}"`);
          break;
        } catch (err) {
          console.log(`  ❌ Échec avec alias "${alias}"`);
        }
      }
    }

    // Test 2: TypePoste avec PlanTarifaire
    try {
      console.log('\n📝 Test: TypePoste.findAll avec include PlanTarifaire...');
      
      const types = await TypePoste.findAll({
        include: [{
          model: PlanTarifaire,
          as: 'plansTarifaires', // ✅ Utiliser l'alias correct
          attributes: ['nom', 'prix', 'dureeMinutesMin', 'dureeMinutesMax']
        }],
        limit: 3
      });
      
      console.log(`✅ Succès: ${types.length} types récupérés`);
      
      if (types.length > 0) {
        console.log('\n📊 EXEMPLE DE DONNÉES:');
        types.forEach((type, index) => {
          console.log(`  Type ${index + 1}:`);
          console.log(`    • Nom: ${type.nom}`);
          console.log(`    • Tarif: ${type.tarifHoraireBase} DH/h`);
          console.log(`    • Plans: ${type.plansTarifaires?.length || 0}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur test TypePoste:', error.message);
    }

    console.log('\n✅ VÉRIFICATION TERMINÉE');

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 DÉMARRAGE DU DIAGNOSTIC D\'ASSOCIATIONS');
    
    // Connexion DB
    await initDb();
    console.log('✅ Connexion à la base de données établie');

    // Vérification des associations
    await checkAssociations();

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

main();

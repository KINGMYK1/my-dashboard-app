#!/usr/bin/env node

/**
 * Script de validation pour vérifier les associations des postes
 * Teste les requêtes avec les bons alias
 */

require('dotenv').config();
const { initDb } = require('../config/sequelize');
const { TypePoste, Poste, PlanTarifaire } = require('../models');

async function testPostesAssociations() {
  console.log('🔍 TEST DES ASSOCIATIONS POSTES');
  console.log('=' .repeat(50));

  try {
    await initDb();
    console.log('✅ Connexion à la base de données établie');

    // Test 1: Poste avec TypePoste
    console.log('\n📝 Test 1: Poste.findAll avec include TypePoste...');
    try {
      const postes = await Poste.findAll({
        include: [{
          model: TypePoste,
          as: 'typePoste', // ✅ Utiliser l'alias
          attributes: ['nom', 'tarifHoraireBase']
        }],
        limit: 5
      });

      console.log(`✅ Succès: ${postes.length} postes récupérés`);
      
      if (postes.length > 0) {
        console.log('\n📊 POSTES TROUVÉS:');
        postes.forEach(poste => {
          console.log(`  • ${poste.nom} (${poste.position}) - Type: ${poste.typePoste?.nom || 'N/A'}`);
        });
      }

    } catch (error) {
      console.error('❌ Erreur test Poste:', error.message);
      
      // Test alternatif sans alias
      try {
        console.log('  Tentative sans alias...');
        const postesNoAlias = await Poste.findAll({
          include: [{
            model: TypePoste,
            attributes: ['nom']
          }],
          limit: 1
        });
        console.log('  ✅ Succès sans alias');
      } catch (err) {
        console.log('  ❌ Échec sans alias aussi:', err.message);
      }
    }

    // Test 2: TypePoste avec Postes
    console.log('\n📝 Test 2: TypePoste.findAll avec include Postes...');
    try {
      const types = await TypePoste.findAll({
        include: [{
          model: Poste,
          as: 'postes', // ✅ Utiliser l'alias
          attributes: ['nom', 'position', 'etat']
        }],
        limit: 3
      });

      console.log(`✅ Succès: ${types.length} types récupérés`);
      
      if (types.length > 0) {
        console.log('\n📊 TYPES AVEC POSTES:');
        types.forEach(type => {
          console.log(`  • ${type.nom} (${type.postes?.length || 0} postes)`);
          if (type.postes && type.postes.length > 0) {
            type.postes.slice(0, 3).forEach(poste => {
              console.log(`    - ${poste.nom} (${poste.position}) [${poste.etat}]`);
            });
          }
        });
      }

    } catch (error) {
      console.error('❌ Erreur test TypePoste avec postes:', error.message);
    }

    // Test 3: Requête complexe avec tous les alias
    console.log('\n📝 Test 3: Requête complexe avec TypePoste + PlansTarifaires...');
    try {
      const typesComplets = await TypePoste.findAll({
        include: [
          {
            model: Poste,
            as: 'postes',
            attributes: ['nom', 'position', 'etat'],
            where: { estActif: true },
            required: false
          },
          {
            model: PlanTarifaire,
            as: 'plansTarifaires',
            attributes: ['nom', 'prix', 'dureeMinutesMin'],
            where: { estActif: true },
            required: false
          }
        ],
        limit: 2
      });

      console.log(`✅ Succès: ${typesComplets.length} types complets récupérés`);
      
      if (typesComplets.length > 0) {
        console.log('\n📊 DONNÉES COMPLÈTES:');
        typesComplets.forEach(type => {
          console.log(`\n🎮 ${type.nom}:`);
          console.log(`  • Tarif: ${type.tarifHoraireBase} DH/h`);
          console.log(`  • Postes: ${type.postes?.length || 0}`);
          console.log(`  • Plans: ${type.plansTarifaires?.length || 0}`);
        });
      }

    } catch (error) {
      console.error('❌ Erreur requête complexe:', error.message);
    }

    console.log('\n✅ TEST DES ASSOCIATIONS TERMINÉ');

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

async function main() {
  try {
    await testPostesAssociations();
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

main();

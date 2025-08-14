#!/usr/bin/env node

/**
 * Script simple pour créer les plans tarifaires Gaming Center
 * Approche directe et efficace - Version corrigée
 */

require('dotenv').config();
const { initDb } = require('../config/sequelize');
const { TypePoste, PlanTarifaire } = require('../models');

/**
 * Configuration des types de postes et leurs plans
 * Selon les spécifications du cahier des charges Gaming Center
 */
const TYPES_POSTES_CONFIG = {
  PS4: {
    tarifHoraireBase: 15.00,
    description: 'Console PlayStation 4 avec manettes',
    icone: 'gamepad',
    couleur: '#1E40AF',
    ordreAffichage: 1,
    plans: [
      { nom: '30 minutes', dureeMin: 20, dureeMax: 45, prix: 10.00, ordre: 1 },
      { nom: '1 heure', dureeMin: 50, dureeMax: 70, prix: 15.00, ordre: 2, vedette: true },
      { nom: '1h30', dureeMin: 80, dureeMax: 100, prix: 20.00, ordre: 3 },
      { nom: '2 heures', dureeMin: 110, dureeMax: 130, prix: 25.00, ordre: 4 },
      { nom: '2h30', dureeMin: 140, dureeMax: 160, prix: 30.00, ordre: 5 },
      { nom: '3 heures', dureeMin: 170, dureeMax: 190, prix: 35.00, ordre: 6 },
      { nom: '3h30', dureeMin: 200, dureeMax: 220, prix: 40.00, ordre: 7 },
      { nom: '4 heures', dureeMin: 230, dureeMax: 250, prix: 45.00, ordre: 8 }
    ]
  },
  PS5: {
    tarifHoraireBase: 20.00,
    description: 'Console PlayStation 5 nouvelle génération',
    icone: 'gamepad',
    couleur: '#7C3AED',
    ordreAffichage: 2,
    plans: [
      { nom: '30 minutes', dureeMin: 20, dureeMax: 45, prix: 10.00, ordre: 1 },
      { nom: '1 heure', dureeMin: 50, dureeMax: 70, prix: 20.00, ordre: 2, vedette: true },
      { nom: '1h30', dureeMin: 80, dureeMax: 100, prix: 25.00, ordre: 3 },
      { nom: '2 heures', dureeMin: 110, dureeMax: 130, prix: 30.00, ordre: 4 },
      { nom: '2h30', dureeMin: 140, dureeMax: 160, prix: 40.00, ordre: 5 },
      { nom: '3 heures', dureeMin: 170, dureeMax: 190, prix: 50.00, ordre: 6 },
      { nom: '3h30', dureeMin: 200, dureeMax: 220, prix: 60.00, ordre: 7 },
      { nom: '4 heures', dureeMin: 230, dureeMax: 250, prix: 70.00, ordre: 8 }
    ]
  },
  Volant: {
    tarifHoraireBase: 20.00,
    description: 'Poste de simulation de course avec volant',
    icone: 'car',
    couleur: '#059669',
    ordreAffichage: 4,
    plans: [
      { nom: '30 minutes', dureeMin: 20, dureeMax: 45, prix: 10.00, ordre: 1, vedette: true },
      { nom: '1 heure', dureeMin: 50, dureeMax: 70, prix: 20.00, ordre: 2 },
      { nom: '1h30', dureeMin: 80, dureeMax: 100, prix: 25.00, ordre: 3 },
      { nom: '2 heures', dureeMin: 110, dureeMax: 130, prix: 30.00, ordre: 4 },
      { nom: '2h30', dureeMin: 140, dureeMax: 160, prix: 40.00, ordre: 5 },
      { nom: '3 heures', dureeMin: 170, dureeMax: 190, prix: 50.00, ordre: 6 }
    ]
  }
};

/**
 * Crée ou met à jour un type de poste
 */
const createOrUpdateTypePoste = async (typeName, config) => {
  console.log(`🔄 Traitement du type de poste: ${typeName}`);

  try {
    const [typePoste, created] = await TypePoste.findOrCreate({
      where: { nom: typeName },
      defaults: {
        nom: typeName,
        description: config.description,
        tarifHoraireBase: config.tarifHoraireBase,
        devise: 'DH',
        dureeMinSession: 15,
        intervalleFacturation: 15,
        icone: config.icone,
        couleur: config.couleur,
        ordreAffichage: config.ordreAffichage,
        estActif: true
      }
    });

    if (created) {
      console.log(`✅ Type de poste "${typeName}" créé`);
    } else {
      console.log(`ℹ️  Type de poste "${typeName}" existe déjà`);
      
      // Mettre à jour le tarif si nécessaire
      if (typePoste.tarifHoraireBase !== config.tarifHoraireBase) {
        await typePoste.update({ tarifHoraireBase: config.tarifHoraireBase });
        console.log(`💰 Tarif horaire mis à jour: ${config.tarifHoraireBase} DH/h`);
      }
    }

    return typePoste;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement du type "${typeName}":`, error.message);
    throw error;
  }
};

/**
 * Crée les plans tarifaires pour un type de poste
 */
const createPlansForType = async (typePoste, plans) => {
  console.log(`📋 Création des plans pour ${typePoste.nom}...`);

  try {
    // Supprimer les anciens plans
    const deletedCount = await PlanTarifaire.destroy({
      where: { typePosteId: typePoste.id }
    });

    if (deletedCount > 0) {
      console.log(`🗑️  ${deletedCount} anciens plans supprimés`);
    }

    // Créer les nouveaux plans
    let createdCount = 0;
    for (const planData of plans) {
      const dureeNominale = (planData.dureeMin + planData.dureeMax) / 2;
      const tarifEquivalent = Math.round((planData.prix / dureeNominale * 60) * 100) / 100;

      await PlanTarifaire.create({
        typePosteId: typePoste.id,
        nom: planData.nom,
        description: `Forfait ${planData.nom} pour ${typePoste.nom}`,
        dureeMinutesMin: planData.dureeMin,
        dureeMinutesMax: planData.dureeMax,
        prix: planData.prix,
        tarifHoraireEquivalent: tarifEquivalent,
        typePlan: 'STANDARD',
        ordreAffichage: planData.ordre,
        estMisEnAvant: planData.vedette || false,
        estActif: true
      });

      const vedetteBadge = planData.vedette ? ' 🌟' : '';
      console.log(`  ✅ ${planData.nom}: ${planData.prix} DH (${planData.dureeMin}-${planData.dureeMax} min)${vedetteBadge}`);
      createdCount++;
    }

    console.log(`✅ ${createdCount} plans créés pour ${typePoste.nom}`);
    return createdCount;

  } catch (error) {
    console.error(`❌ Erreur lors de la création des plans pour ${typePoste.nom}:`, error.message);
    throw error;
  }
};

/**
 * Affiche un résumé des plans créés
 */
const displaySummary = async () => {
  console.log('\n📊 RÉSUMÉ DES PLANS TARIFAIRES:');
  
  const plans = await PlanTarifaire.findAll({
    include: [{
      model: TypePoste,
      as: 'typePoste', // ✅ CORRECTION: Utiliser l'alias défini dans l'association
      attributes: ['nom', 'tarifHoraireBase']
    }],
    order: [
      ['typePosteId', 'ASC'],
      ['ordreAffichage', 'ASC']
    ]
  });

  const plansByType = {};
  plans.forEach(plan => {
    const typeName = plan.typePoste?.nom || 'Inconnu'; // ✅ CORRECTION: Utiliser l'alias
    if (!plansByType[typeName]) {
      plansByType[typeName] = [];
    }
    plansByType[typeName].push(plan);
  });

  for (const [type, typeChunkPlans] of Object.entries(plansByType)) {
    const typePoste = typeChunkPlans[0]?.typePoste; // ✅ CORRECTION: Utiliser l'alias
    console.log(`\n🎮 ${type} (Base: ${typePoste?.tarifHoraireBase || 'N/A'} DH/h):`);
    typeChunkPlans.forEach(plan => {
      const badge = plan.estMisEnAvant ? ' 🌟' : '';
      console.log(`  • ${plan.nom}: ${plan.prix} DH (${plan.dureeMinutesMin}-${plan.dureeMinutesMax} min)${badge}`);
    });
  }
};

/**
 * Fonction principale d'initialisation des plans tarifaires
 */
const initPlansTarifaires = async () => {
  try {
    console.log('🎮 INITIALISATION DES PLANS TARIFAIRES GAMING CENTER');
    console.log('=' .repeat(60));
    
    // Connexion à la base de données
    await initDb();
    console.log('✅ Connexion à la base de données établie');

    let totalPlansCreated = 0;
    
    // Traitement de chaque type de poste
    for (const [typeName, config] of Object.entries(TYPES_POSTES_CONFIG)) {
      console.log('\n' + '-'.repeat(40));
      
      // Créer ou mettre à jour le type de poste
      const typePoste = await createOrUpdateTypePoste(typeName, config);
      
      // Créer les plans tarifaires
      const plansCount = await createPlansForType(typePoste, config.plans);
      totalPlansCreated += plansCount;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 INITIALISATION TERMINÉE AVEC SUCCÈS!`);
    console.log(`📈 Total: ${totalPlansCreated} plans tarifaires créés`);
    
    // Afficher le résumé
    await displaySummary();
    
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des plans tarifaires:', error);
    throw error;
  }
};

/**
 * Exécution du script si appelé directement
 */
if (require.main === module) {
  initPlansTarifaires()
    .then(() => {
      console.log('\n✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Échec du script:', error);
      process.exit(1);
    });
}

module.exports = { 
  initPlansTarifaires,
  TYPES_POSTES_CONFIG 
};

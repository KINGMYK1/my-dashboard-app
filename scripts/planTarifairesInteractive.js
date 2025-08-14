#!/usr/bin/env node

/**
 * Script interactif pour créer les plans tarifaires
 * Permet de choisir quels types de postes traiter
 */

require('dotenv').config();
const readline = require('readline');
const { initDb } = require('../config/sequelize');
const { TypePoste, PlanTarifaire } = require('../models');

// Interface readline pour les interactions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function showCurrentPlans() {
  console.log('\n📋 PLANS TARIFAIRES ACTUELS :');
  
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

  if (plans.length === 0) {
    console.log('❌ Aucun plan tarifaire trouvé');
    return;
  }

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
    console.log(`\n🎮 ${type} (Base: ${typePoste?.tarifHoraireBase || 'N/A'} DH/h) :`);
    typeChunkPlans.forEach(plan => {
      const badge = plan.estMisEnAvant ? ' 🌟' : '';
      console.log(`  • ${plan.nom} : ${plan.prix} DH (${plan.dureeMinutesMin}-${plan.dureeMinutesMax} min)${badge}`);
    });
  }
}

async function createSpecificPlans() {
  const configs = {
    'PS4': {
      tarifHoraireBase: 15.00,
      description: 'Console PlayStation 4 avec manettes',
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
    'PS5': {
      tarifHoraireBase: 20.00,
      description: 'Console PlayStation 5 nouvelle génération',
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
    'Volant': {
      tarifHoraireBase: 20.00,
      description: 'Poste de simulation de course avec volant',
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

  console.log('\n🎯 TYPES DE POSTES DISPONIBLES :');
  const typeNames = Object.keys(configs);
  typeNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name} (${configs[name].tarifHoraireBase} DH/h)`);
  });
  console.log(`${typeNames.length + 1}. Tous les types`);

  const choice = await question('\nChoisissez le type à traiter (numéro) : ');
  const choiceNum = parseInt(choice);

  let typesToProcess = [];
  
  if (choiceNum === typeNames.length + 1) {
    typesToProcess = typeNames;
    console.log('✅ Traitement de tous les types de postes');
  } else if (choiceNum >= 1 && choiceNum <= typeNames.length) {
    typesToProcess = [typeNames[choiceNum - 1]];
    console.log(`✅ Traitement du type : ${typesToProcess[0]}`);
  } else {
    console.log('❌ Choix invalide');
    return false;
  }

  for (const typeName of typesToProcess) {
    await processTypePoste(typeName, configs[typeName]);
  }

  return true;
}

async function processTypePoste(typeName, config) {
  console.log(`\n🔄 Traitement de ${typeName}...`);

  try {
    // Chercher ou créer le type de poste
    let typePoste = await TypePoste.findOne({ where: { nom: typeName } });
    
    if (!typePoste) {
      console.log(`➕ Création du type de poste ${typeName}...`);
      typePoste = await TypePoste.create({
        nom: typeName,
        description: config.description,
        tarifHoraireBase: config.tarifHoraireBase,
        devise: 'DH',
        dureeMinSession: 15,
        intervalleFacturation: 15,
        icone: typeName === 'Volant' ? 'car' : 'gamepad',
        couleur: typeName === 'PS4' ? '#1E40AF' : typeName === 'PS5' ? '#7C3AED' : '#059669',
        ordreAffichage: typeName === 'PS4' ? 1 : typeName === 'PS5' ? 2 : 4,
        estActif: true
      });
      console.log(`✅ Type de poste ${typeName} créé`);
    } else {
      console.log(`ℹ️ Type de poste ${typeName} trouvé`);
      // Mettre à jour le tarif si nécessaire
      if (typePoste.tarifHoraireBase !== config.tarifHoraireBase) {
        await typePoste.update({ tarifHoraireBase: config.tarifHoraireBase });
        console.log(`💰 Tarif horaire mis à jour : ${config.tarifHoraireBase} DH/h`);
      }
    }

    // Supprimer les anciens plans
    const deleted = await PlanTarifaire.destroy({
      where: { typePosteId: typePoste.id }
    });
    
    if (deleted > 0) {
      console.log(`🗑️ ${deleted} anciens plans supprimés`);
    }

    // Créer les nouveaux plans
    let created = 0;
    for (const planData of config.plans) {
      const dureeNominale = (planData.dureeMin + planData.dureeMax) / 2;
      const tarifEquivalent = Math.round((planData.prix / dureeNominale * 60) * 100) / 100;

      await PlanTarifaire.create({
        typePosteId: typePoste.id,
        nom: planData.nom,
        description: `Forfait ${planData.nom} pour ${typeName}`,
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
      console.log(`  ✅ ${planData.nom} : ${planData.prix} DH (${planData.dureeMin}-${planData.dureeMax} min)${vedetteBadge}`);
      created++;
    }

    console.log(`✅ ${created} plans créés pour ${typeName}`);

  } catch (error) {
    console.error(`❌ Erreur pour ${typeName}:`, error.message);
  }
}

async function main() {
  try {
    console.log('🎮 GÉNÉRATEUR DE PLANS TARIFAIRES GAMING CENTER\n');
    
    // Connexion DB
    await initDb();
    console.log('✅ Connexion à la base de données établie\n');

    let continuer = true;
    while (continuer) {
      console.log('\n' + '='.repeat(50));
      console.log('MENU PRINCIPAL :');
      console.log('1. Voir les plans actuels');
      console.log('2. Créer/Mettre à jour les plans tarifaires');
      console.log('3. Quitter');
      
      const choix = await question('\nVotre choix : ');
      
      switch (choix) {
        case '1':
          await showCurrentPlans();
          break;
          
        case '2':
          const success = await createSpecificPlans();
          if (success) {
            console.log('\n🎉 Plans tarifaires traités avec succès !');
            
            const voirResultat = await question('\nVoulez-vous voir le résultat ? (o/n) : ');
            if (voirResultat.toLowerCase() === 'o') {
              await showCurrentPlans();
            }
          }
          break;
          
        case '3':
          continuer = false;
          console.log('👋 Au revoir !');
          break;
          
        default:
          console.log('❌ Choix invalide');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();

const { TypePoste, PlanTarifaire } = require('../../models');

/**
 * Script pour créer les plans tarifaires selon la logique spécifiée
 * 
 * LOGIQUE TARIFAIRE :
 * 
 * PS4 (Tarif horaire base : 15 DH/heure) :
 * - 30 min = 10 DH (durée flexible : 15-45 min)
 * - 1h = 15 DH 
 * - 1h30 = 20 DH
 * - 2h = 25 DH
 * - jusqu'à 4h
 * 
 * PS5 & Volant (Tarif horaire base : 20 DH/heure) :
 * - 30 min = 10 DH
 * - 1h = 20 DH
 * - 1h30 = 25 DH (prix calculé selon logique : 20 + 10 = 30, mais vous avez dit 25)
 * - 2h = 30 DH (prix calculé : 20 + 20 = 40, mais vous avez dit 30)
 */

async function createPlansTarifaires() {
  try {
    console.log('🎯 [PLANS] Création des plans tarifaires...');

    // Configuration des types de postes avec leurs tarifs
    const configTarifs = {
      'PS4': {
        tarifHoraireBase: 15.00,
        plans: [
          { 
            nom: '30 minutes', 
            dureeMinutesMin: 20, // Flexible : 20-25 min pour 30 min
            dureeMinutesMax: 45,
            dureeNominale: 30,
            prix: 10.00,
            ordreAffichage: 1
          },
          { 
            nom: '1 heure', 
            dureeMinutesMin: 50,
            dureeMinutesMax: 70,
            dureeNominale: 60,
            prix: 15.00,
            ordreAffichage: 2,
            estMisEnAvant: true
          },
          { 
            nom: '1h30', 
            dureeMinutesMin: 80,
            dureeMinutesMax: 100,
            dureeNominale: 90,
            prix: 20.00,
            ordreAffichage: 3
          },
          { 
            nom: '2 heures', 
            dureeMinutesMin: 110,
            dureeMinutesMax: 130,
            dureeNominale: 120,
            prix: 25.00,
            ordreAffichage: 4
          },
          { 
            nom: '2h30', 
            dureeMinutesMin: 140,
            dureeMinutesMax: 160,
            dureeNominale: 150,
            prix: 30.00,
            ordreAffichage: 5
          },
          { 
            nom: '3 heures', 
            dureeMinutesMin: 170,
            dureeMinutesMax: 190,
            dureeNominale: 180,
            prix: 35.00,
            ordreAffichage: 6
          },
          { 
            nom: '3h30', 
            dureeMinutesMin: 200,
            dureeMinutesMax: 220,
            dureeNominale: 210,
            prix: 40.00,
            ordreAffichage: 7
          },
          { 
            nom: '4 heures', 
            dureeMinutesMin: 230,
            dureeMinutesMax: 250,
            dureeNominale: 240,
            prix: 45.00,
            ordreAffichage: 8
          }
        ]
      },

      'PS5': {
        tarifHoraireBase: 20.00,
        plans: [
          { 
            nom: '30 minutes', 
            dureeMinutesMin: 20,
            dureeMinutesMax: 45,
            dureeNominale: 30,
            prix: 10.00,
            ordreAffichage: 1
          },
          { 
            nom: '1 heure', 
            dureeMinutesMin: 50,
            dureeMinutesMax: 70,
            dureeNominale: 60,
            prix: 20.00,
            ordreAffichage: 2,
            estMisEnAvant: true
          },
          { 
            nom: '1h30', 
            dureeMinutesMin: 80,
            dureeMinutesMax: 100,
            dureeNominale: 90,
            prix: 25.00, // Prix spécial selon votre logique
            ordreAffichage: 3
          },
          { 
            nom: '2 heures', 
            dureeMinutesMin: 110,
            dureeMinutesMax: 130,
            dureeNominale: 120,
            prix: 30.00, // Prix spécial selon votre logique
            ordreAffichage: 4
          },
          { 
            nom: '2h30', 
            dureeMinutesMin: 140,
            dureeMinutesMax: 160,
            dureeNominale: 150,
            prix: 40.00,
            ordreAffichage: 5
          },
          { 
            nom: '3 heures', 
            dureeMinutesMin: 170,
            dureeMinutesMax: 190,
            dureeNominale: 180,
            prix: 50.00,
            ordreAffichage: 6
          },
          { 
            nom: '3h30', 
            dureeMinutesMin: 200,
            dureeMinutesMax: 220,
            dureeNominale: 210,
            prix: 60.00,
            ordreAffichage: 7
          },
          { 
            nom: '4 heures', 
            dureeMinutesMin: 230,
            dureeMinutesMax: 250,
            dureeNominale: 240,
            prix: 70.00,
            ordreAffichage: 8
          }
        ]
      },

      'Volant': {
        tarifHoraireBase: 20.00,
        plans: [
          { 
            nom: '30 minutes', 
            dureeMinutesMin: 20,
            dureeMinutesMax: 45,
            dureeNominale: 30,
            prix: 10.00,
            ordreAffichage: 1,
            estMisEnAvant: true
          },
          { 
            nom: '1 heure', 
            dureeMinutesMin: 50,
            dureeMinutesMax: 70,
            dureeNominale: 60,
            prix: 20.00,
            ordreAffichage: 2
          },
          { 
            nom: '1h30', 
            dureeMinutesMin: 80,
            dureeMinutesMax: 100,
            dureeNominale: 90,
            prix: 25.00,
            ordreAffichage: 3
          },
          { 
            nom: '2 heures', 
            dureeMinutesMin: 110,
            dureeMinutesMax: 130,
            dureeNominale: 120,
            prix: 30.00,
            ordreAffichage: 4
          },
          { 
            nom: '2h30', 
            dureeMinutesMin: 140,
            dureeMinutesMax: 160,
            dureeNominale: 150,
            prix: 40.00,
            ordreAffichage: 5
          },
          { 
            nom: '3 heures', 
            dureeMinutesMin: 170,
            dureeMinutesMax: 190,
            dureeNominale: 180,
            prix: 50.00,
            ordreAffichage: 6
          }
        ]
      }
    };

    // Traitement pour chaque type de poste
    for (const [nomTypePoste, config] of Object.entries(configTarifs)) {
      try {
        console.log(`\n🎮 Traitement du type de poste : ${nomTypePoste}`);

        // Trouver le type de poste
        const typePoste = await TypePoste.findOne({
          where: { nom: nomTypePoste }
        });

        if (!typePoste) {
          console.log(`⚠️ Type de poste "${nomTypePoste}" non trouvé, création...`);
          
          // Créer le type de poste s'il n'existe pas
          const newTypePoste = await TypePoste.create({
            nom: nomTypePoste,
            description: `Console ${nomTypePoste}`,
            tarifHoraireBase: config.tarifHoraireBase,
            devise: 'DH',
            dureeMinSession: 15,
            intervalleFacturation: 15,
            icone: nomTypePoste === 'Volant' ? 'car' : 'gamepad',
            couleur: nomTypePoste === 'PS4' ? '#1E40AF' : nomTypePoste === 'PS5' ? '#7C3AED' : '#059669',
            ordreAffichage: nomTypePoste === 'PS4' ? 1 : nomTypePoste === 'PS5' ? 2 : 4,
            estActif: true
          });
          
          console.log(`✅ Type de poste "${nomTypePoste}" créé avec ID: ${newTypePoste.id}`);
          typePoste = newTypePoste;
        } else {
          console.log(`ℹ️ Type de poste "${nomTypePoste}" trouvé avec ID: ${typePoste.id}`);
          
          // Mettre à jour le tarif horaire base si nécessaire
          if (typePoste.tarifHoraireBase !== config.tarifHoraireBase) {
            await typePoste.update({ tarifHoraireBase: config.tarifHoraireBase });
            console.log(`💰 Tarif horaire base mis à jour : ${config.tarifHoraireBase} DH`);
          }
        }

        // Supprimer les anciens plans tarifaires pour ce type de poste
        const deletedCount = await PlanTarifaire.destroy({
          where: { typePosteId: typePoste.id }
        });
        
        if (deletedCount > 0) {
          console.log(`🗑️ ${deletedCount} anciens plans supprimés`);
        }

        // Créer les nouveaux plans tarifaires
        let plansCreated = 0;
        for (const planData of config.plans) {
          // Calculer le tarif horaire équivalent basé sur la durée nominale
          const tarifHoraireEquivalent = Math.round((planData.prix / planData.dureeNominale * 60) * 100) / 100;
          
          const planTarifaire = await PlanTarifaire.create({
            typePosteId: typePoste.id,
            nom: planData.nom,
            description: `Forfait ${planData.nom} pour ${nomTypePoste}`,
            dureeMinutesMin: planData.dureeMinutesMin,
            dureeMinutesMax: planData.dureeMinutesMax,
            prix: planData.prix,
            tarifHoraireEquivalent: tarifHoraireEquivalent,
            typePlan: 'STANDARD',
            estPromo: false,
            ordreAffichage: planData.ordreAffichage,
            estMisEnAvant: planData.estMisEnAvant || false,
            estActif: true,
            nbUtilisations: 0,
            chiffreAffaireGenere: 0.00
          });

          console.log(`  ✅ Plan "${planData.nom}" créé : ${planData.prix} DH (${planData.dureeMinutesMin}-${planData.dureeMinutesMax} min)`);
          plansCreated++;
        }

        console.log(`✅ ${plansCreated} plans tarifaires créés pour ${nomTypePoste}`);

      } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${nomTypePoste}:`, error.message);
      }
    }

    console.log('\n🎯 Création des plans tarifaires terminée !');
    
    // Affichage du résumé
    console.log('\n📊 RÉSUMÉ DES PLANS CRÉÉS :');
    const allPlans = await PlanTarifaire.findAll({
      include: [{
        model: TypePoste,
        attributes: ['nom']
      }],
      order: [
        ['typePosteId', 'ASC'],
        ['ordreAffichage', 'ASC']
      ]
    });

    const plansByType = {};
    allPlans.forEach(plan => {
      const typeName = plan.TypePoste?.nom || 'Inconnu';
      if (!plansByType[typeName]) {
        plansByType[typeName] = [];
      }
      plansByType[typeName].push(plan);
    });

    for (const [type, plans] of Object.entries(plansByType)) {
      console.log(`\n${type} :`);
      plans.forEach(plan => {
        console.log(`  • ${plan.nom} : ${plan.prix} DH (${plan.dureeMinutesMin}-${plan.dureeMinutesMax} min) - Équivalent: ${plan.tarifHoraireEquivalent} DH/h`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur globale lors de la création des plans tarifaires:', error);
    throw error;
  }
}

module.exports = { createPlansTarifaires };

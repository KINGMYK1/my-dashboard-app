#!/usr/bin/env node

/**
 * Script pour créer automatiquement tous les postes du Gaming Center
 * Selon le plan d'aménagement défini
 */

require('dotenv').config();
const { initDb } = require('../config/sequelize');
const { TypePoste, Poste } = require('../models');

/**
 * 📍 PLAN D'AMÉNAGEMENT DU GAMING CENTER
 * 
 * Rangée A: 3 Volants + 4 PS4
 * Rangée B: 1 PS4 + 4 PS5
 * Rangée C: 4 PS4 (clavier/souris)
 */
const POSTES_CONFIG = {
  // ===== RANGÉE A =====
  volants: [
    {
      nom: 'Volant A1',
      position: 'A1',
      typePoste: 'Volant',
      marqueModele: 'Logitech G29 + Playseat',
      specifications: {
        volant: 'Logitech G29',
        pedalier: 'G29 Driving Force',
        siege: 'Playseat Challenge',
        jeux: ['F1 2024', 'Gran Turismo', 'Forza Horizon'],
        ecran: '27" 144Hz'
      },
      numeroSerie: 'VOL-001-A1'
    },
    {
      nom: 'Volant A2',
      position: 'A2',
      typePoste: 'Volant',
      marqueModele: 'Thrustmaster T300RS + Playseat',
      specifications: {
        volant: 'Thrustmaster T300RS',
        pedalier: 'T3PA Pro',
        siege: 'Playseat Evolution',
        jeux: ['F1 2024', 'Gran Turismo', 'Assetto Corsa'],
        ecran: '27" 144Hz'
      },
      numeroSerie: 'VOL-002-A2'
    },
    {
      nom: 'Volant A3',
      position: 'A3',
      typePoste: 'Volant',
      marqueModele: 'Fanatec CSL Elite + Playseat',
      specifications: {
        volant: 'Fanatec CSL Elite',
        pedalier: 'CSL Elite Pedals',
        siege: 'Playseat F1',
        jeux: ['F1 2024', 'iRacing', 'Dirt Rally'],
        ecran: '32" Curved 165Hz'
      },
      numeroSerie: 'VOL-003-A3'
    }
  ],

  ps4_rangeA: [
    {
      nom: 'PS4 A4',
      position: 'A4',
      typePoste: 'PS4',
      marqueModele: 'PlayStation 4 Pro',
      specifications: {
        console: 'PS4 Pro 1TB',
        manettes: 2,
        jeux: ['FIFA 24', 'Call of Duty', 'Spider-Man', 'GTA V'],
        ecran: '24" Full HD',
        casque: 'Sony WH-CH710N'
      },
      numeroSerie: 'PS4-004-A4'
    },
    {
      nom: 'PS4 A5',
      position: 'A5',
      typePoste: 'PS4',
      marqueModele: 'PlayStation 4 Slim',
      specifications: {
        console: 'PS4 Slim 1TB',
        manettes: 2,
        jeux: ['FIFA 24', 'Fortnite', 'Apex Legends', 'Rocket League'],
        ecran: '24" Full HD',
        casque: 'HyperX Cloud II'
      },
      numeroSerie: 'PS4-005-A5'
    },
    {
      nom: 'PS4 A6',
      position: 'A6',
      typePoste: 'PS4',
      marqueModele: 'PlayStation 4 Pro',
      specifications: {
        console: 'PS4 Pro 1TB',
        manettes: 2,
        jeux: ['Mortal Kombat 11', 'Tekken 7', 'Street Fighter 6'],
        ecran: '24" Full HD',
        casque: 'Razer Kraken'
      },
      numeroSerie: 'PS4-006-A6'
    },
    {
      nom: 'PS4 A7',
      position: 'A7',
      typePoste: 'PS4',
      marqueModele: 'PlayStation 4 Slim',
      specifications: {
        console: 'PS4 Slim 500GB',
        manettes: 2,
        jeux: ['Minecraft', 'Fall Guys', 'Among Us', 'Overwatch'],
        ecran: '24" Full HD',
        casque: 'SteelSeries Arctis 3'
      },
      numeroSerie: 'PS4-007-A7'
    }
  ],

  // ===== RANGÉE B =====
  ps4_rangeB: [
    {
      nom: 'PS4 B1',
      position: 'B1',
      typePoste: 'PS4',
      marqueModele: 'PlayStation 4 Pro',
      specifications: {
        console: 'PS4 Pro 1TB',
        manettes: 2,
        jeux: ['The Last of Us 2', 'God of War', 'Horizon Zero Dawn'],
        ecran: '27" 4K',
        casque: 'Sony Pulse 3D'
      },
      numeroSerie: 'PS4-001-B1'
    }
  ],

  ps5_rangeB: [
    {
      nom: 'PS5 B2',
      position: 'B2',
      typePoste: 'PS5',
      marqueModele: 'PlayStation 5 Standard',
      specifications: {
        console: 'PS5 Standard 825GB',
        manettes: 2,
        ssd: 'SSD NVMe 1TB',
        jeux: ['Spider-Man 2', 'FIFA 24', 'Call of Duty MW3', 'Fortnite'],
        ecran: '27" 4K 120Hz',
        casque: 'Sony Pulse 3D'
      },
      numeroSerie: 'PS5-002-B2'
    },
    {
      nom: 'PS5 B3',
      position: 'B3',
      typePoste: 'PS5',
      marqueModele: 'PlayStation 5 Standard',
      specifications: {
        console: 'PS5 Standard 825GB',
        manettes: 2,
        ssd: 'SSD NVMe 1TB',
        jeux: ['Demons Souls', 'Ratchet & Clank', 'Returnal', 'Astros Playroom'],
        ecran: '27" 4K 120Hz',
        casque: 'HyperX Cloud Flight'
      },
      numeroSerie: 'PS5-003-B3'
    },
    {
      nom: 'PS5 B4',
      position: 'B4',
      typePoste: 'PS5',
      marqueModele: 'PlayStation 5 Digital',
      specifications: {
        console: 'PS5 Digital 825GB',
        manettes: 2,
        ssd: 'SSD NVMe 1TB',
        jeux: ['Horizon Forbidden West', 'GT7', 'Miles Morales'],
        ecran: '27" 4K 120Hz',
        casque: 'Razer Kraken Ultimate'
      },
      numeroSerie: 'PS5-004-B4'
    },
    {
      nom: 'PS5 B5',
      position: 'B5',
      typePoste: 'PS5',
      marqueModele: 'PlayStation 5 Standard',
      specifications: {
        console: 'PS5 Standard 825GB',
        manettes: 2,
        ssd: 'SSD NVMe 2TB',
        jeux: ['Baldurs Gate 3', 'Cyberpunk 2077', 'Elden Ring'],
        ecran: '32" 4K 144Hz',
        casque: 'SteelSeries Arctis 7P'
      },
      numeroSerie: 'PS5-005-B5'
    }
  ],

  // ===== RANGÉE C =====
  ps4_clavier_souris: [
    {
      nom: 'PC Gaming C1',
      position: 'C1',
      typePoste: 'PS4',
      marqueModele: 'PS4 Pro + Setup PC Gaming',
      specifications: {
        console: 'PS4 Pro 1TB',
        clavier: 'Razer BlackWidow V3',
        souris: 'Logitech G502 Hero',
        tapis: 'SteelSeries QcK XXL',
        jeux: ['Overwatch', 'Rocket League', 'Minecraft', 'Fortnite'],
        ecran: '24" Gaming 144Hz',
        casque: 'HyperX Cloud Alpha'
      },
      numeroSerie: 'PS4-001-C1',
      estReservable: true
    },
    {
      nom: 'PC Gaming C2',
      position: 'C2',
      typePoste: 'PS4',
      marqueModele: 'PS4 Pro + Setup PC Gaming',
      specifications: {
        console: 'PS4 Pro 1TB',
        clavier: 'Corsair K95 RGB',
        souris: 'Razer DeathAdder V3',
        tapis: 'Corsair MM300',
        jeux: ['Call of Duty', 'Apex Legends', 'Valorant', 'CS2'],
        ecran: '24" Gaming 144Hz',
        casque: 'Razer Kraken Pro'
      },
      numeroSerie: 'PS4-002-C2',
      estReservable: true
    },
    {
      nom: 'PC Gaming C3',
      position: 'C3',
      typePoste: 'PS4',
      marqueModele: 'PS4 Slim + Setup PC Gaming',
      specifications: {
        console: 'PS4 Slim 1TB',
        clavier: 'Logitech G915',
        souris: 'SteelSeries Rival 650',
        tapis: 'Razer Goliathus',
        jeux: ['FIFA 24', 'PES 2024', 'Rocket League', 'Fall Guys'],
        ecran: '24" Gaming 120Hz',
        casque: 'SteelSeries Arctis 5'
      },
      numeroSerie: 'PS4-003-C3',
      estReservable: true
    },
    {
      nom: 'PC Gaming C4',
      position: 'C4',
      typePoste: 'PS4',
      marqueModele: 'PS4 Pro + Setup PC Gaming Premium',
      specifications: {
        console: 'PS4 Pro 2TB',
        clavier: 'SteelSeries Apex Pro',
        souris: 'Finalmouse Ultralight 2',
        tapis: 'Artisan Hayate Otsu',
        jeux: ['Cyberpunk 2077', 'Witcher 3', 'GTA V', 'Red Dead 2'],
        ecran: '27" Gaming 165Hz',
        casque: 'Audio-Technica ATH-G1'
      },
      numeroSerie: 'PS4-004-C4',
      estReservable: true,
      niveauPriorite: 'HAUTE'
    }
  ]
};

/**
 * Crée ou récupère un type de poste
 */
async function getOrCreateTypePoste(typeName) {
  try {
    let typePoste = await TypePoste.findOne({ where: { nom: typeName } });
    
    if (!typePoste) {
      console.log(`⚠️  Type de poste "${typeName}" non trouvé. Vous devez d'abord exécuter le script de création des plans tarifaires.`);
      throw new Error(`Type de poste "${typeName}" manquant`);
    }
    
    console.log(`✅ Type de poste "${typeName}" trouvé (ID: ${typePoste.id})`);
    return typePoste;
  } catch (error) {
    console.error(`❌ Erreur récupération type "${typeName}":`, error.message);
    throw error;
  }
}

/**
 * Crée un poste avec ses spécifications
 */
async function createPoste(posteConfig) {
  try {
    console.log(`🔄 Création du poste: ${posteConfig.nom} (${posteConfig.position})`);

    // Récupérer le type de poste
    const typePoste = await getOrCreateTypePoste(posteConfig.typePoste);

    // Vérifier si le poste existe déjà
    const existingPoste = await Poste.findOne({ 
      where: { nom: posteConfig.nom } 
    });

    if (existingPoste) {
      console.log(`ℹ️  Poste "${posteConfig.nom}" existe déjà - Mise à jour des spécifications`);
      
      await existingPoste.update({
        typePosteId: typePoste.id,
        position: posteConfig.position,
        marqueModele: posteConfig.marqueModele,
        specifications: posteConfig.specifications,
        numeroSerie: posteConfig.numeroSerie,
        estReservable: posteConfig.estReservable ?? true,
        niveauPriorite: posteConfig.niveauPriorite ?? 'NORMALE',
        etat: 'Disponible',
        estActif: true
      });

      console.log(`✅ Poste "${posteConfig.nom}" mis à jour`);
      return existingPoste;
    }

    // Créer le nouveau poste
    const nouveauPoste = await Poste.create({
      nom: posteConfig.nom,
      typePosteId: typePoste.id,
      position: posteConfig.position,
      etat: 'Disponible',
      marqueModele: posteConfig.marqueModele,
      specifications: posteConfig.specifications,
      numeroSerie: posteConfig.numeroSerie,
      estReservable: posteConfig.estReservable ?? true,
      niveauPriorite: posteConfig.niveauPriorite ?? 'NORMALE',
      dateAjout: new Date(),
      estActif: true,
      // Valeurs par défaut pour les statistiques
      heuresUtilisationTotales: 0,
      nombreSessionsTotales: 0,
      chiffreAffaireTotalGenere: 0,
      tauxOccupationMoyen: 0,
      performanceScore: 100
    });

    console.log(`✅ Poste "${posteConfig.nom}" créé avec succès (ID: ${nouveauPoste.id})`);
    return nouveauPoste;

  } catch (error) {
    console.error(`❌ Erreur création poste "${posteConfig.nom}":`, error.message);
    throw error;
  }
}

/**
 * Affiche un résumé des postes créés
 */
async function afficherResume() {
  console.log('\n📊 RÉSUMÉ DES POSTES CRÉÉS:');
  console.log('=' .repeat(50));

  try {
    const postes = await Poste.findAll({
      include: [{
        model: TypePoste,
        as: 'typePoste',
        attributes: ['nom', 'tarifHoraireBase']
      }],
      order: [['position', 'ASC']]
    });

    // Grouper par rangée
    const postesParRangee = {};
    postes.forEach(poste => {
      const rangee = poste.position?.charAt(0) || 'X';
      if (!postesParRangee[rangee]) {
        postesParRangee[rangee] = [];
      }
      postesParRangee[rangee].push(poste);
    });

    for (const [rangee, postesRangee] of Object.entries(postesParRangee)) {
      console.log(`\n🏁 RANGÉE ${rangee}:`);
      postesRangee.forEach(poste => {
        const typeNom = poste.typePoste?.nom || 'Inconnu';
        const tarif = poste.typePoste?.tarifHoraireBase || 0;
        console.log(`  📍 ${poste.position} - ${poste.nom} (${typeNom} - ${tarif} DH/h)`);
        console.log(`     📱 ${poste.marqueModele}`);
        
        if (poste.specifications?.jeux) {
          const jeux = poste.specifications.jeux.slice(0, 3).join(', ');
          console.log(`     🎮 Jeux: ${jeux}${poste.specifications.jeux.length > 3 ? '...' : ''}`);
        }
      });
    }

    // Statistiques globales
    console.log('\n📈 STATISTIQUES:');
    const stats = {
      total: postes.length,
      volants: postes.filter(p => p.typePoste?.nom === 'Volant').length,
      ps4: postes.filter(p => p.typePoste?.nom === 'PS4').length,
      ps5: postes.filter(p => p.typePoste?.nom === 'PS5').length,
      pc_gaming: postes.filter(p => p.specifications?.clavier).length
    };

    console.log(`  • Total postes: ${stats.total}`);
    console.log(`  • Volants: ${stats.volants}`);
    console.log(`  • PS4: ${stats.ps4}`);
    console.log(`  • PS5: ${stats.ps5}`);
    console.log(`  • Setup PC Gaming: ${stats.pc_gaming}`);

  } catch (error) {
    console.error('❌ Erreur affichage résumé:', error);
  }
}

/**
 * Fonction principale de création des postes
 */
async function initPostes() {
  try {
    console.log('🎮 INITIALISATION DES POSTES GAMING CENTER');
    console.log('=' .repeat(60));
    
    // Connexion à la base de données
    await initDb();
    console.log('✅ Connexion à la base de données établie');

    let totalPostesCreated = 0;

    // ===== RANGÉE A - VOLANTS =====
    console.log('\n🏁 CRÉATION RANGÉE A - VOLANTS');
    console.log('-'.repeat(40));
    for (const volantConfig of POSTES_CONFIG.volants) {
      await createPoste(volantConfig);
      totalPostesCreated++;
    }

    // ===== RANGÉE A - PS4 =====
    console.log('\n🏁 CRÉATION RANGÉE A - PS4');
    console.log('-'.repeat(40));
    for (const ps4Config of POSTES_CONFIG.ps4_rangeA) {
      await createPoste(ps4Config);
      totalPostesCreated++;
    }

    // ===== RANGÉE B - PS4 =====
    console.log('\n🏁 CRÉATION RANGÉE B - PS4');
    console.log('-'.repeat(40));
    for (const ps4Config of POSTES_CONFIG.ps4_rangeB) {
      await createPoste(ps4Config);
      totalPostesCreated++;
    }

    // ===== RANGÉE B - PS5 =====
    console.log('\n🏁 CRÉATION RANGÉE B - PS5');
    console.log('-'.repeat(40));
    for (const ps5Config of POSTES_CONFIG.ps5_rangeB) {
      await createPoste(ps5Config);
      totalPostesCreated++;
    }

    // ===== RANGÉE C - PS4 PC GAMING =====
    console.log('\n🏁 CRÉATION RANGÉE C - PC GAMING');
    console.log('-'.repeat(40));
    for (const pcConfig of POSTES_CONFIG.ps4_clavier_souris) {
      await createPoste(pcConfig);
      totalPostesCreated++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 INITIALISATION TERMINÉE AVEC SUCCÈS!`);
    console.log(`📊 Total: ${totalPostesCreated} postes créés/mis à jour`);
    
    // Afficher le résumé
    await afficherResume();
    
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des postes:', error);
    throw error;
  }
}

/**
 * Exécution du script si appelé directement
 */
if (require.main === module) {
  initPostes()
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
  initPostes,
  POSTES_CONFIG 
};

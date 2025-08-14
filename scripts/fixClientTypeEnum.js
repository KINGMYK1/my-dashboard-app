#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE CORRECTION: Harmonisation de l'énumération typeClient
 * 
 * PROBLÈME IDENTIFIÉ:
 * - Frontend utilise 'NORMAL' 
 * - Base de données accepte 'STANDARD', 'VIP', 'SYSTEM'
 * - Erreur: invalid input value for enum "enum_clients_typeClient": "NORMAL"
 * 
 * SOLUTION:
 * 1. Standardiser sur 'STANDARD' partout
 * 2. Migrer les données existantes si nécessaire
 * 3. Vérifier l'intégrité après correction
 */

const { sequelize } = require('../../Backend 2.0/gaming-center-backend/config/sequelize');

async function fixClientTypeEnum() {
  console.log('🔧 [FIX_ENUM] Démarrage de la correction de l\'énumération typeClient...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ [FIX_ENUM] Connexion base de données établie');

    // 1. ✅ VÉRIFIER L'ÉTAT ACTUEL DE L'ÉNUMÉRATION
    console.log('\n📋 [FIX_ENUM] Vérification de l\'énumération actuelle...');
    
    const [enumResults] = await sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_clients_typeClient'
      )
      ORDER BY enumlabel;
    `);

    console.log('🔍 [FIX_ENUM] Valeurs actuelles de l\'énumération typeClient:');
    enumResults.forEach(row => console.log(`   - ${row.enumlabel}`));

    // 2. ✅ VÉRIFIER LES DONNÉES EXISTANTES
    console.log('\n📊 [FIX_ENUM] Analyse des données existantes...');
    
    const [clientsData] = await sequelize.query(`
      SELECT 
        typeClient, 
        COUNT(*) as count,
        COUNT(CASE WHEN isSystemClient = true THEN 1 END) as systemCount
      FROM clients 
      GROUP BY typeClient
      ORDER BY count DESC;
    `);

    console.log('📈 [FIX_ENUM] Répartition actuelle des types de clients:');
    clientsData.forEach(row => {
      console.log(`   - ${row.typeClient}: ${row.count} client(s) (dont ${row.systemcount} système)`);
    });

    // 3. ✅ AJOUTER LA VALEUR 'NORMAL' SI ELLE N'EXISTE PAS
    const hasNormal = enumResults.some(row => row.enumlabel === 'NORMAL');
    
    if (!hasNormal) {
      console.log('\n➕ [FIX_ENUM] Ajout de la valeur \'NORMAL\' à l\'énumération...');
      await sequelize.query(`
        ALTER TYPE enum_clients_typeClient ADD VALUE 'NORMAL';
      `);
      console.log('✅ [FIX_ENUM] Valeur \'NORMAL\' ajoutée avec succès');
    } else {
      console.log('\n✓ [FIX_ENUM] La valeur \'NORMAL\' existe déjà dans l\'énumération');
    }

    // 4. ✅ MIGRER LES DONNÉES: NORMAL → STANDARD
    console.log('\n🔄 [FIX_ENUM] Migration des données NORMAL → STANDARD...');
    
    const [updateResult] = await sequelize.query(`
      UPDATE clients 
      SET typeClient = 'STANDARD' 
      WHERE typeClient = 'NORMAL' 
      AND isSystemClient = false;
    `);

    const affectedRows = updateResult.rowCount || 0;
    console.log(`✅ [FIX_ENUM] ${affectedRows} client(s) migré(s) de NORMAL vers STANDARD`);

    // 5. ✅ VÉRIFIER L'INTÉGRITÉ DES DONNÉES
    console.log('\n🔍 [FIX_ENUM] Vérification de l\'intégrité...');
    
    const [integrityCheck] = await sequelize.query(`
      SELECT 
        typeClient,
        isSystemClient,
        COUNT(*) as count
      FROM clients 
      GROUP BY typeClient, isSystemClient
      ORDER BY typeClient, isSystemClient;
    `);

    console.log('📊 [FIX_ENUM] État final des données:');
    integrityCheck.forEach(row => {
      const systemLabel = row.issystemclient ? '(système)' : '(normal)';
      console.log(`   - ${row.typeClient} ${systemLabel}: ${row.count} client(s)`);
    });

    // 6. ✅ VÉRIFICATIONS SPÉCIALES
    console.log('\n🔐 [FIX_ENUM] Vérifications spéciales...');
    
    // Vérifier le client système
    const [systemClients] = await sequelize.query(`
      SELECT id, numeroClient, typeClient, isSystemClient
      FROM clients 
      WHERE isSystemClient = true OR id = 1;
    `);

    if (systemClients.length === 1) {
      const systemClient = systemClients[0];
      console.log(`✅ [FIX_ENUM] Client système trouvé: ID=${systemClient.id}, Type=${systemClient.typeclient}`);
      
      if (systemClient.typeclient !== 'SYSTEM') {
        console.log('⚠️ [FIX_ENUM] CORRECTION: Client système n\'a pas le bon type');
        await sequelize.query(`
          UPDATE clients 
          SET typeClient = 'SYSTEM' 
          WHERE id = 1 OR isSystemClient = true;
        `);
        console.log('✅ [FIX_ENUM] Type client système corrigé');
      }
    } else {
      console.log(`⚠️ [FIX_ENUM] ANOMALIE: ${systemClients.length} client(s) système trouvé(s)`);
    }

    // Vérifier les clients avec des valeurs orphelines
    const [orphanValues] = await sequelize.query(`
      SELECT typeClient, COUNT(*) as count
      FROM clients 
      WHERE typeClient NOT IN ('STANDARD', 'VIP', 'SYSTEM')
      GROUP BY typeClient;
    `);

    if (orphanValues.length > 0) {
      console.log('⚠️ [FIX_ENUM] Valeurs orphelines détectées:');
      orphanValues.forEach(row => {
        console.log(`   - ${row.typeclient}: ${row.count} client(s)`);
      });
    } else {
      console.log('✅ [FIX_ENUM] Aucune valeur orpheline détectée');
    }

    console.log('\n🎉 [FIX_ENUM] Correction de l\'énumération terminée avec succès!');
    console.log('\n📌 [FIX_ENUM] Résumé des actions:');
    console.log('   ✓ Énumération vérifiée/corrigée');
    console.log(`   ✓ ${affectedRows} client(s) migré(s)`);
    console.log('   ✓ Intégrité des données vérifiée');
    console.log('   ✓ Client système vérifié');

  } catch (error) {
    console.error('\n❌ [FIX_ENUM] Erreur lors de la correction:', error);
    
    if (error.original && error.original.code) {
      console.error(`   Code erreur: ${error.original.code}`);
      console.error(`   Détail: ${error.original.detail || error.message}`);
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 [FIX_ENUM] Connexion fermée');
  }
}

// 🚀 EXÉCUTION
if (require.main === module) {
  console.log('🎯 [FIX_ENUM] Script de correction de l\'énumération typeClient');
  console.log('   Objectif: Harmoniser NORMAL → STANDARD\n');
  
  fixClientTypeEnum()
    .then(() => {
      console.log('\n✅ [FIX_ENUM] Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 [FIX_ENUM] Échec du script:', error.message);
      process.exit(1);
    });
}

module.exports = { fixClientTypeEnum };

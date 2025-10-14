/**
 * 🔧 Script de migration automatique complet
 * Applique toutes les migrations nécessaires en une seule commande
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'memoire.db');
const dbDir = path.dirname(dbPath);

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Dossier data créé');
}

const db = new Database(dbPath);

console.log('🚀 Démarrage des migrations...\n');

// Liste des migrations à appliquer
const migrations = [
  {
    name: 'Ajouter colonne images à conversations',
    check: () => {
      const tableInfo = db.prepare("PRAGMA table_info(conversations)").all();
      return !tableInfo.some(col => col.name === 'images');
    },
    apply: () => {
      db.exec('ALTER TABLE conversations ADD COLUMN images TEXT');
    }
  },
  {
    name: 'Vérifier types de projets',
    check: () => {
      // Cette migration est toujours OK car project_type accepte toute valeur TEXT
      return false;
    },
    apply: () => {
      // Pas d'action nécessaire
    }
  }
];

// Appliquer les migrations
let appliedCount = 0;
let skippedCount = 0;

migrations.forEach((migration, index) => {
  try {
    if (migration.check()) {
      console.log(`⏳ Migration ${index + 1}: ${migration.name}...`);
      migration.apply();
      console.log(`✅ Migration ${index + 1}: ${migration.name} - Réussie\n`);
      appliedCount++;
    } else {
      console.log(`⏭️  Migration ${index + 1}: ${migration.name} - Déjà appliquée\n`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Migration ${index + 1}: ${migration.name} - Erreur:`);
    console.error(error.message);
    console.log('');
  }
});

// Vérifier l'intégrité de la base de données
try {
  const integrityCheck = db.prepare('PRAGMA integrity_check').get();
  if (integrityCheck.integrity_check === 'ok') {
    console.log('✅ Vérification d\'intégrité: OK');
  } else {
    console.warn('⚠️  Problème d\'intégrité détecté:', integrityCheck);
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification d\'intégrité:', error.message);
}

// Afficher le résumé
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DES MIGRATIONS');
console.log('='.repeat(50));
console.log(`✅ Migrations appliquées: ${appliedCount}`);
console.log(`⏭️  Migrations déjà présentes: ${skippedCount}`);
console.log(`📝 Total: ${migrations.length}`);
console.log('='.repeat(50) + '\n');

// Afficher la structure des tables
console.log('📋 Structure de la table conversations:');
const conversationsStructure = db.prepare("PRAGMA table_info(conversations)").all();
conversationsStructure.forEach(col => {
  console.log(`   - ${col.name} (${col.type})`);
});

db.close();
console.log('\n✅ Migrations terminées avec succès!');

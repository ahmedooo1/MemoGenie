const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'memoire.db');
const db = new Database(dbPath);

try {
  // Vérifier si la colonne existe déjà
  const tableInfo = db.prepare("PRAGMA table_info(conversations)").all();
  const hasImagesColumn = tableInfo.some(col => col.name === 'images');
  
  if (!hasImagesColumn) {
    console.log('Ajout de la colonne images à la table conversations...');
    db.exec('ALTER TABLE conversations ADD COLUMN images TEXT');
    console.log('✅ Colonne images ajoutée avec succès !');
  } else {
    console.log('ℹ️ La colonne images existe déjà.');
  }
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
  process.exit(1);
}

db.close();
console.log('Migration terminée.');

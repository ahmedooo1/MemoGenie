const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'memoire.db');
const db = new Database(dbPath);

console.log('🚀 Suppression de la contrainte CHECK sur project_type...\n');

try {
  // SQLite ne permet pas de modifier directement les contraintes CHECK
  // Il faut recréer la table
  
  // 1. Créer une nouvelle table sans la contrainte
  console.log('📝 Création de la nouvelle table projects_new...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      project_type TEXT DEFAULT 'memoir',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // 2. Copier toutes les données
  console.log('📋 Copie des données existantes...');
  db.exec(`
    INSERT INTO projects_new (id, title, description, project_type, created_at, updated_at)
    SELECT id, title, description, project_type, created_at, updated_at
    FROM projects;
  `);
  
  // 3. Supprimer l'ancienne table
  console.log('🗑️  Suppression de l\'ancienne table...');
  db.exec('DROP TABLE projects;');
  
  // 4. Renommer la nouvelle table
  console.log('✏️  Renommage de la nouvelle table...');
  db.exec('ALTER TABLE projects_new RENAME TO projects;');
  
  console.log('✅ Migration terminée avec succès !');
  console.log('ℹ️  La colonne project_type accepte maintenant tous les types de projets.\n');
  
  // Vérifier les types existants
  const projects = db.prepare('SELECT id, title, project_type FROM projects').all();
  console.log(`📊 ${projects.length} projet(s) dans la base :`);
  projects.forEach(p => {
    console.log(`   - ${p.title} (${p.project_type || 'non défini'})`);
  });
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
  process.exit(1);
}

db.close();

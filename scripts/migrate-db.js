// Script de migration pour ajouter project_type aux projets existants
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'memoire.db');
const db = new Database(dbPath);

console.log('🔄 Migration de la base de données...');

try {
  // Vérifier si la colonne existe déjà
  const tableInfo = db.prepare("PRAGMA table_info(projects)").all();
  const hasProjectType = tableInfo.some(col => col.name === 'project_type');
  
  if (!hasProjectType) {
    console.log('➕ Ajout de la colonne project_type...');
    db.exec(`
      ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'memoir' CHECK(project_type IN ('memoir', 'chatbot'));
    `);
    console.log('✅ Colonne project_type ajoutée avec succès !');
  } else {
    console.log('✅ La colonne project_type existe déjà.');
  }
  
  // Mettre à jour les projets existants qui n'ont pas de type
  const result = db.prepare(`
    UPDATE projects 
    SET project_type = 'memoir' 
    WHERE project_type IS NULL
  `).run();
  
  if (result.changes > 0) {
    console.log(`✅ ${result.changes} projet(s) mis à jour avec le type 'memoir' par défaut.`);
  }
  
  console.log('✅ Migration terminée avec succès !');
} catch (error) {
  console.error('❌ Erreur de migration:', error.message);
} finally {
  db.close();
}

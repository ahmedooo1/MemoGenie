const Database = require('better-sqlite3');
const db = new Database('data/memoire.db');

console.log('🚀 Ajout des types de projets...');

try {
  // Ajouter la colonne project_type à la table projects si elle n'existe pas
  const tableInfo = db.pragma('table_info(projects)');
  const hasProjectType = tableInfo.some(col => col.name === 'project_type');
  
  if (!hasProjectType) {
    console.log('📝 Ajout de la colonne project_type à la table projects...');
    db.exec(`
      ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'chatbot';
    `);
    
    // Mettre à jour les projets existants selon leur ancien type
    db.exec(`
      UPDATE projects 
      SET project_type = CASE 
        WHEN project_type IS NULL THEN 'chatbot'
        ELSE project_type 
      END;
    `);
    
    console.log('✅ Colonne project_type ajoutée avec succès');
  } else {
    console.log('ℹ️ La colonne project_type existe déjà');
  }

  // Vérifier si la table project_types existe
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='project_types'").all();
  
  if (tables.length === 0) {
    console.log('📝 Création de la table project_types...');
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS project_types (
        type_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT NOT NULL,
        temperature REAL DEFAULT 0.7,
        features TEXT, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Table project_types créée');
  } else {
    console.log('ℹ️ La table project_types existe déjà');
  }

  // Insérer les types de projets par défaut
  const insertType = db.prepare(`
    INSERT OR REPLACE INTO project_types (type_id, name, icon, description, temperature, features)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const projectTypes = [
    {
      type_id: 'memoir',
      name: 'Mémoire Académique',
      icon: '📚',
      description: 'Rédaction de thèses et mémoires universitaires',
      temperature: 0.7,
      features: JSON.stringify({
        chapters: true,
        citations: true,
        structured: true,
        imageGeneration: false,
        characterLimit: null
      })
    },
    {
      type_id: 'chatbot',
      name: 'Chatbot Général',
      icon: '💬',
      description: 'Assistant IA polyvalent pour toutes vos questions',
      temperature: 0.7,
      features: JSON.stringify({
        chapters: false,
        citations: false,
        structured: false,
        imageGeneration: true,
        characterLimit: null
      })
    },
    {
      type_id: 'image-studio',
      name: 'Studio d\'Images IA',
      icon: '🎨',
      description: 'Génération et modification d\'images avec historique',
      temperature: 0.8,
      features: JSON.stringify({
        chapters: false,
        citations: false,
        structured: false,
        imageGeneration: true,
        autoGenerateImages: true,
        characterLimit: null
      })
    },
    {
      type_id: 'creative-writing',
      name: 'Rédaction Créative',
      icon: '✍️',
      description: 'Romans, nouvelles, histoires et scénarios',
      temperature: 0.9,
      features: JSON.stringify({
        chapters: true,
        citations: false,
        structured: true,
        imageGeneration: true,
        characterLimit: null
      })
    },
    {
      type_id: 'social-media',
      name: 'Réseaux Sociaux',
      icon: '📱',
      description: 'Posts optimisés pour réseaux sociaux',
      temperature: 0.8,
      features: JSON.stringify({
        chapters: false,
        citations: false,
        structured: false,
        imageGeneration: true,
        characterLimit: 280,
        hashtags: true,
        emojis: true
      })
    },
    {
      type_id: 'professional-docs',
      name: 'Documents Professionnels',
      icon: '💼',
      description: 'Rapports, présentations et propositions',
      temperature: 0.6,
      features: JSON.stringify({
        chapters: true,
        citations: true,
        structured: true,
        imageGeneration: true,
        formal: true,
        characterLimit: null
      })
    },
    {
      type_id: 'emails',
      name: 'Emails & Correspondance',
      icon: '✉️',
      description: 'Rédaction d\'emails professionnels et personnels',
      temperature: 0.7,
      features: JSON.stringify({
        chapters: false,
        citations: false,
        structured: false,
        imageGeneration: false,
        templates: true,
        formalityLevels: true,
        characterLimit: null
      })
    },
    {
      type_id: 'translation',
      name: 'Traduction & Localisation',
      icon: '🌍',
      description: 'Traduction contextuelle multi-langues',
      temperature: 0.5,
      features: JSON.stringify({
        chapters: false,
        citations: false,
        structured: false,
        imageGeneration: false,
        multiLanguage: true,
        contextAware: true,
        characterLimit: null
      })
    },
    {
      type_id: 'prompt-generator',
      name: 'Prompt Generator',
      icon: '🎯',
      description: 'Améliorer et optimiser vos prompts pour IA',
      temperature: 0.8,
      features: JSON.stringify({
        chapters: false,
        citations: false,
        structured: true,
        imageGeneration: false,
        analysis: true,
        suggestions: true,
        characterLimit: null
      })
    }
  ];

  console.log('📝 Insertion des types de projets...');
  
  for (const type of projectTypes) {
    insertType.run(
      type.type_id,
      type.name,
      type.icon,
      type.description,
      type.temperature,
      type.features
    );
    console.log(`✅ ${type.icon} ${type.name} ajouté`);
  }

  console.log('\n🎉 Migration terminée avec succès !');
  console.log(`📊 ${projectTypes.length} types de projets configurés`);

} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
  process.exit(1);
} finally {
  db.close();
}

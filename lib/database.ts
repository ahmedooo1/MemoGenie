import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialiser la base de données SQLite
const dbPath = path.join(process.cwd(), 'data', 'memoire.db');
const dbDir = path.dirname(dbPath);

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT DEFAULT 'memoir',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    content TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    chapter_id INTEGER,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS context_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    context_type TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    UNIQUE(project_id, context_type, key)
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id);
  CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(project_id);
  CREATE INDEX IF NOT EXISTS idx_context_project ON context_memory(project_id);
`);

export default db;
export { db }; // Export nommé pour DELETE

// Types
export interface Project {
  id?: number;
  title: string;
  description?: string;
  project_type?: 'memoir' | 'chatbot' | 'image-studio' | 'creative-writing' | 'social-media' | 'professional-docs' | 'emails' | 'translation' | 'prompt-generator' | 'text-minify' | 'word-counter';
  created_at?: string;
  updated_at?: string;
}

export interface Chapter {
  id?: number;
  project_id: number;
  title: string;
  order_index: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id?: number;
  project_id: number;
  chapter_id?: number;
  role: 'user' | 'assistant';
  content: string;
  images?: string;
  created_at?: string;
}

export interface ContextMemory {
  id?: number;
  project_id: number;
  context_type: string;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

// Fonctions pour les projets
export const createProject = (title: string, description?: string, projectType: 'memoir' | 'chatbot' | 'image-studio' | 'creative-writing' | 'social-media' | 'professional-docs' | 'emails' | 'translation' | 'prompt-generator' | 'text-minify' | 'word-counter' = 'memoir'): number => {
  const stmt = db.prepare('INSERT INTO projects (title, description, project_type) VALUES (?, ?, ?)');
  const result = stmt.run(title, description || '', projectType);
  return result.lastInsertRowid as number;
};

export const getProject = (id: number): Project | undefined => {
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  return stmt.get(id) as Project | undefined;
};

export const getAllProjects = (): Project[] => {
  const stmt = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC');
  return stmt.all() as Project[];
};

export const updateProject = (id: number, title: string, description?: string) => {
  const stmt = db.prepare(
    'UPDATE projects SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(title, description || '', id);
};

// Fonctions pour les chapitres
export const createChapter = (projectId: number, title: string, orderIndex: number): number => {
  const stmt = db.prepare(
    'INSERT INTO chapters (project_id, title, order_index, content) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(projectId, title, orderIndex, '');
  
  // Mettre à jour le projet
  db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(projectId);
  
  return result.lastInsertRowid as number;
};

export const getChapter = (id: number): Chapter | undefined => {
  const stmt = db.prepare('SELECT * FROM chapters WHERE id = ?');
  return stmt.get(id) as Chapter | undefined;
};

export const getChaptersByProject = (projectId: number): Chapter[] => {
  const stmt = db.prepare('SELECT * FROM chapters WHERE project_id = ? ORDER BY order_index');
  return stmt.all(projectId) as Chapter[];
};

export const updateChapterContent = (id: number, content: string) => {
  const chapter = getChapter(id);
  if (!chapter) return;
  
  const stmt = db.prepare(
    'UPDATE chapters SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(content, id);
  
  // Mettre à jour le projet
  db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(chapter.project_id);
};

export const updateChapterTitle = (id: number, title: string) => {
  const stmt = db.prepare(
    'UPDATE chapters SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(title, id);
};

// Fonctions pour les conversations
export const addConversation = (
  projectId: number,
  role: 'user' | 'assistant',
  content: string,
  chapterId?: number,
  images?: string[]
): number => {
  const stmt = db.prepare(
    'INSERT INTO conversations (project_id, chapter_id, role, content, images) VALUES (?, ?, ?, ?, ?)'
  );
  const imagesJson = images && images.length > 0 ? JSON.stringify(images) : null;
  const result = stmt.run(projectId, chapterId || null, role, content, imagesJson);
  return result.lastInsertRowid as number;
};

export const getConversationsByProject = (projectId: number, limit?: number): Conversation[] => {
  let query = 'SELECT * FROM conversations WHERE project_id = ? ORDER BY created_at ASC';
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  const stmt = db.prepare(query);
  return stmt.all(projectId) as Conversation[];
};

export const getRecentConversations = (projectId: number, limit: number = 20): Conversation[] => {
  const stmt = db.prepare(
    'SELECT * FROM conversations WHERE project_id = ? ORDER BY created_at DESC LIMIT ?'
  );
  const conversations = stmt.all(projectId, limit) as Conversation[];
  return conversations.reverse(); // Inverser pour avoir l'ordre chronologique
};

export const deleteConversation = (conversationId: number) => {
  const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
  stmt.run(conversationId);
};

// Fonctions pour la mémoire de contexte
export const saveContextMemory = (
  projectId: number,
  contextType: string,
  key: string,
  value: string
) => {
  const stmt = db.prepare(`
    INSERT INTO context_memory (project_id, context_type, key, value)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(project_id, context_type, key)
    DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(projectId, contextType, key, value, value);
};

export const getContextMemory = (
  projectId: number,
  contextType?: string
): ContextMemory[] => {
  let query = 'SELECT * FROM context_memory WHERE project_id = ?';
  const params: any[] = [projectId];
  
  if (contextType) {
    query += ' AND context_type = ?';
    params.push(contextType);
  }
  
  query += ' ORDER BY updated_at DESC';
  const stmt = db.prepare(query);
  return stmt.all(...params) as ContextMemory[];
};

export const getContextValue = (
  projectId: number,
  contextType: string,
  key: string
): string | undefined => {
  const stmt = db.prepare(
    'SELECT value FROM context_memory WHERE project_id = ? AND context_type = ? AND key = ?'
  );
  const result = stmt.get(projectId, contextType, key) as { value: string } | undefined;
  return result?.value;
};

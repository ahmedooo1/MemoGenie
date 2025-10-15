// scripts/migrate-to-supabase.js
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key" node migrate-to-supabase.js
// Requirements: npm i better-sqlite3 @supabase/supabase-js

const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const SQLITE_PATH = path.join(process.cwd(), 'data', 'memoire.db');
const SUPABASE_URL = 'https://sqptmrpfqyhmywcvenph.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_KEY) {
  console.error('ERROR: set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const db = new Database(SQLITE_PATH, { readonly: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getTables() {
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all()
    .map(r => r.name);
}

function getRows(table) {
  return db.prepare(`SELECT * FROM "${table}"`).all();
}

function normalizeRow(row) {
  // Convert buffers to base64 strings, leave other types as-is
  const out = {};
  for (const k of Object.keys(row)) {
    const v = row[k];
    if (Buffer.isBuffer(v)) out[k] = v.toString('base64');
    else out[k] = v;
  }
  return out;
}

async function ensureTableExistsInSupabase(table, sampleRow) {
  // Attempt a minimal insert with ON CONFLICT DO NOTHING requires table to exist.
  // We proactively create a basic table when absent using dynamic SQL:
  const { data: exists } = await supabase
    .rpc('pg_table_is_visible', { oid: 0 }) // dummy to keep supabase client loaded
    .catch(() => ({}));
  // Simpler approach: try a safe query; if it fails, create table from sampleRow
  try {
    await supabase.from(table).select('1').limit(1);
    return;
  } catch (e) {
    // Build CREATE TABLE with columns inferred as text (safe fallback)
    const cols = Object.keys(sampleRow).map(col => `"${col}" text`).join(', ');
    const createSQL = `CREATE TABLE IF NOT EXISTS public."${table}" (${cols});`;
    const { error } = await supabase.rpc('sql', { q: createSQL }).catch(() => ({ error: { message: 'rpc sql unavailable' } }));
    // If rpc('sql') not available, fall back to supabase.query via REST is not exposed — instead run via SQL Editor in dashboard.
    if (error) {
      console.warn(`⚠️ Impossible de créer la table "${table}" automatiquement via l'API. Créez-la manuellement avec ce SQL:\n${createSQL}`);
      throw new Error('Création de table via API non supportée — créez manuellement dans Supabase SQL Editor.');
    }
  }
}

async function migrateTable(table) {
  console.log(`\n➡️  Migration de la table: ${table}`);
  const rows = getRows(table);
  if (!rows.length) { console.log('   - Aucune ligne à migrer'); return; }

  // Try ensure table exists: if fails, instruct user to create it manually
  try {
    await ensureTableExistsInSupabase(table, rows[0]);
  } catch (err) {
    console.error(err.message);
    return;
  }

  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map(normalizeRow);
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      console.error(`   - Erreur insert batch ${i/BATCH}:`, error.message || error);
      // continue to next batch
    } else {
      console.log(`   - Batch ${i/BATCH} inséré (${batch.length} rows)`);
    }
  }
  console.log(`   ✓ Migration terminée pour ${table} (${rows.length} rows)`);
}

(async () => {
  try {
    const tables = getTables();
    if (!tables.length) { console.log('Aucune table SQLite trouvée.'); process.exit(0); }
    console.log('Tables trouvées:', tables.join(', '));
    for (const table of tables) {
      await migrateTable(table);
    }
    console.log('\n✅ Migration terminée. Vérifiez Supabase Dashboard pour valider les schémas/données.');
    db.close();
    process.exit(0);
  } catch (err) {
    console.error('Migration échouée:', err);
    db.close();
    process.exit(1);
  }
})();

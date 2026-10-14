/**
 * Database Migration Runner (Native SQL Migrations)
 *
 * Supports:
 *   - UP:     Applies pending migrations in chronological order
 *   - DOWN:   Rolls back the latest applied migration
 *   - STATUS: Displays status of all migrations (APPLIED vs PENDING)
 *   - RESET:  Rolls back all applied migrations and re-applies from scratch
 */

const fs = require('fs');
const path = require('path');
const db = require('../db');

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

// Helper to extract UP and DOWN sections from SQL migration file
function parseMigration(content) {
  const upMatch = content.match(/--\s*UP([\s\S]*?)(?:--\s*DOWN|$)/i);
  const downMatch = content.match(/--\s*DOWN([\s\S]*)$/i);

  return {
    up: upMatch ? upMatch[1].trim() : '',
    down: downMatch ? downMatch[1].trim() : ''
  };
}

// Ensure schema_migrations tracking table exists
async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

// Get list of migration files in order
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
}

// 1. UP: Apply pending migrations
async function migrateUp() {
  await ensureMigrationsTable();
  const files = getMigrationFiles();
  const appliedRes = await db.query('SELECT name FROM schema_migrations');
  const appliedSet = new Set(appliedRes.rows.map(r => r.name));

  const pending = files.filter(f => !appliedSet.has(f));

  if (pending.length === 0) {
    console.log('✨ Database is already up to date. No pending migrations.');
    return;
  }

  console.log(`🚀 Found ${pending.length} pending migration(s). Applying...`);

  for (const file of pending) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { up } = parseMigration(content);

    if (!up) {
      console.warn(`⚠️ Warning: Migration ${file} has no -- UP block. Skipping.`);
      continue;
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      console.log(`  ▶ Applying ${file}...`);
      await client.query(up);
      await client.query('INSERT INTO schema_migrations (name, applied_at) VALUES ($1, NOW())', [file]);
      await client.query('COMMIT');
      console.log(`  ✅ Applied: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  ❌ Failed applying ${file}:`, err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log('🎉 All migrations applied successfully!');
}

// 2. DOWN: Rollback latest migration
async function migrateDown() {
  await ensureMigrationsTable();
  const latestRes = await db.query('SELECT name FROM schema_migrations ORDER BY id DESC LIMIT 1');

  if (latestRes.rows.length === 0) {
    console.log('ℹ️ No applied migrations found to rollback.');
    return;
  }

  const latestFile = latestRes.rows[0].name;
  const filePath = path.join(MIGRATIONS_DIR, latestFile);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file ${latestFile} not found on disk.`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const { down } = parseMigration(content);

  if (!down) {
    throw new Error(`Migration ${latestFile} does not contain a -- DOWN rollback section.`);
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    console.log(`  ◀ Rolling back ${latestFile}...`);
    await client.query(down);
    await client.query('DELETE FROM schema_migrations WHERE name = $1', [latestFile]);
    await client.query('COMMIT');
    console.log(`  ✅ Rolled back: ${latestFile}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`  ❌ Failed rolling back ${latestFile}:`, err.message);
    throw err;
  } finally {
    client.release();
  }
}

// 3. STATUS: Display status of all migrations
async function migrateStatus() {
  await ensureMigrationsTable();
  const files = getMigrationFiles();
  const appliedRes = await db.query('SELECT name, applied_at FROM schema_migrations ORDER BY id ASC');
  const appliedMap = new Map(appliedRes.rows.map(r => [r.name, r.applied_at]));

  console.log('\n======================================================');
  console.log('       DATABASE MIGRATION STATUS (schema_migrations)  ');
  console.log('======================================================');

  if (files.length === 0) {
    console.log('  No migration files found in server/migrations/');
  }

  files.forEach((file, index) => {
    if (appliedMap.has(file)) {
      const date = new Date(appliedMap.get(file)).toISOString();
      console.log(`  [✓ APPLIED]  ${file} (applied: ${date})`);
    } else {
      console.log(`  [⏳ PENDING]  ${file}`);
    }
  });

  const appliedCount = files.filter(f => appliedMap.has(f)).length;
  const pendingCount = files.length - appliedCount;

  console.log('======================================================');
  console.log(`Total: ${files.length} | Applied: ${appliedCount} | Pending: ${pendingCount}`);
  console.log('======================================================\n');
}

// 4. RESET: Rollback all migrations and re-apply
async function migrateReset() {
  await ensureMigrationsTable();
  const appliedRes = await db.query('SELECT name FROM schema_migrations ORDER BY id DESC');

  console.log(`🔄 Rolling back ${appliedRes.rows.length} migration(s)...`);
  for (const row of appliedRes.rows) {
    const filePath = path.join(MIGRATIONS_DIR, row.name);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const { down } = parseMigration(content);

    if (down) {
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');
        console.log(`  ◀ Reverting ${row.name}...`);
        await client.query(down);
        await client.query('DELETE FROM schema_migrations WHERE name = $1', [row.name]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed reverting ${row.name}:`, err.message);
      } finally {
        client.release();
      }
    }
  }

  console.log('🚀 Re-applying all migrations from scratch...');
  await migrateUp();
}

// CLI Dispatcher
async function run() {
  const command = (process.argv[2] || 'up').toLowerCase();

  const connected = await db.connectDb();
  if (!connected) {
    throw new Error('PostgreSQL connection could not be established.');
  }

  switch (command) {
    case 'up':
      await migrateUp();
      break;
    case 'down':
      await migrateDown();
      break;
    case 'status':
      await migrateStatus();
      break;
    case 'reset':
      await migrateReset();
      break;
    default:
      console.error(`Unknown command: "${command}". Available: up, down, status, reset`);
      process.exit(1);
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration error:', err.message);
    process.exit(1);
  });

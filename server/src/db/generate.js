/**
 * Database Generator Script
 * Reads server/db/init.sql and executes it against PostgreSQL
 * Conforms to Data Definition Document (ddd.md)
 */

const fs = require('fs');
const path = require('path');
const db = require('../db');

async function generateDatabase() {
  console.log('🚀 Starting Database Generation based on ddd.md...');

  const sqlFilePath = path.join(__dirname, '../../db/init.sql');
  if (!fs.existsSync(sqlFilePath)) {
    throw new Error(`SQL file not found at: ${sqlFilePath}`);
  }

  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  const connected = await db.connectDb();
  if (!connected) {
    throw new Error('Could not establish connection to PostgreSQL. Ensure Docker container is running.');
  }

  console.log('📄 Executing DDL schemas and seed scripts from server/db/init.sql...');
  await db.query(sql);

  // Verification queries
  const usersRes = await db.query('SELECT COUNT(*) AS count FROM users');
  const annRes = await db.query('SELECT COUNT(*) AS count FROM announcements');
  const alumniRes = await db.query('SELECT COUNT(*) AS count FROM alumni');
  const jobsRes = await db.query('SELECT COUNT(*) AS count FROM job_postings');

  console.log('======================================================');
  console.log('✅ DATABASE SUCCESSFULLY GENERATED ACCORDING TO ddd.md');
  console.log('======================================================');
  console.log(`- users table:         ${usersRes.rows[0].count} records`);
  console.log(`- announcements table: ${annRes.rows[0].count} records`);
  console.log(`- alumni table:        ${alumniRes.rows[0].count} records`);
  console.log(`- job_postings table:  ${jobsRes.rows[0].count} records`);
  console.log('======================================================');
}

generateDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Database generation failed:', err.message);
    process.exit(1);
  });

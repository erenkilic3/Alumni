#!/usr/bin/env node

/**
 * Database Seed CLI Runner
 *
 * Usage:
 *   node src/db/seed.js                  # Default seed (appends/upserts core + 10 users, 8 ann, 10 alumni)
 *   node src/db/seed.js --clean          # Clean tables first, then seed fresh records
 *   node src/db/seed.js --users=20       # Custom count for users
 *   node src/db/seed.js --announcements=15 # Custom count for announcements
 *   node src/db/seed.js --alumni=20      # Custom count for alumni
 */

require('dotenv').config();
const db = require('../db');
const { DatabaseSeeder } = require('../seeders');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    clean: false,
    users: 10,
    announcements: 8,
    alumni: 10,
    jobs: 6,
    applications: 6
  };

  for (const arg of args) {
    if (arg === '--clean' || arg === '--fresh' || arg === '-c') {
      options.clean = true;
    } else if (arg.startsWith('--users=')) {
      options.users = parseInt(arg.split('=')[1], 10) || 10;
    } else if (arg.startsWith('--announcements=')) {
      options.announcements = parseInt(arg.split('=')[1], 10) || 8;
    } else if (arg.startsWith('--alumni=')) {
      options.alumni = parseInt(arg.split('=')[1], 10) || 10;
    } else if (arg.startsWith('--jobs=') || arg.startsWith('--job-postings=')) {
      options.jobs = parseInt(arg.split('=')[1], 10) || 6;
    } else if (arg.startsWith('--applications=')) {
      options.applications = parseInt(arg.split('=')[1], 10) || 6;
    } else if (arg.startsWith('--count=')) {
      const cnt = parseInt(arg.split('=')[1], 10) || 10;
      options.users = cnt;
      options.announcements = cnt;
      options.alumni = cnt;
      options.jobs = cnt;
      options.applications = cnt;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  const connected = await db.connectDb();
  if (!connected) {
    console.error('❌ Failed to connect to PostgreSQL. Seeding aborted.');
    process.exit(1);
  }

  try {
    await DatabaseSeeder.run(options);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err.message);
    process.exit(1);
  }
}

main();

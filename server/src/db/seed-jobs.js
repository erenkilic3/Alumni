#!/usr/bin/env node

/**
 * Job Postings & Applications Seed CLI Runner
 *
 * Usage:
 *   node src/db/seed-jobs.js                 # Seed core + 6 dynamic job postings
 *   node src/db/seed-jobs.js --count=10      # Seed 10 dynamic job postings
 *   node src/db/seed-jobs.js --with-apps     # Seed jobs + applications
 */

require('dotenv').config();
const db = require('../db');
const { JobPostingSeeder, ApplicationSeeder } = require('../seeders');
const { JobPostingModel, ApplicationModel } = require('../models');

async function main() {
  const args = process.argv.slice(2);
  let count = 6;
  let withApps = true;

  for (const arg of args) {
    if (arg.startsWith('--count=')) {
      count = parseInt(arg.split('=')[1], 10) || 6;
    } else if (arg === '--no-apps') {
      withApps = false;
    }
  }

  console.log('\n======================================================');
  console.log('         💼 SEEDING JOB POSTINGS & APPLICATIONS        ');
  console.log('======================================================');

  await db.connectDb();

  const jobRes = await JobPostingSeeder.run(count);
  console.log(`\n  ✅ Job Postings: ${jobRes.totalInserted} records prepared (Core: ${jobRes.coreCount}, Factory: ${jobRes.factoryCount})`);

  let appRes = null;
  if (withApps) {
    appRes = await ApplicationSeeder.run(count);
    console.log(`  ✅ Applications: ${appRes.totalInserted} records prepared (Core: ${appRes.coreCount}, Factory: ${appRes.factoryCount})`);
  }

  const jobsInModel = await JobPostingModel.findAll();
  const appsInModel = await ApplicationModel.findAll();

  console.log('\n------------------------------------------------------');
  console.log(`  Active Jobs in Store:         ${jobsInModel.length}`);
  console.log(`  Active Applications in Store: ${appsInModel.length}`);
  console.log('======================================================\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error during job postings seeding:', err);
  process.exit(1);
});

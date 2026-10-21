/**
 * Master Database Seeder
 *
 * Coordinates execution of individual seeders:
 * - UserSeeder
 * - AnnouncementSeeder
 * - AlumniSeeder
 *
 * Supports --clean / truncate option for idempotent, fresh seed runs.
 */

const db = require('../db');
const UserSeeder = require('./user.seeder');
const AnnouncementSeeder = require('./announcement.seeder');
const AlumniSeeder = require('./alumni.seeder');
const JobPostingSeeder = require('./job-posting.seeder');

class DatabaseSeeder {
  /**
   * Run all seeders
   * @param {Object} options
   * @param {boolean} [options.clean=false] Truncate existing data before seeding
   * @param {number} [options.users=10] Additional factory users to generate
   * @param {number} [options.announcements=8] Additional factory announcements to generate
   * @param {number} [options.alumni=10] Additional factory alumni to generate
   * @param {number} [options.jobs=6] Additional factory jobs to generate
   */
  async run(options = {}) {
    const {
      clean = false,
      users = 10,
      announcements = 8,
      alumni = 10,
      jobs = 6
    } = options;

    console.log('\n======================================================');
    console.log('            🌱 ALUMNISPHERE DATABASE SEEDER           ');
    console.log('======================================================');
    console.log(`Configuration: Clean: ${clean} | Users: +${users} | Announcements: +${announcements} | Alumni: +${alumni} | Jobs: +${jobs}`);
    console.log('------------------------------------------------------');

    const startTime = Date.now();

    if (clean && db.isDbConnected) {
      console.log('🧹 [Clean] Truncating existing tables (job_postings, alumni, announcements, users)...');
      try {
        await db.query('TRUNCATE TABLE job_postings, alumni, announcements, users CASCADE;');
        console.log('  ✅ Tables truncated successfully.');
      } catch (err) {
        console.warn('  ⚠️ Warning while truncating tables:', err.message);
      }
    }

    // 1. Run User Seeder
    const userRes = await UserSeeder.run(users);

    // 2. Run Announcement Seeder
    const annRes = await AnnouncementSeeder.run(announcements);

    // 3. Run Alumni Seeder
    const alumniRes = await AlumniSeeder.run(alumni);

    // 4. Run Job Posting Seeder
    const jobRes = await JobPostingSeeder.run(jobs);

    // Fetch final record counts
    let finalCounts = { users: 'N/A', announcements: 'N/A', alumni: 'N/A', jobs: 'N/A' };
    if (db.isDbConnected) {
      try {
        const u = await db.query('SELECT COUNT(*) AS count FROM users');
        const a = await db.query('SELECT COUNT(*) AS count FROM announcements');
        const al = await db.query('SELECT COUNT(*) AS count FROM alumni');
        const j = await db.query('SELECT COUNT(*) AS count FROM job_postings');
        finalCounts = {
          users: u.rows[0].count,
          announcements: a.rows[0].count,
          alumni: al.rows[0].count,
          jobs: j.rows[0].count
        };
      } catch (err) {
        // ignore count error
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('======================================================');
    console.log('             🎉 SEEDING COMPLETED SUCCESSFULLY         ');
    console.log('======================================================');
    console.log(`  Users In DB:         ${finalCounts.users} (seeded: ${userRes.totalInserted})`);
    console.log(`  Announcements In DB: ${finalCounts.announcements} (seeded: ${annRes.totalInserted})`);
    console.log(`  Alumni In DB:        ${finalCounts.alumni} (seeded: ${alumniRes.totalInserted})`);
    console.log(`  Jobs In DB:          ${finalCounts.jobs} (seeded: ${jobRes.totalInserted})`);
    console.log(`  Total Execution Time: ${duration}s`);
    console.log('======================================================\n');

    return {
      userRes,
      annRes,
      alumniRes,
      jobRes,
      finalCounts,
      duration
    };
  }
}

module.exports = new DatabaseSeeder();

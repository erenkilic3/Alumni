/**
 * Barrel export for database seeders
 */

const UserSeeder = require('./user.seeder');
const AnnouncementSeeder = require('./announcement.seeder');
const AlumniSeeder = require('./alumni.seeder');
const DatabaseSeeder = require('./database.seeder');

module.exports = {
  UserSeeder,
  AnnouncementSeeder,
  AlumniSeeder,
  DatabaseSeeder
};

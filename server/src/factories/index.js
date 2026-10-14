/**
 * Barrel export for all domain factories
 */

const BaseFactory = require('./base.factory');
const UserFactory = require('./user.factory');
const AnnouncementFactory = require('./announcement.factory');
const AlumniFactory = require('./alumni.factory');

module.exports = {
  BaseFactory,
  UserFactory,
  AnnouncementFactory,
  AlumniFactory
};

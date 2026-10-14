const UserModel = require('./user.model');
const AnnouncementModel = require('./announcement.model');
const AlumniModel = require('./alumni.model');

module.exports = {
  UserModel,
  User: UserModel,
  AnnouncementModel,
  Announcement: AnnouncementModel,
  AlumniModel,
  Alumni: AlumniModel
};


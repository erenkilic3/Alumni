const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const apiUserRoutes = require('./api-user.routes');
const announcementRoutes = require('./announcement.routes');
const apiAnnouncementRoutes = require('./api-announcement.routes');

router.use(userRoutes);
router.use(apiUserRoutes);
router.use(announcementRoutes);
router.use(apiAnnouncementRoutes);

module.exports = {
  router,
  userRoutes,
  apiUserRoutes,
  announcementRoutes,
  apiAnnouncementRoutes
};

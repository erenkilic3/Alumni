const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const apiUserRoutes = require('./api-user.routes');
const announcementRoutes = require('./announcement.routes');
const apiAnnouncementRoutes = require('./api-announcement.routes');
const alumniRoutes = require('./alumni.routes');
const apiAlumniRoutes = require('./api-alumni.routes');

router.use(userRoutes);
router.use(apiUserRoutes);
router.use(announcementRoutes);
router.use(apiAnnouncementRoutes);
router.use(alumniRoutes);
router.use(apiAlumniRoutes);

module.exports = {
  router,
  userRoutes,
  apiUserRoutes,
  announcementRoutes,
  apiAnnouncementRoutes,
  alumniRoutes,
  apiAlumniRoutes
};


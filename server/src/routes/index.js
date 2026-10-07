const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const apiUserRoutes = require('./api-user.routes');

router.use(userRoutes);
router.use(apiUserRoutes);

module.exports = {
  router,
  userRoutes,
  apiUserRoutes
};

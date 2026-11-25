const loggerMiddleware = require('./logger.middleware');
const guardian404Middleware = require('./guardian404.middleware');
const guardian5xxMiddleware = require('./guardian5xx.middleware');
const authMiddleware = require('./auth.middleware');

module.exports = {
  loggerMiddleware,
  guardian404Middleware,
  guardian404: guardian404Middleware,
  handle404Page: guardian404Middleware.handle404Page,
  guardian5xxMiddleware,
  guardian5xx: guardian5xxMiddleware,
  authMiddleware,
  requireAuth: authMiddleware.requireAuth,
  requireRole: authMiddleware.requireRole,
  requireOwnershipOrAdmin: authMiddleware.requireOwnershipOrAdmin,
  issueToken: authMiddleware.issueToken,
  verifyToken: authMiddleware.verifyToken,
  extractToken: authMiddleware.extractToken,
  revokeToken: authMiddleware.revokeToken
};

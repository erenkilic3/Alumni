const loggerMiddleware = require('./logger.middleware');
const guardian404Middleware = require('./guardian404.middleware');
const guardian5xxMiddleware = require('./guardian5xx.middleware');

module.exports = {
  loggerMiddleware,
  guardian404Middleware,
  guardian404: guardian404Middleware,
  guardian5xxMiddleware,
  guardian5xx: guardian5xxMiddleware
};

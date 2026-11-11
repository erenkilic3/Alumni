const loggerMiddleware = require('./logger.middleware');
const guardian404Middleware = require('./guardian404.middleware');

module.exports = {
  loggerMiddleware,
  guardian404Middleware,
  guardian404: guardian404Middleware
};

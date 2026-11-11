/**
 * Request Logger Middleware
 *
 * Logs incoming HTTP requests and response summaries to the terminal in the format:
 * <time> <method> <route> <restype> <duration>
 * Example:
 * 10.20.30 POST /user 201 18ms
 */

/**
 * Format a Date object into "HH.mm.ss"
 * @param {Date} [date=new Date()]
 * @returns {string} e.g. "10.20.30"
 */
function formatTime(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}.${minutes}.${seconds}`;
}

/**
 * Express middleware to log request details to the terminal upon response finish
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function loggerMiddleware(req, res, next) {
  const startHrTime = process.hrtime.bigint();
  const requestDate = new Date();

  res.on('finish', () => {
    const endHrTime = process.hrtime.bigint();
    const duration = Math.max(0, Math.round(Number(endHrTime - startHrTime) / 1e6));
    const time = formatTime(requestDate);
    const method = req.method;
    const route = req.originalUrl || req.url;
    const restype = res.statusCode;

    console.log(`${time} ${method} ${route} ${restype} ${duration}ms`);
  });

  next();
}

module.exports = loggerMiddleware;
module.exports.loggerMiddleware = loggerMiddleware;
module.exports.formatTime = formatTime;


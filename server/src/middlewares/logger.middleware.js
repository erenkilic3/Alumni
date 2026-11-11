/**
 * Request Logger Middleware
 *
 * Logs incoming HTTP requests and response summaries to the terminal in the format:
 * <time> <method> <route> <restype> <duration>
 * Example:
 * 10.20.30 POST /user 201 18ms
 *
 * Also writes error logs (status >= 400) into `logs/error.logs`.
 */

const fs = require('fs');
const path = require('path');

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
 * Get target paths for logs/error.logs (both project root and working directory if different)
 * @returns {string[]}
 */
function getErrorLogPaths() {
  const rootPath = path.resolve(__dirname, '../../../logs/error.logs');
  const cwdPath = path.resolve(process.cwd(), 'logs/error.logs');
  const paths = [rootPath];
  if (cwdPath !== rootPath) {
    paths.push(cwdPath);
  }
  return paths;
}

/**
 * Safely append a line to logs/error.logs file
 * @param {string} line
 */
function writeErrorLog(line) {
  const content = line.endsWith('\n') ? line : line + '\n';
  const targetPaths = getErrorLogPaths();

  for (const logPath of targetPaths) {
    try {
      const dir = path.dirname(logPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFile(logPath, content, (err) => {
        if (err) {
          console.error(`⚠️ Failed to write to error log file (${logPath}):`, err.message);
        }
      });
    } catch (e) {
      // Directory creation fallback
    }
  }
}

/**
 * Express middleware to log request details to the terminal upon response finish
 * and persist error responses (>= 400) to logs/error.logs.
 *
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

    const logLine = `${time} ${method} ${route} ${restype} ${duration}ms`;

    // 1. Output to terminal
    console.log(logLine);

    // 2. If status indicates client or server error (>= 400), write to logs/error.logs
    if (restype >= 400) {
      writeErrorLog(logLine);
    }
  });

  next();
}

module.exports = loggerMiddleware;
module.exports.loggerMiddleware = loggerMiddleware;
module.exports.formatTime = formatTime;
module.exports.writeErrorLog = writeErrorLog;
module.exports.getErrorLogPaths = getErrorLogPaths;

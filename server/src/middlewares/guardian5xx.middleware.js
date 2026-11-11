/**
 * 5xx Guardian Middleware
 *
 * Catches unhandled server exceptions, database failures, and gateway errors (500-599).
 * Returns structured error responses with an incident tracking ID and a clear reason,
 * protecting sensitive internal stack traces while providing helpful diagnostics.
 */

/**
 * Classify a 5xx error and determine its HTTP status code and descriptive reason
 * @param {Error|any} err
 * @param {import('express').Request} req
 * @returns {{ statusCode: number, errorName: string, reason: string }}
 */
function classify5xxError(err, req) {
  const method = req ? req.method : 'REQUEST';
  const route = req ? (req.originalUrl || req.url) : 'endpoint';

  // 1. JSON parse errors from body-parser (client 400, but guarded here if uncaught)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return {
      statusCode: 400,
      errorName: 'Bad Request',
      reason: `Malformed JSON payload received in request body: ${err.message}`
    };
  }

  // 2. Database connectivity or pool exhaustion
  if (
    err &&
    (err.code === 'ECONNREFUSED' ||
      err.code === '57P01' || // admin_shutdown
      err.code === '57P02' || // crash_shutdown
      err.code === '57P03' || // cannot_connect_now
      err.code === '08006' || // connection_failure
      err.message?.includes('Connection terminated') ||
      err.message?.includes('Client has already been connected'))
  ) {
    return {
      statusCode: 503,
      errorName: 'Service Unavailable',
      reason: `Database connectivity failure: The database cluster is temporarily unreachable or undergoing maintenance. Operation on '${method} ${route}' could not complete.`
    };
  }

  // 3. Network / Upstream / Socket timeouts
  if (
    err &&
    (err.code === 'ETIMEDOUT' ||
      err.code === 'ESOCKETTIMEDOUT' ||
      err.code === 'ECONNRESET' ||
      err.name === 'TimeoutError')
  ) {
    return {
      statusCode: 504,
      errorName: 'Gateway Timeout',
      reason: `Upstream connection timeout: The server timed out waiting for an external dependency while processing '${method} ${route}'.`
    };
  }

  // 4. Bad Gateway / Proxy issues
  if (err && (err.status === 502 || err.statusCode === 502)) {
    return {
      statusCode: 502,
      errorName: 'Bad Gateway',
      reason: `Bad gateway error: The server received an invalid response from an upstream backend service.`
    };
  }

  // 5. Explicit status code in 5xx range
  const explicitStatus = err.status || err.statusCode;
  if (typeof explicitStatus === 'number' && explicitStatus >= 500 && explicitStatus <= 599) {
    const errorNameMap = {
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return {
      statusCode: explicitStatus,
      errorName: errorNameMap[explicitStatus] || 'Server Error',
      reason: err.message || `An error occurred with HTTP status code ${explicitStatus}.`
    };
  }

  // 6. Generic unhandled internal server exception (500)
  const baseMessage = err && err.message ? err.message : 'Unknown internal runtime exception';
  return {
    statusCode: 500,
    errorName: 'Internal Server Error',
    reason: `An unexpected server exception occurred while processing '${method} ${route}': ${baseMessage}`
  };
}

/**
 * Render a styled HTML error page for browser requests
 * @param {number} statusCode
 * @param {string} errorName
 * @param {string} method
 * @param {string} route
 * @param {string} reason
 * @param {string} incidentId
 * @returns {string} HTML markup
 */
function render5xxHtml(statusCode, errorName, method, route, reason, incidentId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusCode} ${errorName} - AlumniSphere Guardian</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #090d16 0%, #1a0f1f 50%, #1e1b2e 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .guardian-card {
      background: rgba(30, 27, 46, 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(244, 63, 94, 0.25);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8);
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1;
      color: #f43f5e;
      margin-bottom: 0.5rem;
    }
    h2 {
      font-size: 1.35rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 1rem;
    }
    .route-chip {
      background: #0f172a;
      border: 1px solid #334155;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.95rem;
      color: #cbd5e1;
      display: inline-block;
      margin-bottom: 1.5rem;
      word-break: break-all;
    }
    .reason-box {
      background: rgba(15, 23, 42, 0.85);
      border-left: 4px solid #ef4444;
      padding: 1rem 1.25rem;
      border-radius: 0 10px 10px 0;
      text-align: left;
      margin-bottom: 1.5rem;
    }
    .reason-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #f87171;
      margin-bottom: 0.35rem;
    }
    .reason-text {
      color: #cbd5e1;
      font-size: 0.92rem;
      line-height: 1.5;
    }
    .incident-tag {
      font-size: 0.8rem;
      color: #94a3b8;
      font-family: monospace;
      margin-bottom: 1.75rem;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }
    .btn {
      padding: 0.7rem 1.25rem;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #f43f5e;
      color: white;
    }
    .btn-primary:hover {
      background: #e11d48;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #1e293b;
      border: 1px solid #334155;
      color: #94a3b8;
    }
    .btn-secondary:hover {
      color: white;
      border-color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="guardian-card">
    <div class="badge">5XX Guardian</div>
    <h1>${statusCode}</h1>
    <h2>${errorName}</h2>
    <div class="route-chip">${method} ${route}</div>
    
    <div class="reason-box">
      <div class="reason-title">Incident Reason</div>
      <div class="reason-text">${reason}</div>
    </div>

    <div class="incident-tag">Incident ID: <strong>${incidentId}</strong></div>

    <div class="actions">
      <a href="javascript:location.reload()" class="btn btn-primary">🔄 Retry Request</a>
      <a href="/" class="btn btn-secondary">🏠 Home</a>
      <a href="/api/health" class="btn btn-secondary">🩺 System Health</a>
      <a href="/api/swagger" class="btn btn-secondary">📖 API Docs</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 5xx Guardian Express Error-Handling Middleware
 * Intercepts uncaught exceptions and generates consistent, informative 5xx diagnostics.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function guardian5xxMiddleware(err, req, res, next) {
  const incidentId = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const { statusCode, errorName, reason } = classify5xxError(err, req);
  const method = req ? req.method : 'UNKNOWN';
  const route = req ? (req.originalUrl || req.url) : 'UNKNOWN';

  // Log diagnostic report to terminal for operators
  console.error(`🛡️ [5XX GUARDIAN] [${incidentId}] ${statusCode} ${method} ${route}`);
  console.error(`   Reason: ${reason}`);
  if (err && err.stack && process.env.NODE_ENV !== 'production') {
    console.error(`   Stack: ${err.stack.split('\n').slice(0, 4).join('\n')}`);
  }

  // Prevent sending headers if already sent
  if (res.headersSent) {
    return next(err);
  }

  const isBrowserHtml = req.headers &&
    req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    !req.headers.accept.includes('application/json') &&
    req.query?.format !== 'json' &&
    !route.startsWith('/api/');

  if (isBrowserHtml) {
    return res.status(statusCode).send(render5xxHtml(statusCode, errorName, method, route, reason, incidentId));
  }

  const responsePayload = {
    success: false,
    status: statusCode,
    error: errorName,
    reason,
    message: reason,
    incidentId,
    method,
    route,
    timestamp: new Date().toISOString(),
    support: '/api/health'
  };

  // Optionally include stack trace in development
  if (process.env.NODE_ENV === 'development' && err && err.stack) {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
}

module.exports = guardian5xxMiddleware;
module.exports.guardian5xxMiddleware = guardian5xxMiddleware;
module.exports.classify5xxError = classify5xxError;
module.exports.render5xxHtml = render5xxHtml;


/**
 * 404 Guardian Middleware
 *
 * Catches unhandled routes and returns standard 404 Not Found responses
 * with an informative and context-aware "reason".
 * Supports both JSON APIs and Server-Rendered HTML browser fallbacks.
 */

/**
 * Determine a descriptive reason why the 404 error occurred
 * @param {import('express').Request} req
 * @returns {string} Explanatory reason message
 */
function determine404Reason(req) {
  const method = req.method;
  const path = req.originalUrl || req.path || req.url;

  if (path.startsWith('/api/')) {
    const segments = path.replace('/api/', '').split(/[?#]/)[0].split('/').filter(Boolean);
    const resource = segments[0] ? segments[0].toLowerCase() : '';
    const knownResources = [
      'users', 'user',
      'announcements', 'announcement',
      'alumni',
      'jobs', 'job',
      'applications', 'application',
      'stats', 'health', 'swagger'
    ];

    if (knownResources.includes(resource)) {
      if (segments.length > 1) {
        return `Resource not found: The entity identified by '${segments[1]}' under '/api/${resource}' does not exist or has been removed.`;
      }
      return `Method not supported: The collection endpoint '/api/${resource}' does not accept HTTP ${method} requests.`;
    }

    return `Unrecognized API endpoint: '${method} ${path}' is not registered in the API routing table. Refer to /api/swagger for available endpoints.`;
  }

  return `Route not found: No page, asset, or controller is mapped to '${method} ${path}'. Verify URL path or check homepage navigation.`;
}

/**
 * Render a styled HTML 404 page for browser requests
 * @param {string} method
 * @param {string} route
 * @param {string} reason
 * @returns {string} HTML markup
 */
function render404Html(method, route, reason) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found - AlumniSphere Guardian</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .guardian-card {
      background: rgba(30, 41, 59, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      max-width: 580px;
      width: 100%;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
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
      color: #38bdf8;
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
      border-left: 4px solid #f59e0b;
      padding: 1rem 1.25rem;
      border-radius: 0 10px 10px 0;
      text-align: left;
      margin-bottom: 2rem;
    }
    .reason-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #f59e0b;
      margin-bottom: 0.35rem;
    }
    .reason-text {
      color: #cbd5e1;
      font-size: 0.92rem;
      line-height: 1.5;
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
      background: #0284c7;
      color: white;
    }
    .btn-primary:hover {
      background: #0369a1;
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
    <div class="badge">404 Guardian</div>
    <h1>404</h1>
    <h2>Resource Not Found</h2>
    <div class="route-chip">${method} ${route}</div>
    
    <div class="reason-box">
      <div class="reason-title">Reason</div>
      <div class="reason-text">${reason}</div>
    </div>

    <div class="actions">
      <a href="/" class="btn btn-primary">🏠 Home</a>
      <a href="/users" class="btn btn-secondary">👥 Users</a>
      <a href="/announcements" class="btn btn-secondary">📢 Announcements</a>
      <a href="/api/swagger" class="btn btn-secondary">📖 Swagger Docs</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 404 Guardian Middleware
 * Handles all unmatched routes and returns a structured 404 error with reason.
 */
function guardian404Middleware(req, res, next) {
  const reason = determine404Reason(req);
  const route = req.originalUrl || req.url;
  const method = req.method;

  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    !req.headers.accept.includes('application/json') &&
    req.query.format !== 'json' &&
    !route.startsWith('/api/');

  if (isBrowserHtml) {
    return res.status(404).send(render404Html(method, route, reason));
  }

  return res.status(404).json({
    success: false,
    status: 404,
    error: 'Not Found',
    reason,
    message: reason,
    method,
    route,
    timestamp: new Date().toISOString(),
    documentation: '/api/swagger'
  });
}

module.exports = guardian404Middleware;
module.exports.guardian404Middleware = guardian404Middleware;
module.exports.determine404Reason = determine404Reason;
module.exports.render404Html = render404Html;


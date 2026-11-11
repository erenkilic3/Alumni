/**
 * 404 Guardian Middleware & Generic 404 Page Handler
 *
 * Catches unhandled/invalid routes and:
 * 1. Serves a rich, generic 404 page on `/404` and `/not-found`.
 * 2. Redirects invalid web/browser requests to `/404` with route and reason parameters.
 * 3. Returns structured 404 JSON with descriptive reason for REST API clients.
 */

const NotFoundView = require('../views/not-found.view');

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
 * Route handler for GET /404 and GET /not-found
 * Serves the generic 404 page (or JSON when format=json or Accept: application/json)
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function handle404Page(req, res) {
  const route = req.query.route || req.query.from || req.query.path || '';
  const method = req.query.method || 'GET';
  const reason = req.query.reason || 'Aradığınız sayfa veya kaynak mevcut değil.';

  const wantsJson = (req.headers.accept &&
    req.headers.accept.includes('application/json') &&
    !req.headers.accept.includes('text/html')) ||
    req.query.format === 'json';

  if (wantsJson) {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      reason,
      message: reason,
      method,
      route: route || '/404',
      timestamp: new Date().toISOString(),
      documentation: '/api/swagger'
    });
  }

  return res.status(404).send(NotFoundView.renderNotFoundPage({
    route,
    method,
    reason
  }));
}

/**
 * 404 Guardian Middleware
 * Handles all unmatched routes and redirects invalid requests to the generic 404 page
 * or returns structured 404 JSON for REST API callers.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function guardian404Middleware(req, res, next) {
  const route = req.originalUrl || req.url;
  const path = (req.path || route.split('?')[0]).toLowerCase();

  // If already at /404 or /not-found, render page directly to prevent redirect loop
  if (path === '/404' || path === '/not-found') {
    return handle404Page(req, res);
  }

  const reason = determine404Reason(req);
  const method = req.method;

  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    !req.headers.accept.includes('application/json') &&
    req.query.format !== 'json';

  const isApiRequest = route.startsWith('/api/') ||
    (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html'));

  // 1. Browser navigation or general invalid web request -> Redirect to generic 404 page
  if (isBrowserHtml || !isApiRequest || req.query.redirect === 'true') {
    const redirectUrl = `/404?route=${encodeURIComponent(route)}&method=${encodeURIComponent(method)}&reason=${encodeURIComponent(reason)}`;
    return res.redirect(302, redirectUrl);
  }

  // 2. REST API Request -> Return structured 404 JSON with reason & redirect link
  return res.status(404).json({
    success: false,
    status: 404,
    error: 'Not Found',
    reason,
    message: reason,
    method,
    route,
    redirectUrl: `/404?route=${encodeURIComponent(route)}`,
    timestamp: new Date().toISOString(),
    documentation: '/api/swagger'
  });
}

module.exports = guardian404Middleware;
module.exports.guardian404Middleware = guardian404Middleware;
module.exports.handle404Page = handle404Page;
module.exports.determine404Reason = determine404Reason;

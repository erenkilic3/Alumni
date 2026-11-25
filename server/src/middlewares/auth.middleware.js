/**
 * Authentication & Authorization Middleware
 *
 * Implements token extraction/verification, session attachment (`req.user`),
 * token revocation on logout, and role/ownership guards aligned with ddd.md:
 * - `authMiddleware`: Non-blocking context attacher (`req.user`, `req.auth`)
 * - `requireAuth`: Blocks unauthenticated requests (401 JSON or /login redirect)
 * - `requireRole(...roles)`: Enforces RBAC role authorization (ADMIN, ALUMNI, STUDENT)
 * - `requireOwnershipOrAdmin(paramKey)`: Enforces resource ownership or ADMIN bypass
 */

const UserModel = require('../models/user.model');

const TOKEN_PREFIX = 'as_tok_';
const revokedTokens = new Set();

/**
 * Issue a bearer token for an authenticated user
 * @param {Object} user
 * @returns {string}
 */
function issueToken(user) {
  const payload = {
    id: String(user.id),
    email: String(user.email),
    role: String(user.role || 'STUDENT').toUpperCase(),
    iat: Date.now()
  };
  return TOKEN_PREFIX + Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

/**
 * Mark a token as revoked (used on logout)
 * @param {string|null} token
 * @returns {boolean}
 */
function revokeToken(token) {
  if (!token || typeof token !== 'string') return false;
  revokedTokens.add(token);
  return true;
}

/**
 * Check whether a token has been revoked
 * @param {string|null} token
 * @returns {boolean}
 */
function isTokenRevoked(token) {
  return Boolean(token && revokedTokens.has(token));
}

/**
 * Extract token from Authorization header, x-auth-token, query, or body
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  if (!req) return null;

  const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
  if (typeof authHeader === 'string' && authHeader.trim()) {
    const parts = authHeader.trim().split(/\s+/);
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1].trim();
    }
    if (parts.length === 1 && parts[0].startsWith(TOKEN_PREFIX)) {
      return parts[0];
    }
  }

  const headerToken = req.headers && (req.headers['x-auth-token'] || req.headers['X-Auth-Token']);
  if (typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.trim();
  }

  if (req.query && typeof req.query.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }

  if (req.body && typeof req.body.token === 'string' && req.body.token.trim()) {
    return req.body.token.trim();
  }

  return null;
}

/**
 * Decode and validate an issued token string
 * @param {string|null} token
 * @returns {{ id: string, email: string, role?: string, iat?: number } | null}
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.startsWith(TOKEN_PREFIX)) {
    return null;
  }
  if (isTokenRevoked(token)) {
    return null;
  }

  const rawPayload = token.slice(TOKEN_PREFIX.length);
  if (!rawPayload) return null;

  try {
    const decoded = Buffer.from(rawPayload, 'base64url').toString('utf8');
    if (decoded.startsWith('{')) {
      const parsed = JSON.parse(decoded);
      if (parsed && (parsed.id || parsed.email)) {
        return {
          id: parsed.id ? String(parsed.id) : null,
          email: parsed.email ? String(parsed.email) : null,
          role: parsed.role ? String(parsed.role).toUpperCase() : undefined,
          iat: parsed.iat
        };
      }
    }
  } catch (err) {
    // Fallback to base64 colon format below
  }

  try {
    const decodedLegacy = Buffer.from(rawPayload, 'base64').toString('utf8');
    if (decodedLegacy.startsWith('{')) {
      const parsed = JSON.parse(decodedLegacy);
      if (parsed && (parsed.id || parsed.email)) {
        return {
          id: parsed.id ? String(parsed.id) : null,
          email: parsed.email ? String(parsed.email) : null,
          role: parsed.role ? String(parsed.role).toUpperCase() : undefined,
          iat: parsed.iat
        };
      }
    }
    const sepIdx = decodedLegacy.indexOf(':');
    if (sepIdx > 0) {
      const id = decodedLegacy.slice(0, sepIdx);
      const email = decodedLegacy.slice(sepIdx + 1);
      if (id && email) {
        return { id: String(id), email: String(email) };
      }
    }
  } catch (err) {
    return null;
  }

  return null;
}

/**
 * Check whether the client prefers an HTML browser redirect instead of JSON
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function wantsBrowserHtml(req) {
  const path = req.originalUrl || req.url || '';
  if (path.startsWith('/api/')) return false;
  const accept = (req.headers && req.headers.accept) || '';
  return accept.includes('text/html') && !accept.includes('application/json');
}

/**
 * Attach `req.user` and `req.auth` when a valid token is present without blocking public routes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function authMiddleware(req, res, next) {
  req.user = null;
  req.auth = { isAuthenticated: false, token: null };

  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const claims = verifyToken(token);
    if (!claims) {
      req.auth = {
        isAuthenticated: false,
        token,
        revoked: isTokenRevoked(token)
      };
      return next();
    }

    let user = null;
    if (claims.id) {
      user = await UserModel.findById(claims.id).catch(() => null);
    }
    if (!user && claims.email) {
      user = await UserModel.findByEmail(claims.email).catch(() => null);
    }

    if (user) {
      req.user = user;
      req.auth = { isAuthenticated: true, token, claims };
    } else if (claims.id && claims.email) {
      req.user = {
        id: String(claims.id),
        email: String(claims.email),
        role: (claims.role || 'STUDENT').toUpperCase()
      };
      req.auth = { isAuthenticated: true, token, claims };
    }
  } catch (err) {
    // Non-blocking context resolution: fallback to unauthenticated state
  }

  return next();
}

/**
 * Require an authenticated user (`req.user`) on protected routes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function requireAuth(req, res, next) {
  if (!req.user) {
    await authMiddleware(req, res, () => {});
  }

  if (req.user) {
    return next();
  }

  if (wantsBrowserHtml(req)) {
    return res.redirect('/login');
  }

  const reason = req.auth && req.auth.revoked
    ? 'Session token has been revoked via logout. Please sign in again.'
    : 'Authentication required: Provide a valid Bearer token in the Authorization header or x-auth-token header.';

  return res.status(401).json({
    success: false,
    status: 401,
    error: 'Unauthorized',
    reason
  });
}

/**
 * Require one of the specified RBAC roles (`ADMIN`, `ALUMNI`, `STUDENT`)
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function requireRole(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

  return async (req, res, next) => {
    if (!req.user) {
      await authMiddleware(req, res, () => {});
    }

    if (!req.user) {
      if (wantsBrowserHtml(req)) {
        return res.redirect('/login');
      }
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Unauthorized',
        reason: 'Authentication required to access this resource.'
      });
    }

    const currentRole = String(req.user.role || 'STUDENT').toUpperCase();
    if (!normalizedAllowed.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        status: 403,
        error: 'Forbidden',
        reason: `Role '${currentRole}' is not authorized for this action. Required roles: ${normalizedAllowed.join(', ')}.`,
        requiredRoles: normalizedAllowed,
        currentRole
      });
    }

    return next();
  };
}

/**
 * Require the authenticated user to be the target resource owner (by route param) or `ADMIN`
 * @param {string} [paramKey='id']
 * @returns {import('express').RequestHandler}
 */
function requireOwnershipOrAdmin(paramKey = 'id') {
  return async (req, res, next) => {
    if (!req.user) {
      await authMiddleware(req, res, () => {});
    }

    if (!req.user) {
      if (wantsBrowserHtml(req)) {
        return res.redirect('/login');
      }
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Unauthorized',
        reason: 'Authentication required to access or modify this user-owned resource.'
      });
    }

    const currentRole = String(req.user.role || 'STUDENT').toUpperCase();
    const targetId = req.params ? req.params[paramKey] : undefined;

    if (currentRole === 'ADMIN' || (targetId !== undefined && String(req.user.id) === String(targetId))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      status: 403,
      error: 'Forbidden',
      reason: `Access denied: Only an ADMIN or resource owner (#${targetId}) may perform this action.`,
      requiredRoles: ['ADMIN'],
      currentRole
    });
  };
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.requireAuth = requireAuth;
module.exports.requireRole = requireRole;
module.exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
module.exports.issueToken = issueToken;
module.exports.verifyToken = verifyToken;
module.exports.extractToken = extractToken;
module.exports.revokeToken = revokeToken;
module.exports.isTokenRevoked = isTokenRevoked;

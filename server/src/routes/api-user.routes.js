const express = require('express');
const router = express.Router();
const { ApiUserController, UserController } = require('../controllers');

/**
 * ApiUser REST API Routes (JSON CRUD Endpoints)
 * Mapped to ApiUserController
 */

// Content-negotiating handler for /api/users (renders HTML if requested directly in a web browser)
const handleGetUsers = (req, res) => {
  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    req.query.format !== 'json' &&
    !req.headers.accept.includes('application/json');

  if (isBrowserHtml) {
    return UserController.index(req, res);
  }
  return ApiUserController.getAll(req, res);
};

const handleCreateUser = (req, res) => {
  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    !req.headers.accept.includes('application/json');

  if (isBrowserHtml) {
    return UserController.create(req, res);
  }
  return ApiUserController.create(req, res);
};

// GET /api/users - List all users (JSON with browser HTML fallback)
router.get('/api/users', handleGetUsers);

// POST /api/users - Create new user (JSON with browser form fallback)
router.post('/api/users', handleCreateUser);

// GET /api/users/count - Get total count of registered users
router.get('/api/users/count', ApiUserController.count);

// GET /api/user/:id & /api/users/:id - Query user by ID
router.get('/api/user/:id', ApiUserController.getById);
router.get('/api/users/:id', ApiUserController.getById);
router.get('/user/:id', ApiUserController.getById);

// PUT /api/user/:id & /api/users/:id - Full update of user by ID
router.put('/api/user/:id', ApiUserController.update);
router.put('/api/users/:id', ApiUserController.update);
router.put('/user/:id', ApiUserController.update);

// PATCH /api/user/:id & /api/users/:id - Partial update of user by ID
router.patch('/api/user/:id', ApiUserController.patch);
router.patch('/api/users/:id', ApiUserController.patch);
router.patch('/user/:id', ApiUserController.patch);

// DELETE /api/user/:id & /api/users/:id - Delete user by ID
router.delete('/api/user/:id', ApiUserController.delete);
router.delete('/api/users/:id', ApiUserController.delete);
router.delete('/user/:id', ApiUserController.delete);

module.exports = router;

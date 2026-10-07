const express = require('express');
const router = express.Router();
const { UserController } = require('../controllers');

/**
 * User Web Routes (HTML UI / SSR Views)
 * Mapped to UserController
 */

// GET /users - Render the interactive User Management Dashboard
router.get('/users', UserController.index);

// POST /users - Process Web Form User Registration
router.post('/users', UserController.create);

// GET /users/:id - Show details for a single user
router.get('/users/:id', UserController.show);

// PUT /users/:id - Update user attributes
router.put('/users/:id', UserController.update);

// PATCH /users/:id - Partially update user attributes
router.patch('/users/:id', UserController.update);

// DELETE /users/:id - Delete user from interface
router.delete('/users/:id', UserController.delete);

module.exports = router;

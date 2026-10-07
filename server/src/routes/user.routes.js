const express = require('express');
const router = express.Router();
const { UserController } = require('../controllers');

/**
 * ============================================================================
 * User Web Routes (View Layer Integration)
 * ============================================================================
 * Defines the 2 core web routes connected to UserController & UserView:
 * 
 * 1. GET  /users -> Users Listing (renders the User Management Dashboard view)
 * 2. POST /users -> Users Creating (processes web form submission & re-renders view)
 */

// Route 1: GET /users - Users Listing (View Layer)
router.get('/users', UserController.index);

// Route 2: POST /users - Users Creating (View Layer)
router.post('/users', UserController.create);

// Supplementary Web detail and mutation routes
router.get('/users/:id', UserController.show);
router.put('/users/:id', UserController.update);
router.patch('/users/:id', UserController.update);
router.delete('/users/:id', UserController.delete);

module.exports = router;

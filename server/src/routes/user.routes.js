const express = require('express');
const router = express.Router();
const { UserController } = require('../controllers');

/**
 * ============================================================================
 * User Web Routes (Full CRUD with View Layer)
 * ============================================================================
 * 
 * 1. CREATE:
 *    - GET  /users/new       -> Dedicated "Add New User" HTML form view
 *    - GET  /users/create    -> Alias for creation form view
 *    - POST /users           -> Process user creation and render view
 * 
 * 2. READ:
 *    - GET  /users           -> Render Users Listing Dashboard view
 *    - GET  /users/:id       -> Render User Details Profile view
 * 
 * 3. UPDATE:
 *    - GET  /users/:id/edit  -> Dedicated "Edit User" HTML form view
 *    - POST /users/:id       -> Process form update (HTML form support)
 *    - PUT  /users/:id       -> Process full update (REST/AJAX support)
 *    - PATCH /users/:id      -> Process partial update (REST/AJAX support)
 * 
 * 4. DELETE:
 *    - POST   /users/:id/delete -> Process deletion (HTML form support)
 *    - DELETE /users/:id        -> Process deletion (REST/AJAX support)
 */

// --- 1. READ ALL ---
router.get('/users', UserController.index);

// --- 2. CREATE (Must be declared before /users/:id to avoid parameter collision) ---
router.get('/users/new', UserController.new);
router.get('/users/create', UserController.new);
router.post('/users', UserController.create);

// --- 3. READ ONE ---
router.get('/users/:id', UserController.show);

// --- 4. UPDATE ---
router.get('/users/:id/edit', UserController.edit);
router.post('/users/:id', UserController.update);
router.put('/users/:id', UserController.update);
router.patch('/users/:id', UserController.update);

// --- 5. DELETE ---
router.post('/users/:id/delete', UserController.delete);
router.delete('/users/:id', UserController.delete);

module.exports = router;

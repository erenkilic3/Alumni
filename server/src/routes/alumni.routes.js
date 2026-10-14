const express = require('express');
const router = express.Router();
const { AlumniController } = require('../controllers');

/**
 * ============================================================================
 * Alumni Web Routes (Full CRUD with View Layer)
 * ============================================================================
 *
 * 1. CREATE:
 *    - GET  /alumni/new       -> Dedicated "Add New Alumni" HTML form view
 *    - GET  /alumni/create    -> Alias for creation form view
 *    - POST /alumni           -> Process creation and render/redirect
 *
 * 2. READ:
 *    - GET  /alumni           -> Render Alumni Listing Dashboard view
 *    - GET  /alumni/:id       -> Render Alumni Details Profile view
 *
 * 3. UPDATE:
 *    - GET  /alumni/:id/edit  -> Dedicated "Edit Alumni" HTML form view
 *    - POST /alumni/:id       -> Process form update (HTML form support)
 *    - PUT  /alumni/:id       -> Process full update (REST/AJAX support)
 *    - PATCH /alumni/:id      -> Process partial update (REST/AJAX support)
 *
 * 4. DELETE:
 *    - POST   /alumni/:id/delete -> Process deletion (HTML form support)
 *    - DELETE /alumni/:id        -> Process deletion (REST/AJAX support)
 */

// --- 1. READ ALL ---
router.get('/alumni', AlumniController.index);

// --- 2. CREATE (Must be declared before /alumni/:id to avoid parameter collision) ---
router.get('/alumni/new', AlumniController.new);
router.get('/alumni/create', AlumniController.new);
router.post('/alumni', AlumniController.create);

// --- 3. READ ONE ---
router.get('/alumni/:id', AlumniController.show);

// --- 4. UPDATE ---
router.get('/alumni/:id/edit', AlumniController.edit);
router.post('/alumni/:id', AlumniController.update);
router.put('/alumni/:id', AlumniController.update);
router.patch('/alumni/:id', AlumniController.update);

// --- 5. DELETE ---
router.post('/alumni/:id/delete', AlumniController.delete);
router.delete('/alumni/:id', AlumniController.delete);

module.exports = router;

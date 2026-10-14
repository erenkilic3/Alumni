const express = require('express');
const router = express.Router();
const { ApiAlumniController } = require('../controllers');

/**
 * ============================================================================
 * Alumni REST API Routes (JSON Endpoints)
 * ============================================================================
 *
 * 1. GET    /api/alumni        -> Retrieve all alumni (with query filters)
 * 2. GET    /api/alumni/count  -> Retrieve total alumni count
 * 3. GET    /api/alumni/:id    -> Retrieve a single alumni by ID
 * 4. POST   /api/alumni        -> Create a new alumni profile
 * 5. PUT    /api/alumni/:id    -> Full update of an alumni profile
 * 6. PATCH  /api/alumni/:id    -> Partial update of an alumni profile
 * 7. DELETE /api/alumni/:id    -> Delete an alumni profile
 */

// Count endpoint (must precede /:id)
router.get('/api/alumni/count', ApiAlumniController.count);

// Core CRUD endpoints
router.get('/api/alumni', ApiAlumniController.getAll);
router.post('/api/alumni', ApiAlumniController.create);
router.get('/api/alumni/:id', ApiAlumniController.getById);
router.put('/api/alumni/:id', ApiAlumniController.update);
router.patch('/api/alumni/:id', ApiAlumniController.patch);
router.delete('/api/alumni/:id', ApiAlumniController.delete);

module.exports = router;

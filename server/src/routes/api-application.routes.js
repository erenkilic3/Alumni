const express = require('express');
const router = express.Router();
const { ApiApplicationController } = require('../controllers');

/**
 * ============================================================================
 * Application REST API Routes (Direct Endpoints)
 * ============================================================================
 * Mapped to ApiApplicationController
 *
 * 1. GET    /api/applications/count   -> Total count of applications
 * 2. GET    /api/applications         -> Retrieve all applications (filterable)
 * 3. GET    /api/applications/:id     -> Retrieve single application by ID
 * 4. POST   /api/applications         -> Submit a new application
 * 5. PUT    /api/applications/:id     -> Full update of application
 * 6. PATCH  /api/applications/:id     -> Partial update of application
 * 7. DELETE /api/applications/:id     -> Delete / withdraw application
 */

// Count endpoint (must precede /:id)
router.get('/api/applications/count', ApiApplicationController.count);

// Direct collection endpoints
router.get('/api/applications', ApiApplicationController.getAll);
router.post('/api/applications', ApiApplicationController.create);

// Direct single resource endpoints (both plural and singular aliases)
router.get('/api/applications/:id', ApiApplicationController.getById);
router.get('/api/application/:id', ApiApplicationController.getById);

router.put('/api/applications/:id', ApiApplicationController.update);
router.put('/api/application/:id', ApiApplicationController.update);

router.patch('/api/applications/:id', ApiApplicationController.patch);
router.patch('/api/application/:id', ApiApplicationController.patch);

router.delete('/api/applications/:id', ApiApplicationController.delete);
router.delete('/api/application/:id', ApiApplicationController.delete);

module.exports = router;

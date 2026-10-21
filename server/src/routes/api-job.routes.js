const express = require('express');
const router = express.Router();
const { ApiJobController } = require('../controllers');

/**
 * ============================================================================
 * Job Posting REST API Routes (Direct Endpoints)
 * ============================================================================
 * Mapped to ApiJobController
 *
 * 1. GET    /api/jobs/count   -> Total count of job postings
 * 2. GET    /api/jobs         -> Retrieve all job postings (filterable)
 * 3. GET    /api/jobs/:id     -> Retrieve single job posting by ID
 * 4. POST   /api/jobs         -> Create a new job posting
 * 5. PUT    /api/jobs/:id     -> Full update of job posting
 * 6. PATCH  /api/jobs/:id     -> Partial update of job posting
 * 7. DELETE /api/jobs/:id     -> Delete job posting
 */

// Count endpoint (must precede /:id)
router.get('/api/jobs/count', ApiJobController.count);

// Direct collection endpoints
router.get('/api/jobs', ApiJobController.getAll);
router.post('/api/jobs', ApiJobController.create);

// Direct single resource endpoints (both plural and singular aliases)
router.get('/api/jobs/:id', ApiJobController.getById);
router.get('/api/job/:id', ApiJobController.getById);

router.put('/api/jobs/:id', ApiJobController.update);
router.put('/api/job/:id', ApiJobController.update);

router.patch('/api/jobs/:id', ApiJobController.patch);
router.patch('/api/job/:id', ApiJobController.patch);

router.delete('/api/jobs/:id', ApiJobController.delete);
router.delete('/api/job/:id', ApiJobController.delete);

module.exports = router;

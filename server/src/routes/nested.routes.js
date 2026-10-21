const express = require('express');
const router = express.Router();
const { NestedController } = require('../controllers');

/**
 * ============================================================================
 * Nested REST API Routes (Relational / Hierarchical Endpoints)
 * ============================================================================
 * Expresses domain relationships between entities:
 *
 * 1. USERS & ANNOUNCEMENTS (1:N)
 *    - GET  /api/users/:userId/announcements  -> List announcements published by user
 *    - POST /api/users/:userId/announcements  -> Create announcement under user
 *
 * 2. USERS & ALUMNI (1:1)
 *    - GET  /api/users/:userId/alumni         -> Get linked alumni profile
 *    - POST /api/users/:userId/alumni         -> Create / link alumni profile to user
 *
 * 3. USERS & JOB POSTINGS (1:N)
 *    - GET  /api/users/:userId/jobs           -> List job postings published by user
 *    - POST /api/users/:userId/jobs           -> Create job posting under user
 *
 * 4. ALUMNI & USERS (1:1)
 *    - GET  /api/alumni/:alumniId/user        -> Get associated system user account
 *
 * 5. ALUMNI & JOB POSTINGS (1:N)
 *    - GET  /api/alumni/:alumniId/jobs        -> List job postings referred by alumnus
 *    - POST /api/alumni/:alumniId/jobs        -> Create job posting referred by alumnus
 *
 * 6. JOB POSTINGS & USERS / ALUMNI
 *    - GET  /api/jobs/:jobId/user             -> Get user who posted this job
 *    - GET  /api/jobs/:jobId/alumni           -> Get alumnus who referred this job
 */

// 1. User -> Announcements
router.get('/api/users/:userId/announcements', NestedController.getUserAnnouncements);
router.post('/api/users/:userId/announcements', NestedController.createUserAnnouncement);

// 2. User -> Alumni
router.get('/api/users/:userId/alumni', NestedController.getUserAlumni);
router.post('/api/users/:userId/alumni', NestedController.createUserAlumni);

// 3. User -> Jobs
router.get('/api/users/:userId/jobs', NestedController.getUserJobs);
router.post('/api/users/:userId/jobs', NestedController.createUserJob);

// 4. Alumni -> User
router.get('/api/alumni/:alumniId/user', NestedController.getAlumniUser);

// 5. Alumni -> Jobs
router.get('/api/alumni/:alumniId/jobs', NestedController.getAlumniJobs);
router.post('/api/alumni/:alumniId/jobs', NestedController.createAlumniJob);

// 6. Job -> User & Alumni
router.get('/api/jobs/:jobId/user', NestedController.getJobUser);
router.get('/api/job/:jobId/user', NestedController.getJobUser);

router.get('/api/jobs/:jobId/alumni', NestedController.getJobAlumni);
router.get('/api/job/:jobId/alumni', NestedController.getJobAlumni);

module.exports = router;

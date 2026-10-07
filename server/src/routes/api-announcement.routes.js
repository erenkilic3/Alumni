const express = require('express');
const router = express.Router();
const { ApiAnnouncementController, AnnouncementController } = require('../controllers');

/**
 * ============================================================================
 * ApiAnnouncement REST API Routes (JSON CRUD Endpoints)
 * ============================================================================
 * Mapped to ApiAnnouncementController with content negotiation fallback
 */

// Content-negotiating handler for /api/announcements (renders HTML if requested directly in a web browser)
const handleGetAnnouncements = (req, res) => {
  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    req.query.format !== 'json' &&
    !req.headers.accept.includes('application/json');

  if (isBrowserHtml) {
    return AnnouncementController.index(req, res);
  }
  return ApiAnnouncementController.getAll(req, res);
};

const handleCreateAnnouncement = (req, res) => {
  const isBrowserHtml = req.headers.accept &&
    req.headers.accept.includes('text/html') &&
    !req.headers.accept.includes('application/json');

  if (isBrowserHtml) {
    return AnnouncementController.create(req, res);
  }
  return ApiAnnouncementController.create(req, res);
};

// GET /api/announcements - List all announcements
router.get('/api/announcements', handleGetAnnouncements);

// POST /api/announcements - Create new announcement
router.post('/api/announcements', handleCreateAnnouncement);

// GET /api/announcements/count - Count total announcements
router.get('/api/announcements/count', ApiAnnouncementController.count);

// GET /api/announcement/:id & /api/announcements/:id - Query single announcement
router.get('/api/announcement/:id', ApiAnnouncementController.getById);
router.get('/api/announcements/:id', ApiAnnouncementController.getById);

// PUT /api/announcement/:id & /api/announcements/:id - Completely update announcement
router.put('/api/announcement/:id', ApiAnnouncementController.update);
router.put('/api/announcements/:id', ApiAnnouncementController.update);

// PATCH /api/announcement/:id & /api/announcements/:id - Partially update announcement
router.patch('/api/announcement/:id', ApiAnnouncementController.patch);
router.patch('/api/announcements/:id', ApiAnnouncementController.patch);

// DELETE /api/announcement/:id & /api/announcements/:id - Delete announcement
router.delete('/api/announcement/:id', ApiAnnouncementController.delete);
router.delete('/api/announcements/:id', ApiAnnouncementController.delete);

module.exports = router;

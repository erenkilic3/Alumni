const express = require('express');
const router = express.Router();
const { AnnouncementController } = require('../controllers');

/**
 * ============================================================================
 * Announcement Web Routes (Full CRUD with View Layer)
 * ============================================================================
 * 
 * 1. READ ALL:
 *    - GET  /announcements        -> Render Announcement Management Interface
 * 
 * 2. CREATE:
 *    - GET  /announcements/new    -> Render Create Announcement Form View
 *    - GET  /announcements/create -> Alias for creation form view
 *    - POST /announcements        -> Process form submission & re-render view
 * 
 * 3. READ ONE:
 *    - GET  /announcements/:id    -> Render Announcement Detail View
 * 
 * 4. UPDATE:
 *    - GET  /announcements/:id/edit -> Render Edit Announcement Form View
 *    - POST /announcements/:id      -> Process form update (HTML form support)
 *    - PUT  /announcements/:id      -> Process full update (REST/AJAX support)
 *    - PATCH /announcements/:id     -> Process partial update (REST/AJAX support)
 * 
 * 5. DELETE:
 *    - POST   /announcements/:id/delete -> Process deletion (HTML form support)
 *    - DELETE /announcements/:id        -> Process deletion (REST/AJAX support)
 */

// --- 1. READ ALL ---
router.get('/announcements', AnnouncementController.index);

// --- 2. CREATE (Declared before /announcements/:id to prevent parameter collision) ---
router.get('/announcements/new', AnnouncementController.new);
router.get('/announcements/create', AnnouncementController.new);
router.post('/announcements', AnnouncementController.create);

// --- 3. READ ONE ---
router.get('/announcements/:id', AnnouncementController.show);

// --- 4. UPDATE ---
router.get('/announcements/:id/edit', AnnouncementController.edit);
router.post('/announcements/:id', AnnouncementController.update);
router.put('/announcements/:id', AnnouncementController.update);
router.patch('/announcements/:id', AnnouncementController.update);

// --- 5. DELETE ---
router.post('/announcements/:id/delete', AnnouncementController.delete);
router.delete('/announcements/:id', AnnouncementController.delete);

module.exports = router;

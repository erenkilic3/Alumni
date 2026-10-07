const AnnouncementModel = require('../models/announcement.model');

/**
 * ApiAnnouncementController
 *
 * RESTful API Controller for Announcement resources.
 * Handles pure JSON request/response workflows with standard HTTP status codes.
 */
class ApiAnnouncementController {
  constructor(model = AnnouncementModel) {
    this.model = model;

    // Bind methods to ensure correct 'this' context
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.count = this.count.bind(this);
  }

  /**
   * GET /api/announcements
   * Retrieve all announcements, with optional query filters:
   * ?category=EVENT&priority=URGENT&status=ACTIVE&search=alumni&isPinned=true
   */
  getAll(req, res) {
    try {
      const { category, priority, status, search, isPinned } = req.query;
      const announcements = this.model.findAll({ category, priority, status, search, isPinned });

      return res.status(200).json({
        success: true,
        count: announcements.length,
        announcements
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve announcements: ' + err.message
      });
    }
  }

  /**
   * GET /api/announcement/:id or GET /api/announcements/:id
   * Retrieve single announcement by ID
   */
  getById(req, res) {
    try {
      const { id } = req.params;
      const announcement = this.model.findById(id);

      if (!announcement) {
        return res.status(404).json({
          success: false,
          error: `Announcement not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        announcement
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve announcement: ' + err.message
      });
    }
  }

  /**
   * POST /api/announcements
   * Create a new announcement in memory
   */
  create(req, res) {
    try {
      const { title, content, category, priority, author, isPinned, status } = req.body || {};

      if (!title || !title.trim() || !content || !content.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required fields.'
        });
      }

      const newAnnouncement = this.model.create({
        title,
        content,
        category,
        priority,
        author,
        isPinned,
        status
      });

      return res.status(201).json({
        success: true,
        message: 'Announcement successfully created.',
        announcement: newAnnouncement,
        totalAnnouncements: this.model.count()
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * PUT /api/announcement/:id or PUT /api/announcements/:id
   * Completely update an existing announcement
   */
  update(req, res) {
    try {
      const { id } = req.params;
      const { title, content, category, priority, author, isPinned, status } = req.body || {};

      if (!title || !title.trim() || !content || !content.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required for a full update (PUT).'
        });
      }

      const updated = this.model.update(id, {
        title,
        content,
        category,
        priority,
        author,
        isPinned,
        status
      }, false);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Announcement not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Announcement #${id} updated successfully.`,
        announcement: updated
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * PATCH /api/announcement/:id or PATCH /api/announcements/:id
   * Partially update an existing announcement
   */
  patch(req, res) {
    try {
      const { id } = req.params;
      const updated = this.model.patch(id, req.body || {});

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Announcement not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Announcement #${id} partially updated.`,
        announcement: updated
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * DELETE /api/announcement/:id or DELETE /api/announcements/:id
   * Remove an announcement by ID
   */
  delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = this.model.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `Announcement not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Announcement #${id} (${deleted.title}) deleted successfully.`,
        deletedAnnouncement: deleted,
        remainingAnnouncements: this.model.count()
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * GET /api/announcements/count
   * Return total count of registered announcements
   */
  count(req, res) {
    try {
      const { category, priority, status } = req.query;
      return res.status(200).json({
        success: true,
        count: this.model.count({ category, priority, status })
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
}

// Export singleton instance as default, and class definition
const apiAnnouncementController = new ApiAnnouncementController();

module.exports = apiAnnouncementController;
module.exports.ApiAnnouncementController = ApiAnnouncementController;

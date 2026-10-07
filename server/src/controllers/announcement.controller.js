const AnnouncementModel = require('../models/announcement.model');
const { AnnouncementView } = require('../views');

/**
 * AnnouncementController
 *
 * Web/View Controller for Announcement management.
 * Coordinates between AnnouncementModel (Data Layer) and AnnouncementView (Presentation Layer).
 * Implements complete Web CRUD workflows:
 * - READ ALL:    index()  -> GET /announcements
 * - READ ONE:    show()   -> GET /announcements/:id
 * - CREATE FORM: new()    -> GET /announcements/new & GET /announcements/create
 * - CREATE POST: create() -> POST /announcements
 * - UPDATE FORM: edit()   -> GET /announcements/:id/edit
 * - UPDATE POST: update() -> PUT /announcements/:id, PATCH /announcements/:id, POST /announcements/:id
 * - DELETE:      delete() -> DELETE /announcements/:id, POST /announcements/:id/delete
 */
class AnnouncementController {
  constructor(model = AnnouncementModel, view = AnnouncementView) {
    this.model = model;
    this.view = view;

    // Bind methods for Express route dispatching
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.new = this.new.bind(this);
    this.create = this.create.bind(this);
    this.edit = this.edit.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * 1. READ ALL: GET /announcements
   * Renders the announcement management dashboard
   */
  index(req, res) {
    try {
      const { category, priority, status, search, isPinned } = req.query;
      const announcements = this.model.findAll({ category, priority, status, search, isPinned });
      const flashMsg = req.query.msg || null;
      return res.status(200).send(this.view.renderAnnouncementsList(announcements, flashMsg));
    } catch (err) {
      return res.status(500).send(this.view.renderAnnouncementsList([], null, `Error loading announcements: ${err.message}`));
    }
  }

  /**
   * 2. READ ONE: GET /announcements/:id
   * Displays single announcement detail view
   */
  show(req, res) {
    try {
      const { id } = req.params;
      const announcement = this.model.findById(id);

      if (!announcement) {
        return res.status(404).send(this.view.renderAnnouncementsList(this.model.findAll(), null, `Announcement #${id} not found.`));
      }

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, announcement });
      }

      const flashMsg = req.query.msg || null;
      return res.status(200).send(this.view.renderAnnouncementDetails(announcement, flashMsg));
    } catch (err) {
      return res.status(500).send(this.view.renderAnnouncementsList(this.model.findAll(), null, err.message));
    }
  }

  /**
   * 3. CREATE FORM: GET /announcements/new or GET /announcements/create
   * Renders the dedicated "Create Announcement" form view
   */
  new(req, res) {
    return res.status(200).send(this.view.renderCreateForm());
  }

  /**
   * 4. CREATE ACTION: POST /announcements
   * Processes form submission, adds announcement to store, and re-renders view
   */
  create(req, res) {
    const { title, content, category, priority, author, isPinned, status } = req.body || {};
    const wantsJson = req.headers.accept &&
      req.headers.accept.includes('application/json') &&
      !req.headers.accept.includes('text/html');

    if (!title || !title.trim() || !content || !content.trim()) {
      const errorMsg = 'Headline title and announcement content are required.';
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.view.renderCreateForm(req.body, null, errorMsg));
    }

    try {
      const newAnnouncement = this.model.create({
        title,
        content,
        category,
        priority,
        author,
        isPinned,
        status
      });

      if (wantsJson) {
        return res.status(201).json({
          success: true,
          message: 'Announcement published successfully.',
          announcement: newAnnouncement,
          totalAnnouncements: this.model.count()
        });
      }

      return res.status(201).send(
        this.view.renderAnnouncementsList(
          this.model.findAll(),
          `Announcement "${newAnnouncement.title}" published successfully!`
        )
      );
    } catch (err) {
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.view.renderCreateForm(req.body, null, err.message));
    }
  }

  /**
   * 5. UPDATE FORM: GET /announcements/:id/edit
   * Renders the dedicated "Edit Announcement" form view prefilled with current data
   */
  edit(req, res) {
    const { id } = req.params;
    const announcement = this.model.findById(id);

    if (!announcement) {
      return res.status(404).send(this.view.renderAnnouncementsList(this.model.findAll(), null, `Announcement #${id} not found.`));
    }

    return res.status(200).send(this.view.renderEditForm(announcement));
  }

  /**
   * 6. UPDATE ACTION: PUT /announcements/:id, PATCH /announcements/:id, or POST /announcements/:id
   * Processes update submission and renders the updated announcement detail view
   */
  update(req, res) {
    const { id } = req.params;
    const { title, content, category, priority, author, isPinned, status } = req.body || {};
    const isPartial = req.method === 'PATCH';
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    if (!isPartial && (!title || !content)) {
      const errorMsg = 'Both title and content are required fields.';
      const announcement = this.model.findById(id) || { id, title, content, category, priority, author };
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.view.renderEditForm(announcement, null, errorMsg));
    }

    try {
      const updated = this.model.update(id, {
        title,
        content,
        category,
        priority,
        author,
        isPinned,
        status
      }, isPartial);

      if (!updated) {
        const errorMsg = `Announcement #${id} not found.`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        return res.status(404).send(this.view.renderAnnouncementsList(this.model.findAll(), null, errorMsg));
      }

      if (wantsJson) {
        return res.json({
          success: true,
          message: `Announcement #${id} successfully updated.`,
          announcement: updated
        });
      }

      return res.status(200).send(
        this.view.renderAnnouncementDetails(updated, `Announcement #${id} was successfully updated!`)
      );
    } catch (err) {
      const announcement = this.model.findById(id) || { id, title, content, category, priority, author };
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.view.renderEditForm(announcement, null, err.message));
    }
  }

  /**
   * 7. DELETE ACTION: DELETE /announcements/:id or POST /announcements/:id/delete
   * Removes announcement and re-renders the listing view with a flash alert
   */
  delete(req, res) {
    const { id } = req.params;
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    try {
      const deleted = this.model.delete(id);

      if (!deleted) {
        const errorMsg = `Announcement #${id} not found.`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        return res.status(404).send(this.view.renderAnnouncementsList(this.model.findAll(), null, errorMsg));
      }

      if (wantsJson) {
        return res.json({
          success: true,
          message: `Announcement #${id} (${deleted.title}) successfully deleted.`,
          deletedAnnouncement: deleted,
          remainingAnnouncements: this.model.count()
        });
      }

      return res.status(200).send(
        this.view.renderAnnouncementsList(
          this.model.findAll(),
          `Announcement #${id} (${deleted.title}) was successfully deleted.`
        )
      );
    } catch (err) {
      if (wantsJson) {
        return res.status(500).json({ success: false, error: err.message });
      }
      return res.status(500).send(this.view.renderAnnouncementsList(this.model.findAll(), null, err.message));
    }
  }
}

// Export singleton instance as default, and class definition
const announcementController = new AnnouncementController();

module.exports = announcementController;
module.exports.AnnouncementController = AnnouncementController;

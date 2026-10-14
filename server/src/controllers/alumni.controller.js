const AlumniModel = require('../models/alumni.model');
const { AlumniView } = require('../views');

/**
 * AlumniController
 *
 * Web/View Controller for Alumni profile management.
 * Coordinates between AlumniModel (Data Layer) and AlumniView (Presentation Layer).
 * Implements complete Web CRUD workflows:
 * - READ ALL:    index()  -> GET /alumni
 * - READ ONE:    show()   -> GET /alumni/:id
 * - CREATE FORM: new()    -> GET /alumni/new
 * - CREATE POST: create() -> POST /alumni
 * - UPDATE FORM: edit()   -> GET /alumni/:id/edit
 * - UPDATE POST: update() -> PUT /alumni/:id, POST /alumni/:id
 * - DELETE:      delete() -> DELETE /alumni/:id, POST /alumni/:id/delete
 */
class AlumniController {
  constructor(model = AlumniModel, view = AlumniView) {
    this.model = model;
    this.view = view;

    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.new = this.new.bind(this);
    this.create = this.create.bind(this);
    this.edit = this.edit.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * 1. READ ALL: GET /alumni
   */
  async index(req, res) {
    try {
      const { department, year, mentorOnly, search } = req.query;
      const alumni = await this.model.findAll({ department, year, mentorOnly, search });
      const flashMsg = req.query.msg || null;
      return res.status(200).send(this.view.renderAlumniList(alumni, flashMsg));
    } catch (err) {
      return res.status(500).send(this.view.renderAlumniList([], null, `Error loading alumni: ${err.message}`));
    }
  }

  /**
   * 2. READ ONE: GET /alumni/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const alumni = await this.model.findById(id);

      if (!alumni) {
        const all = await this.model.findAll();
        return res.status(404).send(this.view.renderAlumniList(all, null, `Alumni profile #${id} not found.`));
      }

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, alumni });
      }

      const flashMsg = req.query.msg || null;
      return res.status(200).send(this.view.renderAlumniDetails(alumni, flashMsg));
    } catch (err) {
      const all = await this.model.findAll().catch(() => []);
      return res.status(500).send(this.view.renderAlumniList(all, null, err.message));
    }
  }

  /**
   * 3. CREATE FORM: GET /alumni/new
   */
  new(req, res) {
    return res.status(200).send(this.view.renderCreateForm());
  }

  /**
   * 4. CREATE ACTION: POST /alumni
   */
  async create(req, res) {
    const { name, graduationYear, department, company, role, location, industry, skills, avatar, isMentor, bio } = req.body || {};
    const wantsJson = req.headers.accept &&
      req.headers.accept.includes('application/json') &&
      !req.headers.accept.includes('text/html');

    if (!name || !name.trim() || !graduationYear || !department) {
      const errorMsg = 'Name, graduation year, and academic department are required.';
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.view.renderCreateForm(req.body, null, errorMsg));
    }

    try {
      const newAlumni = await this.model.create({
        name,
        graduationYear,
        department,
        company,
        role,
        location,
        industry,
        skills,
        avatar,
        isMentor: isMentor === 'true' || isMentor === true,
        bio
      });

      if (wantsJson) {
        return res.status(201).json({
          success: true,
          message: 'Alumni profile created successfully.',
          alumni: newAlumni
        });
      }

      return res.redirect(`/alumni?msg=${encodeURIComponent(`Successfully registered ${newAlumni.name} in the Alumni Network!`)}`);
    } catch (err) {
      if (wantsJson) {
        return res.status(500).json({ success: false, error: err.message });
      }
      return res.status(500).send(this.view.renderCreateForm(req.body, null, `Error creating profile: ${err.message}`));
    }
  }

  /**
   * 5. UPDATE FORM: GET /alumni/:id/edit
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      const alumni = await this.model.findById(id);

      if (!alumni) {
        const all = await this.model.findAll();
        return res.status(404).send(this.view.renderAlumniList(all, null, `Alumni #${id} not found.`));
      }

      return res.status(200).send(this.view.renderEditForm(alumni));
    } catch (err) {
      const all = await this.model.findAll().catch(() => []);
      return res.status(500).send(this.view.renderAlumniList(all, null, err.message));
    }
  }

  /**
   * 6. UPDATE ACTION: POST /alumni/:id or PUT /alumni/:id
   */
  async update(req, res) {
    const { id } = req.params;
    const { name, graduationYear, department, company, role, location, industry, skills, avatar, isMentor, bio } = req.body || {};
    const wantsJson = req.headers.accept &&
      req.headers.accept.includes('application/json') &&
      !req.headers.accept.includes('text/html');

    try {
      const updated = await this.model.update(id, {
        name,
        graduationYear,
        department,
        company,
        role,
        location,
        industry,
        skills,
        avatar,
        isMentor: isMentor === 'true' || isMentor === true,
        bio
      });

      if (!updated) {
        if (wantsJson) {
          return res.status(404).json({ success: false, error: `Alumni #${id} not found.` });
        }
        const all = await this.model.findAll();
        return res.status(404).send(this.view.renderAlumniList(all, null, `Alumni #${id} not found.`));
      }

      if (wantsJson) {
        return res.status(200).json({
          success: true,
          message: 'Alumni profile updated successfully.',
          alumni: updated
        });
      }

      return res.redirect(`/alumni/${id}?msg=${encodeURIComponent(`Profile for ${updated.name} updated successfully!`)}`);
    } catch (err) {
      if (wantsJson) {
        return res.status(500).json({ success: false, error: err.message });
      }
      return res.status(500).send(this.view.renderEditForm({ id, ...req.body }, null, `Update failed: ${err.message}`));
    }
  }

  /**
   * 7. DELETE ACTION: POST /alumni/:id/delete or DELETE /alumni/:id
   */
  async delete(req, res) {
    const { id } = req.params;
    const wantsJson = req.headers.accept &&
      req.headers.accept.includes('application/json') &&
      !req.headers.accept.includes('text/html');

    try {
      const deleted = await this.model.delete(id);

      if (!deleted) {
        if (wantsJson) {
          return res.status(404).json({ success: false, error: `Alumni #${id} not found.` });
        }
        const all = await this.model.findAll();
        return res.status(404).send(this.view.renderAlumniList(all, null, `Alumni #${id} not found.`));
      }

      if (wantsJson) {
        return res.status(200).json({
          success: true,
          message: `Alumni profile ${deleted.name} deleted successfully.`
        });
      }

      return res.redirect(`/alumni?msg=${encodeURIComponent(`Alumni profile "${deleted.name}" was permanently removed from database.`)}`);
    } catch (err) {
      if (wantsJson) {
        return res.status(500).json({ success: false, error: err.message });
      }
      const all = await this.model.findAll().catch(() => []);
      return res.status(500).send(this.view.renderAlumniList(all, null, `Delete failed: ${err.message}`));
    }
  }
}

module.exports = new AlumniController();

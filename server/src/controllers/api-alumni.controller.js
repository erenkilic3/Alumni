const AlumniModel = require('../models/alumni.model');

/**
 * ApiAlumniController
 *
 * RESTful API Controller for Alumni resources.
 * Handles pure JSON request/response workflows with standard HTTP status codes.
 */
class ApiAlumniController {
  constructor(model = AlumniModel) {
    this.model = model;

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.count = this.count.bind(this);
  }

  /**
   * GET /api/alumni
   */
  async getAll(req, res) {
    try {
      const { department, year, mentorOnly, search } = req.query;
      const alumni = await this.model.findAll({ department, year, mentorOnly, search });
      return res.status(200).json({
        success: true,
        count: alumni.length,
        alumni
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve alumni: ' + err.message
      });
    }
  }

  /**
   * GET /api/alumni/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const alumni = await this.model.findById(id);

      if (!alumni) {
        return res.status(404).json({
          success: false,
          error: `Alumni profile not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        alumni
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve alumni profile: ' + err.message
      });
    }
  }

  /**
   * POST /api/alumni
   */
  async create(req, res) {
    try {
      const { name, graduationYear, department, company, role, location, industry, skills, avatar, isMentor, bio } = req.body;

      if (!name || !graduationYear || !department) {
        return res.status(400).json({
          success: false,
          error: 'Name, graduationYear, and department are required.'
        });
      }

      const created = await this.model.create({
        name,
        graduationYear,
        department,
        company,
        role,
        location,
        industry,
        skills,
        avatar,
        isMentor,
        bio
      });

      return res.status(201).json({
        success: true,
        message: 'Alumni profile created successfully.',
        alumni: created,
        profile: created
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create alumni profile: ' + err.message
      });
    }
  }

  /**
   * PUT /api/alumni/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await this.model.update(id, req.body, false);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Alumni #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Alumni profile updated successfully.',
        alumni: updated
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update alumni: ' + err.message
      });
    }
  }

  /**
   * PATCH /api/alumni/:id
   */
  async patch(req, res) {
    try {
      const { id } = req.params;
      const updated = await this.model.patch(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Alumni #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Alumni profile partially updated.',
        alumni: updated
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to patch alumni: ' + err.message
      });
    }
  }

  /**
   * DELETE /api/alumni/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.model.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `Alumni #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Alumni profile ${deleted.name} deleted successfully.`
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete alumni: ' + err.message
      });
    }
  }

  /**
   * GET /api/alumni/count
   */
  async count(req, res) {
    try {
      const total = await this.model.count(req.query);
      return res.status(200).json({
        success: true,
        count: total
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve count: ' + err.message
      });
    }
  }
}

module.exports = new ApiAlumniController();

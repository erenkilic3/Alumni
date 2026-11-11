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
      const { name, graduationYear, department, company, role, location, industry, skills, avatar, isMentor, bio, userId } = req.body || {};

      if (!name || !String(name).trim() || graduationYear === undefined || graduationYear === null || graduationYear === '' || !department || !String(department).trim()) {
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
        bio,
        userId
      });

      return res.status(201).json({
        success: true,
        message: 'Alumni profile created successfully.',
        alumni: created,
        profile: created
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * PUT /api/alumni/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const body = req.body || {};
      if (!body.name || !String(body.name).trim() || body.graduationYear === undefined || body.graduationYear === null || body.graduationYear === '' || !body.department || !String(body.department).trim()) {
        return res.status(400).json({
          success: false,
          error: 'PUT request requires name, graduationYear, and department fields.'
        });
      }

      const updated = await this.model.update(id, body, false);

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
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * PATCH /api/alumni/:id
   */
  async patch(req, res) {
    try {
      const { id } = req.params;
      const body = req.body || {};
      const allowedFields = ['name', 'graduationYear', 'department', 'company', 'role', 'location', 'industry', 'skills', 'avatar', 'isMentor', 'bio', 'userId', 'user_id'];
      if (!allowedFields.some(f => body[f] !== undefined)) {
        return res.status(400).json({
          success: false,
          error: 'PATCH request requires at least one valid field to update.'
        });
      }

      const updated = await this.model.patch(id, body);

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
      return res.status(400).json({
        success: false,
        error: err.message
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

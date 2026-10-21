const ApplicationModel = require('../models/application.model');

/**
 * ApiApplicationController
 *
 * RESTful API Controller for Job Application resources (/api/applications).
 * Handles pure JSON request/response workflows with standard HTTP status codes.
 */
class ApiApplicationController {
  constructor(model = ApplicationModel) {
    this.model = model;

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.count = this.count.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * GET /api/applications
   * Retrieve all applications with optional filtering by status, jobId, userId, search
   */
  async getAll(req, res) {
    try {
      const { status, jobId, userId, search } = req.query;
      const applications = await this.model.findAll({ status, jobId, userId, search });

      return res.status(200).json({
        success: true,
        count: applications.length,
        applications
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve applications: ' + err.message
      });
    }
  }

  /**
   * GET /api/applications/:id or GET /api/application/:id
   * Retrieve a single application by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const application = await this.model.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          error: `Application not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        application
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve application: ' + err.message
      });
    }
  }

  /**
   * GET /api/applications/count
   * Retrieve total number of applications
   */
  async count(req, res) {
    try {
      const { status, jobId, userId } = req.query;
      const total = await this.model.count({ status, jobId, userId });
      return res.status(200).json({
        success: true,
        count: total
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve applications count: ' + err.message
      });
    }
  }

  /**
   * POST /api/applications
   * Submit a new job application
   */
  async create(req, res) {
    try {
      const {
        jobId,
        userId,
        applicantName,
        applicantEmail,
        resumeUrl,
        coverLetter,
        status
      } = req.body;

      if (!jobId || !userId || !applicantName || !applicantEmail) {
        return res.status(400).json({
          success: false,
          error: 'jobId, userId, applicantName, and applicantEmail are required fields.'
        });
      }

      const created = await this.model.create({
        jobId,
        userId,
        applicantName,
        applicantEmail,
        resumeUrl,
        coverLetter,
        status
      });

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        application: created
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create application: ' + err.message
      });
    }
  }

  /**
   * PUT /api/applications/:id or PUT /api/application/:id
   * Full update of an application
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await this.model.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Application #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Application updated successfully.',
        application: updated
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update application: ' + err.message
      });
    }
  }

  /**
   * PATCH /api/applications/:id or PATCH /api/application/:id
   * Partial update of an application (e.g. status transition)
   */
  async patch(req, res) {
    try {
      const { id } = req.params;
      const updated = await this.model.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Application #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Application partially updated.',
        application: updated
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to patch application: ' + err.message
      });
    }
  }

  /**
   * DELETE /api/applications/:id or DELETE /api/application/:id
   * Delete or withdraw an application
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.model.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `Application #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Application #${id} deleted successfully.`
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete application: ' + err.message
      });
    }
  }
}

module.exports = new ApiApplicationController();

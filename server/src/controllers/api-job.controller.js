const JobPostingModel = require('../models/job-posting.model');

/**
 * ApiJobController
 *
 * RESTful API Controller for Job Posting resources (/api/jobs).
 * Handles pure JSON request/response workflows with standard HTTP status codes.
 */
class ApiJobController {
  constructor(model = JobPostingModel) {
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
   * GET /api/jobs
   * Retrieve all jobs with optional filtering by type, company, status, search, userId, alumniId
   */
  async getAll(req, res) {
    try {
      const { type, company, status, search, userId, alumniId } = req.query;
      const jobs = await this.model.findAll({ type, company, status, search, userId, alumniId });

      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve job postings: ' + err.message
      });
    }
  }

  /**
   * GET /api/jobs/:id or GET /api/job/:id
   * Retrieve a single job posting by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const job = await this.model.findById(id);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: `Job posting not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        job
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve job posting: ' + err.message
      });
    }
  }

  /**
   * GET /api/jobs/count
   * Retrieve total number of job postings
   */
  async count(req, res) {
    try {
      const total = await this.model.count();
      return res.status(200).json({
        success: true,
        count: total
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve jobs count: ' + err.message
      });
    }
  }

  /**
   * POST /api/jobs
   * Create a new job posting
   */
  async create(req, res) {
    try {
      const {
        title,
        company,
        location,
        type,
        description,
        requirements,
        salaryRange,
        contactEmail,
        postedBy,
        userId,
        alumniId,
        deadline,
        status
      } = req.body || {};

      if (!title || !String(title).trim() || !company || !String(company).trim()) {
        return res.status(400).json({
          success: false,
          error: 'Title and company are required.'
        });
      }

      const created = await this.model.create({
        title,
        company,
        location,
        type,
        description,
        requirements,
        salaryRange,
        contactEmail,
        postedBy,
        userId,
        alumniId,
        deadline,
        status
      });

      return res.status(201).json({
        success: true,
        message: 'Job posting created successfully.',
        job: created
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * PUT /api/jobs/:id or PUT /api/job/:id
   * Full update of a job posting
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const body = req.body || {};
      if (!body.title || !String(body.title).trim() || !body.company || !String(body.company).trim()) {
        return res.status(400).json({
          success: false,
          error: 'PUT request requires both title and company fields.'
        });
      }

      const updated = await this.model.update(id, body, false);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Job posting #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Job posting updated successfully.',
        job: updated
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * PATCH /api/jobs/:id or PATCH /api/job/:id
   * Partial update of a job posting
   */
  async patch(req, res) {
    try {
      const { id } = req.params;
      const body = req.body || {};
      const allowedFields = [
        'title', 'company', 'location', 'type', 'description',
        'requirements', 'salaryRange', 'salary_range', 'contactEmail',
        'contact_email', 'postedBy', 'posted_by', 'userId', 'user_id',
        'alumniId', 'alumni_id', 'deadline', 'status'
      ];
      if (!allowedFields.some(f => body[f] !== undefined)) {
        return res.status(400).json({
          success: false,
          error: 'PATCH request requires at least one valid field to update.'
        });
      }

      const updated = await this.model.update(id, body, true);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Job posting #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Job posting partially updated.',
        job: updated
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * DELETE /api/jobs/:id or DELETE /api/job/:id
   * Delete a job posting by ID
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.model.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `Job posting #${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Job posting "${deleted.title}" deleted successfully.`
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete job posting: ' + err.message
      });
    }
  }
}

module.exports = new ApiJobController();

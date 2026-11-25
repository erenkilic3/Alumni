const UserModel = require('../models/user.model');
const AlumniModel = require('../models/alumni.model');

/**
 * ApiUserController
 *
 * RESTful API Controller for User resources.
 * Handles pure JSON request/response workflows with standard HTTP status codes.
 */
class ApiUserController {
  constructor(model = UserModel) {
    this.model = model;

    // Bind methods to ensure correct 'this' context when used as route handlers
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.register = this.register.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.count = this.count.bind(this);
  }

  /**
   * GET /api/users
   * Retrieve all users, optionally filtered by role, department, or search query
   */
  async getAll(req, res) {
    try {
      const { role, department, search } = req.query;
      const users = await this.model.findAll({ role, department, search });

      return res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve users: ' + err.message
      });
    }
  }

  /**
   * GET /api/users/:id or GET /api/user/:id
   * Retrieve a single user by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await this.model.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        user
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve user: ' + err.message
      });
    }
  }

  /**
   * POST /api/users
   * Create a new user
   */
  async create(req, res) {
    try {
      const { name, email, role, department } = req.body || {};

      if (!name || !name.trim() || !email || !email.trim()) {
        return res.status(400).json({
          success: false,
          error: 'name and email fields are required.'
        });
      }

      const newUser = await this.model.create({ name, email, role, department });
      const totalUsers = await this.model.count();

      return res.status(201).json({
        success: true,
        message: 'User created successfully.',
        user: newUser,
        totalUsers
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * PUT /api/user/:id or PUT /api/users/:id
   * Fully update a user (requires both name and email)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, department } = req.body || {};
      const isPartial = req.method === 'PATCH';

      // Full update (PUT) requires name and email
      if (!isPartial && (!name || !String(name).trim() || !email || !String(email).trim())) {
        return res.status(400).json({
          success: false,
          error: 'PUT request requires both "name" and "email" fields.'
        });
      }

      if (isPartial && name === undefined && email === undefined && role === undefined && department === undefined) {
        return res.status(400).json({
          success: false,
          error: 'PATCH request requires at least one field to update (name, email, role, department).'
        });
      }

      const updatedUser = await this.model.update(
        id,
        { name, email, role, department },
        isPartial
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        message: `User #${id} updated successfully via ${req.method}.`,
        method: req.method,
        user: updatedUser
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * PATCH /api/user/:id or PATCH /api/users/:id
   * Partially update user attributes
   */
  async patch(req, res) {
    return this.update(req, res);
  }

  /**
   * DELETE /api/users/:id or DELETE /api/user/:id
   * Delete a user
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await this.model.delete(id);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${id})`
        });
      }

      const remainingUsers = await this.model.count();

      return res.status(200).json({
        success: true,
        message: `User #${id} (${deletedUser.name}) deleted successfully.`,
        deletedUser,
        remainingUsers
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user: ' + err.message
      });
    }
  }

  /**
   * GET /api/users/count
   * Return the total count of registered users
   */
  async count(req, res) {
    try {
      const count = await this.model.count();
      return res.status(200).json({
        success: true,
        count
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to count users: ' + err.message
      });
    }
  }

  /**
   * POST /api/register or POST /register
   * Register a new user account and optionally create linked 1:1 alumni profile
   */
  async register(req, res) {
    try {
      const {
        name,
        email,
        password,
        confirmPassword,
        role,
        department,
        graduationYear,
        company,
        jobTitle,
        location,
        industry,
        skills,
        isMentor,
        bio
      } = req.body || {};

      if (!name || !String(name).trim() || !email || !String(email).trim()) {
        return res.status(400).json({
          success: false,
          error: 'Full name and email address are required.'
        });
      }

      if (password !== undefined && password !== null && String(password).length > 0) {
        if (String(password).length < 6) {
          return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long.'
          });
        }
        if (confirmPassword !== undefined && String(password) !== String(confirmPassword)) {
          return res.status(400).json({
            success: false,
            error: 'Passwords do not match.'
          });
        }
      }

      const allowedRoles = ['ADMIN', 'ALUMNI', 'STUDENT'];
      const requestedRole = role ? String(role).trim().toUpperCase() : 'STUDENT';
      if (!allowedRoles.includes(requestedRole)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role "${role}". Allowed roles: ${allowedRoles.join(', ')}.`
        });
      }

      const newUser = await this.model.create({
        name: String(name).trim(),
        email: String(email).trim(),
        role: requestedRole,
        department: department && String(department).trim() ? String(department).trim() : 'Belirtilmedi'
      });

      let alumniProfile = null;
      const shouldCreateAlumni =
        newUser.role === 'ALUMNI' &&
        (graduationYear || company || jobTitle || skills || bio || isMentor !== undefined);

      if (newUser.role === 'ALUMNI' || shouldCreateAlumni) {
        alumniProfile = await AlumniModel.create({
          name: newUser.name,
          graduationYear: Number(graduationYear) || 2024,
          department: newUser.department,
          company: company && String(company).trim() ? String(company).trim() : 'Freelance / Independent',
          role: jobTitle && String(jobTitle).trim() ? String(jobTitle).trim() : 'Alumni Member',
          location: location && String(location).trim() ? String(location).trim() : 'Remote',
          industry: industry && String(industry).trim() ? String(industry).trim() : 'Technology',
          skills: skills || '',
          isMentor: Boolean(isMentor),
          bio: bio ? String(bio).trim() : '',
          userId: newUser.id
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Registration completed successfully.',
        user: newUser,
        alumniProfile
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}

// Export singleton instance as default, and class definition
const apiUserController = new ApiUserController();

module.exports = apiUserController;
module.exports.ApiUserController = ApiUserController;

const UserModel = require('../models/user.model');

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
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.count = this.count.bind(this);
  }

  /**
   * GET /api/users
   * Retrieve all users, optionally filtered by role, department, or search query
   */
  getAll(req, res) {
    try {
      const { role, department, search } = req.query;
      const users = this.model.findAll({ role, department, search });

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
  getById(req, res) {
    try {
      const { id } = req.params;
      const user = this.model.findById(id);

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
   * Create a new user in the in-memory store
   */
  create(req, res) {
    try {
      const { name, email, role, department } = req.body || {};

      if (!name || !name.trim() || !email || !email.trim()) {
        return res.status(400).json({
          success: false,
          error: 'name and email fields are required.'
        });
      }

      const newUser = this.model.create({ name, email, role, department });

      return res.status(201).json({
        success: true,
        message: 'User created successfully without database (in-memory).',
        user: newUser,
        totalUsers: this.model.count()
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
  update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, department } = req.body || {};
      const isPartial = req.method === 'PATCH';

      // Full update (PUT) requires name and email
      if (!isPartial && (!name || !email)) {
        return res.status(400).json({
          success: false,
          error: 'PUT request requires both "name" and "email" fields.'
        });
      }

      const updatedUser = this.model.update(
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
  patch(req, res) {
    return this.update(req, res);
  }

  /**
   * DELETE /api/users/:id or DELETE /api/user/:id
   * Delete a user from the in-memory store
   */
  delete(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = this.model.delete(id);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${id})`
        });
      }

      return res.status(200).json({
        success: true,
        message: `User #${id} (${deletedUser.name}) deleted successfully.`,
        deletedUser,
        remainingUsers: this.model.count()
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
  count(req, res) {
    return res.status(200).json({
      success: true,
      count: this.model.count()
    });
  }
}

// Export singleton instance as default, and class definition
const apiUserController = new ApiUserController();

module.exports = apiUserController;
module.exports.ApiUserController = ApiUserController;

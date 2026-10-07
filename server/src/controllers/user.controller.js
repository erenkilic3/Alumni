const UserModel = require('../models/user.model');
const { UserView } = require('../views');

/**
 * UserController
 *
 * Web/View Controller for User management.
 * Coordinates between UserModel (Data Layer) and UserView (Presentation/View Layer).
 * Handles:
 * - GET /users  (Users Listing View)
 * - POST /users (Users Creating Action & View Render)
 */
class UserController {
  constructor(model = UserModel, view = UserView) {
    this.model = model;
    this.view = view;

    // Bind methods for Express route dispatching
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.renderUsersPage = this.renderUsersPage.bind(this);
  }

  /**
   * Helper proxy for view escaping
   */
  escapeHtml(str) {
    return this.view.escapeHtml(str);
  }

  /**
   * Delegate HTML rendering to the View Layer (maintains backward compatibility)
   */
  renderUsersPage(users, message = null, error = null) {
    return this.view.renderUsersList(users, message, error);
  }

  /**
   * GET /users or browser GET /api/users
   * Route 1: Users Listing View
   * Retrieves users from the model and renders the user management dashboard view
   */
  index(req, res) {
    try {
      const users = this.model.findAll();
      return res.status(200).send(this.view.renderUsersList(users));
    } catch (err) {
      return res.status(500).send(this.view.renderUsersList([], null, `Error loading users: ${err.message}`));
    }
  }

  /**
   * GET /users/:id
   * READ ONE: Display single user view or return JSON
   */
  show(req, res) {
    try {
      const { id } = req.params;
      const user = this.model.findById(id);

      if (!user) {
        return res.status(404).send(this.view.renderUsersList(this.model.findAll(), null, `User not found (ID: #${id})`));
      }

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, user });
      }

      return res.status(200).send(this.view.renderUsersList([user], `Viewing single user: ${user.name}`));
    } catch (err) {
      return res.status(500).send(this.view.renderUsersList(this.model.findAll(), null, err.message));
    }
  }

  /**
   * POST /users or browser form POST /api/users
   * Route 2: Users Creating View / Action
   * Processes form submission, creates new user, and re-renders view with success notification
   */
  create(req, res) {
    const { name, email, role, department } = req.body || {};
    const wantsJson = req.headers.accept &&
      req.headers.accept.includes('application/json') &&
      !req.headers.accept.includes('text/html');

    if (!name || !name.trim() || !email || !email.trim()) {
      const errorMsg = 'Full name and email address are required fields.';
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.view.renderUsersList(this.model.findAll(), null, errorMsg));
    }

    try {
      const newUser = this.model.create({ name, email, role, department });

      if (wantsJson) {
        return res.status(201).json({
          success: true,
          message: 'User successfully created in-memory without a database.',
          user: newUser,
          totalUsers: this.model.count()
        });
      }

      return res.status(201).send(
        this.view.renderUsersList(this.model.findAll(), `User "${newUser.name}" was successfully registered!`)
      );
    } catch (err) {
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.view.renderUsersList(this.model.findAll(), null, err.message));
    }
  }

  /**
   * PUT /users/:id or PATCH /users/:id
   * UPDATE: Process update request and return response or updated view
   */
  update(req, res) {
    const { id } = req.params;
    const { name, email, role, department } = req.body || {};
    const isPartial = req.method === 'PATCH';
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    if (!isPartial && (!name || !email)) {
      const errorMsg = 'PUT request requires both name and email fields.';
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.view.renderUsersList(this.model.findAll(), null, errorMsg));
    }

    try {
      const updatedUser = this.model.update(id, { name, email, role, department }, isPartial);

      if (!updatedUser) {
        const errorMsg = `User not found (ID: ${id})`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        return res.status(404).send(this.view.renderUsersList(this.model.findAll(), null, errorMsg));
      }

      if (wantsJson) {
        return res.json({
          success: true,
          message: `User #${id} successfully updated via ${req.method}.`,
          method: req.method,
          user: updatedUser
        });
      }

      return res.status(200).send(this.view.renderUsersList(this.model.findAll(), `User #${id} was successfully updated.`));
    } catch (err) {
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.view.renderUsersList(this.model.findAll(), null, err.message));
    }
  }

  /**
   * DELETE /users/:id
   * DELETE: Remove user and render updated interface or return JSON
   */
  delete(req, res) {
    const { id } = req.params;
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    try {
      const deletedUser = this.model.delete(id);

      if (!deletedUser) {
        const errorMsg = `User not found (ID: ${id})`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        return res.status(404).send(this.view.renderUsersList(this.model.findAll(), null, errorMsg));
      }

      if (wantsJson) {
        return res.json({
          success: true,
          message: `User #${id} (${deletedUser.name}) successfully deleted.`,
          deletedUser,
          remainingUsers: this.model.count()
        });
      }

      return res.status(200).send(this.view.renderUsersList(this.model.findAll(), `User #${id} (${deletedUser.name}) was successfully removed.`));
    } catch (err) {
      if (wantsJson) {
        return res.status(500).json({ success: false, error: err.message });
      }
      return res.status(500).send(this.view.renderUsersList(this.model.findAll(), null, err.message));
    }
  }
}

// Export singleton instance as default, and class definition
const userController = new UserController();

module.exports = userController;
module.exports.UserController = UserController;

const UserModel = require('../models/user.model');
const { UserView } = require('../views');

/**
 * UserController
 *
 * Web/View Controller for User management.
 * Coordinates between UserModel (Data Layer) and UserView (Presentation/View Layer).
 * Implements complete CRUD operations:
 * - READ ALL:    index()   -> GET /users
 * - READ ONE:    show()    -> GET /users/:id
 * - CREATE FORM: new()     -> GET /users/new & GET /users/create
 * - CREATE POST: create()  -> POST /users
 * - UPDATE FORM: edit()    -> GET /users/:id/edit
 * - UPDATE POST: update()  -> PUT /users/:id, PATCH /users/:id, POST /users/:id
 * - DELETE:      delete()  -> DELETE /users/:id, POST /users/:id/delete
 */
class UserController {
  constructor(model = UserModel, view = UserView) {
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
   * 1. READ ALL: GET /users or browser GET /api/users
   * Retrieves users from the model and renders the user management dashboard view
   */
  index(req, res) {
    try {
      const users = this.model.findAll();
      const flashMsg = req.query.msg || null;
      return res.status(200).send(this.view.renderUsersList(users, flashMsg));
    } catch (err) {
      return res.status(500).send(this.view.renderUsersList([], null, `Error loading users: ${err.message}`));
    }
  }

  /**
   * 2. READ ONE: GET /users/:id
   * Displays the dedicated profile card view for a single user
   */
  show(req, res) {
    try {
      const { id } = req.params;
      const user = this.model.findById(id);

      if (!user) {
        return res.status(404).send(this.view.renderUsersList(this.model.findAll(), null, `User #${id} not found.`));
      }

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, user });
      }

      const flashMsg = req.query.msg || null;
      return res.status(200).send(this.view.renderUserDetails(user, flashMsg));
    } catch (err) {
      return res.status(500).send(this.view.renderUsersList(this.model.findAll(), null, err.message));
    }
  }

  /**
   * 3. CREATE FORM: GET /users/new or GET /users/create
   * Renders the dedicated "Add New User" HTML form view
   */
  new(req, res) {
    return res.status(200).send(this.view.renderCreateForm());
  }

  /**
   * 4. CREATE ACTION: POST /users
   * Processes form submission, creates new user in model, and renders response
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
      return res.status(400).send(this.view.renderCreateForm(req.body, null, errorMsg));
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

      // Re-render user listing with success banner
      return res.status(201).send(
        this.view.renderUsersList(this.model.findAll(), `User "${newUser.name}" was successfully registered!`)
      );
    } catch (err) {
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.view.renderCreateForm(req.body, null, err.message));
    }
  }

  /**
   * 5. UPDATE FORM: GET /users/:id/edit
   * Renders the dedicated "Edit User" HTML form view prefilled with current user attributes
   */
  edit(req, res) {
    const { id } = req.params;
    const user = this.model.findById(id);

    if (!user) {
      return res.status(404).send(this.view.renderUsersList(this.model.findAll(), null, `User #${id} not found.`));
    }

    return res.status(200).send(this.view.renderEditForm(user));
  }

  /**
   * 6. UPDATE ACTION: PUT /users/:id, PATCH /users/:id, or POST /users/:id
   * Processes update submission, updates model, and renders the updated profile view
   */
  update(req, res) {
    const { id } = req.params;
    const { name, email, role, department } = req.body || {};
    const isPartial = req.method === 'PATCH';
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    if (!isPartial && (!name || !email)) {
      const errorMsg = 'Full name and email address are required fields.';
      const user = this.model.findById(id) || { id, name, email, role, department };
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.view.renderEditForm(user, null, errorMsg));
    }

    try {
      const updatedUser = this.model.update(id, { name, email, role, department }, isPartial);

      if (!updatedUser) {
        const errorMsg = `User #${id} not found.`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        return res.status(404).send(this.view.renderUsersList(this.model.findAll(), null, errorMsg));
      }

      if (wantsJson) {
        return res.json({
          success: true,
          message: `User #${id} successfully updated.`,
          user: updatedUser
        });
      }

      // Render updated profile view with success message
      return res.status(200).send(
        this.view.renderUserDetails(updatedUser, `User #${id} (${updatedUser.name}) was successfully updated!`)
      );
    } catch (err) {
      const user = this.model.findById(id) || { id, name, email, role, department };
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.view.renderEditForm(user, null, err.message));
    }
  }

  /**
   * 7. DELETE ACTION: DELETE /users/:id or POST /users/:id/delete
   * Removes user from the model and re-renders the user listing dashboard view
   */
  delete(req, res) {
    const { id } = req.params;
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    try {
      const deletedUser = this.model.delete(id);

      if (!deletedUser) {
        const errorMsg = `User #${id} not found.`;
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

      // Re-render user listing view with deletion confirmation
      return res.status(200).send(
        this.view.renderUsersList(this.model.findAll(), `User #${id} (${deletedUser.name}) was successfully deleted.`)
      );
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

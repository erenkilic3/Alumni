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
   * Delegate HTML rendering to the View Layer
   */
  renderUsersPage(users, message = null, error = null) {
    return this.view.renderUsersList(users, message, error);
  }

  /**
   * 1. READ ALL: GET /users or browser GET /api/users
   */
  async index(req, res) {
    try {
      const users = await this.model.findAll();
      const flashMsg = req.query.msg || null;
      return res.status(200).send(this.view.renderUsersList(users, flashMsg));
    } catch (err) {
      return res.status(500).send(this.view.renderUsersList([], null, `Error loading users: ${err.message}`));
    }
  }

  /**
   * 2. READ ONE: GET /users/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const user = await this.model.findById(id);

      if (!user) {
        const allUsers = await this.model.findAll();
        return res.status(404).send(this.view.renderUsersList(allUsers, null, `User #${id} not found.`));
      }

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, user });
      }

      const flashMsg = req.query.msg || null;
      return res.status(200).send(this.view.renderUserDetails(user, flashMsg));
    } catch (err) {
      const allUsers = await this.model.findAll().catch(() => []);
      return res.status(500).send(this.view.renderUsersList(allUsers, null, err.message));
    }
  }

  /**
   * 3. CREATE FORM: GET /users/new or GET /users/create
   */
  new(req, res) {
    return res.status(200).send(this.view.renderCreateForm());
  }

  /**
   * 4. CREATE ACTION: POST /users
   */
  async create(req, res) {
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
      const newUser = await this.model.create({ name, email, role, department });
      const totalUsers = await this.model.count();

      if (wantsJson) {
        return res.status(201).json({
          success: true,
          message: 'User successfully created.',
          user: newUser,
          totalUsers
        });
      }

      // Re-render user listing with success banner
      const allUsers = await this.model.findAll();
      return res.status(201).send(
        this.view.renderUsersList(allUsers, `User "${newUser.name}" was successfully registered!`)
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
   */
  async edit(req, res) {
    const { id } = req.params;
    const user = await this.model.findById(id);

    if (!user) {
      const allUsers = await this.model.findAll();
      return res.status(404).send(this.view.renderUsersList(allUsers, null, `User #${id} not found.`));
    }

    return res.status(200).send(this.view.renderEditForm(user));
  }

  /**
   * 6. UPDATE ACTION: PUT /users/:id, PATCH /users/:id, or POST /users/:id
   */
  async update(req, res) {
    const { id } = req.params;
    const { name, email, role, department } = req.body || {};
    const isPartial = req.method === 'PATCH';
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    if (!isPartial && (!name || !email)) {
      const errorMsg = 'Full name and email address are required fields.';
      const user = (await this.model.findById(id)) || { id, name, email, role, department };
      if (wantsJson) {
        return res.status(400).json({ success: false, error: errorMsg });
      }
      return res.status(400).send(this.view.renderEditForm(user, null, errorMsg));
    }

    try {
      const updatedUser = await this.model.update(id, { name, email, role, department }, isPartial);

      if (!updatedUser) {
        const errorMsg = `User #${id} not found.`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        const allUsers = await this.model.findAll();
        return res.status(404).send(this.view.renderUsersList(allUsers, null, errorMsg));
      }

      if (wantsJson) {
        return res.json({
          success: true,
          message: `User #${id} successfully updated.`,
          user: updatedUser
        });
      }

      return res.status(200).send(
        this.view.renderUserDetails(updatedUser, `User #${id} (${updatedUser.name}) was successfully updated!`)
      );
    } catch (err) {
      const user = (await this.model.findById(id)) || { id, name, email, role, department };
      if (wantsJson) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).send(this.view.renderEditForm(user, null, err.message));
    }
  }

  /**
   * 7. DELETE ACTION: DELETE /users/:id or POST /users/:id/delete
   */
  async delete(req, res) {
    const { id } = req.params;
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || req.xhr;

    try {
      const deletedUser = await this.model.delete(id);

      if (!deletedUser) {
        const errorMsg = `User #${id} not found.`;
        if (wantsJson) {
          return res.status(404).json({ success: false, error: errorMsg });
        }
        const allUsers = await this.model.findAll();
        return res.status(404).send(this.view.renderUsersList(allUsers, null, errorMsg));
      }

      const remainingUsers = await this.model.count();

      if (wantsJson) {
        return res.json({
          success: true,
          message: `User #${id} (${deletedUser.name}) successfully deleted.`,
          deletedUser,
          remainingUsers
        });
      }

      const allUsers = await this.model.findAll();
      return res.status(200).send(
        this.view.renderUsersList(allUsers, `User #${id} (${deletedUser.name}) was successfully deleted.`)
      );
    } catch (err) {
      if (wantsJson) {
        return res.status(500).json({ success: false, error: err.message });
      }
      const allUsers = await this.model.findAll().catch(() => []);
      return res.status(500).send(this.view.renderUsersList(allUsers, null, err.message));
    }
  }
}

// Export singleton instance as default, and class definition
const userController = new UserController();

module.exports = userController;
module.exports.UserController = UserController;

/**
 * User Model (In-Memory / No Database Connection)
 *
 * Implements a standalone, database-free in-memory user repository
 * featuring complete CRUD (Create, Read, Update, Delete) operations,
 * input validation, and seed data initialization.
 */

class UserModel {
  constructor(initialUsers = null) {
    this.users = initialUsers ? [...initialUsers] : this.getSeedUsers();
  }

  /**
   * Default seed users for immediate out-of-the-box availability
   * @returns {Array<Object>}
   */
  getSeedUsers() {
    return [
      {
        id: "1",
        name: "Eren Kılıç",
        email: "eren@alumni.edu",
        role: "ADMIN",
        department: "Software Engineering",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "2",
        name: "Ayşe Yılmaz",
        email: "ayse.yilmaz@google.com",
        role: "ALUMNI",
        department: "Computer Engineering",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: "3",
        name: "Burak Demir",
        email: "burak.demir@peak.com",
        role: "STUDENT",
        department: "Industrial Engineering",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "4",
        name: "Mehmet Öz",
        email: "mehmet@tesla.com",
        role: "ALUMNI",
        department: "Electrical Engineering",
        createdAt: "2026-09-30T06:46:36.548Z",
        updatedAt: "2026-09-30T06:46:36.548Z"
      },
      {
        id: "5",
        name: "Fatma Kaya",
        email: "fatma@alumni.edu",
        role: "STUDENT",
        department: "Architecture",
        createdAt: "2026-09-30T06:47:18.171Z",
        updatedAt: "2026-09-30T06:47:18.171Z"
      },
      {
        id: "6",
        name: "hakan tosun",
        email: "hakatosun@student.com",
        role: "STUDENT",
        department: "doctor",
        createdAt: "2026-09-30T07:11:12.528Z",
        updatedAt: "2026-09-30T07:11:12.528Z"
      },
      {
        id: "7",
        name: "memet raşit famoushand",
        email: "memetk3@student.com",
        role: "STUDENT",
        department: "barber",
        createdAt: "2026-09-30T07:12:05.575Z",
        updatedAt: "2026-09-30T07:12:05.575Z"
      }
    ];
  }

  /**
   * CREATE: Create and insert a new user into the in-memory store
   * @param {Object} userData - User attributes { name, email, role, department }
   * @returns {Object} Created user object
   */
  create(userData) {
    if (!userData || typeof userData !== 'object') {
      throw new Error('User data is required.');
    }

    const { name, email, role, department } = userData;

    if (!name || !name.trim()) {
      throw new Error('Name (name) is required.');
    }
    if (!email || !email.trim()) {
      throw new Error('Email (email) is required.');
    }

    // Auto-generate incrementing string ID based on highest numeric ID in store
    const maxId = this.users.reduce((max, u) => {
      const num = parseInt(u.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = (maxId + 1).toString();

    const allowedRoles = ['ADMIN', 'ALUMNI', 'STUDENT'];
    const normalizedRole = role && allowedRoles.includes(role.toString().toUpperCase())
      ? role.toString().toUpperCase()
      : 'STUDENT';

    const newUser = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: normalizedRole,
      department: department && department.trim() ? department.trim() : 'Belirtilmedi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Prepend to collection so latest additions appear at top
    this.users.unshift(newUser);
    return newUser;
  }

  /**
   * READ: Retrieve all users, optionally filtered
   * @param {Object} [filter={}] - Filter options { role, department, search }
   * @returns {Array<Object>} List of matching users
   */
  findAll(filter = {}) {
    let result = [...this.users];

    if (filter.role) {
      const roleFilter = filter.role.toString().toUpperCase();
      result = result.filter(u => u.role === roleFilter);
    }

    if (filter.department) {
      const deptFilter = filter.department.toString().toLowerCase();
      result = result.filter(u =>
        u.department && u.department.toLowerCase().includes(deptFilter)
      );
    }

    if (filter.search) {
      const q = filter.search.toString().toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }

    return result;
  }

  /**
   * READ: Find a single user by ID
   * @param {string|number} id - User ID
   * @returns {Object|null} User object or null if not found
   */
  findById(id) {
    if (id === undefined || id === null) return null;
    const strId = id.toString();
    return this.users.find(u => u.id === strId) || null;
  }

  /**
   * READ: Find a single user by email
   * @param {string} email - Email address
   * @returns {Object|null} User object or null if not found
   */
  findByEmail(email) {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  }

  /**
   * UPDATE: Update an existing user (Supports full PUT or partial PATCH)
   * @param {string|number} id - User ID
   * @param {Object} updateData - Updated attributes
   * @param {boolean} [isPartial=false] - True for PATCH (partial), false for PUT (full)
   * @returns {Object|null} Updated user or null if user not found
   */
  update(id, updateData = {}, isPartial = false) {
    if (id === undefined || id === null) return null;
    const userIndex = this.users.findIndex(u => u.id === id.toString());
    if (userIndex === -1) {
      return null;
    }

    const existing = this.users[userIndex];
    const { name, email, role, department } = updateData;

    // In full update (PUT), name and email are mandatory
    if (!isPartial && (!name || !email)) {
      throw new Error('PUT update requires both "name" and "email".');
    }

    const allowedRoles = ['ADMIN', 'ALUMNI', 'STUDENT'];
    let updatedRole = existing.role;
    if (role !== undefined) {
      updatedRole = allowedRoles.includes(role.toString().toUpperCase())
        ? role.toString().toUpperCase()
        : existing.role;
    }

    const updatedUser = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      email: email !== undefined ? email.trim().toLowerCase() : existing.email,
      role: updatedRole,
      department: department !== undefined ? department.trim() : existing.department,
      updatedAt: new Date().toISOString()
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  /**
   * UPDATE: Convenience helper for partial update (PATCH)
   * @param {string|number} id - User ID
   * @param {Object} patchData - Attributes to update
   * @returns {Object|null} Updated user or null
   */
  patch(id, patchData) {
    return this.update(id, patchData, true);
  }

  /**
   * DELETE: Remove user from memory store by ID
   * @param {string|number} id - User ID to delete
   * @returns {Object|null} Deleted user object or null if not found
   */
  delete(id) {
    if (id === undefined || id === null) return null;
    const userIndex = this.users.findIndex(u => u.id === id.toString());
    if (userIndex === -1) {
      return null;
    }

    const [deletedUser] = this.users.splice(userIndex, 1);
    return deletedUser;
  }

  /**
   * COUNT: Get total user count
   * @returns {number} Total number of users in memory
   */
  count() {
    return this.users.length;
  }

  /**
   * Check if user exists by ID
   * @param {string|number} id - User ID
   * @returns {boolean} True if exists
   */
  exists(id) {
    return this.findById(id) !== null;
  }

  /**
   * RESET: Reset memory store back to default seed users
   * @returns {Array<Object>}
   */
  reset() {
    this.users = this.getSeedUsers();
    return this.users;
  }

  /**
   * CLEAR: Remove all users from memory
   * @returns {Array<Object>}
   */
  clear() {
    this.users = [];
    return this.users;
  }
}

// Export singleton instance as default, along with the Class definition
const userModel = new UserModel();

module.exports = userModel;
module.exports.UserModel = UserModel;

/**
 * User Model
 *
 * Implements persistent data management with PostgreSQL when connected,
 * with seamless in-memory fallback if the database is offline.
 * Supports full CRUD operations, filtering, and seeding.
 */

const db = require('../db');

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt || row.created_at),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : (row.updatedAt || row.updated_at)
  };
}

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
   * CREATE: Create and insert a new user (Persistent in PostgreSQL or in-memory)
   * @param {Object} userData - User attributes { name, email, role, department }
   * @returns {Promise<Object>|Object} Created user object
   */
  async create(userData) {
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

    const allowedRoles = ['ADMIN', 'ALUMNI', 'STUDENT'];
    const normalizedRole = role && allowedRoles.includes(role.toString().toUpperCase())
      ? role.toString().toUpperCase()
      : 'STUDENT';
    const dept = department && department.trim() ? department.trim() : 'Belirtilmedi';

    if (db.isDbConnected) {
      try {
        const idRes = await db.query(
          "SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS next_id FROM users WHERE id ~ '^[0-9]+$'"
        );
        const newId = (idRes.rows[0].next_id || 1).toString();

        const insertRes = await db.query(
          `INSERT INTO users (id, name, email, role, department, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id, name, email, role, department, created_at AS "createdAt", updated_at AS "updatedAt"`,
          [newId, name.trim(), email.trim().toLowerCase(), normalizedRole, dept]
        );

        const newUser = mapUserRow(insertRes.rows[0]);
        this.users.unshift(newUser);
        return newUser;
      } catch (err) {
        if (err.code === '23505') { // PostgreSQL unique violation
          throw new Error(`Email "${email}" is already registered.`);
        }
        throw err;
      }
    }

    // In-memory fallback
    const maxId = this.users.reduce((max, u) => {
      const num = parseInt(u.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = (maxId + 1).toString();

    const newUser = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: normalizedRole,
      department: dept,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.unshift(newUser);
    return newUser;
  }

  /**
   * READ: Retrieve all users, optionally filtered
   * @param {Object} [filter={}] - Filter options { role, department, search }
   * @returns {Promise<Array<Object>>|Array<Object>} List of matching users
   */
  async findAll(filter = {}) {
    if (db.isDbConnected) {
      try {
        let sql = `SELECT id, name, email, role, department, created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE 1=1`;
        const params = [];

        if (filter.role) {
          params.push(filter.role.toString().toUpperCase());
          sql += ` AND UPPER(role) = $${params.length}`;
        }

        if (filter.department) {
          params.push(`%${filter.department.toString().toLowerCase()}%`);
          sql += ` AND LOWER(department) LIKE $${params.length}`;
        }

        if (filter.search) {
          params.push(`%${filter.search.toString().toLowerCase()}%`);
          sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(department) LIKE $${params.length})`;
        }

        sql += ` ORDER BY CAST(id AS INTEGER) DESC`;
        const res = await db.query(sql, params);
        return res.rows.map(mapUserRow);
      } catch (err) {
        console.error('Error fetching users from DB:', err.message);
      }
    }

    // In-memory fallback
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
   * @returns {Promise<Object|null>|Object|null} User object or null if not found
   */
  async findById(id) {
    if (id === undefined || id === null) return null;
    const strId = id.toString();

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `SELECT id, name, email, role, department, created_at AS "createdAt", updated_at AS "updatedAt"
           FROM users WHERE id = $1`,
          [strId]
        );
        return mapUserRow(res.rows[0]);
      } catch (err) {
        console.error('Error finding user by ID:', err.message);
      }
    }

    return this.users.find(u => u.id === strId) || null;
  }

  /**
   * READ: Find a single user by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>|Object|null} User object or null if not found
   */
  async findByEmail(email) {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `SELECT id, name, email, role, department, created_at AS "createdAt", updated_at AS "updatedAt"
           FROM users WHERE LOWER(email) = LOWER($1)`,
          [normalizedEmail]
        );
        return mapUserRow(res.rows[0]);
      } catch (err) {
        console.error('Error finding user by email:', err.message);
      }
    }

    return this.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  }

  /**
   * UPDATE: Update an existing user (Supports full PUT or partial PATCH)
   * @param {string|number} id - User ID
   * @param {Object} updateData - Updated attributes
   * @param {boolean} [isPartial=false] - True for PATCH (partial), false for PUT (full)
   * @returns {Promise<Object|null>|Object|null} Updated user or null if user not found
   */
  async update(id, updateData = {}, isPartial = false) {
    if (id === undefined || id === null) return null;
    const strId = id.toString();

    const existing = await this.findById(strId);
    if (!existing) {
      return null;
    }

    const { name, email, role, department } = updateData;

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

    const newName = name !== undefined ? name.trim() : existing.name;
    const newEmail = email !== undefined ? email.trim().toLowerCase() : existing.email;
    const newDept = department !== undefined ? department.trim() : existing.department;

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `UPDATE users
           SET name = $1, email = $2, role = $3, department = $4, updated_at = NOW()
           WHERE id = $5
           RETURNING id, name, email, role, department, created_at AS "createdAt", updated_at AS "updatedAt"`,
          [newName, newEmail, updatedRole, newDept, strId]
        );
        const updated = mapUserRow(res.rows[0]);

        const idx = this.users.findIndex(u => u.id === strId);
        if (idx !== -1) this.users[idx] = updated;

        return updated;
      } catch (err) {
        if (err.code === '23505') {
          throw new Error(`Email "${newEmail}" is already registered to another user.`);
        }
        throw err;
      }
    }

    // In-memory fallback
    const userIndex = this.users.findIndex(u => u.id === strId);
    if (userIndex === -1) return null;

    const updatedUser = {
      ...existing,
      name: newName,
      email: newEmail,
      role: updatedRole,
      department: newDept,
      updatedAt: new Date().toISOString()
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  /**
   * UPDATE: Convenience helper for partial update (PATCH)
   * @param {string|number} id - User ID
   * @param {Object} patchData - Attributes to update
   * @returns {Promise<Object|null>|Object|null} Updated user or null
   */
  async patch(id, patchData) {
    return this.update(id, patchData, true);
  }

  /**
   * DELETE: Remove user from store by ID
   * @param {string|number} id - User ID to delete
   * @returns {Promise<Object|null>|Object|null} Deleted user object or null if not found
   */
  async delete(id) {
    if (id === undefined || id === null) return null;
    const strId = id.toString();

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `DELETE FROM users
           WHERE id = $1
           RETURNING id, name, email, role, department, created_at AS "createdAt", updated_at AS "updatedAt"`,
          [strId]
        );
        const deleted = mapUserRow(res.rows[0]);

        const idx = this.users.findIndex(u => u.id === strId);
        if (idx !== -1) this.users.splice(idx, 1);

        return deleted;
      } catch (err) {
        console.error('Error deleting user from DB:', err.message);
      }
    }

    // In-memory fallback
    const userIndex = this.users.findIndex(u => u.id === strId);
    if (userIndex === -1) return null;

    const [deletedUser] = this.users.splice(userIndex, 1);
    return deletedUser;
  }

  /**
   * COUNT: Get total user count
   * @returns {Promise<number>|number} Total number of users
   */
  async count() {
    if (db.isDbConnected) {
      try {
        const res = await db.query('SELECT COUNT(*) AS count FROM users');
        return parseInt(res.rows[0].count, 10);
      } catch (err) {
        console.error('Error counting users in DB:', err.message);
      }
    }
    return this.users.length;
  }

  /**
   * Check if user exists by ID
   * @param {string|number} id - User ID
   * @returns {Promise<boolean>|boolean} True if exists
   */
  async exists(id) {
    return (await this.findById(id)) !== null;
  }

  /**
   * RESET: Reset memory store and database back to default seed users
   * @returns {Promise<Array<Object>>|Array<Object>}
   */
  async reset() {
    if (db.isDbConnected) {
      try {
        await db.query('TRUNCATE TABLE users');
        const seedUsers = this.getSeedUsers();
        for (const u of seedUsers) {
          await db.query(
            `INSERT INTO users (id, name, email, role, department, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             ON CONFLICT (id) DO NOTHING`,
            [u.id, u.name, u.email, u.role, u.department]
          );
        }
      } catch (err) {
        console.error('Error resetting users in DB:', err.message);
      }
    }
    this.users = this.getSeedUsers();
    return this.users;
  }

  /**
   * CLEAR: Remove all users
   * @returns {Promise<Array<Object>>|Array<Object>}
   */
  async clear() {
    if (db.isDbConnected) {
      try {
        await db.query('TRUNCATE TABLE users');
      } catch (err) {
        console.error('Error clearing users in DB:', err.message);
      }
    }
    this.users = [];
    return this.users;
  }
}

// Export singleton instance as default, along with the Class definition
const userModel = new UserModel();

module.exports = userModel;
module.exports.UserModel = UserModel;

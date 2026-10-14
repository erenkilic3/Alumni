/**
 * Announcement Model
 *
 * Implements persistent data management with PostgreSQL when connected,
 * with seamless in-memory fallback if the database is offline.
 * Supports full CRUD operations, filtering, and seeding.
 */

const db = require('../db');

function mapAnnouncementRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    content: row.content,
    category: row.category,
    priority: row.priority,
    author: row.author,
    isPinned: Boolean(row.isPinned !== undefined ? row.isPinned : row.is_pinned),
    status: row.status,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt || row.created_at),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : (row.updatedAt || row.updated_at)
  };
}

class AnnouncementModel {
  constructor(initialAnnouncements = null) {
    this.announcements = initialAnnouncements ? [...initialAnnouncements] : this.getSeedAnnouncements();
  }

  /**
   * Default seed announcements for immediate out-of-the-box availability
   * @returns {Array<Object>}
   */
  getSeedAnnouncements() {
    return [
      {
        id: "1",
        title: "Annual Alumni Homecoming Weekend 2026",
        content: "Join us this October for the annual Homecoming Reunion! Connect with fellow graduates, network with university faculty, and celebrate campus milestones. Registration is free for all registered alumni members.",
        category: "EVENT",
        priority: "HIGH",
        author: "Alumni Relations Office",
        isPinned: true,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: "2",
        title: "Global Tech Mentorship Program Applications Open",
        content: "We are recruiting senior engineering and product alumni to mentor graduating students. The 6-month program pairs industry leaders with ambitious undergraduates.",
        category: "CAREER",
        priority: "URGENT",
        author: "Career Development Center",
        isPinned: true,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "3",
        title: "2026 Research Fellowship & Grant Opportunities",
        content: "Applications are now invited for international postgraduate research grants in Sustainable Energy and Artificial Intelligence. Early submission deadline is November 15.",
        category: "ACADEMIC",
        priority: "NORMAL",
        author: "Office of Academic Affairs",
        isPinned: false,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: "4",
        title: "New Digital Alumni Card & Campus Library Access",
        content: "Alumni Sphere members can now generate digital alumni IDs to access university research libraries and athletic facilities worldwide.",
        category: "GENERAL",
        priority: "NORMAL",
        author: "Alumni Relations Office",
        isPinned: false,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ];
  }

  /**
   * CREATE: Add a new announcement (Persistent in PostgreSQL or in-memory)
   * @param {Object} announcementData - Title, content, category, priority, author, isPinned, status
   * @returns {Promise<Object>|Object} Newly created announcement object
   */
  async create({ title, content, category = "GENERAL", priority = "NORMAL", author = "Alumni Staff", isPinned = false, status = "ACTIVE" }) {
    if (!title || !title.trim()) {
      throw new Error("Title is required.");
    }
    if (!content || !content.trim()) {
      throw new Error("Content is required.");
    }

    const validCategories = ["EVENT", "CAREER", "ACADEMIC", "GENERAL"];
    const validPriorities = ["NORMAL", "HIGH", "URGENT"];
    const validStatuses = ["ACTIVE", "ARCHIVED", "DRAFT"];

    const normalizedCategory = validCategories.includes(String(category).toUpperCase())
      ? String(category).toUpperCase()
      : "GENERAL";

    const normalizedPriority = validPriorities.includes(String(priority).toUpperCase())
      ? String(priority).toUpperCase()
      : "NORMAL";

    const normalizedStatus = validStatuses.includes(String(status).toUpperCase())
      ? String(status).toUpperCase()
      : "ACTIVE";

    const isPinnedBool = Boolean(isPinned === true || isPinned === 'true' || isPinned === 'on');
    const auth = (author && author.trim()) || "Alumni Staff";

    if (db.isDbConnected) {
      try {
        const idRes = await db.query(
          "SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS next_id FROM announcements WHERE id ~ '^[0-9]+$'"
        );
        const nextId = (idRes.rows[0].next_id || 1).toString();

        const insertRes = await db.query(
          `INSERT INTO announcements (id, title, content, category, priority, author, is_pinned, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
           RETURNING id, title, content, category, priority, author, is_pinned AS "isPinned", status, created_at AS "createdAt", updated_at AS "updatedAt"`,
          [nextId, title.trim(), content.trim(), normalizedCategory, normalizedPriority, auth, isPinnedBool, normalizedStatus]
        );

        const newAnnouncement = mapAnnouncementRow(insertRes.rows[0]);
        this.announcements.unshift(newAnnouncement);
        return newAnnouncement;
      } catch (err) {
        console.error('Error creating announcement in DB:', err.message);
        throw err;
      }
    }

    // In-memory fallback
    const nextId = (this.announcements.reduce((max, a) => Math.max(max, parseInt(a.id, 10) || 0), 0) + 1).toString();
    const now = new Date().toISOString();

    const newAnnouncement = {
      id: nextId,
      title: title.trim(),
      content: content.trim(),
      category: normalizedCategory,
      priority: normalizedPriority,
      author: auth,
      isPinned: isPinnedBool,
      status: normalizedStatus,
      createdAt: now,
      updatedAt: now
    };

    this.announcements.unshift(newAnnouncement);
    return newAnnouncement;
  }

  /**
   * READ ALL: Find all announcements with optional filters
   * @param {Object} filter - category, priority, status, search, isPinned
   * @returns {Promise<Array<Object>>|Array<Object>} Filtered announcement list
   */
  async findAll(filter = {}) {
    if (db.isDbConnected) {
      try {
        let sql = `SELECT id, title, content, category, priority, author, is_pinned AS "isPinned", status, created_at AS "createdAt", updated_at AS "updatedAt" FROM announcements WHERE 1=1`;
        const params = [];

        if (filter.category && filter.category !== 'ALL') {
          params.push(filter.category.toString().toUpperCase());
          sql += ` AND UPPER(category) = $${params.length}`;
        }

        if (filter.priority && filter.priority !== 'ALL') {
          params.push(filter.priority.toString().toUpperCase());
          sql += ` AND UPPER(priority) = $${params.length}`;
        }

        if (filter.status && filter.status !== 'ALL') {
          params.push(filter.status.toString().toUpperCase());
          sql += ` AND UPPER(status) = $${params.length}`;
        }

        if (filter.isPinned !== undefined && filter.isPinned !== '') {
          const isPinnedBool = filter.isPinned === true || filter.isPinned === 'true';
          params.push(isPinnedBool);
          sql += ` AND is_pinned = $${params.length}`;
        }

        if (filter.search && filter.search.trim()) {
          const q = `%${filter.search.trim().toLowerCase()}%`;
          params.push(q);
          sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(content) LIKE $${params.length} OR LOWER(author) LIKE $${params.length})`;
        }

        sql += ` ORDER BY is_pinned DESC, CAST(id AS INTEGER) DESC`;
        const res = await db.query(sql, params);
        return res.rows.map(mapAnnouncementRow);
      } catch (err) {
        console.error('Error fetching announcements from DB:', err.message);
      }
    }

    // In-memory fallback
    let results = [...this.announcements];

    if (filter.category && filter.category !== 'ALL') {
      const cat = filter.category.toUpperCase();
      results = results.filter(a => (a.category || '').toUpperCase() === cat);
    }

    if (filter.priority && filter.priority !== 'ALL') {
      const prio = filter.priority.toUpperCase();
      results = results.filter(a => (a.priority || '').toUpperCase() === prio);
    }

    if (filter.status && filter.status !== 'ALL') {
      const st = filter.status.toUpperCase();
      results = results.filter(a => (a.status || '').toUpperCase() === st);
    }

    if (filter.isPinned !== undefined && filter.isPinned !== '') {
      const isPinnedBool = filter.isPinned === true || filter.isPinned === 'true';
      results = results.filter(a => a.isPinned === isPinnedBool);
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      results = results.filter(a =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.content || '').toLowerCase().includes(q) ||
        (a.author || '').toLowerCase().includes(q)
      );
    }

    return results.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return b.isPinned ? 1 : -1;
      }
      return parseInt(b.id, 10) - parseInt(a.id, 10);
    });
  }

  /**
   * READ ONE: Find announcement by ID
   * @param {string|number} id - Announcement ID
   * @returns {Promise<Object|null>|Object|null} Announcement or null
   */
  async findById(id) {
    if (id === undefined || id === null) return null;
    const strId = id.toString();

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `SELECT id, title, content, category, priority, author, is_pinned AS "isPinned", status, created_at AS "createdAt", updated_at AS "updatedAt"
           FROM announcements WHERE id = $1`,
          [strId]
        );
        return mapAnnouncementRow(res.rows[0]);
      } catch (err) {
        console.error('Error finding announcement by ID:', err.message);
      }
    }

    return this.announcements.find(a => a.id === strId) || null;
  }

  /**
   * UPDATE: Update an existing announcement
   * @param {string|number} id - Announcement ID
   * @param {Object} updateData - Attributes to update
   * @param {boolean} [isPartial=false] - Partial PATCH vs full PUT
   * @returns {Promise<Object|null>|Object|null} Updated announcement or null
   */
  async update(id, updateData = {}, isPartial = false) {
    if (id === undefined || id === null) return null;
    const strId = id.toString();

    const existing = await this.findById(strId);
    if (!existing) {
      return null;
    }

    const { title, content, category, priority, author, isPinned, status } = updateData;

    if (!isPartial && (!title || !content)) {
      throw new Error('Both title and content are required for update.');
    }

    const validCategories = ["EVENT", "CAREER", "ACADEMIC", "GENERAL"];
    const validPriorities = ["NORMAL", "HIGH", "URGENT"];
    const validStatuses = ["ACTIVE", "ARCHIVED", "DRAFT"];

    let updatedCategory = existing.category;
    if (category !== undefined) {
      updatedCategory = validCategories.includes(String(category).toUpperCase())
        ? String(category).toUpperCase()
        : existing.category;
    }

    let updatedPriority = existing.priority;
    if (priority !== undefined) {
      updatedPriority = validPriorities.includes(String(priority).toUpperCase())
        ? String(priority).toUpperCase()
        : existing.priority;
    }

    let updatedStatus = existing.status;
    if (status !== undefined) {
      updatedStatus = validStatuses.includes(String(status).toUpperCase())
        ? String(status).toUpperCase()
        : existing.status;
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedContent = content !== undefined ? content.trim() : existing.content;
    const updatedAuthor = author !== undefined ? author.trim() : existing.author;
    const updatedIsPinned = isPinned !== undefined
      ? Boolean(isPinned === true || isPinned === 'true' || isPinned === 'on')
      : existing.isPinned;

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `UPDATE announcements
           SET title = $1, content = $2, category = $3, priority = $4, author = $5, is_pinned = $6, status = $7, updated_at = NOW()
           WHERE id = $8
           RETURNING id, title, content, category, priority, author, is_pinned AS "isPinned", status, created_at AS "createdAt", updated_at AS "updatedAt"`,
          [updatedTitle, updatedContent, updatedCategory, updatedPriority, updatedAuthor, updatedIsPinned, updatedStatus, strId]
        );
        const updated = mapAnnouncementRow(res.rows[0]);

        const idx = this.announcements.findIndex(a => a.id === strId);
        if (idx !== -1) this.announcements[idx] = updated;

        return updated;
      } catch (err) {
        console.error('Error updating announcement in DB:', err.message);
        throw err;
      }
    }

    // In-memory fallback
    const idx = this.announcements.findIndex(a => a.id === strId);
    if (idx === -1) return null;

    const updatedAnnouncement = {
      ...existing,
      title: updatedTitle,
      content: updatedContent,
      category: updatedCategory,
      priority: updatedPriority,
      author: updatedAuthor,
      isPinned: updatedIsPinned,
      status: updatedStatus,
      updatedAt: new Date().toISOString()
    };

    this.announcements[idx] = updatedAnnouncement;
    return updatedAnnouncement;
  }

  /**
   * PATCH: Convenience helper for partial update
   * @param {string|number} id - Announcement ID
   * @param {Object} patchData - Attributes to update
   * @returns {Promise<Object|null>|Object|null} Updated announcement or null
   */
  async patch(id, patchData) {
    return this.update(id, patchData, true);
  }

  /**
   * DELETE: Remove announcement by ID
   * @param {string|number} id - Announcement ID
   * @returns {Promise<Object|null>|Object|null} Deleted announcement or null
   */
  async delete(id) {
    if (id === undefined || id === null) return null;
    const strId = id.toString();

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `DELETE FROM announcements
           WHERE id = $1
           RETURNING id, title, content, category, priority, author, is_pinned AS "isPinned", status, created_at AS "createdAt", updated_at AS "updatedAt"`,
          [strId]
        );
        const deleted = mapAnnouncementRow(res.rows[0]);

        const idx = this.announcements.findIndex(a => a.id === strId);
        if (idx !== -1) this.announcements.splice(idx, 1);

        return deleted;
      } catch (err) {
        console.error('Error deleting announcement from DB:', err.message);
      }
    }

    // In-memory fallback
    const idx = this.announcements.findIndex(a => a.id === strId);
    if (idx === -1) return null;

    const [deleted] = this.announcements.splice(idx, 1);
    return deleted;
  }

  /**
   * COUNT: Get count of announcements
   * @param {Object} filter - Optional filter by category, priority, status
   * @returns {Promise<number>|number} Total count
   */
  async count(filter = {}) {
    if (db.isDbConnected) {
      try {
        let sql = `SELECT COUNT(*) AS count FROM announcements WHERE 1=1`;
        const params = [];

        if (filter.category && filter.category !== 'ALL') {
          params.push(filter.category.toString().toUpperCase());
          sql += ` AND UPPER(category) = $${params.length}`;
        }
        if (filter.priority && filter.priority !== 'ALL') {
          params.push(filter.priority.toString().toUpperCase());
          sql += ` AND UPPER(priority) = $${params.length}`;
        }
        if (filter.status && filter.status !== 'ALL') {
          params.push(filter.status.toString().toUpperCase());
          sql += ` AND UPPER(status) = $${params.length}`;
        }

        const res = await db.query(sql, params);
        return parseInt(res.rows[0].count, 10);
      } catch (err) {
        console.error('Error counting announcements in DB:', err.message);
      }
    }

    return (await this.findAll(filter)).length;
  }

  /**
   * Check if announcement exists by ID
   * @param {string|number} id - ID
   * @returns {Promise<boolean>|boolean} True if exists
   */
  async exists(id) {
    return (await this.findById(id)) !== null;
  }

  /**
   * RESET: Reset announcements store back to seed values
   * @returns {Promise<Array<Object>>|Array<Object>}
   */
  async reset() {
    if (db.isDbConnected) {
      try {
        await db.query('TRUNCATE TABLE announcements');
        const seeds = this.getSeedAnnouncements();
        for (const a of seeds) {
          await db.query(
            `INSERT INTO announcements (id, title, content, category, priority, author, is_pinned, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
             ON CONFLICT (id) DO NOTHING`,
            [a.id, a.title, a.content, a.category, a.priority, a.author, a.isPinned, a.status]
          );
        }
      } catch (err) {
        console.error('Error resetting announcements in DB:', err.message);
      }
    }
    this.announcements = this.getSeedAnnouncements();
    return this.announcements;
  }

  /**
   * CLEAR: Remove all announcements
   * @returns {Promise<Array<Object>>|Array<Object>}
   */
  async clear() {
    if (db.isDbConnected) {
      try {
        await db.query('TRUNCATE TABLE announcements');
      } catch (err) {
        console.error('Error clearing announcements in DB:', err.message);
      }
    }
    this.announcements = [];
    return this.announcements;
  }
}

// Export singleton instance as default, along with Class definition
const announcementModel = new AnnouncementModel();

module.exports = announcementModel;
module.exports.AnnouncementModel = AnnouncementModel;

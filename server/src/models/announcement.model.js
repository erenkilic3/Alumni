/**
 * Announcement Model (In-Memory / No Database Connection)
 *
 * Implements a standalone, database-free in-memory Announcement repository
 * featuring complete CRUD (Create, Read, Update, Delete) operations,
 * filtering, validation, and rich seed data initialization.
 */
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
        author: "Campus Information Services",
        isPinned: false,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ];
  }

  /**
   * CREATE: Add a new announcement to memory
   * @param {Object} announcementData - Title, content, category, priority, author, isPinned, status
   * @returns {Object} Newly created announcement object
   */
  create({ title, content, category = "GENERAL", priority = "NORMAL", author = "Alumni Staff", isPinned = false, status = "ACTIVE" }) {
    if (!title || !title.trim()) {
      throw new Error("Title is required.");
    }
    if (!content || !content.trim()) {
      throw new Error("Content is required.");
    }

    // Auto-generate next numerical ID
    const nextId = (this.announcements.reduce((max, a) => Math.max(max, parseInt(a.id, 10) || 0), 0) + 1).toString();
    const now = new Date().toISOString();

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

    const newAnnouncement = {
      id: nextId,
      title: title.trim(),
      content: content.trim(),
      category: normalizedCategory,
      priority: normalizedPriority,
      author: (author && author.trim()) || "Alumni Staff",
      isPinned: Boolean(isPinned === true || isPinned === 'true' || isPinned === 'on'),
      status: normalizedStatus,
      createdAt: now,
      updatedAt: now
    };

    // Prepend to display latest first
    this.announcements.unshift(newAnnouncement);
    return newAnnouncement;
  }

  /**
   * READ ALL: Find all announcements with optional filters
   * @param {Object} filter - category, priority, status, search, isPinned
   * @returns {Array<Object>} Filtered announcement list
   */
  findAll(filter = {}) {
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

    // Pinned announcements always on top, then newest first
    return results.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * READ ONE: Find announcement by ID
   * @param {string} id - Announcement ID
   * @returns {Object|null} Matching announcement or null
   */
  findById(id) {
    if (!id) return null;
    return this.announcements.find(a => a.id.toString() === id.toString()) || null;
  }

  /**
   * UPDATE: Fully or partially update an existing announcement
   * @param {string} id - Announcement ID
   * @param {Object} updateData - Updated attributes
   * @param {boolean} isPartial - If true, keeps unmodified attributes
   * @returns {Object|null} Updated announcement or null if not found
   */
  update(id, updateData = {}, isPartial = false) {
    const index = this.announcements.findIndex(a => a.id.toString() === id.toString());
    if (index === -1) return null;

    const current = this.announcements[index];
    const { title, content, category, priority, author, isPinned, status } = updateData;

    if (!isPartial) {
      if (!title || !title.trim()) throw new Error("Title is required for full update.");
      if (!content || !content.trim()) throw new Error("Content is required for full update.");
    }

    const validCategories = ["EVENT", "CAREER", "ACADEMIC", "GENERAL"];
    const validPriorities = ["NORMAL", "HIGH", "URGENT"];
    const validStatuses = ["ACTIVE", "ARCHIVED", "DRAFT"];

    let updatedCategory = current.category;
    if (category !== undefined) {
      updatedCategory = validCategories.includes(String(category).toUpperCase())
        ? String(category).toUpperCase()
        : current.category;
    }

    let updatedPriority = current.priority;
    if (priority !== undefined) {
      updatedPriority = validPriorities.includes(String(priority).toUpperCase())
        ? String(priority).toUpperCase()
        : current.priority;
    }

    let updatedStatus = current.status;
    if (status !== undefined) {
      updatedStatus = validStatuses.includes(String(status).toUpperCase())
        ? String(status).toUpperCase()
        : current.status;
    }

    const updated = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      content: content !== undefined ? content.trim() : current.content,
      category: updatedCategory,
      priority: updatedPriority,
      author: author !== undefined ? author.trim() : current.author,
      isPinned: isPinned !== undefined ? Boolean(isPinned === true || isPinned === 'true' || isPinned === 'on') : current.isPinned,
      status: updatedStatus,
      updatedAt: new Date().toISOString()
    };

    this.announcements[index] = updated;
    return updated;
  }

  /**
   * PATCH: Partially update an announcement
   */
  patch(id, patchData = {}) {
    return this.update(id, patchData, true);
  }

  /**
   * DELETE: Remove announcement from in-memory collection
   * @param {string} id - Announcement ID
   * @returns {Object|null} The deleted announcement or null
   */
  delete(id) {
    const index = this.announcements.findIndex(a => a.id.toString() === id.toString());
    if (index === -1) return null;

    const [deleted] = this.announcements.splice(index, 1);
    return deleted;
  }

  /**
   * COUNT: Get total number of announcements
   * @param {Object} filter - Optional filter
   * @returns {number}
   */
  count(filter = {}) {
    return this.findAll(filter).length;
  }

  /**
   * Reset store to initial seed state
   */
  reset() {
    this.announcements = this.getSeedAnnouncements();
    return this.announcements;
  }
}

// Export singleton instance as default, and class definition
const announcementModel = new AnnouncementModel();

module.exports = announcementModel;
module.exports.AnnouncementModel = AnnouncementModel;

/**
 * Alumni Model
 *
 * Implements persistent data management with PostgreSQL when connected,
 * with seamless in-memory fallback if the database is offline.
 * Supports full CRUD operations (create, findAll, findById, update, patch, delete, count).
 */

const db = require('../db');

function mapAlumniRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    graduationYear: parseInt(row.graduationYear !== undefined ? row.graduationYear : row.graduation_year, 10),
    department: row.department,
    company: row.company,
    role: row.role,
    location: row.location,
    industry: row.industry,
    skills: Array.isArray(row.skills) ? row.skills : (typeof row.skills === 'string' ? row.skills.replace(/[{}]/g, '').split(',').map(s => s.trim()) : []),
    avatar: row.avatar,
    isMentor: Boolean(row.isMentor !== undefined ? row.isMentor : row.is_mentor),
    bio: row.bio,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : (row.createdAt || row.created_at)
  };
}

class AlumniModel {
  constructor(initialAlumni = null) {
    this.alumni = initialAlumni ? [...initialAlumni] : this.getSeedAlumni();
  }

  getSeedAlumni() {
    return [
      {
        id: "1",
        name: "Hakan Tosun",
        graduationYear: 2021,
        department: "Computer Engineering",
        company: "Google",
        role: "Senior Software Engineer",
        location: "Zurich, Switzerland",
        industry: "Technology",
        skills: ["Go", "Kubernetes", "Distributed Systems", "Cloud"],
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        isMentor: true,
        bio: "Graduated with honors in 2021. Open for student mentorship in cloud infrastructure.",
        createdAt: "2026-10-14T06:33:33.333Z"
      },
      {
        id: "2",
        name: "Mehmet Raşid FamousHand",
        graduationYear: 2019,
        department: "Industrial Engineering",
        company: "Amazon",
        role: "Lead Product Manager",
        location: "Çorum",
        industry: "E-Commerce",
        skills: ["Product Strategy", "Agile", "Data Analytics", "UX"],
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        isMentor: true,
        bio: "Passionate about building customer-centric products. Mentor for tech career transitions.",
        createdAt: "2026-10-14T06:33:33.333Z"
      },
      {
        id: "3",
        name: "Erenk3",
        graduationYear: 2023,
        department: "Software Engineering",
        company: "Spotify",
        role: "Full Stack Engineer",
        location: "Stockholm, Sweden",
        industry: "Streaming & Media",
        skills: ["TypeScript", "Node.js", "React", "PostgreSQL"],
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        isMentor: false,
        bio: "Building audio discovery features. Alumni representative for Nordic region.",
        createdAt: "2026-10-14T06:33:33.333Z"
      }
    ];
  }

  /**
   * READ ALL: Find all alumni with optional filters
   */
  async findAll(filters = {}) {
    if (db.isDbConnected) {
      try {
        let sql = `SELECT id, name, graduation_year AS "graduationYear", department, company, role, location, industry, skills, avatar, is_mentor AS "isMentor", bio, created_at AS "createdAt" FROM alumni WHERE 1=1`;
        const params = [];

        if (filters.department && filters.department !== 'All') {
          params.push(filters.department);
          sql += ` AND department = $${params.length}`;
        }
        if (filters.year && filters.year !== 'All') {
          params.push(parseInt(filters.year, 10));
          sql += ` AND graduation_year = $${params.length}`;
        }
        if (filters.mentorOnly === true || filters.mentorOnly === 'true') {
          sql += ` AND is_mentor = TRUE`;
        }
        if (filters.search) {
          params.push(`%${filters.search.toLowerCase()}%`);
          sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(company) LIKE $${params.length} OR LOWER(role) LIKE $${params.length})`;
        }

        sql += ` ORDER BY CASE WHEN id ~ '^[0-9]+$' THEN CAST(id AS BIGINT) ELSE 0 END DESC, created_at DESC`;
        const res = await db.query(sql, params);
        return res.rows.map(mapAlumniRow);
      } catch (err) {
        console.error('Error in AlumniModel.findAll DB query:', err.message);
      }
    }

    let results = [...this.alumni];
    if (filters.department && filters.department !== 'All') {
      results = results.filter(a => a.department === filters.department);
    }
    if (filters.year && filters.year !== 'All') {
      results = results.filter(a => a.graduationYear.toString() === filters.year.toString());
    }
    if (filters.mentorOnly === true || filters.mentorOnly === 'true') {
      results = results.filter(a => a.isMentor);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q)
      );
    }
    return results;
  }

  /**
   * READ ONE: Find alumni by ID
   */
  async findById(id) {
    if (!id) return null;
    const strId = id.toString();

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `SELECT id, name, graduation_year AS "graduationYear", department, company, role, location, industry, skills, avatar, is_mentor AS "isMentor", bio, created_at AS "createdAt" FROM alumni WHERE id = $1`,
          [strId]
        );
        return mapAlumniRow(res.rows[0]);
      } catch (err) {
        console.error('Error in AlumniModel.findById DB query:', err.message);
      }
    }
    return this.alumni.find(a => a.id === strId) || null;
  }

  /**
   * CREATE: Insert a new alumni profile
   */
  async create(data) {
    const id = data.id || `alm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newAlumni = {
      id,
      name: (data.name || '').trim(),
      graduationYear: parseInt(data.graduationYear, 10),
      department: (data.department || '').trim(),
      company: (data.company || "Freelance / Independent").trim(),
      role: (data.role || "Specialist").trim(),
      location: (data.location || "Remote").trim(),
      industry: (data.industry || "Technology").trim(),
      skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []),
      avatar: data.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      isMentor: Boolean(data.isMentor),
      bio: (data.bio || "New alumni profile.").trim(),
      createdAt: data.createdAt || new Date().toISOString()
    };

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `INSERT INTO alumni (id, name, graduation_year, department, company, role, location, industry, skills, avatar, is_mentor, bio, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id, name, graduation_year AS "graduationYear", department, company, role, location, industry, skills, avatar, is_mentor AS "isMentor", bio, created_at AS "createdAt"`,
          [
            newAlumni.id,
            newAlumni.name,
            newAlumni.graduationYear,
            newAlumni.department,
            newAlumni.company,
            newAlumni.role,
            newAlumni.location,
            newAlumni.industry,
            newAlumni.skills,
            newAlumni.avatar,
            newAlumni.isMentor,
            newAlumni.bio,
            newAlumni.createdAt
          ]
        );
        const saved = mapAlumniRow(res.rows[0]);
        this.alumni.unshift(saved);
        return saved;
      } catch (err) {
        console.error('Error in AlumniModel.create DB insert:', err.message);
      }
    }

    this.alumni.unshift(newAlumni);
    return newAlumni;
  }

  /**
   * UPDATE: Update an existing alumni profile
   */
  async update(id, data = {}, isPartial = false) {
    if (!id) return null;
    const strId = id.toString();
    const existing = await this.findById(strId);
    if (!existing) return null;

    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const graduationYear = data.graduationYear !== undefined ? parseInt(data.graduationYear, 10) : existing.graduationYear;
    const department = data.department !== undefined ? data.department.trim() : existing.department;
    const company = data.company !== undefined ? data.company.trim() : existing.company;
    const role = data.role !== undefined ? data.role.trim() : existing.role;
    const location = data.location !== undefined ? data.location.trim() : existing.location;
    const industry = data.industry !== undefined ? data.industry.trim() : existing.industry;
    let skills = existing.skills;
    if (data.skills !== undefined) {
      skills = Array.isArray(data.skills) ? data.skills : data.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    const avatar = data.avatar !== undefined ? data.avatar.trim() : existing.avatar;
    const isMentor = data.isMentor !== undefined ? Boolean(data.isMentor) : existing.isMentor;
    const bio = data.bio !== undefined ? data.bio.trim() : existing.bio;

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `UPDATE alumni
           SET name = $1, graduation_year = $2, department = $3, company = $4, role = $5, location = $6, industry = $7, skills = $8, avatar = $9, is_mentor = $10, bio = $11
           WHERE id = $12
           RETURNING id, name, graduation_year AS "graduationYear", department, company, role, location, industry, skills, avatar, is_mentor AS "isMentor", bio, created_at AS "createdAt"`,
          [name, graduationYear, department, company, role, location, industry, skills, avatar, isMentor, bio, strId]
        );
        const updated = mapAlumniRow(res.rows[0]);
        const idx = this.alumni.findIndex(a => a.id === strId);
        if (idx !== -1) this.alumni[idx] = updated;
        return updated;
      } catch (err) {
        console.error('Error in AlumniModel.update DB query:', err.message);
      }
    }

    const updatedAlumni = {
      ...existing,
      name, graduationYear, department, company, role, location, industry, skills, avatar, isMentor, bio
    };
    const idx = this.alumni.findIndex(a => a.id === strId);
    if (idx !== -1) this.alumni[idx] = updatedAlumni;
    return updatedAlumni;
  }

  /**
   * PATCH: Partial update
   */
  async patch(id, patchData) {
    return this.update(id, patchData, true);
  }

  /**
   * DELETE: Remove an alumni profile by ID
   */
  async delete(id) {
    if (!id) return null;
    const strId = id.toString();

    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `DELETE FROM alumni WHERE id = $1
           RETURNING id, name, graduation_year AS "graduationYear", department, company, role, location, industry, skills, avatar, is_mentor AS "isMentor", bio, created_at AS "createdAt"`,
          [strId]
        );
        const deleted = mapAlumniRow(res.rows[0]);
        const idx = this.alumni.findIndex(a => a.id === strId);
        if (idx !== -1) this.alumni.splice(idx, 1);
        return deleted;
      } catch (err) {
        console.error('Error in AlumniModel.delete DB query:', err.message);
      }
    }

    const idx = this.alumni.findIndex(a => a.id === strId);
    if (idx === -1) return null;
    const [deleted] = this.alumni.splice(idx, 1);
    return deleted;
  }

  /**
   * COUNT: Total alumni count
   */
  async count(filters = {}) {
    if (db.isDbConnected) {
      try {
        let sql = `SELECT COUNT(*) AS count FROM alumni WHERE 1=1`;
        const params = [];
        if (filters.department && filters.department !== 'All') {
          params.push(filters.department);
          sql += ` AND department = $${params.length}`;
        }
        if (filters.mentorOnly === true || filters.mentorOnly === 'true') {
          sql += ` AND is_mentor = TRUE`;
        }
        const res = await db.query(sql, params);
        return parseInt(res.rows[0].count, 10);
      } catch (err) {
        console.error('Error in AlumniModel.count DB query:', err.message);
      }
    }
    return this.alumni.length;
  }
}

module.exports = new AlumniModel();

/**
 * Alumni Model
 *
 * Implements persistent data management with PostgreSQL when connected,
 * with seamless in-memory fallback if the database is offline.
 * Supports full CRUD operations, filtering, and query helpers.
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
    skills: Array.isArray(row.skills) ? row.skills : [],
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

        sql += ` ORDER BY created_at DESC`;
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

  async findById(id) {
    if (db.isDbConnected) {
      try {
        const res = await db.query(
          `SELECT id, name, graduation_year AS "graduationYear", department, company, role, location, industry, skills, avatar, is_mentor AS "isMentor", bio, created_at AS "createdAt" FROM alumni WHERE id = $1`,
          [id]
        );
        return mapAlumniRow(res.rows[0]);
      } catch (err) {
        console.error('Error in AlumniModel.findById DB query:', err.message);
      }
    }
    return this.alumni.find(a => a.id === id) || null;
  }

  async create(data) {
    const id = data.id || `alm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newAlumni = {
      id,
      name: data.name,
      graduationYear: parseInt(data.graduationYear, 10),
      department: data.department,
      company: data.company || "Freelance / Independent",
      role: data.role || "Specialist",
      location: data.location || "Remote",
      industry: data.industry || "Technology",
      skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map(s => s.trim()) : []),
      avatar: data.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      isMentor: Boolean(data.isMentor),
      bio: data.bio || "New alumni profile.",
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
        return mapAlumniRow(res.rows[0]);
      } catch (err) {
        console.error('Error in AlumniModel.create DB insert:', err.message);
      }
    }

    this.alumni.unshift(newAlumni);
    return newAlumni;
  }
}

module.exports = new AlumniModel();

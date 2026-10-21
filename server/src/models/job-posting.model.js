/**
 * Job Posting Model
 *
 * Implements persistent data management with PostgreSQL for job opportunities,
 * internships, and career openings, with seamless in-memory fallback if the database is offline.
 * Conforms to Data Definition Document (ddd.md).
 */

const db = require('../db');

function mapJobPostingRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    company: row.company,
    location: row.location || 'Remote',
    type: row.type || 'Full-Time',
    description: row.description || '',
    requirements: Array.isArray(row.requirements) ? row.requirements : (row.requirements ? [row.requirements] : []),
    salaryRange: row.salary_range || row.salaryRange || null,
    contactEmail: row.contact_email || row.contactEmail || null,
    postedBy: row.posted_by || row.postedBy || 'Alumni Career Network',
    userId: row.user_id || row.userId || null,
    alumniId: row.alumni_id || row.alumniId || null,
    deadline: row.deadline ? (row.deadline instanceof Date ? row.deadline.toISOString().split('T')[0] : String(row.deadline).split('T')[0]) : null,
    status: row.status || 'ACTIVE',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

class JobPostingModel {
  constructor(initialJobs = null) {
    this.jobs = initialJobs ? [...initialJobs] : this.getSeedJobs();
  }

  getSeedJobs() {
    return [
      {
        id: "job-1",
        title: "Junior Backend Developer (Node.js / PostgreSQL)",
        company: "Peak Tech",
        location: "Remote / Istanbul",
        type: "Full-Time",
        description: "We are seeking a junior backend engineer to join our high-growth platform team working on scalable REST APIs and PostgreSQL databases.",
        requirements: ["Node.js", "PostgreSQL", "Express", "Docker", "Git"],
        salaryRange: "$40,000 - $55,000",
        contactEmail: "careers@peaktech.example.com",
        postedBy: "Burak Demir",
        deadline: "2026-10-15",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "job-2",
        title: "Data Science Intern",
        company: "FinAnalytica",
        location: "Hybrid (Ankara)",
        type: "Internship",
        description: "Join our financial analytics lab to assist senior data scientists in predictive modeling, statistical reporting, and dashboard creation.",
        requirements: ["Python", "Pandas", "SQL", "Data Visualization", "Machine Learning Basics"],
        salaryRange: "Paid Internship",
        contactEmail: "interns@finanalytica.example.com",
        postedBy: "Selin Öztürk",
        deadline: "2026-11-01",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async findAll(options = {}) {
    if (db.isDbConnected) {
      try {
        let sql = 'SELECT * FROM job_postings WHERE 1=1';
        const params = [];
        let idx = 1;

        if (options.status) {
          sql += ` AND status = $${idx++}`;
          params.push(options.status);
        }
        if (options.type) {
          sql += ` AND type = $${idx++}`;
          params.push(options.type);
        }
        if (options.company) {
          sql += ` AND company ILIKE $${idx++}`;
          params.push(`%${options.company}%`);
        }
        if (options.search) {
          sql += ` AND (title ILIKE $${idx} OR company ILIKE $${idx} OR description ILIKE $${idx})`;
          params.push(`%${options.search}%`);
          idx++;
        }

        sql += ' ORDER BY created_at DESC';

        const result = await db.query(sql, params);
        return result.rows.map(mapJobPostingRow);
      } catch (err) {
        console.warn('⚠️ PostgreSQL query failed, using in-memory jobs:', err.message);
      }
    }

    let results = [...this.jobs];
    if (options.status) {
      results = results.filter(j => j.status.toUpperCase() === options.status.toUpperCase());
    }
    if (options.type) {
      results = results.filter(j => j.type.toLowerCase() === options.type.toLowerCase());
    }
    if (options.company) {
      results = results.filter(j => j.company.toLowerCase().includes(options.company.toLowerCase()));
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      results = results.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }
    return results;
  }

  async findById(id) {
    if (db.isDbConnected) {
      try {
        const result = await db.query('SELECT * FROM job_postings WHERE id = $1', [id]);
        if (result.rows.length > 0) {
          return mapJobPostingRow(result.rows[0]);
        }
        return null;
      } catch (err) {
        console.warn('⚠️ PostgreSQL query failed, falling back to memory:', err.message);
      }
    }
    return this.jobs.find(j => j.id === String(id)) || null;
  }

  async create(data) {
    const id = data.id || `job-${Date.now()}`;
    const newJob = {
      id,
      title: data.title,
      company: data.company,
      location: data.location || 'Remote',
      type: data.type || 'Full-Time',
      description: data.description || '',
      requirements: Array.isArray(data.requirements) ? data.requirements : (data.requirements ? [data.requirements] : []),
      salaryRange: data.salaryRange || data.salary_range || null,
      contactEmail: data.contactEmail || data.contact_email || null,
      postedBy: data.postedBy || data.posted_by || 'Alumni Career Network',
      userId: data.userId || data.user_id || null,
      alumniId: data.alumniId || data.alumni_id || null,
      deadline: data.deadline || null,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (db.isDbConnected) {
      try {
        const queryText = `
          INSERT INTO job_postings (id, title, company, location, type, description, requirements, salary_range, contact_email, posted_by, user_id, alumni_id, deadline, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
          RETURNING *;
        `;
        const params = [
          newJob.id,
          newJob.title,
          newJob.company,
          newJob.location,
          newJob.type,
          newJob.description,
          newJob.requirements,
          newJob.salaryRange,
          newJob.contactEmail,
          newJob.postedBy,
          newJob.userId,
          newJob.alumniId,
          newJob.deadline,
          newJob.status
        ];
        const res = await db.query(queryText, params);
        const saved = mapJobPostingRow(res.rows[0]);
        this.jobs.push(saved);
        return saved;
      } catch (err) {
        console.warn('⚠️ PostgreSQL insert failed, saving to memory only:', err.message);
      }
    }

    this.jobs.push(newJob);
    return newJob;
  }

  async update(id, data) {
    if (db.isDbConnected) {
      try {
        const existing = await this.findById(id);
        if (!existing) return null;

        const updated = {
          ...existing,
          ...data,
          requirements: Array.isArray(data.requirements) ? data.requirements : (data.requirements ? [data.requirements] : existing.requirements),
          userId: data.userId !== undefined ? data.userId : (data.user_id !== undefined ? data.user_id : existing.userId),
          alumniId: data.alumniId !== undefined ? data.alumniId : (data.alumni_id !== undefined ? data.alumni_id : existing.alumniId),
          updatedAt: new Date().toISOString()
        };

        const queryText = `
          UPDATE job_postings
          SET title = $1, company = $2, location = $3, type = $4, description = $5,
              requirements = $6, salary_range = $7, contact_email = $8, posted_by = $9,
              user_id = $10, alumni_id = $11, deadline = $12, status = $13, updated_at = NOW()
          WHERE id = $14
          RETURNING *;
        `;
        const params = [
          updated.title,
          updated.company,
          updated.location,
          updated.type,
          updated.description,
          updated.requirements,
          updated.salaryRange,
          updated.contactEmail,
          updated.postedBy,
          updated.userId,
          updated.alumniId,
          updated.deadline,
          updated.status,
          id
        ];
        const res = await db.query(queryText, params);
        if (res.rows.length > 0) {
          const saved = mapJobPostingRow(res.rows[0]);
          const memIdx = this.jobs.findIndex(j => j.id === String(id));
          if (memIdx !== -1) this.jobs[memIdx] = saved;
          return saved;
        }
      } catch (err) {
        console.warn('⚠️ PostgreSQL update failed, falling back to memory:', err.message);
      }
    }

    const memIdx = this.jobs.findIndex(j => j.id === String(id));
    if (memIdx === -1) return null;
    this.jobs[memIdx] = {
      ...this.jobs[memIdx],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return this.jobs[memIdx];
  }

  async delete(id) {
    if (db.isDbConnected) {
      try {
        const res = await db.query('DELETE FROM job_postings WHERE id = $1 RETURNING *', [id]);
        const deleted = res.rows.length > 0 ? mapJobPostingRow(res.rows[0]) : null;
        this.jobs = this.jobs.filter(j => j.id !== String(id));
        return deleted;
      } catch (err) {
        console.warn('⚠️ PostgreSQL delete failed, falling back to memory:', err.message);
      }
    }

    const idx = this.jobs.findIndex(j => j.id === String(id));
    if (idx === -1) return null;
    const [deleted] = this.jobs.splice(idx, 1);
    return deleted;
  }

  async count() {
    if (db.isDbConnected) {
      try {
        const res = await db.query('SELECT COUNT(*) AS count FROM job_postings');
        return parseInt(res.rows[0].count, 10);
      } catch (err) {
        console.warn('⚠️ PostgreSQL count query failed, using in-memory count:', err.message);
      }
    }
    return this.jobs.length;
  }
}

module.exports = new JobPostingModel();

/**
 * Application Model
 *
 * Implements persistent data management with PostgreSQL for job applications,
 * resume submissions, and applicant tracking, with seamless in-memory fallback if the database is offline.
 * Conforms to Data Definition Document (ddd.md).
 */

const db = require('../db');

function mapApplicationRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    jobId: row.job_id || row.jobId,
    userId: row.user_id || row.userId,
    applicantName: row.applicant_name || row.applicantName,
    applicantEmail: row.applicant_email || row.applicantEmail,
    resumeUrl: row.resume_url || row.resumeUrl || null,
    coverLetter: row.cover_letter || row.coverLetter || null,
    status: row.status || 'PENDING',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

class ApplicationModel {
  constructor(initialApplications = null) {
    this.applications = initialApplications ? [...initialApplications] : this.getSeedApplications();
  }

  getSeedApplications() {
    return [
      {
        id: "app-1",
        jobId: "job-1",
        userId: "3",
        applicantName: "Burak Demir",
        applicantEmail: "burak.demir@peak.com",
        resumeUrl: "https://storage.alumni.edu/resumes/burak_demir_cv.pdf",
        coverLetter: "I have 2 years of experience with Node.js and PostgreSQL. Excited to apply for the Junior Backend role.",
        status: "REVIEWING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "app-2",
        jobId: "job-2",
        userId: "5",
        applicantName: "Fatma Kaya",
        applicantEmail: "fatma@alumni.edu",
        resumeUrl: "https://storage.alumni.edu/resumes/fatma_kaya_portfolio.pdf",
        coverLetter: "Eager to contribute to predictive data models and statistical research dashboards.",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async findAll(options = {}) {
    if (db.isDbConnected) {
      try {
        let sql = 'SELECT * FROM applications WHERE 1=1';
        const params = [];
        let idx = 1;

        if (options.status) {
          sql += ` AND status = $${idx++}`;
          params.push(options.status);
        }
        if (options.jobId) {
          sql += ` AND job_id = $${idx++}`;
          params.push(String(options.jobId));
        }
        if (options.userId) {
          sql += ` AND user_id = $${idx++}`;
          params.push(String(options.userId));
        }
        if (options.search) {
          sql += ` AND (applicant_name ILIKE $${idx} OR applicant_email ILIKE $${idx} OR cover_letter ILIKE $${idx})`;
          params.push(`%${options.search}%`);
          idx++;
        }

        sql += ' ORDER BY created_at DESC';

        const result = await db.query(sql, params);
        return result.rows.map(mapApplicationRow);
      } catch (err) {
        console.warn('⚠️ PostgreSQL query failed, using in-memory applications:', err.message);
      }
    }

    let results = [...this.applications];
    if (options.status) {
      results = results.filter(a => a.status.toUpperCase() === options.status.toUpperCase());
    }
    if (options.jobId) {
      results = results.filter(a => String(a.jobId) === String(options.jobId));
    }
    if (options.userId) {
      results = results.filter(a => String(a.userId) === String(options.userId));
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      results = results.filter(a =>
        a.applicantName.toLowerCase().includes(q) ||
        a.applicantEmail.toLowerCase().includes(q) ||
        (a.coverLetter && a.coverLetter.toLowerCase().includes(q))
      );
    }
    return results;
  }

  async findById(id) {
    if (db.isDbConnected) {
      try {
        const result = await db.query('SELECT * FROM applications WHERE id = $1', [id]);
        if (result.rows.length > 0) {
          return mapApplicationRow(result.rows[0]);
        }
        return null;
      } catch (err) {
        console.warn('⚠️ PostgreSQL query failed, falling back to memory:', err.message);
      }
    }
    return this.applications.find(a => a.id === String(id)) || null;
  }

  async findByUserId(userId) {
    if (!userId) return [];
    const strId = String(userId);
    if (db.isDbConnected) {
      try {
        const res = await db.query('SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC', [strId]);
        return res.rows.map(mapApplicationRow);
      } catch (err) {
        console.warn('⚠️ PostgreSQL query failed, using in-memory applications:', err.message);
      }
    }
    return this.applications.filter(a => String(a.userId) === strId);
  }

  async findByJobId(jobId) {
    if (!jobId) return [];
    const strId = String(jobId);
    if (db.isDbConnected) {
      try {
        const res = await db.query('SELECT * FROM applications WHERE job_id = $1 ORDER BY created_at DESC', [strId]);
        return res.rows.map(mapApplicationRow);
      } catch (err) {
        console.warn('⚠️ PostgreSQL query failed, using in-memory applications:', err.message);
      }
    }
    return this.applications.filter(a => String(a.jobId) === strId);
  }

  async create(data = {}) {
    const rawJobId = data.jobId !== undefined ? data.jobId : data.job_id;
    const rawUserId = data.userId !== undefined ? data.userId : data.user_id;
    const rawName = data.applicantName !== undefined ? data.applicantName : data.applicant_name;
    const rawEmail = data.applicantEmail !== undefined ? data.applicantEmail : data.applicant_email;

    if (!rawJobId || !String(rawJobId).trim() || !rawUserId || !String(rawUserId).trim() || !rawName || !String(rawName).trim() || !rawEmail || !String(rawEmail).trim()) {
      throw new Error('jobId, userId, applicantName, and applicantEmail are required fields.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(rawEmail).trim())) {
      throw new Error('Invalid applicantEmail format.');
    }

    const validStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];
    if (data.status !== undefined && data.status !== null && String(data.status).trim() !== '') {
      if (!validStatuses.includes(String(data.status).trim().toUpperCase())) {
        throw new Error(`Invalid status "${data.status}". Allowed statuses: ${validStatuses.join(', ')}.`);
      }
    }

    const id = data.id || `app-${Date.now()}`;
    const newApp = {
      id,
      jobId: String(rawJobId).trim(),
      userId: String(rawUserId).trim(),
      applicantName: String(rawName).trim(),
      applicantEmail: String(rawEmail).trim(),
      resumeUrl: data.resumeUrl || data.resume_url || null,
      coverLetter: data.coverLetter || data.cover_letter || null,
      status: (data.status ? String(data.status).trim() : 'PENDING').toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (db.isDbConnected) {
      try {
        const queryText = `
          INSERT INTO applications (id, job_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *;
        `;
        const params = [
          newApp.id,
          newApp.jobId,
          newApp.userId,
          newApp.applicantName,
          newApp.applicantEmail,
          newApp.resumeUrl,
          newApp.coverLetter,
          newApp.status
        ];
        const res = await db.query(queryText, params);
        const saved = mapApplicationRow(res.rows[0]);
        this.applications.push(saved);
        return saved;
      } catch (err) {
        if (err.code === '23503') {
          throw new Error('Foreign key violation: referenced jobId or userId does not exist.');
        }
        throw err;
      }
    }

    this.applications.push(newApp);
    return newApp;
  }

  async update(id, data = {}, isPartial = false) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const rawJobId = data.jobId !== undefined ? data.jobId : data.job_id;
    const rawUserId = data.userId !== undefined ? data.userId : data.user_id;
    const rawName = data.applicantName !== undefined ? data.applicantName : data.applicant_name;
    const rawEmail = data.applicantEmail !== undefined ? data.applicantEmail : data.applicant_email;

    if (!isPartial) {
      if (!rawJobId || !String(rawJobId).trim() || !rawUserId || !String(rawUserId).trim() || !rawName || !String(rawName).trim() || !rawEmail || !String(rawEmail).trim()) {
        throw new Error('PUT request requires jobId, userId, applicantName, and applicantEmail fields.');
      }
    } else {
      if (rawJobId !== undefined && !String(rawJobId).trim()) {
        throw new Error('jobId cannot be empty.');
      }
      if (rawUserId !== undefined && !String(rawUserId).trim()) {
        throw new Error('userId cannot be empty.');
      }
      if (rawName !== undefined && !String(rawName).trim()) {
        throw new Error('applicantName cannot be empty.');
      }
      if (rawEmail !== undefined && !String(rawEmail).trim()) {
        throw new Error('applicantEmail cannot be empty.');
      }
    }

    if (rawEmail !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(rawEmail).trim())) {
        throw new Error('Invalid applicantEmail format.');
      }
    }

    const validStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];
    if (data.status !== undefined && data.status !== null && String(data.status).trim() !== '') {
      if (!validStatuses.includes(String(data.status).trim().toUpperCase())) {
        throw new Error(`Invalid status "${data.status}". Allowed statuses: ${validStatuses.join(', ')}.`);
      }
    }

    if (db.isDbConnected) {
      try {
        const updated = {
          ...existing,
          ...data,
          jobId: rawJobId !== undefined ? String(rawJobId).trim() : existing.jobId,
          userId: rawUserId !== undefined ? String(rawUserId).trim() : existing.userId,
          applicantName: rawName !== undefined ? String(rawName).trim() : existing.applicantName,
          applicantEmail: rawEmail !== undefined ? String(rawEmail).trim() : existing.applicantEmail,
          resumeUrl: data.resumeUrl !== undefined ? data.resumeUrl : (data.resume_url !== undefined ? data.resume_url : existing.resumeUrl),
          coverLetter: data.coverLetter !== undefined ? data.coverLetter : (data.cover_letter !== undefined ? data.cover_letter : existing.coverLetter),
          status: data.status !== undefined ? String(data.status).trim().toUpperCase() : existing.status,
          updatedAt: new Date().toISOString()
        };

        const queryText = `
          UPDATE applications
          SET job_id = $1, user_id = $2, applicant_name = $3, applicant_email = $4,
              resume_url = $5, cover_letter = $6, status = $7, updated_at = NOW()
          WHERE id = $8
          RETURNING *;
        `;
        const params = [
          updated.jobId,
          updated.userId,
          updated.applicantName,
          updated.applicantEmail,
          updated.resumeUrl,
          updated.coverLetter,
          updated.status,
          id
        ];
        const res = await db.query(queryText, params);
        if (res.rows.length > 0) {
          const saved = mapApplicationRow(res.rows[0]);
          const memIdx = this.applications.findIndex(a => a.id === String(id));
          if (memIdx !== -1) this.applications[memIdx] = saved;
          return saved;
        }
      } catch (err) {
        if (err.code === '23503') {
          throw new Error('Foreign key violation: referenced jobId or userId does not exist.');
        }
        throw err;
      }
    }

    const memIdx = this.applications.findIndex(a => a.id === String(id));
    if (memIdx === -1) return null;
    this.applications[memIdx] = {
      ...this.applications[memIdx],
      ...data,
      jobId: rawJobId !== undefined ? String(rawJobId).trim() : this.applications[memIdx].jobId,
      userId: rawUserId !== undefined ? String(rawUserId).trim() : this.applications[memIdx].userId,
      applicantName: rawName !== undefined ? String(rawName).trim() : this.applications[memIdx].applicantName,
      applicantEmail: rawEmail !== undefined ? String(rawEmail).trim() : this.applications[memIdx].applicantEmail,
      resumeUrl: data.resumeUrl !== undefined ? data.resumeUrl : (data.resume_url !== undefined ? data.resume_url : this.applications[memIdx].resumeUrl),
      coverLetter: data.coverLetter !== undefined ? data.coverLetter : (data.cover_letter !== undefined ? data.cover_letter : this.applications[memIdx].coverLetter),
      status: data.status !== undefined ? String(data.status).trim().toUpperCase() : this.applications[memIdx].status,
      updatedAt: new Date().toISOString()
    };
    return this.applications[memIdx];
  }

  async delete(id) {
    if (db.isDbConnected) {
      try {
        const res = await db.query('DELETE FROM applications WHERE id = $1 RETURNING *', [id]);
        const deleted = res.rows.length > 0 ? mapApplicationRow(res.rows[0]) : null;
        this.applications = this.applications.filter(a => a.id !== String(id));
        return deleted;
      } catch (err) {
        console.warn('⚠️ PostgreSQL delete failed, falling back to memory:', err.message);
      }
    }

    const idx = this.applications.findIndex(a => a.id === String(id));
    if (idx === -1) return null;
    const [deleted] = this.applications.splice(idx, 1);
    return deleted;
  }

  async count(options = {}) {
    if (db.isDbConnected) {
      try {
        let sql = 'SELECT COUNT(*) AS count FROM applications WHERE 1=1';
        const params = [];
        let idx = 1;
        if (options.status) {
          sql += ` AND status = $${idx++}`;
          params.push(options.status);
        }
        if (options.jobId) {
          sql += ` AND job_id = $${idx++}`;
          params.push(String(options.jobId));
        }
        if (options.userId) {
          sql += ` AND user_id = $${idx++}`;
          params.push(String(options.userId));
        }
        const res = await db.query(sql, params);
        return parseInt(res.rows[0].count, 10);
      } catch (err) {
        console.warn('⚠️ PostgreSQL count query failed, using in-memory count:', err.message);
      }
    }

    let results = [...this.applications];
    if (options.status) {
      results = results.filter(a => a.status.toUpperCase() === options.status.toUpperCase());
    }
    if (options.jobId) {
      results = results.filter(a => String(a.jobId) === String(options.jobId));
    }
    if (options.userId) {
      results = results.filter(a => String(a.userId) === String(options.userId));
    }
    return results.length;
  }
}

module.exports = new ApplicationModel();

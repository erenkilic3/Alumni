/**
 * Application Factory
 *
 * Generates realistic job applications and applicant submissions.
 * Conforms to Data Definition Document (ddd.md).
 * Supports trait chaining: .pending(), .reviewing(), .shortlisted(), .accepted(), .rejected(), .forJob(), .forUser().
 */

const BaseFactory = require('./base.factory');
const db = require('../db');

const APPLICANTS = [
  { name: 'Burak Demir', email: 'burak.demir@peak.com', userId: '3' },
  { name: 'Fatma Kaya', email: 'fatma@alumni.edu', userId: '5' },
  { name: 'Hakan Tosun', email: 'hakatosun@student.com', userId: '6' },
  { name: 'Mehmet Raşit', email: 'memetk3@student.com', userId: '7' },
  { name: 'Eren Kılıç', email: 'eren@alumni.edu', userId: '1' },
  { name: 'Ayşe Yılmaz', email: 'ayse.yilmaz@google.com', userId: '2' },
  { name: 'Caner Erkin', email: 'caner.erkin@alumni.edu', userId: '3' },
  { name: 'Zeynep Aksoy', email: 'zeynep.aksoy@student.edu', userId: '5' }
];

const JOB_IDS = ['job-1', 'job-2'];

const COVER_LETTERS = [
  'I have extensive experience working with Node.js, Express, and PostgreSQL microservices. I would love to bring my skills to your team.',
  'Graduating with top honors in data science. Proficient in Python, machine learning workflows, and cloud data platforms.',
  'I am deeply passionate about modern distributed software architectures and eager to contribute to your engineering milestones.',
  'Looking for a challenging internship where I can apply my predictive modeling and statistical analysis background.',
  'With a proven track record in full-stack web applications, I am eager to join your high-impact product squad.'
];

const STATUSES = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

class ApplicationFactory extends BaseFactory {
  definition(sequence = 1) {
    const applicant = BaseFactory.randomItem(APPLICANTS);
    const jobId = BaseFactory.randomItem(JOB_IDS);
    const coverLetter = BaseFactory.randomItem(COVER_LETTERS);
    const status = BaseFactory.randomItem(STATUSES);
    const createdAt = BaseFactory.randomDate(20, 1);
    const cleanName = applicant.name.toLowerCase().replace(/[^a-z]/g, '_');
    const resumeUrl = `https://storage.alumni.edu/resumes/${cleanName}_cv.pdf`;

    return {
      id: `app_${Date.now()}_${sequence}_${Math.random().toString(36).substr(2, 6)}`,
      jobId: jobId,
      userId: applicant.userId,
      applicantName: `${applicant.name} #${sequence}`,
      applicantEmail: applicant.email,
      resumeUrl: resumeUrl,
      coverLetter: coverLetter,
      status: status,
      createdAt: createdAt,
      updatedAt: createdAt
    };
  }

  // Traits
  pending() {
    return this.state({ status: 'PENDING' });
  }

  reviewing() {
    return this.state({ status: 'REVIEWING' });
  }

  shortlisted() {
    return this.state({ status: 'SHORTLISTED' });
  }

  accepted() {
    return this.state({ status: 'ACCEPTED' });
  }

  rejected() {
    return this.state({ status: 'REJECTED' });
  }

  forJob(jobId) {
    return this.state({ jobId: String(jobId) });
  }

  forUser(userId, name = null, email = null) {
    const updates = { userId: String(userId) };
    if (name) updates.applicantName = name;
    if (email) updates.applicantEmail = email;
    return this.state(updates);
  }

  async create(count = 1) {
    const records = this.make(count);
    if (!db.isDbConnected) {
      return records;
    }

    const inserted = [];
    for (const a of records) {
      try {
        const queryText = `
          INSERT INTO applications (id, job_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
          RETURNING *;
        `;
        const params = [
          a.id,
          a.jobId,
          a.userId,
          a.applicantName,
          a.applicantEmail,
          a.resumeUrl,
          a.coverLetter,
          a.status,
          a.createdAt,
          a.updatedAt
        ];
        const res = await db.query(queryText, params);
        if (res.rows.length > 0) {
          inserted.push(res.rows[0]);
        }
      } catch (err) {
        console.warn('⚠️ ApplicationFactory insert error:', err.message);
      }
    }
    return inserted;
  }
}

module.exports = new ApplicationFactory();

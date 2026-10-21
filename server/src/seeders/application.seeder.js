/**
 * Application Seeder
 *
 * Populates PostgreSQL applications table with baseline job application submissions
 * plus additional factory-generated applicant submissions.
 * Conforms to Data Definition Document (ddd.md).
 */

const db = require('../db');
const { ApplicationFactory } = require('../factories');

const CORE_APPLICATIONS = [
  {
    id: "app-1",
    jobId: "job-1",
    userId: "3",
    applicantName: "Burak Demir",
    applicantEmail: "burak.demir@peak.com",
    resumeUrl: "https://storage.alumni.edu/resumes/burak_demir_cv.pdf",
    coverLetter: "I have 2 years of experience with Node.js and PostgreSQL. Excited to apply for the Junior Backend role.",
    status: "REVIEWING"
  },
  {
    id: "app-2",
    jobId: "job-2",
    userId: "5",
    applicantName: "Fatma Kaya",
    applicantEmail: "fatma@alumni.edu",
    resumeUrl: "https://storage.alumni.edu/resumes/fatma_kaya_portfolio.pdf",
    coverLetter: "Eager to contribute to predictive data models and statistical research dashboards.",
    status: "PENDING"
  }
];

class ApplicationSeeder {
  /**
   * Run application seeder
   * @param {number} [factoryCount=6] Additional applications to generate via ApplicationFactory
   * @returns {Promise<{ coreCount: number, factoryCount: number, totalInserted: number }>}
   */
  async run(factoryCount = 6) {
    console.log('📄 [ApplicationSeeder] Seeding applications into PostgreSQL...');

    let insertedCount = 0;

    if (!db.isDbConnected) {
      console.log(`  ℹ️ PostgreSQL disconnected. Generated ${CORE_APPLICATIONS.length + factoryCount} in-memory application records.`);
      return {
        coreCount: CORE_APPLICATIONS.length,
        factoryCount: factoryCount,
        totalInserted: CORE_APPLICATIONS.length + factoryCount
      };
    }

    // 1. Insert Core Applications
    for (const a of CORE_APPLICATIONS) {
      try {
        const queryText = `
          INSERT INTO applications (id, job_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
          RETURNING id;
        `;
        const params = [
          a.id,
          a.jobId,
          a.userId,
          a.applicantName,
          a.applicantEmail,
          a.resumeUrl,
          a.coverLetter,
          a.status
        ];
        const res = await db.query(queryText, params);
        if (res.rows.length > 0) insertedCount++;
      } catch (err) {
        console.warn(`  ⚠️ Failed inserting core application ${a.id}:`, err.message);
      }
    }
    console.log(`  ✅ Inserted ${insertedCount}/${CORE_APPLICATIONS.length} core applications.`);

    // 2. Insert Factory Applications
    let factoryInserted = 0;
    if (factoryCount > 0) {
      const generated = await ApplicationFactory.create(factoryCount);
      factoryInserted = generated.length;
      console.log(`  ✅ Seeded ${factoryInserted} dynamic applications via ApplicationFactory.`);
    }

    return {
      coreCount: CORE_APPLICATIONS.length,
      factoryCount: factoryInserted,
      totalInserted: insertedCount + factoryInserted
    };
  }
}

module.exports = new ApplicationSeeder();

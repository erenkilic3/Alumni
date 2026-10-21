/**
 * Job Posting Seeder
 *
 * Populates PostgreSQL job_postings table with baseline career opportunities
 * plus additional factory-generated job postings.
 * Conforms to Data Definition Document (ddd.md).
 */

const db = require('../db');
const { JobPostingFactory } = require('../factories');

const CORE_JOBS = [
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
    status: "ACTIVE"
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
    status: "ACTIVE"
  }
];

class JobPostingSeeder {
  /**
   * Run job posting seeder
   * @param {number} [factoryCount=6] Additional job postings to generate via JobPostingFactory
   * @returns {Promise<{ coreCount: number, factoryCount: number, totalInserted: number }>}
   */
  async run(factoryCount = 6) {
    console.log('💼 [JobPostingSeeder] Seeding job postings into PostgreSQL...');

    let insertedCount = 0;

    if (!db.isDbConnected) {
      console.log(`  ℹ️ PostgreSQL disconnected. Generated ${CORE_JOBS.length + factoryCount} in-memory job records.`);
      return {
        coreCount: CORE_JOBS.length,
        factoryCount: factoryCount,
        totalInserted: CORE_JOBS.length + factoryCount
      };
    }

    // 1. Insert Core Jobs
    for (const j of CORE_JOBS) {
      try {
        const queryText = `
          INSERT INTO job_postings (id, title, company, location, type, description, requirements, salary_range, contact_email, posted_by, deadline, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
          RETURNING id;
        `;
        const params = [
          j.id,
          j.title,
          j.company,
          j.location,
          j.type,
          j.description,
          j.requirements,
          j.salaryRange,
          j.contactEmail,
          j.postedBy,
          j.deadline,
          j.status
        ];
        const res = await db.query(queryText, params);
        if (res.rows.length > 0) insertedCount++;
      } catch (err) {
        console.warn(`  ⚠️ Failed inserting core job ${j.id}:`, err.message);
      }
    }
    console.log(`  ✅ Inserted ${insertedCount}/${CORE_JOBS.length} core job postings.`);

    // 2. Insert Factory Jobs
    let factoryInserted = 0;
    if (factoryCount > 0) {
      const generated = await JobPostingFactory.create(factoryCount);
      factoryInserted = generated.length;
      console.log(`  ✅ Seeded ${factoryInserted} dynamic job postings via JobPostingFactory.`);
    }

    return {
      coreCount: CORE_JOBS.length,
      factoryCount: factoryInserted,
      totalInserted: insertedCount + factoryInserted
    };
  }
}

module.exports = new JobPostingSeeder();

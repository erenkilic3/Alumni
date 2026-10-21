/**
 * Job Posting Factory
 *
 * Generates realistic job postings, internships, and career opportunities.
 * Conforms to Data Definition Document (ddd.md).
 * Supports trait chaining: .internship(), .fullTime(), .remote(), .inCompany(), .active(), etc.
 */

const BaseFactory = require('./base.factory');
const db = require('../db');

const JOB_TITLES = [
  'Junior Backend Developer (Node.js / PostgreSQL)',
  'Data Science Intern',
  'Senior Cloud Infrastructure Engineer (Kubernetes / Go)',
  'Frontend Engineer (React / TypeScript)',
  'Full Stack Software Engineer',
  'DevOps & Site Reliability Engineer',
  'Machine Learning Research Intern',
  'Mobile Application Engineer (iOS / Swift)',
  'Product Security Specialist',
  'Cybersecurity Analyst',
  'Engineering Project Manager',
  'Associate Business Analyst'
];

const COMPANIES = [
  'Peak Tech',
  'FinAnalytica',
  'Google',
  'Amazon',
  'Spotify',
  'Tesla',
  'McKinsey & Company',
  'Getir',
  'Trendyol',
  'Insider'
];

const LOCATIONS = [
  'Remote / Istanbul',
  'Hybrid (Ankara)',
  'Zurich, Switzerland',
  'London, UK',
  'Berlin, Germany',
  'Stockholm, Sweden',
  'Istanbul, Turkey',
  'Remote (Worldwide)',
  'San Francisco, CA'
];

const JOB_TYPES = ['Full-Time', 'Part-Time', 'Internship', 'Contract'];

const DESCRIPTIONS = [
  'Join our product engineering division building mission-critical distributed services and client-facing web applications.',
  'Participate in modern microservices design, container orchestration, and continuous deployment workflows with an agile team.',
  'Work with senior data scientists and analytics managers on machine learning pipelines, ETL workflows, and reporting dashboards.',
  'Design intuitive and responsive web and mobile interfaces while collaborating closely with UX researchers and backend engineers.',
  'Help safeguard enterprise cloud architectures and perform comprehensive vulnerability assessments across microservice fleets.'
];

const REQUIREMENTS_LIST = [
  ['Node.js', 'PostgreSQL', 'Express', 'Docker', 'Git'],
  ['Python', 'Pandas', 'SQL', 'Data Visualization', 'Machine Learning Basics'],
  ['Go', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
  ['TypeScript', 'React', 'CSS3', 'REST APIs', 'Webpack'],
  ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Kafka'],
  ['C++', 'Embedded Systems', 'RTOS', 'Linux Kernel'],
  ['AWS', 'Terraform', 'Prometheus', 'Grafana', 'Security Compliance']
];

const SALARY_RANGES = [
  '$40,000 - $55,000',
  '$60,000 - $80,000',
  '$90,000 - $120,000',
  '$130,000 - $160,000',
  'Competitive / Negotiable',
  'Paid Internship ($1,500/mo)'
];

const POSTERS = [
  'Burak Demir',
  'Selin Öztürk',
  'Hakan Tosun',
  'Mehmet Raşid FamousHand',
  'Erenk3',
  'Emre Çelik',
  'Alumni Career Network'
];

class JobPostingFactory extends BaseFactory {
  definition(sequence = 1) {
    const title = BaseFactory.randomItem(JOB_TITLES);
    const company = BaseFactory.randomItem(COMPANIES);
    const location = BaseFactory.randomItem(LOCATIONS);
    const type = BaseFactory.randomItem(JOB_TYPES);
    const description = BaseFactory.randomItem(DESCRIPTIONS);
    const requirements = BaseFactory.randomItem(REQUIREMENTS_LIST);
    const salaryRange = BaseFactory.randomItem(SALARY_RANGES);
    const postedBy = BaseFactory.randomItem(POSTERS);
    const emailDomain = company.toLowerCase().replace(/[^a-z]/g, '') || 'company';
    const contactEmail = `careers@${emailDomain}.example.com`;
    const createdAt = BaseFactory.randomDate(30, 1);
    const deadlineDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * (15 + sequence * 5)).toISOString().split('T')[0];

    return {
      id: `job_${Date.now()}_${sequence}_${Math.random().toString(36).substr(2, 6)}`,
      title: `${title} #${sequence}`,
      company: company,
      location: location,
      type: type,
      description: description,
      requirements: requirements,
      salaryRange: salaryRange,
      contactEmail: contactEmail,
      postedBy: postedBy,
      deadline: deadlineDate,
      status: 'ACTIVE',
      createdAt: createdAt,
      updatedAt: createdAt
    };
  }

  // Traits
  internship() {
    return this.state({
      type: 'Internship',
      salaryRange: 'Paid Internship ($1,500/mo)'
    });
  }

  fullTime() {
    return this.state({ type: 'Full-Time' });
  }

  partTime() {
    return this.state({ type: 'Part-Time' });
  }

  contract() {
    return this.state({ type: 'Contract' });
  }

  remote() {
    return this.state({ location: 'Remote (Worldwide)' });
  }

  inCompany(companyName) {
    return this.state({
      company: companyName,
      contactEmail: `careers@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.example.com`
    });
  }

  active() {
    return this.state({ status: 'ACTIVE' });
  }

  closed() {
    return this.state({ status: 'CLOSED' });
  }

  async create(count = 1) {
    const records = this.make(count);
    if (!db.isDbConnected) {
      return records;
    }

    const inserted = [];
    for (const j of records) {
      try {
        const queryText = `
          INSERT INTO job_postings (id, title, company, location, type, description, requirements, salary_range, contact_email, posted_by, deadline, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO NOTHING
          RETURNING *;
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
          j.status,
          j.createdAt,
          j.updatedAt
        ];
        const res = await db.query(queryText, params);
        if (res.rows.length > 0) {
          inserted.push(res.rows[0]);
        }
      } catch (err) {
        console.warn('⚠️ Factory insert error:', err.message);
      }
    }
    return inserted;
  }
}

module.exports = new JobPostingFactory();

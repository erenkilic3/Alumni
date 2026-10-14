/**
 * Alumni Factory
 *
 * Generates realistic alumni profile records with company, role, skills, and mentor flags.
 * Supports trait chaining: .mentor(), .inCompany(), .graduatedIn(), .inDepartment()
 */

const BaseFactory = require('./base.factory');
const db = require('../db');

const NAMES = [
  'Hakan Tosun', 'Mehmet Raşid FamousHand', 'Erenk3', 'Emre Çelik', 'Selin Öztürk',
  'Barış Yıldırım', 'Ceren Aksoy', 'Kaan Polat', 'Zeynep Bilgin', 'Onur Erdem',
  'Melis Demir', 'Alperen Şen', 'Gizem Doğan', 'Murat Koç', 'Ece Güven',
  'Alexander Thorne', 'Sophie Martin', 'Lars Lindqvist', 'Elena Rostova', 'Marcus Vance'
];

const DEPARTMENTS = [
  'Computer Engineering',
  'Software Engineering',
  'Industrial Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Architecture',
  'Business Administration',
  'Bioengineering',
  'Data Science & AI'
];

const COMPANIES = [
  'Google', 'Amazon', 'Tesla', 'Spotify', 'Microsoft', 'Apple', 'Meta',
  'Netflix', 'McKinsey & Company', 'Peak Games', 'Getir', 'Trendyol',
  'Siemens', 'SAP', 'Salesforce', 'Stripe', 'Uber', 'Palantir'
];

const ROLES = [
  'Senior Software Engineer',
  'Lead Product Manager',
  'Cloud Solutions Architect',
  'Engineering Manager',
  'Full Stack Developer',
  'Principal Data Scientist',
  'DevOps & Platform Specialist',
  'Machine Learning Engineer',
  'Associate Consultant',
  'Hardware Systems Architect',
  'UI/UX Design Lead',
  'Cybersecurity Consultant'
];

const LOCATIONS = [
  'Istanbul, Turkey', 'Ankara, Turkey', 'Izmir, Turkey',
  'Zurich, Switzerland', 'Berlin, Germany', 'London, UK',
  'Amsterdam, Netherlands', 'Stockholm, Sweden', 'San Francisco, USA',
  'New York, USA', 'Dublin, Ireland', 'Remote'
];

const INDUSTRIES = [
  'Technology', 'E-Commerce', 'Streaming & Media', 'Automotive & AI',
  'Management Consulting', 'FinTech', 'Cloud Infrastructure',
  'Telecommunications', 'Robotics & Hardware', 'Renewable Energy'
];

const SKILLS_POOL = [
  'TypeScript', 'Node.js', 'Python', 'Go', 'Kubernetes', 'Docker',
  'AWS', 'PostgreSQL', 'React', 'Distributed Systems', 'C++', 'GraphQL',
  'Machine Learning', 'Product Strategy', 'Agile', 'Data Analytics',
  'CI/CD', 'Microservices', 'System Design', 'Cloud Architecture'
];

const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80'
];

class AlumniFactory extends BaseFactory {
  definition(sequence = 1) {
    const name = BaseFactory.randomItem(NAMES);
    const gradYear = BaseFactory.randomNumber(2012, 2024);
    const department = BaseFactory.randomItem(DEPARTMENTS);
    const company = BaseFactory.randomItem(COMPANIES);
    const role = BaseFactory.randomItem(ROLES);
    const location = BaseFactory.randomItem(LOCATIONS);
    const industry = BaseFactory.randomItem(INDUSTRIES);
    const skills = BaseFactory.randomItems(SKILLS_POOL, 3, 5);
    const avatar = BaseFactory.randomItem(AVATARS);
    const isMentor = BaseFactory.randomBoolean(0.45);
    const bio = `Graduated from ${department} in ${gradYear}. Currently working as ${role} at ${company}. ${isMentor ? 'Active student mentor.' : 'Interested in university research collaborations.'}`;

    return {
      id: `alm_${Date.now()}_${sequence}_${Math.random().toString(36).substr(2, 6)}`,
      name: `${name} ${sequence > 20 ? `(${sequence})` : ''}`.trim(),
      graduationYear: gradYear,
      department: department,
      company: company,
      role: role,
      location: location,
      industry: industry,
      skills: skills,
      avatar: avatar,
      isMentor: isMentor,
      bio: bio,
      createdAt: BaseFactory.randomDate(90, 10)
    };
  }

  // Trait states
  mentor(value = true) {
    return this.state({ isMentor: value });
  }

  inCompany(company) {
    return this.state({ company });
  }

  graduatedIn(graduationYear) {
    return this.state({ graduationYear });
  }

  inDepartment(department) {
    return this.state({ department });
  }

  withSkills(skills) {
    return this.state({ skills });
  }

  /**
   * Persist alumni record to PostgreSQL database
   */
  async insert(record) {
    if (!db.isDbConnected) {
      return record;
    }

    const res = await db.query(
      `INSERT INTO alumni (id, name, graduation_year, department, company, role, location, industry, skills, avatar, is_mentor, bio, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE
       SET name = EXCLUDED.name,
           graduation_year = EXCLUDED.graduation_year,
           department = EXCLUDED.department,
           company = EXCLUDED.company,
           role = EXCLUDED.role,
           location = EXCLUDED.location,
           industry = EXCLUDED.industry,
           skills = EXCLUDED.skills,
           avatar = EXCLUDED.avatar,
           is_mentor = EXCLUDED.is_mentor,
           bio = EXCLUDED.bio
       RETURNING id, name, graduation_year AS "graduationYear", department, company, role, location, industry, skills, avatar, is_mentor AS "isMentor", bio, created_at AS "createdAt"`,
      [
        record.id,
        record.name,
        record.graduationYear,
        record.department,
        record.company,
        record.role,
        record.location,
        record.industry,
        record.skills,
        record.avatar,
        record.isMentor !== undefined ? record.isMentor : false,
        record.bio,
        record.createdAt || new Date().toISOString()
      ]
    );

    return res.rows[0] || record;
  }
}

module.exports = new AlumniFactory();

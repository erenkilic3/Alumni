/**
 * Alumni Seeder
 *
 * Populates PostgreSQL alumni table with baseline alumni leaders
 * plus additional factory-generated alumni profiles.
 */

const db = require('../db');
const { AlumniFactory } = require('../factories');

const CORE_ALUMNI = [
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
    bio: "Graduated with honors in 2021. Open for student mentorship in cloud infrastructure."
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
    bio: "Passionate about building customer-centric products. Mentor for tech career transitions."
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
    bio: "Building audio discovery features. Alumni representative for Nordic region."
  },
  {
    id: "4",
    name: "Emre Çelik",
    graduationYear: 2018,
    department: "Electrical & Electronics Engineering",
    company: "Tesla",
    role: "Autopilot Firmware Engineer",
    location: "Berlin, Germany",
    industry: "Automotive & AI",
    skills: ["C++", "Embedded Systems", "Robotics", "Computer Vision"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isMentor: true,
    bio: "Working on automotive autonomy. Happy to connect with junior engineers."
  },
  {
    id: "5",
    name: "Selin Öztürk",
    graduationYear: 2022,
    department: "Business Administration",
    company: "McKinsey & Company",
    role: "Associate Consultant",
    location: "Istanbul, Turkey",
    industry: "Management Consulting",
    skills: ["Financial Modeling", "Corporate Strategy", "Market Research"],
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    isMentor: false,
    bio: "Consulting for energy and sustainability sectors."
  }
];

class AlumniSeeder {
  /**
   * Run alumni seeder
   * @param {number} [factoryCount=10] Additional alumni to generate via AlumniFactory
   * @returns {Promise<{ coreCount: number, factoryCount: number, totalInserted: number }>}
   */
  async run(factoryCount = 10) {
    console.log('  ▶ [AlumniSeeder] Seeding core alumni...');
    let coreInserted = 0;

    for (const al of CORE_ALUMNI) {
      if (db.isDbConnected) {
        await db.query(
          `INSERT INTO alumni (id, name, graduation_year, department, company, role, location, industry, skills, avatar, is_mentor, bio, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
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
               bio = EXCLUDED.bio`,
          [al.id, al.name, al.graduationYear, al.department, al.company, al.role, al.location, al.industry, al.skills, al.avatar, al.isMentor, al.bio]
        );
        coreInserted++;
      }
    }

    let generatedCount = 0;
    if (factoryCount > 0) {
      console.log(`  ▶ [AlumniSeeder] Generating ${factoryCount} dynamic alumni profiles via AlumniFactory...`);
      const generated = await AlumniFactory.create(factoryCount);
      generatedCount = generated.length;
    }

    console.log(`  ✅ [AlumniSeeder] Done. (Core: ${coreInserted}, Factory: ${generatedCount})`);
    return {
      coreCount: coreInserted,
      factoryCount: generatedCount,
      totalInserted: coreInserted + generatedCount
    };
  }
}

module.exports = new AlumniSeeder();

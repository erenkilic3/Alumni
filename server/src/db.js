const { Pool } = require('pg');
require('dotenv').config();

// Determine connection configuration
function createPool() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    return new Pool({ connectionString: dbUrl });
  }

  return new Pool({
    user: process.env.DB_USER || 'alumni_admin',
    password: process.env.DB_PASSWORD || 'alumni_secure_password',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'alumni_db',
  });
}

let pool = createPool();
let isDbConnected = false;

// Query helper with error logging
async function query(text, params) {
  if (!isDbConnected) {
    throw new Error('Database is not connected');
  }
  return pool.query(text, params);
}

// Connect and retry with localhost if db hostname fails (useful for running outside docker)
async function connectDb() {
  try {
    const client = await pool.connect();
    isDbConnected = true;
    client.release();
    console.log('✅ Connected to PostgreSQL database successfully');
    await initDb();
    return true;
  } catch (err) {
    // If running on host machine with DATABASE_URL pointing to "db:5432", try localhost
    if (err.message && (err.message.includes('getaddrinfo ENOTFOUND db') || err.message.includes('ENOTFOUND'))) {
      try {
        console.log('ℹ️ Attempting fallback to localhost:5432 for PostgreSQL...');
        pool = new Pool({
          user: process.env.DB_USER || 'alumni_admin',
          password: process.env.DB_PASSWORD || 'alumni_secure_password',
          host: 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'alumni_db',
        });
        const client = await pool.connect();
        isDbConnected = true;
        client.release();
        console.log('✅ Connected to PostgreSQL on localhost successfully');
        await initDb();
        return true;
      } catch (fallbackErr) {
        isDbConnected = false;
        console.log('ℹ️ PostgreSQL not immediately reachable:', fallbackErr.message);
        return false;
      }
    }
    isDbConnected = false;
    console.log('ℹ️ PostgreSQL not immediately reachable, using fallback in-memory seed store:', err.message);
    return false;
  }
}

// Initialize tables and seed initial records ONLY if empty
async function initDb() {
  if (!isDbConnected) return;

  try {
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) DEFAULT 'STUDENT',
        department VARCHAR(255) DEFAULT 'Belirtilmedi',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Announcements Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'GENERAL',
        priority VARCHAR(50) DEFAULT 'NORMAL',
        author VARCHAR(255) DEFAULT 'Alumni Staff',
        is_pinned BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Alumni Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alumni (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        graduation_year INTEGER NOT NULL,
        department VARCHAR(255) NOT NULL,
        company VARCHAR(255) DEFAULT 'Freelance / Independent',
        role VARCHAR(255) DEFAULT 'Specialist',
        location VARCHAR(255) DEFAULT 'Remote',
        industry VARCHAR(255) DEFAULT 'Technology',
        skills TEXT[] DEFAULT '{}',
        avatar TEXT,
        is_mentor BOOLEAN DEFAULT FALSE,
        bio TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Job Postings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) DEFAULT 'Remote',
        type VARCHAR(50) DEFAULT 'Full-Time',
        description TEXT NOT NULL,
        requirements TEXT[] DEFAULT '{}',
        salary_range VARCHAR(100),
        contact_email VARCHAR(255),
        posted_by VARCHAR(255) DEFAULT 'Alumni Career Network',
        deadline DATE,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed Users if table is empty
    const usersCountRes = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (parseInt(usersCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial users into PostgreSQL...');
      const seedUsers = [
        { id: "1", name: "Eren Kılıç", email: "eren@alumni.edu", role: "ADMIN", department: "Software Engineering" },
        { id: "2", name: "Ayşe Yılmaz", email: "ayse.yilmaz@google.com", role: "ALUMNI", department: "Computer Engineering" },
        { id: "3", name: "Burak Demir", email: "burak.demir@peak.com", role: "STUDENT", department: "Industrial Engineering" },
        { id: "4", name: "Mehmet Öz", email: "mehmet@tesla.com", role: "ALUMNI", department: "Electrical Engineering" },
        { id: "5", name: "Fatma Kaya", email: "fatma@alumni.edu", role: "STUDENT", department: "Architecture" },
        { id: "6", name: "hakan tosun", email: "hakatosun@student.com", role: "STUDENT", department: "doctor" },
        { id: "7", name: "memet raşit famoushand", email: "memetk3@student.com", role: "STUDENT", department: "barber" }
      ];

      for (const u of seedUsers) {
        await pool.query(
          `INSERT INTO users (id, name, email, role, department, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, u.email, u.role, u.department]
        );
      }
    }

    // Seed Announcements if table is empty
    const annCountRes = await pool.query('SELECT COUNT(*) AS count FROM announcements');
    if (parseInt(annCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial announcements into PostgreSQL...');
      const seedAnnouncements = [
        {
          id: "1",
          title: "Annual Alumni Homecoming Weekend 2026",
          content: "Join us this October for the annual Homecoming Reunion! Connect with fellow graduates, network with university faculty, and celebrate campus milestones. Registration is free for all registered alumni members.",
          category: "EVENT",
          priority: "HIGH",
          author: "Alumni Relations Office",
          isPinned: true,
          status: "ACTIVE"
        },
        {
          id: "2",
          title: "Global Tech Mentorship Program Applications Open",
          content: "We are recruiting senior engineering and product alumni to mentor graduating students. The 6-month program pairs industry leaders with ambitious undergraduates.",
          category: "CAREER",
          priority: "URGENT",
          author: "Career Development Center",
          isPinned: true,
          status: "ACTIVE"
        },
        {
          id: "3",
          title: "2026 Research Fellowship & Grant Opportunities",
          content: "Applications are now invited for international postgraduate research grants in Sustainable Energy and Artificial Intelligence. Early submission deadline is November 15.",
          category: "ACADEMIC",
          priority: "NORMAL",
          author: "Office of Academic Affairs",
          isPinned: false,
          status: "ACTIVE"
        },
        {
          id: "4",
          title: "New Digital Alumni Card & Campus Library Access",
          content: "Alumni Sphere members can now generate digital alumni IDs to access university research libraries and athletic facilities worldwide.",
          category: "GENERAL",
          priority: "NORMAL",
          author: "Alumni Relations Office",
          isPinned: false,
          status: "ACTIVE"
        }
      ];

      for (const a of seedAnnouncements) {
        await pool.query(
          `INSERT INTO announcements (id, title, content, category, priority, author, is_pinned, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.title, a.content, a.category, a.priority, a.author, a.isPinned, a.status]
        );
      }
    }

    // Seed Alumni if table is empty
    const alumniCountRes = await pool.query('SELECT COUNT(*) AS count FROM alumni');
    if (parseInt(alumniCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial alumni into PostgreSQL...');
      const seedAlumni = [
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

      for (const al of seedAlumni) {
        await pool.query(
          `INSERT INTO alumni (id, name, graduation_year, department, company, role, location, industry, skills, avatar, is_mentor, bio, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [al.id, al.name, al.graduationYear, al.department, al.company, al.role, al.location, al.industry, al.skills, al.avatar, al.isMentor, al.bio]
        );
      }
    }

    // Seed Job Postings if table is empty
    const jobsCountRes = await pool.query('SELECT COUNT(*) AS count FROM job_postings');
    if (parseInt(jobsCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial job postings into PostgreSQL...');
      const seedJobs = [
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

      for (const j of seedJobs) {
        await pool.query(
          `INSERT INTO job_postings (id, title, company, location, type, description, requirements, salary_range, contact_email, posted_by, deadline, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [j.id, j.title, j.company, j.location, j.type, j.description, j.requirements, j.salaryRange, j.contactEmail, j.postedBy, j.deadline, j.status]
        );
      }
    }

    console.log('✅ PostgreSQL schema verified and ready for persistent storage.');
  } catch (err) {
    console.error('❌ Error initializing PostgreSQL schema:', err.message);
  }
}

module.exports = {
  get pool() { return pool; },
  get isDbConnected() { return isDbConnected; },
  query,
  connectDb,
  initDb
};

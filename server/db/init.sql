-- ==============================================================================
-- Alumni Tracking System - PostgreSQL Database Initialization (DDL & Seed)
-- Conforms to Data Definition Document (ddd.md)
-- ==============================================================================

-- 1. USERS TABLE
-- Stores user accounts, administrative roles, and departments
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'STUDENT',
  department VARCHAR(255) DEFAULT 'Belirtilmedi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users (department);

-- 2. ANNOUNCEMENTS TABLE
-- Stores academic notices, campus events, and career opportunities
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'GENERAL',
  priority VARCHAR(50) DEFAULT 'NORMAL',
  author VARCHAR(255) DEFAULT 'Alumni Staff',
  user_id VARCHAR(255),
  is_pinned BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_announcements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_user_id ON announcements (user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned_priority ON announcements (is_pinned DESC, priority);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements (category);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements (status);

-- 3. ALUMNI TABLE
-- Stores alumni professional career profiles, skills, and mentorship availability
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
  user_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_alumni_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_alumni_user_id ON alumni (user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_graduation_year ON alumni (graduation_year);
CREATE INDEX IF NOT EXISTS idx_alumni_department ON alumni (department);
CREATE INDEX IF NOT EXISTS idx_alumni_industry ON alumni (industry);

-- 4. JOB_POSTINGS TABLE
-- Stores career, internship, and employment postings from alumni and partners
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
  user_id VARCHAR(255),
  alumni_id VARCHAR(255),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_job_postings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_job_postings_alumni FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE SET NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings (user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_alumni_id ON job_postings (alumni_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings (posted_by);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);
CREATE INDEX IF NOT EXISTS idx_job_postings_deadline ON job_postings (deadline);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings (type);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings (company);

-- ==============================================================================
-- INITIAL SEED DATA (Conforms to ddd.md Sample Records)
-- ==============================================================================

-- Seed Users
INSERT INTO users (id, name, email, role, department, created_at, updated_at)
VALUES
  ('1', 'Eren Kılıç', 'eren@alumni.edu', 'ADMIN', 'Software Engineering', NOW(), NOW()),
  ('2', 'Ayşe Yılmaz', 'ayse.yilmaz@google.com', 'ALUMNI', 'Computer Engineering', NOW(), NOW()),
  ('3', 'Burak Demir', 'burak.demir@peak.com', 'STUDENT', 'Industrial Engineering', NOW(), NOW()),
  ('4', 'Mehmet Öz', 'mehmet@tesla.com', 'ALUMNI', 'Electrical Engineering', NOW(), NOW()),
  ('5', 'Fatma Kaya', 'fatma@alumni.edu', 'STUDENT', 'Architecture', NOW(), NOW()),
  ('6', 'hakan tosun', 'hakatosun@student.com', 'STUDENT', 'doctor', NOW(), NOW()),
  ('7', 'memet raşit famoushand', 'memetk3@student.com', 'STUDENT', 'barber', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Announcements
INSERT INTO announcements (id, title, content, category, priority, author, is_pinned, status, created_at, updated_at)
VALUES
  (
    '1',
    'Annual Alumni Homecoming Weekend 2026',
    'Join us this October for the annual Homecoming Reunion! Connect with fellow graduates, network with university faculty, and celebrate campus milestones. Registration is free for all registered alumni members.',
    'EVENT',
    'HIGH',
    'Alumni Relations Office',
    TRUE,
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    '2',
    'Global Tech Mentorship Program Applications Open',
    'We are recruiting senior engineering and product alumni to mentor graduating students. The 6-month program pairs industry leaders with ambitious undergraduates.',
    'CAREER',
    'URGENT',
    'Career Development Center',
    TRUE,
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    '3',
    '2026 Research Fellowship & Grant Opportunities',
    'Applications are now invited for international postgraduate research grants in Sustainable Energy and Artificial Intelligence. Early submission deadline is November 15.',
    'ACADEMIC',
    'NORMAL',
    'Office of Academic Affairs',
    FALSE,
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    '4',
    'New Digital Alumni Card & Campus Library Access',
    'Alumni Sphere members can now generate digital alumni IDs to access university research libraries and athletic facilities worldwide.',
    'GENERAL',
    'NORMAL',
    'Alumni Relations Office',
    FALSE,
    'ACTIVE',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Alumni
INSERT INTO alumni (id, name, graduation_year, department, company, role, location, industry, skills, avatar, is_mentor, bio, created_at)
VALUES
  (
    '1',
    'Hakan Tosun',
    2021,
    'Computer Engineering',
    'Google',
    'Senior Software Engineer',
    'Zurich, Switzerland',
    'Technology',
    ARRAY['Go', 'Kubernetes', 'Distributed Systems', 'Cloud'],
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    TRUE,
    'Graduated with honors in 2021. Open for student mentorship in cloud infrastructure.',
    NOW()
  ),
  (
    '2',
    'Mehmet Raşid FamousHand',
    2019,
    'Industrial Engineering',
    'Amazon',
    'Lead Product Manager',
    'Çorum',
    'E-Commerce',
    ARRAY['Product Strategy', 'Agile', 'Data Analytics', 'UX'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    TRUE,
    'Passionate about building customer-centric products. Mentor for tech career transitions.',
    NOW()
  ),
  (
    '3',
    'Erenk3',
    2023,
    'Software Engineering',
    'Spotify',
    'Full Stack Engineer',
    'Stockholm, Sweden',
    'Streaming & Media',
    ARRAY['TypeScript', 'Node.js', 'React', 'PostgreSQL'],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    FALSE,
    'Building audio discovery features. Alumni representative for Nordic region.',
    NOW()
  ),
  (
    '4',
    'Emre Çelik',
    2018,
    'Electrical & Electronics Engineering',
    'Tesla',
    'Autopilot Firmware Engineer',
    'Berlin, Germany',
    'Automotive & AI',
    ARRAY['C++', 'Embedded Systems', 'Robotics', 'Computer Vision'],
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    TRUE,
    'Working on automotive autonomy. Happy to connect with junior engineers.',
    NOW()
  ),
  (
    '5',
    'Selin Öztürk',
    2022,
    'Business Administration',
    'McKinsey & Company',
    'Associate Consultant',
    'Istanbul, Turkey',
    'Management Consulting',
    ARRAY['Financial Modeling', 'Corporate Strategy', 'Market Research'],
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    FALSE,
    'Consulting for energy and sustainability sectors.',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Job Postings
INSERT INTO job_postings (id, title, company, location, type, description, requirements, salary_range, contact_email, posted_by, deadline, status, created_at, updated_at)
VALUES
  (
    'job-1',
    'Junior Backend Developer (Node.js / PostgreSQL)',
    'Peak Tech',
    'Remote / Istanbul',
    'Full-Time',
    'We are seeking a junior backend engineer to join our high-growth platform team working on scalable REST APIs and PostgreSQL databases.',
    ARRAY['Node.js', 'PostgreSQL', 'Express', 'Docker', 'Git'],
    '$40,000 - $55,000',
    'careers@peaktech.example.com',
    'Burak Demir',
    '2026-10-15',
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    'job-2',
    'Data Science Intern',
    'FinAnalytica',
    'Hybrid (Ankara)',
    'Internship',
    'Join our financial analytics lab to assist senior data scientists in predictive modeling, statistical reporting, and dashboard creation.',
    ARRAY['Python', 'Pandas', 'SQL', 'Data Visualization', 'Machine Learning Basics'],
    'Paid Internship',
    'interns@finanalytica.example.com',
    'Selin Öztürk',
    '2026-11-01',
    'ACTIVE',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;


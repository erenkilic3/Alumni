-- ==============================================================================
-- Migration 005: Create Job Postings Table & Define Model Relationships
-- Conforms to Data Definition Document (ddd.md)
--
-- Model: JobPosting (job_postings)
-- Entity Relationships:
--   - USERS (1)  --->  (N) JOB_POSTINGS   (user_id FK -> users.id)
--   - ALUMNI (1) --->  (N) JOB_POSTINGS   (alumni_id FK -> alumni.id)
-- ==============================================================================

-- UP
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

  -- Foreign Key Constraints (Model Relationships)
  CONSTRAINT fk_job_postings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_job_postings_alumni FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE SET NULL
);

-- Performance & Relational Indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings (user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_alumni_id ON job_postings (alumni_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings (posted_by);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);
CREATE INDEX IF NOT EXISTS idx_job_postings_deadline ON job_postings (deadline);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings (type);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings (company);

-- Initial Seed Data (Conforms to ddd.md Sample Records with Foreign Keys)
INSERT INTO job_postings (id, title, company, location, type, description, requirements, salary_range, contact_email, posted_by, user_id, alumni_id, deadline, status, created_at, updated_at)
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
    '3',
    NULL,
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
    '5',
    '5',
    '2026-11-01',
    'ACTIVE',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- DOWN
ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS fk_job_postings_alumni;
ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS fk_job_postings_user;
DROP INDEX IF EXISTS idx_job_postings_alumni_id;
DROP INDEX IF EXISTS idx_job_postings_user_id;
DROP INDEX IF EXISTS idx_job_postings_company;
DROP INDEX IF EXISTS idx_job_postings_type;
DROP INDEX IF EXISTS idx_job_postings_deadline;
DROP INDEX IF EXISTS idx_job_postings_status;
DROP INDEX IF EXISTS idx_job_postings_posted_by;
DROP TABLE IF EXISTS job_postings CASCADE;

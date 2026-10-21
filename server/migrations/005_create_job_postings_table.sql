-- ==============================================================================
-- Migration 005: Create Job Postings Table
-- Conforms to Data Definition Document (ddd.md)
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
  deadline DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings (posted_by);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);
CREATE INDEX IF NOT EXISTS idx_job_postings_deadline ON job_postings (deadline);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings (type);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings (company);

-- Initial Seed Data (Conforms to ddd.md Sample Records)
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

-- DOWN
DROP INDEX IF EXISTS idx_job_postings_company;
DROP INDEX IF EXISTS idx_job_postings_type;
DROP INDEX IF EXISTS idx_job_postings_deadline;
DROP INDEX IF EXISTS idx_job_postings_status;
DROP INDEX IF EXISTS idx_job_postings_posted_by;
DROP TABLE IF EXISTS job_postings CASCADE;

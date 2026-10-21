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

CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings (posted_by);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);
CREATE INDEX IF NOT EXISTS idx_job_postings_deadline ON job_postings (deadline);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings (type);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings (company);

-- DOWN
DROP INDEX IF EXISTS idx_job_postings_company;
DROP INDEX IF EXISTS idx_job_postings_type;
DROP INDEX IF EXISTS idx_job_postings_deadline;
DROP INDEX IF EXISTS idx_job_postings_status;
DROP INDEX IF EXISTS idx_job_postings_posted_by;
DROP TABLE IF EXISTS job_postings CASCADE;

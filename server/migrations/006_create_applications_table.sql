-- ==============================================================================
-- Migration 006: Create Applications Table & Define Model Relationships
-- Conforms to Data Definition Document (ddd.md)
--
-- Model: Application (applications)
-- Entity Relationships:
--   - USERS (1)        --->  (N) APPLICATIONS   (user_id FK -> users.id)
--   - JOB_POSTINGS (1) --->  (N) APPLICATIONS   (job_id FK -> job_postings.id)
-- ==============================================================================

-- UP
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(255) PRIMARY KEY,
  job_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  applicant_name VARCHAR(255),
  applicant_email VARCHAR(255),
  resume_url TEXT,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign Key Constraints (Model Relationships)
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance & Relational Indexes
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);

-- Initial Seed Data (Conforms to ddd.md Sample Records with Foreign Keys)
INSERT INTO applications (id, job_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at)
VALUES
  (
    'app-1',
    'job-1',
    '3',
    'Burak Demir',
    'burak.demir@peak.com',
    'https://storage.example.com/resumes/burak-demir-cv.pdf',
    'I am passionate about backend distributed systems with Node.js and PostgreSQL.',
    'PENDING',
    NOW(),
    NOW()
  ),
  (
    'app-2',
    'job-2',
    '2',
    'Ayşe Yılmaz',
    'ayse.yilmaz@google.com',
    'https://storage.example.com/resumes/ayse-yilmaz-cv.pdf',
    'Eager to contribute to data analytics and machine learning modeling.',
    'REVIEWING',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- DOWN
ALTER TABLE applications DROP CONSTRAINT IF EXISTS fk_applications_user;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS fk_applications_job;
DROP INDEX IF EXISTS idx_applications_created_at;
DROP INDEX IF EXISTS idx_applications_status;
DROP INDEX IF EXISTS idx_applications_user_id;
DROP INDEX IF EXISTS idx_applications_job_id;
DROP TABLE IF EXISTS applications CASCADE;

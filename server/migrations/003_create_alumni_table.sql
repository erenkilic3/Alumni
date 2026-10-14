-- ==============================================================================
-- Migration 003: Create Alumni Table
-- Conforms to Data Definition Document (ddd.md)
-- ==============================================================================

-- UP
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

CREATE INDEX IF NOT EXISTS idx_alumni_graduation_year ON alumni (graduation_year);
CREATE INDEX IF NOT EXISTS idx_alumni_department ON alumni (department);
CREATE INDEX IF NOT EXISTS idx_alumni_industry ON alumni (industry);
CREATE INDEX IF NOT EXISTS idx_alumni_is_mentor ON alumni (is_mentor);

-- DOWN
DROP INDEX IF EXISTS idx_alumni_is_mentor;
DROP INDEX IF EXISTS idx_alumni_industry;
DROP INDEX IF EXISTS idx_alumni_department;
DROP INDEX IF EXISTS idx_alumni_graduation_year;
DROP TABLE IF EXISTS alumni CASCADE;

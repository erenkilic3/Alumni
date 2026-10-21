-- ==============================================================================
-- Migration 001: Create Users Table & Define Root Identity Model
-- Conforms to Data Definition Document (ddd.md)
--
-- Model: User (users)
-- Entity Relationships:
--   - USERS (1)  --->  (1) ALUMNI        (referenced by alumni.user_id)
--   - USERS (1)  --->  (N) ANNOUNCEMENTS (referenced by announcements.user_id)
--   - USERS (1)  --->  (N) JOB_POSTINGS  (referenced by job_postings.user_id)
-- ==============================================================================

-- UP
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'STUDENT',
  department VARCHAR(255) DEFAULT 'Belirtilmedi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users (department);

-- DOWN
DROP INDEX IF EXISTS idx_users_department;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users CASCADE;

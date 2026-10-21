-- ==============================================================================
-- Migration 002: Create Announcements Table & Define Model Relationships
-- Conforms to Data Definition Document (ddd.md)
--
-- Model: Announcement (announcements)
-- Entity Relationships:
--   - USERS (1)  --->  (N) ANNOUNCEMENTS (user_id FK -> users.id)
-- ==============================================================================

-- UP
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

  -- Foreign Key Constraint (Model Relationship)
  CONSTRAINT fk_announcements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Performance & Relational Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_user_id ON announcements (user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned_priority ON announcements (is_pinned DESC, priority);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements (category);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements (status);

-- DOWN
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS fk_announcements_user;
DROP INDEX IF EXISTS idx_announcements_status;
DROP INDEX IF EXISTS idx_announcements_category;
DROP INDEX IF EXISTS idx_announcements_pinned_priority;
DROP INDEX IF EXISTS idx_announcements_user_id;
DROP TABLE IF EXISTS announcements CASCADE;

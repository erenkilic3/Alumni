-- ==============================================================================
-- Migration 002: Create Announcements Table
-- Conforms to Data Definition Document (ddd.md)
-- ==============================================================================

-- UP
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

CREATE INDEX IF NOT EXISTS idx_announcements_pinned_priority ON announcements (is_pinned DESC, priority);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements (category);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements (status);

-- DOWN
DROP INDEX IF EXISTS idx_announcements_status;
DROP INDEX IF EXISTS idx_announcements_category;
DROP INDEX IF EXISTS idx_announcements_pinned_priority;
DROP TABLE IF EXISTS announcements CASCADE;

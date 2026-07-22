-- Phase 0: Add archival columns to existing tables
ALTER TABLE systematic_lessons 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_reason TEXT;

ALTER TABLE adaptive_content 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_reason TEXT;

-- Update existing content to archived status
UPDATE systematic_lessons 
SET status = 'archived', 
    archived_at = NOW(),
    archived_reason = 'Legacy curriculum reset for 1:1 Kids Program'
WHERE status != 'archived';

UPDATE adaptive_content 
SET is_active = false,
    archived_at = NOW(),
    archived_reason = 'Legacy curriculum reset for 1:1 Kids Program'
WHERE is_active = true;
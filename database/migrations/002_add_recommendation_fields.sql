-- Migration: Add action_steps, is_ai_generated, and ai_provider to recommendations table
-- Run this if you have an existing database

-- Add action_steps column (JSON for storing detailed steps)
ALTER TABLE recommendations 
ADD COLUMN IF NOT EXISTS action_steps JSON AFTER priority;

-- Add is_ai_generated flag
ALTER TABLE recommendations 
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE AFTER action_steps;

-- Add ai_provider column for AI-generated recommendations
ALTER TABLE recommendations 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50) AFTER is_ai_generated;

-- For MySQL versions that don't support IF NOT EXISTS in ALTER TABLE:
-- Run these instead (they will error if column already exists, which is fine):
-- ALTER TABLE recommendations ADD COLUMN action_steps JSON;
-- ALTER TABLE recommendations ADD COLUMN is_ai_generated BOOLEAN DEFAULT FALSE;
-- ALTER TABLE recommendations ADD COLUMN ai_provider VARCHAR(50);

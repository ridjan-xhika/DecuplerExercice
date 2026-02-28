-- Docker MySQL initialization script
-- This runs automatically when the MySQL container starts

CREATE DATABASE IF NOT EXISTS ai_visibility;
USE ai_visibility;

-- Source the main schema
SOURCE /docker-entrypoint-initdb.d/schema.sql;

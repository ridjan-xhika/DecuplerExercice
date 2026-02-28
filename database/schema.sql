-- AI Visibility Tracker Database Schema

CREATE DATABASE IF NOT EXISTS ai_visibility;
USE ai_visibility;

-- Domains table: stores analyzed brands/domains
CREATE TABLE IF NOT EXISTS domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain_name VARCHAR(255) NOT NULL UNIQUE,
  industry VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prompts table: stores generated queries for each domain
CREATE TABLE IF NOT EXISTS prompts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain_id INT NOT NULL,
  query_text TEXT NOT NULL,
  query_type VARCHAR(50), -- 'comparison', 'alternative', 'recommendation', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- AI Responses table: stores raw responses from LLM providers
CREATE TABLE IF NOT EXISTS ai_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prompt_id INT NOT NULL,
  ai_provider VARCHAR(50) NOT NULL, -- 'chatgpt', 'gemini', 'perplexity'
  response_text TEXT NOT NULL,
  response_time_ms INT, -- response latency
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

-- Brand Mentions table: extracted brand mentions from responses
CREATE TABLE IF NOT EXISTS brand_mentions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  response_id INT NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  position INT NOT NULL, -- 1 = first mentioned, 2 = second, etc.
  sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  context_snippet TEXT, -- surrounding text where brand was mentioned
  is_target_brand BOOLEAN DEFAULT FALSE, -- true if this is the domain being analyzed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (response_id) REFERENCES ai_responses(id) ON DELETE CASCADE
);

-- Competitors table: identified competitors from responses
CREATE TABLE IF NOT EXISTS competitors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  response_id INT NOT NULL,
  competitor_name VARCHAR(255) NOT NULL,
  position INT NOT NULL, -- mention order
  mentioned_before_target BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (response_id) REFERENCES ai_responses(id) ON DELETE CASCADE
);

-- Visibility Scores table: historical visibility scores
CREATE TABLE IF NOT EXISTS visibility_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain_id INT NOT NULL,
  score DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
  total_queries INT DEFAULT 0,
  total_mentions INT DEFAULT 0,
  top1_count INT DEFAULT 0, -- times brand was mentioned first
  top3_count INT DEFAULT 0, -- times brand was in top 3
  avg_position DECIMAL(4,2), -- average mention position
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Recommendations table: generated improvement suggestions
CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain_id INT NOT NULL,
  score_id INT, -- linked to the visibility score that triggered this
  recommendation_type VARCHAR(50), -- 'content', 'positioning', 'competitor_gap', 'ai_generated'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
  action_steps JSON, -- detailed action steps with timeframes
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_provider VARCHAR(50), -- 'ollama', 'gemini', etc. if AI generated
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  FOREIGN KEY (score_id) REFERENCES visibility_scores(id) ON DELETE SET NULL
);

-- Indexes for better query performance
CREATE INDEX idx_prompts_domain ON prompts(domain_id);
CREATE INDEX idx_responses_prompt ON ai_responses(prompt_id);
CREATE INDEX idx_responses_provider ON ai_responses(ai_provider);
CREATE INDEX idx_mentions_response ON brand_mentions(response_id);
CREATE INDEX idx_mentions_brand ON brand_mentions(brand_name);
CREATE INDEX idx_competitors_response ON competitors(response_id);
CREATE INDEX idx_scores_domain ON visibility_scores(domain_id);
CREATE INDEX idx_scores_date ON visibility_scores(created_at);
CREATE INDEX idx_recommendations_domain ON recommendations(domain_id);

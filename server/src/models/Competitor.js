const { pool } = require('../config/db');

const Competitor = {
  // Create a new competitor entry
  async create(responseId, competitorName, position, mentionedBeforeTarget = false) {
    const [result] = await pool.query(
      `INSERT INTO competitors (response_id, competitor_name, position, mentioned_before_target) 
       VALUES (?, ?, ?, ?)`,
      [responseId, competitorName, position, mentionedBeforeTarget]
    );
    return { 
      id: result.insertId, 
      response_id: responseId, 
      competitor_name: competitorName, 
      position,
      mentioned_before_target: mentionedBeforeTarget
    };
  },

  // Create multiple competitors
  async createBatch(competitors) {
    const values = competitors.map(c => [
      c.responseId, c.competitorName, c.position, c.mentionedBeforeTarget || false
    ]);
    const [result] = await pool.query(
      `INSERT INTO competitors (response_id, competitor_name, position, mentioned_before_target) VALUES ?`,
      [values]
    );
    return { insertedCount: result.affectedRows };
  },

  // Get competitors by response ID
  async findByResponseId(responseId) {
    const [rows] = await pool.query(
      'SELECT * FROM competitors WHERE response_id = ? ORDER BY position ASC',
      [responseId]
    );
    return rows;
  },

  // Get all competitors for a domain
  async findByDomainId(domainId) {
    const [rows] = await pool.query(
      `SELECT c.*, ar.ai_provider, p.query_text
       FROM competitors c
       JOIN ai_responses ar ON c.response_id = ar.id
       JOIN prompts p ON ar.prompt_id = p.id
       WHERE p.domain_id = ?
       ORDER BY c.position ASC`,
      [domainId]
    );
    return rows;
  },

  // Get top competitors (most mentioned)
  async getTopCompetitors(domainId, limit = 10) {
    const [rows] = await pool.query(
      `SELECT competitor_name, COUNT(*) as mention_count, AVG(position) as avg_position
       FROM competitors c
       JOIN ai_responses ar ON c.response_id = ar.id
       JOIN prompts p ON ar.prompt_id = p.id
       WHERE p.domain_id = ?
       GROUP BY competitor_name
       ORDER BY mention_count DESC, avg_position ASC
       LIMIT ?`,
      [domainId, limit]
    );
    return rows;
  },

  // Get competitors that appear before target brand
  async getCompetitorsBeforeTarget(domainId) {
    const [rows] = await pool.query(
      `SELECT competitor_name, COUNT(*) as times_before
       FROM competitors c
       JOIN ai_responses ar ON c.response_id = ar.id
       JOIN prompts p ON ar.prompt_id = p.id
       WHERE p.domain_id = ? AND c.mentioned_before_target = TRUE
       GROUP BY competitor_name
       ORDER BY times_before DESC`,
      [domainId]
    );
    return rows;
  },

  // Delete by response ID
  async deleteByResponseId(responseId) {
    const [result] = await pool.query('DELETE FROM competitors WHERE response_id = ?', [responseId]);
    return result.affectedRows;
  }
};

module.exports = Competitor;

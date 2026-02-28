const { pool } = require('../config/db');

const AIResponse = {
  // Create a new AI response
  async create(promptId, aiProvider, responseText, responseTimeMs = null) {
    const [result] = await pool.query(
      'INSERT INTO ai_responses (prompt_id, ai_provider, response_text, response_time_ms) VALUES (?, ?, ?, ?)',
      [promptId, aiProvider, responseText, responseTimeMs]
    );
    return { 
      id: result.insertId, 
      prompt_id: promptId, 
      ai_provider: aiProvider, 
      response_text: responseText,
      response_time_ms: responseTimeMs
    };
  },

  // Get response by ID
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM ai_responses WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Get all responses for a prompt
  async findByPromptId(promptId) {
    const [rows] = await pool.query(
      'SELECT * FROM ai_responses WHERE prompt_id = ? ORDER BY created_at DESC',
      [promptId]
    );
    return rows;
  },

  // Get responses by provider
  async findByProvider(aiProvider) {
    const [rows] = await pool.query(
      'SELECT * FROM ai_responses WHERE ai_provider = ? ORDER BY created_at DESC',
      [aiProvider]
    );
    return rows;
  },

  // Get responses for a domain (via prompts join)
  async findByDomainId(domainId) {
    const [rows] = await pool.query(
      `SELECT ar.*, p.query_text, p.query_type 
       FROM ai_responses ar
       JOIN prompts p ON ar.prompt_id = p.id
       WHERE p.domain_id = ?
       ORDER BY ar.created_at DESC`,
      [domainId]
    );
    return rows;
  },

  // Delete response
  async delete(id) {
    const [result] = await pool.query('DELETE FROM ai_responses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Get average response time by provider
  async getAvgResponseTime(aiProvider) {
    const [rows] = await pool.query(
      'SELECT AVG(response_time_ms) as avg_time FROM ai_responses WHERE ai_provider = ?',
      [aiProvider]
    );
    return rows[0]?.avg_time || null;
  }
};

module.exports = AIResponse;

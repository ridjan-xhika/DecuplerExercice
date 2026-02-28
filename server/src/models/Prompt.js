const { pool } = require('../config/db');

const Prompt = {
  // Create a new prompt
  async create(domainId, queryText, queryType = null) {
    const [result] = await pool.query(
      'INSERT INTO prompts (domain_id, query_text, query_type) VALUES (?, ?, ?)',
      [domainId, queryText, queryType]
    );
    return { id: result.insertId, domain_id: domainId, query_text: queryText, query_type: queryType };
  },

  // Create multiple prompts
  async createBatch(domainId, prompts) {
    const values = prompts.map(p => [domainId, p.queryText, p.queryType || null]);
    const [result] = await pool.query(
      'INSERT INTO prompts (domain_id, query_text, query_type) VALUES ?',
      [values]
    );
    return { insertedCount: result.affectedRows, firstId: result.insertId };
  },

  // Get prompt by ID
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM prompts WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Get all prompts for a domain
  async findByDomainId(domainId) {
    const [rows] = await pool.query(
      'SELECT * FROM prompts WHERE domain_id = ? ORDER BY created_at DESC',
      [domainId]
    );
    return rows;
  },

  // Get prompts by type
  async findByType(domainId, queryType) {
    const [rows] = await pool.query(
      'SELECT * FROM prompts WHERE domain_id = ? AND query_type = ?',
      [domainId, queryType]
    );
    return rows;
  },

  // Delete prompt
  async delete(id) {
    const [result] = await pool.query('DELETE FROM prompts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Delete all prompts for a domain
  async deleteByDomainId(domainId) {
    const [result] = await pool.query('DELETE FROM prompts WHERE domain_id = ?', [domainId]);
    return result.affectedRows;
  }
};

module.exports = Prompt;

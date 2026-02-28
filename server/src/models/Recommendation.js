const { pool } = require('../config/db');

const Recommendation = {
  // Create a new recommendation
  async create(domainId, data) {
    const { scoreId = null, type, title, description, priority = 'medium' } = data;
    
    const [result] = await pool.query(
      `INSERT INTO recommendations (domain_id, score_id, recommendation_type, title, description, priority) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [domainId, scoreId, type, title, description, priority]
    );
    return { 
      id: result.insertId, 
      domain_id: domainId,
      score_id: scoreId,
      recommendation_type: type,
      title,
      description,
      priority
    };
  },

  // Create multiple recommendations
  async createBatch(recommendations) {
    const values = recommendations.map(r => [
      r.domainId, r.scoreId || null, r.type, r.title, r.description, r.priority || 'medium'
    ]);
    const [result] = await pool.query(
      `INSERT INTO recommendations (domain_id, score_id, recommendation_type, title, description, priority) VALUES ?`,
      [values]
    );
    return { insertedCount: result.affectedRows };
  },

  // Get recommendations by domain ID
  async findByDomainId(domainId) {
    const [rows] = await pool.query(
      'SELECT * FROM recommendations WHERE domain_id = ? ORDER BY FIELD(priority, "high", "medium", "low"), created_at DESC',
      [domainId]
    );
    return rows;
  },

  // Get recommendations by score ID
  async findByScoreId(scoreId) {
    const [rows] = await pool.query(
      'SELECT * FROM recommendations WHERE score_id = ? ORDER BY FIELD(priority, "high", "medium", "low")',
      [scoreId]
    );
    return rows;
  },

  // Get latest recommendations for a domain
  async findLatest(domainId, limit = 10) {
    const [rows] = await pool.query(
      'SELECT * FROM recommendations WHERE domain_id = ? ORDER BY created_at DESC LIMIT ?',
      [domainId, limit]
    );
    return rows;
  },

  // Get recommendations by type
  async findByType(domainId, type) {
    const [rows] = await pool.query(
      'SELECT * FROM recommendations WHERE domain_id = ? AND recommendation_type = ?',
      [domainId, type]
    );
    return rows;
  },

  // Delete recommendations for a domain
  async deleteByDomainId(domainId) {
    const [result] = await pool.query('DELETE FROM recommendations WHERE domain_id = ?', [domainId]);
    return result.affectedRows;
  },

  // Delete by score ID
  async deleteByScoreId(scoreId) {
    const [result] = await pool.query('DELETE FROM recommendations WHERE score_id = ?', [scoreId]);
    return result.affectedRows;
  }
};

module.exports = Recommendation;

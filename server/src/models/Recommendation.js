const { pool } = require('../config/db');

const Recommendation = {
  // Create a new recommendation
  async create(domainId, data) {
    const { 
      scoreId = null, 
      type, 
      title, 
      description, 
      priority = 'medium',
      actionSteps = null,
      isAiGenerated = false,
      aiProvider = null
    } = data;
    
    const actionStepsJson = actionSteps ? JSON.stringify(actionSteps) : null;
    
    const [result] = await pool.query(
      `INSERT INTO recommendations 
       (domain_id, score_id, recommendation_type, title, description, priority, action_steps, is_ai_generated, ai_provider) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [domainId, scoreId, type, title, description, priority, actionStepsJson, isAiGenerated, aiProvider]
    );
    return { 
      id: result.insertId, 
      domain_id: domainId,
      score_id: scoreId,
      recommendation_type: type,
      title,
      description,
      priority,
      action_steps: actionSteps,
      is_ai_generated: isAiGenerated,
      ai_provider: aiProvider
    };
  },

  // Create multiple recommendations
  async createBatch(recommendations) {
    const values = recommendations.map(r => [
      r.domainId, 
      r.scoreId || null, 
      r.type, 
      r.title, 
      r.description, 
      r.priority || 'medium',
      r.actionSteps ? JSON.stringify(r.actionSteps) : null,
      r.isAiGenerated || false,
      r.aiProvider || null
    ]);
    const [result] = await pool.query(
      `INSERT INTO recommendations 
       (domain_id, score_id, recommendation_type, title, description, priority, action_steps, is_ai_generated, ai_provider) 
       VALUES ?`,
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
    // Parse JSON action_steps
    return rows.map(row => ({
      ...row,
      action_steps: row.action_steps ? JSON.parse(row.action_steps) : null
    }));
  },

  // Get recommendations by score ID
  async findByScoreId(scoreId) {
    const [rows] = await pool.query(
      'SELECT * FROM recommendations WHERE score_id = ? ORDER BY FIELD(priority, "high", "medium", "low")',
      [scoreId]
    );
    return rows.map(row => ({
      ...row,
      action_steps: row.action_steps ? JSON.parse(row.action_steps) : null
    }));
  },

  // Get latest recommendations for a domain
  async findLatest(domainId, limit = 10) {
    const [rows] = await pool.query(
      'SELECT * FROM recommendations WHERE domain_id = ? ORDER BY created_at DESC LIMIT ?',
      [domainId, limit]
    );
    return rows.map(row => ({
      ...row,
      action_steps: row.action_steps ? JSON.parse(row.action_steps) : null
    }));
  },

  // Get AI-generated recommendations for a domain
  async findAIGenerated(domainId) {
    const [rows] = await pool.query(
      'SELECT * FROM recommendations WHERE domain_id = ? AND is_ai_generated = TRUE ORDER BY created_at DESC',
      [domainId]
    );
    return rows;
  },

  // Get standard (non-AI) recommendations for a domain
  async findStandard(domainId) {
    const [rows] = await pool.query(
      'SELECT * FROM recommendations WHERE domain_id = ? AND is_ai_generated = FALSE ORDER BY FIELD(priority, "high", "medium", "low")',
      [domainId]
    );
    return rows.map(row => ({
      ...row,
      action_steps: row.action_steps ? JSON.parse(row.action_steps) : null
    }));
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

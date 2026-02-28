const { pool } = require('../config/db');

const BrandMention = {
  // Create a new brand mention
  async create(responseId, brandName, position, { sentiment = null, contextSnippet = null, isTargetBrand = false } = {}) {
    const [result] = await pool.query(
      `INSERT INTO brand_mentions (response_id, brand_name, position, sentiment, context_snippet, is_target_brand) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [responseId, brandName, position, sentiment, contextSnippet, isTargetBrand]
    );
    return { 
      id: result.insertId, 
      response_id: responseId, 
      brand_name: brandName, 
      position,
      sentiment,
      context_snippet: contextSnippet,
      is_target_brand: isTargetBrand
    };
  },

  // Create multiple mentions
  async createBatch(mentions) {
    const values = mentions.map(m => [
      m.responseId, m.brandName, m.position, 
      m.sentiment || null, m.contextSnippet || null, m.isTargetBrand || false
    ]);
    const [result] = await pool.query(
      `INSERT INTO brand_mentions (response_id, brand_name, position, sentiment, context_snippet, is_target_brand) VALUES ?`,
      [values]
    );
    return { insertedCount: result.affectedRows };
  },

  // Get mentions by response ID
  async findByResponseId(responseId) {
    const [rows] = await pool.query(
      'SELECT * FROM brand_mentions WHERE response_id = ? ORDER BY position ASC',
      [responseId]
    );
    return rows;
  },

  // Get target brand mentions for a domain
  async findTargetMentions(domainId) {
    const [rows] = await pool.query(
      `SELECT bm.*, ar.ai_provider, p.query_text
       FROM brand_mentions bm
       JOIN ai_responses ar ON bm.response_id = ar.id
       JOIN prompts p ON ar.prompt_id = p.id
       WHERE p.domain_id = ? AND bm.is_target_brand = TRUE
       ORDER BY bm.position ASC`,
      [domainId]
    );
    return rows;
  },

  // Get mention statistics for a domain
  async getStats(domainId) {
    const [rows] = await pool.query(
      `SELECT 
         COUNT(*) as total_mentions,
         SUM(CASE WHEN is_target_brand = TRUE THEN 1 ELSE 0 END) as target_mentions,
         SUM(CASE WHEN position = 1 AND is_target_brand = TRUE THEN 1 ELSE 0 END) as top1_count,
         SUM(CASE WHEN position <= 3 AND is_target_brand = TRUE THEN 1 ELSE 0 END) as top3_count,
         AVG(CASE WHEN is_target_brand = TRUE THEN position ELSE NULL END) as avg_position
       FROM brand_mentions bm
       JOIN ai_responses ar ON bm.response_id = ar.id
       JOIN prompts p ON ar.prompt_id = p.id
       WHERE p.domain_id = ?`,
      [domainId]
    );
    return rows[0];
  },

  // Delete mentions by response ID
  async deleteByResponseId(responseId) {
    const [result] = await pool.query('DELETE FROM brand_mentions WHERE response_id = ?', [responseId]);
    return result.affectedRows;
  }
};

module.exports = BrandMention;

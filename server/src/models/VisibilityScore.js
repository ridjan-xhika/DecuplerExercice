const { pool } = require('../config/db');

const VisibilityScore = {
  // Create a new visibility score
  async create(domainId, scoreData) {
    const { score, totalQueries = 0, totalMentions = 0, top1Count = 0, top3Count = 0, avgPosition = null } = scoreData;
    
    const [result] = await pool.query(
      `INSERT INTO visibility_scores (domain_id, score, total_queries, total_mentions, top1_count, top3_count, avg_position) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [domainId, score, totalQueries, totalMentions, top1Count, top3Count, avgPosition]
    );
    return { 
      id: result.insertId, 
      domain_id: domainId, 
      score,
      total_queries: totalQueries,
      total_mentions: totalMentions,
      top1_count: top1Count,
      top3_count: top3Count,
      avg_position: avgPosition
    };
  },

  // Get latest score for a domain
  async findLatest(domainId) {
    const [rows] = await pool.query(
      'SELECT * FROM visibility_scores WHERE domain_id = ? ORDER BY created_at DESC LIMIT 1',
      [domainId]
    );
    return rows[0] || null;
  },

  // Get score history for a domain
  async findHistory(domainId, limit = 30) {
    const [rows] = await pool.query(
      'SELECT * FROM visibility_scores WHERE domain_id = ? ORDER BY created_at DESC LIMIT ?',
      [domainId, limit]
    );
    return rows;
  },

  // Get score trend (comparing latest to previous)
  async getTrend(domainId) {
    const [rows] = await pool.query(
      'SELECT * FROM visibility_scores WHERE domain_id = ? ORDER BY created_at DESC LIMIT 2',
      [domainId]
    );
    
    if (rows.length < 2) {
      return { current: rows[0]?.score || 0, previous: null, change: null };
    }
    
    const current = rows[0].score;
    const previous = rows[1].score;
    const change = current - previous;
    
    return { current, previous, change };
  },

  // Get all scores within a date range
  async findByDateRange(domainId, startDate, endDate) {
    const [rows] = await pool.query(
      'SELECT * FROM visibility_scores WHERE domain_id = ? AND created_at BETWEEN ? AND ? ORDER BY created_at ASC',
      [domainId, startDate, endDate]
    );
    return rows;
  },

  // Delete old scores (keep last N)
  async pruneOldScores(domainId, keepCount = 100) {
    const [result] = await pool.query(
      `DELETE FROM visibility_scores 
       WHERE domain_id = ? AND id NOT IN (
         SELECT id FROM (
           SELECT id FROM visibility_scores WHERE domain_id = ? ORDER BY created_at DESC LIMIT ?
         ) as recent
       )`,
      [domainId, domainId, keepCount]
    );
    return result.affectedRows;
  }
};

module.exports = VisibilityScore;

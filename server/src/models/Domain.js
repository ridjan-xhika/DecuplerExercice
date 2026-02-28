const { pool } = require('../config/db');

const Domain = {
  // Create a new domain
  async create(domainName, industry = null) {
    const [result] = await pool.query(
      'INSERT INTO domains (domain_name, industry) VALUES (?, ?)',
      [domainName, industry]
    );
    return { id: result.insertId, domain_name: domainName, industry };
  },

  // Get domain by ID
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM domains WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Get domain by name
  async findByName(domainName) {
    const [rows] = await pool.query('SELECT * FROM domains WHERE domain_name = ?', [domainName]);
    return rows[0] || null;
  },

  // Get all domains
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM domains ORDER BY created_at DESC');
    return rows;
  },

  // Update domain
  async update(id, { domainName, industry }) {
    const [result] = await pool.query(
      'UPDATE domains SET domain_name = COALESCE(?, domain_name), industry = COALESCE(?, industry) WHERE id = ?',
      [domainName, industry, id]
    );
    return result.affectedRows > 0;
  },

  // Delete domain
  async delete(id) {
    const [result] = await pool.query('DELETE FROM domains WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Find or create domain
  async findOrCreate(domainName, industry = null) {
    let domain = await this.findByName(domainName);
    if (!domain) {
      domain = await this.create(domainName, industry);
    }
    return domain;
  }
};

module.exports = Domain;

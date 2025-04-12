// This is a simplified model file for development
// In a production app, you would use Sequelize or another ORM

const db = require('../config/db');

// Certificate model
const Certificate = {
  findByPk: async (id) => {
    const result = await db.query('SELECT * FROM certificates WHERE id = $1', [id]);
    return result.rows[0] || null;
  },
  findOne: async ({ where }) => {
    const whereConditions = Object.entries(where)
      .map(([key, value], index) => `${key} = $${index + 1}`)
      .join(' AND ');
    
    const queryParams = Object.values(where);
    const result = await db.query(
      `SELECT * FROM certificates WHERE ${whereConditions} LIMIT 1`,
      queryParams
    );
    
    return result.rows[0] || null;
  },
  create: async (data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const result = await db.query(
      `INSERT INTO certificates (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    
    return result.rows[0];
  }
};

// Donation model
const Donation = {
  findAll: async ({ where, include, order } = {}) => {
    let query = 'SELECT d.* FROM donations d';
    const queryParams = [];
    let paramCounter = 1;
    
    // Add WHERE clause if conditions exist
    if (where && Object.keys(where).length > 0) {
      const whereConditions = Object.entries(where)
        .map(([key, value]) => {
          queryParams.push(value);
          return `d.${key} = $${paramCounter++}`;
        })
        .join(' AND ');
      
      query += ` WHERE ${whereConditions}`;
    }
    
    // Add ORDER BY if specified
    if (order && order.length > 0) {
      const orderClauses = order.map(([column, direction]) => `d.${column} ${direction}`).join(', ');
      query += ` ORDER BY ${orderClauses}`;
    }
    
    const result = await db.query(query, queryParams);
    const donations = result.rows;
    
    // Handle includes (simplified version)
    if (include && include.length > 0 && donations.length > 0) {
      // Get all campaign IDs and user IDs from donations
      const campaignIds = [...new Set(donations.map(d => d.campaign_id))];
      const userIds = [...new Set(donations.map(d => d.user_id))];
      
      // For each include model, fetch related data
      for (const inc of include) {
        if (inc.model === Campaign && campaignIds.length > 0) {
          const campaignResult = await db.query(
            `SELECT * FROM campaigns WHERE id IN (${campaignIds.map((_, i) => `$${i + 1}`).join(', ')})`, 
            campaignIds
          );
          const campaigns = campaignResult.rows;
          
          // Add campaign data to each donation
          for (const donation of donations) {
            donation.Campaign = campaigns.find(c => c.id === donation.campaign_id) || null;
          }
        }
        
        if (inc.model === Certificate) {
          const donationIds = donations.map(d => d.id);
          const certificateResult = await db.query(
            `SELECT * FROM certificates WHERE donation_id IN (${donationIds.map((_, i) => `$${i + 1}`).join(', ')})`,
            donationIds
          );
          const certificates = certificateResult.rows;
          
          // Add certificate data to each donation
          for (const donation of donations) {
            donation.Certificate = certificates.find(c => c.donation_id === donation.id) || null;
          }
        }
      }
    }
    
    return donations;
  },
  findByPk: async (id, options = {}) => {
    let query = 'SELECT d.* FROM donations d WHERE d.id = $1';
    const queryParams = [id];
    
    if (options.include) {
      // Mock include functionality for now
      const result = await db.query(query, queryParams);
      if (!result.rows[0]) return null;
      
      const donation = result.rows[0];
      
      // Add mock related data
      if (options.include.find(inc => inc.model === Campaign)) {
        const campaignResult = await db.query(
          'SELECT * FROM campaigns WHERE id = $1',
          [donation.campaign_id]
        );
        donation.Campaign = campaignResult.rows[0] || null;
      }
      
      if (options.include.find(inc => inc.model === User)) {
        const userResult = await db.query(
          'SELECT * FROM users WHERE id = $1',
          [donation.user_id]
        );
        donation.User = userResult.rows[0] || null;
      }
      
      return donation;
    }
    
    const result = await db.query(query, queryParams);
    return result.rows[0] || null;
  },
  sum: async (column, { where }) => {
    const whereConditions = Object.entries(where)
      .map(([key, value], index) => `${key} = $${index + 1}`)
      .join(' AND ');
      
    const queryParams = Object.values(where);
    const result = await db.query(
      `SELECT SUM(${column}) FROM donations WHERE ${whereConditions}`,
      queryParams
    );
    
    return result.rows[0].sum || 0;
  },
  count: async ({ distinct, col, where }) => {
    let selectClause = 'COUNT(*)';
    if (distinct && col) {
      selectClause = `COUNT(DISTINCT ${col})`;
    }
    
    const whereConditions = Object.entries(where)
      .map(([key, value], index) => `${key} = $${index + 1}`)
      .join(' AND ');
      
    const queryParams = Object.values(where);
    const result = await db.query(
      `SELECT ${selectClause} AS count FROM donations WHERE ${whereConditions}`,
      queryParams
    );
    
    return result.rows[0].count || 0;
  }
};

// Campaign model
const Campaign = {
  findByPk: async (id) => {
    const result = await db.query('SELECT * FROM campaigns WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
};

// User model
const User = {
  findByPk: async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
};

// Round model
const Round = {
  findOne: async ({ where }) => {
    // This is a simplified implementation
    const results = await db.query('SELECT * FROM rounds WHERE is_distributed = false LIMIT 1');
    return results.rows[0] || null;
  }
};

module.exports = {
  Certificate,
  Donation,
  Campaign,
  User,
  Round
}; 
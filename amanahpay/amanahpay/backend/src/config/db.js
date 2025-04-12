const { Pool } = require('pg');
require('dotenv').config({ path: `${__dirname}/../.env` });

// Create a new database connection pool using the connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Connected to database successfully');
    done();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    return {
      client,
      done: () => client.release(),
    };
  },
  pool
}; 
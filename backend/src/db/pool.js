// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

// pool.on('error', (err) => {
//   console.error('Unexpected PostgreSQL error:', err);
// });

// const query = async (text, params) => {
//   const start = Date.now();
//   const res = await pool.query(text, params);
//   const duration = Date.now() - start;
//   if (process.env.NODE_ENV === 'development') {
//     // console.log('Query executed:', { text: text.substring(0, 60), duration, rows: res.rowCount });
//   }
//   return res;
// };

// module.exports = { pool, query };


const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL Connection Pool (Production Ready)
 */
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Secure SSL for production (Render, Railway, Heroku, etc.)
  // ssl: isProduction
  //   ? { rejectUnauthorized: false }
  //   : false,

  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,

  // Connection pool tuning
  max: 20, // max clients in pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 5000, // wait time for connection

  // Optional: helps avoid hanging queries
  statement_timeout: 30000,
  query_timeout: 30000,
});

/**
 * Handle unexpected pool errors
 */
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);

  // In production, you might want to log to external service
  // like Sentry, Datadog, etc.
});

/**
 * Safe query wrapper with logging + error handling
 */
const query = async (text, params = []) => {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (!isProduction) {
      console.log('📊 Query Executed:', {
        text: text.length > 100 ? text.slice(0, 100) + '...' : text,
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Database Query Error:', {
      message: error.message,
      query: text,
      params,
    });

    throw error; // important: let API handle it
  }
};

/**
 * Graceful shutdown (important for production)
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔌 PostgreSQL pool closed');
  } catch (err) {
    console.error('Error closing pool:', err);
  }
};

module.exports = {
  pool,
  query,
  closePool,
};
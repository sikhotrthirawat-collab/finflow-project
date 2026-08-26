const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'db',
  user: process.env.DB_USER || process.env.MYSQLUSER || 'finance_user',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'finance_pass_123',
  database: process.env.DB_DATABASE || process.env.MYSQLDATABASE || 'finance_db',
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
  ssl: (process.env.DB_SSL === 'true' || !!process.env.MYSQL_URL) ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to test connection and retry
async function checkConnection(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('Successfully connected to MySQL database!');
      connection.release();
      return true;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('Could not connect to database after all retries.');
  return false;
}

checkConnection();

module.exports = pool;

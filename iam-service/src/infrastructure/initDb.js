const pool = require('./db');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username       VARCHAR(100) UNIQUE NOT NULL,
      mail           VARCHAR(255) UNIQUE NOT NULL,
      password_hash  VARCHAR(255) NOT NULL,
      clearance      VARCHAR(10)  NOT NULL CHECK (clearance IN ('BRONCE', 'PLATA', 'ORO')),
      integrity_level INT         NOT NULL CHECK (integrity_level IN (1, 2, 3)),
      created_at     TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('IAM DB lista');
}

module.exports = initDb;

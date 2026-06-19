require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const users = [
  { username: 'usuario_oro',    mail: 'oro@bank.com',    password: 'pass123', clearance: 'ORO',    integrity: 3 },
  { username: 'usuario_plata',  mail: 'plata@bank.com',  password: 'pass123', clearance: 'PLATA',  integrity: 2 },
  { username: 'usuario_bronce', mail: 'bronce@bank.com', password: 'pass123', clearance: 'BRONCE', integrity: 1 },
];

async function main() {
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (user_id, username, mail, password_hash, clearance, integrity_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (username) DO NOTHING`,
      [uuidv4(), u.username, u.mail, passwordHash, u.clearance, u.integrity]
    );
    console.log(`Usuario seed: ${u.username} (${u.clearance}, integrity=${u.integrity})`);
  }
}

main().catch(console.error).finally(() => pool.end());

require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const cuentas = [
  { titular: 'Cuenta VIP Oro',  saldo: 100000.00, moneda: 'USD', requiredIntegrityLevel: 3 },
  { titular: 'Cuenta Plata',    saldo: 50000.00,  moneda: 'USD', requiredIntegrityLevel: 2 },
  { titular: 'Cuenta Bronce',   saldo: 10000.00,  moneda: 'USD', requiredIntegrityLevel: 1 },
];

async function main() {
  for (const c of cuentas) {
    await pool.query(
      `INSERT INTO cuentas_bancarias (cuenta_id, titular, saldo, moneda, required_integrity_level)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [uuidv4(), c.titular, c.saldo, c.moneda, c.requiredIntegrityLevel]
    );
    console.log(`Cuenta seed: ${c.titular} (requiredIntegrity=${c.requiredIntegrityLevel})`);
  }
}

main().catch(console.error).finally(() => pool.end());

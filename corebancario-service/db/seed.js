require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const cuentas = [
  { id: '11111111-1111-4111-8111-111111111111', titular: 'Cuenta VIP Oro',  saldo: 100000.00, moneda: 'USD', requiredIntegrityLevel: 3 },
  { id: '22222222-2222-4222-8222-222222222222', titular: 'Cuenta Plata',    saldo: 50000.00,  moneda: 'USD', requiredIntegrityLevel: 2 },
  { id: '33333333-3333-4333-8333-333333333333', titular: 'Cuenta Bronce',   saldo: 10000.00,  moneda: 'USD', requiredIntegrityLevel: 1 },
];

async function main() {
  for (const c of cuentas) {
    await pool.query(
      `INSERT INTO cuentas_bancarias (cuenta_id, titular, saldo, moneda, required_integrity_level)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [c.id, c.titular, c.saldo, c.moneda, c.requiredIntegrityLevel]
    );
    console.log(`Cuenta seed: ${c.titular} (requiredIntegrity=${c.requiredIntegrityLevel})`);
  }
}

main().catch(console.error).finally(() => pool.end());

const pool = require('./db');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cuentas_bancarias (
      cuenta_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      titular                 VARCHAR(255) NOT NULL,
      saldo                   NUMERIC(18, 2) NOT NULL DEFAULT 0,
      moneda                  VARCHAR(3)   NOT NULL DEFAULT 'USD',
      required_integrity_level INT         NOT NULL CHECK (required_integrity_level IN (1, 2, 3)),
      created_at              TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transacciones (
      transaccion_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cuenta_id       UUID NOT NULL REFERENCES cuentas_bancarias(cuenta_id),
      tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('DEPOSITO','RETIRO','TRANSFERENCIA','BLOQUEADA')),
      monto           NUMERIC(18, 2) NOT NULL,
      moneda          VARCHAR(3)  NOT NULL DEFAULT 'USD',
      ejecutado_por   VARCHAR(255) NOT NULL,
      integrity_usada INT         NOT NULL,
      resultado       VARCHAR(20) NOT NULL CHECK (resultado IN ('EXITOSA','BIBA_VIOLATION')),
      audit_trail     TEXT,
      timestamp       TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Core Bancario DB lista');
}

module.exports = initDb;

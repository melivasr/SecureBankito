const pool = require('./db');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activos_inversion (
      activo_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre             VARCHAR(255) NOT NULL,
      descripcion        TEXT,
      rendimiento_anual  NUMERIC(5, 2) NOT NULL,
      monto_min          NUMERIC(18, 2) NOT NULL,
      clasificacion      VARCHAR(10) NOT NULL DEFAULT 'ORO',
      rentabilidad_pct   NUMERIC(5, 2) NOT NULL,
      rentabilidad_meses INT NOT NULL,
      created_at         TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS accesos_audit (
      audit_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      usuario          VARCHAR(255) NOT NULL,
      clearance_usuario VARCHAR(10) NOT NULL,
      activo_id        UUID REFERENCES activos_inversion(activo_id),
      resultado        VARCHAR(20) NOT NULL,
      mensaje          TEXT,
      timestamp        TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Inversiones DB lista');
}

module.exports = initDb;

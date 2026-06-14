const pool = require('../db');

class TransaccionRepository {
  async save(tx) {
    await pool.query(
      `INSERT INTO transacciones
        (transaccion_id, cuenta_id, tipo, monto, moneda, ejecutado_por, integrity_usada, resultado, audit_trail, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [tx.transaccionId, tx.cuentaId, tx.tipo, tx.monto, tx.moneda,
       tx.ejecutadoPor, tx.integrityUsada, tx.resultado, tx.auditTrail, tx.timestamp]
    );
  }

  async findByCuentaId(cuentaId) {
    const { rows } = await pool.query(
      'SELECT * FROM transacciones WHERE cuenta_id = $1 ORDER BY timestamp DESC', [cuentaId]
    );
    return rows;
  }
}

module.exports = TransaccionRepository;

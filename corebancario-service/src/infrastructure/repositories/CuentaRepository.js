const pool = require('../db');
const CuentaBancaria = require('../../domain/agregate/entities/CuentaBancaria');
const Dinero = require('../../domain/valueObjects/Dinero');
const NivelIntegridad = require('../../domain/valueObjects/NivelIntegridad');

class CuentaRepository {
  _toCuenta(row) {
    return new CuentaBancaria({
      cuentaId: row.cuenta_id,
      titular: row.titular,
      dinero: new Dinero(row.saldo.toString(), row.moneda),
      requiredIntegrityLevel: new NivelIntegridad(row.required_integrity_level),
    });
  }

  async findById(cuentaId) {
    const { rows } = await pool.query(
      'SELECT * FROM cuentas_bancarias WHERE cuenta_id = $1', [cuentaId]
    );
    return rows[0] ? this._toCuenta(rows[0]) : null;
  }

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM cuentas_bancarias ORDER BY created_at');
    return rows.map(r => this._toCuenta(r));
  }

  async save(cuenta) {
    await pool.query(
      `INSERT INTO cuentas_bancarias (cuenta_id, titular, saldo, moneda, required_integrity_level)
       VALUES ($1, $2, $3, $4, $5)`,
      [cuenta.cuentaId, cuenta.titular, cuenta.dinero.valor, cuenta.dinero.moneda,
       cuenta.requiredIntegrityLevel.valor]
    );
  }

  async update(cuenta) {
    await pool.query(
      'UPDATE cuentas_bancarias SET saldo = $1 WHERE cuenta_id = $2',
      [cuenta.dinero.valor, cuenta.cuentaId]
    );
  }
}

module.exports = CuentaRepository;

const pool = require('../db');
const ActivoInversion = require('../../domain/agregate/ActivoInversion');
const Rentabilidad = require('../../domain/valueObjects/Rentabilidad');

class ActivoRepository {
  _toActivo(row) {
    return new ActivoInversion({
      activoId: row.activo_id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      rendimientoAnual: row.rendimiento_anual,
      montoMin: row.monto_min,
      rentabilidad: new Rentabilidad(row.rentabilidad_pct, row.rentabilidad_meses),
    });
  }

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM activos_inversion ORDER BY created_at');
    return rows.map(r => this._toActivo(r));
  }

  async findById(activoId) {
    const { rows } = await pool.query(
      'SELECT * FROM activos_inversion WHERE activo_id = $1', [activoId]
    );
    return rows[0] ? this._toActivo(rows[0]) : null;
  }

  async save(activo) {
    await pool.query(
      `INSERT INTO activos_inversion
        (activo_id, nombre, descripcion, rendimiento_anual, monto_min, clasificacion, rentabilidad_pct, rentabilidad_meses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [activo.activoId, activo.nombre, activo.descripcion, activo.rendimientoAnual,
       activo.montoMin, activo.clasificacion.value, activo.rentabilidad.porcentaje, activo.rentabilidad.plazo]
    );
  }
}

module.exports = ActivoRepository;

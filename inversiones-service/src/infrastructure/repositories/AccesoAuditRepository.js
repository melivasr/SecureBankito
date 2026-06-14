const pool = require('../db');

class AccesoAuditRepository {
  async registrarViolacion(blpException, accion) {
    await pool.query(
      `INSERT INTO accesos_audit (usuario, clearance_usuario, resultado, mensaje)
       VALUES ($1, $2, 'BLP_VIOLATION', $3)`,
      [blpException.usuarioId || 'desconocido', blpException.usuarioClearance,
       `${accion} — ${blpException.message}`]
    );
  }

  async registrarAccesoPermitido(usuario, activoId) {
    await pool.query(
      `INSERT INTO accesos_audit (usuario, clearance_usuario, activo_id, resultado, mensaje)
       VALUES ($1, $2, $3, 'PERMITIDO', 'Acceso autorizado por BLP')`,
      [usuario.userId, usuario.clearance, activoId || null]
    );
  }
}

module.exports = AccesoAuditRepository;

class BLPViolationException extends Error {
  constructor(usuarioClearance, recursoClasificacion, usuarioId) {
    super(`No Read Up: clearance insuficiente (${usuarioClearance}) para acceder a recurso clasificado ${recursoClasificacion}`);
    this.name = 'BLPViolationException';
    this.usuarioClearance = usuarioClearance;
    this.recursoClasificacion = recursoClasificacion;
    this.usuarioId = usuarioId;
  
    Object.freeze(this);
  }
}

module.exports = BLPViolationException;

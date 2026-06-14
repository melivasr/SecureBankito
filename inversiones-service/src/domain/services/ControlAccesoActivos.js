const BLPViolationException = require('../exceptions/BLPViolationException');

class ControlAccesoActivos {
  verificarAcceso(usuario, clasificacion) {
    const permitido = clasificacion.esAccesiblePor(usuario.clearance);

    if (!permitido) {
      throw new BLPViolationException(
        usuario.clearance,
        clasificacion.value,
        usuario.userId
      );
    }
  }
}

module.exports = ControlAccesoActivos;

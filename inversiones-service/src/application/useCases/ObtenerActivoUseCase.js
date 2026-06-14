const NivelClasificacion = require('../../domain/valueObjects/NivelClasificacion');
const ControlAccesoActivos = require('../../domain/services/ControlAccesoActivos');
const BLPViolationException = require('../../domain/exceptions/BLPViolationException');

const controlAcceso = new ControlAccesoActivos();

class ObtenerActivoUseCase {
  constructor(activoRepository, accesoAuditRepository) {
    this._activoRepository = activoRepository;
    this._accesoAuditRepository = accesoAuditRepository;
  }

  async execute(activoId, userClaims) {
    const usuario = { clearance: userClaims.clearance, userId: userClaims.userId };

    // validar clearance PRIMERO  opacidad BLP
    // Si clearance insuficiente  403 aunque el activoId no exista
    try {
      controlAcceso.verificarAcceso(usuario, NivelClasificacion.ORO);
    } catch (err) {
      if (err instanceof BLPViolationException) {
        await this._accesoAuditRepository.registrarViolacion(err, 'OBTENER_ACTIVO_VIP');
        throw err;
      }
      throw err;
    }

    // Solo busca en BD si ya paso la validacion BLP
    const activo = await this._activoRepository.findById(activoId);
    if (!activo) {
      const err = new Error('Activo no encontrado');
      err.code = 'ACTIVO_NOT_FOUND';
      throw err;
    }

    await this._accesoAuditRepository.registrarAccesoPermitido(usuario, activoId);
    return activo.toJSON();
  }
}

module.exports = ObtenerActivoUseCase;

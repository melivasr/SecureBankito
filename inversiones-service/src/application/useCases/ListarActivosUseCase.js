const NivelClasificacion = require('../../domain/valueObjects/NivelClasificacion');
const ControlAccesoActivos = require('../../domain/services/ControlAccesoActivos');
const BLPViolationException = require('../../domain/exceptions/BLPViolationException');

const controlAcceso = new ControlAccesoActivos();

class ListarActivosUseCase {
  constructor(activoRepository, accesoAuditRepository) {
    this._activoRepository = activoRepository;
    this._accesoAuditRepository = accesoAuditRepository;
  }

  async execute(userClaims) {
    const usuario = { clearance: userClaims.clearance, userId: userClaims.userId };

    // ORDEN: validar clearance PRIMERO, antes de cualquier busqueda en BD
    // Si clearance < ORO -> BLPViolationException -> 403
    try {
      controlAcceso.verificarAcceso(usuario, NivelClasificacion.ORO);
    } catch (err) {
      if (err instanceof BLPViolationException) {
        // Registro atomico en audit trail antes de responder 403
        await this._accesoAuditRepository.registrarViolacion(err, 'LISTAR_ACTIVOS_VIP');
        throw err;
      }
      throw err;
    }

    // Solo llega aqui si clearance >= ORO
    const activos = await this._activoRepository.findAll();
    await this._accesoAuditRepository.registrarAccesoPermitido(usuario, null);
    return activos.map(a => a.toJSON());
  }
}

module.exports = ListarActivosUseCase;

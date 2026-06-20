const { v4: uuidv4 } = require('uuid');
const NivelClasificacion = require('../../domain/valueObjects/NivelClasificacion');
const ControlAccesoActivos = require('../../domain/services/ControlAccesoActivos');
const BLPViolationException = require('../../domain/exceptions/BLPViolationException');
const ActivoInversion = require('../../domain/agregate/ActivoInversion');
const Rentabilidad = require('../../domain/valueObjects/Rentabilidad');

const controlAcceso = new ControlAccesoActivos();

class CrearActivoUseCase {
  constructor(activoRepository, accesoAuditRepository) {
    this._activoRepository = activoRepository;
    this._accesoAuditRepository = accesoAuditRepository;
  }

  async execute({ nombre, descripcion, rendimientoAnual, montoMin, rentabilidad }, userClaims) {
    const usuario = { clearance: userClaims.clearance, userId: userClaims.userId };

    // Solo clearance ORO puede crear activos VIP
    try {
      controlAcceso.verificarAcceso(usuario, NivelClasificacion.ORO);
    } catch (err) {
      if (err instanceof BLPViolationException) {
        await this._accesoAuditRepository.registrarViolacion(err, 'CREAR_ACTIVO_VIP');
        throw err;
      }
      throw err;
    }

    const rent = new Rentabilidad(rentabilidad.porcentaje, rentabilidad.plazo);
    const activo = new ActivoInversion({
      activoId: uuidv4(),
      nombre,
      descripcion,
      rendimientoAnual,
      montoMin,
      rentabilidad: rent,
    });

    await this._activoRepository.save(activo);
    await this._accesoAuditRepository.registrarAccesoPermitido(usuario, activo.activoId);
    return activo.toJSON();
  }
}

module.exports = CrearActivoUseCase;

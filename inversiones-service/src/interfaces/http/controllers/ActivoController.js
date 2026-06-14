const BLPViolationException = require('../../../domain/exceptions/BLPViolationException');

class ActivoController {
  constructor(listarActivosUseCase, obtenerActivoUseCase, crearActivoUseCase) {
    this._listarActivosUseCase = listarActivosUseCase;
    this._obtenerActivoUseCase = obtenerActivoUseCase;
    this._crearActivoUseCase = crearActivoUseCase;
  }

  _handleBLPError(err, res) {
    if (err instanceof BLPViolationException) {
      return res.status(403).json({
        error: 'BLP_VIOLATION',
        message: 'No Read Up: clearance insuficiente para acceder a activos VIP',
        usuarioClearance: err.usuarioClearance,
        recursoClasificacion: err.recursoClasificacion,
      });
    }
    return null;
  }

  async listar(req, res) {
    try {
      const activos = await this._listarActivosUseCase.execute(req.user);
      return res.status(200).json(activos);
    } catch (err) {
      const blpResp = this._handleBLPError(err, res);
      if (blpResp) return blpResp;
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async obtener(req, res) {
    try {
      const activo = await this._obtenerActivoUseCase.execute(req.params.activoId, req.user);
      return res.status(200).json(activo);
    } catch (err) {
      const blpResp = this._handleBLPError(err, res);
      if (blpResp) return blpResp;
      // 404 solo si ya paso la validacion BLP (clearance suficiente pero activo no existe)
      if (err.code === 'ACTIVO_NOT_FOUND') {
        return res.status(404).json({ error: 'ACTIVO_NOT_FOUND' });
      }
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async crear(req, res) {
    try {
      const activo = await this._crearActivoUseCase.execute(req.body, req.user);
      return res.status(201).json(activo);
    } catch (err) {
      const blpResp = this._handleBLPError(err, res);
      if (blpResp) return blpResp;
      if (err.message.includes('invalido') || err.message.includes('requerido')) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
      }
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}

module.exports = ActivoController;

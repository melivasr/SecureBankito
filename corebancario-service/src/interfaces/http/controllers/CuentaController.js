class CuentaController {
  constructor(crearCuentaUseCase, cuentaRepository, transaccionRepository) {
    this._crearCuentaUseCase = crearCuentaUseCase;
    this._cuentaRepository = cuentaRepository;
    this._transaccionRepository = transaccionRepository;
  }

  async crear(req, res) {
    try {
      const result = await this._crearCuentaUseCase.execute(req.body);
      return res.status(201).json(result);
    } catch (err) {
      if (err.message.includes('invalido') || err.message.includes('requerido')) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
      }
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async listar(_req, res) {
    try {
      const cuentas = await this._cuentaRepository.findAll();
      return res.status(200).json(cuentas.map(c => ({
        cuentaId: c.cuentaId,
        titular: c.titular,
        saldo: c.dinero.valor,
        moneda: c.dinero.moneda,
        requiredIntegrityLevel: c.requiredIntegrityLevel.valor,
      })));
    } catch (err) {
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async obtener(req, res) {
    try {
      const cuenta = await this._cuentaRepository.findById(req.params.cuentaId);
      if (!cuenta) return res.status(404).json({ error: 'CUENTA_NOT_FOUND' });
      return res.status(200).json({
        cuentaId: cuenta.cuentaId,
        titular: cuenta.titular,
        saldo: cuenta.dinero.valor,
        moneda: cuenta.dinero.moneda,
        requiredIntegrityLevel: cuenta.requiredIntegrityLevel.valor,
      });
    } catch (err) {
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async listarTransacciones(req, res) {
    try {
      const txs = await this._transaccionRepository.findByCuentaId(req.params.cuentaId);
      return res.status(200).json(txs);
    } catch (err) {
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}

module.exports = CuentaController;

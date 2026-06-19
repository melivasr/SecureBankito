const BibaViolationException = require('../../../domain/exceptions/BibaViolationException');

class TransferenciaController {
  constructor(ejeutarTransferenciaUseCase) {
    this._ejecutarTransferenciaUseCase = ejeutarTransferenciaUseCase;
  }

  async ejecutar(req, res) {
    try {
      const { cuentaDestinoId, cuentaOrigenId, monto, moneda } = req.body;
      const result = await this._ejecutarTransferenciaUseCase.execute({
        cuentaDestinoId,
        cuentaOrigenId: cuentaOrigenId || null,
        monto,
        moneda,
        userClaims: req.user,
      });
      return res.status(200).json(result);
    } catch (err) {
      if (err instanceof BibaViolationException) {
        return res.status(403).json({
          error: 'BIBA_VIOLATION',
          message: 'No Write Up: el proceso no tiene integridad suficiente para modificar esta cuenta',
          procesoIntegrity: err.procesoIntegrity,
          cuentaRequiredIntegrity: err.cuentaRequiredIntegrity,
        });
      }
      if (err.code === 'CUENTA_DESTINO_NOT_FOUND') {
        return res.status(404).json({ error: 'CUENTA_DESTINO_NOT_FOUND' });
      }
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}

module.exports = TransferenciaController;

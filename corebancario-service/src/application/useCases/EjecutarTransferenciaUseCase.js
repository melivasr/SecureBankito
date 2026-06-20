const NivelIntegridad = require('../../domain/valueObjects/NivelIntegridad');
const Dinero = require('../../domain/valueObjects/Dinero');
const Transaccion = require('../../domain/agregate/entities/Transaccion');
const ProcesadorTransferencias = require('../../domain/services/ProcesadorTransferencias');
const BibaViolationException = require('../../domain/exceptions/BibaViolationException');

const procesador = new ProcesadorTransferencias();

class EjecutarTransferenciaUseCase {
  constructor(cuentaRepository, transaccionRepository) {
    this._cuentaRepository = cuentaRepository;
    this._transaccionRepository = transaccionRepository;
  }

  async execute({ cuentaDestinoId, cuentaOrigenId, monto, moneda, userClaims }) {
    const integrity = new NivelIntegridad(userClaims.integrity);
    const proceso = { integrity, ejecutadoPor: userClaims.userId };

    const cuentaDestino = await this._cuentaRepository.findById(cuentaDestinoId);
    if (!cuentaDestino) {
      const err = new Error('Cuenta destino no encontrada');
      err.code = 'CUENTA_DESTINO_NOT_FOUND';
      throw err;
    }

    const cuentaOrigen = cuentaOrigenId
      ? await this._cuentaRepository.findById(cuentaOrigenId)
      : null;

    const dinero = new Dinero(monto, moneda || 'USD');

    try {
      const tx = procesador.ejecutarTransferencia(proceso, cuentaOrigen, cuentaDestino, dinero);

      await this._cuentaRepository.update(cuentaDestino);
      if (cuentaOrigen) await this._cuentaRepository.update(cuentaOrigen);
      await this._transaccionRepository.save(tx);

      return { transaccionId: tx.transaccionId, estado: 'EJECUTADA', timestamp: tx.timestamp };

    } catch (err) {
      if (err instanceof BibaViolationException) {
        // Audit atomico: registrar BLOQUEADA antes de responder 403
        await this._transaccionRepository.save(new Transaccion({
          cuentaId: cuentaDestinoId,
          tipo: 'BLOQUEADA',
          monto: dinero.valor,
          moneda: dinero.moneda,
          ejecutadoPor: userClaims.userId,
          integrityUsada: integrity.valor,
          resultado: 'BIBA_VIOLATION',
          auditTrail: err.message,
        }));
        throw err;
      }
      throw err;
    }
  }
}

module.exports = EjecutarTransferenciaUseCase;

const Transaccion = require('../agregate/entities/Transaccion');
const BibaViolationException = require('../exceptions/BibaViolationException');

class ProcesadorTransferencias {
  _validarPuedeModificar(proceso, cuenta) {
    if (!proceso.integrity.esSuficienteParaEscribir(cuenta.requiredIntegrityLevel)) {
      throw new BibaViolationException(
        proceso.integrity.valor,
        cuenta.requiredIntegrityLevel.valor,
        proceso.ejecutadoPor
      );
    }
  }

  ejecutarTransferencia(proceso, cuentaOrigen, cuentaDestino, monto) {
    if (cuentaOrigen) {
      this._validarPuedeModificar(proceso, cuentaOrigen);
    }
    this._validarPuedeModificar(proceso, cuentaDestino);

    if (cuentaOrigen) {
      cuentaOrigen.debitar(monto);
      cuentaOrigen.agregarTransaccion(new Transaccion({
        cuentaId: cuentaOrigen.cuentaId,
        tipo: 'TRANSFERENCIA',
        monto: monto.valor,
        moneda: monto.moneda,
        ejecutadoPor: proceso.ejecutadoPor,
        integrityUsada: proceso.integrity.valor,
        resultado: 'EXITOSA',
        auditTrail: `Enviado a cuenta ${cuentaDestino.cuentaId}`,
      }));
    }

    cuentaDestino.acreditar(monto);
    const txDestino = new Transaccion({
      cuentaId: cuentaDestino.cuentaId,
      tipo: cuentaOrigen ? 'TRANSFERENCIA' : 'DEPOSITO',
      monto: monto.valor,
      moneda: monto.moneda,
      ejecutadoPor: proceso.ejecutadoPor,
      integrityUsada: proceso.integrity.valor,
      resultado: 'EXITOSA',
      auditTrail: cuentaOrigen ? `Recibido desde ${cuentaOrigen.cuentaId}` : 'Deposito externo',
    });
    cuentaDestino.agregarTransaccion(txDestino);

    return txDestino;
  }
}

module.exports = ProcesadorTransferencias;

const Transaccion = require('../entities/Transaccion');
const BibaViolationException = require('../exceptions/BibaViolationException');

class ProcesadorTransferencias {
  ejecutarTransferencia(proceso, cuentaOrigen, cuentaDestino, monto) {
    if (!proceso.integrity.esSuficienteParaEscribir(cuentaDestino.requiredIntegrityLevel)) {
      throw new BibaViolationException(
        proceso.integrity.valor,
        cuentaDestino.requiredIntegrityLevel.valor,
        proceso.ejecutadoPor
      );
    }

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

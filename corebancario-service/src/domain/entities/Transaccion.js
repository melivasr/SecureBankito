const { v4: uuidv4 } = require('uuid');

class Transaccion {
  constructor({ transaccionId, cuentaId, tipo, monto, moneda, ejecutadoPor, integrityUsada, resultado, auditTrail, timestamp }) {
    this.transaccionId = transaccionId || uuidv4();
    this.cuentaId = cuentaId;
    this.tipo = tipo;
    this.monto = monto;
    this.moneda = moneda;
    this.ejecutadoPor = ejecutadoPor;
    this.integrityUsada = integrityUsada;
    this.resultado = resultado;
    this.auditTrail = auditTrail || '';
    this.timestamp = timestamp || new Date();
  }
}

module.exports = Transaccion;

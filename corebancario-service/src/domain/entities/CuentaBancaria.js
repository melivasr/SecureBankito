class CuentaBancaria {
  constructor({ cuentaId, titular, dinero, requiredIntegrityLevel }) {
    this.cuentaId = cuentaId;
    this.titular = titular;
    this.dinero = dinero;
    this.requiredIntegrityLevel = requiredIntegrityLevel;
    this.transacciones = [];
  }

  agregarTransaccion(tx) {
    this.transacciones.push(tx);
  }

  acreditar(dinero) {
    this.dinero = this.dinero.add(dinero);
  }

  debitar(dinero) {
    this.dinero = this.dinero.subtract(dinero);
  }
}

module.exports = CuentaBancaria;

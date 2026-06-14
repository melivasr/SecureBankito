const Decimal = require('decimal.js');

class Dinero {
  constructor(monto, moneda = 'USD') {
    this.monto = new Decimal(monto);
    if (this.monto.isNegative()) throw new Error('Dinero no puede ser negativo');
    this.valor = this.monto.toNumber();
    this.moneda = moneda.toUpperCase();
    Object.freeze(this);
  }

  add(otro) {
    if (this.moneda !== otro.moneda) throw new Error('Monedas distintas');
    return new Dinero(this.monto.plus(otro.monto).toNumber(), this.moneda);
  }

  subtract(otro) {
    if (this.moneda !== otro.moneda) throw new Error('Monedas distintas');
    const result = this.monto.minus(otro.monto);
    if (result.isNegative()) throw new Error('Saldo insuficiente');
    return new Dinero(result.toNumber(), this.moneda);
  }
}

module.exports = Dinero;

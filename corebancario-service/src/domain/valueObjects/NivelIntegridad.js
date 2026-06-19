class NivelIntegridad {
  constructor(value) {
    const num = Number(value);
    if (![1, 2, 3].includes(num)) throw new Error(`NivelIntegridad invalido: ${value}`);
    this.valor = num;
    Object.freeze(this);
  }

  esSuficienteParaEscribir(requerido) {
    return this.valor >= requerido.valor;
  }

  equals(other) {
    return other instanceof NivelIntegridad && this.valor === other.valor;
  }

  toString() {
    return String(this.valor);
  }
}

module.exports = NivelIntegridad;

class Rentabilidad {
  constructor(porcentaje, plazo) {
    if (Number(porcentaje) <= 0) throw new Error('porcentaje debe ser mayor a 0');
    if (Number(plazo) <= 0) throw new Error('plazo debe ser mayor a 0');
    this.porcentaje = Number(porcentaje);
    this.plazo = Number(plazo);
    Object.freeze(this);
  }

  toJSON() {
    return { porcentaje: this.porcentaje, plazo: this.plazo };
  }
}

module.exports = Rentabilidad;

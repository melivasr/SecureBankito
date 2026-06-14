const NUMERIC = { BRONCE: 1, PLATA: 2, ORO: 3 };

class NivelClasificacion {
  constructor(value) {
    if (!NUMERIC[value]) throw new Error(`NivelClasificacion invalido: ${value}`);
    this.value = value;
    this.numeric = NUMERIC[value];
    Object.freeze(this);
  }

  esAccesiblePor(clearanceUsuario) {
    const numericClearance = NUMERIC[clearanceUsuario];
    if (!numericClearance) throw new Error(`Clearance invalido: ${clearanceUsuario}`);
    return numericClearance >= this.numeric;
  }

  equals(other) {
    return other instanceof NivelClasificacion && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

NivelClasificacion.ORO = new NivelClasificacion('ORO');

module.exports = NivelClasificacion;

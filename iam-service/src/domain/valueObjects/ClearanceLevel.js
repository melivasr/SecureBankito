const NUMERIC = { BRONCE: 1, PLATA: 2, ORO: 3 };

class ClearanceLevel {
  constructor(value) {
    if (!NUMERIC[value]) throw new Error(`ClearanceLevel invalido: ${value}`);
    this.value = value;
    this.numeric = NUMERIC[value];
    Object.freeze(this);
  }

  isAtLeast(other) {
    return this.numeric >= other.numeric;
  }

  equals(other) {
    return other instanceof ClearanceLevel && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

module.exports = ClearanceLevel;

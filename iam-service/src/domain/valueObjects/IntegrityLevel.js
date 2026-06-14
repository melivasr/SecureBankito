class IntegrityLevel {
  constructor(value) {
    const num = Number(value);
    if (![1, 2, 3].includes(num)) throw new Error(`IntegrityLevel invalido: ${value}`);
    this.value = num;
    Object.freeze(this);
  }

  isAtLeast(other) {
    return this.value >= other.value;
  }

  equals(other) {
    return other instanceof IntegrityLevel && this.value === other.value;
  }

  toString() {
    return String(this.value);
  }
}

module.exports = IntegrityLevel;

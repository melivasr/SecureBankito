class BibaViolationException extends Error {
  constructor(procesoIntegrity, cuentaRequiredIntegrity, ejecutadoPor) {
    super(`No Write Up: el proceso (integrity=${procesoIntegrity}) no tiene integridad suficiente para modificar esta cuenta (required=${cuentaRequiredIntegrity})`);
    this.name = 'BibaViolationException';
    this.procesoIntegrity = procesoIntegrity;
    this.cuentaRequiredIntegrity = cuentaRequiredIntegrity;
    this.ejecutadoPor = ejecutadoPor;
    // Inmutabilidad: la evidencia de violacion no puede ser modificada en transito
    Object.freeze(this);
  }
}

module.exports = BibaViolationException;

const { v4: uuidv4 } = require('uuid');
const CuentaBancaria = require('../../domain/entities/CuentaBancaria');
const Dinero = require('../../domain/valueObjects/Dinero');
const NivelIntegridad = require('../../domain/valueObjects/NivelIntegridad');

class CrearCuentaUseCase {
  constructor(cuentaRepository) {
    this._cuentaRepository = cuentaRepository;
  }

  async execute({ titular, saldoInicial, moneda, requiredIntegrityLevel }) {
    const dinero = new Dinero(saldoInicial, moneda || 'USD');
    const nivelIntegridad = new NivelIntegridad(requiredIntegrityLevel);

    const cuenta = new CuentaBancaria({
      cuentaId: uuidv4(),
      titular,
      dinero,
      requiredIntegrityLevel: nivelIntegridad,
    });

    await this._cuentaRepository.save(cuenta);

    return {
      cuentaId: cuenta.cuentaId,
      titular: cuenta.titular,
      saldo: cuenta.saldo,
      moneda: cuenta.moneda,
      requiredIntegrityLevel: cuenta.requiredIntegrityLevel.valor,
    };
  }
}

module.exports = CrearCuentaUseCase;

const NivelClasificacion = require('../valueObjects/NivelClasificacion');

class ActivoInversion {
  constructor({ activoId, nombre, descripcion, rendimientoAnual, montoMin, rentabilidad }) {
    this.activoId = activoId;
    this.nombre = nombre;
    this.descripcion = descripcion || '';
    this.rendimientoAnual = Number(rendimientoAnual);
    this.montoMin = Number(montoMin);
    this.clasificacion = NivelClasificacion.ORO; // siempre ORO en este bounded context
    this.rentabilidad = rentabilidad;
  }

  toJSON() {
    return {
      activoId: this.activoId,
      nombre: this.nombre,
      descripcion: this.descripcion,
      rendimientoAnual: this.rendimientoAnual,
      montoMin: this.montoMin,
      clasificacion: this.clasificacion.value,
      rentabilidad: this.rentabilidad.toJSON(),
    };
  }
}

module.exports = ActivoInversion;

/**
 * Clase RegistroPerdida (RF-09 / UML 7.1)
 */
export class RegistroPerdida {
  constructor({ fecha, causa, detalle }) {
    this.fecha = fecha;
    this.causa = causa;
    this.detalle = detalle;
  }

  obtenerResumen() {
    return `${this.fecha} · ${this.causa}: ${this.detalle}`;
  }
}

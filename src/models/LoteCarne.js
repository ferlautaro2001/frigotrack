import { EstadoAlerta } from '../config/constants.js';

/**
 * Clase LoteCarne (RF-02, RF-03, RF-04, RF-05, RF-06 / UML 7.1)
 */
export class LoteCarne {
  constructor({
    codigoLote,
    proveedor,
    producto,
    pesoKg,
    fechaRecepcion,
    fechaVencimiento,
    ubicacionCamara,
    tipoEmbalaje,
    temperaturaCamion = -19.5,
    alertaTermica = false
  }) {
    this.codigoLote = codigoLote;
    this.proveedor = proveedor;
    this.producto = producto;
    this.pesoKg = Number(pesoKg);
    this.fechaRecepcion = fechaRecepcion;
    this.fechaVencimiento = fechaVencimiento;
    this.ubicacionCamara = ubicacionCamara;
    this.tipoEmbalaje = tipoEmbalaje;
    this.temperaturaCamion = Number(temperaturaCamion);
    this.alertaTermica = Boolean(alertaTermica);
  }

  /**
   * RF-03 / US-101: Valida que la fecha de vencimiento sea al menos 3 meses
   * posterior a la fecha de recepción.
   */
  validarVencimientoValido() {
    if (!this.fechaRecepcion || !this.fechaVencimiento) return false;
    const recepcion = new Date(`${this.fechaRecepcion}T00:00:00`);
    const vencimiento = new Date(`${this.fechaVencimiento}T00:00:00`);
    if (Number.isNaN(recepcion.getTime()) || Number.isNaN(vencimiento.getTime())) return false;

    const minimo = new Date(recepcion);
    minimo.setMonth(minimo.getMonth() + 3);
    return vencimiento >= minimo;
  }

  /**
   * Calcula los meses restantes hasta el vencimiento respecto de una fecha de referencia.
   */
  calcularMesesParaVencer(referencia = new Date()) {
    const hoy = new Date(referencia);
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(`${this.fechaVencimiento}T00:00:00`);
    const msPorDia = 1000 * 60 * 60 * 24;
    const dias = Math.ceil((vencimiento - hoy) / msPorDia);
    return dias / 30;
  }

  calcularDiasParaVencer(referencia = new Date()) {
    const hoy = new Date(referencia);
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(`${this.fechaVencimiento}T00:00:00`);
    const msPorDia = 1000 * 60 * 60 * 24;
    return Math.ceil((vencimiento - hoy) / msPorDia);
  }

  /**
   * RF-05: Semáforo automatizado (< 2 meses Alerta roja, < 3 meses Atención, >= 3 meses OK)
   */
  obtenerEstadoSemaforo(referencia = new Date()) {
    const meses = this.calcularMesesParaVencer(referencia);
    if (meses < 2) return EstadoAlerta.CRITICO_ROJO;
    if (meses < 3) return EstadoAlerta.ATENCION_AMARILLO;
    return EstadoAlerta.OK_VERDE;
  }

  /**
   * RF-06: Descuento atómico de stock en kg
   */
  descontarStock(cantidad) {
    const pesoSolicitado = Number(cantidad);
    if (Number.isNaN(pesoSolicitado) || pesoSolicitado <= 0 || pesoSolicitado > this.pesoKg) {
      return false;
    }
    this.pesoKg = Number((this.pesoKg - pesoSolicitado).toFixed(1));
    return true;
  }
}

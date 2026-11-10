/**
 * Clase Remito (RF-08 / UML 7.1)
 */
export class Remito {
  constructor({
    numeroRemito,
    fechaEmision,
    cliente,
    producto,
    pesoDespachado,
    codigoLote,
    estadoTransporte,
    operador = 'Operador'
  }) {
    this.numeroRemito = numeroRemito;
    this.fechaEmision = fechaEmision;
    this.cliente = cliente;
    this.producto = producto;
    this.pesoDespachado = Number(pesoDespachado);
    this.codigoLote = codigoLote;
    this.estadoTransporte = estadoTransporte;
    this.operador = operador;
  }

  generarTextoPlano() {
    const nf1 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return [
      '====================================================',
      'REMITO OFICIAL DE SALIDA - FRIGOTRACK SENASA',
      '====================================================',
      `Numero de Remito : ${this.numeroRemito}`,
      `Fecha de Emision : ${this.fechaEmision}`,
      `Cliente Destino  : ${this.cliente}`,
      `Corte / Producto : ${this.producto}`,
      `Peso Despachado  : ${nf1.format(this.pesoDespachado)} kg`,
      `Codigo de Lote   : ${this.codigoLote}`,
      `Cadena de Frio   : ${this.estadoTransporte}`,
      `Operador Planta  : ${this.operador}`,
      '===================================================='
    ].join('\n');
  }

  imprimir() {
    window.print();
  }
}

import { Usuario } from './Usuario.js';
import { LoteCarne } from './LoteCarne.js';
import { Remito } from './Remito.js';
import { RegistroPerdida } from './RegistroPerdida.js';

/**
 * Clase Principal SistemaFrigoTrack (UML 7.1)
 */
export class SistemaFrigoTrack {
  constructor() {
    this.stock = [];
    this.remitosEmitidos = [];
    this.mermas = [];
    this.usuarioAutenticado = null;
    this.secuenciaLote = 129;
    this.secuenciaRemito = 982143;
    this.recepcionesTurno = 42;
    this.despachosTurno = 29;
  }

  iniciarSesion(user, rol) {
    if (!user || !rol) return false;
    this.usuarioAutenticado = new Usuario(user.trim(), rol);
    return true;
  }

  cerrarSesion() {
    this.usuarioAutenticado = null;
  }

  generarCodigoLote() {
    const codigo = `FT90${this.secuenciaLote}`;
    this.secuenciaLote += 1;
    return codigo;
  }

  registrarRecepcion(nuevoLote) {
    if (this.usuarioAutenticado && !this.usuarioAutenticado.tienePermiso('recepcion')) {
      return { ok: false, error: 'El rol activo no posee permisos para registrar recepciones.' };
    }
    if (!(nuevoLote instanceof LoteCarne)) {
      return { ok: false, error: 'Instancia de lote inválida.' };
    }
    if (!nuevoLote.validarVencimientoValido()) {
      return {
        ok: false,
        field: 'fechaVencimiento',
        error: 'Error: el vencimiento debe ser mínimo 3 meses luego de la recepción'
      };
    }
    this.stock.unshift(nuevoLote);
    this.recepcionesTurno += 1;
    return { ok: true, lote: nuevoLote };
  }

  procesarDespacho(cliente, loteIdx, peso, refrigerado, codigoLoteManual = '') {
    if (this.usuarioAutenticado && !this.usuarioAutenticado.tienePermiso('despacho')) {
      return { ok: false, error: 'El rol activo no posee permisos para autorizar despachos.' };
    }
    const lote = this.stock[loteIdx];
    if (!lote) {
      return { ok: false, error: 'Seleccioná un lote disponible en cámara.' };
    }
    if (!refrigerado) {
      return { ok: false, error: 'Debe confirmar carga en camión refrigerado' };
    }
    const pesoNum = Number(peso);
    if (Number.isNaN(pesoNum) || pesoNum <= 0) {
      return { ok: false, error: 'Ingresá un peso a despachar válido mayor a 0 kg.' };
    }
    if (pesoNum > lote.pesoKg) {
      const nf1 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      return {
        ok: false,
        error: `Stock insuficiente. Disponible: ${nf1.format(lote.pesoKg)} kg`
      };
    }

    lote.descontarStock(pesoNum);
    this.secuenciaRemito += 1;
    const remito = new Remito({
      numeroRemito: `R-${this.secuenciaRemito}`,
      fechaEmision: new Date().toLocaleDateString('es-AR'),
      cliente,
      producto: lote.producto,
      pesoDespachado: pesoNum,
      codigoLote: codigoLoteManual || lote.codigoLote,
      estadoTransporte: 'Carga en camión refrigerado confirmada (≤ −18,0 °C)',
      operador: this.usuarioAutenticado ? this.usuarioAutenticado.nombre : 'm.ferreyra'
    });

    this.remitosEmitidos.unshift(remito);
    this.despachosTurno += 1;
    return { ok: true, remito, lote };
  }

  registrarMerma(perdida) {
    const registro =
      perdida instanceof RegistroPerdida ? perdida : new RegistroPerdida(perdida);
    this.mermas.unshift(registro);
    return registro;
  }
}

/* =========================================================================
   FrigoTrack — Arquitectura Orientada a Objetos y Controlador de Interfaz
   Cumple con el Diagrama de Clases UML (Sección 7.1) y Requerimientos
   RF-01 a RF-09, RNF-01 a RNF-04, CU-01, CU-02 y US-101 del README.md.
   ========================================================================= */

/**
 * Enumeración de estados del semáforo de vencimiento (RF-05 / UML 7.1)
 */
const EstadoAlerta = Object.freeze({
  OK_VERDE: 'OK_VERDE',
  ATENCION_AMARILLO: 'ATENCION_AMARILLO',
  CRITICO_ROJO: 'CRITICO_ROJO'
});

/**
 * Enumeración de causas tipificadas de merma (RF-09 / UML 7.1)
 */
const CausaMerma = Object.freeze({
  PERDIDA_FRIO: 'Pérdida de frío',
  VENCIMIENTO: 'Vencimiento',
  DANO_EMBALAJE: 'Daño de embalaje',
  DEVOLUCION_CLIENTE: 'Devolución cliente'
});

/**
 * Clase Usuario (RF-01 / UML 7.1)
 */
class Usuario {
  constructor(nombre, rol) {
    this.nombre = nombre;
    this.rol = rol;
  }

  tienePermiso(accion) {
    const permisosPorRol = {
      Administrador: ['dashboard', 'recepcion', 'stock', 'alertas', 'despacho', 'remito', 'mermas'],
      Recepción: ['dashboard', 'recepcion', 'stock', 'alertas', 'mermas'],
      Logística: ['dashboard', 'stock', 'alertas', 'despacho', 'remito', 'mermas']
    };
    const permitidos = permisosPorRol[this.rol] || [];
    return permitidos.includes(accion);
  }
}

/**
 * Clase LoteCarne (RF-02, RF-03, RF-04, RF-05, RF-06 / UML 7.1)
 */
class LoteCarne {
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
    if ( Number.isNaN(pesoSolicitado) || pesoSolicitado <= 0 || pesoSolicitado > this.pesoKg ) {
      return false;
    }
    this.pesoKg = Number((this.pesoKg - pesoSolicitado).toFixed(1));
    return true;
  }
}

/**
 * Clase Remito (RF-08 / UML 7.1)
 */
class Remito {
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

/**
 * Clase RegistroPerdida (RF-09 / UML 7.1)
 */
class RegistroPerdida {
  constructor({ fecha, causa, detalle }) {
    this.fecha = fecha;
    this.causa = causa;
    this.detalle = detalle;
  }

  obtenerResumen() {
    return `${this.fecha} · ${this.causa}: ${this.detalle}`;
  }
}

/**
 * Clase Principal SistemaFrigoTrack (UML 7.1)
 */
class SistemaFrigoTrack {
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

// Exposición del modelo de dominio para inspección y pruebas unitarias (Sección 8)
window.FrigoTrackDomain = {
  EstadoAlerta,
  CausaMerma,
  Usuario,
  LoteCarne,
  Remito,
  RegistroPerdida,
  SistemaFrigoTrack
};

document.addEventListener('DOMContentLoaded', () => {
  const sistema = new SistemaFrigoTrack();

  /* ---------------------------------------------------------------
     Utilidades de fecha y formato numérico tabular (Pass 5)
     --------------------------------------------------------------- */
  const HOY = new Date();
  HOY.setHours(0, 0, 0, 0);

  function isoEnDias(dias) {
    const d = new Date(HOY);
    d.setDate(d.getDate() + dias);
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  const nf1 = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  const fmtPeso = (valor) => `${nf1.format(Number(valor) || 0)} kg`;
  const fmtTemp = (valor) => {
    const num = Number(valor);
    return `${num < 0 ? '−' : '+'}${Math.abs(num).toFixed(1).replace('.', ',')}`;
  };
  const fmtFecha = (iso) => {
    if (!iso || !iso.includes('-')) return '—';
    const [anio, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${anio}`;
  };

  function mapearSemaforoUI(lote) {
    const estado = lote.obtenerEstadoSemaforo(HOY);
    const dias = lote.calcularDiasParaVencer(HOY);
    if (estado === EstadoAlerta.CRITICO_ROJO) {
      return { key: 'crit', label: 'Alerta roja', diasTexto: `${dias} d` };
    }
    if (estado === EstadoAlerta.ATENCION_AMARILLO) {
      return { key: 'warn', label: 'Atención', diasTexto: `${dias} d` };
    }
    return { key: 'ok', label: 'OK', diasTexto: `${dias} d` };
  }

  /* ---------------------------------------------------------------
     Carga de datos iniciales coherentes con industria cárnica
     --------------------------------------------------------------- */
  const lotesIniciales = [
    new LoteCarne({
      codigoLote: 'FT90123',
      proveedor: 'Frigorífico Sur',
      producto: 'Bife ancho sin hueso',
      pesoKg: 420.0,
      fechaRecepcion: isoEnDias(-65),
      fechaVencimiento: isoEnDias(38),
      ubicacionCamara: 'Cámara 1 · A3',
      tipoEmbalaje: 'Vacío termoencogible óptimo',
      temperaturaCamion: -19.5
    }),
    new LoteCarne({
      codigoLote: 'FT90124',
      proveedor: 'Carnes del Litoral',
      producto: 'Paleta vacuna especial',
      pesoKg: 300.0,
      fechaRecepcion: isoEnDias(-40),
      fechaVencimiento: isoEnDias(74),
      ubicacionCamara: 'Cámara 2 · B2',
      tipoEmbalaje: 'Caja exportación 20 kg óptima',
      temperaturaCamion: -20.2
    }),
    new LoteCarne({
      codigoLote: 'FT90125',
      proveedor: 'Estancias del Paraná',
      producto: 'Nalga de adentro seleccionada',
      pesoKg: 185.0,
      fechaRecepcion: isoEnDias(-30),
      fechaVencimiento: isoEnDias(82),
      ubicacionCamara: 'Cámara 2 · B5',
      tipoEmbalaje: 'Vacío termoencogible óptimo',
      temperaturaCamion: -18.8
    }),
    new LoteCarne({
      codigoLote: 'FT90126',
      proveedor: 'Ganadería del Plata',
      producto: 'Bife de chorizo exportación',
      pesoKg: 512.0,
      fechaRecepcion: isoEnDias(-80),
      fechaVencimiento: isoEnDias(18),
      ubicacionCamara: 'Cámara 3 · C1',
      tipoEmbalaje: 'Caja exportación 20 kg óptima',
      temperaturaCamion: -16.0,
      alertaTermica: true
    }),
    new LoteCarne({
      codigoLote: 'FT90127',
      proveedor: 'Frigorífico Sur',
      producto: 'Cuarto delantero compensado',
      pesoKg: 275.5,
      fechaRecepcion: isoEnDias(-12),
      fechaVencimiento: isoEnDias(125),
      ubicacionCamara: 'Cámara 1 · A7',
      tipoEmbalaje: 'Media res enfundada óptima',
      temperaturaCamion: -21.0
    }),
    new LoteCarne({
      codigoLote: 'FT90128',
      proveedor: 'Carnes del Litoral',
      producto: 'Recorte vacuno industrial 80/20',
      pesoKg: 640.0,
      fechaRecepcion: isoEnDias(-5),
      fechaVencimiento: isoEnDias(163),
      ubicacionCamara: 'Cámara 2 · B5',
      tipoEmbalaje: 'Caja exportación 20 kg óptima',
      temperaturaCamion: -20.4
    })
  ];

  sistema.stock = lotesIniciales;

  sistema.remitosEmitidos = [
    new Remito({
      numeroRemito: 'R-982143',
      fechaEmision: fmtFecha(isoEnDias(0)),
      cliente: 'Carnicería Norte S.R.L.',
      producto: 'Bife ancho sin hueso',
      pesoDespachado: 120.0,
      codigoLote: 'FT90123',
      estadoTransporte: 'Carga en camión refrigerado confirmada (≤ −18,0 °C)',
      operador: 'r.acosta'
    }),
    new Remito({
      numeroRemito: 'R-982142',
      fechaEmision: fmtFecha(isoEnDias(0)),
      cliente: 'Distribuidora Cárnica del Oeste',
      producto: 'Cuarto delantero compensado',
      pesoDespachado: 210.0,
      codigoLote: 'FT90127',
      estadoTransporte: 'Carga en camión refrigerado confirmada (≤ −18,0 °C)',
      operador: 'r.acosta'
    })
  ];

  sistema.mermas = [
    new RegistroPerdida({
      fecha: isoEnDias(-1),
      causa: CausaMerma.PERDIDA_FRIO,
      detalle: 'Lote FT90126 · Excursión térmica en muelle de Cámara 3 durante descarga (14,0 kg)'
    }),
    new RegistroPerdida({
      fecha: isoEnDias(-5),
      causa: CausaMerma.VENCIMIENTO,
      detalle: 'Lote FT90112 · Falta de rotación PEPS en Cámara 1, retiro sanitario (32,0 kg)'
    }),
    new RegistroPerdida({
      fecha: isoEnDias(-7),
      causa: CausaMerma.DANO_EMBALAJE,
      detalle: 'Lote FT90119 · Envase secundario aplastado en estiba de Sector B2 (18,0 kg)'
    }),
    new RegistroPerdida({
      fecha: isoEnDias(-12),
      causa: CausaMerma.DEVOLUCION_CLIENTE,
      detalle: 'Remito R-982110 · Diferencia de corte en entrega a Carnicería Norte (25,0 kg)'
    }),
    new RegistroPerdida({
      fecha: isoEnDias(-20),
      causa: CausaMerma.PERDIDA_FRIO,
      detalle: 'Lote FT90104 · Unidad de transporte con compresor detenido en arribo (40,0 kg)'
    }),
    new RegistroPerdida({
      fecha: isoEnDias(-27),
      causa: CausaMerma.PERDIDA_FRIO,
      detalle: 'Cámara 3 · Apertura prolongada de cortina de frío en turno tarde (12,5 kg)'
    }),
    new RegistroPerdida({
      fecha: isoEnDias(-34),
      causa: CausaMerma.VENCIMIENTO,
      detalle: 'Lote FT90098 · Vencimiento cumplido sin despacho asignado (28,0 kg)'
    })
  ];

  const notificaciones = [
    {
      estado: 'crit',
      titulo: 'Lote FT90126 en alerta roja (18 días)',
      texto: 'Bife de chorizo exportación en Cámara 3 · C1 requiere despacho prioritario PEPS',
      tiempo: 'Hace 8 min'
    },
    {
      estado: 'crit',
      titulo: 'Excursión térmica en Cámara 3 (−14,2 °C)',
      texto: 'Superó el límite SENASA de −18,0 °C tras apertura de muelle a las 15:00 h',
      tiempo: 'Hace 24 min'
    },
    {
      estado: 'ok',
      titulo: 'Remito R-982143 emitido con frío validado',
      texto: '120,0 kg de Bife ancho sin hueso despachados a Carnicería Norte S.R.L.',
      tiempo: 'Hace 52 min'
    }
  ];

  /* ---------------------------------------------------------------
     Parámetros de telemetría de cámaras (Norma SENASA <= -18 °C)
     --------------------------------------------------------------- */
  const RAIL_MIN = -30;
  const RAIL_MAX = 5;
  const BANDA_MIN = -25;
  const BANDA_MAX = -18;
  const pctRail = (valor) => ((valor - RAIL_MIN) / (RAIL_MAX - RAIL_MIN)) * 100;

  const CAMARAS = [
    {
      id: 'Cámara 1',
      nombre: 'Cámara 1 · Sector A',
      sector: 'Cortes al vacío',
      temp: -19.4,
      nota: 'Dentro de norma ≤ −18 °C',
      curva: [-19.2, -19.5, -19.6, -19.4, -19.8, -19.7, -19.5, -19.1, -19.3, -19.6, -19.5, -19.4, -19.4],
      subtitulo: 'Últimas 12 horas · estabilidad criogénica continua'
    },
    {
      id: 'Cámara 2',
      nombre: 'Cámara 2 · Sector B',
      sector: 'Exportación y cajas',
      temp: -20.8,
      nota: 'Dentro de norma ≤ −18 °C',
      curva: [-20.5, -20.7, -20.9, -21.0, -20.8, -20.6, -20.9, -21.1, -20.8, -20.7, -20.9, -20.8, -20.8],
      subtitulo: 'Últimas 12 horas · régimen de congelado profundo'
    },
    {
      id: 'Cámara 3',
      nombre: 'Cámara 3 · Sector C',
      sector: 'Pre-despacho muelle',
      temp: -14.2,
      nota: 'Excursión > −18 °C (15:00 h)',
      curva: [-19.4, -19.6, -19.8, -19.5, -19.7, -19.3, -18.9, -16.4, -13.8, -12.9, -13.5, -14.0, -14.2],
      excursionIdx: 7,
      picoIdx: 9,
      subtitulo: 'Últimas 12 horas · umbral máximo admisible −18,0 °C'
    }
  ];
  const CAPACIDAD_MAX_KG = 3000;

  /* ---------------------------------------------------------------
     Referencias del DOM
     --------------------------------------------------------------- */
  const screens = Array.from(document.querySelectorAll('.screen'));
  const navButtons = Array.from(document.querySelectorAll('.nav-item[data-nav]'));
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const authScreen = document.getElementById('authScreen');
  const appLayout = document.getElementById('appLayout');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginMsg = document.getElementById('loginMsg');
  const roleSelect = document.getElementById('roleSelect');
  const userNameInput = document.getElementById('userName');
  const quickRoleSelect = document.getElementById('quickRoleSelect');

  const userNameDisplay = document.getElementById('userNameDisplay');
  const roleBadge = document.getElementById('currentRoleBadge');
  const userAvatar = document.getElementById('userAvatar');
  const turnoLabel = document.getElementById('turnoLabel');

  const globalSearchInput = document.getElementById('globalSearchInput');
  const notificationBellBtn = document.getElementById('notificationBellBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const notificationBadge = document.getElementById('notificationBadge');
  const notifListContainer = document.getElementById('notifListContainer');
  const markReadBtn = document.getElementById('markReadBtn');

  const recepcionForm = document.getElementById('recepcionForm');
  const recepcionMsg = document.getElementById('recepcionMsg');
  const recepcionConfirm = document.getElementById('recepcionConfirm');
  const recepcionConfirmTexto = document.getElementById('recepcionConfirmTexto');
  const recepcionConfirmOk = document.getElementById('recepcionConfirmOk');
  const recepcionConfirmCancel = document.getElementById('recepcionConfirmCancel');

  const despachoForm = document.getElementById('despachoForm');
  const despachoMsg = document.getElementById('despachoMsg');
  const productoDespacho = document.getElementById('productoDespacho');
  const pesoDespachoInput = document.getElementById('pesoDespacho');
  const codigoLoteInput = document.getElementById('codigoLote');
  const camionRefrigeradoInput = document.getElementById('camionRefrigerado');

  const perdidasForm = document.getElementById('perdidasForm');
  const perdidasMsg = document.getElementById('perdidasMsg');
  const perdidasBody = document.getElementById('perdidasBody');
  const remitoMsg = document.getElementById('remitoMsg');

  let filtroStockActual = 'all';
  let textoBusqueda = '';
  let camaraActivaGrafico = 'Cámara 3';
  let tempChartInstance = null;
  let remitoSeleccionado = sistema.remitosEmitidos[0] || null;
  let pendienteRecepcion = null;

  function setMsg(element, texto, estado = '') {
    if (!element) return;
    element.textContent = texto;
    element.dataset.state = estado;
  }

  /* ---------------------------------------------------------------
     Renderizado de Instrumentos de Cámara
     --------------------------------------------------------------- */
  function calcularOcupacionPct() {
    const totalKg = sistema.stock.reduce((acc, lote) => acc + lote.pesoKg, 0);
    return Math.min(99, Math.max(10, Math.round((totalKg / CAPACIDAD_MAX_KG) * 100)));
  }

  function renderCamaras(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const leftBand = pctRail(BANDA_MIN).toFixed(1);
    const rightBand = (100 - pctRail(BANDA_MAX)).toFixed(1);

    const tarjetasCamaras = CAMARAS.map((cam) => {
      const fueraDeNorma = cam.temp > BANDA_MAX || cam.temp < BANDA_MIN;
      const pos = Math.min(98, Math.max(2, pctRail(cam.temp))).toFixed(1);
      return `
        <div class="instrument">
          <div class="instrument-top">
            <span class="instrument-label">${cam.nombre}</span>
            <span class="instrument-sector">${cam.sector}</span>
          </div>
          <span class="instrument-value ${fueraDeNorma ? 't-crit' : 't-accent'}">
            ${fmtTemp(cam.temp)}<span class="unit">°C</span>
          </span>
          <div class="rail">
            <span class="rail-band" style="left:${leftBand}%;right:${rightBand}%"></span>
            <span class="rail-marker" data-state="${fueraDeNorma ? 'crit' : 'cold'}" style="left:${pos}%"></span>
          </div>
          <div class="instrument-foot">
            <span>${cam.nota}</span>
            <span class="status" data-state="${fueraDeNorma ? 'crit' : 'ok'}">${fueraDeNorma ? 'Alerta roja' : 'OK'}</span>
          </div>
        </div>
      `;
    }).join('');

    const ocupacionPct = calcularOcupacionPct();
    const totalKg = sistema.stock.reduce((acc, lote) => acc + lote.pesoKg, 0);

    const tarjetaOcupacion = `
      <div class="instrument">
        <div class="instrument-top">
          <span class="instrument-label">Capacidad ocupada</span>
          <span class="instrument-sector">${sistema.stock.length} lotes activos</span>
        </div>
        <span class="instrument-value t-primary">
          ${ocupacionPct}<span class="unit">%</span>
        </span>
        <div class="rail">
          <span class="rail-fill" style="width:${ocupacionPct}%"></span>
        </div>
        <div class="instrument-foot">
          <span class="t-mono">${fmtPeso(totalKg)} / ${fmtPeso(CAPACIDAD_MAX_KG)}</span>
          <span class="t-mono">Libre ${100 - ocupacionPct}%</span>
        </div>
      </div>
    `;

    target.innerHTML = tarjetasCamaras + tarjetaOcupacion;
  }

  /* ---------------------------------------------------------------
     Renderizado de Alertas en Vivo y Notificaciones
     --------------------------------------------------------------- */
  function renderNotificaciones() {
    if (!notifListContainer) return;
    notifListContainer.innerHTML = notificaciones
      .map(
        (n) => `
        <div class="notif-item">
          <span class="notif-rail" data-state="${n.estado}"></span>
          <div>
            <p class="notif-title">${n.titulo}</p>
            <p class="notif-text">${n.texto}</p>
            <span class="notif-time">${n.tiempo}</span>
          </div>
        </div>
      `
      )
      .join('');
    if (notificationBadge) {
      notificationBadge.textContent = String(notificaciones.length);
    }
  }

  function renderAlertasEnVivo() {
    const container = document.getElementById('liveAlertsList');
    if (!container) return;

    const lotesOrdenados = [...sistema.stock]
      .filter((l) => l.pesoKg > 0)
      .sort((a, b) => a.calcularDiasParaVencer(HOY) - b.calcularDiasParaVencer(HOY))
      .slice(0, 4);

    container.innerHTML = lotesOrdenados
      .map((lote) => {
        const sem = mapearSemaforoUI(lote);
        const notaTemp = lote.alertaTermica
          ? `Ingreso ${fmtTemp(lote.temperaturaCamion)} °C`
          : `Vence en ${sem.diasTexto}`;
        return `
          <div class="alert-row">
            <span class="alert-rail" data-state="${sem.key}"></span>
            <div class="alert-body">
              <span class="alert-title">${lote.producto}</span>
              <span class="alert-meta">
                <span class="t-mono">${lote.codigoLote}</span> · ${lote.ubicacionCamara} · ${notaTemp}
              </span>
            </div>
            <span class="status" data-state="${sem.key}">${sem.label}</span>
          </div>
        `;
      })
      .join('');
  }

  /* ---------------------------------------------------------------
     Renderizado de Tablas de Stock, KPIs y Filtros
     --------------------------------------------------------------- */
  function obtenerStockFiltrado() {
    return sistema.stock.filter((lote) => {
      if (lote.pesoKg <= 0) return false;
      const sem = mapearSemaforoUI(lote);
      if (filtroStockActual !== 'all' && sem.key !== filtroStockActual) {
        return false;
      }
      if (textoBusqueda) {
        const q = textoBusqueda.toLowerCase();
        const coincide =
          lote.codigoLote.toLowerCase().includes(q) ||
          lote.producto.toLowerCase().includes(q) ||
          lote.proveedor.toLowerCase().includes(q) ||
          lote.ubicacionCamara.toLowerCase().includes(q);
        if (!coincide) return false;
      }
      return true;
    });
  }

  function renderTablaCola() {
    const body = document.getElementById('stockTableBody');
    if (!body) return;

    const lotes = obtenerStockFiltrado();
    if (lotes.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="8" class="t-muted">No se encontraron lotes en cámara para el criterio seleccionado</td>
        </tr>
      `;
      return;
    }

    body.innerHTML = lotes
      .map((lote) => {
        const sem = mapearSemaforoUI(lote);
        const tempClase = lote.temperaturaCamion > -18 ? 't-crit' : 't-secondary';
        return `
          <tr data-row-state="${sem.key}">
            <td class="t-mono cell-strong">${lote.codigoLote}</td>
            <td class="cell-strong">${lote.producto}</td>
            <td>${lote.proveedor}</td>
            <td>${lote.ubicacionCamara}</td>
            <td class="t-mono num ${tempClase}">${fmtTemp(lote.temperaturaCamion)} °C</td>
            <td class="t-mono num">${fmtPeso(lote.pesoKg)}</td>
            <td class="t-mono num">${fmtFecha(lote.fechaVencimiento)} <span class="t-muted">(${sem.diasTexto})</span></td>
            <td class="cell-right"><span class="status" data-state="${sem.key}">${sem.label}</span></td>
          </tr>
        `;
      })
      .join('');
  }

  function renderTablaStockCompleta() {
    const body = document.getElementById('stockTableBodyFull');
    const summary = document.getElementById('stockFilterSummary');
    if (!body) return;

    const lotes = obtenerStockFiltrado();
    if (summary) {
      const etiquetasFiltro = {
        all: 'Todos los estados de semáforo',
        crit: 'Filtro activo: Alerta roja (< 2 meses)',
        warn: 'Filtro activo: Atención (< 3 meses)',
        ok: 'Filtro activo: OK (≥ 3 meses)'
      };
      const sufijoBusqueda = textoBusqueda ? ` · búsqueda "${textoBusqueda}"` : '';
      summary.textContent = `${lotes.length} lotes encontrados · ${etiquetasFiltro[filtroStockActual]}${sufijoBusqueda}`;
    }

    if (lotes.length === 0) {
      body.innerHTML = `
        <tr>
          <td colspan="10" class="t-muted">No hay lotes que coincidan con el filtro seleccionado</td>
        </tr>
      `;
      return;
    }

    body.innerHTML = lotes
      .map((lote) => {
        const sem = mapearSemaforoUI(lote);
        const tempClase = lote.temperaturaCamion > -18 ? 't-crit' : 't-secondary';
        return `
          <tr data-row-state="${sem.key}">
            <td class="t-mono cell-strong">${lote.codigoLote}</td>
            <td class="cell-strong">${lote.producto}</td>
            <td>${lote.proveedor}</td>
            <td>${lote.ubicacionCamara}</td>
            <td>${lote.tipoEmbalaje}</td>
            <td class="t-mono num ${tempClase}">${fmtTemp(lote.temperaturaCamion)} °C</td>
            <td class="t-mono num">${fmtPeso(lote.pesoKg)}</td>
            <td class="t-mono num">${fmtFecha(lote.fechaRecepcion)}</td>
            <td class="t-mono num">${fmtFecha(lote.fechaVencimiento)} <span class="t-muted">(${sem.diasTexto})</span></td>
            <td class="cell-right"><span class="status" data-state="${sem.key}">${sem.label}</span></td>
          </tr>
        `;
      })
      .join('');
  }

  function renderOpcionesDespacho() {
    if (!productoDespacho) return;
    const valorPrevio = productoDespacho.value;
    productoDespacho.innerHTML = '<option value="">Seleccionar lote disponible</option>';

    sistema.stock.forEach((lote, index) => {
      if (lote.pesoKg <= 0) return;
      const sem = mapearSemaforoUI(lote);
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${lote.codigoLote} · ${lote.producto} (${fmtPeso(lote.pesoKg)} · ${sem.label})`;
      productoDespacho.appendChild(option);
    });

    if (valorPrevio && sistema.stock[Number(valorPrevio)]?.pesoKg > 0) {
      productoDespacho.value = valorPrevio;
    } else {
      const primerIndice = sistema.stock.findIndex((l) => l.pesoKg > 0);
      if (primerIndice >= 0) {
        productoDespacho.value = String(primerIndice);
      }
    }
    actualizarBalanceDespachoPreview();
  }

  function actualizarBalanceDespachoPreview() {
    const idx = Number(productoDespacho?.value);
    const lote = Number.isInteger(idx) && productoDespacho?.value !== '' ? sistema.stock[idx] : null;
    const pesoSolicitado = Number(pesoDespachoInput?.value) || 0;

    const elLote = document.getElementById('despPreviewLote');
    const elSem = document.getElementById('despPreviewSemaforo');
    const elDisp = document.getElementById('despPreviewDisponible');
    const elRem = document.getElementById('despPreviewRemanente');

    if (!lote) {
      if (elLote) elLote.textContent = '—';
      if (elSem) {
        elSem.textContent = 'Sin lote seleccionado';
        elSem.dataset.state = 'ok';
      }
      if (elDisp) elDisp.textContent = '0,0 kg';
      if (elRem) {
        elRem.textContent = '0,0 kg';
        elRem.className = 'alert-title t-mono';
      }
      return;
    }

    if (codigoLoteInput && (!codigoLoteInput.value || codigoLoteInput.dataset.auto === 'true')) {
      codigoLoteInput.value = lote.codigoLote;
      codigoLoteInput.dataset.auto = 'true';
    }

    const sem = mapearSemaforoUI(lote);
    const remanente = Number((lote.pesoKg - pesoSolicitado).toFixed(1));

    if (elLote) elLote.textContent = `${lote.codigoLote} · ${lote.producto}`;
    if (elSem) {
      elSem.textContent = `${sem.label} (${sem.diasTexto})`;
      elSem.dataset.state = sem.key;
    }
    if (elDisp) elDisp.textContent = fmtPeso(lote.pesoKg);
    if (elRem) {
      elRem.textContent = remanente >= 0 ? fmtPeso(remanente) : `Excede por ${fmtPeso(Math.abs(remanente))}`;
      elRem.className = `alert-title t-mono ${remanente < 0 ? 't-crit' : 't-primary'}`;
    }
  }

  function updateKPIs() {
    let criticos = 0;
    let atencion = 0;
    let totalKg = 0;
    let lotesActivos = 0;

    sistema.stock.forEach((lote) => {
      if (lote.pesoKg <= 0) return;
      lotesActivos += 1;
      totalKg += lote.pesoKg;
      const estado = lote.obtenerEstadoSemaforo(HOY);
      if (estado === EstadoAlerta.CRITICO_ROJO) criticos += 1;
      if (estado === EstadoAlerta.ATENCION_AMARILLO) atencion += 1;
    });

    const kpiRecepciones = document.getElementById('kpiRecepciones');
    const kpiRecepcionesMeta = document.getElementById('kpiRecepcionesMeta');
    const kpiStockKg = document.getElementById('kpiStockKg');
    const kpiStockMeta = document.getElementById('kpiStockMeta');
    const kpiVencer = document.getElementById('kpiVencer');
    const kpiVencerCrit = document.getElementById('kpiVencerCrit');
    const kpiVencerWarn = document.getElementById('kpiVencerWarn');
    const kpiDespachos = document.getElementById('kpiDespachos');
    const kpiDespachosMeta = document.getElementById('kpiDespachosMeta');
    const kpiSidebarAlerts = document.getElementById('kpiSidebarAlerts');
    const kpiSidebarRemitos = document.getElementById('kpiSidebarRemitos');

    if (kpiRecepciones) kpiRecepciones.textContent = String(sistema.recepcionesTurno);
    if (kpiRecepcionesMeta) {
      kpiRecepcionesMeta.textContent = `+${sistema.recepcionesTurno - 36} vs turno anterior · ${sistema.recepcionesTurno - 4} en rango ≤ −18 °C`;
    }

    if (kpiStockKg) kpiStockKg.textContent = fmtPeso(totalKg);
    if (kpiStockMeta) {
      kpiStockMeta.textContent = `${lotesActivos} lotes trazados · ${calcularOcupacionPct()}% de capacidad`;
    }

    if (kpiVencer) kpiVencer.textContent = String(criticos + atencion);
    if (kpiVencerCrit) kpiVencerCrit.textContent = `${criticos} en alerta roja (< 2 m)`;
    if (kpiVencerWarn) kpiVencerWarn.textContent = `${atencion} en atención (< 3 m)`;

    if (kpiDespachos) kpiDespachos.textContent = String(sistema.despachosTurno);
    if (kpiDespachosMeta) {
      kpiDespachosMeta.textContent = `${sistema.remitosEmitidos.length} remitos en sesión · 100% frío validado`;
    }

    if (kpiSidebarAlerts) {
      kpiSidebarAlerts.textContent = String(criticos);
    }
    if (kpiSidebarRemitos) {
      kpiSidebarRemitos.textContent = String(sistema.remitosEmitidos.length);
    }
  }

  function renderTodoStock() {
    renderCamaras('camarasGrid');
    renderCamaras('camarasGridStock');
    renderTablaCola();
    renderTablaStockCompleta();
    renderAlertasEnVivo();
    renderOpcionesDespacho();
    updateKPIs();
  }

  /* ---------------------------------------------------------------
     Vista previa en vivo de Etiqueta Térmica en Recepción (Momento)
     --------------------------------------------------------------- */
  function inicializarFechasRecepcion() {
    const inputRec = document.getElementById('fechaRecepcion');
    const inputVen = document.getElementById('fechaVencimiento');
    const inputFechaMerma = document.getElementById('fechaPerdida');

    if (inputRec && !inputRec.value) inputRec.value = isoEnDias(0);
    if (inputVen && !inputVen.value) inputVen.value = isoEnDias(120);
    if (inputFechaMerma && !inputFechaMerma.value) inputFechaMerma.value = isoEnDias(0);
  }

  function actualizarPreviewEtiquetaRecepcion() {
    const prov = document.getElementById('proveedor')?.value.trim() || 'Frigorífico Sur';
    const prod = document.getElementById('producto')?.value.trim() || 'Bife ancho sin hueso';
    const peso = Number(document.getElementById('peso')?.value) || 450.0;
    const ubic = document.getElementById('ubicacion')?.value || 'Cámara 1 · A3';
    const fRec = document.getElementById('fechaRecepcion')?.value || isoEnDias(0);
    const fVen = document.getElementById('fechaVencimiento')?.value || isoEnDias(120);
    const temp = Number(document.getElementById('temperaturaCamion')?.value || -20);
    const proximoCodigo = `FT90${sistema.secuenciaLote}`;

    const loteTemp = new LoteCarne({
      codigoLote: proximoCodigo,
      proveedor: prov,
      producto: prod,
      pesoKg: peso,
      fechaRecepcion: fRec,
      fechaVencimiento: fVen,
      ubicacionCamara: ubic,
      tipoEmbalaje: 'Vacío termoencogible óptimo',
      temperaturaCamion: temp
    });

    const elCodeTop = document.getElementById('previewLoteCode');
    const elProv = document.getElementById('previewProveedor');
    const elTemp = document.getElementById('previewTempBadge');
    const elProd = document.getElementById('previewProducto');
    const elPeso = document.getElementById('previewPeso');
    const elCodCell = document.getElementById('previewCodigoCell');
    const elUbic = document.getElementById('previewUbicacion');
    const elRec = document.getElementById('previewRecepcion');
    const elVen = document.getElementById('previewVencimiento');
    const elPill = document.getElementById('previewStatusPill');

    if (elCodeTop) elCodeTop.textContent = proximoCodigo;
    if (elProv) elProv.textContent = `PROVEEDOR: ${prov.toUpperCase()}`;
    if (elTemp) {
      elTemp.textContent = `${fmtTemp(temp)} °C ${temp > -18 ? '· ALERTA' : '· OK'}`;
    }
    if (elProd) elProd.textContent = prod;
    if (elPeso) elPeso.textContent = fmtPeso(peso);
    if (elCodCell) elCodCell.textContent = proximoCodigo;
    if (elUbic) elUbic.textContent = ubic;
    if (elRec) elRec.textContent = fmtFecha(fRec);
    if (elVen) elVen.textContent = fmtFecha(fVen);

    if (elPill) {
      if (!loteTemp.validarVencimientoValido()) {
        elPill.textContent = 'Rechazado · Vencimiento < 3 meses (RF-03)';
        elPill.dataset.state = 'crit';
      } else if (temp > -18) {
        elPill.textContent = 'Requiere confirmación térmica (> −18 °C)';
        elPill.dataset.state = 'warn';
      } else {
        const sem = mapearSemaforoUI(loteTemp);
        elPill.textContent = `Estado ${sem.label} · Vida útil ${sem.diasTexto}`;
        elPill.dataset.state = sem.key;
      }
    }
  }

  /* ---------------------------------------------------------------
     Control de Acceso Basado en Roles (RF-01)
     --------------------------------------------------------------- */
  function aplicarPermisosDeRol() {
    const usuario = sistema.usuarioAutenticado;
    if (!usuario) return;

    const iniciales =
      usuario.nombre
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'OP';

    if (userNameDisplay) userNameDisplay.textContent = usuario.nombre;
    if (roleBadge) roleBadge.textContent = usuario.rol;
    if (userAvatar) userAvatar.textContent = iniciales;
    if (quickRoleSelect) quickRoleSelect.value = usuario.rol;

    const puedeRecepcion = usuario.tienePermiso('recepcion');
    const puedeDespacho = usuario.tienePermiso('despacho');

    // Indicadores en navegación lateral
    const btnNavRec = document.querySelector('.nav-item[data-nav="recepcion"]');
    const btnNavDesp = document.querySelector('.nav-item[data-nav="despacho"]');
    const lockRec = document.getElementById('navLockRecepcion');
    const lockDesp = document.getElementById('navLockDespacho');

    if (btnNavRec) btnNavRec.dataset.restricted = String(!puedeRecepcion);
    if (lockRec) lockRec.classList.toggle('is-hidden', puedeRecepcion);

    if (btnNavDesp) btnNavDesp.dataset.restricted = String(!puedeDespacho);
    if (lockDesp) lockDesp.classList.toggle('is-hidden', puedeDespacho);

    // Bloqueo / habilitación de formulario de Recepción
    const recNotice = document.getElementById('recepcionRoleNotice');
    const recRoleName = document.getElementById('recepcionRoleName');
    const submitRecBtn = document.getElementById('submitRecepcionBtn');
    if (recNotice) recNotice.classList.toggle('is-hidden', puedeRecepcion);
    if (recRoleName) recRoleName.textContent = usuario.rol;
    if (submitRecBtn) submitRecBtn.disabled = !puedeRecepcion;

    // Bloqueo / habilitación de formulario de Despacho
    const despNotice = document.getElementById('despachoRoleNotice');
    const despRoleName = document.getElementById('despachoRoleName');
    const submitDespBtn = document.getElementById('submitDespachoBtn');
    if (despNotice) despNotice.classList.toggle('is-hidden', puedeDespacho);
    if (despRoleName) despRoleName.textContent = usuario.rol;
    if (submitDespBtn) submitDespBtn.disabled = !puedeDespacho;

    // Acción primaria contextual en el encabezado del Panel (Relevancia por rol, Sección 2.2)
    const heroBtn = document.getElementById('primaryHeroActionBtn');
    const heroLabel = document.getElementById('primaryHeroActionLabel');
    if (heroBtn && heroLabel) {
      if (usuario.rol === 'Logística') {
        heroBtn.dataset.goto = 'screen-despacho';
        heroLabel.textContent = 'Gestionar despacho';
      } else {
        heroBtn.dataset.goto = 'screen-recepcion';
        heroLabel.textContent = 'Registrar recepción';
      }
    }
  }

  /* ---------------------------------------------------------------
     Navegación entre pantallas y filtros
     --------------------------------------------------------------- */
  const NAV_POR_PANTALLA = {
    'screen-login': 'dashboard',
    'screen-recepcion': 'recepcion',
    'screen-stock': 'stock',
    'screen-despacho': 'despacho',
    'screen-remito': 'remito',
    'screen-perdidas': 'mermas'
  };

  function aplicarFiltroStockUI(filtro) {
    filtroStockActual = filtro;
    document.querySelectorAll('[data-stock-filter]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.stockFilter === filtro);
    });
    renderTablaCola();
    renderTablaStockCompleta();
  }

  function showScreen(screenId, navKey) {
    const claveNav = navKey || NAV_POR_PANTALLA[screenId] || 'dashboard';

    if (claveNav === 'alertas') {
      aplicarFiltroStockUI('crit');
    } else if (claveNav === 'stock' && filtroStockActual === 'crit') {
      aplicarFiltroStockUI('all');
    }

    screens.forEach((screen) => {
      screen.classList.toggle('active', screen.id === screenId);
    });

    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.nav === claveNav);
    });

    closeSidebarMobile();
    window.scrollTo({ top: 0 });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.target, btn.dataset.nav);
    });
  });

  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const destino = btn.dataset.goto;
      showScreen(destino, NAV_POR_PANTALLA[destino]);
    });
  });

  document.querySelectorAll('[data-stock-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      aplicarFiltroStockUI(btn.dataset.stockFilter);
    });
  });

  /* ---------------------------------------------------------------
     Búsqueda rápida en barra superior + atajo de teclado "/"
     --------------------------------------------------------------- */
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (event) => {
      textoBusqueda = event.target.value.trim();
      renderTablaCola();
      renderTablaStockCompleta();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (
      event.key === '/' &&
      document.activeElement &&
      !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      globalSearchInput?.focus();
    }
    if (event.key === 'Escape') {
      notificationDropdown?.classList.add('is-hidden');
      closeSidebarMobile();
    }
  });

  /* ---------------------------------------------------------------
     Menú lateral móvil
     --------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');

  function openSidebarMobile() {
    sidebar?.classList.add('is-open');
    sidebarOverlay?.classList.remove('is-hidden');
  }

  function closeSidebarMobile() {
    if (window.innerWidth >= 1024) return;
    sidebar?.classList.remove('is-open');
    sidebarOverlay?.classList.add('is-hidden');
  }

  mobileMenuBtn?.addEventListener('click', openSidebarMobile);
  closeSidebarBtn?.addEventListener('click', closeSidebarMobile);
  sidebarOverlay?.addEventListener('click', closeSidebarMobile);

  /* ---------------------------------------------------------------
     Autenticación y cambio de rol (RF-01)
     --------------------------------------------------------------- */
  const presetButtons = Array.from(document.querySelectorAll('[data-preset-role]'));
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetButtons.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      if (roleSelect) roleSelect.value = btn.dataset.presetRole;
      if (userNameInput) userNameInput.value = btn.dataset.presetUser || 'operador01';
      setMsg(loginMsg, '');
    });
  });

  roleSelect?.addEventListener('change', () => {
    presetButtons.forEach((b) => {
      b.classList.toggle('is-selected', b.dataset.presetRole === roleSelect.value);
    });
  });

  loginBtn?.addEventListener('click', () => {
    const rol = roleSelect ? roleSelect.value : '';
    const nombre = userNameInput ? userNameInput.value.trim() : '';

    if (! sistema.iniciarSesion(nombre, rol)) {
      setMsg(loginMsg, 'Seleccioná un rol operativo e ingresá tu usuario.', 'crit');
      return;
    }

    aplicarPermisosDeRol();
    setMsg(loginMsg, '');
    authScreen?.classList.add('is-hidden');
    appLayout?.classList.remove('is-hidden');

    showScreen('screen-login', 'dashboard');
  });

  quickRoleSelect?.addEventListener('change', () => {
    if (!sistema.usuarioAutenticado) return;
    sistema.usuarioAutenticado.rol = quickRoleSelect.value;
    aplicarPermisosDeRol();
  });

  logoutBtn?.addEventListener('click', () => {
    sistema.cerrarSesion();
    appLayout?.classList.add('is-hidden');
    authScreen?.classList.remove('is-hidden');
    closeSidebarMobile();
    setMsg(loginMsg, '');
  });

  /* ---------------------------------------------------------------
     Centro de notificaciones
     --------------------------------------------------------------- */
  if (notificationBellBtn && notificationDropdown) {
    notificationBellBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      notificationDropdown.classList.toggle('is-hidden');
    });

    document.addEventListener('click', (event) => {
      if (
        !notificationDropdown.contains(event.target) &&
        !notificationBellBtn.contains(event.target)
      ) {
        notificationDropdown.classList.add('is-hidden');
      }
    });
  }

  markReadBtn?.addEventListener('click', () => {
    notificationBadge?.classList.add('is-hidden');
    markReadBtn.textContent = 'Sin pendientes';
  });

  /* ---------------------------------------------------------------
     CU-01: Recepción de Mercadería (RF-02, RF-03, RF-04, US-101)
     --------------------------------------------------------------- */
  const camposPreviewRecepcion = [
    'proveedor',
    'producto',
    'peso',
    'ubicacion',
    'fechaRecepcion',
    'fechaVencimiento',
    'embalaje',
    'temperaturaCamion'
  ];

  camposPreviewRecepcion.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      if (id === 'fechaVencimiento' || id === 'fechaRecepcion') {
        document.getElementById('fechaVencimiento').dataset.invalid = 'false';
      }
      actualizarPreviewEtiquetaRecepcion();
    });
    el.addEventListener('change', () => {
      if (id === 'fechaVencimiento' || id === 'fechaRecepcion') {
        document.getElementById('fechaVencimiento').dataset.invalid = 'false';
      }
      actualizarPreviewEtiquetaRecepcion();
    });
  });

  function confirmarYGuardarRecepcion(datosLote, conAlertaTermica = false) {
    const nuevoLote = new LoteCarne({
      codigoLote: sistema.generarCodigoLote(),
      proveedor: datosLote.proveedor,
      producto: datosLote.producto,
      pesoKg: datosLote.peso,
      fechaRecepcion: datosLote.fechaRecepcion,
      fechaVencimiento: datosLote.fechaVencimiento,
      ubicacionCamara: datosLote.ubicacion,
      tipoEmbalaje: datosLote.embalaje,
      temperaturaCamion: datosLote.temperaturaCamion,
      alertaTermica: conAlertaTermica
    });

    const resultado = sistema.registrarRecepcion(nuevoLote);
    if (!resultado.ok) {
      setMsg(recepcionMsg, resultado.error, 'crit');
      return;
    }

    notificaciones.unshift({
      estado: conAlertaTermica ? 'warn' : 'ok',
      titulo: `Lote ${nuevoLote.codigoLote} ingresado (${fmtPeso(nuevoLote.pesoKg)})`,
      texto: `${nuevoLote.producto} · ${nuevoLote.ubicacionCamara} · Temp. camión ${fmtTemp(nuevoLote.temperaturaCamion)} °C`,
      tiempo: 'Ahora'
    });
    notificationBadge?.classList.remove('is-hidden');
    renderNotificaciones();
    renderTodoStock();

    recepcionForm.reset();
    inicializarFechasRecepcion();
    ['checkPrecinto', 'checkLimpieza', 'checkTermometro'].forEach((id) => {
      const check = document.getElementById(id);
      if (check) check.checked = true;
    });
    document.getElementById('fechaVencimiento').dataset.invalid = 'false';
    recepcionConfirm?.classList.add('is-hidden');
    pendienteRecepcion = null;
    actualizarPreviewEtiquetaRecepcion();

    setMsg(
      recepcionMsg,
      `Lote ${nuevoLote.codigoLote} registrado en ${nuevoLote.ubicacionCamara}${conAlertaTermica ? ' con marca de advertencia térmica' : ''}`,
      'ok'
    );
  }

  recepcionForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (sistema.usuarioAutenticado && !sistema.usuarioAutenticado.tienePermiso('recepcion')) {
      setMsg(recepcionMsg, 'Acción no autorizada para el rol activo (RF-01)', 'crit');
      return;
    }

    const datos = {
      proveedor: document.getElementById('proveedor').value.trim(),
      producto: document.getElementById('producto').value.trim(),
      peso: Number(document.getElementById('peso').value),
      ubicacion: document.getElementById('ubicacion').value,
      fechaRecepcion: document.getElementById('fechaRecepcion').value,
      fechaVencimiento: document.getElementById('fechaVencimiento').value,
      embalaje: document.getElementById('embalaje').value,
      temperaturaCamion: Number(document.getElementById('temperaturaCamion').value)
    };

    const campoVen = document.getElementById('fechaVencimiento');

    if (
      !datos.proveedor ||
      !datos.producto ||
      !datos.peso ||
      !datos.ubicacion ||
      !datos.fechaRecepcion ||
      !datos.fechaVencimiento ||
      !datos.embalaje ||
      document.getElementById('temperaturaCamion').value === ''
    ) {
      setMsg(recepcionMsg, 'Completá todos los campos obligatorios del lote', 'crit');
      return;
    }

    const checksOk = ['checkPrecinto', 'checkLimpieza', 'checkTermometro'].every(
      (id) => document.getElementById(id)?.checked
    );
    if (!checksOk) {
      setMsg(recepcionMsg, 'Verificá los tres controles sanitarios de muelle antes de descargar', 'crit');
      return;
    }

    // Validación RF-03 / CU-01 E1 / US-101: mínimo 3 meses desde recepción
    const lotePrueba = new LoteCarne({
      codigoLote: 'TEMP',
      proveedor: datos.proveedor,
      producto: datos.producto,
      pesoKg: datos.peso,
      fechaRecepcion: datos.fechaRecepcion,
      fechaVencimiento: datos.fechaVencimiento,
      ubicacionCamara: datos.ubicacion,
      tipoEmbalaje: datos.embalaje,
      temperaturaCamion: datos.temperaturaCamion
    });

    if (!lotePrueba.validarVencimientoValido()) {
      if (campoVen) campoVen.dataset.invalid = 'true';
      setMsg(
        recepcionMsg,
        'Error: el vencimiento debe ser mínimo 3 meses luego de la recepción',
        'crit'
      );
      return;
    }

    if (campoVen) campoVen.dataset.invalid = 'false';

    // Validación RF-04 / CU-01 A1: Temperatura de camión > -18 °C
    if (datos.temperaturaCamion > -18) {
      pendienteRecepcion = datos;
      if (recepcionConfirmTexto) {
        recepcionConfirmTexto.textContent = `Temperatura superior a −18 °C (${fmtTemp(datos.temperaturaCamion)} °C). ¿Desea registrar con alerta?`;
      }
      recepcionConfirm?.classList.remove('is-hidden');
      setMsg(recepcionMsg, '');
      return;
    }

    confirmarYGuardarRecepcion(datos, false);
  });

  recepcionConfirmOk?.addEventListener('click', () => {
    if (pendienteRecepcion) {
      confirmarYGuardarRecepcion(pendienteRecepcion, true);
    }
  });

  recepcionConfirmCancel?.addEventListener('click', () => {
    recepcionConfirm?.classList.add('is-hidden');
    pendienteRecepcion = null;
    setMsg(recepcionMsg, 'Registro detenido por el operador', 'warn');
  });

  /* ---------------------------------------------------------------
     CU-02: Venta, Despacho y Emisión de Remito (RF-06, RF-07, RF-08)
     --------------------------------------------------------------- */
  productoDespacho?.addEventListener('change', () => {
    if (codigoLoteInput) codigoLoteInput.dataset.auto = 'true';
    actualizarBalanceDespachoPreview();
  });

  pesoDespachoInput?.addEventListener('input', actualizarBalanceDespachoPreview);

  codigoLoteInput?.addEventListener('input', () => {
    codigoLoteInput.dataset.auto = 'false';
  });

  function renderRemitoSeleccionado() {
    if (!remitoSeleccionado) return;
    document.getElementById('remitoNumero').textContent = remitoSeleccionado.numeroRemito;
    document.getElementById('remitoFecha').textContent = remitoSeleccionado.fechaEmision;
    document.getElementById('remitoCliente').textContent = remitoSeleccionado.cliente;
    document.getElementById('remitoProducto').textContent = remitoSeleccionado.producto;
    document.getElementById('remitoPeso').textContent = fmtPeso(remitoSeleccionado.pesoDespachado);
    document.getElementById('remitoLote').textContent = remitoSeleccionado.codigoLote;
    document.getElementById('remitoSalida').textContent = remitoSeleccionado.estadoTransporte;
    document.getElementById('remitoOperador').textContent = remitoSeleccionado.operador;
  }

  function renderHistorialRemitos() {
    const body = document.getElementById('remitosHistoryBody');
    if (!body) return;

    body.innerHTML = sistema.remitosEmitidos
      .map(
        (r, idx) => `
        <tr>
          <td class="t-mono cell-strong">${r.numeroRemito}</td>
          <td class="t-mono">${r.fechaEmision}</td>
          <td class="cell-strong">${r.cliente}</td>
          <td>${r.producto}</td>
          <td class="t-mono">${r.codigoLote}</td>
          <td class="t-mono num">${fmtPeso(r.pesoDespachado)}</td>
          <td><span class="status" data-state="ok">≤ −18,0 °C validado</span></td>
          <td class="cell-right">
            <button type="button" class="btn btn-ghost" data-select-remito="${idx}">
              Ver remito
            </button>
          </td>
        </tr>
      `
      )
      .join('');

    body.querySelectorAll('[data-select-remito]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.selectRemito);
        if (sistema.remitosEmitidos[idx]) {
          remitoSeleccionado = sistema.remitosEmitidos[idx];
          renderRemitoSeleccionado();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  despachoForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const cliente = document.getElementById('cliente').value.trim();
    const loteIdx = productoDespacho.value === '' ? -1 : Number(productoDespacho.value);
    const peso = Number(pesoDespachoInput.value);
    const codigoManual = codigoLoteInput.value.trim();
    const refrigerado = Boolean(camionRefrigeradoInput.checked);

    if (!cliente) {
      setMsg(despachoMsg, 'Ingresá el nombre del cliente o establecimiento receptor', 'crit');
      return;
    }

    const resultado = sistema.procesarDespacho(
      cliente,
      loteIdx,
      peso,
      refrigerado,
      codigoManual
    );

    if (!resultado.ok) {
      setMsg(despachoMsg, resultado.error, 'crit');
      return;
    }

    remitoSeleccionado = resultado.remito;

    notificaciones.unshift({
      estado: 'ok',
      titulo: `Remito ${resultado.remito.numeroRemito} emitido`,
      texto: `${fmtPeso(resultado.remito.pesoDespachado)} de ${resultado.remito.producto} (${resultado.remito.codigoLote}) para ${resultado.remito.cliente}`,
      tiempo: 'Ahora'
    });
    notificationBadge?.classList.remove('is-hidden');

    renderNotificaciones();
    renderRemitoSeleccionado();
    renderHistorialRemitos();
    renderTodoStock();

    despachoForm.reset();
    if (codigoLoteInput) codigoLoteInput.dataset.auto = 'true';
    actualizarBalanceDespachoPreview();
    setMsg(despachoMsg, '');
    setMsg(
      remitoMsg,
      `Despacho confirmado. Comprobante ${resultado.remito.numeroRemito} generado y stock actualizado`,
      'ok'
    );

    showScreen('screen-remito', 'remito');
  });

  document.getElementById('printRemitoBtn')?.addEventListener('click', () => {
    if (!remitoSeleccionado) {
      setMsg(remitoMsg, 'Todavía no hay remito seleccionado', 'crit');
      return;
    }
    remitoSeleccionado.imprimir();
  });

  document.getElementById('downloadRemitoBtn')?.addEventListener('click', () => {
    if (!remitoSeleccionado) {
      setMsg(remitoMsg, 'Todavía no hay remito seleccionado', 'crit');
      return;
    }
    const contenido = remitoSeleccionado.generarTextoPlano();
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${remitoSeleccionado.numeroRemito}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  });

  /* ---------------------------------------------------------------
     CU-03: Registro y Clasificación de Mermas (RF-09)
     --------------------------------------------------------------- */
  function renderMermas() {
    const conteo = {
      [CausaMerma.PERDIDA_FRIO]: 0,
      [CausaMerma.VENCIMIENTO]: 0,
      [CausaMerma.DANO_EMBALAJE]: 0,
      [CausaMerma.DEVOLUCION_CLIENTE]: 0
    };

    sistema.mermas.forEach((m) => {
      conteo[m.causa] = (conteo[m.causa] || 0) + 1;
    });

    const entradas = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
    const maximo = Math.max(1, ...entradas.map(([, c]) => c));

    const rank = document.getElementById('mermasRank');
    if (rank) {
      rank.innerHTML = entradas
        .map(([causa, cantidad]) => {
          const pct = Math.round((cantidad / maximo) * 100);
          return `
            <div class="rank-row">
              <span class="rank-label">${causa}</span>
              <span class="rank-count">${cantidad} ${cantidad === 1 ? 'incidente' : 'incidentes'}</span>
              <div class="rank-bar"><span style="width:${pct}%"></span></div>
            </div>
          `;
        })
        .join('');
    }

    const total = document.getElementById('mermasTotal');
    if (total) {
      total.textContent = `Total auditado: ${sistema.mermas.length} registros de merma`;
    }

    if (perdidasBody) {
      perdidasBody.innerHTML = sistema.mermas
        .map(
          (m) => `
          <tr>
            <td class="t-mono">${fmtFecha(m.fecha)}</td>
            <td class="cell-strong">${m.causa}</td>
            <td>${m.detalle}</td>
          </tr>
        `
        )
        .join('');
    }
  }

  perdidasForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const causa = document.getElementById('causaPerdida').value;
    const fecha = document.getElementById('fechaPerdida').value;
    const detalle = document.getElementById('detallePerdida').value.trim();

    if (!causa || !fecha || !detalle) {
      setMsg(perdidasMsg, 'Completá la causa, fecha y detalle técnico de la merma', 'crit');
      return;
    }

    sistema.registrarMerma(new RegistroPerdida({ fecha, causa, detalle }));
    renderMermas();
    perdidasForm.reset();
    inicializarFechasRecepcion();
    setMsg(perdidasMsg, 'Merma registrada e impactada en la distribución estadística', 'ok');
  });

  /* ---------------------------------------------------------------
     Gráfico Principal de Telemetría Térmica (Chart.js, Pass 7 & 8)
     --------------------------------------------------------------- */
  const COLOR_ACCENT = '#4ec5d6';
  const COLOR_CRIT = '#e5484d';
  const COLOR_GRID = 'rgba(237, 237, 237, 0.06)';
  const COLOR_BORDER = 'rgba(237, 237, 237, 0.12)';
  const COLOR_MUTED = '#85858b';
  const HORAS_LABELS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const pluginUmbralSenasa = {
    id: 'pluginUmbralSenasa',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea) return;

      const yUmbral = scales.y.getPixelForValue(BANDA_MAX);
      ctx.save();
      ctx.strokeStyle = 'rgba(237, 237, 237, 0.22)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartArea.left, yUmbral);
      ctx.lineTo(chartArea.right, yUmbral);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = COLOR_MUTED;
      ctx.font = '400 11px "Geist Mono", ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Límite SENASA −18,0 °C', chartArea.right - 6, yUmbral - 6);

      const datosCam = CAMARAS.find((c) => c.id === camaraActivaGrafico);
      if (datosCam && typeof datosCam.excursionIdx === 'number') {
        const xExc = scales.x.getPixelForValue(datosCam.excursionIdx);
        ctx.strokeStyle = 'rgba(229, 72, 77, 0.45)';
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(xExc, chartArea.top);
        ctx.lineTo(xExc, chartArea.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = COLOR_CRIT;
        ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('15:00 · Apertura de muelle', xExc + 8, chartArea.top + 14);
      }

      ctx.restore();
    }
  };

  function obtenerDatosGraficoCamara(camId) {
    return CAMARAS.find((c) => c.id === camId) || CAMARAS[2];
  }

  function actualizarEncabezadoGrafico(cam) {
    const titleEl = document.getElementById('chartTitleText');
    const subEl = document.getElementById('chartSubText');
    const tempEl = document.getElementById('chartCurrentTemp');
    const noteEl = document.getElementById('chartCurrentNote');
    const fuera = cam.temp > BANDA_MAX;

    if (titleEl) titleEl.textContent = `Curva térmica · ${cam.nombre}`;
    if (subEl) subEl.textContent = cam.subtitulo;
    if (tempEl) {
      tempEl.textContent = `${fmtTemp(cam.temp)} °C`;
      tempEl.className = `chart-value ${fuera ? 't-crit' : 't-accent'}`;
    }
    if (noteEl) {
      noteEl.textContent = cam.nota;
    }
  }

  function initTelemetryChart() {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('tempChart');
    if (!canvas) return;

    Chart.defaults.color = COLOR_MUTED;
    Chart.defaults.font.family = '"Geist Mono", ui-monospace, monospace';
    Chart.defaults.font.size = 11;

    const camInicial = obtenerDatosGraficoCamara(camaraActivaGrafico);
    actualizarEncabezadoGrafico(camInicial);

    tempChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: HORAS_LABELS,
        datasets: [
          {
            label: 'Techo banda segura',
            data: HORAS_LABELS.map(() => BANDA_MAX),
            borderWidth: 0,
            pointRadius: 0,
            fill: '+1',
            backgroundColor: 'rgba(237, 237, 237, 0.035)',
            order: 3
          },
          {
            label: 'Piso banda segura',
            data: HORAS_LABELS.map(() => BANDA_MIN),
            borderWidth: 0,
            pointRadius: 0,
            fill: false,
            order: 3
          },
          {
            label: 'Temperatura de cámara',
            data: camInicial.curva,
            borderColor: COLOR_ACCENT,
            borderWidth: 2,
            tension: 0.3,
            order: 1,
            pointRadius: (ctx) => {
              const c = obtenerDatosGraficoCamara(camaraActivaGrafico);
              return ctx.dataIndex === c.picoIdx || ctx.dataIndex === HORAS_LABELS.length - 1 ? 4 : 0;
            },
            pointBackgroundColor: (ctx) => {
              const val = ctx.raw;
              return val > BANDA_MAX ? COLOR_CRIT : COLOR_ACCENT;
            },
            pointBorderColor: (ctx) => {
              const val = ctx.raw;
              return val > BANDA_MAX ? COLOR_CRIT : COLOR_ACCENT;
            },
            segment: {
              borderColor: (ctx) =>
                ctx.p1.parsed.y > BANDA_MAX || ctx.p0.parsed.y > BANDA_MAX
                  ? COLOR_CRIT
                  : COLOR_ACCENT
            }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 360, easing: 'easeOutCubic' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            filter: (item) => item.datasetIndex === 2,
            displayColors: false,
            backgroundColor: '#19191b',
            borderColor: COLOR_BORDER,
            borderWidth: 1,
            titleColor: COLOR_MUTED,
            bodyColor: '#ededed',
            padding: 10,
            callbacks: {
              title: (items) => `${camaraActivaGrafico} · ${items[0].label} h`,
              label: (item) => {
                const v = item.parsed.y;
                const estado = v > BANDA_MAX ? 'Excursión (> −18 °C)' : 'En rango SENASA';
                return `${fmtTemp(v)} °C · ${estado}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: COLOR_BORDER },
            ticks: { color: COLOR_MUTED, padding: 8, maxRotation: 0 }
          },
          y: {
            min: -25,
            max: -10,
            ticks: {
              stepSize: 5,
              color: COLOR_MUTED,
              padding: 8,
              callback: (value) => `${value < 0 ? '−' : '+'}${Math.abs(value)} °C`
            },
            grid: { color: COLOR_GRID },
            border: { display: false }
          }
        }
      },
      plugins: [pluginUmbralSenasa]
    });
  }

  document.querySelectorAll('[data-cam-chart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      camaraActivaGrafico = btn.dataset.camChart;
      document.querySelectorAll('[data-cam-chart]').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      const cam = obtenerDatosGraficoCamara(camaraActivaGrafico);
      actualizarEncabezadoGrafico(cam);
      if (tempChartInstance) {
        tempChartInstance.data.datasets[2].data = cam.curva;
        tempChartInstance.update();
      }
    });
  });

  /* ---------------------------------------------------------------
     Arranque inicial del sistema
     --------------------------------------------------------------- */
  if (turnoLabel) {
    const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(HOY);
    turnoLabel.textContent = `Turno noche · ${fechaFormateada} · Estación Avellaneda`;
  }

  inicializarFechasRecepcion();
  actualizarPreviewEtiquetaRecepcion();
  renderNotificaciones();
  renderRemitoSeleccionado();
  renderHistorialRemitos();
  renderTodoStock();
  renderMermas();
  initTelemetryChart();
});

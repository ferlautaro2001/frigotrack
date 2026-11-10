/**
 * Enumeración de estados del semáforo de vencimiento (RF-05 / UML 7.1)
 */
export const EstadoAlerta = Object.freeze({
  OK_VERDE: 'OK_VERDE',
  ATENCION_AMARILLO: 'ATENCION_AMARILLO',
  CRITICO_ROJO: 'CRITICO_ROJO'
});

/**
 * Enumeración de causas tipificadas de merma (RF-09 / UML 7.1)
 */
export const CausaMerma = Object.freeze({
  PERDIDA_FRIO: 'Pérdida de frío',
  VENCIMIENTO: 'Vencimiento',
  DANO_EMBALAJE: 'Daño de embalaje',
  DEVOLUCION_CLIENTE: 'Devolución cliente'
});

/**
 * Permisos por rol operativo (RF-01)
 */
export const PERMISOS_POR_ROL = Object.freeze({
  Administrador: ['dashboard', 'recepcion', 'stock', 'alertas', 'despacho', 'remito', 'mermas'],
  Recepción: ['dashboard', 'recepcion', 'stock', 'alertas', 'mermas'],
  Logística: ['dashboard', 'stock', 'alertas', 'despacho', 'remito', 'mermas']
});

/**
 * Parámetros de telemetría de cámaras frigoríficas (Norma SENASA <= -18 °C)
 */
export const RAIL_MIN = -30;
export const RAIL_MAX = 5;
export const BANDA_MIN = -25;
export const BANDA_MAX = -18;
export const CAPACIDAD_MAX_KG = 3000;

/**
 * Paleta de colores para gráficos y visualización de telemetría
 */
export const COLOR_ACCENT = '#4ec5d6';
export const COLOR_CRIT = '#e5484d';
export const COLOR_GRID = 'rgba(237, 237, 237, 0.06)';
export const COLOR_BORDER = 'rgba(237, 237, 237, 0.12)';
export const COLOR_MUTED = '#85858b';

export const HORAS_LABELS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

/**
 * Mapeo de identificador de pantalla con botón de navegación
 */
export const NAV_POR_PANTALLA = Object.freeze({
  'screen-login': 'dashboard',
  'screen-recepcion': 'recepcion',
  'screen-stock': 'stock',
  'screen-despacho': 'despacho',
  'screen-remito': 'remito',
  'screen-perdidas': 'mermas'
});

export const CAMPOS_PREVIEW_RECEPCION = [
  'proveedor',
  'producto',
  'peso',
  'ubicacion',
  'fechaRecepcion',
  'fechaVencimiento',
  'embalaje',
  'temperaturaCamion'
];

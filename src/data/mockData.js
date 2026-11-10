import { LoteCarne } from '../models/LoteCarne.js';
import { Remito } from '../models/Remito.js';
import { RegistroPerdida } from '../models/RegistroPerdida.js';
import { CausaMerma } from '../config/constants.js';
import { isoEnDias, fmtFecha } from '../utils/formatters.js';

export const CAMARAS = [
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

export function obtenerLotesIniciales() {
  return [
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
}

export function obtenerRemitosIniciales() {
  return [
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
}

export function obtenerMermasIniciales() {
  return [
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
}

export function obtenerNotificacionesIniciales() {
  return [
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
}

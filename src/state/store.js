import { SistemaFrigoTrack } from '../models/SistemaFrigoTrack.js';
import {
  obtenerLotesIniciales,
  obtenerRemitosIniciales,
  obtenerMermasIniciales,
  obtenerNotificacionesIniciales
} from '../data/mockData.js';

export const sistema = new SistemaFrigoTrack();
sistema.stock = obtenerLotesIniciales();
sistema.remitosEmitidos = obtenerRemitosIniciales();
sistema.mermas = obtenerMermasIniciales();

export const notificaciones = obtenerNotificacionesIniciales();

export const uiState = {
  filtroStockActual: 'all',
  textoBusqueda: '',
  camaraActivaGrafico: 'Cámara 3',
  tempChartInstance: null,
  remitoSeleccionado: sistema.remitosEmitidos[0] || null,
  pendienteRecepcion: null
};

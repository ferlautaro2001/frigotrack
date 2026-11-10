import { CAMARAS } from '../data/mockData.js';
import { BANDA_MAX, BANDA_MIN } from '../config/constants.js';

export function obtenerCamaras() {
  return CAMARAS;
}

export function obtenerDatosGraficoCamara(camId) {
  return CAMARAS.find((c) => c.id === camId) || CAMARAS[2];
}

export function verificarExcursion(temp) {
  return temp > BANDA_MAX || temp < BANDA_MIN;
}

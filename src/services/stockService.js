import { CAPACIDAD_MAX_KG, EstadoAlerta } from '../config/constants.js';
import { mapearSemaforoUI, HOY } from '../utils/formatters.js';

/**
 * Calcula el porcentaje de ocupación respecto de la capacidad nominal de cámaras
 */
export function calcularOcupacionPct(stock) {
  const totalKg = stock.reduce((acc, lote) => acc + (lote.pesoKg > 0 ? lote.pesoKg : 0), 0);
  return Math.min(99, Math.max(10, Math.round((totalKg / CAPACIDAD_MAX_KG) * 100)));
}

/**
 * Filtra el inventario de stock según el semáforo seleccionado y el texto de búsqueda
 */
export function obtenerStockFiltrado(stock, filtroActual = 'all', textoBusqueda = '') {
  return stock.filter((lote) => {
    if (lote.pesoKg <= 0) return false;
    const sem = mapearSemaforoUI(lote);
    if (filtroActual !== 'all' && sem.key !== filtroActual) {
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

/**
 * Contabiliza lotes en alerta crítica, atención y totales
 */
export function calcularMetricasStock(stock, fechaRef = HOY) {
  let criticos = 0;
  let atencion = 0;
  let totalKg = 0;
  let lotesActivos = 0;

  stock.forEach((lote) => {
    if (lote.pesoKg <= 0) return;
    lotesActivos += 1;
    totalKg += lote.pesoKg;
    const estado = lote.obtenerEstadoSemaforo(fechaRef);
    if (estado === EstadoAlerta.CRITICO_ROJO) criticos += 1;
    if (estado === EstadoAlerta.ATENCION_AMARILLO) atencion += 1;
  });

  return { criticos, atencion, totalKg, lotesActivos };
}

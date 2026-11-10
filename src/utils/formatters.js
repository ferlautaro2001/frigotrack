import { RAIL_MIN, RAIL_MAX, EstadoAlerta } from '../config/constants.js';

export const HOY = new Date();
HOY.setHours(0, 0, 0, 0);

export function isoEnDias(dias) {
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

export const fmtPeso = (valor) => `${nf1.format(Number(valor) || 0)} kg`;

export const fmtTemp = (valor) => {
  const num = Number(valor);
  return `${num < 0 ? '−' : '+'}${Math.abs(num).toFixed(1).replace('.', ',')}`;
};

export const fmtFecha = (iso) => {
  if (!iso || !iso.includes('-')) return '—';
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
};

export const pctRail = (valor) => ((valor - RAIL_MIN) / (RAIL_MAX - RAIL_MIN)) * 100;

export function mapearSemaforoUI(lote) {
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

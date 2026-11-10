/* =========================================================================
   FrigoTrack — Punto de Entrada y Coordinador de la Aplicación
   Cumple con el Diagrama de Clases UML y Requerimientos RF-01 a RF-09
   ========================================================================= */

import { EstadoAlerta, CausaMerma } from './config/constants.js';
import { Usuario } from './models/Usuario.js';
import { LoteCarne } from './models/LoteCarne.js';
import { Remito } from './models/Remito.js';
import { RegistroPerdida } from './models/RegistroPerdida.js';
import { SistemaFrigoTrack } from './models/SistemaFrigoTrack.js';
import { sistema, uiState } from './state/store.js';
import { HOY } from './utils/formatters.js';
import { $ } from './utils/dom.js';

import { setupNavigation } from './ui/navigation.js';
import { setupAuth } from './ui/auth.js';
import { setupNotifications, renderNotificaciones } from './ui/notifications.js';
import { initTelemetryChart } from './ui/charts.js';
import { renderTodoStock } from './ui/renderers/stockTable.js';
import { renderRemitoSeleccionado, renderHistorialRemitos, setupRemitoActions } from './ui/renderers/remitoView.js';
import { renderMermas } from './ui/renderers/mermasTable.js';
import {
  inicializarFechasRecepcion,
  actualizarPreviewEtiquetaRecepcion,
  setupWorkflows
} from './ui/workflows.js';

// Exposición del modelo de dominio para consola y testing automatizado
window.FrigoTrackDomain = {
  EstadoAlerta,
  CausaMerma,
  Usuario,
  LoteCarne,
  Remito,
  RegistroPerdida,
  SistemaFrigoTrack
};
window.sistema = sistema;
window.uiState = uiState;

function initApp() {
  const turnoLabel = $('turnoLabel');
  if (turnoLabel) {
    const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(HOY);
    turnoLabel.textContent = `Turno noche · ${fechaFormateada} · Estación Avellaneda`;
  }

  // Configuración de módulos e interactividad
  setupNavigation();
  setupAuth();
  setupNotifications();
  setupRemitoActions();
  setupWorkflows();

  // Inicialización de estado y renderizado inicial
  inicializarFechasRecepcion();
  actualizarPreviewEtiquetaRecepcion();
  renderNotificaciones();
  renderRemitoSeleccionado();
  renderHistorialRemitos();
  renderTodoStock();
  renderMermas();
  initTelemetryChart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

import { sistema, uiState } from '../../state/store.js';
import { CAMARAS } from '../../data/mockData.js';
import { BANDA_MIN, BANDA_MAX, CAPACIDAD_MAX_KG } from '../../config/constants.js';
import { fmtPeso, fmtTemp, fmtFecha, pctRail, mapearSemaforoUI, HOY } from '../../utils/formatters.js';
import { calcularOcupacionPct, obtenerStockFiltrado, calcularMetricasStock } from '../../services/stockService.js';
import { $ } from '../../utils/dom.js';

export function renderCamaras(targetId) {
  const target = $(targetId);
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

  const ocupacionPct = calcularOcupacionPct(sistema.stock);
  const totalKg = sistema.stock.reduce((acc, lote) => acc + (lote.pesoKg > 0 ? lote.pesoKg : 0), 0);

  const tarjetaOcupacion = `
    <div class="instrument">
      <div class="instrument-top">
        <span class="instrument-label">Capacidad ocupada</span>
        <span class="instrument-sector">${sistema.stock.filter((l) => l.pesoKg > 0).length} lotes activos</span>
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

export function renderTablaCola() {
  const body = $('stockTableBody');
  if (!body) return;

  const lotes = obtenerStockFiltrado(sistema.stock, uiState.filtroStockActual, uiState.textoBusqueda);
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

export function renderTablaStockCompleta() {
  const body = $('stockTableBodyFull');
  const summary = $('stockFilterSummary');
  if (!body) return;

  const lotes = obtenerStockFiltrado(sistema.stock, uiState.filtroStockActual, uiState.textoBusqueda);
  if (summary) {
    const etiquetasFiltro = {
      all: 'Todos los estados de semáforo',
      crit: 'Filtro activo: Alerta roja (< 2 meses)',
      warn: 'Filtro activo: Atención (< 3 meses)',
      ok: 'Filtro activo: OK (≥ 3 meses)'
    };
    const sufijoBusqueda = uiState.textoBusqueda ? ` · búsqueda "${uiState.textoBusqueda}"` : '';
    summary.textContent = `${lotes.length} lotes encontrados · ${etiquetasFiltro[uiState.filtroStockActual]}${sufijoBusqueda}`;
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

export function renderAlertasEnVivo() {
  const container = $('liveAlertsList');
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

export function renderOpcionesDespacho() {
  const productoDespacho = $('productoDespacho');
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

export function actualizarBalanceDespachoPreview() {
  const productoDespacho = $('productoDespacho');
  const pesoDespachoInput = $('pesoDespacho');
  const codigoLoteInput = $('codigoLote');

  const idx = Number(productoDespacho?.value);
  const lote = Number.isInteger(idx) && productoDespacho?.value !== '' ? sistema.stock[idx] : null;
  const pesoSolicitado = Number(pesoDespachoInput?.value) || 0;

  const elLote = $('despPreviewLote');
  const elSem = $('despPreviewSemaforo');
  const elDisp = $('despPreviewDisponible');
  const elRem = $('despPreviewRemanente');

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

export function updateKPIs() {
  const { criticos, atencion, totalKg, lotesActivos } = calcularMetricasStock(sistema.stock, HOY);

  const kpiRecepciones = $('kpiRecepciones');
  const kpiRecepcionesMeta = $('kpiRecepcionesMeta');
  const kpiStockKg = $('kpiStockKg');
  const kpiStockMeta = $('kpiStockMeta');
  const kpiVencer = $('kpiVencer');
  const kpiVencerCrit = $('kpiVencerCrit');
  const kpiVencerWarn = $('kpiVencerWarn');
  const kpiDespachos = $('kpiDespachos');
  const kpiDespachosMeta = $('kpiDespachosMeta');
  const kpiSidebarAlerts = $('kpiSidebarAlerts');
  const kpiSidebarRemitos = $('kpiSidebarRemitos');

  if (kpiRecepciones) kpiRecepciones.textContent = String(sistema.recepcionesTurno);
  if (kpiRecepcionesMeta) {
    kpiRecepcionesMeta.textContent = `+${sistema.recepcionesTurno - 36} vs turno anterior · ${sistema.recepcionesTurno - 4} en rango ≤ −18 °C`;
  }

  if (kpiStockKg) kpiStockKg.textContent = fmtPeso(totalKg);
  if (kpiStockMeta) {
    kpiStockMeta.textContent = `${lotesActivos} lotes trazados · ${calcularOcupacionPct(sistema.stock)}% de capacidad`;
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

export function renderTodoStock() {
  renderCamaras('camarasGrid');
  renderCamaras('camarasGridStock');
  renderTablaCola();
  renderTablaStockCompleta();
  renderAlertasEnVivo();
  renderOpcionesDespacho();
  updateKPIs();
}

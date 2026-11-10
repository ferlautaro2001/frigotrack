import { sistema, uiState } from '../../state/store.js';
import { fmtPeso } from '../../utils/formatters.js';
import { $, setMsg } from '../../utils/dom.js';

export function renderRemitoSeleccionado() {
  if (!uiState.remitoSeleccionado) return;
  const r = uiState.remitoSeleccionado;
  const elNum = $('remitoNumero');
  const elFecha = $('remitoFecha');
  const elCli = $('remitoCliente');
  const elProd = $('remitoProducto');
  const elPeso = $('remitoPeso');
  const elLote = $('remitoLote');
  const elSal = $('remitoSalida');
  const elOp = $('remitoOperador');

  if (elNum) elNum.textContent = r.numeroRemito;
  if (elFecha) elFecha.textContent = r.fechaEmision;
  if (elCli) elCli.textContent = r.cliente;
  if (elProd) elProd.textContent = r.producto;
  if (elPeso) elPeso.textContent = fmtPeso(r.pesoDespachado);
  if (elLote) elLote.textContent = r.codigoLote;
  if (elSal) elSal.textContent = r.estadoTransporte;
  if (elOp) elOp.textContent = r.operador;
}

export function renderHistorialRemitos() {
  const body = $('remitosHistoryBody');
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
        uiState.remitoSeleccionado = sistema.remitosEmitidos[idx];
        renderRemitoSeleccionado();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

export function setupRemitoActions() {
  const remitoMsg = $('remitoMsg');

  $('printRemitoBtn')?.addEventListener('click', () => {
    if (!uiState.remitoSeleccionado) {
      setMsg(remitoMsg, 'Todavía no hay remito seleccionado', 'crit');
      return;
    }
    uiState.remitoSeleccionado.imprimir();
  });

  $('downloadRemitoBtn')?.addEventListener('click', () => {
    if (!uiState.remitoSeleccionado) {
      setMsg(remitoMsg, 'Todavía no hay remito seleccionado', 'crit');
      return;
    }
    const contenido = uiState.remitoSeleccionado.generarTextoPlano();
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${uiState.remitoSeleccionado.numeroRemito}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

import { sistema } from '../../state/store.js';
import { CausaMerma } from '../../config/constants.js';
import { fmtFecha } from '../../utils/formatters.js';
import { $ } from '../../utils/dom.js';

export function renderMermas() {
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

  const rank = $('mermasRank');
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

  const total = $('mermasTotal');
  if (total) {
    total.textContent = `Total auditado: ${sistema.mermas.length} registros de merma`;
  }

  const perdidasBody = $('perdidasBody');
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

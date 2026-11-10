import { uiState } from '../state/store.js';
import { CAMARAS } from '../data/mockData.js';
import {
  BANDA_MIN,
  BANDA_MAX,
  COLOR_ACCENT,
  COLOR_CRIT,
  COLOR_GRID,
  COLOR_BORDER,
  COLOR_MUTED,
  HORAS_LABELS
} from '../config/constants.js';
import { fmtTemp } from '../utils/formatters.js';
import { obtenerDatosGraficoCamara } from '../services/telemetryService.js';
import { $ } from '../utils/dom.js';

export const pluginUmbralSenasa = {
  id: 'pluginUmbralSenasa',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const yUmbral = scales.y.getPixelForValue(BANDA_MAX);
    ctx.save();
    ctx.strokeStyle = 'rgba(237, 237, 237, 0.22)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartArea.left, yUmbral);
    ctx.lineTo(chartArea.right, yUmbral);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = COLOR_MUTED;
    ctx.font = '400 11px "Geist Mono", ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Límite SENASA −18,0 °C', chartArea.right - 6, yUmbral - 6);

    const datosCam = CAMARAS.find((c) => c.id === uiState.camaraActivaGrafico);
    if (datosCam && typeof datosCam.excursionIdx === 'number') {
      const xExc = scales.x.getPixelForValue(datosCam.excursionIdx);
      ctx.strokeStyle = 'rgba(229, 72, 77, 0.45)';
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(xExc, chartArea.top);
      ctx.lineTo(xExc, chartArea.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = COLOR_CRIT;
      ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('15:00 · Apertura de muelle', xExc + 8, chartArea.top + 14);
    }

    ctx.restore();
  }
};

export function actualizarEncabezadoGrafico(cam) {
  const titleEl = $('chartTitleText');
  const subEl = $('chartSubText');
  const tempEl = $('chartCurrentTemp');
  const noteEl = $('chartCurrentNote');
  const fuera = cam.temp > BANDA_MAX;

  if (titleEl) titleEl.textContent = `Curva térmica · ${cam.nombre}`;
  if (subEl) subEl.textContent = cam.subtitulo;
  if (tempEl) {
    tempEl.textContent = `${fmtTemp(cam.temp)} °C`;
    tempEl.className = `chart-value ${fuera ? 't-crit' : 't-accent'}`;
  }
  if (noteEl) {
    noteEl.textContent = cam.nota;
  }
}

export function initTelemetryChart() {
  if (typeof Chart === 'undefined') return;
  const canvas = $('tempChart');
  if (!canvas) return;

  Chart.defaults.color = COLOR_MUTED;
  Chart.defaults.font.family = '"Geist Mono", ui-monospace, monospace';
  Chart.defaults.font.size = 11;

  const camInicial = obtenerDatosGraficoCamara(uiState.camaraActivaGrafico);
  actualizarEncabezadoGrafico(camInicial);

  uiState.tempChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: HORAS_LABELS,
      datasets: [
        {
          label: 'Techo banda segura',
          data: HORAS_LABELS.map(() => BANDA_MAX),
          borderWidth: 0,
          pointRadius: 0,
          fill: '+1',
          backgroundColor: 'rgba(237, 237, 237, 0.035)',
          order: 3
        },
        {
          label: 'Piso banda segura',
          data: HORAS_LABELS.map(() => BANDA_MIN),
          borderWidth: 0,
          pointRadius: 0,
          fill: false,
          order: 3
        },
        {
          label: 'Temperatura de cámara',
          data: camInicial.curva,
          borderColor: COLOR_ACCENT,
          borderWidth: 2,
          tension: 0.3,
          order: 1,
          pointRadius: (ctx) => {
            const c = obtenerDatosGraficoCamara(uiState.camaraActivaGrafico);
            return ctx.dataIndex === c.picoIdx || ctx.dataIndex === HORAS_LABELS.length - 1 ? 4 : 0;
          },
          pointBackgroundColor: (ctx) => {
            const val = ctx.raw;
            return val > BANDA_MAX ? COLOR_CRIT : COLOR_ACCENT;
          },
          pointBorderColor: (ctx) => {
            const val = ctx.raw;
            return val > BANDA_MAX ? COLOR_CRIT : COLOR_ACCENT;
          },
          segment: {
            borderColor: (ctx) =>
              ctx.p1.parsed.y > BANDA_MAX || ctx.p0.parsed.y > BANDA_MAX
                ? COLOR_CRIT
                : COLOR_ACCENT
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 360, easing: 'easeOutCubic' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          filter: (item) => item.datasetIndex === 2,
          displayColors: false,
          backgroundColor: '#19191b',
          borderColor: COLOR_BORDER,
          borderWidth: 1,
          titleColor: COLOR_MUTED,
          bodyColor: '#ededed',
          padding: 10,
          callbacks: {
            title: (items) => `${uiState.camaraActivaGrafico} · ${items[0].label} h`,
            label: (item) => {
              const v = item.parsed.y;
              const estado = v > BANDA_MAX ? 'Excursión (> −18 °C)' : 'En rango SENASA';
              return `${fmtTemp(v)} °C · ${estado}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: COLOR_BORDER },
          ticks: { color: COLOR_MUTED, padding: 8, maxRotation: 0 }
        },
        y: {
          min: -25,
          max: -10,
          ticks: {
            stepSize: 5,
            color: COLOR_MUTED,
            padding: 8,
            callback: (value) => `${value < 0 ? '−' : '+'}${Math.abs(value)} °C`
          },
          grid: { color: COLOR_GRID },
          border: { display: false }
        }
      }
    },
    plugins: [pluginUmbralSenasa]
  });

  document.querySelectorAll('[data-cam-chart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      uiState.camaraActivaGrafico = btn.dataset.camChart;
      document.querySelectorAll('[data-cam-chart]').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      const cam = obtenerDatosGraficoCamara(uiState.camaraActivaGrafico);
      actualizarEncabezadoGrafico(cam);
      if (uiState.tempChartInstance) {
        uiState.tempChartInstance.data.datasets[2].data = cam.curva;
        uiState.tempChartInstance.update();
      }
    });
  });
}

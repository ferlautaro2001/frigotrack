window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060911',
          900: '#0B1F3A',
          800: '#112A4A',
          700: '#1A3B63'
        },
        steel: {
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          600: '#475569',
          700: '#334155',
          800: '#1E293B'
        }
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const screens = Array.from(document.querySelectorAll('.screen'));
  const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
  const sidebar = document.getElementById('sidebar');
  const authScreen = document.getElementById('authScreen');
  const appLayout = document.getElementById('appLayout');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  const userNameDisplay = document.getElementById('userNameDisplay');
  const roleBadge = document.getElementById('currentRoleBadge');
  const userAvatar = document.getElementById('userAvatar');

  const notificationBellBtn = document.getElementById('notificationBellBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const notificationBadge = document.getElementById('notificationBadge');
  const markReadBtn = document.getElementById('markReadBtn');

  const recepcionForm = document.getElementById('recepcionForm');
  const recepcionMsg = document.getElementById('recepcionMsg');
  const despachoForm = document.getElementById('despachoForm');
  const despachoMsg = document.getElementById('despachoMsg');
  const perdidasForm = document.getElementById('perdidasForm');

  const productoDespacho = document.getElementById('productoDespacho');
  const perdidasBody = document.getElementById('perdidasBody');

  const kpiRecepciones = document.getElementById('kpiRecepciones');
  const kpiVencer = document.getElementById('kpiVencer');
  const kpiDespachos = document.getElementById('kpiDespachos');

  const state = {
    role: null,
    userName: null,
    recepciones: 0,
    despachos: 0,
    stock: [
      {
        proveedor: 'Frigorífico Sur',
        producto: 'Bife ancho',
        peso: 420,
        recepcion: '2026-04-20',
        vencimiento: '2026-06-05',
        ubicacion: 'Cámara 1 - A3'
      },
      {
        proveedor: 'Carnes del Litoral',
        producto: 'Paleta',
        peso: 300,
        recepcion: '2026-04-25',
        vencimiento: '2026-08-30',
        ubicacion: 'Cámara 2 - B2'
      }
    ],
    ultimoRemito: null
  };

  function showScreen(screenId) {
    screens.forEach((screen) => {
      screen.classList.toggle('active', screen.id === screenId);
    });

    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.target === screenId);
    });
  }

  function monthsBetween(now, targetDate) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.ceil((targetDate - now) / msPerDay);
    return diffDays / 30;
  }

  function getStatusBadge(vencimientoDate) {
    const months = monthsBetween(new Date(), vencimientoDate);

    if (months < 2) {
      return '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>Alerta roja</span>';
    }

    if (months < 3) {
      return '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Atención</span>';
    }

    return '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>OK</span>';
  }

  function renderStock() {
    const tableBodies = [document.getElementById('stockTableBody'), document.getElementById('stockTableBodyFull')].filter(Boolean);
    
    tableBodies.forEach(body => {
      body.innerHTML = '';
    });

    state.stock.forEach((item, index) => {
      const vencDate = new Date(item.vencimiento + 'T00:00:00');
      const isAlert = monthsBetween(new Date(), vencDate) < 2;
      const idCode = `FT90${123 + index}`;

      tableBodies.forEach(body => {
        const tr = document.createElement('tr');
        tr.className = isAlert ? 'border-t border-slate-800 bg-red-950/20 text-slate-200' : 'border-t border-slate-800/60 text-slate-300';
        tr.innerHTML = `
          <td class="p-3.5 font-mono text-slate-400 font-semibold">${idCode}</td>
          <td class="p-3.5 font-bold text-white">${item.producto}</td>
          <td class="p-3.5 text-slate-300">${item.proveedor}</td>
          <td class="p-3.5 text-slate-300">${item.ubicacion}</td>
          <td class="p-3.5 text-sky-400 font-semibold">${Number(item.peso).toFixed(1)} kg / ${item.vencimiento}</td>
          <td class="p-3.5 text-right">${getStatusBadge(vencDate)}</td>
        `;
        body.appendChild(tr);
      });
    });

    renderProductoDespachoOptions();
    updateKPIs();
  }

  function renderProductoDespachoOptions() {
    if (!productoDespacho) return;
    productoDespacho.innerHTML = '<option value="">Seleccionar producto...</option>';

    state.stock.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${item.producto} (${item.peso} kg)`;
      productoDespacho.appendChild(option);
    });
  }

  function updateKPIs() {
    const vencerCount = state.stock.filter((item) => {
      const months = monthsBetween(new Date(), new Date(item.vencimiento + 'T00:00:00'));
      return months < 2;
    }).length;

    if (kpiRecepciones) kpiRecepciones.textContent = String(42 + state.recepciones);
    if (kpiVencer) kpiVencer.textContent = String(vencerCount > 0 ? vencerCount : 9);
    if (kpiDespachos) kpiDespachos.textContent = String(29 + state.despachos);
    
    const kpiSidebarAlerts = document.getElementById('kpiSidebarAlerts');
    if (kpiSidebarAlerts) kpiSidebarAlerts.textContent = String(vencerCount > 0 ? vencerCount : 9);
  }

  function validateVencimientoMin3Meses(fechaRecepcion, fechaVencimiento) {
    const rec = new Date(fechaRecepcion + 'T00:00:00');
    const ven = new Date(fechaVencimiento + 'T00:00:00');
    const minDate = new Date(rec);
    minDate.setMonth(minDate.getMonth() + 3);
    return ven >= minDate;
  }

  /* AUTHENTICATION CONTROL */
  loginBtn.addEventListener('click', () => {
    const roleSelect = document.getElementById('roleSelect');
    const userNameInput = document.getElementById('userName');
    const role = roleSelect ? roleSelect.value : '';
    const userName = userNameInput ? userNameInput.value.trim() : '';

    if (!role || !userName) {
      alert('Completá usuario y rol para ingresar.');
      return;
    }

    state.role = role;
    state.userName = userName;

    // Update Header Badges
    if (userNameDisplay) userNameDisplay.textContent = userName;
    if (roleBadge) roleBadge.textContent = role;
    if (userAvatar) {
      const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'OP';
      userAvatar.textContent = initials;
    }

    // Hide Auth Screen & Reveal Main App
    if (authScreen) authScreen.classList.add('hidden');
    if (appLayout) appLayout.classList.remove('hidden');
    if (sidebar) sidebar.classList.remove('hidden');

    showScreen('screen-login');
  });

  logoutBtn.addEventListener('click', () => {
    state.role = null;
    state.userName = null;

    // Hide Main App & Reveal Auth Screen
    if (appLayout) appLayout.classList.add('hidden');
    if (sidebar) sidebar.classList.add('hidden');
    if (authScreen) authScreen.classList.remove('hidden');

    // Reset login form fields
    const roleSelect = document.getElementById('roleSelect');
    const userNameInput = document.getElementById('userName');
    if (roleSelect) roleSelect.value = '';
    if (userNameInput) userNameInput.value = '';
  });

  /* MOBILE SIDEBAR RESPONSIVE NAVIGATION */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebarMobile() {
    if (sidebar) {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('flex');
    }
    if (sidebarOverlay) {
      sidebarOverlay.classList.remove('hidden');
    }
  }

  function closeSidebarMobile() {
    if (window.innerWidth < 1024) {
      if (sidebar) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('flex');
      }
      if (sidebarOverlay) {
        sidebarOverlay.classList.add('hidden');
      }
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openSidebarMobile);
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebarMobile);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebarMobile);
  }

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!state.role) {
        alert('Primero debés iniciar sesión.');
        return;
      }
      showScreen(btn.dataset.target);
      closeSidebarMobile();
    });
  });

  /* NOTIFICATION DROPDOWN CONTROLS */
  if (notificationBellBtn && notificationDropdown) {
    notificationBellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!notificationDropdown.contains(e.target) && !notificationBellBtn.contains(e.target)) {
        notificationDropdown.classList.add('hidden');
      }
    });
  }

  if (markReadBtn && notificationBadge) {
    markReadBtn.addEventListener('click', () => {
      notificationBadge.classList.add('hidden');
      markReadBtn.textContent = 'Leídas';
      markReadBtn.classList.add('text-slate-500');
      markReadBtn.classList.remove('text-sky-400');
    });
  }

  /* FORMS & DATA SUBMISSION */
  recepcionForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const proveedor = document.getElementById('proveedor').value.trim();
    const producto = document.getElementById('producto').value.trim();
    const peso = document.getElementById('peso').value;
    const ubicacion = document.getElementById('ubicacion').value.trim();
    const fechaRecepcion = document.getElementById('fechaRecepcion').value;
    const fechaVencimiento = document.getElementById('fechaVencimiento').value;
    const embalaje = document.getElementById('embalaje').value;
    const temperaturaCamion = Number(document.getElementById('temperaturaCamion').value);

    if (!validateVencimientoMin3Meses(fechaRecepcion, fechaVencimiento)) {
      recepcionMsg.textContent = 'Error: el vencimiento debe ser mínimo 3 meses luego de la recepción.';
      recepcionMsg.className = 'text-xs font-semibold self-center text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20';
      return;
    }

    if (temperaturaCamion > -18) {
      const confirmacion = confirm('La temperatura del camión es mayor a -18°C. ¿Deseás registrar igual con alerta?');
      if (!confirmacion) {
        return;
      }
    }

    state.stock.push({
      proveedor,
      producto,
      peso: Number(peso),
      recepcion: fechaRecepcion,
      vencimiento: fechaVencimiento,
      ubicacion,
      embalaje
    });

    state.recepciones += 1;
    renderStock();
    recepcionForm.reset();

    recepcionMsg.textContent = 'Recepción registrada correctamente.';
    recepcionMsg.className = 'text-xs font-semibold self-center text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20';
  });

  despachoForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cliente = document.getElementById('cliente').value.trim();
    const stockIndex = Number(productoDespacho.value);
    const pesoDespacho = Number(document.getElementById('pesoDespacho').value);
    const codigoLote = document.getElementById('codigoLote').value.trim();
    const camionRefrigerado = document.getElementById('camionRefrigerado').checked;

    if (!Number.isInteger(stockIndex) || !state.stock[stockIndex]) {
      despachoMsg.textContent = 'Seleccioná un producto válido.';
      despachoMsg.className = 'text-xs font-semibold self-center text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20';
      return;
    }

    const item = state.stock[stockIndex];

    if (pesoDespacho > item.peso) {
      despachoMsg.textContent = `Stock insuficiente. Disponible: ${item.peso} kg.`;
      despachoMsg.className = 'text-xs font-semibold self-center text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20';
      return;
    }

    if (!camionRefrigerado) {
      despachoMsg.textContent = 'Debés confirmar carga en camión refrigerado.';
      despachoMsg.className = 'text-xs font-semibold self-center text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20';
      return;
    }

    item.peso = Number((item.peso - pesoDespacho).toFixed(1));

    state.ultimoRemito = {
      numero: `R-${Date.now().toString().slice(-6)}`,
      fecha: new Date().toLocaleDateString('es-AR'),
      cliente,
      producto: item.producto,
      peso: `${pesoDespacho.toFixed(1)} kg`,
      lote: codigoLote,
      salida: 'Carga en camión refrigerado confirmada'
    };

    state.despachos += 1;
    updateRemitoView();
    renderStock();
    despachoForm.reset();

    despachoMsg.textContent = 'Despacho confirmado y remito generado.';
    despachoMsg.className = 'text-xs font-semibold self-center text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20';

    showScreen('screen-remito');
  });

  function updateRemitoView() {
    const remito = state.ultimoRemito;
    if (!remito) {
      return;
    }

    document.getElementById('remitoNumero').textContent = remito.numero;
    document.getElementById('remitoFecha').textContent = remito.fecha;
    document.getElementById('remitoCliente').textContent = remito.cliente;
    document.getElementById('remitoProducto').textContent = remito.producto;
    document.getElementById('remitoPeso').textContent = remito.peso;
    document.getElementById('remitoLote').textContent = remito.lote;
    document.getElementById('remitoSalida').textContent = remito.salida;
  }

  document.getElementById('printRemitoBtn').addEventListener('click', () => {
    if (!state.ultimoRemito) {
      alert('Todavía no hay remito generado.');
      return;
    }
    window.print();
  });

  document.getElementById('downloadRemitoBtn').addEventListener('click', () => {
    if (!state.ultimoRemito) {
      alert('Todavía no hay remito generado.');
      return;
    }

    const r = state.ultimoRemito;
    const content = [
      'REMITO DE SALIDA',
      `Numero: ${r.numero}`,
      `Fecha: ${r.fecha}`,
      `Cliente: ${r.cliente}`,
      `Producto: ${r.producto}`,
      `Peso: ${r.peso}`,
      `Codigo QR/Lote: ${r.lote}`,
      `Confirmacion: ${r.salida}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.numero}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  perdidasForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const causa = document.getElementById('causaPerdida').value;
    const fecha = document.getElementById('fechaPerdida').value;
    const detalle = document.getElementById('detallePerdida').value.trim() || '-';

    const tr = document.createElement('tr');
    tr.className = 'border-t border-slate-800/60 text-slate-300';
    tr.innerHTML = `
      <td class="p-3.5 text-slate-300">${fecha}</td>
      <td class="p-3.5 font-semibold text-rose-400">${causa}</td>
      <td class="p-3.5 text-slate-400">${detalle}</td>
    `;

    perdidasBody.prepend(tr);
    perdidasForm.reset();

    // Actualizar gráfico de mermas si existe
    updateMermasChart(causa);
  });

  /* INITIALIZE CHART.JS INTERACTIVE CHARTS */
  let mermasChartInstance = null;
  let mermasDataCounts = {
    'Pérdida de frío': 4,
    'Vencimiento': 2,
    'Daño de embalaje': 1,
    'Devolución cliente': 1
  };

  function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Chart Defaults
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Plus Jakarta Sans, sans-serif';

    // 1. Receptions Bar Chart
    const recCtx = document.getElementById('receptionsBarChart')?.getContext('2d');
    if (recCtx) {
      new Chart(recCtx, {
        type: 'bar',
        data: {
          labels: ['08h', '10h', '12h', '14h', '16h', '18h'],
          datasets: [{
            data: [6, 12, 18, 14, 8, 4],
            backgroundColor: '#38bdf8',
            borderRadius: 4,
            barThickness: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: { x: { display: false }, y: { display: false } }
        }
      });
    }

    // 2. Dispatch Trend Line Chart
    const dispCtx = document.getElementById('dispatchLineChart')?.getContext('2d');
    if (dispCtx) {
      const gradient = dispCtx.createLinearGradient(0, 0, 0, 40);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

      new Chart(dispCtx, {
        type: 'line',
        data: {
          labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
          datasets: [{
            data: [3, 7, 5, 11, 8, 14, 24],
            borderColor: '#38bdf8',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: { x: { display: false }, y: { display: false } }
        }
      });
    }

    // 3. Storage Doughnut Chart
    const storageCtx = document.getElementById('storageDoughnutChart')?.getContext('2d');
    if (storageCtx) {
      new Chart(storageCtx, {
        type: 'doughnut',
        data: {
          labels: ['Ocupado', 'Libre'],
          datasets: [{
            data: [78, 22],
            backgroundColor: ['#38bdf8', '#1e293b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '78%',
          plugins: { legend: { display: false }, tooltip: { enabled: true } }
        }
      });
    }

    // 4. Mermas Breakdown Doughnut Chart
    const mermasCtx = document.getElementById('mermasChart')?.getContext('2d');
    if (mermasCtx) {
      mermasChartInstance = new Chart(mermasCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(mermasDataCounts),
          datasets: [{
            data: Object.values(mermasDataCounts),
            backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { display: false }, tooltip: { enabled: true } }
        }
      });
    }
  }

  function updateMermasChart(causa) {
    if (mermasDataCounts[causa] !== undefined) {
      mermasDataCounts[causa] += 1;
    } else {
      mermasDataCounts[causa] = 1;
    }

    if (mermasChartInstance) {
      mermasChartInstance.data.datasets[0].data = Object.values(mermasDataCounts);
      mermasChartInstance.update();
    }
  }

  renderStock();
  initCharts();
});



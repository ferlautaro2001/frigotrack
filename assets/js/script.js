window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy: {
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
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const roleBadge = document.getElementById('currentRoleBadge');

  const recepcionForm = document.getElementById('recepcionForm');
  const recepcionMsg = document.getElementById('recepcionMsg');
  const despachoForm = document.getElementById('despachoForm');
  const despachoMsg = document.getElementById('despachoMsg');
  const perdidasForm = document.getElementById('perdidasForm');

  const stockTableBody = document.getElementById('stockTableBody');
  const productoDespacho = document.getElementById('productoDespacho');
  const perdidasBody = document.getElementById('perdidasBody');

  const kpiRecepciones = document.getElementById('kpiRecepciones');
  const kpiVencer = document.getElementById('kpiVencer');
  const kpiDespachos = document.getElementById('kpiDespachos');

  const state = {
    role: null,
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
      return '<span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-red-500 text-white">Alerta roja</span>';
    }

    if (months < 3) {
      return '<span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-amber-500 text-white">Atención</span>';
    }

    return '<span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-emerald-600 text-white">OK</span>';
  }

  function renderStock() {
    stockTableBody.innerHTML = '';

    state.stock.forEach((item) => {
      const tr = document.createElement('tr');
      const vencDate = new Date(item.vencimiento + 'T00:00:00');
      const isAlert = monthsBetween(new Date(), vencDate) < 2;

      tr.className = isAlert ? 'border-t border-steel-200 bg-red-50' : 'border-t border-steel-200';
      tr.innerHTML = `
        <td class="p-3 font-semibold">${item.producto}</td>
        <td class="p-3">${item.proveedor}</td>
        <td class="p-3">${Number(item.peso).toFixed(1)}</td>
        <td class="p-3">${item.vencimiento}</td>
        <td class="p-3">${item.ubicacion}</td>
        <td class="p-3">${getStatusBadge(vencDate)}</td>
      `;

      stockTableBody.appendChild(tr);
    });

    renderProductoDespachoOptions();
    updateKPIs();
  }

  function renderProductoDespachoOptions() {
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

    kpiRecepciones.textContent = String(state.recepciones);
    kpiVencer.textContent = String(vencerCount);
    kpiDespachos.textContent = String(state.despachos);
  }

  function validateVencimientoMin3Meses(fechaRecepcion, fechaVencimiento) {
    const rec = new Date(fechaRecepcion + 'T00:00:00');
    const ven = new Date(fechaVencimiento + 'T00:00:00');
    const minDate = new Date(rec);
    minDate.setMonth(minDate.getMonth() + 3);
    return ven >= minDate;
  }

  loginBtn.addEventListener('click', () => {
    const role = document.getElementById('roleSelect').value;
    const userName = document.getElementById('userName').value.trim();

    if (!role || !userName) {
      alert('Completá usuario y rol para ingresar.');
      return;
    }

    state.role = role;
    roleBadge.textContent = `${role} - ${userName}`;
    roleBadge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-navy-700 text-white';
    sidebar.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');

    showScreen('screen-recepcion');
  });

  logoutBtn.addEventListener('click', () => {
    state.role = null;
    roleBadge.textContent = 'Sin sesión';
    roleBadge.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-steel-200 text-steel-700';
    sidebar.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    showScreen('screen-login');
  });

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!state.role) {
        alert('Primero debés iniciar sesión.');
        return;
      }
      showScreen(btn.dataset.target);
    });
  });

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
      recepcionMsg.className = 'text-sm font-semibold self-center text-red-600';
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
    recepcionMsg.className = 'text-sm font-semibold self-center text-emerald-700';
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
      despachoMsg.className = 'text-sm font-semibold self-center text-red-600';
      return;
    }

    const item = state.stock[stockIndex];

    if (pesoDespacho > item.peso) {
      despachoMsg.textContent = `Stock insuficiente. Disponible: ${item.peso} kg.`;
      despachoMsg.className = 'text-sm font-semibold self-center text-red-600';
      return;
    }

    if (!camionRefrigerado) {
      despachoMsg.textContent = 'Debés confirmar carga en camión refrigerado.';
      despachoMsg.className = 'text-sm font-semibold self-center text-red-600';
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
    despachoMsg.className = 'text-sm font-semibold self-center text-emerald-700';

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
    tr.className = 'border-t border-steel-200';
    tr.innerHTML = `
      <td class="p-3">${fecha}</td>
      <td class="p-3 font-semibold text-red-700">${causa}</td>
      <td class="p-3">${detalle}</td>
    `;

    perdidasBody.prepend(tr);
    perdidasForm.reset();
  });

  renderStock();
  showScreen('screen-login');
});

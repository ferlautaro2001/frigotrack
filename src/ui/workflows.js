import { sistema, uiState, notificaciones } from '../state/store.js';
import { LoteCarne } from '../models/LoteCarne.js';
import { RegistroPerdida } from '../models/RegistroPerdida.js';
import { CAMPOS_PREVIEW_RECEPCION } from '../config/constants.js';
import { isoEnDias, fmtPeso, fmtTemp, fmtFecha, mapearSemaforoUI } from '../utils/formatters.js';
import { $, setMsg } from '../utils/dom.js';
import { renderTodoStock, actualizarBalanceDespachoPreview } from './renderers/stockTable.js';
import { renderNotificaciones } from './notifications.js';
import { renderRemitoSeleccionado, renderHistorialRemitos } from './renderers/remitoView.js';
import { renderMermas } from './renderers/mermasTable.js';
import { showScreen } from './navigation.js';

export function inicializarFechasRecepcion() {
  const inputRec = $('fechaRecepcion');
  const inputVen = $('fechaVencimiento');
  const inputFechaMerma = $('fechaPerdida');

  if (inputRec && !inputRec.value) inputRec.value = isoEnDias(0);
  if (inputVen && !inputVen.value) inputVen.value = isoEnDias(120);
  if (inputFechaMerma && !inputFechaMerma.value) inputFechaMerma.value = isoEnDias(0);
}

export function actualizarPreviewEtiquetaRecepcion() {
  const prov = $('proveedor')?.value.trim() || 'Frigorífico Sur';
  const prod = $('producto')?.value.trim() || 'Bife ancho sin hueso';
  const peso = Number($('peso')?.value) || 450.0;
  const ubic = $('ubicacion')?.value || 'Cámara 1 · A3';
  const fRec = $('fechaRecepcion')?.value || isoEnDias(0);
  const fVen = $('fechaVencimiento')?.value || isoEnDias(120);
  const temp = Number($('temperaturaCamion')?.value || -20);
  const proximoCodigo = `FT90${sistema.secuenciaLote}`;

  const loteTemp = new LoteCarne({
    codigoLote: proximoCodigo,
    proveedor: prov,
    producto: prod,
    pesoKg: peso,
    fechaRecepcion: fRec,
    fechaVencimiento: fVen,
    ubicacionCamara: ubic,
    tipoEmbalaje: 'Vacío termoencogible óptimo',
    temperaturaCamion: temp
  });

  const elCodeTop = $('previewLoteCode');
  const elProv = $('previewProveedor');
  const elTemp = $('previewTempBadge');
  const elProd = $('previewProducto');
  const elPeso = $('previewPeso');
  const elCodCell = $('previewCodigoCell');
  const elUbic = $('previewUbicacion');
  const elRec = $('previewRecepcion');
  const elVen = $('previewVencimiento');
  const elPill = $('previewStatusPill');

  if (elCodeTop) elCodeTop.textContent = proximoCodigo;
  if (elProv) elProv.textContent = `PROVEEDOR: ${prov.toUpperCase()}`;
  if (elTemp) {
    elTemp.textContent = `${fmtTemp(temp)} °C ${temp > -18 ? '· ALERTA' : '· OK'}`;
  }
  if (elProd) elProd.textContent = prod;
  if (elPeso) elPeso.textContent = fmtPeso(peso);
  if (elCodCell) elCodCell.textContent = proximoCodigo;
  if (elUbic) elUbic.textContent = ubic;
  if (elRec) elRec.textContent = fmtFecha(fRec);
  if (elVen) elVen.textContent = fmtFecha(fVen);

  if (elPill) {
    if (!loteTemp.validarVencimientoValido()) {
      elPill.textContent = 'Rechazado · Vencimiento < 3 meses (RF-03)';
      elPill.dataset.state = 'crit';
    } else if (temp > -18) {
      elPill.textContent = 'Requiere confirmación térmica (> −18 °C)';
      elPill.dataset.state = 'warn';
    } else {
      const sem = mapearSemaforoUI(loteTemp);
      elPill.textContent = `Estado ${sem.label} · Vida útil ${sem.diasTexto}`;
      elPill.dataset.state = sem.key;
    }
  }
}

function confirmarYGuardarRecepcion(datosLote, conAlertaTermica = false) {
  const recepcionMsg = $('recepcionMsg');
  const recepcionForm = $('recepcionForm');
  const notificationBadge = $('notificationBadge');
  const recepcionConfirm = $('recepcionConfirm');

  const nuevoLote = new LoteCarne({
    codigoLote: sistema.generarCodigoLote(),
    proveedor: datosLote.proveedor,
    producto: datosLote.producto,
    pesoKg: datosLote.peso,
    fechaRecepcion: datosLote.fechaRecepcion,
    fechaVencimiento: datosLote.fechaVencimiento,
    ubicacionCamara: datosLote.ubicacion,
    tipoEmbalaje: datosLote.embalaje,
    temperaturaCamion: datosLote.temperaturaCamion,
    alertaTermica: conAlertaTermica
  });

  const resultado = sistema.registrarRecepcion(nuevoLote);
  if (!resultado.ok) {
    setMsg(recepcionMsg, resultado.error, 'crit');
    return;
  }

  notificaciones.unshift({
    estado: conAlertaTermica ? 'warn' : 'ok',
    titulo: `Lote ${nuevoLote.codigoLote} ingresado (${fmtPeso(nuevoLote.pesoKg)})`,
    texto: `${nuevoLote.producto} · ${nuevoLote.ubicacionCamara} · Temp. camión ${fmtTemp(nuevoLote.temperaturaCamion)} °C`,
    tiempo: 'Ahora'
  });
  notificationBadge?.classList.remove('is-hidden');
  renderNotificaciones();
  renderTodoStock();

  recepcionForm?.reset();
  inicializarFechasRecepcion();
  ['checkPrecinto', 'checkLimpieza', 'checkTermometro'].forEach((id) => {
    const check = $(id);
    if (check) check.checked = true;
  });
  const campoVen = $('fechaVencimiento');
  if (campoVen) campoVen.dataset.invalid = 'false';
  recepcionConfirm?.classList.add('is-hidden');
  uiState.pendienteRecepcion = null;
  actualizarPreviewEtiquetaRecepcion();

  setMsg(
    recepcionMsg,
    `Lote ${nuevoLote.codigoLote} registrado en ${nuevoLote.ubicacionCamara}${conAlertaTermica ? ' con marca de advertencia térmica' : ''}`,
    'ok'
  );
}

export function setupWorkflows() {
  // --- Flujo de Recepción ---
  const recepcionForm = $('recepcionForm');
  const recepcionMsg = $('recepcionMsg');
  const recepcionConfirm = $('recepcionConfirm');
  const recepcionConfirmTexto = $('recepcionConfirmTexto');
  const recepcionConfirmOk = $('recepcionConfirmOk');
  const recepcionConfirmCancel = $('recepcionConfirmCancel');

  CAMPOS_PREVIEW_RECEPCION.forEach((id) => {
    const el = $(id);
    if (!el) return;
    const handler = () => {
      if (id === 'fechaVencimiento' || id === 'fechaRecepcion') {
        const fv = $('fechaVencimiento');
        if (fv) fv.dataset.invalid = 'false';
      }
      actualizarPreviewEtiquetaRecepcion();
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });

  recepcionForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (sistema.usuarioAutenticado && !sistema.usuarioAutenticado.tienePermiso('recepcion')) {
      setMsg(recepcionMsg, 'Acción no autorizada para el rol activo (RF-01)', 'crit');
      return;
    }

    const datos = {
      proveedor: $('proveedor')?.value.trim() || '',
      producto: $('producto')?.value.trim() || '',
      peso: Number($('peso')?.value),
      ubicacion: $('ubicacion')?.value || '',
      fechaRecepcion: $('fechaRecepcion')?.value || '',
      fechaVencimiento: $('fechaVencimiento')?.value || '',
      embalaje: $('embalaje')?.value || '',
      temperaturaCamion: Number($('temperaturaCamion')?.value)
    };

    const campoVen = $('fechaVencimiento');

    if (
      !datos.proveedor ||
      !datos.producto ||
      !datos.peso ||
      !datos.ubicacion ||
      !datos.fechaRecepcion ||
      !datos.fechaVencimiento ||
      !datos.embalaje ||
      $('temperaturaCamion')?.value === ''
    ) {
      setMsg(recepcionMsg, 'Completá todos los campos obligatorios del lote', 'crit');
      return;
    }

    const checksOk = ['checkPrecinto', 'checkLimpieza', 'checkTermometro'].every(
      (id) => $(id)?.checked
    );
    if (!checksOk) {
      setMsg(recepcionMsg, 'Verificá los tres controles sanitarios de muelle antes de descargar', 'crit');
      return;
    }

    const lotePrueba = new LoteCarne({
      codigoLote: 'TEMP',
      proveedor: datos.proveedor,
      producto: datos.producto,
      pesoKg: datos.peso,
      fechaRecepcion: datos.fechaRecepcion,
      fechaVencimiento: datos.fechaVencimiento,
      ubicacionCamara: datos.ubicacion,
      tipoEmbalaje: datos.embalaje,
      temperaturaCamion: datos.temperaturaCamion
    });

    if (!lotePrueba.validarVencimientoValido()) {
      if (campoVen) campoVen.dataset.invalid = 'true';
      setMsg(
        recepcionMsg,
        'Error: el vencimiento debe ser mínimo 3 meses luego de la recepción',
        'crit'
      );
      return;
    }

    if (campoVen) campoVen.dataset.invalid = 'false';

    if (datos.temperaturaCamion > -18) {
      uiState.pendienteRecepcion = datos;
      if (recepcionConfirmTexto) {
        recepcionConfirmTexto.textContent = `Temperatura superior a −18 °C (${fmtTemp(datos.temperaturaCamion)} °C). ¿Desea registrar con alerta?`;
      }
      recepcionConfirm?.classList.remove('is-hidden');
      setMsg(recepcionMsg, '');
      return;
    }

    confirmarYGuardarRecepcion(datos, false);
  });

  recepcionConfirmOk?.addEventListener('click', () => {
    if (uiState.pendienteRecepcion) {
      confirmarYGuardarRecepcion(uiState.pendienteRecepcion, true);
    }
  });

  recepcionConfirmCancel?.addEventListener('click', () => {
    recepcionConfirm?.classList.add('is-hidden');
    uiState.pendienteRecepcion = null;
    setMsg(recepcionMsg, 'Registro detenido por el operador', 'warn');
  });

  // --- Flujo de Despacho ---
  const productoDespacho = $('productoDespacho');
  const pesoDespachoInput = $('pesoDespacho');
  const codigoLoteInput = $('codigoLote');
  const despachoForm = $('despachoForm');
  const despachoMsg = $('despachoMsg');
  const remitoMsg = $('remitoMsg');
  const camionRefrigeradoInput = $('camionRefrigerado');
  const notificationBadge = $('notificationBadge');

  productoDespacho?.addEventListener('change', () => {
    if (codigoLoteInput) codigoLoteInput.dataset.auto = 'true';
    actualizarBalanceDespachoPreview();
  });

  pesoDespachoInput?.addEventListener('input', actualizarBalanceDespachoPreview);

  codigoLoteInput?.addEventListener('input', () => {
    codigoLoteInput.dataset.auto = 'false';
  });

  despachoForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const cliente = $('cliente')?.value.trim() || '';
    const loteIdx = productoDespacho.value === '' ? -1 : Number(productoDespacho.value);
    const peso = Number(pesoDespachoInput?.value);
    const codigoManual = codigoLoteInput?.value.trim() || '';
    const refrigerado = Boolean(camionRefrigeradoInput?.checked);

    if (!cliente) {
      setMsg(despachoMsg, 'Ingresá el nombre del cliente o establecimiento receptor', 'crit');
      return;
    }

    const resultado = sistema.procesarDespacho(
      cliente,
      loteIdx,
      peso,
      refrigerado,
      codigoManual
    );

    if (!resultado.ok) {
      setMsg(despachoMsg, resultado.error, 'crit');
      return;
    }

    uiState.remitoSeleccionado = resultado.remito;

    notificaciones.unshift({
      estado: 'ok',
      titulo: `Remito ${resultado.remito.numeroRemito} emitido`,
      texto: `${fmtPeso(resultado.remito.pesoDespachado)} de ${resultado.remito.producto} (${resultado.remito.codigoLote}) para ${resultado.remito.cliente}`,
      tiempo: 'Ahora'
    });
    notificationBadge?.classList.remove('is-hidden');

    renderNotificaciones();
    renderRemitoSeleccionado();
    renderHistorialRemitos();
    renderTodoStock();

    despachoForm.reset();
    if (codigoLoteInput) codigoLoteInput.dataset.auto = 'true';
    actualizarBalanceDespachoPreview();
    setMsg(despachoMsg, '');
    setMsg(
      remitoMsg,
      `Despacho confirmado. Comprobante ${resultado.remito.numeroRemito} generado y stock actualizado`,
      'ok'
    );

    showScreen('screen-remito', 'remito');
  });

  // --- Flujo de Registro de Mermas ---
  const perdidasForm = $('perdidasForm');
  const perdidasMsg = $('perdidasMsg');

  perdidasForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const causa = $('causaPerdida')?.value;
    const fecha = $('fechaPerdida')?.value;
    const detalle = $('detallePerdida')?.value.trim();

    if (!causa || !fecha || !detalle) {
      setMsg(perdidasMsg, 'Completá la causa, fecha y detalle técnico de la merma', 'crit');
      return;
    }

    sistema.registrarMerma(new RegistroPerdida({ fecha, causa, detalle }));
    renderMermas();
    perdidasForm.reset();
    inicializarFechasRecepcion();
    setMsg(perdidasMsg, 'Merma registrada e impactada en la distribución estadística', 'ok');
  });
}

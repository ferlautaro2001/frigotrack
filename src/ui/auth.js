import { sistema } from '../state/store.js';
import { showScreen, closeSidebarMobile } from './navigation.js';
import { $, $$, setMsg } from '../utils/dom.js';

export function aplicarPermisosDeRol() {
  const usuario = sistema.usuarioAutenticado;
  if (!usuario) return;

  const iniciales =
    usuario.nombre
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'OP';

  const userNameDisplay = $('userNameDisplay');
  const roleBadge = $('currentRoleBadge');
  const userAvatar = $('userAvatar');
  const quickRoleSelect = $('quickRoleSelect');

  if (userNameDisplay) userNameDisplay.textContent = usuario.nombre;
  if (roleBadge) roleBadge.textContent = usuario.rol;
  if (userAvatar) userAvatar.textContent = iniciales;
  if (quickRoleSelect) quickRoleSelect.value = usuario.rol;

  const puedeRecepcion = usuario.tienePermiso('recepcion');
  const puedeDespacho = usuario.tienePermiso('despacho');

  // Indicadores en navegación lateral
  const btnNavRec = document.querySelector('.nav-item[data-nav="recepcion"]');
  const btnNavDesp = document.querySelector('.nav-item[data-nav="despacho"]');
  const lockRec = $('navLockRecepcion');
  const lockDesp = $('navLockDespacho');

  if (btnNavRec) btnNavRec.dataset.restricted = String(!puedeRecepcion);
  if (lockRec) lockRec.classList.toggle('is-hidden', puedeRecepcion);

  if (btnNavDesp) btnNavDesp.dataset.restricted = String(!puedeDespacho);
  if (lockDesp) lockDesp.classList.toggle('is-hidden', puedeDespacho);

  // Bloqueo / habilitación de formulario de Recepción
  const recNotice = $('recepcionRoleNotice');
  const recRoleName = $('recepcionRoleName');
  const submitRecBtn = $('submitRecepcionBtn');
  if (recNotice) recNotice.classList.toggle('is-hidden', puedeRecepcion);
  if (recRoleName) recRoleName.textContent = usuario.rol;
  if (submitRecBtn) submitRecBtn.disabled = !puedeRecepcion;

  // Bloqueo / habilitación de formulario de Despacho
  const despNotice = $('despachoRoleNotice');
  const despRoleName = $('despachoRoleName');
  const submitDespBtn = $('submitDespachoBtn');
  if (despNotice) despNotice.classList.toggle('is-hidden', puedeDespacho);
  if (despRoleName) despRoleName.textContent = usuario.rol;
  if (submitDespBtn) submitDespBtn.disabled = !puedeDespacho;

  // Acción primaria contextual en el encabezado del Panel
  const heroBtn = $('primaryHeroActionBtn');
  const heroLabel = $('primaryHeroActionLabel');
  if (heroBtn && heroLabel) {
    if (usuario.rol === 'Logística') {
      heroBtn.dataset.goto = 'screen-despacho';
      heroLabel.textContent = 'Gestionar despacho';
    } else {
      heroBtn.dataset.goto = 'screen-recepcion';
      heroLabel.textContent = 'Registrar recepción';
    }
  }
}

export function setupAuth() {
  const roleSelect = $('roleSelect');
  const userNameInput = $('userName');
  const loginBtn = $('loginBtn');
  const logoutBtn = $('logoutBtn');
  const loginMsg = $('loginMsg');
  const authScreen = $('authScreen');
  const appLayout = $('appLayout');
  const quickRoleSelect = $('quickRoleSelect');

  const presetButtons = $$('[data-preset-role]');
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetButtons.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      if (roleSelect) roleSelect.value = btn.dataset.presetRole;
      if (userNameInput) userNameInput.value = btn.dataset.presetUser || 'operador01';
      setMsg(loginMsg, '');
    });
  });

  roleSelect?.addEventListener('change', () => {
    presetButtons.forEach((b) => {
      b.classList.toggle('is-selected', b.dataset.presetRole === roleSelect.value);
    });
  });

  loginBtn?.addEventListener('click', () => {
    const rol = roleSelect ? roleSelect.value : '';
    const nombre = userNameInput ? userNameInput.value.trim() : '';

    if (!sistema.iniciarSesion(nombre, rol)) {
      setMsg(loginMsg, 'Seleccioná un rol operativo e ingresá tu usuario.', 'crit');
      return;
    }

    aplicarPermisosDeRol();
    setMsg(loginMsg, '');
    authScreen?.classList.add('is-hidden');
    appLayout?.classList.remove('is-hidden');

    showScreen('screen-login', 'dashboard');
  });

  quickRoleSelect?.addEventListener('change', () => {
    if (!sistema.usuarioAutenticado) return;
    sistema.usuarioAutenticado.rol = quickRoleSelect.value;
    aplicarPermisosDeRol();
  });

  logoutBtn?.addEventListener('click', () => {
    sistema.cerrarSesion();
    appLayout?.classList.add('is-hidden');
    authScreen?.classList.remove('is-hidden');
    closeSidebarMobile();
    setMsg(loginMsg, '');
  });
}

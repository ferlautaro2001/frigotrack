import { uiState } from '../state/store.js';
import { NAV_POR_PANTALLA } from '../config/constants.js';
import { renderTablaCola, renderTablaStockCompleta } from './renderers/stockTable.js';
import { $, $$ } from '../utils/dom.js';

export function closeSidebarMobile() {
  if (window.innerWidth >= 1024) return;
  const sidebar = $('sidebar');
  const sidebarOverlay = $('sidebarOverlay');
  sidebar?.classList.remove('is-open');
  sidebarOverlay?.classList.add('is-hidden');
}

export function openSidebarMobile() {
  const sidebar = $('sidebar');
  const sidebarOverlay = $('sidebarOverlay');
  sidebar?.classList.add('is-open');
  sidebarOverlay?.classList.remove('is-hidden');
}

export function aplicarFiltroStockUI(filtro) {
  uiState.filtroStockActual = filtro;
  $$('[data-stock-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.stockFilter === filtro);
  });
  renderTablaCola();
  renderTablaStockCompleta();
}

export function showScreen(screenId, navKey) {
  const claveNav = navKey || NAV_POR_PANTALLA[screenId] || 'dashboard';

  if (claveNav === 'alertas') {
    aplicarFiltroStockUI('crit');
  } else if (claveNav === 'stock' && uiState.filtroStockActual === 'crit') {
    aplicarFiltroStockUI('all');
  }

  $$('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenId);
  });

  $$('.nav-item[data-nav]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === claveNav);
  });

  closeSidebarMobile();
  window.scrollTo({ top: 0 });
}

export function setupNavigation() {
  $$('.nav-item[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.target, btn.dataset.nav);
    });
  });

  $$('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const destino = btn.dataset.goto;
      showScreen(destino, NAV_POR_PANTALLA[destino]);
    });
  });

  $$('[data-stock-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      aplicarFiltroStockUI(btn.dataset.stockFilter);
    });
  });

  const mobileMenuBtn = $('mobileMenuBtn');
  const closeSidebarBtn = $('closeSidebarBtn');
  const sidebarOverlay = $('sidebarOverlay');

  mobileMenuBtn?.addEventListener('click', openSidebarMobile);
  closeSidebarBtn?.addEventListener('click', closeSidebarMobile);
  sidebarOverlay?.addEventListener('click', closeSidebarMobile);

  const globalSearchInput = $('globalSearchInput');
  const notificationDropdown = $('notificationDropdown');

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (event) => {
      uiState.textoBusqueda = event.target.value.trim();
      renderTablaCola();
      renderTablaStockCompleta();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (
      event.key === '/' &&
      document.activeElement &&
      !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      globalSearchInput?.focus();
    }
    if (event.key === 'Escape') {
      notificationDropdown?.classList.add('is-hidden');
      closeSidebarMobile();
    }
  });
}

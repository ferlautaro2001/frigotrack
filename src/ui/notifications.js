import { notificaciones } from '../state/store.js';
import { $ } from '../utils/dom.js';

export function renderNotificaciones() {
  const container = $('notifListContainer');
  const badge = $('notificationBadge');

  if (container) {
    container.innerHTML = notificaciones
      .map(
        (n) => `
        <div class="notif-item">
          <span class="notif-rail" data-state="${n.estado}"></span>
          <div>
            <p class="notif-title">${n.titulo}</p>
            <p class="notif-text">${n.texto}</p>
            <span class="notif-time">${n.tiempo}</span>
          </div>
        </div>
      `
      )
      .join('');
  }

  if (badge) {
    badge.textContent = String(notificaciones.length);
  }
}

export function setupNotifications() {
  const notificationBellBtn = $('notificationBellBtn');
  const notificationDropdown = $('notificationDropdown');
  const notificationBadge = $('notificationBadge');
  const markReadBtn = $('markReadBtn');

  if (notificationBellBtn && notificationDropdown) {
    notificationBellBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      notificationDropdown.classList.toggle('is-hidden');
    });

    document.addEventListener('click', (event) => {
      if (
        !notificationDropdown.contains(event.target) &&
        !notificationBellBtn.contains(event.target)
      ) {
        notificationDropdown.classList.add('is-hidden');
      }
    });
  }

  markReadBtn?.addEventListener('click', () => {
    notificationBadge?.classList.add('is-hidden');
    markReadBtn.textContent = 'Sin pendientes';
  });
}

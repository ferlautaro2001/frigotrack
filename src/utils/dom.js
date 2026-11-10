/**
 * Asigna texto y estado semántico (data-state) a un elemento de feedback
 */
export function setMsg(element, texto, estado = '') {
  if (!element) return;
  element.textContent = texto;
  element.dataset.state = estado;
}

/**
 * Helper para búsqueda rápida de elemento por ID
 */
export const $ = (id) => document.getElementById(id);

/**
 * Helper para querySelectorAll convertido a Array
 */
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

import { PERMISOS_POR_ROL } from '../config/constants.js';

/**
 * Clase Usuario (RF-01 / UML 7.1)
 */
export class Usuario {
  constructor(nombre, rol) {
    this.nombre = nombre;
    this.rol = rol;
  }

  tienePermiso(accion) {
    const permitidos = PERMISOS_POR_ROL[this.rol] || [];
    return permitidos.includes(accion);
  }
}

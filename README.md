# Frigo Track - Gestión Logística para Cadena de Frío ❄️

## 🏫 Contexto Académico

**Universidad Tecnológica Nacional - Facultad Regional Avellaneda**  
**Cátedra:** Metodología de Sistemas I

## 🚀 1. Introducción y contexto

Este trabajo propone la digitalización del proceso logístico de un frigorífico dedicado a la distribución de carne congelada. El problema principal detectado es la dependencia de registros manuales para recepción, control de stock y despacho, lo cual genera riesgo operativo en la trazabilidad de lotes, cumplimiento de cadena de frío y control de vencimientos.

Se desarrolló un prototipo funcional que modela el flujo completo, desde el ingreso de mercadería hasta la emisión del remito y registro de pérdidas.

## 🧩 2. Definición del sistema (Enfoque TGS)

| Elemento | Definición para el caso Frigo Track |
| --- | --- |
| Teleología (objetivo) | Garantizar trazabilidad logística y control de cadena de frío en recepción, almacenamiento y despacho. |
| Límite del sistema | Desde la recepción de mercadería hasta la salida en camión refrigerado y emisión de remito. |
| Entradas | Proveedor, producto, peso, fechas, estado de embalaje, temperatura de camión, datos de cliente. |
| Procesamiento | Validaciones de fechas y temperaturas, cálculo de alertas por vencimiento, descuento de stock, emisión de remito. |
| Salidas | Stock actualizado, alertas visuales, remito de salida, registro de pérdidas/devoluciones. |
| Feedback | KPIs del dashboard, gráficos vectoriales dinámicos y alertas operativas para toma de decisiones diarias. |

## 🎯 3. Objetivos SMART y KPI

| Objetivo SMART | KPI | Meta |
| --- | --- | --- |
| Reducir errores de recepción por carga manual incompleta. | Porcentaje de recepciones con checklist completo. | 95% en 8 semanas. |
| Disminuir riesgo de vencimiento no detectado en cámara. | Cantidad de lotes sin alerta previa a vencer. | 0 lotes sin alerta en 2 meses. |
| Mejorar trazabilidad de despacho por lote. | Porcentaje de despachos con código QR/Lote registrado. | 100% en 6 semanas. |
| Reducir tiempos administrativos de salida. | Tiempo promedio para emitir remito. | Menos de 3 minutos por despacho. |

## 💡 4. Aplicación de Design Thinking

- Empatizar: identificar puntos de dolor (doble carga, pérdida de datos y omisiones de control).
- Definir: problema central (falta de trazabilidad y control preventivo en procesos críticos de frío).
- Idear: propuesta de solución modular (recepción, stock, despacho, remito y mermas).
- Prototipar: desarrollo de un front funcional con navegación, visualización con gráficos dinámicos y reglas de negocio mínimas.
- Evaluar: verificación con casos de uso operativos y escenarios de error frecuentes.

## 📋 5. Requerimientos del sistema

### 5.1 Requerimientos funcionales

| ID | Requerimiento | Pantalla vinculada |
| --- | --- | --- |
| RF-01 | El sistema debe permitir acceso por rol (Administrador, Recepción, Logística) mediante pantalla aislada de login y perfil activo en header. | Login/Dashboard |
| RF-02 | Registrar recepción con datos de proveedor, producto, peso y fechas. | Recepción |
| RF-03 | Validar que el vencimiento sea como mínimo 3 meses posterior a la recepción. | Recepción |
| RF-04 | Mostrar inventario con alertas visuales para lotes con vencimiento menor a 2 meses y gráficos de ocupación de cámaras. | Stock/Inventario |
| RF-05 | Permitir despacho con cliente, producto, peso, lote y confirmación de camión refrigerado. | Venta y Despacho |
| RF-06 | Generar remito imprimible con datos de salida y confirmación de carga. | Remito |
| RF-07 | Registrar pérdidas/devoluciones por causa y fecha con actualización de gráfico de mermas en tiempo real. | Pérdidas/Devoluciones |
| RF-08 | Mostrar panel interactivo de notificaciones logísticas con contador numérico y función de marcar como leídas. | Header Bar |

### 5.2 Requerimientos no funcionales

- RNF-01: interfaz responsive adaptable a escritorio, tablet y celular con menú lateral deslizable (drawer).
- RNF-02: navegación clara y operable en menos de 3 toques por tarea principal.
- RNF-03: diseño visual consistente, minimalista y profesional en tema oscuro (Dark Theme).
- RNF-04: tiempo de respuesta inmediato en operaciones de carga local y renderizado de gráficos.
- RNF-05: mensajes de validación explícitos ante datos críticos incompletos o incorrectos.

## 🧪 6. Casos de uso principales

| Caso de uso | Actor principal | Resultado esperado |
| --- | --- | --- |
| CU-01: Iniciar sesión por rol | Operario / Supervisor | Acceso a la aplicación y habilitación de módulos según perfil. |
| CU-02: Registrar recepción | Recepción | Lote incorporado a stock con validaciones de seguridad. |
| CU-03: Consultar stock y alertas | Logística | Visualización de lotes críticos, ocupación de cámara y termómetros. |
| CU-04: Confirmar despacho | Logística | Descuento de stock y trazabilidad de salida por lote. |
| CU-05: Emitir remito | Logística / Administración | Documento de salida listo para imprimir o descargar. |
| CU-06: Registrar merma o devolución | Administrador | Historial de incidentes y actualización de gráfico dinámico de causas. |
| CU-07: Consultar notificaciones logísticas | Operario / Supervisor | Panel emergente con alertas operativas y limpieza de contador. |

## ⚙️ 7. Diseño técnico del prototipo

- Frontend: estructura en HTML con estilos y lógica separados en archivos propios.
- Control de Acceso: pantalla de autenticación aislada (`#authScreen`) que bloquea el tablero hasta validar sesión.
- Navegación: secciones ocultas/visibles mediante clases (`.screen` y `.active`) y menú deslizable en dispositivos móviles (`#sidebarOverlay`).
- Visualización de Datos: gráficos vectoriales dinámicos con **Chart.js** (barras, líneas de tendencia y donas).
- Datos: estructuras en memoria para simular el ciclo de operación.
- Alertas: reglas de vencimiento y validación de temperatura para prevenir errores.

## 🛠️ Tecnologías utilizadas

### Frontend

<p align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="html5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="css3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="javascript"/>
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" alt="chartjs"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="tailwindcss"/>
  <img src="https://img.shields.io/badge/Font_Awesome-528DD7?style=flat-square&logo=fontawesome&logoColor=white" alt="fontawesome"/>
</p>

* JavaScript vanilla (ES6+, sin frameworks ni build step)
* [Chart.js](https://www.chartjs.org/) (v4.x) vía CDN para gráficos vectoriales interactivos (barras, líneas de tendencia y donas)
* [Tailwind CSS](https://tailwindcss.com/) (v3.x) vía CDN para utilidades de maquetación y diseño responsive
* [Font Awesome](https://fontawesome.com/) (v6.5.2) vía CDN para iconografía de navegación y acciones
* Google Fonts (`Plus Jakarta Sans`) para jerarquía tipográfica moderna en modo tema oscuro (*Dark Theme*)



## ✅ 8. Conclusiones

Frigo Track permite modelar de forma clara una problemática real de logística en frío y demuestra aplicación concreta de contenidos vistos durante el cuatrimestre: 4P del desarrollo, enfoque sistémico, Design Thinking, ingeniería de requerimientos, casos de uso y planificación por etapas.


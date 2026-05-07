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
| Feedback | KPIs del dashboard y alertas operativas para toma de decisiones diarias. |

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
- Prototipar: desarrollo de un front funcional con navegación y reglas de negocio mínimas.
- Evaluar: verificación con casos de uso operativos y escenarios de error frecuentes.

## 📋 5. Requerimientos del sistema

### 5.1 Requerimientos funcionales

| ID | Requerimiento | Pantalla vinculada |
| --- | --- | --- |
| RF-01 | El sistema debe permitir acceso por rol (Administrador, Recepción, Logística). | Login/Dashboard |
| RF-02 | Registrar recepción con datos de proveedor, producto, peso y fechas. | Recepción |
| RF-03 | Validar que el vencimiento sea como mínimo 3 meses posterior a la recepción. | Recepción |
| RF-04 | Mostrar inventario con alertas visuales para lotes con vencimiento menor a 2 meses. | Stock/Inventario |
| RF-05 | Permitir despacho con cliente, producto, peso, lote y confirmación de camión refrigerado. | Venta y Despacho |
| RF-06 | Generar remito imprimible con datos de salida y confirmación de carga. | Remito |
| RF-07 | Registrar pérdidas/devoluciones por causa y fecha. | Pérdidas/Devoluciones |

### 5.2 Requerimientos no funcionales

- RNF-01: interfaz responsive para uso en escritorio y celular.
- RNF-02: navegación clara y operable en menos de 3 toques por tarea principal.
- RNF-03: diseño visual consistente y profesional para uso operativo diario.
- RNF-04: tiempo de respuesta inmediato en operaciones de carga local.
- RNF-05: mensajes de validación explícitos ante datos críticos incompletos o incorrectos.

## 🧪 6. Casos de uso principales

| Caso de uso | Actor principal | Resultado esperado |
| --- | --- | --- |
| CU-01: Iniciar sesión por rol | Operario / Supervisor | Habilitación de módulos según perfil. |
| CU-02: Registrar recepción | Recepción | Lote incorporado a stock con validaciones de seguridad. |
| CU-03: Consultar stock y alertas | Logística | Visualización de lotes críticos y ubicación en cámara. |
| CU-04: Confirmar despacho | Logística | Descuento de stock y trazabilidad de salida por lote. |
| CU-05: Emitir remito | Logística / Administración | Documento de salida listo para imprimir o descargar. |
| CU-06: Registrar merma o devolución | Administrador | Historial de incidentes para control y mejora. |

## ⚙️ 7. Diseño técnico del prototipo

- Frontend: estructura en HTML con estilos y lógica separados en archivos propios.
- Navegación: secciones ocultas/visibles mediante clases (`.screen` y `.active`).
- Datos: estructuras en memoria para simular el ciclo de operación.
- Alertas: reglas de vencimiento y validación de temperatura para prevenir errores.

## 🛠️ Tecnologías utilizadas (con versiones)

| Tecnología | Versión | Uso en el proyecto |
| --- | --- | --- |
| HTML | HTML5 | Estructura de la interfaz y pantallas del flujo logístico. |
| CSS | CSS3 | Estilos base y reglas personalizadas (`styles.css`). |
| JavaScript | ECMAScript 2020+ | Lógica del prototipo, validaciones, estado en memoria y render dinámico. |
| Tailwind CSS (CDN) | 3.x | Utilidades de diseño responsive y sistema visual principal. |
| Font Awesome | 6.5.2 | Iconografía de navegación y acciones del sistema. |


## ✅ 8. Conclusiones

Frigo Track permite modelar de forma clara una problemática real de logística en frío y demuestra aplicación concreta de contenidos vistos durante el cuatrimestre: 4P del desarrollo, enfoque sistémico, Design Thinking, ingeniería de requerimientos, casos de uso y planificación por etapas.

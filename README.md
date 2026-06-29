Prototipo BugTracker

Resumen
- Prototipo pequeño de React cargado desde CDN + Babel standalone para pruebas rápidas.
- Archivos:
  - bugtracker.html — Contenedor HTML que carga scripts CDN y `app.jsx`.
  - style.css         — Estilos básicos e importación de fuente.
  - app.jsx           — Aplicación React (JSX) con login, panel, reporte, detalle de bugs, filtros y resumen.

Cómo funciona
- La aplicación usa Babel en tiempo de ejecución para transpilar `app.jsx` en el navegador; no requiere paso de compilación.
- Usuarios de prueba y bugs iniciales están definidos dentro de `app.jsx`.
- El login requiere un correo `@estudio.cl` y la contraseña `password123` (las credenciales de prueba aparecen en la página de login).
- La navegación cambia según el rol: tester, desarrollador o líder.

Ejecutar localmente
1. Asegúrese de tener conexión a internet (los scripts CDN se cargan desde unpkg).
2. Abra `bugtracker.html` en un navegador moderno (Chrome/Edge/Firefox).

Pruebas rápidas
- Inicie sesión como `maria.garcia@estudio.cl` con contraseña `password123`.
- Reporte un bug nuevo (pruebe versión inválida como `2.1` y luego `v2.1.1`).
- En el panel, haga clic en un bug para ver detalles y use las acciones de asignar, resolver o verificar.
- Visite "Filtros" y pruebe el botón de exportar CSV.

Limitaciones conocidas
- Usa Babel standalone, no es adecuado para producción.
- Algunas funciones (filtros avanzados, historial completo) son parciales o simuladas.
- Las notificaciones funcionan mediante snackbars simulados.

Presentación pública para profesor
- Abra `bugtracker.html` en un navegador moderno.
- También puede usar Live Server en VS Code para ver la app en una URL local como `http://127.0.0.1:5500/bugtracker.html`.
- En esta carpeta hay un archivo de instrucciones con el enlace local: `PUBLIC_LINK.txt`.

Cómo está construido
- `bugtracker.html` es la página de inicio y carga todas las dependencias.
- `style.css` aplica estilos globales y la fuente `Inter`.
- `app.jsx` aloja toda la lógica del prototipo React, incluyendo estado, navegación y componentes.
- Los datos de prueba (usuarios y bugs) se almacenan en `app.jsx`.
- La navegación es por rol: tester, desarrollador y líder, con vistas distintas para cada uno.
- Las funciones de reporte, detalle de bug, filtros y resumen se implementan como componentes separados.

Cómo explicar el proceso de creación
- Se separó el código en tres archivos: HTML, CSS y React/JSX.
- Se corrigió el orden de carga de dependencias para evitar errores en tiempo de ejecución.
- Se eliminó texto basura y duplicaciones que había en versiones anteriores.
- Se diseñaron flujos para iniciar sesión, reportar un bug, ver detalles, tomar/resolver/verificar bugs y exportar filtros.
- Se agregó una página de resumen con gráficos usando Recharts para mostrar métricas.

Próximos pasos sugeridos
- Migrar a un bundler (Vite/Create React App) para mejor rendimiento.
- Implementar almacenamiento persistente (localStorage o backend).
- Añadir pruebas automatizadas y linting.

Contacto
- Si lo desea, puedo convertir esto en un proyecto React con npm scripts y paso de compilación.

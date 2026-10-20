# Plan — Catastro de Equipos

## Enfoque de implementación

Conservar el proyecto fuente del ZIP y su dominio de catastro. La arquitectura de producción será un monolito desplegable: una sola aplicación Spring Boot servirá los archivos compilados de React/Vite desde `classpath:/static` y expondrá la API bajo `/api`; PostgreSQL seguirá siendo el almacén persistente. Docker Compose tendrá un contenedor de aplicación y el contenedor PostgreSQL existente. La compilación multi-stage unirá frontend y backend en una sola imagen.

El acceso será un login normal con usuario o correo y contraseña, sin OAuth ni configuración de autenticación de Manus. El backend guardará usuarios en PostgreSQL con ID autogenerado, nombre, usuario, correo, código de empleado, rol y hash BCrypt de la contraseña; nunca persistirá la contraseña en texto plano. Si la base está vacía, una pantalla de configuración inicial crea una sola cuenta administradora y se desactiva tras guardarla; en Compose también se puede preaprovisionar esa cuenta mediante variables de entorno antes del primer arranque. Las sesiones serán aleatorias, revocables y persistidas con el usuario; el navegador solo conservará un token HttpOnly y el perfil consultará los datos por el ID interno. Las vistas del catastro quedarán protegidas por el backend y el botón del perfil permitirá cerrar sesión. En Preview HTTPS la cookie será `SameSite=None; Secure`; Docker Compose local HTTP usará explícitamente `APP_COOKIE_SECURE=false`, sin inferirlo de `NODE_ENV` ni de `req.secure`.

Se corregirá el flujo de datos del frontend centralizando las solicitudes HTTP, incluyendo credenciales de mismo origen, errores legibles y respuestas 401; se evitará que búsquedas rápidas dejen respuestas antiguas sobreescribiendo resultados nuevos. Las operaciones de equipos existentes, filtros, formularios, edición y baja lógica permanecerán disponibles detrás del login. En Preview, Vite servirá el frontend en el puerto 3000 y hará proxy de `/api` al backend Spring; la imagen de producción no tendrá proxy ni servidor frontend separado.

## Estructura del proyecto

- `frontend/src/`: aplicación React/TypeScript; cliente API, contexto de autenticación, protección de rutas, catastro, login, perfil y estilos.
- `frontend/public/manus-routes.json`: declaración de rutas de páginas para Preview.
- `backend/src/main/java/cl/mantenimiento/catastro/`: dominio/controladores/servicios/repositorios Spring Boot; se añaden usuarios, sesiones, login normal y perfil.
- `backend/src/main/resources/static/`: destino de compilación del frontend en la imagen monolítica.
- `backend/src/main/resources/application.yml`: PostgreSQL de Compose/producción, configuración de cookies y bootstrap del administrador por entorno.
- `Dockerfile` y `docker-compose.yml`: build multi-stage y ejecución local del monolito junto a PostgreSQL persistente.

## Diseño

Se reutiliza la interfaz existente, sin introducir una nueva dirección visual.

- **Movimiento:** tablero operativo industrial contemporáneo.
- **Principios:** legibilidad en uso diario, jerarquía sobria, estados de activos claros y acciones coherentes entre lista y detalle.
- **Color:** conserva azul petróleo y verde azulado para comunicar estabilidad y continuidad operativa; estados de criticidad mantienen sus colores semánticos.
- **Layout:** navegación lateral fija en escritorio, cabecera compacta y superficies de trabajo; en móvil, navegación y contenido se reacomodan en una sola columna.
- **Elementos distintivos:** marca industrial geométrica, tarjetas y chips discretos, iconografía lineal consistente.
- **Interacción:** formularios con validación y errores junto a la acción, carga/guardado visible, foco accesible y retorno claro tras login o logout.
- **Animación:** transiciones breves y discretas; solo indicadores de carga giratorios, sin movimiento decorativo.
- **Tipografía:** DM Sans para interfaz y Manrope para títulos y cifras, como en el producto existente.
- **Esencia de marca:** herramienta confiable para mantener el catastro de activos industriales; personalidad clara, precisa y práctica.
- **Voz:** textos concretos de operación; ejemplos: “Accede con tu cuenta para revisar los activos.” y “Sesión cerrada; puedes volver a ingresar.”
- **Marca/wordmark:** conservar “MaintControl” y el símbolo de fábrica actual.
- **Color de marca:** verde petróleo `#087f73`, sobre azul oscuro `#102d35`.

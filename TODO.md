# TODO — Catastro de Equipos

## Monolito desplegable y continuidad del catastro
- [ ] “Arquitectura monolítica que integre el frontend y el backend en una sola aplicación desplegable.”
- [ ] Mantener el sistema existente de catastro de equipos, su API y la persistencia PostgreSQL, ahora servido como una sola aplicación Spring Boot junto al servicio de base de datos.

## Lógica e integración frontend/backend
- [ ] “Corrección de la lógica y comunicación entre las capas de frontend y backend para asegurar el funcionamiento coherente del sistema.”
- [ ] Mantener búsqueda, filtros, consulta, creación, edición y baja lógica de equipos, con estados de carga, errores recuperables y mensajes coherentes con las respuestas del backend.

## Inicio de sesión y protección de acceso
- [ ] “Pantalla de inicio de sesión con validación de credenciales y manejo de errores de acceso.”
- [ ] “Sesión autenticada persistente y protección de las vistas que requieren acceso.”
- [ ] El login normal debe autenticar con usuario o correo y contraseña, guardar usuarios y sesiones en PostgreSQL y proteger contraseñas con un hash BCrypt, nunca texto plano.
- [ ] Cada usuario debe tener un ID autogenerado por la base; cuando no exista ninguna cuenta, el primer uso debe permitir crear una única cuenta administradora y desactivar esa configuración tras guardarla. Compose puede preaprovisionar el administrador mediante variables de entorno seguras.

## Perfil del usuario autenticado
- [ ] “Botón de perfil visible y funcional para navegar al perfil del usuario autenticado.”
- [ ] “Vista de perfil con la información correspondiente del empleado o usuario.”
- [ ] Mostrar la información guardada del usuario autenticado, incluido su ID interno, nombre, correo, código de empleado si está configurado y rol; no completar con datos personales inventados.

## Cierre de sesión
- [ ] “Botón para cerrar sesión desde el perfil, con finalización segura de la sesión y retorno al acceso.”

## Conservación visual
- [ ] “Conservación del sistema existente de catastro de equipos y de sus funcionalidades actuales.”
- [ ] “Mantenimiento del estilo visual actual en las pantallas existentes y en las nuevas vistas de acceso y perfil.”

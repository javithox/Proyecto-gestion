# Catastro de Equipos — MaintControl

Aplicación monolítica para mantenimiento industrial: una aplicación Spring Boot sirve la interfaz React/Vite y la API REST; PostgreSQL conserva equipos, cuentas y sesiones.

## Inicio rápido

1. Copia `.env.example` como `.env`.
2. Define contraseñas únicas para `POSTGRES_PASSWORD` y `APP_ADMIN_PASSWORD` (mínimo 12 caracteres y máximo 72 bytes UTF-8). Completa, si corresponde, el nombre, correo y código de empleado del administrador inicial.
3. Ejecuta `docker compose up --build -d`.
4. Abre `http://localhost:3000` e inicia sesión con `APP_ADMIN_USERNAME` (por defecto `admin`) y la contraseña configurada.

En el primer arranque, la aplicación guarda el administrador en PostgreSQL y la base le asigna un ID. La contraseña se guarda como hash BCrypt, nunca en texto plano. La cuenta de bootstrap se crea solo si la base aún no tiene usuarios; cambiar las variables después no modifica la contraseña guardada.

Cuando no existe ninguna cuenta, `/login` muestra una pantalla de configuración inicial para crear una única cuenta administradora. Tras guardar el primer usuario, esa pantalla queda desactivada y se usa el login normal. No hay registro abierto para cuentas adicionales. En una instalación pública, preaprovisiona al administrador mediante variables de entorno y no expongas la aplicación sin credenciales iniciales.

## Login, sesión y perfil

El acceso es normal con nombre de usuario o correo y contraseña. Las sesiones aleatorias se almacenan en PostgreSQL; el navegador solo conserva una cookie HttpOnly con expiración y logout revocable. La API del catastro exige una sesión válida. El avatar lleva a `/perfil`, que muestra el ID interno, nombre, usuario, correo, código de empleado si está definido, rol y fecha de creación. Desde allí se puede cerrar sesión.

Para agregar otras cuentas después del administrador inicial se necesita una pantalla administrativa, que no forma parte de este alcance; no habilité registro público. Las contraseñas nunca deben insertarse en la base como texto plano.

En Compose local por HTTP se usa explícitamente `APP_COOKIE_SECURE=false`. Para un entorno público HTTPS define `APP_COOKIE_SECURE=true`, que emite la cookie como `SameSite=None; Secure`. Usa TLS y mantén `.env` fuera del control de versiones.

## Arquitectura y ejecución

- `frontend/`: React, TypeScript y Vite; durante Preview, Vite sirve el frontend en el puerto 3000 y hace proxy relativo de `/api` hacia Spring Boot.
- `backend/`: API, autenticación, perfiles, sesiones y persistencia JPA.
- `Dockerfile`: build multi-stage que compila React e incorpora `dist` en `backend/src/main/resources/static`; la imagen final contiene un solo servidor Spring Boot en el puerto 3000.
- `docker-compose.yml`: un contenedor de aplicación y PostgreSQL. El volumen `catastro_postgres_data` conserva la información.

El acceso local a PostgreSQL queda expuesto en `localhost:5432`. No ejecutes `docker compose down -v` si quieres conservar los datos.

## API

Autenticación: `GET /api/auth/setup-status`, `POST /api/auth/setup` (solo mientras no exista ninguna cuenta), `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`. El perfil devuelto incluye el ID generado por la base. El catastro permanece bajo `/api/equipos`:

- `GET /api/equipos` — lista; acepta `q`, `estado` y `criticidad`.
- `GET /api/equipos/{id}` — detalle.
- `POST /api/equipos` — crea.
- `PUT /api/equipos/{id}` — actualiza.
- `PATCH /api/equipos/{id}/estado` — cambia estado.
- `DELETE /api/equipos/{id}` — baja lógica (marca como `BAJA`, no borra físicamente).

Valores admitidos: `criticidad` = `ALTA`, `MEDIA`, `BAJA`; `estado` = `OPERATIVO`, `DETENIDO`, `EN_MANTENIMIENTO`, `BAJA`.

## Desarrollo sin Docker

Usa Java 21 y Maven desde la raíz: `SERVER_PORT=8080 mvn -f backend/pom.xml spring-boot:run`. Si se definen `APP_ADMIN_USERNAME` y `APP_ADMIN_PASSWORD`, se crea una cuenta de bootstrap al iniciar; si no hay usuarios, `/login` permite configurar la cuenta inicial de desarrollo. Sin `SPRING_DATASOURCE_URL`, Spring usa H2 en memoria; para persistencia configura PostgreSQL. En otra terminal ejecuta `npm install && npm run dev` desde `frontend` (Vite escucha el puerto 3000 y envía `/api` a Spring en el puerto 8080).

# Usuario de la aplicacion

## Usuario administrador

# nombre usuario= admin
# contraseña = admin123456789.

es para que se opere la plataforma

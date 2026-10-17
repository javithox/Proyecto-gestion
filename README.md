# Catastro de Equipos — Mantenimiento Industrial

MVP inicial para el Caso 9: Mantenimiento industrial. Incluye frontend React + TypeScript, API REST con Java 21 y Spring Boot, PostgreSQL y Docker Compose.

## Requisitos
- Docker Engine y Docker Compose plugin
- (Opcional para desarrollo fuera de Docker) Node.js 22+ y Java 21

## Inicio rápido con Docker

```bash
cp .env.example .env
# Edita .env y define una contraseña segura
docker compose up --build -d
docker compose ps
```

URLs:
- Frontend: http://localhost:3000
- API: http://localhost:8080/api/equipos
- PostgreSQL: localhost:5432 (para herramientas locales)

El frontend usa Nginx como proxy para enviar `/api` al backend dentro de Docker. No necesita conectarse directamente a PostgreSQL.

## Persistencia
Los datos se guardan en el volumen nombrado `catastro_postgres_data`. `docker compose down` no elimina el volumen. **No ejecutes `docker compose down -v` si quieres conservar los datos.**

## API
- `GET /api/equipos` — lista todos; acepta `q`, `estado` y `criticidad`
- `GET /api/equipos/{id}` — detalle
- `POST /api/equipos` — crea
- `PUT /api/equipos/{id}` — actualiza
- `PATCH /api/equipos/{id}/estado` — cambia estado
- `DELETE /api/equipos/{id}` — baja lógica (marca como `BAJA`, no borra físicamente)

Ejemplo de creación:

```json
{
  "codigo": "EQ-001",
  "nombre": "Cinta transportadora principal",
  "descripcion": "Transporte de producto en línea principal",
  "marca": "Ejemplo",
  "modelo": "CT-100",
  "numeroSerie": "SN-001",
  "fechaAdquisicion": "2024-03-15",
  "criticidad": "ALTA",
  "estado": "OPERATIVO",
  "ubicacion": "Línea principal - Envasado",
  "condicionesOperacion": "Operación continua; limpieza según procedimiento"
}
```

Valores admitidos:
- `criticidad`: `ALTA`, `MEDIA`, `BAJA`
- `estado`: `OPERATIVO`, `DETENIDO`, `EN_MANTENIMIENTO`, `BAJA`

## Desarrollo local sin Docker (opcional)
1. Inicia PostgreSQL y crea una base `catastro_db`, usuario `catastro_user`.
2. En `backend`, define las variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` y ejecuta `./mvnw spring-boot:run` si agregas Maven Wrapper, o `mvn spring-boot:run`.
3. En `frontend`, ejecuta `npm install` y `npm run dev`. En modo Vite el proxy `/api` apunta a `http://localhost:8080`.

## Alcance inicial
Incluye datos básicos de equipos y baja lógica. Los módulos de componentes, ubicaciones normalizadas, historial auditable, usuarios/roles, planes preventivos, órdenes de trabajo y reportes se dejan para iteraciones siguientes. No incluye mantenimiento predictivo con IA.

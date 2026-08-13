# OpsWatch — Load testing (Locust)

Genera carga contra el backend con un flujo CRUD completo: health, list, create, get by id, update y delete.

## Requisitos

El backend debe estar accesible en el host que configures como target.

### Opción A — App con Docker Compose (raíz del proyecto)

```bash
docker compose up -d
```

Backend en http://localhost:3001

### Opción B — Backend en Kubernetes

```bash
kubectl port-forward -n opswatch svc/backend-api 3001:3001
```

### Opción C — Ingress (mejor para probar HPA)

Agrega `127.0.0.1 opswatch.local` en hosts y usa:

```bash
TARGET_HOST=http://opswatch.local docker compose up -d
```

## Levantar Locust

Desde esta carpeta:

```bash
docker compose up -d
```

Abre la UI: **http://localhost:8089**

| Campo | Valor sugerido (demo HPA) |
|-------|---------------------------|
| Number of users | 50–200 |
| Spawn rate | 10–20 |
| Host | ya configurado vía `TARGET_HOST` |

## Flujo simulado

| Task | Peso | Endpoint |
|------|------|----------|
| List services | 5 | `GET /api/services` |
| Create service | 3 | `POST /api/services` |
| Get by id | 2 | `GET /api/services/:id` |
| Update | 2 | `PUT /api/services/:id` |
| Delete | 1 | `DELETE /api/services/:id` |
| Health | 2 | `GET /health` |

Los servicios creados usan el prefijo `locust-` en el nombre. Los deletes priorizan IDs creados en la misma sesión o servicios con ese prefijo.

## Cambiar target

```bash
# Ingress Kubernetes
TARGET_HOST=http://opswatch.local docker compose up -d

# Backend en otro puerto
TARGET_HOST=http://host.docker.internal:3001 docker compose up -d
```

## Ver resultados

1. **Locust UI** — RPS, fallos, latencia del test.
2. **Grafana** (`../monitoring/`) — requests/s y latencia p95 del backend.
3. **Kubernetes HPA** — `kubectl get hpa -n opswatch -w` y `kubectl get pods -l app=backend-api -n opswatch -w`.

## Detener

```bash
docker compose down
```

## Limpiar datos de prueba en la DB

Si quedaron registros `locust-*`:

```bash
docker exec -it opswatch-db-coderhouse psql -U postgres -d opswatch \
  -c "DELETE FROM services WHERE name LIKE 'locust-%';"
```

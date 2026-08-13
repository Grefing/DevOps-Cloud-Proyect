# OpsWatch — Monitoring (Docker Compose)

Prometheus + Grafana fuera del cluster Kubernetes. Scrapea el backend en `localhost:3001` (app en Docker Compose o `kubectl port-forward`).

## Requisitos

El backend debe exponer `/metrics` en el host:

```bash
# Opción A: stack de la app
docker compose up -d

# Opción B: backend en Kubernetes
kubectl port-forward -n opswatch svc/backend-api 3001:3001
```

Verifica: http://localhost:3001/metrics

## Levantar monitoring

Desde esta carpeta:

```bash
docker compose up -d
```

| Servicio   | URL |
|------------|-----|
| Prometheus | http://localhost:9090 |
| Grafana    | http://localhost:3030 (`admin` / `admin`) |

Dashboard: **Dashboards → OpsWatch → OpsWatch API**

Los paneles de pods (kube-state-metrics) solo tienen datos si scrapeas un cluster con esas métricas; los de HTTP requests/latencia funcionan con el backend local.

## Actualizar dashboard

1. Edita `grafana/dashboards/json/opswatch.json`
2. Reinicia Grafana: `docker compose restart grafana`

## Detener

```bash
docker compose down
```

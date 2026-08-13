# OpsWatch

Panel de salud de servicios: Next.js + Express + PostgreSQL. Stack DevOps con Docker, Kubernetes (HPA), CI/CD, Prometheus/Grafana y Locust.

## Requisitos

- Docker Desktop (con Kubernetes activado para `k8s/`)
- `kubectl`
- Git

## Estructura

```
├── backend/          API Express + /metrics
├── frontend/         Next.js UI
├── docker-compose.yml    App (postgres + backend + frontend)
├── k8s/                Manifests Kubernetes
├── monitoring/         Prometheus + Grafana (compose aparte)
└── load-testing/       Locust (compose aparte)
```

## Opción 1 — Solo app local (Docker Compose)

Desde la raíz:

```bash
docker compose up -d
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/health |
| Métricas | http://localhost:3001/metrics |

Bajar:

```bash
docker compose down
```

---

## Opción 2 — Stack completo (recomendado para demo)

Usa **Kubernetes** para la app y compose separados para monitoreo y carga.

### 1. Desplegar en Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods -n opswatch
```

Imágenes: `tomaswajnerman/opswatch-backend:latest`, `tomaswajnerman/opswatch-frontend:latest`

### 2. Metrics Server (obligatorio para HPA)

Sin esto el HPA muestra `cpu: <unknown>/70%` y no escala.

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"},
  {"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-preferred-address-types=InternalIP"}
]'
```

Verificar:

```bash
kubectl top pods -n opswatch
kubectl get hpa -n opswatch
```

### 3. Acceso a la app

**Port-forward** (dejar la terminal abierta):

```bash
kubectl port-forward -n opswatch svc/frontend 3000:3000
kubectl port-forward -n opswatch svc/backend-api 3001:3001
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/health |

**Ingress** (opcional): agregar `127.0.0.1 opswatch.local` en `C:\Windows\System32\drivers\etc\hosts` y usar http://opswatch.local. Ver `k8s/README.md`.

### 4. Monitoreo (Prometheus + Grafana)

Requiere backend en `localhost:3001` (port-forward o compose).

```bash
cd monitoring
docker compose up -d
```

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Grafana | http://localhost:3030 | `admin` / `admin` |
| Prometheus | http://localhost:9090 | — |

Dashboard: **Dashboards → OpsWatch → OpsWatch API**

### 5. Load testing (Locust)

**No uses** el `docker compose` de la raíz y port-forward al mismo tiempo en el puerto 3001.

Con K8s + port-forward del backend:

```bash
# Terminal 1 (dejar abierta)
kubectl port-forward -n opswatch svc/backend-api 3001:3001

# Terminal 2
cd load-testing
docker compose up -d
```

UI: http://localhost:8089

| Campo | Valor |
|-------|-------|
| Host | `http://host.docker.internal:3001` |
| Users | 150–500 (subir si hace falta) |
| Ramp up | 15–50 |

### 6. Ver escalado (HPA)

```bash
kubectl get hpa -n opswatch -w
kubectl get pods -l app=backend-api -n opswatch -w
```

HPA: min **2**, max **20** réplicas, CPU target **70%**.

---

## URLs rápidas

| Qué | URL |
|-----|-----|
| Frontend | http://localhost:3000 |
| API health | http://localhost:3001/health |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3030 |
| Locust | http://localhost:8089 |

---

## Desarrollo local (sin Docker)

```bash
# Postgres (o usar solo el servicio postgres del compose)
cd backend && npm ci && npm test && npm run dev

cd frontend && npm ci && npm run dev
```

Backend: http://localhost:3001 — Frontend: http://localhost:3000

---

## CI/CD

Push a `main` → GitHub Actions ejecuta tests, build y push a Docker Hub. Ver `.github/workflows/ci-cd.yml`.

---

## Apagar todo

```bash
cd load-testing && docker compose down
cd monitoring && docker compose down
docker compose down                    # si usaste compose de la raíz
kubectl delete namespace opswatch     # si usaste K8s
```

---

## Más detalle

- Kubernetes e Ingress: `k8s/README.md`
- Grafana / Prometheus: `monitoring/README.md`
- Locust CRUD: `load-testing/README.md`
- Terraform / AWS (conceptual): `terraform/README.md`

## Problemas frecuentes

| Problema | Solución |
|----------|----------|
| HPA `cpu: <unknown>` | Instalar metrics-server (paso 2) |
| Locust 100% failures | Port-forward activo + Host `http://host.docker.internal:3001` |
| Conflicto en 3001 | Bajar compose de la raíz o no usar port-forward a la vez |
| `opswatch.local` no resuelve | Entrada en `hosts` o usar port-forward |

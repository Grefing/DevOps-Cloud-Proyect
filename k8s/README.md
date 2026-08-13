# OpsWatch — Kubernetes manifests

Manifests numerados para aplicar en orden. Namespace: `opswatch`.

## Estructura

```
k8s/
├── 01-namespace.yaml … 12-ingress.yaml    # postgres, backend, frontend, HPA
```

Monitoring (Prometheus/Grafana) está en `../monitoring/` con su propio Docker Compose.

## Requisitos

- Cluster Kubernetes (Docker Desktop con Kubernetes activado, o minikube)
- `kubectl` configurado
- Ingress NGINX (opcional, para `opswatch.local`)
- **metrics-server** (necesario para HPA por CPU)

### Docker Desktop

1. Settings → Kubernetes → Enable Kubernetes
2. Settings → Kubernetes → Enable Ingress (o instala ingress-nginx)

### Verificar metrics-server

```bash
kubectl get apiservice v1beta1.metrics.k8s.io
```

## Despliegue

```bash
kubectl apply -f k8s/
```

## Verificar pods

```bash
kubectl get all -n opswatch
kubectl get hpa -n opswatch
```

## Acceso rápido (port-forward)

```bash
kubectl port-forward -n opswatch svc/backend-api 3001:3001
kubectl port-forward -n opswatch svc/frontend 3000:3000
```

| Servicio   | URL |
|------------|-----|
| Frontend   | http://localhost:3000 |
| API health | http://localhost:3001/health |

Para Grafana/Prometheus, ver `monitoring/README.md`.

## Ingress (opswatch.local)

1. Agregar a `C:\Windows\System32\drivers\etc\hosts` (como admin):

   ```
   127.0.0.1 opswatch.local
   ```

2. Aplicar ingress y obtener el puerto del controller:

   ```bash
   kubectl get ingress -n opswatch
   kubectl get svc -n ingress-nginx
   ```

3. Rutas:
   - `http://opswatch.local` → frontend
   - `http://opswatch.local/health` → backend
   - `http://opswatch.local/api/services` → backend

## Probar HPA (escalado)

```bash
kubectl get hpa -n opswatch -w
```

Generar carga dentro del cluster:

```bash
kubectl run -n opswatch load-loop --restart=Never --image=busybox -- \
  sh -c "while true; do wget -q -O- http://backend-api:3001/api/services; done"
```

Observa réplicas (2 → hasta 20) con `kubectl get pods -l app=backend-api -n opswatch`.

## Manifests

| Archivo | Recurso |
|---------|---------|
| 01-namespace | Namespace `opswatch` |
| 02-secret | Credenciales DB + `DATABASE_URL` |
| 03-configmap | `PORT`, `NODE_ENV` |
| 04-postgres-service-headless | Service headless |
| 05-postgres-service-clusterip | Service ClusterIP postgres |
| 06-postgres-statefulset | PostgreSQL 16 + PVC |
| 07-backend-deployment | API Express (2 réplicas) |
| 08-backend-service | ClusterIP :3001 |
| 09-frontend-deployment | Next.js |
| 10-frontend-service | ClusterIP :3000 |
| 11-backend-hpa | HPA CPU 70%, min 2 max 20 |
| 12-ingress | Ingress nginx |

## Imágenes Docker Hub

- `tomaswajnerman/opswatch-backend:latest`
- `tomaswajnerman/opswatch-frontend:latest`

## Eliminar todo

```bash
kubectl delete namespace opswatch
```

# SecureBankito

Sistema bancario con microservicios que implementa los modelos de seguridad **Biba** y **Bell-LaPadula**.

## Ejecución

```bash
docker compose up -d --build
```

## Ejecucion con Kubernetes

Requisitos:

- Docker Desktop
- Minikube
- kubectl
- PowerShell

Desde la raiz del proyecto, ejecutar:

```powershell
.\k8s\deploy.ps1
```

URLs locales para Postman:

```text
http://127.0.0.1:3001/health
http://127.0.0.1:3002/health
http://127.0.0.1:3003/health
```

Si solo se quieren abrir los port-forwards sin redeploy:

```powershell
.\k8s\port-forward-all.ps1
```

Verificar los pods:

```powershell
kubectl get pods -n securebankito
```

Verificar los servicios:

```powershell
kubectl get svc -n securebankito
```

El despliegue ejecuta las semillas automaticamente. Para ejecutarlas manualmente:

```powershell
kubectl exec -n securebankito deployment/iam-service -- node db/seed.js
kubectl exec -n securebankito deployment/corebancario-service -- node db/seed.js
kubectl exec -n securebankito deployment/inversiones-service -- node db/seed.js
```

### Seeds

```bash
docker compose exec iam-service node db/seed.js
docker compose exec corebancario-service node db/seed.js
docker compose exec inversiones-service node db/seed.js
```

---

## Endpoints

### IAM Service - `http://localhost:3001`

| Método | Endpoint         | Auth | Descripción                  |
|--------|-----------------|------|------------------------------|
| POST   | `/auth/register` | No   | Registrar usuario            |
| POST   | `/auth/login`    | No   | Login - retorna JWT          |
| GET    | `/auth/validate` | Si   | Validar token                |
| GET    | `/health`        | No   | Health check                 |

### Core Bancario Service - `http://localhost:3002`

Modelo **Biba** - No Write Up.

| Método | Endpoint                           | Auth | Descripción                  |
|--------|-----------------------------------|------|------------------------------|
| POST   | `/cuentas`                         | Si   | Crear cuenta                 |
| GET    | `/cuentas`                         | Si   | Listar cuentas               |
| GET    | `/cuentas/:cuentaId`               | Si   | Obtener cuenta               |
| GET    | `/cuentas/:cuentaId/transacciones` | Si   | Historial de transacciones   |
| POST   | `/transferencias`                  | Si   | Ejecutar transferencia       |
| GET    | `/health`                          | No   | Health check                 |

### Inversiones Service - `http://localhost:3003`

Modelo **Bell-LaPadula** - No Read Up.

| Método | Endpoint           | Auth | Descripción          |
|--------|--------------------|------|----------------------|
| GET    | `/activos-vip`     | Si   | Listar activos VIP   |
| GET    | `/activos-vip/:id` | Si   | Obtener activo       |
| POST   | `/activos-vip`     | Si   | Crear activo VIP     |
| GET    | `/health`          | No   | Health check         |

---

## Usuarios seed

| Usuario          | Contraseña | Clearance | Integrity |
|------------------|-----------|-----------|-----------|
| `usuario_oro`    | `pass123` | ORO       | 3         |
| `usuario_plata`  | `pass123` | PLATA     | 2         |
| `usuario_bronce` | `pass123` | BRONCE    | 1         |

---

## Ejemplos de pruebas

### Login

```http
POST http://127.0.0.1:3001/auth/login
```

```json
{
  "username": "usuario_oro",
  "password": "pass123"
}
```

La respuesta incluye un `token`. Usarlo como Bearer Token en los endpoints protegidos.

### Listar cuentas

```http
GET http://127.0.0.1:3002/cuentas
Authorization: Bearer <TOKEN>
```

Copiar el `cuentaId` real de la respuesta para usarlo en transferencias.

### Transferencia

```http
POST http://127.0.0.1:3002/transferencias
Authorization: Bearer <TOKEN>
```

```json
{
  "cuentaDestinoId": "<CUENTA_ID>",
  "monto": 500,
  "moneda": "USD"
}
```

### Listar activos VIP

```http
GET http://127.0.0.1:3003/activos-vip
Authorization: Bearer <TOKEN>
```

Con `usuario_plata` debe responder `403 BLP_VIOLATION`. Con `usuario_oro` debe responder `200`.

---

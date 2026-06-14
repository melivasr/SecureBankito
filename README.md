# SecureBankito

Sistema bancario con microservicios que implementa los modelos de seguridad **Biba** y **Bell-LaPadula**.

## Ejecución

```bash
docker compose up -d --build
```

### Seeds

```bash
docker compose exec iam-service node db/seed.js
docker compose exec corebancario-service node db/seed.js
docker compose exec inversiones-service node db/seed.js
```

---

## Endpoints

### IAM Service - `http://localhost:4001`

| Método | Endpoint         | Auth | Descripción                  |
|--------|-----------------|------|------------------------------|
| POST   | `/auth/register` | No   | Registrar usuario            |
| POST   | `/auth/login`    | No   | Login - retorna JWT          |
| GET    | `/auth/validate` | Si   | Validar token                |
| GET    | `/health`        | No   | Health check                 |

### Core Bancario Service - `http://localhost:4002`

Modelo **Biba** - No Write Up.

| Método | Endpoint                           | Auth | Descripción                  |
|--------|-----------------------------------|------|------------------------------|
| POST   | `/cuentas`                         | Si   | Crear cuenta                 |
| GET    | `/cuentas`                         | Si   | Listar cuentas               |
| GET    | `/cuentas/:cuentaId`               | Si   | Obtener cuenta               |
| GET    | `/cuentas/:cuentaId/transacciones` | Si   | Historial de transacciones   |
| POST   | `/transferencias`                  | Si   | Ejecutar transferencia       |
| GET    | `/health`                          | No   | Health check                 |

### Inversiones Service - `http://localhost:4003`

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

## PoC

```bash
bash scripts/poc-test.sh
```

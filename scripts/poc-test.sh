#!/usr/bin/env bash
# Script de prueba PoC — 3 escenarios obligatorios de SecureBankito
# Requisito: servicios corriendo (docker compose up -d)

set -e

IAM="http://localhost:3001"
CORE="http://localhost:3002"
INV="http://localhost:3003"

echo "============================================================"
echo " SecureBankito — PoC Test"
echo " IAM: $IAM | Core: $CORE | Inversiones: $INV"
echo "============================================================"

# ── AUTENTICACION ─────────────────────────────────────────────
echo ""
echo ">>> Obteniendo tokens..."

TOKEN_ORO=$(curl -s -X POST "$IAM/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario_oro","password":"pass123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "  [OK] Token ORO"

TOKEN_PLATA=$(curl -s -X POST "$IAM/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario_plata","password":"pass123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "  [OK] Token PLATA"

TOKEN_BRONCE=$(curl -s -X POST "$IAM/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario_bronce","password":"pass123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "  [OK] Token BRONCE"

# ── Cuenta VIP Oro (requiredIntegrityLevel=3) ─────────────────
echo ""
echo ">>> Buscando Cuenta VIP Oro..."
CUENTAS=$(curl -s "$CORE/cuentas" -H "Authorization: Bearer $TOKEN_ORO")
ID_CUENTA_ORO=$(echo "$CUENTAS" | python3 -c "
import sys, json
cuentas = json.load(sys.stdin)
cuenta = next((c for c in cuentas if c['requiredIntegrityLevel'] == 3), None)
print(cuenta['cuentaId'] if cuenta else 'NOT_FOUND')
")
ID_CUENTA_BRONCE=$(echo "$CUENTAS" | python3 -c "
import sys, json
cuentas = json.load(sys.stdin)
cuenta = next((c for c in cuentas if c['requiredIntegrityLevel'] == 1), None)
print(cuenta['cuentaId'] if cuenta else 'NOT_FOUND')
")
echo "  ID Cuenta VIP Oro: $ID_CUENTA_ORO"
echo "  ID Cuenta Bronce: $ID_CUENTA_BRONCE"

echo ""
echo "============================================================"
echo " ESCENARIO A — Biba No Write Up"
echo " Bronce (integrity=1) escribe en Cuenta VIP Oro (required=3)"
echo " Esperado: 403 BIBA_VIOLATION"
echo "============================================================"
curl -s -X POST "$CORE/transferencias" \
  -H "Authorization: Bearer $TOKEN_BRONCE" \
  -H "Content-Type: application/json" \
  -d "{\"cuentaDestinoId\":\"$ID_CUENTA_ORO\",\"monto\":500,\"moneda\":\"USD\"}" \
  | python3 -m json.tool
echo ""

echo "--- Bronce intenta debitar Cuenta VIP Oro hacia Cuenta Bronce ---"
curl -s -X POST "$CORE/transferencias" \
  -H "Authorization: Bearer $TOKEN_BRONCE" \
  -H "Content-Type: application/json" \
  -d "{\"cuentaOrigenId\":\"$ID_CUENTA_ORO\",\"cuentaDestinoId\":\"$ID_CUENTA_BRONCE\",\"monto\":100,\"moneda\":\"USD\"}" \
  | python3 -m json.tool
echo ""

echo "============================================================"
echo " ESCENARIO B — BLP No Read Up"
echo " Plata (clearance=PLATA) lee activos clasificados ORO"
echo " Esperado: 403 BLP_VIOLATION"
echo "============================================================"
curl -s "$INV/activos-vip" \
  -H "Authorization: Bearer $TOKEN_PLATA" \
  | python3 -m json.tool
echo ""

echo "============================================================"
echo " ESCENARIO C — Acceso exitoso"
echo " Oro (clearance=ORO, integrity=3) opera sin restricciones"
echo " Esperado: 200 en transferencia + 200 en activos"
echo "============================================================"
echo "--- Transferencia a Cuenta VIP Oro ---"
curl -s -X POST "$CORE/transferencias" \
  -H "Authorization: Bearer $TOKEN_ORO" \
  -H "Content-Type: application/json" \
  -d "{\"cuentaDestinoId\":\"$ID_CUENTA_ORO\",\"monto\":500,\"moneda\":\"USD\"}" \
  | python3 -m json.tool
echo ""
echo "--- Activos VIP ---"
curl -s "$INV/activos-vip" \
  -H "Authorization: Bearer $TOKEN_ORO" \
  | python3 -m json.tool

echo ""
echo "============================================================"
echo " PoC completado."
echo "============================================================"

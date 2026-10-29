#!/usr/bin/env bash
# ============================================================
#  Atlas QA - ejecucion de la bateria de pruebas (ISY1102)
#  Evidencia por caso + suite Postman (Newman) + carga.
#  Uso:   bash pruebas.sh
# ============================================================
cd "$(dirname "$0")"
B=https://localhost:8443
hr(){ echo "============================================================"; }

TOKEN=$(curl -sk -X POST $B/api/auth/login -H "Content-Type: application/json" \
  -d '{"usuario":"admin.pyme01","password":"Atlas.Admin2026"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])" 2>/dev/null)

hr; echo "  CP-01  ·  Autenticacion y JWT"; hr
echo "\$ POST /api/auth/login  (admin.pyme01)"
curl -sk -X POST $B/api/auth/login -H "Content-Type: application/json" \
  -d '{"usuario":"admin.pyme01","password":"Atlas.Admin2026"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('HTTP 200');print('token:',d['token'][:46]+'...');print('refreshToken:',d['refreshToken'][:28]+'...');print('usuario:',json.dumps(d['usuario']))"
echo "Payload JWT:"
echo "$TOKEN" | cut -d. -f2 | python3 -c "import sys,base64,json;s=sys.stdin.read().strip();s+='='*(-len(s)%4);p=json.loads(base64.urlsafe_b64decode(s));print(json.dumps(p));print('vigencia =',p['exp']-p['iat'],'s (<=900)  ·  sin contrasena ni hash')"

echo ""; hr; echo "  CP-03  ·  IDOR - leer cliente 5530 de la empresa 102"; hr
echo "\$ GET /api/clientes/5530   (token admin empresa 101)"
curl -sk -H "Authorization: Bearer $TOKEN" $B/api/clientes/5530 | python3 -m json.tool

echo ""; hr; echo "  CP-06  ·  XSS almacenado + ausencia de CSP"; hr
echo "\$ POST /api/clientes  descripcion=<script>alert('xss')</script>"
curl -sk -X POST $B/api/clientes -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"razonSocial":"Cliente XSS","rut":"76.123.456-0","descripcion":"<script>alert(1)</script>"}' | python3 -m json.tool
echo "Cabeceras de seguridad:"
curl -sk -D - -o /dev/null -H "Authorization: Bearer $TOKEN" $B/api/clientes \
  | grep -iE "content-security-policy|x-content-type-options" || echo "   (ninguna cabecera de seguridad presente)"

echo ""; hr; echo "  SUITE DE API  ·  Newman (CP-01 a CP-06)"; hr
sudo docker run --rm --network atlas-qa_default -v "$PWD/pruebas:/t" node:20-alpine \
  sh -c "npx --yes newman run /t/atlas-endpoints-criticos.postman_collection.json \
         -e /t/newman-env-container.json --insecure --reporter-cli-no-banner"

echo ""; hr; echo "  CP-07  ·  Carga y resiliencia"; hr
echo ">> docker stats ANTES:"
sudo docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ">> 200 peticiones GET concurrentes a /api/clientes ..."
T=$(mktemp)
for i in $(seq 1 200); do
  curl -sk -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN" $B/api/clientes >> "$T" &
done
wait
sort "$T" | uniq -c | awk '{print "   "$1" x HTTP "$2}'; rm -f "$T"
echo ">> docker stats DESPUES:"
sudo docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ">> Contenedores:"; sudo docker ps --format "table {{.Names}}\t{{.Status}}"

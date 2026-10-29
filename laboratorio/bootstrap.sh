#!/usr/bin/env bash
# ============================================================
#  Atlas QA - laboratorio local (ISY1102)
#  Instala Docker (si falta), levanta la API + PostgreSQL.
#  Uso:   bash bootstrap.sh
# ============================================================
set -e
cd "$(dirname "$0")"
echo "=================================================="
echo "  ATLAS QA  -  preparacion del laboratorio"
echo "=================================================="

# 1) Herramientas minimas
if ! command -v curl >/dev/null 2>&1; then
  echo "[*] Instalando curl..."
  sudo apt-get update -y && sudo apt-get install -y curl
fi

# 2) Docker
if ! command -v docker >/dev/null 2>&1; then
  echo "[*] Instalando Docker Engine (requiere tu contrasena de sudo)..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER" || true
fi

# 3) Daemon de Docker
if ! sudo docker info >/dev/null 2>&1; then
  echo "[*] Iniciando el servicio Docker..."
  sudo service docker start 2>/dev/null || (sudo dockerd >/tmp/dockerd.log 2>&1 & sleep 6)
fi

# 4) Certificado TLS autofirmado del laboratorio (si falta)
if [ ! -f api/certs/server.crt ]; then
  echo "[*] Generando certificado TLS autofirmado para el laboratorio..."
  mkdir -p api/certs
  openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
    -keyout api/certs/server.key -out api/certs/server.crt \
    -subj "/C=CL/O=Atlas QA Lab/CN=localhost" >/dev/null 2>&1
fi

# 5) Levantar la replica
echo "[*] Construyendo y levantando los contenedores..."
sudo docker compose up -d --build

echo "[*] Esperando a que la API quede disponible..."
sleep 6
echo ""
echo "=================================================="
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "=================================================="
echo ""
echo "  Entorno listo.  Ahora ejecuta:   bash pruebas.sh"
echo ""

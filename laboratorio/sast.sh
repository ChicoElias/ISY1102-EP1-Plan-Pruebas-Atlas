#!/usr/bin/env bash
# sast.sh — Análisis estático del ambiente QA de Atlas (IL 2.3)
# Complementa a pruebas.sh (verificación dinámica) con análisis estático
# de código (Semgrep) y de dependencias (npm audit / SCA).
set -euo pipefail
cd "$(dirname "$0")/api"

echo "================================================================"
echo "  ANÁLISIS DE DEPENDENCIAS (SCA)  —  npm audit"
echo "================================================================"
[ -f package-lock.json ] || npm install --package-lock-only >/dev/null 2>&1
npm audit || true

echo ""
echo "================================================================"
echo "  ANÁLISIS ESTÁTICO DE CÓDIGO (SAST)  —  Semgrep"
echo "================================================================"
if ! command -v semgrep >/dev/null 2>&1; then
  echo "[*] Instalando Semgrep..."
  pip install semgrep --quiet 2>/dev/null || pipx install semgrep 2>/dev/null || true
fi
semgrep --config "p/javascript" --config "p/owasp-top-ten" \
        --config "p/nodejs" --config "p/secrets" server.js

echo ""
echo "================================================================"
echo "  NOTA METODOLÓGICA"
echo "  El SAST detecta patrones peligrosos (sinks, secretos, deps)."
echo "  No detecta el IDOR: un control de autorización AUSENTE no es"
echo "  un patrón sintáctico, sino un fallo de lógica de negocio que"
echo "  solo aflora con pruebas dinámicas (ver pruebas.sh, CP-03)."
echo "================================================================"

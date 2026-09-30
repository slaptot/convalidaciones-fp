#!/bin/sh
# Construye una sola ficha en un directorio temporal y ejecuta sus "pruebas".
# Uso: tools/probar_ficha.sh aga302.json
set -e
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
CONVALIDA_SOLO="$1" CONVALIDA_OUT="$tmp" python3 tools/build_data.py
node tools/probar_ficha.js "$tmp" "research/$1"

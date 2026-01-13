#!/usr/bin/env bash

set -euo pipefail
# Vérification qu'un paramètre a été passé
if [ $# -ne 1 ]; then
    echo "Usage: $0 <nom-de-l-application>"
    echo "Exemple: $0 next-elvis"
    exit 1
fi

APP_NAME="$1"
PID=""

PID=$(pm2 describe "$APP_NAME" 2>/dev/null \
  | grep -i -E 'caddy.*pid' \
  | awk -F '│' '{print $3}' \
  | tr -d '[:space:]' \
  || true)
  
echo $PID
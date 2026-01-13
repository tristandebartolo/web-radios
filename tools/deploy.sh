#!/usr/bin/env bash

set -euo pipefail
# Vérification qu'un paramètre a été passé
if [ $# -ne 1 ]; then
    echo "Usage: $0 <nom-de-l-application>"
    echo "Exemple: $0 next-elvis"
    exit 1
fi

APP_NAME="$1"
echo $APP_NAME

PID=""

PID=$(pm2 id next-elvis | grep -oE '[0-9]+' 2>/dev/null || true)

if [[ -z "$PID" || ! "$PID" =~ ^[0-9]+$ ]]; then
  echo "Erreur : impossible de trouver le PID Caddy pour l'application '$APP_NAME'" >&2
  echo "" >&2
  echo "Commandes de debug possibles :" >&2
  echo "  pm2 describe \"$APP_NAME\"" >&2
  echo "  pm2 jlist | grep -A 15 \"$APP_NAME\"" >&2
  exit 1
fi

echo $PID
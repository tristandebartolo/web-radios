#!/usr/bin/env bash
# =============================================================================
# Récupère le PID du process Caddy d'une application PM2
# Usage: ./get-caddy-pid.sh <nom-application>
# Exemple: ./get-caddy-pid.sh next-elvis
# =============================================================================

set -euo pipefail

# Vérification qu'un paramètre a été passé
if [ $# -ne 1 ]; then
    echo "Usage: $0 <nom-de-l-application>"
    echo "Exemple: $0 next-elvis"
    exit 1
fi

APP_NAME="$1"
PID=""

# Essai 1 - format le plus fréquent actuellement
PID=$(pm2 jlist 2>/dev/null | jq -r --arg app "$APP" '
    .[] | select(.name==$app) | .pm2_env.axm_monitor.caddy.pid.value // empty
' 2>/dev/null)

# Essai 2 - fallback sur le PID principal (souvent c'est le même en réalité avec Caddy)
if [[ -z "$PID" ]]; then
    PID=$(pm2 pid "$APP" 2>/dev/null)
fi

if [[ -z "$PID" || ! "$PID" =~ ^[0-9]+$ ]]; then
    echo "❌ Impossible de récupérer le PID Caddy de $APP" >&2
    pm2 describe "$APP" >&2
    exit 1
fi

echo "$PID"
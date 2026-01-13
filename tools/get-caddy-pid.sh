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

# ──────────────────────────────────────────────────────────────────────────────
# Méthode 1 : pm2 jlist + jq (la plus fiable quand jq est installé)
# ──────────────────────────────────────────────────────────────────────────────
if command -v jq >/dev/null 2>&1; then
    # Recherche dans les métriques custom (souvent caddy.pid)
    PID=$(pm2 jlist 2>/dev/null | jq -r --arg name "$APP_NAME" '
        .[] 
        | select(.name == $name) 
        | .pm2_env.axm_monitor.caddy?.pid?.value // 
          .pm2_env.axm_monitor."caddy.pid"?.value // 
          .pm2_env.axm_monitor."Caddy PID"?.value // 
          empty
    ' 2>/dev/null)

    # Si rien trouvé → on prend le PID principal de l'app (souvent c'est le même)
    if [[ -z "$PID" || "$PID" == "null" ]]; then
        PID=$(pm2 jlist 2>/dev/null | jq -r --arg name "$APP_NAME" '
            .[] | select(.name == $name) | .pid // empty
        ')
    fi
fi

# ──────────────────────────────────────────────────────────────────────────────
# Méthode 2 : fallback sans jq
# ──────────────────────────────────────────────────────────────────────────────
if [[ -z "$PID" ]]; then
    PID=$(pm2 describe "$APP_NAME" 2>/dev/null \
        | grep -i -E 'caddy.*pid' \
        | awk -F '│' '{print $3}' \
        | tr -d '[:space:]' \
        || true)

    # Dernier recours : PID principal
    [[ -z "$PID" ]] && PID=$(pm2 pid "$APP_NAME" 2>/dev/null || true)
fi

# ──────────────────────────────────────────────────────────────────────────────
# Vérification finale
# ──────────────────────────────────────────────────────────────────────────────
if [[ -z "$PID" || ! "$PID" =~ ^[0-9]+$ ]]; then
    echo "Erreur : impossible de trouver le PID Caddy pour l'application '$APP_NAME'" >&2
    echo "" >&2
    echo "Commandes de debug possibles :" >&2
    echo "  pm2 describe \"$APP_NAME\"" >&2
    echo "  pm2 jlist | grep -A 15 \"$APP_NAME\"" >&2
    exit 1
fi

echo "$PID"
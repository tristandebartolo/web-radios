#!/usr/bin/env bash
# =============================================================================
# Script de déploiement avec logs clairs
# =============================================================================

set -euo pipefail

# Couleurs pour les logs (optionnel mais très utile)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log simple
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")    echo -e "${BLUE}[INFO]${NC}  ${timestamp}  ${message}" ;;
        "SUCCESS") echo -e "${GREEN}[OK]${NC}    ${timestamp}  ${message}" ;;
        "WARN")    echo -e "${YELLOW}[WARN]${NC}  ${timestamp}  ${message}" ;;
        "ERROR")   echo -e "${RED}[ERROR]${NC} ${timestamp}  ${message}" >&2 ;;
        *)         echo -e "${timestamp}  $message" ;;
    esac
}

# -----------------------------------------------------------------------------
# Vérification argument
# -----------------------------------------------------------------------------
if [ $# -ne 1 ]; then
    log "ERROR" "Usage: $0 <nom-de-l-application>"
    log "INFO"  "Exemple: $0 next-elvis"
    exit 1
fi

APP_NAME="$1"
log "INFO" "Déploiement de l'application : ${YELLOW}${APP_NAME}${NC}"

# -----------------------------------------------------------------------------
# Récupération ID PM2
# -----------------------------------------------------------------------------
log "INFO" "Récupération de l'ID PM2..."

PM2_ID=$(pm2 id "$APP_NAME" | grep -oE '[0-9]+' 2>/dev/null || true)

if [[ -z "$PM2_ID" || ! "$PM2_ID" =~ ^[0-9]+$ ]]; then
    log "ERROR" "Impossible de trouver l'ID PM2 pour '${APP_NAME}'"
    log "INFO"  "Commande de debug : pm2 id ${APP_NAME}"
    exit 1
fi

log "SUCCESS" "ID PM2 trouvé : ${PM2_ID}"

# -----------------------------------------------------------------------------
# Arrêt de l'application actuelle
# -----------------------------------------------------------------------------
log "INFO" "Arrêt de l'instance actuelle (pm2 delete ${PM2_ID})..."
pm2 delete "$PM2_ID" >/dev/null 2>&1 || true
log "SUCCESS" "Ancienne instance arrêtée"

# -----------------------------------------------------------------------------
# Nettoyage et mise à jour
# -----------------------------------------------------------------------------
log "INFO" "Suppression du dossier .next..."
rm -rf .next && log "SUCCESS" ".next supprimé" || log "WARN" "Dossier .next introuvable ou impossible à supprimer"

log "INFO" "Mise à jour du code (git pull)..."
git pull || { log "ERROR" "Échec du git pull"; exit 1; }
log "SUCCESS" "Code mis à jour"

# -----------------------------------------------------------------------------
# Build
# -----------------------------------------------------------------------------
log "INFO" "Lancement du build (yarn build)..."
yarn build || { log "ERROR" "Échec du build"; exit 1; }
log "SUCCESS" "Build terminé"

# -----------------------------------------------------------------------------
# Redémarrage
# -----------------------------------------------------------------------------
log "INFO" "Démarrage de l'application..."
# 
pm2 start npm --name "$APP_NAME" -- start -- --port 3007 >/dev/null 2>&1

# Petite attente pour laisser pm2 démarrer
sleep 3

# Vérification rapide de l'état
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    log "SUCCESS" "Application ${APP_NAME} redémarrée avec succès"
    log "INFO"   "Statut actuel :"
    pm2 list
else
    log "ERROR" "Échec du démarrage de l'application (pm2 describe a échoué)"
    exit 1
fi

echo ""
log "SUCCESS" "Déploiement terminé avec succès ✓"
echo ""
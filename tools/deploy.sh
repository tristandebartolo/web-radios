
# kill -HUP "$CADDY_PID" 2>/dev/null || true

# Vérification qu'un paramètre a été passé
if [ $# -ne 1 ]; then
    echo "Usage: $0 <nom-de-l-application>"
    echo "Exemple: $0 next-elvis"
    exit 1
fi

APP_NAME="$1"

CADDY_PID=$(./get-caddy-pid.sh $1)
echo $CADDY_PID
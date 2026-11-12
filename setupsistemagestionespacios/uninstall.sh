#!/bin/bash
# ==========================================================================
# Archivo: uninstall.sh
# Descripción: Deshace la instalación de SGEU hecha con install.sh:
# borra las carpetas del frontend y del backend, las bases de datos y el
# usuario de MariaDB. No desinstala paquetes ni toca la configuración
# del sistema.
#
# Uso:  sudo bash setupsistemagestionespacios/uninstall.sh
# (se puede lanzar desde cualquier carpeta)
# ==========================================================================

if [ -z "$BASH_VERSION" ]; then
    echo "Este script debe ejecutarse con bash: sudo bash setupsistemagestionespacios/uninstall.sh"
    exit 1
fi

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_ENV="$SCRIPT_DIR/sgeu_install.env"


# ==========================================================================
# UTILIDADES
# ==========================================================================

titulo() {
    echo
    echo "=========================================="
    echo " $*"
    echo "=========================================="
}

error() {
    echo "ERROR: $*" >&2
    exit 1
}

confirmar() {
    local respuesta
    read -r -p "$1 (s/n): " respuesta
    [[ "$respuesta" == "s" || "$respuesta" == "S" ]]
}

mysql_admin() {
    "$MYSQL_BIN" --defaults-extra-file="$MYSQL_CNF" "$@"
}

# Solo se borra una carpeta si está dentro del DocumentRoot y tiene la estructura esperada
carpeta_segura() {
    local dir="$1" marca="$2"
    [[ -n "$dir" && "$dir" == "$DOCROOT"/* && "$dir" != *..* && -e "$dir/$marca" ]]
}

# Borra las carpetas padre que hayan quedado vacías (hasta el DocumentRoot, sin incluirlo)
borrar_padres_vacios() {
    local dir
    dir="$(dirname "$1")"
    while [[ "$dir" == "$DOCROOT"/* ]] && rmdir "$dir" 2> /dev/null; do
        dir="$(dirname "$dir")"
    done
}


# ==========================================================================
# 1. DATOS DE LA INSTALACIÓN
# ==========================================================================

[ "$(id -u)" -eq 0 ] || error "Ejecuta el script como root: sudo bash setupsistemagestionespacios/uninstall.sh"
[ -f "$INSTALL_ENV" ] || error "No se encuentra $INSTALL_ENV. Sin él no se sabe qué se instaló."

# Se lee el fichero línea a línea (sin ejecutarlo)
DOCROOT="" FRONT_DIR="" BACK_DIR="" DB_NAME="" DB_NAME_TEST="" DB_USER=""
while IFS='=' read -r CLAVE VALOR; do
    case "$CLAVE" in
        DOCROOT|FRONT_DIR|BACK_DIR|DB_NAME|DB_NAME_TEST|DB_USER) printf -v "$CLAVE" '%s' "$VALOR" ;;
    esac
done < "$INSTALL_ENV"

for NOMBRE in "$DB_NAME" "$DB_NAME_TEST" "$DB_USER"; do
    [[ "$NOMBRE" =~ ^[A-Za-z0-9_]+$ ]] || error "El fichero $INSTALL_ENV tiene datos no válidos."
done

if command -v mariadb > /dev/null 2>&1; then
    MYSQL_BIN="mariadb"
elif command -v mysql > /dev/null 2>&1; then
    MYSQL_BIN="mysql"
else
    error "No se encuentra el cliente de MariaDB."
fi


# ==========================================================================
# 2. CONFIRMACIÓN
# ==========================================================================

titulo "Desinstalación de SGEU"

echo "Se eliminará:"
echo "  - Frontend:        $FRONT_DIR"
echo "  - Backend:         $BACK_DIR"
echo "  - Bases de datos:  $DB_NAME y $DB_NAME_TEST (con todos sus datos)"
echo "  - Usuario de BD:   $DB_USER"
echo
confirmar "¿Seguro que quieres desinstalar SGEU?" || { echo "Desinstalación cancelada."; exit 0; }

echo
read -r -p "Usuario administrador de MariaDB [root]: " DB_ADMIN
DB_ADMIN="${DB_ADMIN:-root}"
read -r -s -p "Contraseña de $DB_ADMIN (Enter si no tiene): " DB_ADMIN_PASS
echo

MYSQL_CNF="$(mktemp)"
chmod 600 "$MYSQL_CNF"
trap 'rm -f "$MYSQL_CNF"' EXIT

{
    echo "[client]"
    echo "user=$DB_ADMIN"
    if [ -n "$DB_ADMIN_PASS" ]; then
        PASS_ESCAPADA="${DB_ADMIN_PASS//\\/\\\\}"
        PASS_ESCAPADA="${PASS_ESCAPADA//\"/\\\"}"
        echo "password=\"$PASS_ESCAPADA\""
    fi
} > "$MYSQL_CNF"

mysql_admin -e "SELECT 1;" > /dev/null 2>&1 \
    || error "No se puede conectar a MariaDB con el usuario $DB_ADMIN."


# ==========================================================================
# 3. DESINSTALACIÓN
# ==========================================================================

titulo "Eliminando la base de datos"

mysql_admin <<EOF || error "No se han podido borrar las bases de datos o el usuario."
DROP DATABASE IF EXISTS \`$DB_NAME\`;
DROP DATABASE IF EXISTS \`$DB_NAME_TEST\`;
DROP USER IF EXISTS '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
echo "Bases de datos y usuario eliminados."

titulo "Eliminando los archivos"

if carpeta_segura "$BACK_DIR" "index.php"; then
    rm -rf "$BACK_DIR"
    borrar_padres_vacios "$BACK_DIR"
    echo "Eliminado $BACK_DIR"
else
    echo "Se omite $BACK_DIR (no existe o no parece el backend de SGEU)."
fi

if carpeta_segura "$FRONT_DIR" "js/api/api.js"; then
    rm -rf "$FRONT_DIR"
    borrar_padres_vacios "$FRONT_DIR"
    echo "Eliminado $FRONT_DIR"
else
    echo "Se omite $FRONT_DIR (no existe o no parece el frontend de SGEU)."
fi

rm -f "$INSTALL_ENV"

titulo "¡Desinstalación completada!"

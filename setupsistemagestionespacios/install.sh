#!/bin/bash
# ==========================================================================
# Archivo: install.sh
# Descripción: Instala SGEU (frontend y backend) descargándolo desde un 
# repositorio público de GitHub en un servidor Debian 11 que ya tenga 
# Apache, PHP y MariaDB.
#
#   - Clona temporalmente el repositorio de GitHub.
#   - Copia el frontend y el backend en las carpetas del DocumentRoot de Apache.
#   - Crea las bases de datos y un usuario propio en MariaDB.
#   - Genera los ficheros de configuración (.env y js/config.js).
#
# Uso:  sudo bash install.sh
# ==========================================================================

# Comprobar que se ejecuta con bash
if [ -z "$BASH_VERSION" ]; then
    echo "Este script debe ejecutarse con bash: sudo bash install.sh"
    exit 1
fi

set -u

# Variables temporales para limpieza
TEMP_REPO_DIR=""
MYSQL_CNF=""
INSTALL_ENV=""

limpiar_temporales() {
    [ -n "$TEMP_REPO_DIR" ] && rm -rf "$TEMP_REPO_DIR"
    [ -n "$MYSQL_CNF" ] && rm -f "$MYSQL_CNF"
}
trap limpiar_temporales EXIT

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_ENV="$SCRIPT_DIR/sgeu_install.env"

PHP_MINIMO="7.2.0"

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

aviso() {
    echo "AVISO: $*"
}

preguntar() {
    local respuesta
    read -r -p "$2 [$3]: " respuesta
    printf -v "$1" '%s' "${respuesta:-$3}"
}

confirmar() {
    local respuesta
    read -r -p "$1 (s/n): " respuesta
    [[ "$respuesta" == "s" || "$respuesta" == "S" ]]
}

ruta_valida() {
    [[ -n "$1" && "$1" =~ ^[A-Za-z0-9._/-]+$ && "$1" != /* && "$1" != *..* ]]
}

nombre_valido() {
    [[ "$1" =~ ^[A-Za-z0-9_]+$ ]]
}

mysql_admin() {
    "$MYSQL_BIN" --defaults-extra-file="$MYSQL_CNF" "$@"
}


# ==========================================================================
# 1. COMPROBACIONES PREVIAS
# ==========================================================================

titulo "Comprobando requisitos"

[ "$(id -u)" -eq 0 ] || error "Ejecuta el script como root: sudo bash install.sh"

# Versión de Debian
if [ -f /etc/debian_version ]; then
    DEBIAN_VERSION="$(cat /etc/debian_version)"
    echo "Debian detectado: $DEBIAN_VERSION"
    if [[ "$DEBIAN_VERSION" != 11* ]]; then
        aviso "SGEU está preparado para Debian 11."
        confirmar "¿Continuar de todos modos?" || exit 1
    fi
else
    aviso "No se ha detectado Debian. SGEU está preparado para Debian 11."
    confirmar "¿Continuar de todos modos?" || exit 1
fi

FALTA=""

# Git (necesario para clonar desde GitHub)
if ! command -v git > /dev/null 2>&1; then
    FALTA="$FALTA git"
fi

# Apache
if command -v apache2 > /dev/null 2>&1 || [ -x /usr/sbin/apache2 ]; then
    echo "Apache: instalado"
    if command -v systemctl > /dev/null 2>&1 && [ -d /run/systemd/system ] \
        && ! systemctl is-active --quiet apache2; then
        aviso "Apache está instalado pero no está en marcha. Arráncalo con: systemctl start apache2"
    fi
else
    FALTA="$FALTA apache2"
fi

# PHP y su versión
if command -v php > /dev/null 2>&1; then
    PHP_VERSION="$(php -r 'echo PHP_VERSION;')"
    echo "PHP: $PHP_VERSION"
    php -r "exit(version_compare(PHP_VERSION, '$PHP_MINIMO', '<') ? 1 : 0);" \
        || error "SGEU necesita PHP $PHP_MINIMO o superior (instalado: $PHP_VERSION)."

    php -m | grep -qi '^mysqli$' || FALTA="$FALTA php-mysql"
else
    FALTA="$FALTA php"
fi

# Módulo de PHP en Apache
if command -v apache2ctl > /dev/null 2>&1; then
    apache2ctl -M 2> /dev/null | grep -qi 'php' || FALTA="$FALTA libapache2-mod-php"
fi

# Cliente de MariaDB
if command -v mariadb > /dev/null 2>&1; then
    MYSQL_BIN="mariadb"
elif command -v mysql > /dev/null 2>&1; then
    MYSQL_BIN="mysql"
else
    FALTA="$FALTA mariadb-server"
fi

if [ -n "$FALTA" ]; then
    echo
    echo "Faltan componentes necesarios:$FALTA"
    echo "Instálalos con:"
    echo "    apt update && apt install$FALTA"
    exit 1
fi

echo "Todos los requisitos básicos están instalados."


# ==========================================================================
# 2. DATOS DE LA INSTALACIÓN Y REPOSITORIO GITHUB
# ==========================================================================

titulo "Configuración de la instalación"

GITHUB_REPO="https://github.com/Meteoro214/SGEU_REPO"

# DocumentRoot de Apache
DOCROOT_DEFECTO="$(grep -hoP '^\s*DocumentRoot\s+\K\S+' /etc/apache2/sites-enabled/*.conf 2> /dev/null | head -n 1)"
DOCROOT_DEFECTO="${DOCROOT_DEFECTO:-/var/www/html}"

preguntar DOCROOT "DocumentRoot de Apache" "$DOCROOT_DEFECTO"
DOCROOT="${DOCROOT%/}"
[ -d "$DOCROOT" ] || error "El DocumentRoot $DOCROOT no existe."

echo
echo "Indica dónde instalar cada parte, como ruta dentro del DocumentRoot."

while true; do
    preguntar FRONT_REL "Carpeta del frontend" "sgeu"
    FRONT_REL="${FRONT_REL%/}"
    ruta_valida "$FRONT_REL" && break
    echo "Ruta no válida: usa letras, números, '.', '_', '-' y '/', sin espacios ni '..'."
done

while true; do
    preguntar BACK_REL "Carpeta del backend" "sgeu-api"
    BACK_REL="${BACK_REL%/}"
    if ! ruta_valida "$BACK_REL"; then
        echo "Ruta no válida: usa letras, números, '.', '_', '-' y '/', sin espacios ni '..'."
    elif [[ "$BACK_REL" == "$FRONT_REL" || "$BACK_REL/" == "$FRONT_REL/"* || "$FRONT_REL/" == "$BACK_REL/"* ]]; then
        echo "El frontend y el backend deben ir en carpetas distintas y una no puede estar dentro de la otra."
    else
        break
    fi
done

FRONT_DIR="$DOCROOT/$FRONT_REL"
BACK_DIR="$DOCROOT/$BACK_REL"

preguntar SERVIDOR "Nombre o IP con el que se accederá al servidor desde el navegador" "localhost"

echo
echo "Datos de MariaDB:"
preguntar DB_ADMIN "Usuario administrador de MariaDB" "root"
read -r -s -p "Contraseña de $DB_ADMIN (Enter si no tiene): " DB_ADMIN_PASS
echo

while true; do
    preguntar DB_NAME "Nombre de la base de datos" "sgeu"
    preguntar DB_NAME_TEST "Nombre de la base de datos de pruebas" "sgeu_tests"
    preguntar DB_USER "Usuario de la base de datos para SGEU" "sgeu_user"
    if nombre_valido "$DB_NAME" && nombre_valido "$DB_NAME_TEST" && nombre_valido "$DB_USER" \
        && [ "$DB_NAME" != "$DB_NAME_TEST" ]; then
        break
    fi
    echo "Usa solo letras, números y '_', y nombres distintos para las dos bases de datos."
done

DB_PASS="$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 24)"


# ==========================================================================
# 3. DESCARGA DESDE GITHUB
# ==========================================================================

titulo "Descargando código fuente desde GitHub"

TEMP_REPO_DIR="$(mktemp -d)"
echo "Clonando repositorio..."
git clone --depth 1 "$GITHUB_REPO" "$TEMP_REPO_DIR/repo" || error "No se ha podido clonar el repositorio de GitHub indicado."

FRONT_SRC="$TEMP_REPO_DIR/frontsistemagestionespacios"
BACK_SRC="$TEMP_REPO_DIR/backsistemagestionespacios"
SQL_DB="$BACK_SRC/db/db_sgeu.sql"
SQL_DB_TESTS="$BACK_SRC/db/db_sgeu_tests.sql"

[ -d "$FRONT_SRC" ] && [ -d "$BACK_SRC" ] \
    || error "No se encuentran las carpetas 'frontsistemagestionespacios' o 'backsistemagestionespacios' en el repositorio."

[ -f "$SQL_DB" ] && [ -f "$SQL_DB_TESTS" ] \
    || error "No se encuentran los scripts SQL en la ruta esperada dentro del repositorio."

echo "Código descargado y validado correctamente."


# ==========================================================================
# 4. CONEXIÓN CON MARIADB
# ==========================================================================

titulo "Comprobando la conexión con MariaDB"

MYSQL_CNF="$(mktemp)"
chmod 600 "$MYSQL_CNF"

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
    || error "No se puede conectar a MariaDB con el usuario $DB_ADMIN. Comprueba que el servicio está activo y la contraseña."

echo "Conexión correcta."


# ==========================================================================
# 5. RESUMEN Y CONFIRMACIÓN
# ==========================================================================

titulo "Resumen"

echo "Repositorio GitHub:   $GITHUB_REPO"
echo "Frontend:             $FRONT_DIR"
echo "Backend:              $BACK_DIR"
echo "URL del frontend:     http://$SERVIDOR/$FRONT_REL/"
echo "URL de la API:        http://$SERVIDOR/$BACK_REL/index.php"
echo "Bases de datos:       $DB_NAME y $DB_NAME_TEST"
echo "Usuario de BD:        $DB_USER (contraseña autogenerada)"

echo
confirmar "¿Continuar con la instalación?" || { echo "Instalación cancelada."; exit 0; }


# ==========================================================================
# 6. BASE DE DATOS
# ==========================================================================

titulo "Creando la base de datos"

mysql_admin <<EOF || error "No se han podido crear las bases de datos o el usuario."
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE DATABASE IF NOT EXISTS \`$DB_NAME_TEST\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
ALTER USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON \`$DB_NAME_TEST\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

sed -E "s/^USE \`[^\`]+\`;/USE \`$DB_NAME\`;/" "$SQL_DB" | mysql_admin \
    || error "No se han podido crear las tablas de $DB_NAME."

sed -E "s/^USE \`[^\`]+\`;/USE \`$DB_NAME_TEST\`;/" "$SQL_DB_TESTS" | mysql_admin \
    || error "No se han podido crear las tablas de $DB_NAME_TEST."

echo "Bases de datos configuradas y pobladas."


# ==========================================================================
# 7. BACKEND
# ==========================================================================

titulo "Instalando el backend"

rm -rf "$BACK_DIR"
mkdir -p "$BACK_DIR"
cp -a "$BACK_SRC/." "$BACK_DIR/" || error "No se ha podido copiar el backend."

cat > "$BACK_DIR/.env" <<EOF
; Configuración del backend de SGEU (generado por install.sh)
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_NAME=$DB_NAME
DB_NAME_TEST=$DB_NAME_TEST
EOF

chown root:www-data "$BACK_DIR/.env"
chmod 640 "$BACK_DIR/.env"

echo "Backend instalado en $BACK_DIR"


# ==========================================================================
# 8. FRONTEND
# ==========================================================================

titulo "Instalando el frontend"

rm -rf "$FRONT_DIR"
mkdir -p "$FRONT_DIR"
cp -a "$FRONT_SRC/." "$FRONT_DIR/" || error "No se ha podido copiar el frontend."

cat > "$FRONT_DIR/js/config.js" <<EOF
/****************************************************************/
/* Archivo: config.js                                           */
/* Descripción: Configuración del frontend de SGEU.             */
/* Generado automáticamente por install.sh                      */
/****************************************************************/

export const API_URL = 'http://$SERVIDOR/$BACK_REL/index.php';
EOF

echo "Frontend instalado en $FRONT_DIR"


# ==========================================================================
# 9. GUARDAR CONFIGURACIÓN DE INSTALACIÓN
# ==========================================================================

cat > "$INSTALL_ENV" <<EOF
DOCROOT=$DOCROOT
FRONT_DIR=$FRONT_DIR
BACK_DIR=$BACK_DIR
DB_NAME=$DB_NAME
DB_NAME_TEST=$DB_NAME_TEST
DB_USER=$DB_USER
EOF
chmod 600 "$INSTALL_ENV"


# ==========================================================================
# 10. COMPROBACIÓN FINAL
# ==========================================================================

titulo "Comprobando la instalación"

if command -v curl > /dev/null 2>&1; then
    RESPUESTA="$(curl -s -X POST -d "controlador=usuario&action=LOGIN&email=admin@uvigo.es&pass=admin" \
        "http://localhost/$BACK_REL/index.php")"

    if [[ "$RESPUESTA" == *'"ok":"LOGIN_OK"'* ]]; then
        echo "La API responde correctamente y se conecta a la base de datos."
    else
        aviso "La API no ha respondido como se esperaba. Respuesta: ${RESPUESTA:0:200}"
    fi
else
    echo "curl no está instalado: se omite la comprobación automática de la API."
fi


# ==========================================================================
# FIN
# ==========================================================================

titulo "¡Instalación completada!"

echo "Abre en el navegador:  http://$SERVIDOR/$FRONT_REL/"
echo "Usuario inicial:       admin@uvigo.es / admin"
echo
echo "Para desinstalar:      sudo bash $(dirname "$0")/uninstall.sh"
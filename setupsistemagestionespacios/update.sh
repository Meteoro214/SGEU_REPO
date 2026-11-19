#!/bin/bash
# ==========================================================================
# Archivo: update.sh
# Descripción: Actualiza una instalación de SGEU hecha con install.sh a la
# versión de este entregable, sin reinstalar ni borrar datos.
#
#   - Lee sgeu_install.env para saber dónde está instalado SGEU.
#   - Descarga la versión nueva desde GitHub.
#   - Copia solo los ficheros nuevos o modificados y borra los que ya no
#     existen en la versión nueva.
#   - Conserva la configuración (backend/.env y frontend/js/config.js).
#   - Guarda una copia de lo instalado y la restaura si algo falla.
#
# Uso:  sudo bash update.sh
# ==========================================================================

if [ -z "$BASH_VERSION" ]; then
    echo "Este script debe ejecutarse con bash: sudo bash update.sh"
    exit 1
fi

set -u

# Versión que instala este script
VERSION_NUEVA=2

GITHUB_REPO="https://github.com/Meteoro214/SGEU_REPO"
GITHUB_RAMA="entregable_2"

# Ficheros de configuración que genera install.sh: nunca se sobrescriben ni se borran
PROTEGIDOS_BACK=".env"
PROTEGIDOS_FRONT="js/config.js"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_ENV="$SCRIPT_DIR/sgeu_install.env"
PHP_MINIMO="7.2.0"

TEMP_DIR=""
BACKUP_DIR=""
FICHEROS_TOCADOS=0
TERMINADO=0


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

# Lee un fichero CLAVE=VALOR línea a línea, sin ejecutarlo.
# Solo asigna las claves indicadas.  Uso: leer_claves fichero CLAVE1 CLAVE2 ...
leer_claves() {
    local fichero="$1" clave valor permitida
    shift
    while IFS='=' read -r clave valor; do
        clave="${clave//[[:space:]]/}"
        valor="${valor%$'\r'}"
        for permitida in "$@"; do
            [ "$clave" == "$permitida" ] && printf -v "$clave" '%s' "$valor"
        done
    done < "$fichero"
}

# Lista los ficheros de una carpeta (rutas relativas), sin los protegidos
listar_ficheros() {
    local dir="$1" protegido="$2"
    (cd "$dir" && find . -type f ! -path './.git/*' | sed 's|^\./||' | grep -vxF "$protegido" | LC_ALL=C sort)
}

# Calcula qué cambia entre la versión nueva (origen) y la instalada (destino).
# Deja el resultado en los ficheros nuevos.txt, modificados.txt y borrados.txt de $3.
calcular_cambios() {
    local origen="$1" destino="$2" salida="$3" protegido="$4" f
    mkdir -p "$salida"
    : > "$salida/nuevos.txt"
    : > "$salida/modificados.txt"

    listar_ficheros "$origen" "$protegido" > "$salida/origen.txt"
    listar_ficheros "$destino" "$protegido" > "$salida/destino.txt"

    while IFS= read -r f; do
        if [ ! -e "$destino/$f" ]; then
            echo "$f" >> "$salida/nuevos.txt"
        elif ! cmp -s "$origen/$f" "$destino/$f"; then
            echo "$f" >> "$salida/modificados.txt"
        fi
    done < "$salida/origen.txt"

    LC_ALL=C comm -13 "$salida/origen.txt" "$salida/destino.txt" > "$salida/borrados.txt"
}

contar() {
    grep -c . "$1" 2> /dev/null || true
}

mostrar_cambios() {
    local nombre="$1" dir="$2" tipo f n
    echo
    echo "$nombre: $(contar "$dir/nuevos.txt") nuevos, $(contar "$dir/modificados.txt") modificados, $(contar "$dir/borrados.txt") a borrar"
    for tipo in nuevos modificados borrados; do
        n=0
        while IFS= read -r f; do
            n=$((n + 1))
            if [ "$n" -le 15 ]; then
                case "$tipo" in
                    nuevos)      echo "    + $f" ;;
                    modificados) echo "    ~ $f" ;;
                    borrados)    echo "    - $f" ;;
                esac
            fi
        done < "$dir/$tipo.txt"
        [ "$n" -gt 15 ] && echo "    ... y $((n - 15)) más ($tipo)"
    done
    return 0
}

# Aplica los cambios calculados sobre la carpeta instalada
aplicar_cambios() {
    local origen="$1" destino="$2" dir="$3" f
    while IFS= read -r f; do
        mkdir -p "$destino/$(dirname "$f")"
        cp -a "$origen/$f" "$destino/$f" || return 1
    done < <(cat "$dir/nuevos.txt" "$dir/modificados.txt")

    while IFS= read -r f; do
        rm -f "$destino/$f" || return 1
    done < "$dir/borrados.txt"

    # Carpetas que han quedado vacías (por ficheros movidos o borrados)
    find "$destino" -mindepth 1 -type d -empty -delete 2> /dev/null
    return 0
}

# Si algo falla después de empezar a cambiar cosas, se deja todo como estaba
restaurar() {
    [ "$TERMINADO" -eq 1 ] && return
    [ -z "$BACKUP_DIR" ] && return

    if [ "$FICHEROS_TOCADOS" -eq 1 ]; then
        echo
        echo "Restaurando los ficheros de la versión anterior..."
        rm -rf "$BACK_DIR" "$FRONT_DIR"
        cp -a "$BACKUP_DIR/backend" "$BACK_DIR"
        cp -a "$BACKUP_DIR/frontend" "$FRONT_DIR"
        echo "Ficheros restaurados."
    fi
}

limpiar() {
    local estado=$?
    restaurar
    [ -n "$TEMP_DIR" ] && rm -rf "$TEMP_DIR"
    exit "$estado"
}
trap limpiar EXIT


# ==========================================================================
# 1. COMPROBACIONES PREVIAS
# ==========================================================================

titulo "Comprobando requisitos"

[ "$(id -u)" -eq 0 ] || error "Ejecuta el script como root: sudo bash update.sh"

FALTA=""
command -v git > /dev/null 2>&1 || FALTA="$FALTA git"

if command -v php > /dev/null 2>&1; then
    PHP_VERSION="$(php -r 'echo PHP_VERSION;')"
    echo "PHP: $PHP_VERSION"
    php -r "exit(version_compare(PHP_VERSION, '$PHP_MINIMO', '<') ? 1 : 0);" \
        || error "SGEU necesita PHP $PHP_MINIMO o superior (instalado: $PHP_VERSION)."
else
    FALTA="$FALTA php"
fi

if [ -n "$FALTA" ]; then
    echo "Faltan componentes necesarios:$FALTA"
    echo "Instálalos con:  apt update && apt install$FALTA"
    exit 1
fi

echo "Requisitos correctos."


# ==========================================================================
# 2. LOCALIZAR LA INSTALACIÓN ACTUAL
# ==========================================================================

titulo "Buscando la instalación actual"

DOCROOT="" FRONT_DIR="" BACK_DIR="" VERSION=""

# Igual que uninstall.sh: todo se saca de sgeu_install.env, no se pregunta nada
[ -f "$INSTALL_ENV" ] || error "No se encuentra $INSTALL_ENV. Copia update.sh en la carpeta donde se ejecutó install.sh (junto a sgeu_install.env)."

leer_claves "$INSTALL_ENV" DOCROOT FRONT_DIR BACK_DIR VERSION
echo "Datos leídos de $INSTALL_ENV"

# Las carpetas tienen que ser las de una instalación de SGEU
[[ -n "$DOCROOT" && "$FRONT_DIR" == "$DOCROOT"/* && "$BACK_DIR" == "$DOCROOT"/* \
    && "$FRONT_DIR" != *..* && "$BACK_DIR" != *..* ]] \
    || error "Las carpetas de la instalación no son válidas."
[ -f "$BACK_DIR/index.php" ] && [ -f "$BACK_DIR/.env" ] \
    || error "No hay un backend de SGEU instalado en $BACK_DIR."
[ -f "$FRONT_DIR/js/api/api.js" ] && [ -f "$FRONT_DIR/js/config.js" ] \
    || error "No hay un frontend de SGEU instalado en $FRONT_DIR."

# install.sh del primer entregable no guardaba la versión: si no está, es la 1
VERSION="${VERSION:-1}"
[[ "$VERSION" =~ ^[0-9]+$ ]] || error "Versión instalada no válida: $VERSION"

BACK_REL="${BACK_DIR#"$DOCROOT"/}"
FRONT_REL="${FRONT_DIR#"$DOCROOT"/}"

echo "Frontend:          $FRONT_DIR"
echo "Backend:           $BACK_DIR"
echo "Versión instalada: $VERSION"
echo "Versión nueva:     $VERSION_NUEVA"

if [ "$VERSION" -gt "$VERSION_NUEVA" ]; then
    error "La versión instalada ($VERSION) es más nueva que la de este script ($VERSION_NUEVA)."
elif [ "$VERSION" -eq "$VERSION_NUEVA" ]; then
    echo
    echo "SGEU ya está en la versión $VERSION_NUEVA."
    confirmar "¿Volver a aplicar la actualización (por ejemplo, para reparar ficheros)?" || exit 0
fi


# ==========================================================================
# 3. DESCARGA DE LA VERSIÓN NUEVA
# ==========================================================================

titulo "Descargando la versión nueva desde GitHub"

TEMP_DIR="$(mktemp -d)"
git clone --depth 1 --branch "$GITHUB_RAMA" "$GITHUB_REPO" "$TEMP_DIR/repo" \
    || error "No se ha podido clonar el repositorio $GITHUB_REPO."

FRONT_SRC="$TEMP_DIR/repo/frontsistemagestionespacios"
BACK_SRC="$TEMP_DIR/repo/backsistemagestionespacios"

[ -f "$BACK_SRC/index.php" ] && [ -f "$FRONT_SRC/js/api/api.js" ] \
    || error "El repositorio no tiene la estructura esperada."

echo "Código descargado."


# ==========================================================================
# 4. QUÉ CAMBIA
# ==========================================================================

titulo "Cambios de la actualización"

calcular_cambios "$BACK_SRC" "$BACK_DIR" "$TEMP_DIR/cambios-back" "$PROTEGIDOS_BACK"
calcular_cambios "$FRONT_SRC" "$FRONT_DIR" "$TEMP_DIR/cambios-front" "$PROTEGIDOS_FRONT"

mostrar_cambios "Backend" "$TEMP_DIR/cambios-back"
mostrar_cambios "Frontend" "$TEMP_DIR/cambios-front"

echo
echo "Se conservan:  $BACK_DIR/$PROTEGIDOS_BACK y $FRONT_DIR/$PROTEGIDOS_FRONT"

TOTAL=$(( $(contar "$TEMP_DIR/cambios-back/nuevos.txt") + $(contar "$TEMP_DIR/cambios-back/modificados.txt") \
    + $(contar "$TEMP_DIR/cambios-back/borrados.txt") + $(contar "$TEMP_DIR/cambios-front/nuevos.txt") \
    + $(contar "$TEMP_DIR/cambios-front/modificados.txt") + $(contar "$TEMP_DIR/cambios-front/borrados.txt") ))

echo
if [ "$TOTAL" -eq 0 ]; then
    echo "No hay nada que actualizar: los ficheros ya coinciden con la versión nueva."
else
    confirmar "¿Aplicar la actualización?" || { echo "Actualización cancelada."; exit 0; }
fi


# ==========================================================================
# 5. COPIA DE SEGURIDAD
# ==========================================================================

titulo "Copia de seguridad"

BACKUP_DIR="/var/backups/sgeu/v${VERSION}-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

cp -a "$BACK_DIR" "$BACKUP_DIR/backend" && cp -a "$FRONT_DIR" "$BACKUP_DIR/frontend" \
    || error "No se ha podido hacer la copia de seguridad de los ficheros."
echo "Ficheros copiados en $BACKUP_DIR"


# ==========================================================================
# 6. ACTUALIZAR FICHEROS
# ==========================================================================

titulo "Actualizando ficheros"

FICHEROS_TOCADOS=1
aplicar_cambios "$BACK_SRC" "$BACK_DIR" "$TEMP_DIR/cambios-back" || error "No se ha podido actualizar el backend."
aplicar_cambios "$FRONT_SRC" "$FRONT_DIR" "$TEMP_DIR/cambios-front" || error "No se ha podido actualizar el frontend."

# Por si acaso, se vuelven a dejar los permisos del .env como los pone install.sh
chown root:www-data "$BACK_DIR/.env"
chmod 640 "$BACK_DIR/.env"

echo "Ficheros actualizados."


# ==========================================================================
# 7. COMPROBACIÓN
# ==========================================================================

titulo "Comprobando la actualización"

if command -v curl > /dev/null 2>&1; then
    RESPUESTA="$(curl -s -X POST -d "controlador=usuario&action=LOGIN&email=admin@uvigo.es&pass=admin" \
        "http://localhost/$BACK_REL/index.php")"

    if [[ "$RESPUESTA" == *'"code":"'* ]]; then
        echo "La API responde correctamente."
    else
        echo "La API no responde como se esperaba. Respuesta: ${RESPUESTA:0:200}"
        if confirmar "¿Deshacer la actualización y volver a la versión $VERSION?"; then
            error "Actualización deshecha."
        fi
    fi
else
    echo "curl no está instalado: se omite la comprobación automática de la API."
fi


# ==========================================================================
# 8. GUARDAR LA VERSIÓN
# ==========================================================================

# Se añade la versión a sgeu_install.env sin cambiar el resto de líneas
# (uninstall.sh ignora la clave VERSION)
grep -v '^VERSION=' "$INSTALL_ENV" > "$INSTALL_ENV.nuevo"
echo "VERSION=$VERSION_NUEVA" >> "$INSTALL_ENV.nuevo"
mv "$INSTALL_ENV.nuevo" "$INSTALL_ENV"
chmod 600 "$INSTALL_ENV"

TERMINADO=1


# ==========================================================================
# FIN
# ==========================================================================

# La dirección del servidor se saca de la API_URL que generó install.sh
URL_SERVIDOR="$(grep -oE "https?://[^/']+" "$FRONT_DIR/js/config.js" | head -n 1)"
URL_SERVIDOR="${URL_SERVIDOR:-http://localhost}"

titulo "¡Instalación completada!"

echo "Abre en el navegador:  $URL_SERVIDOR/$FRONT_REL/"
echo "Usuario inicial:       admin@uvigo.es / admin"

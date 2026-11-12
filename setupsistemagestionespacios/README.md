# Instalación de SGEU

Scripts para instalar y desinstalar **SGEU (Sistema de Gestión de Espacios Universitarios)** en un servidor
Debian 11 con Apache, PHP y MariaDB.

| Archivo | Descripción |
|---|---|
| `install.sh` | Instala el frontend y el backend, crea la base de datos y genera la configuración |
| `uninstall.sh` | Deshace todo lo que hizo `install.sh` |
| `sgeu_install.env` | Lo crea `install.sh`. Guarda lo instalado para que `uninstall.sh` sepa qué borrar. **No lo borres** |

---

## Requisitos

- **Debian 11**
- **Apache 2** con el módulo de PHP (`libapache2-mod-php`)
- **PHP 7.2 o superior** con la extensión `mysqli` (`php-mysql`)
- **MariaDB**
- Acceso como **root** (o `sudo`)
- `curl` (opcional, para la comprobación final)

El instalador **no instala paquetes ni modifica la configuración del sistema**. Si falta algo, lo indica y se detiene.
Para instalar lo necesario en un Debian 11 limpio:

```bash
apt install apache2 libapache2-mod-php php php-mysql mariadb-server curl
```

---

## Instalación

Desde la raíz del repositorio (puede estar en cualquier carpeta, no hace falta que esté en el DocumentRoot):

```bash
git clone https://github.com/Meteoro214/PDP.git
cd PDP
sudo bash setupsistemagestionespacios/install.sh
```

El script comprueba los requisitos y hace estas preguntas. **Pulsando Enter se usa el valor entre corchetes.**

| Pregunta | Por defecto | Notas |
|---|---|---|
| DocumentRoot de Apache | `/var/www/html` | Se lee de la configuración de Apache |
| Carpeta del frontend | `sgeu` | Ruta dentro del DocumentRoot, a cualquier nivel (p. ej. `asignaturas/pdp/sgeu`) |
| Carpeta del backend | `sgeu-api` | Distinta de la del frontend y no dentro de ella |
| Nombre o IP del servidor | `localhost` | El que se escribirá en el navegador. Si se accede desde otro equipo, la IP del servidor |
| Usuario administrador de MariaDB | `root` | |
| Contraseña del administrador | *(vacía)* | En Debian, root entra sin contraseña al ejecutar como root |
| Base de datos | `sgeu` | |
| Base de datos de pruebas | `sgeu_tests` | |
| Usuario de la base de datos | `sgeu_user` | Su contraseña se genera automáticamente |

Antes de instalar muestra un resumen y pide confirmación. Si las carpetas o las bases de datos ya existen, avisa de
que se sustituirán.

Al terminar comprueba que la API responde y muestra la dirección de acceso:

```
==========================================
 ¡Instalación completada!
==========================================
Abre en el navegador:  http://localhost/sgeu/
Usuario inicial:       admin@uvigo.es / admin
```

---

## Acceso

Abrir en el navegador la dirección que muestra el instalador: `http://<servidor>/<carpeta del frontend>/`

| Usuario | Contraseña | Perfil |
|---|---|---|
| `admin@uvigo.es` | `admin` | Administración |

> La raíz del servidor (`http://<servidor>/`) sigue mostrando la página por defecto de Apache: el instalador no la
> modifica. SGEU está en la carpeta indicada durante la instalación.

---

## Qué hace el instalador

1. **Comprueba** Apache, PHP (versión y `mysqli`), el módulo de PHP en Apache y MariaDB.
2. **Crea en MariaDB** las bases de datos `sgeu` y `sgeu_tests` y el usuario `sgeu_user`, con permisos solo sobre ellas,
   y carga las tablas y los datos iniciales desde `backsistemagestionespacios/db/`.
3. **Copia** el frontend y el backend en las carpetas indicadas del DocumentRoot.
4. **Genera solo ficheros de configuración**:

| Fichero | Contenido |
|---|---|
| `<backend>/.env` | Conexión a la base de datos. Solo lo pueden leer root y Apache (`640 root:www-data`) |
| `<frontend>/js/config.js` | Dirección de la API (`API_URL`) |

No modifica ningún otro fichero del código ni de la configuración del sistema.

---

## Desinstalación

```bash
sudo bash setupsistemagestionespacios/uninstall.sh
```

Pide confirmación y los datos del administrador de MariaDB, y elimina:

- las carpetas del frontend y del backend (y las carpetas vacías que creó el instalador),
- las bases de datos `sgeu` y `sgeu_tests` con todos sus datos,
- el usuario `sgeu_user`.

Para reinstalar desde cero basta con volver a ejecutar `install.sh`, con o sin desinstalar antes.

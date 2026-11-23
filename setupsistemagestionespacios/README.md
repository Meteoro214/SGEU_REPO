## Actualización desde la versión anterior

Si SGEU ya está instalado con el `install.sh` de un entregable anterior, **no hace falta desinstalar**. En caso de que no esté instalado SGEU, **debe instalarlo** mediante el script de instalación `install.sh` (disponible en el entregable 1).

```bash
sudo bash install.sh
```

Si ya está instalado, desde la carpeta donde está `sgeu_install.env` (la misma desde la que se ejecutó `install.sh`):

```bash
sudo bash update.sh
```

Igual que `uninstall.sh`, no pregunta las carpetas: las lee de `sgeu_install.env`. Si no encuentra ese fichero junto
al script, se detiene.

El actualizador:

1. **Localiza la instalación** con `sgeu_install.env`.
2. **Descarga la versión nueva** (rama `entregable_3`) y muestra qué ficheros son nuevos (`+`), cuáles cambian (`~`) y
   cuáles se borran (`-`) porque ya no existen en la versión nueva. También indica el script SQL de migración que se
   va a ejecutar. Pide confirmación.
3. **Hace una copia de seguridad** de las dos carpetas en `/var/backups/sgeu/`.
4. **Copia solo lo que cambia.** Nunca toca `<backend>/.env` ni `<frontend>/js/config.js`.
5. **Migra la base de datos** con `backsistemagestionespacios/db/migraciones/migracion_19N.sql`, antes de copiar los
   ficheros:
   - Lee las credenciales de `<backend>/.env`.
   - Hace antes una copia de `sgeu` y `sgeu_tests` en `/var/backups/sgeu/<copia>/`.
   - Aplica la migración a las dos bases de datos, conservando los datos existentes.

   Si se responde que no, la migración se omite.
6. **Comprueba que la API responde.** Si algo falla, restaura automáticamente la versión anterior de los ficheros y
   de las bases de datos.
7. Guarda la versión instalada en `sgeu_install.env`, para que `uninstall.sh` y las próximas actualizaciones sigan
   funcionando.

Al terminar, recarga el navegador con **Ctrl+F5** para que no use ficheros antiguos de la caché.
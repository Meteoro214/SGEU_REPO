
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE edificio
    ADD CONSTRAINT uq_edificio_id_anho UNIQUE (id_edificio, anho_acad_edificio);

-- ---------------------------------------------------------------------------------------------------
-- GESTOR_EDIFICIO: Crear tabla y migrar asignaciones desde usuario.id_edificio
-- ---------------------------------------------------------------------------------------------------
CREATE TABLE gestor_edificio (
    id_edificio        INT UNSIGNED NOT NULL,
    id_usuario         INT UNSIGNED NOT NULL,
    anho_acad_edificio CHAR(9)      NOT NULL,

    CONSTRAINT pk_gestor_edificio PRIMARY KEY (id_edificio, id_usuario, anho_acad_edificio),

    -- Un gestor no puede gestionar dos edificios del mismo año.
    CONSTRAINT uq_gestor_anho               UNIQUE (id_usuario, anho_acad_edificio),
    CONSTRAINT fk_gestor_edificio_edificio  FOREIGN KEY (id_edificio, anho_acad_edificio) REFERENCES edificio (id_edificio, anho_acad_edificio) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_gestor_edificio_usuario   FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

INSERT IGNORE INTO gestor_edificio (id_edificio, id_usuario, anho_acad_edificio)
SELECT
    u.id_edificio,
    u.id_usuario,
    e.anho_acad_edificio
FROM usuario u
INNER JOIN edificio e
    ON e.id_edificio = u.id_edificio
WHERE u.id_edificio IS NOT NULL
  AND u.id_grupo = 2;

-- ---------------------------------------------------------------------------------------------------
-- USUARIO: Eliminar FK y columna id_edificio
-- ---------------------------------------------------------------------------------------------------
ALTER TABLE usuario
    DROP FOREIGN KEY fk_usuario_edificio;

ALTER TABLE usuario
    DROP COLUMN id_edificio;

-- ---------------------------------------------------------------------------------------------------
-- ESPACIO: Quitar UNIQUE de inventario, ajustar id_facultad a NULL y añadir id_gestor
-- ---------------------------------------------------------------------------------------------------

ALTER TABLE espacio
    DROP INDEX uq_espacio_invent;

ALTER TABLE espacio
    DROP FOREIGN KEY fk_espacio_facultad;

ALTER TABLE espacio
    MODIFY COLUMN id_facultad INT UNSIGNED NULL;

ALTER TABLE espacio
    ADD CONSTRAINT fk_espacio_facultad
        FOREIGN KEY (id_facultad) REFERENCES facultad (id_facultad)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE espacio
    ADD COLUMN id_gestor INT UNSIGNED NULL AFTER id_facultad;

ALTER TABLE espacio
    ADD CONSTRAINT fk_espacio_gestor
        FOREIGN KEY (id_gestor) REFERENCES usuario (id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE;


SET FOREIGN_KEY_CHECKS = 1;
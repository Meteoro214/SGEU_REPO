
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

-- ---------------------------------------------------------------------------------------------------
-- OCUPA y OCUPANTE: Mover hrs_ocupacion y num_dias_ocupacion de ocupante a ocupa
-- y cambiar PK de ocupa a id_ocupa AUTO_INCREMENT
-- ---------------------------------------------------------------------------------------------------
ALTER TABLE ocupa
    DROP FOREIGN KEY fk_ocupa_ocupante;

ALTER TABLE ocupa
    DROP FOREIGN KEY fk_ocupa_espacio;

ALTER TABLE ocupa
    DROP PRIMARY KEY;

ALTER TABLE ocupa
    ADD COLUMN id_ocupa INT UNSIGNED NOT NULL AUTO_INCREMENT FIRST,
    ADD COLUMN hrs_ocupacion DECIMAL(5,2) NOT NULL AFTER id_espacio,
    ADD COLUMN num_dias_ocupacion INT UNSIGNED NOT NULL AFTER hrs_ocupacion,
    ADD PRIMARY KEY (id_ocupa);

UPDATE ocupa o
INNER JOIN ocupante op
    ON op.tipo_ocupante = o.tipo_ocupante
SET
    o.hrs_ocupacion = op.hrs_ocupacion,
    o.num_dias_ocupacion = op.num_dias_ocupacion;

ALTER TABLE ocupa
    MODIFY COLUMN tipo_ocupante VARCHAR(50) NOT NULL,
    MODIFY COLUMN id_espacio INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_ocupa_ocupante
        FOREIGN KEY (tipo_ocupante) REFERENCES ocupante (tipo_ocupante)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_ocupa_espacio
        FOREIGN KEY (id_espacio) REFERENCES espacio (id_espacio)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ocupante
    DROP COLUMN hrs_ocupacion,
    DROP COLUMN num_dias_ocupacion,
    MODIFY COLUMN tipo_ocupante VARCHAR(50) NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;
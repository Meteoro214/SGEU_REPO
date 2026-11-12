
-- ================================================================================================
-- Script SQL para la Base de Datos de Tests MySQL del Sistema de Gestión de Espacios Universitarios
-- ================================================================================================
USE `4800965_sgeu_tests`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------------------------------
-- DROPS
-- ---------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS ocupa;
DROP TABLE IF EXISTS ocupante;
DROP TABLE IF EXISTS espacio;
DROP TABLE IF EXISTS facultad;
DROP TABLE IF EXISTS planta;
DROP TABLE IF EXISTS tiene_permiso;
DROP TABLE IF EXISTS funcionalidad;
DROP TABLE IF EXISTS accion;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS grupo_usuarios;
DROP TABLE IF EXISTS edificio;


SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------------------------------
-- CREATE TABLES
-- ---------------------------------------------------------------------------------------------------

-- =================================================
--              INFRAESTRUCTURA
-- =================================================

CREATE TABLE edificio (
    id_edificio         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom_edificio        VARCHAR(100) NOT NULL,
    dir_edificio        VARCHAR(255) NOT NULL,
    tel_edificio        VARCHAR(15),
    anho_acad_edificio  CHAR(9)      NOT NULL,

    CONSTRAINT pk_edificio         PRIMARY KEY (id_edificio)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE planta (
    id_edificio       INT UNSIGNED  NOT NULL,
    id_planta         INT UNSIGNED  NOT NULL,
    nom_planta        VARCHAR(50)   NOT NULL,
    superf_total      DECIMAL(10,2) NOT NULL,
    superf_usable     DECIMAL(10,2) NOT NULL,
    anho_acad_planta  CHAR(9)       NOT NULL,

    CONSTRAINT pk_planta PRIMARY KEY (id_edificio, id_planta),

    CONSTRAINT fk_planta_edificio FOREIGN KEY (id_edificio) REFERENCES edificio (id_edificio) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT ck_planta_superf CHECK (superf_usable <= superf_total)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE facultad (
    id_facultad         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom_facultad        VARCHAR(100) NOT NULL,
    anho_acad_facultad  CHAR(9)      NOT NULL,

    CONSTRAINT pk_facultad PRIMARY KEY (id_facultad)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =================================================
--      USUARIOS, GRUPO DE USUARIOS, PERMISOS
-- =================================================
CREATE TABLE grupo_usuarios (
    id_grupo    INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom_grupo   VARCHAR(50)  NOT NULL,
    desc_grupo  VARCHAR(255),

    CONSTRAINT pk_grupo     PRIMARY KEY (id_grupo),

    CONSTRAINT uq_grupo_nom UNIQUE (nom_grupo)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE usuario (
    id_usuario      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nom_usuario     VARCHAR(50)   NOT NULL,
    apell_usuario   VARCHAR(100)  NOT NULL,
    email           VARCHAR(100)  NOT NULL,
    pass            VARCHAR(255)  NOT NULL,
    telefono        VARCHAR(15),
    dni             CHAR(9)       NOT NULL,
    fech_nacimiento DATE,
    activo_usuario  TINYINT(1)    NOT NULL DEFAULT 1,
    id_grupo        INT UNSIGNED  NOT NULL,
    id_edificio     INT UNSIGNED,
    
    CONSTRAINT pk_usuario       PRIMARY KEY (id_usuario),
    
    CONSTRAINT uq_usuario_email     UNIQUE (email),
    CONSTRAINT uq_usuario_dni       UNIQUE (dni),
    CONSTRAINT fk_usuario_grupo     FOREIGN KEY (id_grupo) REFERENCES grupo_usuarios (id_grupo) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_edificio  FOREIGN KEY (id_edificio) REFERENCES edificio (id_edificio) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE accion (
    id_accion   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom_accion  VARCHAR(50)  NOT NULL,
    desc_accion VARCHAR(255),

    CONSTRAINT pk_accion     PRIMARY KEY (id_accion),

    CONSTRAINT uq_accion_nom UNIQUE (nom_accion)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE funcionalidad (
    id_func     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom_func    VARCHAR(50)  NOT NULL,
    desc_func   VARCHAR(255),

    CONSTRAINT pk_funcionalidad     PRIMARY KEY (id_func),

    CONSTRAINT uq_funcionalidad_nom UNIQUE (nom_func)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE tiene_permiso (
    id_grupo    INT UNSIGNED NOT NULL,
    id_accion   INT UNSIGNED NOT NULL,
    id_func     INT UNSIGNED NOT NULL,

    CONSTRAINT pk_tiene_permiso PRIMARY KEY (id_grupo, id_accion, id_func),

    CONSTRAINT fk_permiso_grupo FOREIGN KEY (id_grupo) REFERENCES grupo_usuarios (id_grupo) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_permiso_func FOREIGN KEY (id_func) REFERENCES funcionalidad (id_func) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_permiso_accion FOREIGN KEY (id_accion) REFERENCES accion (id_accion) ON DELETE CASCADE ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =================================================
--                      ESPACIOS
-- =================================================

CREATE TABLE espacio (
    id_espacio          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nom_espacio         VARCHAR(100)  NOT NULL,
    superf_espacio      DECIMAL(10,2) NOT NULL,
    num_invent_espacio  VARCHAR(30)   NOT NULL,
    num_ocupantes_max   INT UNSIGNED  NOT NULL,
    cat_espacio         VARCHAR(50)   NOT NULL,
    anho_acad_espacio   CHAR(9)       NOT NULL,
    id_edificio         INT UNSIGNED  NOT NULL,
    id_planta           INT UNSIGNED  NOT NULL,
    id_facultad         INT UNSIGNED  NOT NULL,

    CONSTRAINT pk_espacio        PRIMARY KEY (id_espacio),

    CONSTRAINT uq_espacio_invent UNIQUE (num_invent_espacio),
    CONSTRAINT fk_espacio_planta FOREIGN KEY (id_edificio, id_planta) REFERENCES planta (id_edificio, id_planta) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_espacio_facultad FOREIGN KEY (id_facultad) REFERENCES facultad (id_facultad) ON DELETE RESTRICT ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE ocupante (
    tipo_ocupante       VARCHAR(50)  NOT NULL,
    hrs_ocupacion       DECIMAL(5,2) NOT NULL,
    num_dias_ocupacion  INT UNSIGNED NOT NULL,

    CONSTRAINT pk_ocupante PRIMARY KEY (tipo_ocupante)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE ocupa (
    tipo_ocupante   VARCHAR(50)  NOT NULL,
    id_espacio      INT UNSIGNED NOT NULL,

    CONSTRAINT pk_ocupa PRIMARY KEY (tipo_ocupante, id_espacio),
    CONSTRAINT fk_ocupa_ocupante FOREIGN KEY (tipo_ocupante) REFERENCES ocupante (tipo_ocupante) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ocupa_espacio FOREIGN KEY (id_espacio) REFERENCES espacio (id_espacio) ON DELETE CASCADE ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- ---------------------------------------------------------------------------------------------------
-- INSERT TABLES
-- ---------------------------------------------------------------------------------------------------

-- =================================================
--      USUARIOS, GRUPO DE USUARIOS, PERMISOS
-- =================================================
INSERT INTO grupo_usuarios (id_grupo, nom_grupo, desc_grupo) VALUES
    (1, 'ADMIN', 'Administradores de sistema con acceso total'),
    (2, 'GESTOR', 'Usuario responsable de un edificio'),
    (3, 'LECTOR', 'Usuario común con permisos de lectura');

INSERT INTO usuario (id_usuario, nom_usuario, apell_usuario, email, pass, telefono, dni, fech_nacimiento, activo_usuario, id_grupo, id_edificio) VALUES
    (1, 'admin', 'admin admin', 'admin@uvigo.es', MD5('admin'), '988752698', '11111111H', '1995-04-30', 1, 1, NULL);

INSERT INTO accion (id_accion, nom_accion, desc_accion) VALUES
    (1, 'SHOW ALL', 'Acción para mostrar todo el contenido de una entidad'),
    (2, 'ADD', 'Acción para añadir contenido a una entidad'),
    (3, 'EDIT', 'Acción para editar el contenido de una entidad'),
    (4, 'DELETE', 'Acción para eliminar el contenido de una entidad'),
    (5, 'SHOW', 'Acción para mostrar contenido de una entidad'),
    (6, 'SEARCH', 'Acción para buscar un campo de una entidad'),
    (7, 'MANAGE', 'Acción para gestionar una instancia concreta de la entidad');

INSERT INTO funcionalidad (id_func, nom_func, desc_func) VALUES
    (1, 'USER', 'Acciones especificas para un usuario'),
    (2, 'FACULTAD', 'Acciones especificas para una facultad'),
    (3, 'EDIFICIO', 'Acciones especificas para un edificio'),
    (4, 'PLANTA', 'Acciones especificas para una planta'),
    (5, 'ESPACIO', 'Acciones especificas para un espacio'),
    (6, 'TEST', 'Acciones especificas para unas pruebas');

INSERT INTO tiene_permiso (id_grupo, id_accion, id_func) VALUES
    (1, 1, 1),
    (1, 1, 2),
    (1, 1, 3),
    (1, 1, 4),
    (1, 1, 5),
    (1, 1, 6),
    (1, 2, 1),
    (1, 2, 2),
    (1, 2, 3),
    (1, 2, 4),
    (1, 2, 5),
    (1, 3, 1),
    (1, 3, 2),
    (1, 3, 3),
    (1, 3, 4),
    (1, 3, 5),
    (1, 4, 1),
    (1, 4, 2),
    (1, 4, 3),
    (1, 4, 4),
    (1, 4, 5),
    (1, 5, 1),
    (1, 5, 2),
    (1, 5, 3),
    (1, 5, 4),
    (1, 5, 5),
    (1, 6, 1),
    (1, 6, 2),
    (1, 6, 3),
    (1, 6, 4),
    (1, 6, 5),
    (2, 1, 2),
    (2, 1, 3),
    (2, 1, 4),
    (2, 1, 5),
    (2, 5, 2),
    (2, 5, 3),
    (2, 5, 4),
    (2, 5, 5),
    (2, 6, 2),
    (2, 6, 3),
    (2, 6, 4),
    (2, 6, 5),
    (2, 7, 1),
    (2, 7, 3),
    (2, 7, 4),
    (2, 7, 5),
    (3, 1, 2),
    (3, 1, 3),
    (3, 1, 4),
    (3, 1, 5),
    (3, 5, 2),
    (3, 5, 3),
    (3, 5, 4),
    (3, 5, 5),
    (3, 6, 2),
    (3, 6, 3),
    (3, 6, 4),
    (3, 6, 5),
    (3, 7, 1);

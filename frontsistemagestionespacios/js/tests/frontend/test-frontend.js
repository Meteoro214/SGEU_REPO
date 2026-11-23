/****************************************************************/
/* Archivo: test-frontend.js                                    */
/* Descripción: Contiene las pruebas destinadas a comprobar     */
/* el funcionamiento de los elementos y funcionalidades         */
/* del frontend.                                                */
/****************************************************************/

/*
 * Por cada entidad se definen tres arrays:
 *
 *  <entidad>_def_tests    → [entidad, campo, tipo, NumDef, descripcion, accion, respuestaesperada]
 *  <entidad>_tests_fields → [entidad, campo, NumDef, NumPrueba, accion, [{ campo: valor }], respuestaesperada]
 *  <entidad>_tests_files  → pruebas de campos de tipo fichero (vacío si la entidad no tiene)
 *
 * respuestaesperada es true si el valor es correcto o el código de error
 * '<campo>_min_size_KO', '<campo>_max_size_KO', '<campo>_format_KO'.
 */


// =====================================================================================
// usuarios
// =====================================================================================

let usuarios_def_tests = Array(

    // ==================== ADD ====================

    // dni
    ['usuarios', 'dni', 'input', 1, 'cumple tamaño mínimo', 'ADD', 'dni_min_size_KO'],
    ['usuarios', 'dni', 'input', 2, 'cumple tamaño máximo', 'ADD', 'dni_max_size_KO'],
    ['usuarios', 'dni', 'input', 3, 'cumple formato', 'ADD', 'dni_format_KO'],
    ['usuarios', 'dni', 'input', 4, 'es correcto', 'ADD', true],

    // mail
    ['usuarios', 'mail', 'input', 5, 'cumple tamaño mínimo', 'ADD', 'mail_min_size_KO'],
    ['usuarios', 'mail', 'input', 6, 'cumple tamaño máximo', 'ADD', 'mail_max_size_KO'],
    ['usuarios', 'mail', 'input', 7, 'cumple formato (dominio)', 'ADD', 'mail_format_KO'],
    ['usuarios', 'mail', 'input', 8, 'cumple formato (punto del dominio)', 'ADD', 'mail_format_KO'],
    ['usuarios', 'mail', 'input', 9, 'es correcto', 'ADD', true],

    // nombre_usuario
    ['usuarios', 'nombre_usuario', 'input', 10, 'cumple tamaño mínimo', 'ADD', 'nombre_usuario_min_size_KO'],
    ['usuarios', 'nombre_usuario', 'input', 11, 'cumple tamaño máximo', 'ADD', 'nombre_usuario_max_size_KO'],
    ['usuarios', 'nombre_usuario', 'input', 12, 'cumple formato', 'ADD', 'nombre_usuario_format_KO'],
    ['usuarios', 'nombre_usuario', 'input', 13, 'es correcto', 'ADD', true],

    // apellidos
    ['usuarios', 'apellidos', 'input', 14, 'cumple tamaño mínimo', 'ADD', 'apellidos_min_size_KO'],
    ['usuarios', 'apellidos', 'input', 15, 'cumple tamaño máximo', 'ADD', 'apellidos_max_size_KO'],
    ['usuarios', 'apellidos', 'input', 16, 'cumple formato', 'ADD', 'apellidos_format_KO'],
    ['usuarios', 'apellidos', 'input', 17, 'es correcto', 'ADD', true],

    // telefono
    ['usuarios', 'telefono', 'input', 18, 'cumple tamaño mínimo', 'ADD', 'telefono_min_size_KO'],
    ['usuarios', 'telefono', 'input', 19, 'cumple tamaño máximo', 'ADD', 'telefono_max_size_KO'],
    ['usuarios', 'telefono', 'input', 20, 'cumple formato', 'ADD', 'telefono_format_KO'],
    ['usuarios', 'telefono', 'input', 21, 'es correcto', 'ADD', true],

    // password
    ['usuarios', 'password', 'input', 22, 'cumple tamaño mínimo', 'ADD', 'password_min_size_KO'],
    ['usuarios', 'password', 'input', 23, 'cumple tamaño máximo', 'ADD', 'password_max_size_KO'],
    ['usuarios', 'password', 'input', 24, 'cumple formato', 'ADD', 'password_format_KO'],
    ['usuarios', 'password', 'input', 25, 'es correcto', 'ADD', true],

    // ==================== EDIT ====================

    // dni
    ['usuarios', 'dni', 'input', 26, 'cumple tamaño mínimo', 'EDIT', 'dni_min_size_KO'],
    ['usuarios', 'dni', 'input', 27, 'cumple tamaño máximo', 'EDIT', 'dni_max_size_KO'],
    ['usuarios', 'dni', 'input', 28, 'cumple formato', 'EDIT', 'dni_format_KO'],
    ['usuarios', 'dni', 'input', 29, 'es correcto', 'EDIT', true],

    // mail
    ['usuarios', 'mail', 'input', 30, 'cumple tamaño mínimo', 'EDIT', 'mail_min_size_KO'],
    ['usuarios', 'mail', 'input', 31, 'cumple tamaño máximo', 'EDIT', 'mail_max_size_KO'],
    ['usuarios', 'mail', 'input', 32, 'cumple formato (dominio)', 'EDIT', 'mail_format_KO'],
    ['usuarios', 'mail', 'input', 33, 'cumple formato (punto del dominio)', 'EDIT', 'mail_format_KO'],
    ['usuarios', 'mail', 'input', 34, 'es correcto', 'EDIT', true],

    // nombre_usuario
    ['usuarios', 'nombre_usuario', 'input', 35, 'cumple tamaño mínimo', 'EDIT', 'nombre_usuario_min_size_KO'],
    ['usuarios', 'nombre_usuario', 'input', 36, 'cumple tamaño máximo', 'EDIT', 'nombre_usuario_max_size_KO'],
    ['usuarios', 'nombre_usuario', 'input', 37, 'cumple formato', 'EDIT', 'nombre_usuario_format_KO'],
    ['usuarios', 'nombre_usuario', 'input', 38, 'es correcto', 'EDIT', true],

    // apellidos
    ['usuarios', 'apellidos', 'input', 39, 'cumple tamaño mínimo', 'EDIT', 'apellidos_min_size_KO'],
    ['usuarios', 'apellidos', 'input', 40, 'cumple tamaño máximo', 'EDIT', 'apellidos_max_size_KO'],
    ['usuarios', 'apellidos', 'input', 41, 'cumple formato', 'EDIT', 'apellidos_format_KO'],
    ['usuarios', 'apellidos', 'input', 42, 'es correcto', 'EDIT', true],

    // telefono
    ['usuarios', 'telefono', 'input', 43, 'cumple tamaño mínimo', 'EDIT', 'telefono_min_size_KO'],
    ['usuarios', 'telefono', 'input', 44, 'cumple tamaño máximo', 'EDIT', 'telefono_max_size_KO'],
    ['usuarios', 'telefono', 'input', 45, 'cumple formato', 'EDIT', 'telefono_format_KO'],
    ['usuarios', 'telefono', 'input', 46, 'es correcto', 'EDIT', true],

    // password
    ['usuarios', 'password', 'input', 47, 'cumple tamaño mínimo', 'EDIT', 'password_min_size_KO'],
    ['usuarios', 'password', 'input', 48, 'cumple tamaño máximo', 'EDIT', 'password_max_size_KO'],
    ['usuarios', 'password', 'input', 49, 'cumple formato', 'EDIT', 'password_format_KO'],
    ['usuarios', 'password', 'input', 50, 'es correcto', 'EDIT', true],

    // ==================== SEARCH ====================

    // dni
    ['usuarios', 'dni', 'input', 51, 'es correcto vacío', 'SEARCH', true],
    ['usuarios', 'dni', 'input', 52, 'es correcto como substring', 'SEARCH', true],
    ['usuarios', 'dni', 'input', 53, 'cumple tamaño máximo', 'SEARCH', 'dni_max_size_KO'],
    ['usuarios', 'dni', 'input', 54, 'cumple formato', 'SEARCH', 'dni_format_KO'],

    // mail
    ['usuarios', 'mail', 'input', 55, 'es correcto vacío', 'SEARCH', true],
    ['usuarios', 'mail', 'input', 56, 'es correcto como substring', 'SEARCH', true],
    ['usuarios', 'mail', 'input', 57, 'cumple tamaño máximo', 'SEARCH', 'mail_max_size_KO'],

    // nombre_usuario
    ['usuarios', 'nombre_usuario', 'input', 58, 'es correcto vacío', 'SEARCH', true],
    ['usuarios', 'nombre_usuario', 'input', 59, 'cumple tamaño máximo', 'SEARCH', 'nombre_usuario_max_size_KO'],

    // apellidos
    ['usuarios', 'apellidos', 'input', 60, 'es correcto vacío', 'SEARCH', true],
    ['usuarios', 'apellidos', 'input', 61, 'cumple tamaño máximo', 'SEARCH', 'apellidos_max_size_KO'],

    // telefono
    ['usuarios', 'telefono', 'input', 62, 'es correcto vacío', 'SEARCH', true],
    ['usuarios', 'telefono', 'input', 63, 'es correcto como substring', 'SEARCH', true],
    ['usuarios', 'telefono', 'input', 64, 'cumple tamaño máximo', 'SEARCH', 'telefono_max_size_KO'],
    ['usuarios', 'telefono', 'input', 65, 'cumple formato', 'SEARCH', 'telefono_format_KO'],

    // ==================== LOGIN ====================

    // mail
    ['usuarios', 'mail', 'input', 66, 'cumple tamaño mínimo', 'LOGIN', 'mail_min_size_KO'],
    ['usuarios', 'mail', 'input', 67, 'cumple tamaño máximo', 'LOGIN', 'mail_max_size_KO'],
    ['usuarios', 'mail', 'input', 68, 'cumple formato (dominio)', 'LOGIN', 'mail_format_KO'],
    ['usuarios', 'mail', 'input', 69, 'cumple formato (punto del dominio)', 'LOGIN', 'mail_format_KO'],
    ['usuarios', 'mail', 'input', 70, 'es correcto', 'LOGIN', true],

    // password
    ['usuarios', 'password', 'input', 71, 'cumple tamaño mínimo', 'LOGIN', 'password_min_size_KO'],
    ['usuarios', 'password', 'input', 72, 'cumple tamaño máximo', 'LOGIN', 'password_max_size_KO'],
    ['usuarios', 'password', 'input', 73, 'cumple formato', 'LOGIN', 'password_format_KO'],
    ['usuarios', 'password', 'input', 74, 'es correcto', 'LOGIN', true]

);

let usuarios_tests_fields = Array(

    // ==================== ADD ====================

    // dni
    ['usuarios', 'dni', 1, 1, 'ADD', [{ dni: '1234' }], 'dni_min_size_KO'],
    ['usuarios', 'dni', 2, 2, 'ADD', [{ dni: '1234567890' }], 'dni_max_size_KO'],
    ['usuarios', 'dni', 3, 3, 'ADD', [{ dni: '1234567AB' }], 'dni_format_KO'],
    ['usuarios', 'dni', 4, 4, 'ADD', [{ dni: '12345678A' }], true],

    // mail
    ['usuarios', 'mail', 5, 5, 'ADD', [{ mail: 'a@uvigo.e' }], 'mail_min_size_KO'],
    ['usuarios', 'mail', 6, 6, 'ADD', [{ mail: 'a'.repeat(92) + '@uvigo.es' }], 'mail_max_size_KO'],
    ['usuarios', 'mail', 7, 7, 'ADD', [{ mail: 'ana.perez@gmail.com' }], 'mail_format_KO'],
    ['usuarios', 'mail', 8, 8, 'ADD', [{ mail: 'ana.perez@uvigoXes' }], 'mail_format_KO'],
    ['usuarios', 'mail', 9, 9, 'ADD', [{ mail: 'ana.perez@uvigo.es' }], true],

    // nombre_usuario
    ['usuarios', 'nombre_usuario', 10, 10, 'ADD', [{ nombre_usuario: 'A' }], 'nombre_usuario_min_size_KO'],
    ['usuarios', 'nombre_usuario', 11, 11, 'ADD', [{ nombre_usuario: 'A'.repeat(26) }], 'nombre_usuario_max_size_KO'],
    ['usuarios', 'nombre_usuario', 12, 12, 'ADD', [{ nombre_usuario: 'Ana1' }], 'nombre_usuario_format_KO'],
    ['usuarios', 'nombre_usuario', 13, 13, 'ADD', [{ nombre_usuario: 'María José' }], true],

    // apellidos
    ['usuarios', 'apellidos', 14, 14, 'ADD', [{ apellidos: 'P' }], 'apellidos_min_size_KO'],
    ['usuarios', 'apellidos', 15, 15, 'ADD', [{ apellidos: 'P'.repeat(101) }], 'apellidos_max_size_KO'],
    ['usuarios', 'apellidos', 16, 16, 'ADD', [{ apellidos: 'Pérez 2' }], 'apellidos_format_KO'],
    ['usuarios', 'apellidos', 17, 17, 'ADD', [{ apellidos: "Pérez O'Neill" }], true],

    // telefono
    ['usuarios', 'telefono', 18, 18, 'ADD', [{ telefono: '61234' }], 'telefono_min_size_KO'],
    ['usuarios', 'telefono', 19, 19, 'ADD', [{ telefono: '6123456789' }], 'telefono_max_size_KO'],
    ['usuarios', 'telefono', 20, 20, 'ADD', [{ telefono: '61234567A' }], 'telefono_format_KO'],
    ['usuarios', 'telefono', 21, 21, 'ADD', [{ telefono: '612345678' }], true],

    // password
    ['usuarios', 'password', 22, 22, 'ADD', [{ password: 'abc' }], 'password_min_size_KO'],
    ['usuarios', 'password', 23, 23, 'ADD', [{ password: 'a'.repeat(21) }], 'password_max_size_KO'],
    ['usuarios', 'password', 24, 24, 'ADD', [{ password: 'clave_123' }], 'password_format_KO'],
    ['usuarios', 'password', 25, 25, 'ADD', [{ password: 'Clave123' }], true],

    // ==================== EDIT ====================

    // dni
    ['usuarios', 'dni', 26, 26, 'EDIT', [{ dni: '1234' }], 'dni_min_size_KO'],
    ['usuarios', 'dni', 27, 27, 'EDIT', [{ dni: '1234567890' }], 'dni_max_size_KO'],
    ['usuarios', 'dni', 28, 28, 'EDIT', [{ dni: '1234567AB' }], 'dni_format_KO'],
    ['usuarios', 'dni', 29, 29, 'EDIT', [{ dni: '12345678A' }], true],

    // mail
    ['usuarios', 'mail', 30, 30, 'EDIT', [{ mail: 'a@uvigo.e' }], 'mail_min_size_KO'],
    ['usuarios', 'mail', 31, 31, 'EDIT', [{ mail: 'a'.repeat(92) + '@uvigo.es' }], 'mail_max_size_KO'],
    ['usuarios', 'mail', 32, 32, 'EDIT', [{ mail: 'ana.perez@gmail.com' }], 'mail_format_KO'],
    ['usuarios', 'mail', 33, 33, 'EDIT', [{ mail: 'ana.perez@uvigoXes' }], 'mail_format_KO'],
    ['usuarios', 'mail', 34, 34, 'EDIT', [{ mail: 'ana.perez@uvigo.es' }], true],

    // nombre_usuario
    ['usuarios', 'nombre_usuario', 35, 35, 'EDIT', [{ nombre_usuario: 'A' }], 'nombre_usuario_min_size_KO'],
    ['usuarios', 'nombre_usuario', 36, 36, 'EDIT', [{ nombre_usuario: 'A'.repeat(26) }], 'nombre_usuario_max_size_KO'],
    ['usuarios', 'nombre_usuario', 37, 37, 'EDIT', [{ nombre_usuario: 'Ana1' }], 'nombre_usuario_format_KO'],
    ['usuarios', 'nombre_usuario', 38, 38, 'EDIT', [{ nombre_usuario: 'María José' }], true],

    // apellidos
    ['usuarios', 'apellidos', 39, 39, 'EDIT', [{ apellidos: 'P' }], 'apellidos_min_size_KO'],
    ['usuarios', 'apellidos', 40, 40, 'EDIT', [{ apellidos: 'P'.repeat(101) }], 'apellidos_max_size_KO'],
    ['usuarios', 'apellidos', 41, 41, 'EDIT', [{ apellidos: 'Pérez 2' }], 'apellidos_format_KO'],
    ['usuarios', 'apellidos', 42, 42, 'EDIT', [{ apellidos: "Pérez O'Neill" }], true],

    // telefono
    ['usuarios', 'telefono', 43, 43, 'EDIT', [{ telefono: '61234' }], 'telefono_min_size_KO'],
    ['usuarios', 'telefono', 44, 44, 'EDIT', [{ telefono: '6123456789' }], 'telefono_max_size_KO'],
    ['usuarios', 'telefono', 45, 45, 'EDIT', [{ telefono: '61234567A' }], 'telefono_format_KO'],
    ['usuarios', 'telefono', 46, 46, 'EDIT', [{ telefono: '612345678' }], true],

    // password
    ['usuarios', 'password', 47, 47, 'EDIT', [{ password: 'abc' }], 'password_min_size_KO'],
    ['usuarios', 'password', 48, 48, 'EDIT', [{ password: 'a'.repeat(21) }], 'password_max_size_KO'],
    ['usuarios', 'password', 49, 49, 'EDIT', [{ password: 'clave_123' }], 'password_format_KO'],
    ['usuarios', 'password', 50, 50, 'EDIT', [{ password: 'Clave123' }], true],

    // ==================== SEARCH ====================

    // dni
    ['usuarios', 'dni', 51, 51, 'SEARCH', [{ dni: '' }], true],
    ['usuarios', 'dni', 52, 52, 'SEARCH', [{ dni: '1234' }], true],
    ['usuarios', 'dni', 53, 53, 'SEARCH', [{ dni: '1234567890' }], 'dni_max_size_KO'],
    ['usuarios', 'dni', 54, 54, 'SEARCH', [{ dni: 'ABC' }], 'dni_format_KO'],

    // mail
    ['usuarios', 'mail', 55, 55, 'SEARCH', [{ mail: '' }], true],
    ['usuarios', 'mail', 56, 56, 'SEARCH', [{ mail: 'ana' }], true],
    ['usuarios', 'mail', 57, 57, 'SEARCH', [{ mail: 'a'.repeat(101) }], 'mail_max_size_KO'],

    // nombre_usuario
    ['usuarios', 'nombre_usuario', 58, 58, 'SEARCH', [{ nombre_usuario: '' }], true],
    ['usuarios', 'nombre_usuario', 59, 59, 'SEARCH', [{ nombre_usuario: 'A'.repeat(26) }], 'nombre_usuario_max_size_KO'],

    // apellidos
    ['usuarios', 'apellidos', 60, 60, 'SEARCH', [{ apellidos: '' }], true],
    ['usuarios', 'apellidos', 61, 61, 'SEARCH', [{ apellidos: 'P'.repeat(101) }], 'apellidos_max_size_KO'],

    // telefono
    ['usuarios', 'telefono', 62, 62, 'SEARCH', [{ telefono: '' }], true],
    ['usuarios', 'telefono', 63, 63, 'SEARCH', [{ telefono: '612' }], true],
    ['usuarios', 'telefono', 64, 64, 'SEARCH', [{ telefono: '6123456789' }], 'telefono_max_size_KO'],
    ['usuarios', 'telefono', 65, 65, 'SEARCH', [{ telefono: 'abc' }], 'telefono_format_KO'],

    // ==================== LOGIN ====================
    
    // mail
    ['usuarios', 'mail', 66, 66, 'LOGIN', [{ mail: 'a@uvigo.e' }], 'mail_min_size_KO'],
    ['usuarios', 'mail', 67, 67, 'LOGIN', [{ mail: 'a'.repeat(92) + '@uvigo.es' }], 'mail_max_size_KO'],
    ['usuarios', 'mail', 68, 68, 'LOGIN', [{ mail: 'ana.perez@gmail.com' }], 'mail_format_KO'],
    ['usuarios', 'mail', 69, 69, 'LOGIN', [{ mail: 'ana.perez@uvigoXes' }], 'mail_format_KO'],
    ['usuarios', 'mail', 70, 70, 'LOGIN', [{ mail: 'ana.perez@uvigo.es' }], true],

    // password
    ['usuarios', 'password', 71, 71, 'LOGIN', [{ password: 'abc' }], 'password_min_size_KO'],
    ['usuarios', 'password', 72, 72, 'LOGIN', [{ password: 'a'.repeat(21) }], 'password_max_size_KO'],
    ['usuarios', 'password', 73, 73, 'LOGIN', [{ password: 'clave_123' }], 'password_format_KO'],
    ['usuarios', 'password', 74, 74, 'LOGIN', [{ password: 'Clave123' }], true]
);

// usuarios no tiene ningún campo de tipo fichero.
let usuarios_tests_files = Array();

let facultades_def_tests = Array(

    // ==================== ADD ====================

    // nombre
    ['facultades', 'nombre_facultad', 'input', 1, 'cumple tamaño mínimo', 'ADD', 'nombre_facultad_min_size_KO'],
    ['facultades', 'nombre_facultad', 'input', 2, 'cumple tamaño máximo', 'ADD', 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 'input', 3, 'cumple formato', 'ADD', 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 'input', 4, 'es correcto', 'ADD', true],

    // anho_academico_facultad
    ['facultades', 'anho_academico_facultad', 'input', 5, 'cumple tamaño mínimo', 'ADD', 'anho_academico_facultad_min_size_KO'],
    ['facultades', 'anho_academico_facultad', 'input', 6, 'cumple tamaño máximo', 'ADD', 'anho_academico_facultad_max_size_KO'],
    ['facultades', 'anho_academico_facultad', 'input', 7, 'cumple formato', 'ADD', 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 'input', 8, 'es correcto', 'ADD', true],

    
    // ==================== EDIT ====================

    // nombre
    ['facultades', 'nombre_facultad', 'input', 9, 'cumple tamaño mínimo', 'EDIT', 'nombre_facultad_min_size_KO'],
    ['facultades', 'nombre_facultad', 'input', 10, 'cumple tamaño máximo', 'EDIT', 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 'input', 11, 'cumple formato', 'EDIT', 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 'input', 12, 'es correcto', 'EDIT', true],

    // anho_academico_facultad
    ['facultades', 'anho_academico_facultad', 'input', 13, 'cumple tamaño mínimo', 'EDIT', 'anho_academico_facultad_min_size_KO'],
    ['facultades', 'anho_academico_facultad', 'input', 14, 'cumple tamaño máximo', 'EDIT', 'anho_academico_facultad_max_size_KO'],
    ['facultades', 'anho_academico_facultad', 'input', 15, 'cumple formato', 'EDIT', 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 'input', 16, 'es correcto', 'EDIT', true],

    
    // ==================== SEARCH ====================

    // nombre
    ['facultades', 'nombre_facultad', 'input', 17, 'cumple tamaño máximo', 'SEARCH', 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 'input', 18, 'cumple formato', 'SEARCH', 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 'input', 19, 'es correcto', 'SEARCH', true],

    // anho_academico_facultad
    ['facultades', 'anho_academico_facultad', 'input', 20, 'cumple tamaño máximo', 'SEARCH', 'anho_academico_facultad_max_size_KO'],
    ['facultades', 'anho_academico_facultad', 'input', 21, 'cumple formato', 'SEARCH', 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 'input', 22, 'es correcto', 'SEARCH', true]
)

let facultades_tests_fields = Array (
    
    // ==================== ADD ====================

    // nombre
    ['facultades', 'nombre_facultad', 1, 1, 'ADD', [{ nombre_facultad: '' }], 'nombre_facultad_min_size_KO'],
    ['facultades', 'nombre_facultad', 1, 2, 'ADD', [{ nombre_facultad: 'F' }], 'nombre_facultad_min_size_KO'],
    ['facultades', 'nombre_facultad', 1, 3, 'ADD', [{ nombre_facultad: 'Fa' }], 'nombre_facultad_min_size_KO'],

    ['facultades', 'nombre_facultad', 2, 4, 'ADD', [{ nombre_facultad: 'F'.repeat(101) }], 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 2, 5, 'ADD', [{ nombre_facultad: 'F'.repeat(102) }], 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 2, 6, 'ADD', [{ nombre_facultad: 'F'.repeat(103) }], 'nombre_facultad_max_size_KO'],

    ['facultades', 'nombre_facultad', 3, 7, 'ADD', [{ nombre_facultad: 'Fa1' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 3, 8, 'ADD', [{ nombre_facultad: 'Fa-' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 3, 9, 'ADD', [{ nombre_facultad: 'Fa/' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 3, 10, 'ADD', [{ nombre_facultad: 'Fa@' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 3, 11, 'ADD', [{ nombre_facultad: 'Fa#' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 3, 12, 'ADD', [{ nombre_facultad: 'Fa_' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 3, 13, 'ADD', [{ nombre_facultad: 'Fa.' }], 'nombre_facultad_format_KO'],

    ['facultades', 'nombre_facultad', 4, 14, 'ADD', [{ nombre_facultad: 'Fac' }], true],
    ['facultades', 'nombre_facultad', 4, 15, 'ADD', [{ nombre_facultad: 'Facu' }], true],
    ['facultades', 'nombre_facultad', 4, 16, 'ADD', [{ nombre_facultad: 'F'.repeat(99) }], true],
    ['facultades', 'nombre_facultad', 4, 17, 'ADD', [{ nombre_facultad: 'F'.repeat(100) }], true],
    ['facultades', 'nombre_facultad', 4, 18, 'ADD', [{ nombre_facultad: 'Facultad de Ciencias' }], true],

    // anho_academico_facultad
    ['facultades', 'anho_academico_facultad', 5, 19, 'ADD', [{ anho_academico_facultad: '2026' }], 'anho_academico_facultad_min_size_KO'],
    ['facultades', 'anho_academico_facultad', 5, 20, 'ADD', [{ anho_academico_facultad: '25-26' }], 'anho_academico_facultad_min_size_KO'],
    ['facultades', 'anho_academico_facultad', 5, 21, 'ADD', [{ anho_academico_facultad: '2026-26' }], 'anho_academico_facultad_min_size_KO'],

    ['facultades', 'anho_academico_facultad', 6, 22, 'ADD', [{ anho_academico_facultad: '2026-2027-2028' }], 'anho_academico_facultad_max_size_KO'],

    ['facultades', 'anho_academico_facultad', 7, 23, 'ADD', [{ anho_academico_facultad: '2025-2026' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 7, 24, 'ADD', [{ anho_academico_facultad: '2026/2026' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 7, 25, 'ADD', [{ anho_academico_facultad: '2026:2026' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 7, 26, 'ADD', [{ anho_academico_facultad: '2026-202a' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 7, 27, 'ADD', [{ anho_academico_facultad: '2026-2028' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 7, 28, 'ADD', [{ anho_academico_facultad: '2026-2026' }], 'anho_academico_facultad_format_KO'],

    ['facultades', 'anho_academico_facultad', 8, 29, 'ADD', [{ anho_academico_facultad: '2026-2027' }], true],
    ['facultades', 'anho_academico_facultad', 8, 30, 'ADD', [{ anho_academico_facultad: '2027-2028' }], true],


    // ==================== EDIT ====================

    // nombre
    ['facultades', 'nombre_facultad', 9, 31, 'EDIT', [{ nombre_facultad: '' }], 'nombre_facultad_min_size_KO'],
    ['facultades', 'nombre_facultad', 9, 32, 'EDIT', [{ nombre_facultad: 'F' }], 'nombre_facultad_min_size_KO'],
    ['facultades', 'nombre_facultad', 9, 33, 'EDIT', [{ nombre_facultad: 'Fa' }], 'nombre_facultad_min_size_KO'],

    ['facultades', 'nombre_facultad', 10, 34, 'EDIT', [{ nombre_facultad: 'F'.repeat(101) }], 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 10, 35, 'EDIT', [{ nombre_facultad: 'F'.repeat(102) }], 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 10, 36, 'EDIT', [{ nombre_facultad: 'F'.repeat(103) }], 'nombre_facultad_max_size_KO'],

    ['facultades', 'nombre_facultad', 11, 37, 'EDIT', [{ nombre_facultad: 'Fa1' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 11, 38, 'EDIT', [{ nombre_facultad: 'Fa-' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 11, 39, 'EDIT', [{ nombre_facultad: 'Fa/' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 11, 40, 'EDIT', [{ nombre_facultad: 'Fa@' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 11, 41, 'EDIT', [{ nombre_facultad: 'Fa#' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 11, 42, 'EDIT', [{ nombre_facultad: 'Fa_' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 11, 43, 'EDIT', [{ nombre_facultad: 'Fa.' }], 'nombre_facultad_format_KO'],

    ['facultades', 'nombre_facultad', 12, 44, 'EDIT', [{ nombre_facultad: 'Fac' }], true],
    ['facultades', 'nombre_facultad', 12, 45, 'EDIT', [{ nombre_facultad: 'Facu' }], true],
    ['facultades', 'nombre_facultad', 12, 46, 'EDIT', [{ nombre_facultad: 'F'.repeat(99) }], true],
    ['facultades', 'nombre_facultad', 12, 47, 'EDIT', [{ nombre_facultad: 'F'.repeat(100) }], true],
    ['facultades', 'nombre_facultad', 12, 48, 'EDIT', [{ nombre_facultad: 'Facultad de Ciencias' }], true],

    // anho_academico_facultad
    ['facultades', 'anho_academico_facultad', 13, 49, 'EDIT', [{ anho_academico_facultad: '2026' }], 'anho_academico_facultad_min_size_KO'],
    ['facultades', 'anho_academico_facultad', 13, 50, 'EDIT', [{ anho_academico_facultad: '26-27' }], 'anho_academico_facultad_min_size_KO'],
    ['facultades', 'anho_academico_facultad', 13, 51, 'EDIT', [{ anho_academico_facultad: '2026-27' }], 'anho_academico_facultad_min_size_KO'],

    ['facultades', 'anho_academico_facultad', 14, 52, 'EDIT', [{ anho_academico_facultad: '2026-2026-2028' }], 'anho_academico_facultad_max_size_KO'],
    ['facultades', 'anho_academico_facultad', 14, 53, 'EDIT', [{ anho_academico_facultad: '2026-2026-2028' }], 'anho_academico_facultad_max_size_KO'],

    ['facultades', 'anho_academico_facultad', 15, 54, 'EDIT', [{ anho_academico_facultad: '2026/2026' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 15, 55, 'EDIT', [{ anho_academico_facultad: '2026:2026' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 15, 56, 'EDIT', [{ anho_academico_facultad: '2026-202a' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 15, 57, 'EDIT', [{ anho_academico_facultad: '2026-2028' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 15, 58, 'EDIT', [{ anho_academico_facultad: '2026-2026' }], 'anho_academico_facultad_format_KO'],

    ['facultades', 'anho_academico_facultad', 16, 59, 'EDIT', [{ anho_academico_facultad: '2026-2027' }], true],
    ['facultades', 'anho_academico_facultad', 16, 60, 'EDIT', [{ anho_academico_facultad: '2027-2028' }], true],


    // ==================== SEARCH ====================

    // nombre
    ['facultades', 'nombre_facultad', 17, 61, 'SEARCH', [{ nombre_facultad: 'F'.repeat(101) }], 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 17, 62, 'SEARCH', [{ nombre_facultad: 'F'.repeat(102) }], 'nombre_facultad_max_size_KO'],
    ['facultades', 'nombre_facultad', 17, 63, 'SEARCH', [{ nombre_facultad: 'F'.repeat(103) }], 'nombre_facultad_max_size_KO'],

    ['facultades', 'nombre_facultad', 18, 64, 'SEARCH', [{ nombre_facultad: 'Fa1' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 18, 65, 'SEARCH', [{ nombre_facultad: 'Fa-' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 18, 66, 'SEARCH', [{ nombre_facultad: 'Fa/' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 18, 67, 'SEARCH', [{ nombre_facultad: 'Fa@' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 18, 68, 'SEARCH', [{ nombre_facultad: 'Fa#' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 18, 69, 'SEARCH', [{ nombre_facultad: 'Fa_' }], 'nombre_facultad_format_KO'],
    ['facultades', 'nombre_facultad', 18, 70, 'SEARCH', [{ nombre_facultad: 'Fa.' }], 'nombre_facultad_format_KO'],

    ['facultades', 'nombre_facultad', 19, 71, 'SEARCH', [{ nombre_facultad: '' }], true],
    ['facultades', 'nombre_facultad', 19, 72, 'SEARCH', [{ nombre_facultad: 'Fac' }], true],
    ['facultades', 'nombre_facultad', 19, 73, 'SEARCH', [{ nombre_facultad: 'Facu' }], true],
    ['facultades', 'nombre_facultad', 19, 74, 'SEARCH', [{ nombre_facultad: 'F'.repeat(99) }], true],
    ['facultades', 'nombre_facultad', 19, 75, 'SEARCH', [{ nombre_facultad: 'F'.repeat(100) }], true],
    ['facultades', 'nombre_facultad', 19, 76, 'SEARCH', [{ nombre_facultad: 'Facultad de Ciencias' }], true],

    // anho_academico_facultad
    ['facultades', 'anho_academico_facultad', 20, 77, 'SEARCH', [{ anho_academico_facultad: '2026-2026-2028' }], 'anho_academico_facultad_max_size_KO'],
    ['facultades', 'anho_academico_facultad', 20, 78, 'SEARCH', [{ anho_academico_facultad: '2026-2026-2028' }], 'anho_academico_facultad_max_size_KO'],

    ['facultades', 'anho_academico_facultad', 21, 79, 'SEARCH', [{ anho_academico_facultad: '2026/2026' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 21, 80, 'SEARCH', [{ anho_academico_facultad: '2026:2026' }], 'anho_academico_facultad_format_KO'],
    ['facultades', 'anho_academico_facultad', 21, 81, 'SEARCH', [{ anho_academico_facultad: '2026-202a' }], 'anho_academico_facultad_format_KO'],

    ['facultades', 'anho_academico_facultad', 22, 82, 'SEARCH', [{ anho_academico_facultad: '' }], true],
    ['facultades', 'anho_academico_facultad', 22, 83, 'SEARCH', [{ anho_academico_facultad: '19' }], true],
    ['facultades', 'anho_academico_facultad', 22, 84, 'SEARCH', [{ anho_academico_facultad: '1998' }], true],
    ['facultades', 'anho_academico_facultad', 22, 85, 'SEARCH', [{ anho_academico_facultad: '1998-' }], true],
    ['facultades', 'anho_academico_facultad', 22, 86, 'SEARCH', [{ anho_academico_facultad: '1998-2' }], true],
    ['facultades', 'anho_academico_facultad', 22, 87, 'SEARCH', [{ anho_academico_facultad: '1998-1999' }], true],
    ['facultades', 'anho_academico_facultad', 22, 88, 'SEARCH', [{ anho_academico_facultad: '1999-2000' }], true],
    ['facultades', 'anho_academico_facultad', 22, 89, 'SEARCH', [{ anho_academico_facultad: '2026-2026' }], true],
    ['facultades', 'anho_academico_facultad', 22, 90, 'SEARCH', [{ anho_academico_facultad: '2026-2028' }], true]
);

let facultades_tests_files = Array();

let edificios_def_tests = Array(
    // ==================== ADD ====================

    // nombre
    ['edificios', 'nombre_edificio', 'input', 1, 'cumple tamaño mínimo', 'ADD', 'nombre_edificio_min_size_KO'],
    ['edificios', 'nombre_edificio', 'input', 2, 'cumple tamaño máximo', 'ADD', 'nombre_edificio_max_size_KO'],
    ['edificios', 'nombre_edificio', 'input', 3, 'cumple formato', 'ADD', 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 'input', 4, 'es correcto', 'ADD', true],

    // anho_academico_edificio
    ['edificios', 'anho_academico_edificio', 'input', 5, 'cumple tamaño mínimo', 'ADD', 'anho_academico_edificio_min_size_KO'],
    ['edificios', 'anho_academico_edificio', 'input', 6, 'cumple tamaño máximo', 'ADD', 'anho_academico_edificio_max_size_KO'],
    ['edificios', 'anho_academico_edificio', 'input', 7, 'cumple formato', 'ADD', 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 'input', 8, 'es correcto', 'ADD', true],

    // direccion
    ['edificios', 'direccion_edificio', 'input', 9, 'cumple tamaño mínimo', 'ADD', 'direccion_edificio_min_size_KO'],
    ['edificios', 'direccion_edificio', 'input', 10, 'cumple tamaño máximo', 'ADD', 'direccion_edificio_max_size_KO'],
    ['edificios', 'direccion_edificio', 'input', 11, 'cumple formato', 'ADD', 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 'input', 12, 'es correcto', 'ADD', true],

    // telefono
    ['edificios', 'telefono_edificio', 'input', 13, 'es nullable (vacío)', 'ADD', true],
    ['edificios', 'telefono_edificio', 'input', 14, 'cumple tamaño mínimo', 'ADD', 'telefono_edificio_min_size_KO'],
    ['edificios', 'telefono_edificio', 'input', 15, 'cumple tamaño máximo', 'ADD', 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 'input', 16, 'cumple formato', 'ADD', 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 'input', 17, 'es correcto', 'ADD', true],


    // ==================== EDIT ====================

    // nombre
    ['edificios', 'nombre_edificio', 'input', 18, 'cumple tamaño mínimo', 'EDIT', 'nombre_edificio_min_size_KO'],
    ['edificios', 'nombre_edificio', 'input', 19, 'cumple tamaño máximo', 'EDIT', 'nombre_edificio_max_size_KO'],
    ['edificios', 'nombre_edificio', 'input', 20, 'cumple formato', 'EDIT', 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 'input', 21, 'es correcto', 'EDIT', true],

    // anho_academico_edificio
    ['edificios', 'anho_academico_edificio', 'input', 22, 'cumple tamaño mínimo', 'EDIT', 'anho_academico_edificio_min_size_KO'],
    ['edificios', 'anho_academico_edificio', 'input', 23, 'cumple tamaño máximo', 'EDIT', 'anho_academico_edificio_max_size_KO'],
    ['edificios', 'anho_academico_edificio', 'input', 24, 'cumple formato', 'EDIT', 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 'input', 25, 'es correcto', 'EDIT', true],

    // direccion
    ['edificios', 'direccion_edificio', 'input', 26, 'cumple tamaño mínimo', 'EDIT', 'direccion_edificio_min_size_KO'],
    ['edificios', 'direccion_edificio', 'input', 27, 'cumple tamaño máximo', 'EDIT', 'direccion_edificio_max_size_KO'],
    ['edificios', 'direccion_edificio', 'input', 28, 'cumple formato', 'EDIT', 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 'input', 29, 'es correcto', 'EDIT', true],

    // telefono
    ['edificios', 'telefono_edificio', 'input', 30, 'es nullable (vacío)', 'EDIT', true],
    ['edificios', 'telefono_edificio', 'input', 31, 'cumple tamaño mínimo', 'EDIT', 'telefono_edificio_min_size_KO'],
    ['edificios', 'telefono_edificio', 'input', 32, 'cumple tamaño máximo', 'EDIT', 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 'input', 33, 'cumple formato', 'EDIT', 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 'input', 34, 'es correcto', 'EDIT', true],
    

    // ==================== SEARCH ====================

    // nombre
    ['edificios', 'nombre_edificio', 'input', 35, 'cumple tamaño máximo', 'SEARCH', 'nombre_edificio_max_size_KO'],
    ['edificios', 'nombre_edificio', 'input', 36, 'cumple formato', 'SEARCH', 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 'input', 37, 'es correcto', 'SEARCH', true],

    // anho_academico_edificio
    ['edificios', 'anho_academico_edificio', 'input', 38, 'cumple tamaño máximo', 'SEARCH', 'anho_academico_edificio_max_size_KO'],
    ['edificios', 'anho_academico_edificio', 'input', 39, 'cumple formato', 'SEARCH', 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 'input', 40, 'es correcto', 'SEARCH', true],

    // direccion
    ['edificios', 'direccion_edificio', 'input', 41, 'cumple tamaño máximo', 'SEARCH', 'direccion_edificio_max_size_KO'],
    ['edificios', 'direccion_edificio', 'input', 42, 'cumple formato', 'SEARCH', 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 'input', 43, 'es correcto', 'SEARCH', true],

    // telefono
    ['edificios', 'telefono_edificio', 'input', 44, 'cumple tamaño máximo', 'SEARCH', 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 'input', 45, 'cumple formato', 'SEARCH', 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 'input', 46, 'es correcto', 'SEARCH', true]

);

let edificios_tests_fields = Array (

    // ==================== ADD ====================

    // nombre
    ['edificios', 'nombre_edificio', 1, 1, 'ADD', [{ nombre_edificio: '' }], 'nombre_edificio_min_size_KO'],
    ['edificios', 'nombre_edificio', 1, 2, 'ADD', [{ nombre_edificio: 'E' }], 'nombre_edificio_min_size_KO'],
    ['edificios', 'nombre_edificio', 1, 3, 'ADD', [{ nombre_edificio: 'Ed' }], 'nombre_edificio_min_size_KO'],

    ['edificios', 'nombre_edificio', 2, 4, 'ADD', [{ nombre_edificio: 'E'.repeat(101) }], 'nombre_edificio_max_size_KO'],
    ['edificios', 'nombre_edificio', 2, 5, 'ADD', [{ nombre_edificio: 'E'.repeat(102) }], 'nombre_edificio_max_size_KO'],
    ['edificios', 'nombre_edificio', 2, 6, 'ADD', [{ nombre_edificio: 'E'.repeat(103) }], 'nombre_edificio_max_size_KO'],

    ['edificios', 'nombre_edificio', 3, 7, 'ADD', [{ nombre_edificio: 'Ed$' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 3, 8, 'ADD', [{ nombre_edificio: 'Ed-' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 3, 9, 'ADD', [{ nombre_edificio: 'Ed/' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 3, 10, 'ADD', [{ nombre_edificio: 'Ed@' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 3, 11, 'ADD', [{ nombre_edificio: 'Ed#' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 3, 12, 'ADD', [{ nombre_edificio: 'Ed_' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 3, 13, 'ADD', [{ nombre_edificio: 'Ed.' }], 'nombre_edificio_format_KO'],

    ['edificios', 'nombre_edificio', 4, 14, 'ADD', [{ nombre_edificio: 'Edi' }], true],
    ['edificios', 'nombre_edificio', 4, 15, 'ADD', [{ nombre_edificio: 'Edif' }], true],
    ['edificios', 'nombre_edificio', 4, 16, 'ADD', [{ nombre_edificio: 'E'.repeat(99) }], true],
    ['edificios', 'nombre_edificio', 4, 17, 'ADD', [{ nombre_edificio: 'E'.repeat(100) }], true],
    ['edificios', 'nombre_edificio', 4, 18, 'ADD', [{ nombre_edificio: 'Edificio de Ciencias' }], true],

    // anho_academico_edificio
    ['edificios', 'anho_academico_edificio', 5, 19, 'ADD', [{ anho_academico_edificio: '2026' }], 'anho_academico_edificio_min_size_KO'],
    ['edificios', 'anho_academico_edificio', 5, 20, 'ADD', [{ anho_academico_edificio: '25-26' }], 'anho_academico_edificio_min_size_KO'],
    ['edificios', 'anho_academico_edificio', 5, 21, 'ADD', [{ anho_academico_edificio: '2026-26' }], 'anho_academico_edificio_min_size_KO'],

    ['edificios', 'anho_academico_edificio', 6, 22, 'ADD', [{ anho_academico_edificio: '2026-2027-2028' }], 'anho_academico_edificio_max_size_KO'],

    ['edificios', 'anho_academico_edificio', 7, 23, 'ADD', [{ anho_academico_edificio: '2025-2026' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 7, 24, 'ADD', [{ anho_academico_edificio: '2026/2026' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 7, 25, 'ADD', [{ anho_academico_edificio: '2026:2026' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 7, 26, 'ADD', [{ anho_academico_edificio: '2026-202a' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 7, 27, 'ADD', [{ anho_academico_edificio: '2026-2028' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 7, 28, 'ADD', [{ anho_academico_edificio: '2026-2026' }], 'anho_academico_edificio_format_KO'],

    ['edificios', 'anho_academico_edificio', 8, 29, 'ADD', [{ anho_academico_edificio: '2026-2027' }], true],
    ['edificios', 'anho_academico_edificio', 8, 30, 'ADD', [{ anho_academico_edificio: '2027-2028' }], true],

    // direccion
    ['edificios', 'direccion_edificio', 9, 31, 'ADD', [{ direccion_edificio: '' }], 'direccion_edificio_min_size_KO'],
    ['edificios', 'direccion_edificio', 9, 32, 'ADD', [{ direccion_edificio: 'C' }], 'direccion_edificio_min_size_KO'],
    ['edificios', 'direccion_edificio', 9, 33, 'ADD', [{ direccion_edificio: 'Ca' }], 'direccion_edificio_min_size_KO'],

    ['edificios', 'direccion_edificio', 10, 34, 'ADD', [{ direccion_edificio: 'C'.repeat(256) }], 'direccion_edificio_max_size_KO'],
    ['edificios', 'direccion_edificio', 10, 35, 'ADD', [{ direccion_edificio: 'C'.repeat(257) }], 'direccion_edificio_max_size_KO'],
    ['edificios', 'direccion_edificio', 10, 36, 'ADD', [{ direccion_edificio: 'C'.repeat(258) }], 'direccion_edificio_max_size_KO'],

    ['edificios', 'direccion_edificio', 11, 37, 'ADD', [{ direccion_edificio: 'Calle $' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 11, 38, 'ADD', [{ direccion_edificio: 'Calle @' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 11, 39, 'ADD', [{ direccion_edificio: 'Calle #' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 11, 40, 'ADD', [{ direccion_edificio: 'Calle _' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 11, 41, 'ADD', [{ direccion_edificio: 'Calle +' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 11, 42, 'ADD', [{ direccion_edificio: 'Calle *' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 11, 43, 'ADD', [{ direccion_edificio: 'Calle !' }], 'direccion_edificio_format_KO'],

    ['edificios', 'direccion_edificio', 12, 44, 'ADD', [{ direccion_edificio: 'Cal' }], true],
    ['edificios', 'direccion_edificio', 12, 45, 'ADD', [{ direccion_edificio: 'Call' }], true],
    ['edificios', 'direccion_edificio', 12, 46, 'ADD', [{ direccion_edificio: 'C'.repeat(254) }], true],
    ['edificios', 'direccion_edificio', 12, 47, 'ADD', [{ direccion_edificio: 'C'.repeat(255) }], true],
    ['edificios', 'direccion_edificio', 12, 48, 'ADD', [{ direccion_edificio: 'Avda. España 10/12' }], true],
    ['edificios', 'direccion_edificio', 12, 49, 'ADD', [{ direccion_edificio: "Calle O'Higgins 3ª" }], true],
    ['edificios', 'direccion_edificio', 12, 50, 'ADD', [{ direccion_edificio: 'Rúa 5, 2º A' }], true],
    ['edificios', 'direccion_edificio', 12, 51, 'ADD', [{ direccion_edificio: 'Avda. España 10/12' }], true],
    ['edificios', 'direccion_edificio', 12, 52, 'ADD', [{ direccion_edificio: "Calle O'Higgins 3ª" }], true],

    // telefono
    ['edificios', 'telefono_edificio', 13, 53, 'ADD', [{ telefono_edificio: '' }], true],

    
    ['edificios', 'telefono_edificio', 14, 54, 'ADD', [{ telefono_edificio: '6' }], 'telefono_edificio_min_size_KO'],
    ['edificios', 'telefono_edificio', 14, 55, 'ADD', [{ telefono_edificio: '61' }], 'telefono_edificio_min_size_KO'],
    ['edificios', 'telefono_edificio', 14, 56, 'ADD', [{ telefono_edificio: '61234567' }], 'telefono_edificio_min_size_KO'],

    ['edificios', 'telefono_edificio', 15, 57, 'ADD', [{ telefono_edificio: '6123456789' }], 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 15, 58, 'ADD', [{ telefono_edificio: '61234567890' }], 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 15, 59, 'ADD', [{ telefono_edificio: '612345678901' }], 'telefono_edificio_max_size_KO'],

    ['edificios', 'telefono_edificio', 16, 60, 'ADD', [{ telefono_edificio: '61234567a' }], 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 16, 61, 'ADD', [{ telefono_edificio: '6123456ab' }], 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 16, 62, 'ADD', [{ telefono_edificio: '612-45678' }], 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 16, 63, 'ADD', [{ telefono_edificio: '612 45678' }], 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 16, 64, 'ADD', [{ telefono_edificio: '+34612345' }], 'telefono_edificio_format_KO'],

    ['edificios', 'telefono_edificio', 17, 65, 'ADD', [{ telefono_edificio: '612345678' }], true],
    ['edificios', 'telefono_edificio', 17, 66, 'ADD', [{ telefono_edificio: '987654321' }], true],
    

    // ==================== EDIT ====================

    // nombre
    ['edificios', 'nombre_edificio', 18, 67, 'EDIT', [{ nombre_edificio: '' }], 'nombre_edificio_min_size_KO'],
    ['edificios', 'nombre_edificio', 18, 68, 'EDIT', [{ nombre_edificio: 'E' }], 'nombre_edificio_min_size_KO'],
    ['edificios', 'nombre_edificio', 18, 69, 'EDIT', [{ nombre_edificio: 'Ed' }], 'nombre_edificio_min_size_KO'],

    ['edificios', 'nombre_edificio', 19, 70, 'EDIT', [{ nombre_edificio: 'E'.repeat(101) }], 'nombre_edificio_max_size_KO'],
    ['edificios', 'nombre_edificio', 19, 71, 'EDIT', [{ nombre_edificio: 'E'.repeat(102) }], 'nombre_edificio_max_size_KO'],
    ['edificios', 'nombre_edificio', 19, 72, 'EDIT', [{ nombre_edificio: 'E'.repeat(103) }], 'nombre_edificio_max_size_KO'],

    ['edificios', 'nombre_edificio', 20, 73, 'EDIT', [{ nombre_edificio: 'Ed$' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 20, 74, 'EDIT', [{ nombre_edificio: 'Ed-' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 20, 75, 'EDIT', [{ nombre_edificio: 'Ed/' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 20, 76, 'EDIT', [{ nombre_edificio: 'Ed@' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 20, 77, 'EDIT', [{ nombre_edificio: 'Ed#' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 20, 78, 'EDIT', [{ nombre_edificio: 'Ed_' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 20, 79, 'EDIT', [{ nombre_edificio: 'Ed.' }], 'nombre_edificio_format_KO'],

    ['edificios', 'nombre_edificio', 21, 80, 'EDIT', [{ nombre_edificio: 'Edi' }], true],
    ['edificios', 'nombre_edificio', 21, 81, 'EDIT', [{ nombre_edificio: 'Edif' }], true],
    ['edificios', 'nombre_edificio', 21, 82, 'EDIT', [{ nombre_edificio: 'E'.repeat(99) }], true],
    ['edificios', 'nombre_edificio', 21, 83, 'EDIT', [{ nombre_edificio: 'E'.repeat(100) }], true],
    ['edificios', 'nombre_edificio', 21, 84, 'EDIT', [{ nombre_edificio: 'Edificio de Ciencias' }], true],

    // anho_academico_edificio
    ['edificios', 'anho_academico_edificio', 22, 85, 'EDIT', [{ anho_academico_edificio: '2026' }], 'anho_academico_edificio_min_size_KO'],
    ['edificios', 'anho_academico_edificio', 22, 86, 'EDIT', [{ anho_academico_edificio: '25-26' }], 'anho_academico_edificio_min_size_KO'],
    ['edificios', 'anho_academico_edificio', 22, 87, 'EDIT', [{ anho_academico_edificio: '2026-26' }], 'anho_academico_edificio_min_size_KO'],

    ['edificios', 'anho_academico_edificio', 23, 88, 'EDIT', [{ anho_academico_edificio: '2026-2027-2028' }], 'anho_academico_edificio_max_size_KO'],

    ['edificios', 'anho_academico_edificio', 24, 89, 'EDIT', [{ anho_academico_edificio: '2025-2026' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 24, 90, 'EDIT', [{ anho_academico_edificio: '2026/2026' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 24, 91, 'EDIT', [{ anho_academico_edificio: '2026:2026' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 24, 92, 'EDIT', [{ anho_academico_edificio: '2026-202a' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 24, 93, 'EDIT', [{ anho_academico_edificio: '2026-2028' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 24, 94, 'EDIT', [{ anho_academico_edificio: '2026-2026' }], 'anho_academico_edificio_format_KO'],

    ['edificios', 'anho_academico_edificio', 25, 95, 'EDIT', [{ anho_academico_edificio: '2026-2027' }], true],
    ['edificios', 'anho_academico_edificio', 25, 96, 'EDIT', [{ anho_academico_edificio: '2027-2028' }], true],

    // direccion
    ['edificios', 'direccion_edificio', 26, 97, 'EDIT', [{ direccion_edificio: '' }], 'direccion_edificio_min_size_KO'],
    ['edificios', 'direccion_edificio', 26, 98, 'EDIT', [{ direccion_edificio: 'C' }], 'direccion_edificio_min_size_KO'],
    ['edificios', 'direccion_edificio', 26, 99, 'EDIT', [{ direccion_edificio: 'Ca' }], 'direccion_edificio_min_size_KO'],

    ['edificios', 'direccion_edificio', 27, 100, 'EDIT', [{ direccion_edificio: 'C'.repeat(256) }], 'direccion_edificio_max_size_KO'],
    ['edificios', 'direccion_edificio', 27, 101, 'EDIT', [{ direccion_edificio: 'C'.repeat(257) }], 'direccion_edificio_max_size_KO'],
    ['edificios', 'direccion_edificio', 27, 102, 'EDIT', [{ direccion_edificio: 'C'.repeat(258) }], 'direccion_edificio_max_size_KO'],

    ['edificios', 'direccion_edificio', 28, 103, 'EDIT', [{ direccion_edificio: 'Calle $' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 28, 104, 'EDIT', [{ direccion_edificio: 'Calle @' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 28, 105, 'EDIT', [{ direccion_edificio: 'Calle #' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 28, 106, 'EDIT', [{ direccion_edificio: 'Calle _' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 28, 107, 'EDIT', [{ direccion_edificio: 'Calle +' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 28, 108, 'EDIT', [{ direccion_edificio: 'Calle *' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 28, 109, 'EDIT', [{ direccion_edificio: 'Calle !' }], 'direccion_edificio_format_KO'],

    ['edificios', 'direccion_edificio', 29, 110, 'EDIT', [{ direccion_edificio: 'Cal' }], true],
    ['edificios', 'direccion_edificio', 29, 111, 'EDIT', [{ direccion_edificio: 'Call' }], true],
    ['edificios', 'direccion_edificio', 29, 112, 'EDIT', [{ direccion_edificio: 'C'.repeat(254) }], true],
    ['edificios', 'direccion_edificio', 29, 113, 'EDIT', [{ direccion_edificio: 'C'.repeat(255) }], true],
    ['edificios', 'direccion_edificio', 29, 114, 'EDIT', [{ direccion_edificio: 'Avda. España 10/12' }], true],
    ['edificios', 'direccion_edificio', 29, 115, 'EDIT', [{ direccion_edificio: "Calle O'Higgins 3ª" }], true],
    ['edificios', 'direccion_edificio', 29, 116, 'EDIT', [{ direccion_edificio: 'Rúa 5, 2º A' }], true],
    ['edificios', 'direccion_edificio', 29, 117, 'EDIT', [{ direccion_edificio: 'Avda. España 10/12' }], true],
    ['edificios', 'direccion_edificio', 29, 118, 'EDIT', [{ direccion_edificio: "Calle O'Higgins 3ª" }], true],

    // telefono
    ['edificios', 'telefono_edificio', 30, 119, 'EDIT', [{ telefono_edificio: '' }], true],

    
    ['edificios', 'telefono_edificio', 31, 120, 'EDIT', [{ telefono_edificio: '6' }], 'telefono_edificio_min_size_KO'],
    ['edificios', 'telefono_edificio', 31, 121, 'EDIT', [{ telefono_edificio: '61' }], 'telefono_edificio_min_size_KO'],
    ['edificios', 'telefono_edificio', 31, 122, 'EDIT', [{ telefono_edificio: '61234567' }], 'telefono_edificio_min_size_KO'],

    ['edificios', 'telefono_edificio', 32, 123, 'EDIT', [{ telefono_edificio: '6123456789' }], 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 32, 124, 'EDIT', [{ telefono_edificio: '61234567890' }], 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 32, 125, 'EDIT', [{ telefono_edificio: '612345678901' }], 'telefono_edificio_max_size_KO'],

    ['edificios', 'telefono_edificio', 33, 126, 'EDIT', [{ telefono_edificio: '61234567a' }], 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 33, 127, 'EDIT', [{ telefono_edificio: '6123456ab' }], 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 33, 128, 'EDIT', [{ telefono_edificio: '612-45678' }], 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 33, 129, 'EDIT', [{ telefono_edificio: '612 45678' }], 'telefono_edificio_format_KO'],
    ['edificios', 'telefono_edificio', 33, 130, 'EDIT', [{ telefono_edificio: '+34612345' }], 'telefono_edificio_format_KO'],

    ['edificios', 'telefono_edificio', 34, 131, 'EDIT', [{ telefono_edificio: '612345678' }], true],
    ['edificios', 'telefono_edificio', 34, 132, 'EDIT', [{ telefono_edificio: '987654321' }], true],


    // ==================== SEARCH ====================

    // nombre
    ['edificios', 'nombre_edificio', 35, 133, 'SEARCH', [{ nombre_edificio: 'E'.repeat(101) }], 'nombre_edificio_max_size_KO'],
    ['edificios', 'nombre_edificio', 35, 134, 'SEARCH', [{ nombre_edificio: 'E'.repeat(102) }], 'nombre_edificio_max_size_KO'],

    ['edificios', 'nombre_edificio', 36, 135, 'SEARCH', [{ nombre_edificio: 'Ed$' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 36, 136, 'SEARCH', [{ nombre_edificio: 'Ed@' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 36, 137, 'SEARCH', [{ nombre_edificio: 'Ed#' }], 'nombre_edificio_format_KO'],
    ['edificios', 'nombre_edificio', 36, 138, 'SEARCH', [{ nombre_edificio: 'Ed_' }], 'nombre_edificio_format_KO'],

    ['edificios', 'nombre_edificio', 37, 139, 'SEARCH', [{ nombre_edificio: '' }], true],
    ['edificios', 'nombre_edificio', 37, 140, 'SEARCH', [{ nombre_edificio: 'Ed' }], true],
    ['edificios', 'nombre_edificio', 37, 141, 'SEARCH', [{ nombre_edificio: 'Edificio' }], true],
    ['edificios', 'nombre_edificio', 37, 142, 'SEARCH', [{ nombre_edificio: 'Ciencias 2' }], true],
    ['edificios', 'nombre_edificio', 37, 143, 'SEARCH', [{ nombre_edificio: 'E' }], true],

    // anho_academico_edificio
    ['edificios', 'anho_academico_edificio', 38, 144, 'SEARCH', [{ anho_academico_edificio: '2026-2026-2028' }], 'anho_academico_edificio_max_size_KO'],
    ['edificios', 'anho_academico_edificio', 38, 145, 'SEARCH', [{ anho_academico_edificio: '2026-2026-2028' }], 'anho_academico_edificio_max_size_KO'],

    ['edificios', 'anho_academico_edificio', 39, 146, 'SEARCH', [{ anho_academico_edificio: '2026/2026' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 39, 147, 'SEARCH', [{ anho_academico_edificio: '2026:2026' }], 'anho_academico_edificio_format_KO'],
    ['edificios', 'anho_academico_edificio', 39, 148, 'SEARCH', [{ anho_academico_edificio: '2026-202a' }], 'anho_academico_edificio_format_KO'],

    ['edificios', 'anho_academico_edificio', 40, 149, 'SEARCH', [{ anho_academico_edificio: '' }], true],
    ['edificios', 'anho_academico_edificio', 40, 150, 'SEARCH', [{ anho_academico_edificio: '19' }], true],
    ['edificios', 'anho_academico_edificio', 40, 151, 'SEARCH', [{ anho_academico_edificio: '1998' }], true],
    ['edificios', 'anho_academico_edificio', 40, 152, 'SEARCH', [{ anho_academico_edificio: '1998-' }], true],
    ['edificios', 'anho_academico_edificio', 40, 153, 'SEARCH', [{ anho_academico_edificio: '1998-2' }], true],
    ['edificios', 'anho_academico_edificio', 40, 154, 'SEARCH', [{ anho_academico_edificio: '1998-1999' }], true],
    ['edificios', 'anho_academico_edificio', 40, 155, 'SEARCH', [{ anho_academico_edificio: '1999-2000' }], true],
    ['edificios', 'anho_academico_edificio', 40, 156, 'SEARCH', [{ anho_academico_edificio: '2026-2026' }], true],
    ['edificios', 'anho_academico_edificio', 40, 157, 'SEARCH', [{ anho_academico_edificio: '2026-2028' }], true],

    // direccion
    ['edificios', 'direccion_edificio', 41, 158, 'SEARCH', [{ direccion_edificio: 'C'.repeat(256) }], 'direccion_edificio_max_size_KO'],
    ['edificios', 'direccion_edificio', 41, 159, 'SEARCH', [{ direccion_edificio: 'C'.repeat(257) }], 'direccion_edificio_max_size_KO'],

    ['edificios', 'direccion_edificio', 42, 160, 'SEARCH', [{ direccion_edificio: 'Ca$' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 42, 161, 'SEARCH', [{ direccion_edificio: 'Ca@' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 42, 162, 'SEARCH', [{ direccion_edificio: 'Ca#' }], 'direccion_edificio_format_KO'],
    ['edificios', 'direccion_edificio', 42, 163, 'SEARCH', [{ direccion_edificio: 'Ca_' }], 'direccion_edificio_format_KO'],

    ['edificios', 'direccion_edificio', 43, 164, 'SEARCH', [{ direccion_edificio: '' }], true],
    ['edificios', 'direccion_edificio', 43, 165, 'SEARCH', [{ direccion_edificio: 'Ca' }], true],
    ['edificios', 'direccion_edificio', 43, 166, 'SEARCH', [{ direccion_edificio: 'Calle' }], true],
    ['edificios', 'direccion_edificio', 43, 167, 'SEARCH', [{ direccion_edificio: 'Calle 2' }], true],
    ['edificios', 'direccion_edificio', 43, 168, 'SEARCH', [{ direccion_edificio: 'C' }], true],

    // telefono
    ['edificios', 'telefono_edificio', 44, 169, 'SEARCH', [{ telefono_edificio: '6123456789' }], 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 44, 170, 'SEARCH', [{ telefono_edificio: '6123456789' }], 'telefono_edificio_max_size_KO'],

    ['edificios', 'telefono_edificio', 45, 171, 'SEARCH', [{ telefono_edificio: '6123456789' }], 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 45, 172, 'SEARCH', [{ telefono_edificio: '6123456789' }], 'telefono_edificio_max_size_KO'],
    ['edificios', 'telefono_edificio', 45, 173, 'SEARCH', [{ telefono_edificio: '6123456789' }], 'telefono_edificio_max_size_KO'],

    ['edificios', 'telefono_edificio', 46, 174, 'SEARCH', [{ telefono_edificio: '' }], true],
    ['edificios', 'telefono_edificio', 46, 175, 'SEARCH', [{ telefono_edificio: '6' }], true],
    ['edificios', 'telefono_edificio', 46, 176, 'SEARCH', [{ telefono_edificio: '61' }], true],
    ['edificios', 'telefono_edificio', 46, 177, 'SEARCH', [{ telefono_edificio: '612345678' }], true]

);

let edificios_tests_files = Array();

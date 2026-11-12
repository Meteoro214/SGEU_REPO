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

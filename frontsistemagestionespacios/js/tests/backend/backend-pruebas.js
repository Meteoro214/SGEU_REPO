/****************************************************************/
/* Archivo: backend-pruebas.js                                     */
/* Descripción: Pruebas declarativas de comunicación backend.   */
/****************************************************************/

/*
 * Cada entidad define un array con el formato:
 *
 * <entidad>_backend_tests:
 * { accion, descripcion, overrides, esperado }
 */

// =====================================================================================
// usuario
// =====================================================================================
let usuario_backend_tests = Array(
    // Añadir usuario
    { accion: 'ADD', descripcion: 'ADD con todos los campos obligatorios', overrides: {}, esperado: 'QUERY_OK' },
    { accion: 'ADD', descripcion: 'ADD sin nombre de usuario', overrides: { nom_usuario: '' }, esperado: 'nom_usuario_ES_NULO_KO' },
    { accion: 'ADD', descripcion: 'ADD sin apellidos de usuario', overrides: { apell_usuario: '' }, esperado: 'apell_usuario_ES_NULO_KO' },
    { accion: 'ADD', descripcion: 'ADD sin email de usuario', overrides: { email: '' }, esperado: 'email_ES_NULO_KO' },
    { accion: 'ADD', descripcion: 'ADD sin contraseña', overrides: { pass: '' }, esperado: 'pass_ES_NULO_KO' },
    { accion: 'ADD', descripcion: 'ADD sin dni', overrides: { dni: '' }, esperado: 'dni_ES_NULO_KO' },
    { accion: 'ADD', descripcion: 'ADD sin grupo de usuarios', overrides: { id_grupo: '' }, esperado: 'id_grupo_ES_NULO_KO' },
    { accion: 'ADD', descripcion: 'ADD con email duplicado', overrides: { email: 'admin@uvigo.es' }, esperado: 'QUERY_ERROR' },
    { accion: 'ADD', descripcion: 'ADD con DNI duplicado', overrides: { dni: '11111111H' }, esperado: 'QUERY_ERROR' },


    // Buscar usuario
    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH por nombre de usuario', overrides: { nom_usuario: 'QA' }, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH por email', overrides: { email: 'qa.' }, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH por rol mediante grupo', overrides: { id_grupo: '__FIXTURE_ID_GRUPO__' }, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH de usuarios ADMIN', overrides: { id_grupo: '__FIXTURE_ID_GRUPO_ADMIN__' }, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH de usuarios GESTOR', overrides: { id_grupo: '__FIXTURE_ID_GRUPO__' }, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH de usuarios LECTOR', overrides: { id_grupo: '__FIXTURE_ID_GRUPO_LECTOR__' }, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH por estado activo', overrides: { activo_usuario: 1 }, esperado: 'RECORDSET_DATOS' },

    // Reactivar usuarios pendientes
    { accion: 'REACTIVAR', descripcion: 'REACTIVAR usuario QA ADMIN pendiente', overrides: { id_usuario: '__FIXTURE_ID_REACTIVAR_ADMIN__' }, esperado: 'REACTIVACION_OK' },
    { accion: 'REACTIVAR', descripcion: 'REACTIVAR usuario QA GESTOR pendiente', overrides: { id_usuario: '__FIXTURE_ID_REACTIVAR_GESTOR__' }, esperado: 'REACTIVACION_OK' },
    { accion: 'REACTIVAR', descripcion: 'REACTIVAR usuario QA ADMIN ya activo', overrides: { id_usuario: '__FIXTURE_ID_REACTIVAR_ADMIN__' }, esperado: 'REGISTRO_YA_ACTIVO_KO' },

    // Rechazar solicitud pendiente
    { accion: 'DELETE', descripcion: 'RECHAZAR solicitud de usuario pendiente', overrides: { id_usuario: '__FIXTURE_ID_RECHAZAR__' }, esperado: 'QUERY_OK' },
    { accion: 'LOGIN', descripcion: 'LOGIN de usuario cuya solicitud fue rechazada', overrides: { email: '__FIXTURE_EMAIL_RECHAZAR__' }, esperado: 'USUARIO_LOGIN_KO' },


    // Editar usuario
    { accion: 'EDIT', descripcion: 'EDIT de un usuario existente', overrides: {}, esperado: 'QUERY_OK' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_ES_NULO_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin dni', overrides: { dni: '' }, esperado: 'QUERY_OK' },
    { accion: 'EDIT', descripcion: 'EDIT sin email', overrides: { email: '' }, esperado: 'QUERY_OK' },
    { accion: 'EDIT', descripcion: 'EDIT sin nombre de usuario', overrides: { nom_usuario: '' }, esperado: 'QUERY_OK' },
    { accion: 'EDIT', descripcion: 'EDIT sin apellidos', overrides: { apell_usuario: '' }, esperado: 'QUERY_OK' },
    { accion: 'EDIT', descripcion: 'EDIT sin contraseña', overrides: { pass: '' }, esperado: 'QUERY_OK' },
    { accion: 'EDIT', descripcion: 'EDIT sin grupo de usuarios', overrides: { id_grupo: '' }, esperado: 'QUERY_ERROR' },
    { accion: 'EDIT', descripcion: 'EDIT con email duplicado', overrides: { email: 'admin@uvigo.es' }, esperado: 'QUERY_ERROR' },
    { accion: 'EDIT', descripcion: 'EDIT con DNI duplicado', overrides: { dni: '11111111H' }, esperado: 'QUERY_ERROR' },


    // Eliminar usuario
    { accion: 'DELETE', descripcion: 'DELETE de un usuario existente', overrides: {}, esperado: 'QUERY_OK' },
    { accion: 'DELETE', descripcion: 'DELETE sin identificador', overrides: { id_usuario: '' }, esperado: 'id_usuario_ES_NULO_KO' }
);

// =====================================================================================
// facultades
// =====================================================================================
let facultad_backend_tests = Array(
    
    // Añadir facultad
    { accion: 'ADD', descripcion: 'ADD con todos los campos obligatorios', overrides: {}, esperado: 'QUERY_OK' },
    { accion: 'ADD', descripcion: 'ADD sin nombre de facultad', overrides: { nom_facultad: ''}, esperado: 'nom_facultad_ES_NULO_KO' },
    { accion: 'ADD', descripcion: 'ADD sin año académico', overrides: { anho_acad_facultad: '' }, esperado: 'anho_acad_facultad_ES_NULO_KO' },
    { accion: 'ADD', descripcion: 'ADD de facultad duplicada', overrides: { nom_facultad: '__FIXTURE_NOM_FACULTAD__', anho_acad_facultad: '__FIXTURE_ANHO_FACULTAD__' }, esperado: 'QUERY_OK' },


    // Buscar facultades
    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH por nombre de facultad', overrides: { nom_facultad: 'QA Facultad' }, esperado: 'RECORDSET_DATOS' },
    { accion: 'SEARCH', descripcion: 'SEARCH por año académico', overrides: { anho_acad_facultad: '2026-2027' }, esperado: 'RECORDSET_DATOS' },


    // Editar facultades
    { accion: 'EDIT', descripcion: 'EDIT de una facultad existente', overrides: {}, esperado: 'QUERY_OK' },
    { accion: 'EDIT', descripcion: 'EDIT sin nombre de facultad', overrides: { nom_facultad: '' }, esperado: 'nom_facultad_ES_NULO_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin año académico', overrides: { anho_acad_facultad: '' }, esperado: 'anho_acad_facultad_ES_NULO_KO' },


    // Duplicar facultades
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR una facultad', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_1__'], anho_acad_facultad: '2027-2028' }, esperado: 'FACULTADES_DUPLICADAS_OK' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR varias facultades', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_1__', '__FIXTURE_ID_FACULTAD_2__'], anho_acad_facultad: '2028-2029' }, esperado: 'FACULTADES_DUPLICADAS_OK' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR con identificadores repetidos', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_1__', '__FIXTURE_ID_FACULTAD_1__'], anho_acad_facultad: '2027-2028' }, esperado: 'FACULTADES_DUPLICADAS_OK' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR con identificador no válido', overrides: { facultades: ['abc'], anho_acad_facultad: '2027-2028' }, esperado: 'FACULTAD_ID_INVALIDO_KO' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR con formato de año incorrecto', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_1__'], anho_acad_facultad: '2027/2028' }, esperado: 'ANHO_ACADEMICO_FORMATO_KO' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR con año anterior a 2026', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_1__'], anho_acad_facultad: '2025-2026' }, esperado: 'ANHO_ACADEMICO_INVALIDO_KO' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR con año no consecutivo', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_1__'], anho_acad_facultad: '2027-2029' }, esperado: 'ANHO_ACADEMICO_INVALIDO_KO' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR con año igual al de origen', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_1__'], anho_acad_facultad: '2026-2027' }, esperado: 'ANHO_DESTINO_NO_POSTERIOR_KO' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR con año anterior al de origen', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_2__'], anho_acad_facultad: '2026-2027' }, esperado: 'ANHO_DESTINO_NO_POSTERIOR_KO' },
    { accion: 'DUPLICAR', descripcion: 'DUPLICAR una facultad con año de origen inválido', overrides: { facultades: ['__FIXTURE_ID_FACULTAD_3__'], anho_acad_facultad: '2027-2028' }, esperado: 'ANHO_ORIGEN_INVALIDO_KO' },


    // Borrar facultades
    { accion: 'DELETE', descripcion: 'DELETE de una facultad existente', overrides: {}, esperado: 'QUERY_OK' },
    { accion: 'DELETE', descripcion: 'DELETE con identificador inexistente', overrides: { id_facultad: 4294967295 }, esperado: 'QUERY_OK' },
    { accion: 'DELETE', descripcion: 'DELETE sin identificador', overrides: { id_facultad: '' }, esperado: 'id_facultad_ES_NULO_KO' }

);

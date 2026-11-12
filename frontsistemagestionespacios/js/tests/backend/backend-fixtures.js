/**
 * Utilidades de datos para las pruebas de integración con el backend.
 * Las fixtures creadas por este archivo usan identificadores QA y se eliminan al terminar.
 */
let _sufijoContador = 0;
let tokenAdmin = '';

/**
 * Genera un sufijo numérico para evitar colisiones entre ejecuciones.
 * @param {number} digitos Número de dígitos que debe tener el sufijo.
 * @returns {string} Sufijo numérico generado.
 */
function sufijo(digitos) {
    _sufijoContador++;
    return String(Date.now() + _sufijoContador).slice(-digitos).padStart(digitos, '0');
}

/**
 * Crea una fila mediante la operación ADD del backend.
 * @param {string} entidad Tabla o entidad destino.
 * @param {object} payload Datos que se enviarán al backend.
 * @returns {Promise<*>} Identificador o recurso creado; null si falla.
 */
async function crear(entidad, payload) {
    const res = await apiPost(entidad, 'ADD', { ...payload, token: tokenAdmin });
    return res.ok ? res.resource : null;
}

/**
 * Crea únicamente las filas QA que pueden modificarse o eliminarse.
 * Las entidades semilla se referencian por sus IDs definidos en db_sgeu.sql.
 * @returns {Promise<object>} Identificadores de las fixtures creadas.
 */
async function prepararFixtures() {
    const login = await apiPost('usuario', 'LOGIN', {
        email: 'admin@uvigo.es',
        pass: 'admin'
    });
    if (!login.ok || !login.resource || !login.resource.token) {
        throw new Error(login.code || 'No se pudo obtener el token para las pruebas backend');
    }
    tokenAdmin = login.resource.token;

    // Estos IDs pertenecen a los datos semilla definidos en db_sgeu.sql.
    // Solo se crean datos QA que puedan editarse y eliminarse sin tocar la semilla
    const grupos = {
        admin: 1,
        gestor: 2,
        lector: 3
    };

    const idAccion = 6;     // SEARCH
    const idFuncionalidad = 2;  // Usuarios
    const crearUsuarioQA = (idGrupo, rol) => crear('usuario', {
        nom_usuario: 'QA',
        apell_usuario: `Automatica ${rol}`,
        email: `qa.${rol.toLowerCase()}.${sufijo(8)}@example.com`,
        pass: 'Test1234!',
        telefono: '6' + sufijo(8),
        dni: sufijo(8) + 'A',
        fech_nacimiento: '1995-04-30',
        activo_usuario: 1,
        id_grupo: idGrupo
    });
    const idUsuarios = {
        admin: await crearUsuarioQA(grupos.admin, 'Admin'),
        gestor: await crearUsuarioQA(grupos.gestor, 'Gestor'),
        lector: await crearUsuarioQA(grupos.lector, 'Lector')
    };
    const idUsuariosReactivar = {
        admin: await crearUsuarioQA(grupos.admin, 'ReactivarAdmin'),
        gestor: await crearUsuarioQA(grupos.gestor, 'ReactivarGestor')
    };
    const emailUsuarioRechazar = `qa.rechazar.${sufijo(8)}@example.com`;
    const idUsuarioRechazar = await crear('usuario', {
        nom_usuario: 'QA',
        apell_usuario: 'Automatica Rechazar',
        email: emailUsuarioRechazar,
        pass: 'Test1234!',
        telefono: '6' + sufijo(8),
        dni: sufijo(8) + 'A',
        fech_nacimiento: '1995-04-30',
        activo_usuario: 1,
        id_grupo: grupos.gestor
    });
    // La tabla de permisos usa una clave primaria compuesta. Combinacion existente
    const idPermiso = {
        id_grupo: grupos.gestor,
        id_accion: idAccion,
        id_func: idFuncionalidad
    };

    return {
        idGrupo: grupos.gestor,
        grupos,
        idUsuario: idUsuarios.gestor,
        idUsuarios,
        idUsuariosReactivar,
        idUsuarioRechazar,
        emailUsuarioRechazar,
        idAccion,
        idFuncionalidad,
        idPermiso
    };
}

/**
 * Construye un payload válido para ADD o EDIT.
 * @param {string} entidad Entidad que se está probando.
 * @param {object} fx Identificadores de las fixtures compartidas.
 * @param {string} accion Operación que utilizará el payload.
 * @returns {object} Payload válido para la operación.
 */
function payloadValido(entidad, fx, accion) {
    switch (entidad) {
        case 'grupo_usuarios':
            return { nom_grupo: 'QA Grupo ' + sufijo(4), desc_grupo: 'Grupo temporal de pruebas QA' };
        case 'usuario':
            return {
                nom_usuario: 'QA',
                apell_usuario: 'Automatica Backend',
                email: `qa.${sufijo(8)}@example.com`,
                pass: 'Test1234!',
                telefono: '6' + sufijo(8),
                dni: sufijo(8) + 'A',
                fech_nacimiento: '1995-04-30',
                activo_usuario: 1,
                id_grupo: fx.grupos.gestor
            };
        case 'accion':
            return { nom_accion: 'QA Accion ' + sufijo(4), desc_accion: 'Accion temporal de pruebas QA' };
        case 'funcionalidad':
            return { nom_func: 'QA Funcionalidad ' + sufijo(4), desc_func: 'Funcionalidad temporal de pruebas QA' };
        case 'tiene_permiso':
            return { ...fx.idPermiso };
        default:
            return {};
    }
}

/**
 * Devuelve la clave primaria de la fixture que se modificará o eliminará.
 * @param {string} entidad Entidad que se está probando.
 * @param {object} fx Identificadores de las fixtures compartidas.
 * @returns {object} Campos que identifican la fila.
 */
function idPrincipalPayload(entidad, fx) {
    switch (entidad) {
        case 'grupo_usuarios': return { id_grupo: fx.idGrupo };
        case 'usuario': return { id_usuario: fx.idUsuario };
        case 'accion': return { id_accion: fx.idAccion };
        case 'funcionalidad': return { id_func: fx.idFuncionalidad };
        case 'tiene_permiso': return { ...fx.idPermiso };
        default: return {};
    }
}

/**
 * Convierte la respuesta de un ADD en una referencia para limpieza QA.
 * @param {string} entidad Entidad creada.
 * @param {object} payload Payload utilizado en el ADD.
 * @param {*} idBackend Identificador devuelto por el backend.
 * @returns {?object} Referencia de fila creada o null si no se puede determinar.
 */
function claveFilaCreada(entidad, payload, idBackend) {
    switch (entidad) {
        case 'grupo_usuarios': return { tabla: entidad, valores: { id_grupo: idBackend } };
        case 'usuario': return { tabla: entidad, valores: { id_usuario: idBackend } };
        case 'accion': return { tabla: entidad, valores: { id_accion: idBackend } };
        case 'funcionalidad': return { tabla: entidad, valores: { id_func: idBackend } };
        case 'tiene_permiso':
            return { tabla: entidad, valores: {
                id_grupo: payload.id_grupo,
                id_accion: payload.id_accion,
                id_func: payload.id_func
            } };
        default: return null;
    }
}

/**
 * Ejecuta una operación y compara su resultado con la respuesta esperada.
 * @param {string} nombreEntidad Entidad sobre la que se ejecuta la prueba.
 * @param {string} accion Operación ADD, EDIT, SEARCH o DELETE.
 * @param {object} fixtures Identificadores de datos QA.
 * @param {object} overrides Valores que modifican el payload válido.
 * @param {*} respuestaEsperadaLocal Resultado esperado por la prueba.
 * @returns {Promise<object>} Estado de comparación y referencia creada.
 */
async function compararConBackend(nombreEntidad, accion, fixtures, overrides, respuestaEsperadaLocal) {
    if (!['ADD', 'EDIT', 'SEARCH', 'DELETE', 'REACTIVAR', 'LOGIN'].includes(accion)) {
        return { backend_status: 'N/A', backend_code: '' };
    }

    try {
        let payload;
        if (accion === 'SEARCH') {
            payload = { ...overrides };
        } else if (accion === 'DELETE') {
            payload = idPrincipalPayload(nombreEntidad, fixtures);
        } else if (accion === 'REACTIVAR') {
            payload = {};
        } else if (accion === 'LOGIN') {
            payload = { email: fixtures.emailUsuarioRechazar, pass: 'Test1234!' };
        } else {
            payload = payloadValido(nombreEntidad, fixtures, accion);
            if (accion === 'EDIT') {
                Object.assign(payload, idPrincipalPayload(nombreEntidad, fixtures));
                payload.oldPass = 'Test1234!';
            }
        }
        // Los overrides permiten probar campos vacíos o valores inválidos sin duplicar payloads.
        const overridesResueltos = { ...overrides };
        if (overridesResueltos.id_grupo === '__FIXTURE_ID_GRUPO__') {
            overridesResueltos.id_grupo = fixtures.idGrupo;
        } else if (overridesResueltos.id_grupo === '__FIXTURE_ID_GRUPO_ADMIN__') {
            overridesResueltos.id_grupo = fixtures.grupos.admin;
        } else if (overridesResueltos.id_grupo === '__FIXTURE_ID_GRUPO_LECTOR__') {
            overridesResueltos.id_grupo = fixtures.grupos.lector;
        }
        if (overridesResueltos.id_usuario === '__FIXTURE_ID_REACTIVAR_ADMIN__') {
            overridesResueltos.id_usuario = fixtures.idUsuariosReactivar.admin;
        } else if (overridesResueltos.id_usuario === '__FIXTURE_ID_REACTIVAR_GESTOR__') {
            overridesResueltos.id_usuario = fixtures.idUsuariosReactivar.gestor;
        }
        if (overridesResueltos.id_usuario === '__FIXTURE_ID_RECHAZAR__') {
            overridesResueltos.id_usuario = fixtures.idUsuarioRechazar;
        }
        if (overridesResueltos.email === '__FIXTURE_EMAIL_RECHAZAR__') {
            overridesResueltos.email = fixtures.emailUsuarioRechazar;
        }
        Object.assign(payload, overridesResueltos);

        const res = await apiPost(nombreEntidad, accion, { ...payload, token: tokenAdmin });
        const backendOk = res.ok === true;
        const backendCode = res.code || '';
        // Comprobamos que la petición sea correcta.
        const backend_status = backendCode === respuestaEsperadaLocal
            ? 'OK'
            : backendOk ? 'DIVERGENCIA' : 'BACKEND_MAS_ESTRICTO';
        const filaCreada = accion === 'ADD' && backendOk
            ? claveFilaCreada(nombreEntidad, payload, res.resource)
            : null;

        return { backend_status, backend_code: backendCode, filaCreada };
    } catch (e) {
        const backendCode = e.message || 'ERROR_DESCONOCIDO';
        const backendStatus = backendCode === respuestaEsperadaLocal
            ? 'OK'
            : 'SIN_CONEXION';
        return { backend_status: backendStatus, backend_code: backendCode };
    }
}

const TABLAS_RELACION = ['tiene_permiso'];

/**
 * Elimina las fixtures creadas durante la ejecución mediante qa_cleanup.
 * @param {Array<object>} filasExtra Filas creadas por casos ADD durante la prueba.
 * @param {?object} fixtures Fixtures base creadas al iniciar la ejecución.
 * @returns {Promise<object>} Resumen de filas borradas y omitidas.
 */
async function limpiarFixtures(filasExtra, fixtures) {
    const extra = filasExtra.filter(Boolean);
    // Las relaciones se limpian antes que sus tablas padre para respetar las FK.
    const filas = [
        ...extra.filter((fila) => TABLAS_RELACION.includes(fila.tabla)),
        ...extra.filter((fila) => !TABLAS_RELACION.includes(fila.tabla))
    ];

    if (fixtures) {
        // Las fixtures actuales crean un usuario QA por cada grupo.
        if (fixtures.idUsuarios) {
            Object.values(fixtures.idUsuarios)
                .filter(Boolean)
                .forEach((idUsuario) => {
                    filas.push({ tabla: 'usuario', valores: { id_usuario: idUsuario } });
                });
        }
        if (fixtures.idUsuariosReactivar) {
            Object.values(fixtures.idUsuariosReactivar)
                .filter(Boolean)
                .forEach((idUsuario) => {
                    filas.push({ tabla: 'usuario', valores: { id_usuario: idUsuario } });
                });
        }
        if (fixtures.idUsuarioRechazar) {
            filas.push({ tabla: 'usuario', valores: { id_usuario: fixtures.idUsuarioRechazar } });
        }
        // Mantiene la limpieza compatible con fixtures antiguas de un solo usuario.
        if (!fixtures.idUsuarios && !fixtures.idUsuariosReactivar && fixtures.idUsuario) {
            filas.push({ tabla: 'usuario', valores: { id_usuario: fixtures.idUsuario } });
        }
    }

    // Elimina también residuos de ejecuciones anteriores, pero solo usuarios
    // cuyo nombre exacto identifica las fixtures del runner.
    filas.push({ tabla: 'usuario', valores: { nom_usuario: 'QA' } });

    if (filas.length === 0) return { borradas: [], omitidas: [] };

    try {
        const res = await apiPost('qa_cleanup', 'LIMPIAR', {
            filas: JSON.stringify(filas),
            token: tokenAdmin
        });
        if (!res.ok) {
            console.error('Limpieza de fixtures QA falló:', res.code);
            return { borradas: [], omitidas: filas.map((fila) => `${fila.tabla}: ${res.code}`) };
        }
        if (!res.resource || !Array.isArray(res.resource.borradas) || !Array.isArray(res.resource.omitidas)) {
            console.error('Limpieza de fixtures QA devolvió una respuesta inválida:', res);
            return { borradas: [], omitidas: ['Respuesta inválida de qa_cleanup'] };
        }
        return res.resource;
    } catch (e) {
        console.error('Limpieza de fixtures QA falló:', e);
        return { borradas: [], omitidas: filas.map((fila) => `${fila.tabla}: ${e.message}`) };
    }
}

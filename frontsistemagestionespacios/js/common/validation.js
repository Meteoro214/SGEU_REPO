/****************************************************************/
/* Archivo: validation.js                                       */
/* Descripción: Contiene funciones comunes para validar         */
/* los datos introducidos por los usuarios en la aplicación.    */
/****************************************************************/


export const REGLAS_CAMPOS = {

    login: {
        user: { min: 10, max: 100, regex: "^[a-zA-Z0-9._%+-]+@uvigo\\.es$", regexBusqueda: null },
        password: { min: 5, max: 20, regex: "^[A-Za-z0-9]{5,20}$", regexBusqueda: null }
    },
    usuario: {
        dni: { min: 9, max: 9, regex: '^[0-9]{8}[A-Z]$', regexBusqueda: '^[0-9]{0,8}[A-Z]?$' },
        mail: { min: 10, max: 100, regex: "^[a-zA-Z0-9._%+-]+@uvigo\\.es$", regexBusqueda: null },
        nombre_usuario: { min: 2, max: 25, regex: "^[A-Za-zÀ-ÿ '-]+$", regexBusqueda: null },
        apellidos: { min: 2, max: 100, regex: "^[A-Za-zÀ-ÿ '-]+$", regexBusqueda: null },
        telefono: { min: 9, max: 9, regex: '^[0-9]{9}$', regexBusqueda: '^[0-9]{0,9}$' },
        password: { min: 5, max: 20, regex: "^[A-Za-z0-9]{5,20}$", regexBusqueda: null },
        fecha: {}
    },
    //TODO COMPLETAR A FUTURO
};

// ============================================================
// GESTIÓN DE VALIDACIONES E IDIOMAS
// ============================================================

export const validacionesRegistradas = [];

export function registrarValidacion(input, callback) {
    if (!input) return;

    validacionesRegistradas.push({ input, callback });
    input.addEventListener('blur', callback);
}

// Actualizar los mensajes de los campos que ya tienen errores.
document.addEventListener('langChanged', () => {
    validacionesRegistradas.forEach(({ input, callback }) => {
        if (input.classList.contains('is-invalid')) {
            callback();
        }
    });
});

export function validarTexto(valor, { min = 0, max = Infinity, regex = null } = {}) {
    if (valor.length < min) return 'min_size';
    if (valor.length > max) return 'max_size';
    if (regex && valor.length > 0 && !(new RegExp(regex).test(valor))) return 'format';
    return null;
}

export function validarTextoBusqueda(valor, { max = Infinity, regex = null } = {}) {
    if (valor.length > max) return 'max_size';
    if (regex && valor.length > 0 && !(new RegExp(regex).test(valor))) return 'format';
    return null;
}

export function validarNumero(valor, { regex = '^-?\\d+(\\.\\d+)?$' } = {}) {
    return (new RegExp(regex).test(valor)) ? null : 'format';
}

export function validarNumeroBusqueda(valor, regla = {}) {
    if (valor.length === 0) return null;
    return validarNumero(valor, regla);
}

export function validarFecha(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return 'format';
    const [anio, mes, dia] = valor.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
        return 'format';
    }
    return null;
}

export function validarFechaOpcional(valor) {
    if (valor.length === 0) return null;
    if (valor.length > 10) return 'max_size';
    return validarFecha(valor);
}

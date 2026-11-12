import { validarFecha, validarTexto } from './validation.js';

/** Muestra un mensaje de error de proceso en la caja de alerta de un formulario. */
export function mostrarErrorFormulario(el, mensaje) {
    if (!el) return;
    el.textContent = mensaje;
    el.hidden = false;}

/** Oculta y limpia la caja de alerta de error de un formulario. */
export function ocultarErrorFormulario(el) {
    if (!el) return;
    el.textContent = '';
    el.hidden = true;
}


/**
 * @param {HTMLElement} input   Campo a validar (puede ser null; en ese caso no hace nada y
 *                              se considera válido, para poder usarse en formularios donde
 *                              el campo es opcional según el contexto).
 * @param {Object} regla        { min, max, regex } de REGLAS_CAMPOS.<entidad>.<campo>.
 * @param {Object} mensajes     { min_size, max_size, format } con el texto ya traducido de
 *                              cada motivo (ver t('register.dniMinSize') etc.).
 */
export function validarCampoTexto(input, regla, mensajes) {
    if (!input) return true;
    const motivo = validarTexto(input.value, regla);
    if (motivo) { //null es bueno
        mostrarErrorCampo(input, mensajes[motivo] || mensajes.format || '');
        return false;
    }
    ocultarErrorCampo(input);
    return true;
}

/**
 * @param {HTMLElement} input   Campo a validar (puede ser null; en ese caso no hace nada y
 *                              se considera válido, para poder usarse en formularios donde
 *                              el campo es opcional según el contexto).
 * @param {Object} regla        { min, max, regex } de REGLAS_CAMPOS.<entidad>.<campo>.
 * @param {Object} mensajes     { min_size, max_size, format } con el texto ya traducido de
 *                              cada motivo (ver t('register.dniMinSize') etc.).
 */
export function validarCampoFecha(input, regla, mensajes) {
    if (!input) return true;
    const motivo = validarFecha(input.value);
    if (motivo) { //null es bueno
        mostrarErrorCampo(input, mensajes[motivo] || mensajes.format || '');
        return false;
    }
    ocultarErrorCampo(input);
    return true;
}

//TODO REVISAR 

/** Marca un campo como inválido y añade/actualiza su mensaje de ayuda debajo.
 *  Si el input está dentro de un .input-group, el mensaje se coloca después del grupo entero. */
// fake info
export function mostrarErrorCampo(input, mensaje) {
    if (!input) return;

    input.classList.add('is-invalid');

    // Busca el contenedor que agrupa el input y su botón de acción.
    const contenedor = input.closest('.input-wrap, .input-group') || input;

    let feedback = contenedor.nextElementSibling;

    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        contenedor.after(feedback);
    }

    feedback.textContent = mensaje;
    feedback.style.display = 'block';
}

/** Quita el estado inválido de un campo y limpia su mensaje. */
export function ocultarErrorCampo(input) {
    if (!input) return;

    input.classList.remove('is-invalid');

    const contenedor = input.closest('.input-wrap, .input-group') || input;
    const feedback = contenedor.nextElementSibling;

    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = '';
        feedback.style.display = 'none';
    }
}




/** Limpia todos los errores de campo (is-invalid + invalid-feedback) dentro de un formulario. */
export function limpiarErroresCampos(form) {
    if (!form) return;
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.invalid-feedback').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
}

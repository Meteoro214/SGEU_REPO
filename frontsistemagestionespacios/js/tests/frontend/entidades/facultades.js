/****************************************************************/
/* Archivo: facultades.js                                       */
/* Descripción: Clase de pruebas de la entidad facultades.      */
/* Define las validaciones de cada campo del formulario         */
/* de facultades para las acciones ADD, EDIT y SEARCH, que      */
/* ejecuta data.js con las pruebas de test-frontend.js.         */
/* Tecnología: JavaScript nativo (ES11).                        */
/****************************************************************/

class facultades extends Entidad_Abstracta {
    constructor(modo) {
        super(modo);
        this.entidad = 'facultades';
    }

    // ============================================================
    // FORMULARIO DE PRUEBAS
    // ============================================================

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="nombre_facultad" name="nombre_facultad" value="">' +
            '<input type="text" id="anho_academico_facultad" name="anho_academico_facultad" value="">';
    }

    // ============================================================
    // VALIDACIONES ADD
    // ============================================================

    ADD_nombre_facultad_validation() { 
        const r = REGLAS_CAMPOS.facultad.nombre_facultad; 
        return this._vt('nombre_facultad', r.min, r.max, r.regex); 
    }

    ADD_anho_academico_facultad_validation() {
        const r = REGLAS_CAMPOS.facultad.anho_academico_facultad;

        const valor = this._valorCampo('anho_academico_facultad');

        // Validar tamaño y formato
        const resultado = this._vt(
            'anho_academico_facultad',
            r.min,
            r.max,
            r.regex
        );

        if (resultado !== true) return resultado;

        // Validar consecutividad de los años
        const resultadoAnho = this._validarAnhoAcademico(valor);

        if (resultadoAnho !== null) {
            return this._resultado('anho_academico_facultad', resultadoAnho);
        }

        // Validar que el año académico no sea anterior a 2026-2027
        const anhoMinimo = 2026;
        const anhoInicio = Number(valor.substring(0, 4));

        if (anhoInicio < anhoMinimo) {
            return this._resultado('anho_academico_facultad', 'format');
        }

        return true;
    }

    // ============================================================
    // VALIDACIONES EDIT (mismas reglas que ADD)
    // ============================================================

    EDIT_nombre_facultad_validation() { return this.ADD_nombre_facultad_validation(); }
    EDIT_anho_academico_facultad_validation() { return this.ADD_anho_academico_facultad_validation(); }

    // ============================================================
    // VALIDACIONES SEARCH
    // ============================================================

    SEARCH_nombre_facultad_validation() { 
        const r = REGLAS_CAMPOS.facultad.nombre_facultad; 
        return this._vts('nombre_facultad', r.max, r.regexBusqueda); 
    }
    
    SEARCH_anho_academico_facultad_validation() { 
        const r = REGLAS_CAMPOS.facultad.anho_academico_facultad; 
        return this._vts('anho_academico_facultad', r.max, r.regexBusqueda); 
    }
}
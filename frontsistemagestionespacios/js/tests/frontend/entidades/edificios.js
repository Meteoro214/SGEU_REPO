
/****************************************************************/
/* Archivo: edificios.js                                        */
/* Descripción: Clase de pruebas de la entidad edificios.       */
/* Define las validaciones de cada campo para ADD, EDIT y       */
/* SEARCH, que ejecuta data.js con test-frontend.js.             */
/* Tecnología: JavaScript nativo (ES11).                        */
/****************************************************************/

class edificios extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'edificios';
    }

    // ============================================================
    // FORMULARIO DE PRUEBAS
    // ============================================================

    cargar_formulario_html(id) {

        document.getElementById(id).innerHTML =
            '<input type="text" id="nombre_edificio" name="nombre_edificio" value="">' +
            '<input type="text" id="anho_academico_edificio" name="anho_academico_edificio" value="">' +
            '<input type="text" id="direccion_edificio" name="direccion_edificio" value="">' +
            '<input type="text" id="telefono_edificio" name="telefono_edificio" value="">';
    }


    // ============================================================
    // VALIDACIONES ADD
    // ============================================================

    ADD_nombre_edificio_validation() {

        const r = REGLAS_CAMPOS.edificio.nombre_edificio;

        return this._vt(
            'nombre_edificio',
            r.min,
            r.max,
            r.regex
        );
    }


    ADD_anho_academico_edificio_validation() {

        const r = REGLAS_CAMPOS.edificio.anho_academico_edificio;
        const valor = this._valorCampo('anho_academico_edificio');

        // Validar tamaño y formato.
        const resultado = this._vt(
            'anho_academico_edificio',
            r.min,
            r.max,
            r.regex
        );

        if (resultado !== true) return resultado;

        // Validar consecutividad de los años.
        const resultadoAnho = this._validarAnhoAcademico(valor);

        if (resultadoAnho !== null) {
            return this._resultado(
                'anho_academico_edificio',
                resultadoAnho
            );
        }

        // Validar que el año académico no sea anterior a 2026-2027.
        const anhoMinimo = 2026;
        const anhoInicio = Number(valor.substring(0, 4));

        if (anhoInicio < anhoMinimo) {
            return this._resultado(
                'anho_academico_edificio',
                'format'
            );
        }

        return true;
    }


    ADD_direccion_edificio_validation() {

        const r = REGLAS_CAMPOS.edificio.direccion_edificio;

        return this._vt(
            'direccion_edificio',
            r.min,
            r.max,
            r.regex
        );
    }


    ADD_telefono_edificio_validation() {

        const valor = this._valorCampo('telefono_edificio');

        // El teléfono es nullable.
        if (valor === '') return true;

        const r = REGLAS_CAMPOS.edificio.telefono_edificio;

        return this._vt(
            'telefono_edificio',
            r.min,
            r.max,
            r.regex
        );
    }


    // ============================================================
    // VALIDACIONES EDIT (mismas reglas que ADD)
    // ============================================================

    EDIT_nombre_edificio_validation() {
        return this.ADD_nombre_edificio_validation();
    }

    EDIT_anho_academico_edificio_validation() {
        return this.ADD_anho_academico_edificio_validation();
    }

    EDIT_direccion_edificio_validation() {
        return this.ADD_direccion_edificio_validation();
    }

    EDIT_telefono_edificio_validation() {
        return this.ADD_telefono_edificio_validation();
    }


    // ============================================================
    // VALIDACIONES SEARCH
    // ============================================================

    SEARCH_nombre_edificio_validation() {
        const r = REGLAS_CAMPOS.edificio.nombre_edificio;
        return this._vts('nombre_edificio', r.max, r.regex);
    }


    SEARCH_anho_academico_edificio_validation() {

        const r = REGLAS_CAMPOS.edificio.anho_academico_edificio;

        return this._vts(
            'anho_academico_edificio',
            r.max,
            r.regexBusqueda
        );
    }


    SEARCH_direccion_edificio_validation() {
        const r = REGLAS_CAMPOS.edificio.direccion_edificio;
        return this._vts('direccion_edificio', r.max, r.regex);
    }


    SEARCH_telefono_edificio_validation() {

        const r = REGLAS_CAMPOS.edificio.telefono_edificio;

        return this._vts(
            'telefono_edificio',
            r.max,
            r.regexBusqueda
        );
    }

}

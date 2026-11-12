/****************************************************************/
/* Archivo: Entidad_Abstracta.js                                */
/* Descripción: Clase base de la que heredan las clases de      */
/* cada entidad que se prueba (js/tests/entidades/).            */
/****************************************************************/

class Entidad_Abstracta extends Validaciones {

    constructor(modo) {
        super();
        this.modo = modo;
        this.entidad = '';
    }

    cargar_formulario_html(containerId) {}
}

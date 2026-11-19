/****************************************************************/
/* Archivo: validaciones.js                                     */
/* Descripción: Clase base con las validaciones genéricas       */
/* (tamaño mínimo, tamaño máximo y formato) que utilizan        */
/* las clases de cada entidad en las pruebas.                   */
/* Tecnología: JavaScript nativo (ES11).                        */
/****************************************************************/

class Validaciones {

    // Devuelve el valor del campo del formulario de test
    _valorCampo(campo) {
        const elemento = document.getElementById(campo);
        return elemento ? elemento.value : '';
    }

    // Devuelve true si no hay error o el código '<campo>_<motivo>_KO'
    _resultado(campo, motivo) {
        return motivo ? campo + '_' + motivo + '_KO' : true;
    }

    // Texto (ADD / EDIT): tamaño mínimo, tamaño máximo y formato
    _vt(campo, min, max, regex) {
        return this._resultado(campo, Validadores.validarTexto(this._valorCampo(campo), { min, max, regex }));
    }

    // Texto en búsqueda (SEARCH): vacío siempre válido, solo tamaño máximo y formato
    _vts(campo, max, regex) {
        return this._resultado(campo, Validadores.validarTextoBusqueda(this._valorCampo(campo), { max, regex }));
    }

    // Numérico (ADD / EDIT): obligatorio, solo se valida el formato
    _vn(campo, regex = '^-?\\d+(\\.\\d+)?$') {
        return this._resultado(campo, Validadores.validarNumero(this._valorCampo(campo), { regex }));
    }

    // Numérico en búsqueda (SEARCH): vacío siempre válido, si no, se valida el formato
    _vns(campo, regex = '^-?\\d+(\\.\\d+)?$') {
        return this._resultado(campo, Validadores.validarNumeroBusqueda(this._valorCampo(campo), { regex }));
    }

    // Fecha Obligatoria: Formato YYYY-MM-DD y que sea una fecha real
    _vd(campo) {
        return this._resultado(campo, Validadores.validarFecha(this._valorCampo(campo)));
    }

    // Fecha Opcional: Vacía siempre válida, si no, tamaño máximo y formato
    _vds(campo) {
        return this._resultado(campo, Validadores.validarFechaOpcional(this._valorCampo(campo)));
    }

}

/****************************************************************/
/* Archivo: usuarios.js                                         */
/* Descripción: Clase de pruebas de la entidad usuarios.        */
/* Define las validaciones de cada campo del formulario         */
/* de usuarios para las acciones ADD, EDIT y SEARCH, que        */
/* ejecuta data.js con las pruebas de test-frontend.js.         */
/* Tecnología: JavaScript nativo (ES11).                        */
/****************************************************************/

class usuarios extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'usuarios';
    }

    // ============================================================
    // FORMULARIO DE PRUEBAS
    // ============================================================

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="dni" name="dni" value="">' +
            '<input type="text" id="mail" name="mail" value="">' +
            '<input type="text" id="nombre_usuario" name="nombre_usuario" value="">' +
            '<input type="text" id="apellidos" name="apellidos" value="">' +
            '<input type="text" id="telefono" name="telefono" value="">' +
            '<input type="text" id="password" name="password" value="">';
    }

    // ============================================================
    // VALIDACIONES ADD
    // ============================================================

    ADD_dni_validation() { 
        const r = REGLAS_CAMPOS.usuario.dni; 
        return this._vt('dni', r.min, r.max, r.regex); 
    }

    ADD_mail_validation() { 
        const r = REGLAS_CAMPOS.usuario.mail; 
        return this._vt('mail', r.min, r.max, r.regex); 
    }

    ADD_nombre_usuario_validation() { 
        const r = REGLAS_CAMPOS.usuario.nombre_usuario; 
        return this._vt('nombre_usuario', r.min, r.max, r.regex); 
    }

    ADD_apellidos_validation() { 
        const r = REGLAS_CAMPOS.usuario.apellidos; 
        return this._vt('apellidos', r.min, r.max, r.regex); 
    }

    ADD_telefono_validation() { 
        const r = REGLAS_CAMPOS.usuario.telefono; 
        return this._vt('telefono', r.min, r.max, r.regex); 
    }

    ADD_password_validation() { 
        const r = REGLAS_CAMPOS.usuario.password; 
        return this._vt('password', r.min, r.max, r.regex); 
    }

    // ============================================================
    // VALIDACIONES EDIT (mismas reglas que ADD)
    // ============================================================

    EDIT_dni_validation() { return this.ADD_dni_validation(); }
    EDIT_mail_validation() { return this.ADD_mail_validation(); }
    EDIT_nombre_usuario_validation() { return this.ADD_nombre_usuario_validation(); }
    EDIT_apellidos_validation() { return this.ADD_apellidos_validation(); }
    EDIT_telefono_validation() { return this.ADD_telefono_validation(); }
    EDIT_password_validation() { return this.ADD_password_validation(); }

    // ============================================================
    // VALIDACIONES SEARCH
    // ============================================================

    SEARCH_dni_validation() { 
        const r = REGLAS_CAMPOS.usuario.dni; 
        return this._vts('dni', r.max, r.regexBusqueda); 
    }
    
    SEARCH_mail_validation() { 
        const r = REGLAS_CAMPOS.usuario.mail; 
        return this._vts('mail', r.max, r.regexBusqueda); 
    }

    SEARCH_nombre_usuario_validation() { 
        const r = REGLAS_CAMPOS.usuario.nombre_usuario; 
        return this._vts('nombre_usuario', r.max, r.regexBusqueda); 
    }

    SEARCH_apellidos_validation() { 
        const r = REGLAS_CAMPOS.usuario.apellidos; 
        return this._vts('apellidos', r.max, r.regexBusqueda); 
    }

    SEARCH_telefono_validation() { 
        const r = REGLAS_CAMPOS.usuario.telefono; 
        return this._vts('telefono', r.max, r.regexBusqueda); 
    }

    // * No se busca para contraseña

    // ============================================================
    // VALIDACIONES LOGIN
    // ============================================================

    LOGIN_mail_validation() {
        const r = REGLAS_CAMPOS.login.user;
        return this._vt('mail', r.min, r.max, r.regex);
    }

    LOGIN_password_validation() {
        const r = REGLAS_CAMPOS.login.password;
        return this._vt('password', r.min, r.max, r.regex);
    }
}


/****************************************************************/
/* Archivo: api.js                                              */
/* Descripción: Centraliza las funciones de comunicación        */
/* entre el frontend de SGEU y el backend mediante              */
/* los servicios de la API REST.                                */
/* Tecnología: JavaScript nativo (ES11).                        */
/****************************************************************/


// ============================================================
// CONFIGURACIÓN DE LA API
// ============================================================

// Dirección de entrada de la API
import { API_URL } from '../config.js';

// ============================================================
// FUNCIÓN GENÉRICA PARA PETICIONES POST
// ============================================================

async function apiPost(controlador, action, params = {}) {

    const body = new URLSearchParams({
        controlador,
        action,
        ...params
    });

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });

    const responseText = await response.text();

    let data;

    try {
        data = JSON.parse(responseText);

    } catch (error) {

        const detail = responseText
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 300);
        const description = detail || 'respuesta vacía';

        throw new Error(`HTTP ${response.status}: ${description}`);
    }

    if (!response.ok) {
        throw new Error(data.code || `HTTP ${response.status}`);
    }

    return data;
}

window.apiPost = apiPost;


// ============================================================
// AUTENTICACIÓN
// ============================================================

export async function loginUser(mail, password) {

    return apiPost('usuario', 'LOGIN', {
        email: mail,
        pass: password
    });
}


export async function registerUser(userData) {
    return apiPost('usuario', 'REGISTRAR', {
        ...userData,
    });
}

export async function consultarAPI(entidad, accion, parametros) {
    return apiPost(
        entidad,
        accion,
        {
            ...parametros,
            token: sessionStorage.getItem("sgeu_token")
        }
    );

}
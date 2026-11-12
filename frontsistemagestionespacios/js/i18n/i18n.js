/****************************************************************/
/* Archivo: i18n.js                                             */
/* Descripción: Gestiona la selección y configuración           */
/* del idioma utilizado en la interfaz de SGEU.                 */
/****************************************************************/

const DEFAULT_LANG = 'es';
const LANGS_DISPONIBLES = ['es', 'en', 'gl'];


// Catálogo cargado para el idioma seleccionado y código activo de la sesión.
let traducciones = {};
let idiomaActual = getCookie('lang') || DEFAULT_LANG;

/**
 * Busca una cookie por nombre y devuelve su valor descodificado.
 *
 * @param {string} nombre - Nombre de la cookie que se quiere consultar.
 * @returns {string|undefined} Valor de la cookie o undefined si no existe.
 */
function getCookie(nombre) {
    const cookie = document.cookie
        .split(';')
        .find((item) => item.trim().startsWith(`${nombre}=`));

    return cookie
        ? decodeURIComponent(cookie.trim().slice(nombre.length + 1))
        : undefined;
}

/**
 * Crea o actualiza una cookie con una fecha de expiración.
 *
 * @param {string} nombre - Nombre de la cookie.
 * @param {string} valor - Valor que se guardará en la cookie.
 * @param {number} dias - Número de días que permanecerá activa.
 * @returns {void}
 */
function setCookie(nombre, valor, dias) {
    // La fecha de expiración permite conservar la preferencia entre visitas.
    const expiracion = new Date();
    expiracion.setTime(expiracion.getTime() + (dias * 24 * 60 * 60 * 1000));
    document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${expiracion.toUTCString()}; path=/`;
}

/**
 * Carga el catálogo del idioma y notifica al documento para que otros
 * módulos puedan reaccionar al cambio.
 *
 * @param {string} lang - Código del idioma que se quiere cargar.
 * @returns {Promise<void>} Promesa que termina al cargar el catálogo.
 * @throws {Error} Si el archivo de traducción no se puede cargar.
 */
export async function setLang(lang) {
    if (!LANGS_DISPONIBLES.includes(lang)) {
        return;
    }

    // El parámetro evita que el navegador reutilice un JSON antiguo durante el desarrollo.
    const url = new URL(`../../assets/translations/${lang}.json?_=${Date.now()}`, import.meta.url);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`No se pudo cargar la traducción del idioma: ${lang}`);
    }

    traducciones = await response.json();
    idiomaActual = lang;
    setCookie('lang', lang, 365);
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent('langChanged', {
        detail: { lang }
    }));
}

/**
 * Busca una traducción mediante una clave con puntos, por ejemplo:
 * traducir('login.title') o traducir('tests.runningTests', { entity: 'usuario' }).
 *
 * @param {string} clave - Clave de la traducción, posiblemente anidada.
 * @param {object} [parametros] - Parámetros para interpolar {clave: valor}.
 * @returns {string} Texto traducido o la clave si no se encuentra.
 */
export function traducir(clave, parametros = {}) {
    const partes = clave.split('.');
    let valor = traducciones;

    // Se recorre el objeto paso a paso para soportar claves como "menu.inicio".
    for (const parte of partes) {
        valor = valor?.[parte];

        if (valor === undefined) {
            return clave;
        }
    }

    let texto = valor ?? clave;

    if (typeof texto === 'string' && parametros && typeof parametros === 'object') {
        Object.entries(parametros).forEach(([nombre, val]) => {
            texto = texto.replaceAll(`{${nombre}}`, val);
        });
    }

    return texto;
}

/**
 * Devuelve el código del idioma activo.
 *
 * @returns {string} Código del idioma activo: es, en o gl.
 */
export function getLang() {
    return idiomaActual;
}

/**
 * Recorre el DOM (o el nodo raíz indicado) y aplica traducciones a:
 *   data-i18n="clave"        -> textContent del elemento
 *   data-i18n-ph="clave"     -> placeholder del input
 *   data-i18n-title="clave"  -> atributo title
 *
 * @param {Document|Element} root - Nodo desde el que se buscarán elementos.
 * @returns {void}
 */
export function applyTranslations(root = document) {
    // El root permite traducir toda la página o solamente un componente concreto.
    root.querySelectorAll('[data-i18n]').forEach((element) => {
        const clave = element.getAttribute('data-i18n');
        const valor = traducir(clave);

        if (valor !== clave) {
            element.textContent = valor;
        }
    });

    root.querySelectorAll('[data-i18n-ph]').forEach((element) => {
        const clave = element.getAttribute('data-i18n-ph');
        const valor = traducir(clave);

        if (valor !== clave) {
            element.placeholder = valor;
        }
    });

    root.querySelectorAll('[data-i18n-title]').forEach((element) => {
        const clave = element.getAttribute('data-i18n-title');
        const valor = traducir(clave);

        if (valor !== clave) {
            element.title = valor;
        }
    });
}

/**
 * Inicializa i18n y expone traducir(), setLang(), getLang() y
 * applyTranslations() globalmente.
 *
 * @param {string} [lang] - Idioma inicial. Si se omite, usa la cookie actual.
 * @returns {Promise<void>} Promesa que termina al completar la inicialización.
 */
export async function initI18n(lang) {

    // Se enlazan las funciones para poder usarlas desde scripts no modulares.
    window.traducir = traducir;
    window.setLang = setLang;
    window.getLang = getLang;
    window.applyTranslations = applyTranslations;

    
    await setLang(lang || idiomaActual);
}

/**
 * Conecta los botones de idioma que ya utiliza el frontend de SGEU.
 * Debe ejecutarse cuando los botones estén presentes en el DOM.
 *
 * @returns {void}
 */
export function initLangDropdown() {
    document.addEventListener('click', async (event) => {

        const boton = event.target.closest('.lang-switch button[lang]');

        if (!boton) return;

        try {
            await setLang(boton.lang);
            applyTranslations();
            actualizarBotonesIdioma();

        } catch (error) {
            console.error('Error al cambiar el idioma:', error);
        }
    });

    actualizarBotonesIdioma();
}

/**
 * Actualiza el estado visual de los botones del selector de idioma.
 *
 * @returns {void}
 */
function actualizarBotonesIdioma() {
    document.querySelectorAll('.lang-switch button[lang]').forEach((boton) => {
        const activo = boton.lang === idiomaActual;
        boton.classList.toggle('active', activo);
        boton.setAttribute('aria-pressed', String(activo));
    });
}

// Inicialización automática del sistema de idiomas.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initI18n();
        initLangDropdown();
        applyTranslations();
    } catch (error) {
        console.error('Error al inicializar el sistema de idiomas:', error);
    }
});

console.log('i18n.js se ha cargado correctamente');
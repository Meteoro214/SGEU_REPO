import { consultarAPI } from "../api/api.js";
import { traducir } from "../i18n/i18n.js";

import {
    validarCampoTexto,
    mostrarErrorCampo,
    limpiarErroresCampos
} from "../common/form-errors.js";

import {
    REGLAS_CAMPOS,
    registrarValidacion
} from "../common/validation.js";

document.addEventListener("DOMContentLoaded", iniciarDetalleEdificio);

let edificioActual = null;
let claveErrorActual = null;
let gestoresDisponibles = [];

const usuarioSesion = JSON.parse(
    sessionStorage.getItem("sgeu_usuario") || "{}"
);

const idGrupoUsuario = Number(usuarioSesion.id_grupo);

function esAdmin() {
    return idGrupoUsuario === 1;
}

function esGestor() {
    return idGrupoUsuario === 2;
}

/**
 * Comprueba si el usuario puede modificar el edificio.
 * El GESTOR solo puede modificar el edificio de su token.
 */
function puedeEditarEdificio(edificio) {
    if (esAdmin()) return true;

    if (esGestor()) {
        return Array.isArray(edificio.gestores) &&
            edificio.gestores.some(gestor =>
                Number(gestor.id_usuario) === Number(usuarioSesion.id_usuario)
            );
    }

    return false;
}

/* =========================================================
   INICIALIZACIÓN
========================================================= */

function iniciarDetalleEdificio() {
    const contenido = document.getElementById(
        "building-detail-content"
    );

    if (!contenido) return;

    configurarEventos();
    configurarValidacionesDetalle();

    document.addEventListener("langChanged", () => {
        if (claveErrorActual) {
            mostrarError(claveErrorActual);
        }
    });

    cargarDetalleEdificio();
}

/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {
    const botonVolver = document.getElementById(
        "building-detail-back"
    );

    const botonEditar = document.getElementById(
        "building-detail-edit"
    );

    const formularioEdicion = document.getElementById(
        "building-detail-edit-form"
    );

    const botonCancelar = document.getElementById(
        "building-detail-edit-cancel"
    );

    botonVolver?.addEventListener("click", (evento) => {
        evento.preventDefault();
        window.location.href = "edificios.html";
    });

    botonEditar?.addEventListener("click", abrirEdicion);

    botonCancelar?.addEventListener("click", cancelarEdicion);

    formularioEdicion?.addEventListener("submit", guardarEdicion);
}

/* =========================================================
   VALIDACIONES
========================================================= */

function configurarValidacionesDetalle() {
    const inputNombre = document.getElementById(
        "building-detail-edit-name"
    );

    const inputDireccion = document.getElementById(
        "building-detail-edit-address"
    );

    const inputTelefono = document.getElementById(
        "building-detail-edit-phone"
    );

    const inputAnho = document.getElementById(
        "building-detail-edit-year"
    );

    registrarValidacion(inputNombre, validarNombreDetalle);
    registrarValidacion(inputDireccion, validarDireccionDetalle);
    registrarValidacion(inputTelefono, validarTelefonoDetalle);
    registrarValidacion(inputAnho, validarAnhoDetalle);
}

/**
 * Valida el nombre del edificio.
 */
function validarNombreDetalle() {
    const input = document.getElementById(
        "building-detail-edit-name"
    );

    return validarCampoTexto(
        input,
        REGLAS_CAMPOS.edificio.nombre_edificio,
        {
            min_size: traducir("edificios.validation.nameMinSize"),
            max_size: traducir("edificios.validation.nameMaxSize"),
            format: traducir("edificios.validation.nameFormat")
        }
    );
}

/**
 * Valida la dirección del edificio.
 */
function validarDireccionDetalle() {
    const input = document.getElementById(
        "building-detail-edit-address"
    );

    return validarCampoTexto(
        input,
        REGLAS_CAMPOS.edificio.direccion_edificio,
        {
            min_size: traducir("edificios.validation.addressMinSize"),
            max_size: traducir("edificios.validation.addressMaxSize"),
            format: traducir("edificios.validation.addressFormat")
        }
    );
}

/**
 * Valida el teléfono. Es un campo opcional.
 */
function validarTelefonoDetalle() {
    const input = document.getElementById(
        "building-detail-edit-phone"
    );

    return validarCampoTexto(
        input,
        REGLAS_CAMPOS.edificio.telefono_edificio,
        {
            min_size: traducir("edificios.validation.phoneMinSize"),
            max_size: traducir("edificios.validation.phoneMaxSize"),
            format: traducir("edificios.validation.phoneFormat")
        },
        true
    );
}

/**
 * Valida el formato y la continuidad del año académico.
 */
function validarAnhoDetalle() {
    const input = document.getElementById(
        "building-detail-edit-year"
    );

    const regla = REGLAS_CAMPOS.edificio.anho_academico_edificio;

    const validoFormato = validarCampoTexto(
        input,
        regla,
        {
            min_size: traducir("edificios.validation.academicYearFormat"),
            max_size: traducir("edificios.validation.academicYearFormat"),
            format: traducir("edificios.validation.academicYearFormat")
        }
    );

    if (!validoFormato || !input) return false;

    const coincidencia = input.value.trim().match(/^(\d{4})-(\d{4})$/);

    if (!coincidencia) {
        mostrarErrorCampo(
            input,
            traducir("edificios.validation.academicYearFormat")
        );
        return false;
    }

    const anhoInicio = Number(coincidencia[1]);
    const anhoFin = Number(coincidencia[2]);
    const anhoActual = new Date().getFullYear();
    if (anhoInicio < anhoActual) {
        mostrarErrorCampo(
            input,
            traducir("edificios.validation.academicYearMin")
        );
        return false;
    }

    if (anhoFin !== anhoInicio + 1) {
        mostrarErrorCampo(
            input,
            traducir("edificios.validation.academicYearConsecutive")
        );
        return false;
    }

    return true;
}

/**
 * Ejecuta todas las validaciones.
 */
function validarFormularioDetalle() {
    const nombreValido = validarNombreDetalle();
    const direccionValida = validarDireccionDetalle();
    const telefonoValido = validarTelefonoDetalle();
    const anhoValido = validarAnhoDetalle();

    return (
        nombreValido &&
        direccionValida &&
        telefonoValido &&
        anhoValido
    );
}

/* =========================================================
   CARGA DEL EDIFICIO
========================================================= */

async function cargarDetalleEdificio() {
    const parametrosURL = new URLSearchParams(
        window.location.search
    );

    const id = parametrosURL.get("id");

    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
        mostrarError("edificios.detail.invalidId");
        return;
    }

    try {
        const respuesta = await consultarAPI("edificio", "SEARCH", {
            id_edificio: id,
            empieza: 0,
            filaspagina: 25
        });

        if (!respuesta || respuesta.ok === false) {
            throw new Error(
                respuesta?.code || "EDIFICIO_LOAD_ERROR"
            );
        }

        const edificio = obtenerEdificio(respuesta, id);

        if (!edificio) {
            mostrarError("edificios.errors.load");
            return;
        }

        edificioActual = edificio;

        renderizarDetalleEdificio(edificio);

    } catch (error) {
        console.error(
            "Error al cargar el detalle del edificio:",
            error
        );

        const mensaje = error.message === "ACCESO_DENEGADO_KO"
            ? "edificios.errors.noPermissionView"
            : "edificios.errors.load";

        mostrarError(mensaje);
    }
}

/* =========================================================
   EDICIÓN DEL EDIFICIO
========================================================= */
async function cargarGestoresDisponibles(idEdificio) {
    if (!esAdmin()) {
        gestoresDisponibles = [];
        return;
    }

    const respuesta = await consultarAPI(
        "usuario",
        "GESTORES_DISPONIBLES",
        {
            id_edificio: idEdificio
        }
    );

    if (!respuesta || respuesta.ok === false) {
        throw new Error(
            respuesta?.code || "GESTORES_LOAD_ERROR"
        );
    }

    gestoresDisponibles = Array.isArray(respuesta.resource)
        ? respuesta.resource
        : [];
}

/**
 * Rellena el selector con los gestores disponibles
 * y marca los que ya están asignados al edificio.
 */
function rellenarSelectorGestores() {
    const selector = document.getElementById(
        "building-detail-edit-managers"
    );

    const grupo = document.getElementById(
        "building-detail-managers-group"
    );

    if (!selector || !grupo || !esAdmin()) return;

    selector.innerHTML = "";

    const gestoresAsignados = Array.isArray(edificioActual.gestores)
        ? edificioActual.gestores.map(gestor =>
            Number(gestor.id_usuario)
        )
        : [];

    gestoresDisponibles.forEach(gestor => {
        const opcion = document.createElement("option");

        opcion.value = gestor.id_usuario;
        opcion.textContent = [
            gestor.nom_usuario,
            gestor.apell_usuario
        ].filter(Boolean).join(" ");

        opcion.selected = gestoresAsignados.includes(
            Number(gestor.id_usuario)
        );

        selector.appendChild(opcion);
    });

    selector.size = Math.max(2, Math.min(gestoresDisponibles.length, 4));

    grupo.hidden = false;
}

async function abrirEdicion() {
    if (!edificioActual || !puedeEditarEdificio(edificioActual)) {
        return;
    }

    if (esAdmin()) {
        try {
            await cargarGestoresDisponibles(
                edificioActual.id_edificio
            );

            rellenarSelectorGestores();

        } catch (error) {
            console.error(
                "Error al cargar los gestores:",
                error
            );

            mostrarErrorEdicion(
                "edificios.errors.load"
            );

            return;
        }
    }

    const formulario = document.getElementById(
        "building-detail-edit-form"
    );

    limpiarErroresCampos(formulario);

    establecerValorFormulario(
        "building-detail-edit-id",
        edificioActual.id_edificio
    );

    establecerValorFormulario(
        "building-detail-edit-id-display",
        edificioActual.id_edificio
    );

    establecerValorFormulario(
        "building-detail-edit-name",
        edificioActual.nom_edificio
    );

    establecerValorFormulario(
        "building-detail-edit-address",
        edificioActual.dir_edificio
    );

    establecerValorFormulario(
        "building-detail-edit-phone",
        edificioActual.tel_edificio
    );

    establecerValorFormulario(
        "building-detail-edit-year",
        edificioActual.anho_acad_edificio
    );

    const mensaje = document.getElementById(
        "building-detail-edit-message"
    );

    if (mensaje) {
        mensaje.hidden = true;
        mensaje.textContent = "";
        mensaje.classList.remove("is-error");
    }

    document.getElementById(
        "building-detail-content"
    ).hidden = true;

    document.getElementById(
        "building-detail-edit-section"
    ).hidden = false;
}

function cancelarEdicion() {
    const formulario = document.getElementById(
        "building-detail-edit-form"
    );

    limpiarErroresCampos(formulario);

    document.getElementById(
        "building-detail-edit-section"
    ).hidden = true;

    document.getElementById(
        "building-detail-content"
    ).hidden = false;
}

/* =========================================================
   GUARDAR CAMBIOS
========================================================= */

async function guardarEdicion(event) {
    event.preventDefault();

    if (!edificioActual || !puedeEditarEdificio(edificioActual)) {
        return;
    }

    const formulario = document.getElementById(
        "building-detail-edit-form"
    );

    const id = document.getElementById(
        "building-detail-edit-id"
    ).value;

    const nombre = document.getElementById(
        "building-detail-edit-name"
    ).value.trim();

    const direccion = document.getElementById(
        "building-detail-edit-address"
    ).value.trim();

    const telefono = document.getElementById(
        "building-detail-edit-phone"
    ).value.trim();

    const anho = document.getElementById(
        "building-detail-edit-year"
    ).value.trim();

    const mensaje = document.getElementById(
        "building-detail-edit-message"
    );

    const botonGuardar = document.getElementById(
        "building-detail-edit-save"
    );

    mensaje.hidden = true;
    mensaje.textContent = "";
    mensaje.classList.remove("is-error");

    if (!validarFormularioDetalle()) return;

    if (!formulario.reportValidity()) return;

    botonGuardar.disabled = true;

    try {
        const parametros = {
            id_edificio: id,
            nom_edificio: nombre,
            dir_edificio: direccion,
            tel_edificio: telefono,
            anho_acad_edificio: anho
        };

        if (esAdmin()) {
            const selector = document.getElementById(
                "building-detail-edit-managers"
            );

            if (!selector) {
                throw new Error("GESTORES_LOAD_ERROR");
            }

            parametros.gestores = Array.from(
                selector.selectedOptions
            ).map(opcion => Number(opcion.value));
        }

        const respuesta = await consultarAPI(
            "edificio",
            "EDIT",
            parametros
        );

        if (
            !respuesta ||
            respuesta.ok === false ||
            respuesta.code !== "QUERY_OK"
        ) {
            throw new Error(
                respuesta?.code || "EDIFICIO_EDIT_ERROR"
            );
        }

        edificioActual.nom_edificio = nombre;
        edificioActual.dir_edificio = direccion;
        edificioActual.tel_edificio = telefono;
        edificioActual.anho_acad_edificio = anho;
 
        if (esAdmin()) {
            edificioActual.gestores = gestoresDisponibles.filter(
                gestor => {
                    const selector = document.getElementById(
                        "building-detail-edit-managers"
                    );

                    return Array.from(selector.selectedOptions).some(
                        opcion =>
                            Number(opcion.value) === Number(gestor.id_usuario)
                    );
                }
            );
        }

        limpiarErroresCampos(formulario);

        renderizarDetalleEdificio(edificioActual);

        document.getElementById(
            "building-detail-edit-section"
        ).hidden = true;

        document.getElementById(
            "building-detail-content"
        ).hidden = false;

    } catch (error) {
        console.error(
            "Error al editar el edificio:",
            error
        );

        let textoError = traducir("edificios.errors.save");

        if (error.message === "ACCESO_DENEGADO_KO") {
            textoError = traducir(
                "edificios.errors.noPermissionEdit"
            );
        }

        mensaje.textContent = textoError;
        mensaje.classList.add("is-error");
        mensaje.hidden = false;

    } finally {
        botonGuardar.disabled = false;
    }
}

/* =========================================================
   NORMALIZACIÓN DE RESPUESTA
========================================================= */

function obtenerEdificio(respuesta, id) {
    if (!respuesta || respuesta.code === "RECORDSET_VACIO") {
        return null;
    }

    const recurso = respuesta.resource;

    if (Array.isArray(recurso)) {
        return recurso.find(
            edificio =>
                Number(edificio.id_edificio) === Number(id)
        ) || null;
    }

    if (
        recurso &&
        typeof recurso === "object" &&
        Number(recurso.id_edificio) === Number(id)
    ) {
        return recurso;
    }

    return null;
}

/* =========================================================
   RENDERIZADO
========================================================= */

function renderizarDetalleEdificio(edificio) {
    const nombre = edificio.nom_edificio || "—";
    const id = edificio.id_edificio || "—";
    const direccion = edificio.dir_edificio || "—";
    const telefono = edificio.tel_edificio || "—";
    const anho = edificio.anho_acad_edificio || "—";

    establecerTexto("building-detail-name", nombre);
    establecerTexto("building-detail-breadcrumb", nombre);

    establecerTexto("building-detail-id", id);
    establecerTexto("building-detail-name-value", nombre);
    establecerTexto("building-detail-address", direccion);
    establecerTexto("building-detail-phone", telefono);
    establecerTexto("building-detail-academic-year", anho);

    const gestores = Array.isArray(edificio.gestores)
        ? edificio.gestores
        : [];

    const nombresGestores = gestores
        .map(gestor =>
            `${gestor.nom_usuario || ""} ${gestor.apell_usuario || ""}`.trim()
        )
        .filter(Boolean);

    establecerTexto(
        "building-detail-managers",
        nombresGestores.length > 0
            ? nombresGestores.join(", ")
            : "—"
    );

    const botonEditar = document.getElementById(
        "building-detail-edit"
    );

    if (botonEditar) {
        botonEditar.hidden = !puedeEditarEdificio(edificio);
    }

    const contenido = document.getElementById(
        "building-detail-content"
    );

    if (contenido) {
        contenido.hidden = false;
    }

    const mensaje = document.getElementById(
        "building-detail-message"
    );

    if (mensaje) {
        mensaje.hidden = true;
        mensaje.textContent = "";
        mensaje.classList.remove("is-error");
    }

    if (typeof window.renderIcons === "function") {
        window.renderIcons();
    }
}

/* =========================================================
   ERRORES
========================================================= */

function mostrarError(clave) {
    claveErrorActual = clave;

    const mensaje = traducir(clave);

    const contenido = document.getElementById(
        "building-detail-content"
    );

    const formulario = document.getElementById(
        "building-detail-edit-section"
    );

    const mensajeElemento = document.getElementById(
        "building-detail-message"
    );

    if (contenido) contenido.hidden = true;
    if (formulario) formulario.hidden = true;

    establecerTexto(
        "building-detail-name",
        traducir("edificios.errors.load")
    );

    establecerTexto("building-detail-breadcrumb", "—");

    const botonEditar = document.getElementById(
        "building-detail-edit"
    );

    if (botonEditar) {
        botonEditar.hidden = true;
    }

    if (mensajeElemento) {
        mensajeElemento.textContent = mensaje;
        mensajeElemento.hidden = false;
        mensajeElemento.classList.add("is-error");
    }
}

/* =========================================================
   UTILIDADES
========================================================= */

function establecerTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor ?? "—";
    }
}

function establecerValorFormulario(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.value = valor ?? "";
    }
}

function mostrarErrorEdicion(clave) {
    const mensaje = document.getElementById(
        "building-detail-edit-message"
    );

    if (!mensaje) return;

    mensaje.textContent = traducir(clave);
    mensaje.classList.add("is-error");
    mensaje.hidden = false;
}
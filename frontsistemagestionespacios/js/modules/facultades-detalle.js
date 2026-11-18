
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

document.addEventListener("DOMContentLoaded", iniciarDetalleFacultad);

let facultadActual = null;
let claveErrorActual = null;

/* =========================================================
   INICIALIZACIÓN
========================================================= */

function iniciarDetalleFacultad() {
    const contenido = document.getElementById("faculty-detail-content");

    if (!contenido) return;

    configurarEventos();
    configurarValidacionesDetalle();

    document.addEventListener("langChanged", () => {
        if (claveErrorActual) mostrarError(claveErrorActual);
    });
    cargarDetalleFacultad();
}

/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {
    const botonVolver = document.getElementById("faculty-detail-back");
    const botonEditar = document.getElementById("faculty-detail-edit");

    const formularioEdicion = document.getElementById(
        "faculty-detail-edit-form"
    );

    const botonCancelar = document.getElementById(
        "faculty-detail-edit-cancel"
    );

    botonVolver?.addEventListener("click", (evento) => {
        evento.preventDefault();
        window.location.href = "facultades.html";
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
        "faculty-detail-edit-name"
    );

    const inputAnho = document.getElementById(
        "faculty-detail-edit-year"
    );

    registrarValidacion(inputNombre, validarNombreDetalle);
    registrarValidacion(inputAnho, validarAnhoDetalle);
}

/**
 * Valida el nombre de la facultad.
 */
function validarNombreDetalle() {
    const input = document.getElementById(
        "faculty-detail-edit-name"
    );

    return validarCampoTexto(
        input,
        REGLAS_CAMPOS.facultad.nombre_facultad,
        {
            min_size: traducir("facultades.validation.nameMinSize"),
            max_size: traducir("facultades.validation.nameMaxSize"),
            format: traducir("facultades.validation.nameFormat")
        }
    );
}

/**
 * Valida el formato y las reglas del año académico.
 */
function validarAnhoDetalle() {
    const input = document.getElementById(
        "faculty-detail-edit-year"
    );

    const regla = REGLAS_CAMPOS.facultad.anho_academico_facultad;

    const validoFormato = validarCampoTexto(
        input,
        regla,
        {
            min_size: traducir("facultades.validation.academicYearFormat"),
            max_size: traducir("facultades.validation.academicYearFormat"),
            format: traducir("facultades.validation.academicYearFormat")
        }
    );

    if (!validoFormato || !input) return false;

    const coincidencia = input.value.trim().match(/^(\d{4})-(\d{4})$/);

    if (!coincidencia) {
        mostrarErrorCampo(
            input,
            traducir("facultades.validation.academicYearFormat")
        );
        return false;
    }

    const anhoInicio = Number(coincidencia[1]);
    const anhoFin = Number(coincidencia[2]);
    const anhoActual = new Date().getFullYear();
    if (anhoInicio < anhoActual) {
                mostrarErrorCampo(
            input,
            traducir("facultades.validation.academicYearMin")
        );
        return false;
    }

    if (anhoFin !== anhoInicio + 1) {
        mostrarErrorCampo(
            input,
            traducir("facultades.validation.academicYearConsecutive")
        );
        return false;
    }

    return true;
}

/**
 * Ejecuta todas las validaciones del formulario.
 */
function validarFormularioDetalle() {
    const nombreValido = validarNombreDetalle();
    const anhoValido = validarAnhoDetalle();

    return nombreValido && anhoValido;
}

/* =========================================================
   CARGA DE LA FACULTAD
========================================================= */

async function cargarDetalleFacultad() {
    const parametrosURL = new URLSearchParams(window.location.search);
    const id = parametrosURL.get("id");

    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
        mostrarError("facultades.detail.invalidId");
        return;
    }

    try {
        const respuesta = await consultarAPI("facultad", "SEARCH", {
            id_facultad: id
        });

        if (!respuesta || respuesta.ok === false) {
            throw new Error(respuesta?.code || "FACULTAD_LOAD_ERROR");
        }

        const facultad = obtenerFacultad(respuesta, id);

        if (!facultad) {
            mostrarError("facultades.errors.load");
            return;
        }

        facultadActual = facultad;

        renderizarDetalleFacultad(facultad);

    } catch (error) {
        console.error("Error al cargar el detalle de la facultad:", error);

        const mensaje = error.message === "ACCESO_DENEGADO_KO"
            ? "facultades.errors.noPermissionView"
            : "facultades.errors.load";
        mostrarError(mensaje);
    }
}

/* =========================================================
   EDICIÓN DE LA FACULTAD
========================================================= */

function abrirEdicion() {
    if (!facultadActual) return;

    const formulario = document.getElementById(
        "faculty-detail-edit-form"
    );

    // Limpiamos los errores anteriores.
    limpiarErroresCampos(formulario);

    establecerValorFormulario(
        "faculty-detail-edit-id",
        facultadActual.id_facultad
    );

    establecerValorFormulario(
        "faculty-detail-edit-id-display",
        facultadActual.id_facultad
    );

    establecerValorFormulario(
        "faculty-detail-edit-name",
        facultadActual.nom_facultad
    );

    establecerValorFormulario(
        "faculty-detail-edit-year",
        facultadActual.anho_acad_facultad
    );

    const mensaje = document.getElementById(
        "faculty-detail-edit-message"
    );

    if (mensaje) {
        mensaje.hidden = true;
        mensaje.textContent = "";
        mensaje.classList.remove("is-error");
    }

    document.getElementById("faculty-detail-content").hidden = true;
    document.getElementById("faculty-detail-edit-section").hidden = false;
}

function cancelarEdicion() {
    const formulario = document.getElementById(
        "faculty-detail-edit-form"
    );

    limpiarErroresCampos(formulario);

    document.getElementById("faculty-detail-edit-section").hidden = true;
    document.getElementById("faculty-detail-content").hidden = false;
}

/* =========================================================
   GUARDAR CAMBIOS
========================================================= */

async function guardarEdicion(event) {
    event.preventDefault();

    const formulario = document.getElementById(
        "faculty-detail-edit-form"
    );

    const id = document.getElementById(
        "faculty-detail-edit-id"
    ).value;

    const nombre = document.getElementById(
        "faculty-detail-edit-name"
    ).value.trim();

    const anho = document.getElementById(
        "faculty-detail-edit-year"
    ).value.trim();

    const mensaje = document.getElementById(
        "faculty-detail-edit-message"
    );

    const botonGuardar = document.getElementById(
        "faculty-detail-edit-save"
    );

    mensaje.hidden = true;
    mensaje.textContent = "";
    mensaje.classList.remove("is-error");

    // Validamos los campos antes de enviar los datos.
    if (!validarFormularioDetalle()) return;

    // Conservamos también las validaciones HTML del formulario.
    if (!formulario.reportValidity()) return;

    botonGuardar.disabled = true;

    try {
        const respuesta = await consultarAPI("facultad", "EDIT", {
            id_facultad: id,
            nom_facultad: nombre,
            anho_acad_facultad: anho
        });

        if (
            !respuesta ||
            respuesta.ok === false ||
            respuesta.code !== "QUERY_OK"
        ) {
            throw new Error(respuesta?.code || "FACULTAD_EDIT_ERROR");
        }

        // Actualizamos el objeto local.
        facultadActual.nom_facultad = nombre;
        facultadActual.anho_acad_facultad = anho;

        // Limpiamos los errores.
        limpiarErroresCampos(formulario);

        // Mostramos los datos actualizados.
        renderizarDetalleFacultad(facultadActual);

        // Ocultamos el formulario y volvemos al detalle.
        document.getElementById("faculty-detail-edit-section").hidden = true;
        document.getElementById("faculty-detail-content").hidden = false;

    } catch (error) {
        console.error("Error al editar la facultad:", error);

        let textoError = traducir("facultades.errors.save");

        if (error.message === "ACCESO_DENEGADO_KO") {
            textoError = traducir("facultades.errors.noPermissionEdit");
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

function obtenerFacultad(respuesta, id) {
    if (!respuesta || respuesta.code === "RECORDSET_VACIO") {
        return null;
    }

    const recurso = respuesta.resource;

    if (Array.isArray(recurso)) {
        return recurso.find(
            facultad => Number(facultad.id_facultad) === Number(id)
        ) || null;
    }

    if (
        recurso &&
        typeof recurso === "object" &&
        Number(recurso.id_facultad) === Number(id)
    ) {
        return recurso;
    }

    return null;
}

/* =========================================================
   RENDERIZADO
========================================================= */

function renderizarDetalleFacultad(facultad) {
    const nombre = facultad.nom_facultad || "—";
    const id = facultad.id_facultad || "—";
    const anho = facultad.anho_acad_facultad || "—";

    establecerTexto("faculty-detail-name", nombre);
    establecerTexto("faculty-detail-breadcrumb", nombre);

    establecerTexto("faculty-detail-id", id);
    establecerTexto("faculty-detail-name-value", nombre);
    establecerTexto("faculty-detail-academic-year", anho);

    const contenido = document.getElementById(
        "faculty-detail-content"
    );

    if (contenido) {
        contenido.hidden = false;
    }

    const mensaje = document.getElementById(
        "faculty-detail-message"
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
        "faculty-detail-content"
    );

    const formulario = document.getElementById(
        "faculty-detail-edit-section"
    );

    const mensajeElemento = document.getElementById(
        "faculty-detail-message"
    );

    if (contenido) contenido.hidden = true;
    if (formulario) formulario.hidden = true;

    establecerTexto(
        "faculty-detail-name",
        traducir("facultades.errors.load")
    );

    establecerTexto("faculty-detail-breadcrumb", "—");

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
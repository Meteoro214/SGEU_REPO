
/* =========================================================
   Archivo: edificios.js
   Descripción: Gestión de edificios.
   ========================================================= */

import { consultarAPI } from "../api/api.js";
import { traducir } from "../i18n/i18n.js";

import {
    validarCampoTexto,
    limpiarErroresCampos,
    mostrarErrorCampo
} from "../common/form-errors.js";

import {
    REGLAS_CAMPOS,
    registrarValidacion
} from "../common/validation.js";

document.addEventListener("DOMContentLoaded", iniciarEdificios);

const EDIFICIOS_POR_PAGINA = 25;

let edificios = [];
let edificiosFiltradas = [];
let gestoresDisponibles = [];
let paginaActual = 1;
let modoFormulario = "ADD";
let edificiosModal = null;
let confirmacionModal = null;
let eliminarIdPendiente = null;
let duplicarEdificiosModal = null;

/* =========================================================
   USUARIO Y PERMISOS
========================================================= */

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

function puedeGestionarEdificio(edificio) {
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

function iniciarEdificios() {
    const tabla = document.getElementById("buildings-table-body");

    if (!tabla) return;

    configurarModales();
    configurarEventos();
    cargarEdificios();

    document.addEventListener("langChanged", () => {
        actualizarFiltroAnhos();
        renderizarEdificios();
    });
}

/* =========================================================
   MODALES
========================================================= */

function configurarModales() {
    const modalFormulario = document.getElementById("buildings-modal");
    const modalConfirmacion = document.getElementById(
        "buildings-feedback-modal"
    );

    const modalDuplicacion = document.getElementById(
        "buildings-duplicate-modal"
    );

    if (!window.SGEU?.crearModal) {
        console.error("No se ha cargado correctamente modal.js");
        return;
    }

    if (modalFormulario) {
        edificiosModal = window.SGEU.crearModal({
            modal: modalFormulario,
            botonesCerrar: [
                ...modalFormulario.querySelectorAll("[data-modal-close]")
            ]
        });
    }

    if (modalConfirmacion) {
        confirmacionModal = window.SGEU.crearModal({
            modal: modalConfirmacion,
            botonesCerrar: [
                document.getElementById("buildings-feedback-cancel"),
                modalConfirmacion.querySelector(".buildings-feedback-overlay")
            ]
        });
    }

    if (modalDuplicacion) {
        duplicarEdificiosModal = window.SGEU.crearModal({
            modal: modalDuplicacion,
            botonesCerrar: [
                ...modalDuplicacion.querySelectorAll("[data-modal-close]")
            ]
        });
    }
}

/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {
    const botonNuevo = document.getElementById("buildings-new-button");
    const modoDuplicacion = document.getElementById("buildings-duplicate-mode");
    const selectorEdificios = document.getElementById("buildings-duplicate-buildings");
    const selectorAnho = document.getElementById("buildings-duplicate-year");
    const botonConfirmarDuplicacion = document.getElementById("buildings-duplicate-confirm");
    const botonDuplicar = document.getElementById("buildings-duplicate-button");
    const formulario = document.getElementById("buildings-form");
    const buscador = document.getElementById("buildings-search");
    const filtroAnho = document.getElementById("buildings-year-filter");
    const paginacion = document.getElementById("buildings-pagination");
    const tabla = document.getElementById("buildings-table-body");
    const botonConfirmar = document.getElementById("buildings-feedback-confirm");
    const botonFiltros = document.getElementById("buildings-filter-toggle");
    const panelFiltros = document.getElementById("buildings-filter-panel");
    const botonAplicarFiltros = document.getElementById("buildings-filter-apply");
    const botonLimpiarFiltros = document.getElementById("buildings-filter-reset");

    botonNuevo?.addEventListener("click", abrirFormularioNuevo);
    botonDuplicar?.addEventListener("click",abrirModalDuplicacionEdificios);
    modoDuplicacion?.addEventListener("change", cambiarModoDuplicacionEdificios);
    selectorEdificios?.addEventListener("change", actualizarResumenDuplicacionEdificios);
    selectorAnho?.addEventListener("change", actualizarResumenDuplicacionEdificios);
    botonConfirmarDuplicacion?.addEventListener("click", confirmarDuplicacionEdificios);
    formulario?.addEventListener("submit", guardarEdificio);
    buscador?.addEventListener("input", aplicarFiltros);
    botonFiltros?.addEventListener("click", () => {
        const abierto = botonFiltros.getAttribute("aria-expanded") === "true";

        botonFiltros.setAttribute("aria-expanded", String(!abierto));

        if (panelFiltros) {
            panelFiltros.hidden = abierto;
        }
    });

    botonAplicarFiltros?.addEventListener("click", () => {
        aplicarFiltros();

        if (panelFiltros) {
            panelFiltros.hidden = true;
        }

        botonFiltros?.setAttribute("aria-expanded", "false");
    });

    botonLimpiarFiltros?.addEventListener("click", () => {
        if (filtroAnho) {
            filtroAnho.value = "";
        }

        if (buscador) {
            buscador.value = "";
        }

        aplicarFiltros();

        if (panelFiltros) {
            panelFiltros.hidden = true;
        }

        botonFiltros?.setAttribute("aria-expanded", "false");
    });
    paginacion?.addEventListener("click", cambiarPagina);
    tabla?.addEventListener("click", gestionarAccionesTabla);
    botonConfirmar?.addEventListener("click", eliminarEdificio);

    configurarValidacionesCampos();
}

/* =========================================================
   DUPLICACIÓN MÚLTIPLE DE EDIFICIOS
========================================================= */

function abrirModalDuplicacionEdificios() {

    const selectorEdificios = document.getElementById(
        "buildings-duplicate-buildings"
    );

    const selectorAnho = document.getElementById(
        "buildings-duplicate-year"
    );

    const selectorModo = document.getElementById(
        "buildings-duplicate-mode"
    );

    const inputDestino = document.getElementById(
        "buildings-duplicate-target-year"
    );

    const mensaje = document.getElementById(
        "buildings-duplicate-message"
    );

    if (
        !selectorEdificios ||
        !selectorAnho ||
        !selectorModo ||
        !inputDestino
    ) {
        console.error("Faltan elementos del modal de duplicación.");
        return;
    }

    // Limpiar el estado anterior.
    selectorModo.value = "edificio";
    selectorEdificios.innerHTML = "";
    selectorAnho.innerHTML = "";
    inputDestino.value = "";

    if (mensaje) {
        mensaje.textContent = "";
        mensaje.hidden = true;
        mensaje.classList.remove("is-error", "is-success");
    }

    // Cargar todos los edificios, sin aplicar los filtros de la tabla.
    if (edificios.length === 0) {
        selectorEdificios.innerHTML = `
            <option value="" disabled>
                ${escaparHTML(traducir("edificios.duplicate.noBuildings"))}
            </option>
        `;
    } else {
        selectorEdificios.innerHTML = edificios.map(edificio => `
            <option value="${escaparHTML(edificio.id_edificio)}">
                ${escaparHTML(edificio.nom_edificio)}
                (${escaparHTML(edificio.anho_acad_edificio)})
            </option>
        `).join("");
    }

    ajustarFilasSelector(selectorEdificios);

    // Cargar los años académicos disponibles.
    const anhos = [
        ...new Set(
            edificios
                .map(edificio => edificio.anho_acad_edificio)
                .filter(Boolean)
        )
    ].sort().reverse();

    selectorAnho.innerHTML = `
        <option value="">
            ${escaparHTML(traducir("edificios.duplicate.selectYear"))}
        </option>
        ${anhos.map(anho => `
            <option value="${escaparHTML(anho)}">
                ${escaparHTML(anho)}
            </option>
        `).join("")}
    `;

    cambiarModoDuplicacionEdificios();

    duplicarEdificiosModal?.abrir();
}

function cambiarModoDuplicacionEdificios() {
    const selectorModo = document.getElementById(
        "buildings-duplicate-mode"
    );

    const grupoEdificios = document.getElementById(
        "buildings-duplicate-building-group"
    );

    const grupoAnhos = document.getElementById(
        "buildings-duplicate-year-group"
    );

    if (!selectorModo || !grupoEdificios || !grupoAnhos) return;

    const modo = selectorModo.value;

    grupoEdificios.hidden = modo !== "edificio";
    grupoAnhos.hidden = modo !== "anho";

    actualizarResumenDuplicacionEdificios();
}

function obtenerEdificiosParaDuplicar() {
    const modo = document.getElementById(
        "buildings-duplicate-mode"
    )?.value;

    if (modo === "anho") {
        const anho = document.getElementById(
            "buildings-duplicate-year"
        )?.value;

        if (!anho) return [];

        return edificios.filter(
            edificio => edificio.anho_acad_edificio === anho
        );
    }

    const selector = document.getElementById(
        "buildings-duplicate-buildings"
    );

    const ids = Array.from(
        selector?.selectedOptions || []
    ).map(opcion => Number(opcion.value));

    return edificios.filter(
        edificio => ids.includes(Number(edificio.id_edificio))
    );
}

function actualizarResumenDuplicacionEdificios() {
    const resumen = document.getElementById(
        "buildings-duplicate-summary"
    );

    const lista = document.getElementById(
        "buildings-duplicate-summary-list"
    );

    const contador = document.getElementById(
        "buildings-duplicate-count"
    );

    if (!resumen || !lista) return;

    const seleccionados = obtenerEdificiosParaDuplicar();

    // Actualizar contador
    if (contador) {
    contador.textContent = seleccionados.length;
    }

    const textoResumen = resumen.querySelector(
        "[data-i18n='edificios.duplicate.summary']"
    );

    if (textoResumen) {
        textoResumen.textContent = traducir(
            "edificios.duplicate.summary",
            { count: seleccionados.length }
        );
    }

    // Actualizar lista
    lista.innerHTML = "";

    if (seleccionados.length === 0) {
        resumen.hidden = true;
        return;
    }

    lista.innerHTML = seleccionados.map(edificio => `
        <li>
            ${escaparHTML(edificio.nom_edificio)}
            — ${escaparHTML(edificio.anho_acad_edificio)}
        </li>
    `).join("");

    resumen.hidden = false;
}

function mostrarMensajeDuplicacion(mensaje, tipo = "error") {
    const elemento = document.getElementById(
        "buildings-duplicate-message"
    );

    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.hidden = !mensaje;

    elemento.classList.remove("is-error", "is-success");

    if (tipo === "error") {
        elemento.classList.add("is-error");
    } else if (tipo === "success") {
        elemento.classList.add("is-success");
    }
}

function validarDuplicacionEdificios() {
    const inputDestino = document.getElementById(
        "buildings-duplicate-target-year"
    );

    const anhoDestino = inputDestino?.value.trim() || "";

    const seleccionados = obtenerEdificiosParaDuplicar();

    if (seleccionados.length === 0) {
        mostrarMensajeDuplicacion(
            traducir("edificios.duplicate.selectBuildings")
        );
        return false;
    }

    const coincidencia = anhoDestino.match(/^(\d{4})-(\d{4})$/);

    if (!coincidencia) {
        mostrarMensajeDuplicacion(
            traducir("edificios.validation.academicYearFormat")
        );
        inputDestino?.focus();
        return false;
    }

    const anhoInicio = Number(coincidencia[1]);
    const anhoFin = Number(coincidencia[2]);
    const anhoActual = new Date().getFullYear();

    if (anhoInicio < anhoActual) {
        mostrarMensajeDuplicacion(
            traducir("edificios.validation.academicYearMin")
        );
        inputDestino?.focus();
        return false;
    }

    if (anhoFin !== anhoInicio + 1) {
        mostrarMensajeDuplicacion(
            traducir("edificios.validation.academicYearConsecutive")
        );
        inputDestino?.focus();
        return false;
    }

    const anhosOrigen = seleccionados.map(edificio => {
        const coincidenciaOrigen = String(
            edificio.anho_acad_edificio
        ).match(/^(\d{4})-(\d{4})$/);

        return coincidenciaOrigen
            ? Number(coincidenciaOrigen[1])
            : NaN;
    });

    if (anhosOrigen.some(Number.isNaN)) {
        mostrarMensajeDuplicacion(
             traducir("edificios.duplicate.yearInvalid")
        );
        return false;
    }

    const anhoOrigenMaximo = Math.max(...anhosOrigen);

    if (anhoInicio <= anhoOrigenMaximo) {
        mostrarMensajeDuplicacion(
            traducir("edificios.duplicate.yearRecent")
        );
        inputDestino?.focus();
        return false;
    }

    return true;
}


async function confirmarDuplicacionEdificios() {
   
    const boton = document.getElementById(
        "buildings-duplicate-confirm"
    );

    try {
        // Validar los datos del formulario.
        if (!validarDuplicacionEdificios()) {
            return;
        }

        const seleccionados = obtenerEdificiosParaDuplicar();

        const idsEdificios = seleccionados.map(
            edificio => Number(edificio.id_edificio)
        );

        const anhoDestino = document
            .getElementById("buildings-duplicate-target-year")
            .value
            .trim();

        if (boton) {
            boton.disabled = true;
        }

        mostrarMensajeDuplicacion(
            traducir("common.loading"),
            "info"
        );

        const respuesta = await consultarAPI(
            "edificio",
            "DUPLICAR",
            {
                edificios: idsEdificios,
                anho_acad_edificio: anhoDestino
            }
        );

        if (
            !respuesta ||
            respuesta.ok !== true ||
            respuesta.code !== "EDIFICIOS_DUPLICADOS_OK"
        ) {
            throw new Error(
                respuesta?.message ||
                "No se pudieron duplicar los edificios."
            );
        }

        duplicarEdificiosModal?.cerrar();

        // Actualizar el listado de edificios.
        await cargarEdificios();

        mostrarMensaje(
            traducir("edificios.duplicate.success"),
            "success"
        );

    } catch (error) {
        console.error(
            "Error al duplicar edificios:",
            error
        );

        mostrarMensajeDuplicacion(
            error.message ||
            traducir("edificios.duplicate.error"),
            "error"
        );

    } finally {
        if (boton) {
            boton.disabled = false;
            boton.textContent = traducir("edificios.duplicate.confirm");
        }
    }
}


/* =========================================================
   CONSULTA DE EDIFICIOS
========================================================= */

async function cargarEdificios() {
    const tabla = document.getElementById("buildings-table-body");

    mostrarEstadoCarga(tabla);

    try {
        edificios = await cargarTodosLosEdificios();

        actualizarFiltroAnhos();
        aplicarFiltros();

        mostrarMensaje("");

    } catch (error) {
        console.error("Error al cargar edificios:", error);

        mostrarMensaje(
            traducir("edificios.errors.load"),
            "error"
        );

        if (tabla) tabla.innerHTML = "";
    }
}

async function cargarTodosLosEdificios() {
    const resultados = [];

    let empieza = 0;
    let total = 0;

    do {
        const respuesta = await consultarAPI(
            "edificio",
            "SEARCH",
            {
                empieza,
                filaspagina: EDIFICIOS_POR_PAGINA
            }
        );

        if (!respuesta || respuesta.ok === false) {
            throw new Error(
                respuesta?.code || "EDIFICIOS_LOAD_ERROR"
            );
        }

        const registros = Array.isArray(respuesta.resource)
            ? respuesta.resource
            : [];

        resultados.push(...registros);

        total = Number(respuesta.total) || 0;

        empieza += EDIFICIOS_POR_PAGINA;

        if (
            registros.length === 0 ||
            registros.length < EDIFICIOS_POR_PAGINA
        ) {
            break;
        }

    } while (empieza < total);

    return resultados;
}

function ajustarFilasSelector(selector) {
    if (!selector) return;

    selector.size = Math.max(
        2,
        Math.min(selector.options.length, 4)
    );
}

async function cargarGestoresDisponibles(idEdificio = null) {
    if (!esAdmin()) {
        gestoresDisponibles = [];
        return;
    }

    const parametros = {};

    if (idEdificio !== null) {
        parametros.id_edificio = idEdificio;
    }

    const respuesta = await consultarAPI(
        "usuario",
        "GESTORES_DISPONIBLES",
        parametros
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

function renderizarSelectorGestores(gestoresSeleccionados = []) {
    const selector = document.getElementById("buildings-managers");

    if (!selector) return;

    const seleccionados = gestoresSeleccionados.map(Number);

    if (gestoresDisponibles.length === 0) {
        selector.innerHTML = `
            <option value="" disabled data-i18n="edificios.form.noManagers">
            </option>
        `;
    } else {
        selector.innerHTML = gestoresDisponibles.map(gestor => {
            const nombre = [
                gestor.nom_usuario,
                gestor.apell_usuario
            ].filter(Boolean).join(" ");

            const seleccionado = seleccionados.includes(
                Number(gestor.id_usuario)
            );

            return `
                <option
                    value="${escaparHTML(gestor.id_usuario)}"
                    ${seleccionado ? "selected" : ""}
                >
                    ${escaparHTML(nombre)}
                </option>
            `;
        }).join("");
    }

    ajustarFilasSelector(selector);
}

/* =========================================================
   FILTRO POR AÑO ACADÉMICO
========================================================= */

function actualizarFiltroAnhos() {
    const filtro = document.getElementById("buildings-year-filter");

    if (!filtro) return;

    const valorAnterior = filtro.value;

    const anhos = [
        ...new Set(
            edificios
                .map(edificio => edificio.anho_acad_edificio)
                .filter(Boolean)
        )
    ].sort().reverse();

    filtro.innerHTML = `
        <option value="">
            ${escaparHTML(
                traducir("edificios.filter.allYears")
            )}
        </option>

        ${anhos.map(anho => `
            <option value="${escaparHTML(anho)}">
                ${escaparHTML(anho)}
            </option>
        `).join("")}
    `;

    if (anhos.includes(valorAnterior)) {
        filtro.value = valorAnterior;
    }
}

/* =========================================================
   BÚSQUEDA Y FILTRADO
========================================================= */

function aplicarFiltros() {
    const buscador = document.getElementById("buildings-search");
    const filtroAnho = document.getElementById("buildings-year-filter");

    const texto = normalizarTexto(buscador?.value || "");
    const anhoSeleccionado = filtroAnho?.value || "";

    edificiosFiltradas = edificios.filter(edificio => {
        const nombre = normalizarTexto(
            edificio.nom_edificio || ""
        );

        const coincideNombre = nombre.includes(texto);

        const coincideAnho = !anhoSeleccionado ||
            edificio.anho_acad_edificio === anhoSeleccionado;

        return coincideNombre && coincideAnho;
    });

    paginaActual = 1;

    renderizarEdificios();
}

function normalizarTexto(texto) {
    return String(texto)
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/* =========================================================
   VALIDACIÓN DE CAMPOS
========================================================= */


function configurarValidacionesCampos() {
    const inputNombre = document.getElementById("buildings-name");
    const inputDireccion = document.getElementById("buildings-address");
    const inputTelefono = document.getElementById("buildings-phone");
    const inputAnho = document.getElementById("buildings-academic-year");

    registrarValidacion(inputNombre, validarNombreEdificio);
    registrarValidacion(inputDireccion, validarDireccionEdificio);
    registrarValidacion(inputTelefono, validarTelefonoEdificio);
    registrarValidacion(inputAnho, validarAnhoAcademico);
}

function validarNombreEdificio() {
    const input = document.getElementById("buildings-name");
    const regla = REGLAS_CAMPOS.edificio.nombre_edificio;

    return validarCampoTexto(input, regla, {
        min_size: traducir("edificios.validation.nameMinSize"),
        max_size: traducir("edificios.validation.nameMaxSize"),
        format: traducir("edificios.validation.nameFormat")
    });
}

function validarDireccionEdificio() {
    const input = document.getElementById("buildings-address");
    const regla = REGLAS_CAMPOS.edificio.direccion_edificio;

    return validarCampoTexto(input, regla, {
        min_size: traducir("edificios.validation.addressMinSize"),
        max_size: traducir("edificios.validation.addressMaxSize"),
        format: traducir("edificios.validation.addressFormat")
    });
}

function validarTelefonoEdificio() {
    const input = document.getElementById("buildings-phone");
    const regla = REGLAS_CAMPOS.edificio.telefono_edificio;

    return validarCampoTexto(input, regla, {
        min_size: traducir("edificios.validation.phoneMinSize"),
        max_size: traducir("edificios.validation.phoneMaxSize"),
        format: traducir("edificios.validation.phoneFormat")
    }, true);
}

function validarAnhoAcademico() {
    const input = document.getElementById(
        "buildings-academic-year"
    );

    const regla = REGLAS_CAMPOS.edificio.anho_academico_edificio;

    const validoFormato = validarCampoTexto(input, regla, {
        min_size: traducir("edificios.validation.academicYearFormat"),
        max_size: traducir("edificios.validation.academicYearFormat"),
        format: traducir("edificios.validation.academicYearFormat")
    });

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

    // Se mantiene la restricción original.
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

function validarFormularioEdificio() {
    const nombreValido = validarNombreEdificio();
    const direccionValida = validarDireccionEdificio();
    const telefonoValido = validarTelefonoEdificio();
    const anhoValido = validarAnhoAcademico();

    return nombreValido && direccionValida && telefonoValido && anhoValido;
}

function limpiarErroresFormularioEdificio() {
    const formulario = document.getElementById("buildings-form");
    limpiarErroresCampos(formulario);
}

/* =========================================================
   RENDERIZADO DE TABLA
========================================================= */


function renderizarEdificios() {
    const tabla = document.getElementById("buildings-table-body");
    const contador = document.getElementById("buildings-count");
    const estadoVacio = document.getElementById("buildings-empty");

    if (!tabla) return;

    const total = edificiosFiltradas.length;

    const totalPaginas = Math.ceil(
        total / EDIFICIOS_POR_PAGINA
    );

    const inicio = (paginaActual - 1) * EDIFICIOS_POR_PAGINA;

    const registros = edificiosFiltradas.slice(
        inicio,
        inicio + EDIFICIOS_POR_PAGINA
    );

    tabla.innerHTML = registros.map(edificio => {
        const puedeGestionar = puedeGestionarEdificio(edificio);

        const gestores = Array.isArray(edificio.gestores)
            ? edificio.gestores
            : [];

        const nombresGestores = gestores.length > 0
            ? gestores.map(gestor =>
                escaparHTML(
                    `${gestor.nom_usuario} ${gestor.apell_usuario}`
                )
            ).join("<br>")
            : `<span class="buildings-no-managers">${traducir("edificios.table.noManagers")}</span>`;

        return `
            <tr>
                <td>${escaparHTML(edificio.id_edificio)}</td>

                <td>${escaparHTML(edificio.nom_edificio)}</td>

                <td>${nombresGestores}</td>

                <td>${escaparHTML(edificio.dir_edificio)}</td>

                <td>${escaparHTML(edificio.anho_acad_edificio)}</td>

                <td>
                    <div class="table-actions">

                        <button
                            type="button"
                            class="table-action-button"
                            data-action="view"
                            data-buildings-id="${escaparHTML(edificio.id_edificio)}"
                            aria-label="${escaparHTML(
                                traducir("edificios.actions.view")
                            )}">
                            <span data-icon="eye" aria-hidden="true"></span>
                        </button>

                        ${puedeGestionar ? `
                            <button
                                type="button"
                                class="table-action-button"
                                data-action="edit"
                                data-buildings-id="${escaparHTML(edificio.id_edificio)}"
                                aria-label="${escaparHTML(
                                    traducir("edificios.actions.edit")
                                )}">
                                <span data-icon="edit" aria-hidden="true"></span>
                            </button>

                            <button
                                type="button"
                                class="table-action-button"
                                data-action="delete"
                                data-buildings-id="${escaparHTML(edificio.id_edificio)}"
                                aria-label="${escaparHTML(
                                    traducir("edificios.actions.delete")
                                )}">
                                <span data-icon="trash" aria-hidden="true"></span>
                            </button>
                        ` : ""}

                    </div>
                </td>
            </tr>
        `;
    }).join("");

    if (contador) {
        contador.textContent = traducir(
            total === 1 ? "edificios.countOne" : "edificios.countMany",
            { count: total }
        );
    }

    if (estadoVacio) {
        estadoVacio.hidden = total > 0;
    }

    renderizarPaginacion(totalPaginas);

    if (typeof window.renderIcons === "function") {
        window.renderIcons();
    }
}


/* =========================================================
   PAGINACIÓN
========================================================= */

function renderizarPaginacion(totalPaginas) {
    const contenedor = document.getElementById(
        "buildings-pagination"
    );

    if (!contenedor) return;

    if (totalPaginas <= 1) {
        contenedor.innerHTML = "";
        return;
    }

    let html = `
        <button
            type="button"
            data-page="${paginaActual - 1}"
            ${paginaActual === 1 ? "disabled" : ""}>
            ${escaparHTML(traducir("common.previous"))}
        </button>
    `;

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
        html += `
            <button
                type="button"
                data-page="${pagina}"
                class="${pagina === paginaActual ? "active" : ""}"
                ${pagina === paginaActual
                    ? 'aria-current="page"'
                    : ""}>
                ${pagina}
            </button>
        `;
    }

    html += `
        <button
            type="button"
            data-page="${paginaActual + 1}"
            ${paginaActual === totalPaginas ? "disabled" : ""}>
            ${escaparHTML(traducir("common.next"))}
        </button>
    `;

    contenedor.innerHTML = html;
}

function cambiarPagina(evento) {
    const boton = evento.target.closest("[data-page]");

    if (!boton || boton.disabled) return;

    const pagina = Number(boton.dataset.page);

    const totalPaginas = Math.ceil(
        edificiosFiltradas.length / EDIFICIOS_POR_PAGINA
    );

    if (pagina < 1 || pagina > totalPaginas) return;

    paginaActual = pagina;

    renderizarEdificios();
}

/* =========================================================
   ALTA Y EDICIÓN
========================================================= */

async function abrirFormularioNuevo() {
    // Solo ADMIN puede crear edificios.
    if (!esAdmin()) return;

    modoFormulario = "ADD";
    document.getElementById("buildings-academic-year").disabled = false;

    const formulario = document.getElementById("buildings-form");
    const grupoId = document.getElementById("buildings-id-group");

    formulario?.reset();

    try {
        await cargarGestoresDisponibles();
        renderizarSelectorGestores();
    } catch (error) {
        console.error("Error al cargar gestores:", error);

        mostrarMensajeFormulario(
            traducir("edificios.errors.load")
        );

        return;
    }

    establecerValor("buildings-id", "");
    establecerValor("buildings-id-display", "");

    if (grupoId) {
        grupoId.hidden = true;
    }

    limpiarErroresFormularioEdificio();
    limpiarMensajeFormulario();

    cambiarTituloModal(
        traducir("edificios.modal.newTitle"),
        traducir("edificios.modal.newDescription")
    );

    edificiosModal?.abrir();
}


async function abrirFormularioEdicion(edificio) {
    if (!puedeGestionarEdificio(edificio)) return;

    modoFormulario = "EDIT";
    document.getElementById("buildings-academic-year").disabled = true;

    const grupoId = document.getElementById("buildings-id-group");

    establecerValor("buildings-id", edificio.id_edificio);
    establecerValor("buildings-id-display", edificio.id_edificio);
    establecerValor("buildings-name", edificio.nom_edificio);
    establecerValor(
        "buildings-academic-year",
        edificio.anho_acad_edificio
    );
    establecerValor("buildings-address", edificio.dir_edificio);
    establecerValor("buildings-phone", edificio.tel_edificio);

    if (grupoId) {
        grupoId.hidden = false;
    }

    // Cargar y marcar los gestores asignados.
    if (esAdmin()) {
        await cargarGestoresDisponibles(
            Number(edificio.id_edificio)
        );

        const gestoresAsignados = Array.isArray(edificio.gestores)
            ? edificio.gestores.map(gestor => String(gestor.id_usuario))
            : [];

        renderizarSelectorGestores(gestoresAsignados);

        const ayudaGestores = document.querySelector(
            "#buildings-managers-group .buildings-field-help"
        );

        if (ayudaGestores) {
            ayudaGestores.textContent = gestoresAsignados.length > 0
                ? traducir("edificios.form.managersAssigned")
                : traducir("edificios.form.noManagersAssigned");
        }
    }

    limpiarErroresFormularioEdificio();
    limpiarMensajeFormulario();

    cambiarTituloModal(
        traducir("edificios.modal.editTitle"),
        traducir("edificios.modal.editDescription")
    );

    edificiosModal?.abrir();
}


async function guardarEdificio(evento) {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    
    if (!validarFormularioEdificio()) return;

    if (!formulario.reportValidity()) return;

    if (modoFormulario === "ADD" && !esAdmin()) {
        mostrarMensajeFormulario(
            traducir("edificios.errors.save")
        );
        return;
    }

    if (modoFormulario === "EDIT") {
        const idEdificio = obtenerValor("buildings-id");

        const edificio = edificios.find(
            elemento =>
                String(elemento.id_edificio) === String(idEdificio)
        );

        if (!edificio || !puedeGestionarEdificio(edificio)) {
            mostrarMensajeFormulario(
                traducir("edificios.errors.save")
            );
            return;
        }
    }

    const nombre = obtenerValor("buildings-name").trim();
    const anho = obtenerValor("buildings-academic-year").trim();
    const direccion = obtenerValor("buildings-address").trim();
    const telefono = obtenerValor("buildings-phone").trim();

    if (
        !nombre ||
        !direccion ||
        !/^\d{4}-\d{4}$/.test(anho)
    ) {
        mostrarMensajeFormulario(
            traducir("edificios.errors.invalidData")
        );
        return;
    }

    const accion = modoFormulario;

    const parametros = {
        nom_edificio: nombre,
        dir_edificio: direccion,
        tel_edificio: telefono || null,
        anho_acad_edificio: anho
    };

    // Enviar los gestores seleccionados (solo ADMIN).
    if (esAdmin()) {
        const selectorGestores = document.getElementById(
            "buildings-managers"
        );

        parametros.gestores = selectorGestores
            ? Array.from(selectorGestores.selectedOptions)
                .map(opcion => opcion.value)
            : [];
    }

    if (accion === "EDIT") {
        parametros.id_edificio = obtenerValor("buildings-id");
    }

    const botonGuardar = document.getElementById(
        "buildings-save-button"
    );

    if (botonGuardar) {
        botonGuardar.disabled = true;
    }

    try {
        const respuesta = await consultarAPI(
            "edificio",
            accion,
            parametros
        );

        if (
            !respuesta ||
            respuesta.ok === false ||
            respuesta.code !== "QUERY_OK"
        ) {
            throw new Error(
                respuesta?.code || "EDIFICIO_SAVE_ERROR"
            );
        }

        edificiosModal?.cerrar();

        await cargarEdificios();

        mostrarMensaje(
            traducir(
                accion === "ADD"
                    ? "edificios.messages.created"
                    : "edificios.messages.updated"
            ),
            "success"
        );

    } catch (error) {
        console.error("Error al guardar edificio:", error);

        mostrarMensajeFormulario(
            traducir("edificios.errors.save")
        );

    } finally {
        if (botonGuardar) {
            botonGuardar.disabled = false;
        }
    }
}

/* =========================================================
   ACCIONES DE LA TABLA
========================================================= */

function gestionarAccionesTabla(evento) {
    const boton = evento.target.closest("[data-action]");

    if (!boton) return;

    const accion = boton.dataset.action;

    // El HTML utiliza data-buildings-id.
    const id = boton.dataset.buildingsId;

    const edificio = edificios.find(
        elemento =>
            String(elemento.id_edificio) === String(id)
    );

    if (!edificio) return;

    switch (accion) {
        case "view":
            window.location.href =
                `edificios-detalle.html?id=${encodeURIComponent(id)}`;
            break;

        case "edit":
            if (!puedeGestionarEdificio(edificio)) return;
            abrirFormularioEdicion(edificio);
            break;

        case "delete":
            if (!puedeGestionarEdificio(edificio)) return;
            confirmarEliminarEdificio(edificio);
            break;
    }
}

/* =========================================================
   ELIMINACIÓN
========================================================= */

function confirmarEliminarEdificio(edificio) {
    if (!puedeGestionarEdificio(edificio)) return;

    eliminarIdPendiente = edificio.id_edificio;

    const mensaje = document.getElementById(
        "buildings-feedback-text"
    );

    if (mensaje) {
        mensaje.textContent = traducir(
            "edificios.confirmations.deleteMessage"
        );
    }

    const botonConfirmar = document.getElementById(
        "buildings-feedback-confirm"
    );

    if (botonConfirmar) {
        botonConfirmar.disabled = false;
    }

    confirmacionModal?.abrir();
}

async function eliminarEdificio() {
    if (eliminarIdPendiente === null) return;

    const edificio = edificios.find(
        elemento =>
            String(elemento.id_edificio) === String(eliminarIdPendiente)
    );

    if (!edificio || !puedeGestionarEdificio(edificio)) {
        eliminarIdPendiente = null;
        confirmacionModal?.cerrar();
        return;
    }

    const id = eliminarIdPendiente;

    const boton = document.getElementById(
        "buildings-feedback-confirm"
    );

    if (boton) {
        boton.disabled = true;
    }

    try {
        const respuesta = await consultarAPI(
            "edificio",
            "DELETE",
            {
                id_edificio: id
            }
        );

        if (
            !respuesta ||
            respuesta.ok !== true ||
            !["QUERY_OK", "EDIFICIO_ELIMINADO_OK"].includes(respuesta.code)
        ) {
            throw new Error(
                respuesta?.message ||
                respuesta?.code ||
                "EDIFICIO_DELETE_ERROR"
            );
        }

        confirmacionModal?.cerrar();

        eliminarIdPendiente = null;

        await cargarEdificios();

        mostrarMensaje(
            traducir("edificios.messages.deleted"),
            "success"
        );

    } catch (error) {
        console.error("Error al eliminar edificio:", error);

        const mensaje = document.getElementById(
            "buildings-feedback-text"
        );

        if (mensaje) {
            mensaje.textContent =
                traducir("edificios.errors.deleteRelatedSpaces");
        }

    } finally {
        if (boton) {
            boton.disabled = false;
        }
    }
}

/* =========================================================
   TÍTULOS Y MENSAJES
========================================================= */

function cambiarTituloModal(titulo, descripcion) {
    const elementoTitulo = document.getElementById(
        "buildings-modal-title"
    );

    const elementoDescripcion = document.getElementById(
        "buildings-modal-description"
    );

    if (elementoTitulo) {
        elementoTitulo.textContent = titulo;
    }

    if (elementoDescripcion) {
        elementoDescripcion.textContent = descripcion;
    }
}

function mostrarMensajeFormulario(mensaje) {
    const elemento = document.getElementById(
        "buildings-modal-message"
    );

    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.hidden = false;
}

function limpiarMensajeFormulario() {
    const elemento = document.getElementById(
        "buildings-modal-message"
    );

    if (!elemento) return;

    elemento.textContent = "";
    elemento.hidden = true;
}

function mostrarMensaje(mensaje, tipo = "") {
    const elemento = document.getElementById(
        "buildings-message"
    );

    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.hidden = !mensaje;

    elemento.classList.remove("is-error", "is-success");

    if (tipo === "error") {
        elemento.classList.add("is-error");
    }

    if (tipo === "success") {
        elemento.classList.add("is-success");
    }
}

/* =========================================================
   UTILIDADES
========================================================= */

function establecerValor(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.value = valor ?? "";
    }
}

function obtenerValor(id) {
    return document.getElementById(id)?.value || "";
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caracter]);
}

function mostrarEstadoCarga(tabla) {
    if (!tabla) return;

    tabla.innerHTML = `
        <tr>
            <td colspan="6">
                ${escaparHTML(traducir("common.loading"))}
            </td>
        </tr>
    `;
}

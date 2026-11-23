
/* =========================================================
   Archivo: facultades.js
   Descripción: Gestión de facultades.
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

document.addEventListener("DOMContentLoaded", iniciarFacultades);

const FACULTADES_POR_PAGINA = 25;

let facultades = [];
let facultadesFiltradas = [];
let paginaActual = 1;
let modoFormulario = "ADD";
let facultadesModal = null;
let confirmacionModal = null;
let duplicarFacultadesModal = null;
let eliminarIdPendiente = null;

/* =========================================================
   INICIALIZACIÓN
========================================================= */

function iniciarFacultades() {
    const tabla = document.getElementById("faculties-table-body");

    if (!tabla) return;

    configurarModales();
    configurarEventos();
    cargarFacultades();

    document.addEventListener("langChanged", () => {
        actualizarFiltroAnhos();
        renderizarFacultades();
    });
}

/* =========================================================
   MODALES
========================================================= */

function configurarModales() {
    const modalFormulario = document.getElementById("faculties-modal");

    const modalDuplicacion = document.getElementById("faculties-duplicate-modal");

    const modalConfirmacion = document.getElementById(
        "faculties-feedback-modal"
    );

    if (!window.SGEU?.crearModal) {
        console.error("No se ha cargado correctamente modal.js");
        return;
    }

    if (modalFormulario) {
        facultadesModal = window.SGEU.crearModal({
            modal: modalFormulario,
            botonesCerrar: [
                ...modalFormulario.querySelectorAll("[data-modal-close]")
            ]
        });
    }

    if (modalDuplicacion) {
        duplicarFacultadesModal = window.SGEU.crearModal({
            modal: modalDuplicacion,
            botonesCerrar: [
                ...modalDuplicacion.querySelectorAll("[data-modal-close]")
            ]
        });
    }

    if (modalConfirmacion) {
        confirmacionModal = window.SGEU.crearModal({
            modal: modalConfirmacion,
            botonesCerrar: [
                document.getElementById("faculties-feedback-cancel"),
                modalConfirmacion.querySelector(".faculties-feedback-overlay"),
                ...modalConfirmacion.querySelectorAll("[data-modal-close]")
            ]
        });
    }
}

/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {
    const botonNuevo = document.getElementById("faculties-new-button");
    const botonDuplicar = document.getElementById("faculties-duplicate-button");
    const modoDuplicacion = document.getElementById("faculties-duplicate-mode");
    const selectorFacultadesDuplicar = document.getElementById("faculties-duplicate-faculties");
    const selectorAnhoDuplicar = document.getElementById("faculties-duplicate-year");
    const formulario = document.getElementById("faculties-form");
    const paginacion = document.getElementById("faculties-pagination");
    const tabla = document.getElementById("faculties-table-body");
    const botonConfirmar = document.getElementById("faculties-feedback-confirm");
    const botonConfirmarDuplicacion = document.getElementById("faculties-duplicate-confirm");
    const botonFiltros = document.getElementById("faculties-filter-toggle");
    const panelFiltros = document.getElementById("faculties-filter-panel");
    const botonAplicarFiltros = document.getElementById("faculties-filter-apply");
    const botonLimpiarFiltros = document.getElementById("faculties-filter-reset");
    const buscador = document.getElementById("faculties-search");
    const filtroAnho = document.getElementById("faculties-year-filter");

    botonNuevo?.addEventListener("click", abrirFormularioNuevo);
    botonDuplicar?.addEventListener("click", abrirModalDuplicacion);
    modoDuplicacion?.addEventListener("change", cambiarModoDuplicacion);
    selectorFacultadesDuplicar?.addEventListener("change", actualizarResumenDuplicacion);
    selectorAnhoDuplicar?.addEventListener("change", actualizarResumenDuplicacion);
    formulario?.addEventListener("submit", guardarFacultad);
    paginacion?.addEventListener("click", cambiarPagina);
    tabla?.addEventListener("click", gestionarAccionesTabla);
    botonConfirmar?.addEventListener("click", eliminarFacultad);
    botonConfirmarDuplicacion?.addEventListener("click", confirmarDuplicacionFacultades);
    buscador?.addEventListener("input", aplicarFiltros);

    botonFiltros?.addEventListener("click", () => {
        const abierto =
            botonFiltros.getAttribute("aria-expanded") === "true";

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

    configurarValidacionesCampos();
}

/* =========================================================
   DUPLICACIÓN DE FACULTADES
========================================================= */

function abrirModalDuplicacion() {
    if (sessionStorage.getItem("nom_grupo") !== "ADMIN") {
        return;
    }

    limpiarErroresCampos(
        document.getElementById("faculties-duplicate-modal")
    );

    const selectorFacultades = document.getElementById(
        "faculties-duplicate-faculties"
    );

    const selectorAnhos = document.getElementById(
        "faculties-duplicate-year"
    );

    const selectorModo = document.getElementById(
        "faculties-duplicate-mode"
    );

    const grupoFacultades = document.getElementById(
        "faculties-duplicate-faculty-group"
    );

    const grupoAnhos = document.getElementById(
        "faculties-duplicate-year-group"
    );

    if (!selectorFacultades || !selectorAnhos) return;

    // Cargar facultades disponibles.
    selectorFacultades.innerHTML = facultades.map(facultad => `
        <option value="${escaparHTML(facultad.id_facultad)}">
            ${escaparHTML(facultad.nom_facultad)}
            (${escaparHTML(facultad.anho_acad_facultad)})
        </option>
    `).join("");

    // Obtener años académicos sin repetir.
    const anhos = [
        ...new Set(
            facultades
                .map(facultad => facultad.anho_acad_facultad)
                .filter(Boolean)
        )
    ].sort().reverse();

    selectorAnhos.innerHTML = `
        <option value="">
            ${escaparHTML(
                traducir("facultades.duplicate.selectYear")
            )}
        </option>
        ${anhos.map(anho => `
            <option value="${escaparHTML(anho)}">
                ${escaparHTML(anho)}
            </option>
        `).join("")}
    `;

    // Restablecer el formulario de duplicación.
    selectorModo.value = "facultad";
    selectorAnhos.value = "";

    document.getElementById(
        "faculties-duplicate-target-year"
    ).value = "";

    document.getElementById(
        "faculties-duplicate-summary-list"
    ).innerHTML = "";

    document.getElementById(
        "faculties-duplicate-message"
    ).hidden = true;

    grupoFacultades.hidden = false;
    grupoAnhos.hidden = true;

    actualizarResumenDuplicacion();

    duplicarFacultadesModal?.abrir();
}

function cambiarModoDuplicacion() {
    const modo = document.getElementById(
        "faculties-duplicate-mode"
    ).value;

    const grupoFacultades = document.getElementById(
        "faculties-duplicate-faculty-group"
    );

    const grupoAnhos = document.getElementById(
        "faculties-duplicate-year-group"
    );

    if (grupoFacultades) {
        grupoFacultades.hidden = modo !== "facultad";
    }

    if (grupoAnhos) {
        grupoAnhos.hidden = modo !== "anho";
    }

    actualizarResumenDuplicacion();
}

function actualizarResumenDuplicacion() {
    const modo = document.getElementById(
        "faculties-duplicate-mode"
    )?.value;

    let seleccionadas = [];

    if (modo === "facultad") {
        const selector = document.getElementById(
            "faculties-duplicate-faculties"
        );

        const ids = Array.from(selector?.selectedOptions || [])
            .map(option => String(option.value));

        seleccionadas = facultades.filter(facultad =>
            ids.includes(String(facultad.id_facultad))
        );

    } else if (modo === "anho") {
        const anho = document.getElementById(
            "faculties-duplicate-year"
        )?.value;

        seleccionadas = facultades.filter(facultad =>
            facultad.anho_acad_facultad === anho
        );
    }

    const resumen = document.getElementById(
        "faculties-duplicate-summary"
    );

    const textoResumen = resumen?.querySelector("p");
    const listaResumen = document.getElementById(
        "faculties-duplicate-summary-list"
    );

    if (textoResumen) {
        textoResumen.textContent = traducir(
            "facultades.duplicate.summary",
            { count: seleccionadas.length }
        );
    }

    if (listaResumen) {
        listaResumen.innerHTML = seleccionadas.map(facultad => `
            <li>
                ${escaparHTML(facultad.nom_facultad)}
                (${escaparHTML(facultad.anho_acad_facultad)})
            </li>
        `).join("");
    }
}

/* =========================================================
   CONSULTA DE FACULTADES
========================================================= */

async function cargarFacultades() {
    const tabla = document.getElementById("faculties-table-body");

    mostrarEstadoCarga(tabla);

    try {
        facultades = await cargarTodasLasFacultades();

        actualizarFiltroAnhos();
        aplicarFiltros();

        mostrarMensaje("");

    } catch (error) {
        console.error("Error al cargar facultades:", error);

        mostrarMensaje(
            traducir("facultades.errors.load"),
            "error"
        );

        if (tabla) tabla.innerHTML = "";
    }
}

async function cargarTodasLasFacultades() {
    const resultados = [];

    let empieza = 0;
    let total = 0;

    do {
        const respuesta = await consultarAPI(
            "facultad",
            "SEARCH",
            {
                empieza,
                filaspagina: FACULTADES_POR_PAGINA
            }
        );

        if (!respuesta || respuesta.ok === false) {
            throw new Error(
                respuesta?.code || "FACULTADES_LOAD_ERROR"
            );
        }

        const registros = Array.isArray(respuesta.resource)
            ? respuesta.resource
            : [];

        resultados.push(...registros);

        total = Number(respuesta.total) || 0;

        empieza += FACULTADES_POR_PAGINA;

        if (registros.length === 0) break;

    } while (empieza < total);

    return resultados;
}

/* =========================================================
   FILTRO POR AÑO ACADÉMICO
========================================================= */

function actualizarFiltroAnhos() {
    const filtro = document.getElementById("faculties-year-filter");

    if (!filtro) return;

    const valorAnterior = filtro.value;

    const anhos = [
        ...new Set(
            facultades
                .map(facultad => facultad.anho_acad_facultad)
                .filter(Boolean)
        )
    ].sort().reverse();

    filtro.innerHTML = `
        <option value="">
            ${escaparHTML(
                traducir("facultades.filter.allYears")
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
    const buscador = document.getElementById("faculties-search");
    const filtroAnho = document.getElementById("faculties-year-filter");

    const texto = normalizarTexto(buscador?.value || "");
    const anhoSeleccionado = filtroAnho?.value || "";

    facultadesFiltradas = facultades.filter(facultad => {
        const nombre = normalizarTexto(
            facultad.nom_facultad || ""
        );

        const coincideNombre = nombre.includes(texto);

        const coincideAnho = !anhoSeleccionado ||
            facultad.anho_acad_facultad === anhoSeleccionado;

        return coincideNombre && coincideAnho;
    });

    paginaActual = 1;

    renderizarFacultades();
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
    const inputNombre = document.getElementById("faculty-name");
    const inputAnho = document.getElementById("faculty-academic-year");
    const inputAnhoDestino = document.getElementById(
        "faculties-duplicate-target-year"
    );

    registrarValidacion(inputNombre, validarNombreFacultad);
    registrarValidacion(inputAnho, validarAnhoAcademico);

    registrarValidacion(inputAnhoDestino, () => validarDuplicacionFacultades());
}

function validarNombreFacultad() {
    const input = document.getElementById("faculty-name");
    const regla = REGLAS_CAMPOS.facultad.nombre_facultad;

    return validarCampoTexto(input, regla, {
        min_size: traducir("facultades.validation.nameMinSize"),
        max_size: traducir("facultades.validation.nameMaxSize"),
        format: traducir("facultades.validation.nameFormat")
    });
}

function validarAnhoAcademico(input = null) {
    input = input || document.getElementById("faculty-academic-year");

    if (!input || !input.classList) return false;

    const regla = REGLAS_CAMPOS.facultad.anho_academico_facultad;

    const validoFormato = validarCampoTexto(input, regla, {  min_size: traducir("facultades.validation.academicYearFormat"),
        max_size: traducir("facultades.validation.academicYearFormat"),
        format: traducir("facultades.validation.academicYearFormat")
    });

    if (!validoFormato) return false;

    const coincidencia = input.value.trim().match(/^(\d{4})-(\d{4})$/);

    if (!coincidencia) {
        mostrarErrorCampo(input, traducir("facultades.validation.academicYearFormat"));
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
        mostrarErrorCampo(input, traducir("facultades.validation.academicYearConsecutive"));
        return false;
    }

    return true;
}

function validarDuplicacionFacultades(exigirSeleccion = false) {
    const modo = document.getElementById("faculties-duplicate-mode")?.value;
    const inputDestino = document.getElementById("faculties-duplicate-target-year");

    let seleccionadas = [];

    if (modo === "facultad") {
        const selector = document.getElementById("faculties-duplicate-faculties");
        const ids = Array.from(selector?.selectedOptions || [])
            .map(option => String(option.value));

        seleccionadas = facultades.filter(f =>
            ids.includes(String(f.id_facultad))
        );
    } else if (modo === "anho") {
        const anho = document.getElementById("faculties-duplicate-year")?.value;

        if (anho) {
            seleccionadas = facultades.filter(f =>
                f.anho_acad_facultad === anho
            );
        }
    }

    if (seleccionadas.length === 0) {
        if (!exigirSeleccion) {
            return true;
        }

        document.getElementById("faculties-duplicate-message").textContent =
            traducir("facultades.duplicate.selectFaculties");

        document.getElementById("faculties-duplicate-message").hidden = false;
        return false;
    }

    if (!validarAnhoAcademico(inputDestino)) {
        return false;
    }

    const mayorAnhoOrigen = Math.max(
        ...seleccionadas.map(f =>
            Number(f.anho_acad_facultad.substring(0, 4))
        )
    );

    const anhoDestino = Number(inputDestino.value.substring(0, 4));

    if (anhoDestino <= mayorAnhoOrigen) {
        mostrarErrorCampo(
            inputDestino,
            traducir("facultades.duplicate.targetYearMustBeLater")
        );
        return false;
    }

    return true;
}

async function confirmarDuplicacionFacultades() {
    const mensaje = document.getElementById(
        "faculties-duplicate-message"
    );

    mensaje.hidden = true;

    if (!validarDuplicacionFacultades(true)) {
        return;
    }

    const modo = document.getElementById(
        "faculties-duplicate-mode"
    ).value;

    const anhoDestino = document.getElementById(
        "faculties-duplicate-target-year"
    ).value.trim();

    let idsFacultades = [];

    if (modo === "facultad") {
        const selector = document.getElementById(
            "faculties-duplicate-faculties"
        );

        idsFacultades = Array.from(selector.selectedOptions)
            .map(option => Number(option.value));
    } else {
        const anhoOrigen = document.getElementById(
            "faculties-duplicate-year"
        ).value;

        idsFacultades = facultades
            .filter(f => f.anho_acad_facultad === anhoOrigen)
            .map(f => Number(f.id_facultad));
    }

    const boton = document.getElementById(
        "faculties-duplicate-confirm"
    );

    boton.disabled = true;

    try {
        const respuesta = await consultarAPI(
            "facultad",
            "DUPLICAR",
            {
                facultades: idsFacultades,
                anho_acad_facultad: anhoDestino
            }
        );

        if (
            !respuesta ||
            respuesta.ok !== true ||
            respuesta.code !== "FACULTADES_DUPLICADAS_OK"
        ) {
            throw new Error(
                respuesta?.code || "DUPLICACION_FACULTADES_KO"
            );
        }

        duplicarFacultadesModal?.cerrar();

        await cargarFacultades();

        mostrarMensaje(
            traducir("facultades.duplicate.success"),
            "success"
        );

    } catch (error) {
        console.error("Error al duplicar facultades:", error);

        mostrarMensaje(
            traducir("facultades.duplicate.error"),
            "error"
        );

    } finally {
        boton.disabled = false;
    }
}

function validarFormularioFacultad() {
    const nombreValido = validarNombreFacultad();
    const anhoValido = validarAnhoAcademico();

    return nombreValido && anhoValido;
}

function limpiarErroresFormularioFacultad() {
    const formulario = document.getElementById("faculties-form");

    limpiarErroresCampos(formulario);
    limpiarMensajeFormulario();
}

/* =========================================================
   RENDERIZADO DE TABLA
========================================================= */

function renderizarFacultades() {
    const tabla = document.getElementById("faculties-table-body");
    const contador = document.getElementById("faculties-count");
    const estadoVacio = document.getElementById("faculties-empty");

    if (!tabla) return;

    const total = facultadesFiltradas.length;

    const totalPaginas = Math.ceil(
        total / FACULTADES_POR_PAGINA
    );

    const inicio = (paginaActual - 1) * FACULTADES_POR_PAGINA;

    const registros = facultadesFiltradas.slice(
        inicio,
        inicio + FACULTADES_POR_PAGINA
    );

    tabla.innerHTML = registros.map(facultad => `
        <tr>
            <td>${escaparHTML(facultad.id_facultad)}</td>

            <td>${escaparHTML(facultad.nom_facultad)}</td>

            <td>${escaparHTML(facultad.anho_acad_facultad)}</td>

            <td>
                <div class="table-actions">

                    <button
                        type="button"
                        class="table-action-button"
                        data-action="view"
                        data-faculty-id="${escaparHTML(facultad.id_facultad)}"
                        aria-label="${escaparHTML(
                            traducir("facultades.actions.view")
                        )}">
                        <span data-icon="eye" aria-hidden="true"></span>
                    </button>

                    <button
                        type="button"
                        class="table-action-button"
                        data-action="edit"
                        data-faculty-id="${escaparHTML(facultad.id_facultad)}"
                        data-require="ADMIN"
                        aria-label="${escaparHTML(
                            traducir("facultades.actions.edit")
                        )}">
                        <span data-icon="edit" aria-hidden="true"></span>
                    </button>

                    <button
                        type="button"
                        class="table-action-button"
                        data-action="delete"
                        data-faculty-id="${escaparHTML(facultad.id_facultad)}"
                        data-require="ADMIN"
                        aria-label="${escaparHTML(
                            traducir("facultades.actions.delete")
                        )}">
                        <span data-icon="trash" aria-hidden="true"></span>
                    </button>

                </div>
            </td>
        </tr>
    `).join("");

    if (contador) {
        contador.textContent = traducir(
            total === 1 ? "facultades.countOne" : "facultades.countMany",
            { count: total }
        );
    }

    if (estadoVacio) {
        estadoVacio.hidden = total > 0;
    }

    renderizarPaginacion(totalPaginas);

    // Aplicar restricciones globales a los botones recién creados.
    aplicarRestriccionesDinamicas();

    if (typeof window.renderIcons === "function") {
        window.renderIcons();
    }
}

/* =========================================================
   RESTRICCIONES DE ROL EN ELEMENTOS DINÁMICOS
========================================================= */

function aplicarRestriccionesDinamicas() {
    const rol = sessionStorage.getItem("nom_grupo");

    document.querySelectorAll(
        '#faculties-table-body [data-require]'
    ).forEach(elemento => {
        elemento.hidden = rol !== elemento.dataset.require;
    });
}

/* =========================================================
   PAGINACIÓN
========================================================= */

function renderizarPaginacion(totalPaginas) {
    const contenedor = document.getElementById(
        "faculties-pagination"
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
        facultadesFiltradas.length / FACULTADES_POR_PAGINA
    );

    if (pagina < 1 || pagina > totalPaginas) return;

    paginaActual = pagina;

    renderizarFacultades();
}

/* =========================================================
   ALTA Y EDICIÓN
========================================================= */

function abrirFormularioNuevo() {
    modoFormulario = "ADD";

    const formulario = document.getElementById("faculties-form");
    const grupoId = document.getElementById("faculty-id-group");

    formulario?.reset();

    limpiarErroresFormularioFacultad();

    establecerValor("faculty-id", "");
    establecerValor("faculty-id-display", "");

    if (grupoId) {
        grupoId.hidden = true;
    }

    limpiarMensajeFormulario();

    cambiarTituloModal(
        traducir("facultades.modal.newTitle"),
        traducir("facultades.modal.newDescription")
    );

    facultadesModal?.abrir();
}

function abrirFormularioEdicion(facultad) {
    modoFormulario = "EDIT";

    const grupoId = document.getElementById("faculty-id-group");

    establecerValor("faculty-id", facultad.id_facultad);
    establecerValor("faculty-id-display", facultad.id_facultad);
    establecerValor("faculty-name", facultad.nom_facultad);
    establecerValor(
        "faculty-academic-year",
        facultad.anho_acad_facultad
    );

    if (grupoId) {
        grupoId.hidden = false;
    }

    limpiarErroresFormularioFacultad();

    cambiarTituloModal(
        traducir("facultades.modal.editTitle"),
        traducir("facultades.modal.editDescription")
    );

    facultadesModal?.abrir();
}

async function guardarFacultad(evento) {
    evento.preventDefault();

    const formulario = evento.currentTarget;

    if (!validarFormularioFacultad()) return;

    if (!formulario.reportValidity()) return;

    const accion = modoFormulario;

    const nombre = obtenerValor("faculty-name").trim();
    const anho = obtenerValor("faculty-academic-year").trim();

    const parametros = {
        nom_facultad: nombre,
        anho_acad_facultad: anho
    };

    if (accion === "EDIT") {
        parametros.id_facultad = obtenerValor("faculty-id");
    }

    const botonGuardar = document.getElementById(
        "faculties-save-button"
    );

    if (botonGuardar) {
        botonGuardar.disabled = true;
    }

    try {
        const respuesta = await consultarAPI(
            "facultad",
            accion,
            parametros
        );

        if (
            !respuesta ||
            respuesta.ok === false ||
            respuesta.code !== "QUERY_OK"
        ) {
            throw new Error(
                respuesta?.code || "FACULTAD_SAVE_ERROR"
            );
        }

        facultadesModal?.cerrar();

        await cargarFacultades();

        mostrarMensaje(
            traducir(
                accion === "ADD"
                    ? "facultades.messages.created"
                    : "facultades.messages.updated"
            ),
            "success"
        );

    } catch (error) {
        console.error("Error al guardar facultad:", error);

        mostrarMensajeFormulario(
            traducir("facultades.errors.save")
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
    const id = boton.dataset.facultyId;

    const facultad = facultades.find(
        elemento =>
            String(elemento.id_facultad) === String(id)
    );

    if (!facultad) return;

    switch (accion) {
        case "view":
            window.location.href =
                `facultades-detalle.html?id=${encodeURIComponent(id)}`;
            break;

        case "edit":
            if (sessionStorage.getItem("nom_grupo") !== "ADMIN") return;
            abrirFormularioEdicion(facultad);
            break;

        case "delete":
            if (sessionStorage.getItem("nom_grupo") !== "ADMIN") return;
            confirmarEliminarFacultad(facultad);
            break;
    }
}

/* =========================================================
   ELIMINACIÓN
========================================================= */

function confirmarEliminarFacultad(facultad) {
    eliminarIdPendiente = facultad.id_facultad;

    const mensaje = document.getElementById(
        "faculties-feedback-text"
    );

    if (mensaje) {
        mensaje.textContent = traducir(
            "facultades.confirmations.deleteMessage"
        );
    }

    const botonConfirmar = document.getElementById(
        "faculties-feedback-confirm"
    );

    if (botonConfirmar) {
        botonConfirmar.disabled = false;
    }

    confirmacionModal?.abrir();
}

async function eliminarFacultad() {
    if (eliminarIdPendiente === null) return;

    const id = eliminarIdPendiente;

    const boton = document.getElementById(
        "faculties-feedback-confirm"
    );

    if (boton) {
        boton.disabled = true;
    }

    try {
        const respuesta = await consultarAPI(
            "facultad",
            "DELETE",
            {
                id_facultad: id
            }
        );

        if (
            !respuesta ||
            respuesta.ok === false ||
            respuesta.code !== "QUERY_OK"
        ) {
            throw new Error(
                respuesta?.code || "FACULTAD_DELETE_ERROR"
            );
        }

        confirmacionModal?.cerrar();

        eliminarIdPendiente = null;

        await cargarFacultades();

        mostrarMensaje(
            traducir("facultades.messages.deleted"),
            "success"
        );

    } catch (error) {
        console.error("Error al eliminar facultad:", error);

        const mensaje = document.getElementById(
            "faculties-feedback-text"
        );

        if (mensaje) {
            mensaje.textContent =
                traducir("facultades.errors.deleteRelatedSpaces");
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
        "faculties-modal-title"
    );

    const elementoDescripcion = document.getElementById(
        "faculties-modal-description"
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
        "faculties-modal-message"
    );

    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.hidden = false;
}

function limpiarMensajeFormulario() {
    const elemento = document.getElementById(
        "faculties-modal-message"
    );

    if (!elemento) return;

    elemento.textContent = "";
    elemento.hidden = true;
}

function mostrarMensaje(mensaje, tipo = "") {
    const elemento = document.getElementById(
        "faculties-message"
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
            <td colspan="4">
                ${escaparHTML(traducir("common.loading"))}
            </td>
        </tr>
    `;
}

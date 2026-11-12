
/* =========================================================
   Archivo: usuarios.js
   Descripción: Gestión de usuarios y solicitudes.
   Los datos se obtienen de la API REST de SGEU.
   ========================================================= */

import {consultarAPI} from "../api/api.js"
import {
    validarCampoTexto,
    validarCampoFecha,
    limpiarErroresCampos
} from "../common/form-errors.js";

import {
    REGLAS_CAMPOS,
    registrarValidacion
} from "../common/validation.js";

import { traducir } from "../i18n/i18n.js";
document.addEventListener('DOMContentLoaded', iniciarUsuarios);


function iniciarUsuarios() {

    const tabla = document.getElementById('users-table-body');
    const buscador = document.getElementById('users-search');
    const filtroRol = document.getElementById('users-filter-role');
    const contador = document.getElementById('users-count');
    const paginacion = document.getElementById('users-pagination');

    const columnaSeleccion = document.getElementById('users-select-column');
    const seleccionarPagina = document.getElementById('users-select-page');
    const accionesMasivas = document.getElementById('users-bulk-actions');
    const contadorSeleccionados = document.getElementById('users-selected-count');
    const botonEliminarSeleccionados = document.getElementById('users-bulk-delete');

    const pestanas = document.querySelectorAll('[data-users-tab]');
    const contadorActivos = document.getElementById('users-active-count');
    const contadorSolicitudes = document.getElementById('users-requests-count');

    const botonFiltros = document.getElementById('users-filter-toggle');
    const panelFiltros = document.getElementById('users-filter-panel');
    const botonAplicarFiltros = document.getElementById('users-filter-apply');
    const botonLimpiarFiltros = document.getElementById('users-filter-reset');

    const mensaje = document.getElementById('users-message');

    // Elementos del modal de visualización y edición.
    const modal = document.getElementById('users-modal');
    const formulario = document.getElementById('users-form');
    const botonGuardar = document.getElementById('users-save-button');
    const mensajeModal = document.getElementById('users-modal-message');


    // -----------------------------------------------------
    // CAMPOS DEL FORMULARIO
    // -----------------------------------------------------

    const nombreInput = document.getElementById('user-name');
    const apellidosInput = document.getElementById('user-surname');
    const telefonoInput = document.getElementById('user-phone');
    const fechaInput = document.getElementById('user-birthdate');


    // -----------------------------------------------------
    // CONFIGURACIÓN DEL MODAL DE CONFIRMACIÓN
    // -----------------------------------------------------

    configurarFeedbackModal();


    // Inicializar el modal de visualización y edición.
    const controladorModal =
        modal && typeof window.SGEU?.crearModal === 'function'
            ? window.SGEU.crearModal({
                modal,
                botonesCerrar: Array.from(
                    modal.querySelectorAll('[data-modal-close]')
                )
            })
            : null;


    if (!tabla) {
        console.error('No se ha encontrado la tabla de usuarios.');
        return;
    }


    // -----------------------------------------------------
    // CONFIGURACIÓN
    // -----------------------------------------------------

    const registrosPorPagina = 25;

    let usuarios = [];
    let paginaActual = 1;
    let pestanaActual = 'active';
    let cargando = false;

    // IDs de las solicitudes seleccionadas, incluso entre páginas.
    let solicitudesSeleccionadas = new Set();

    // -----------------------------------------------------
    // VALIDACIONES DEL FORMULARIO DE EDICIÓN
    // -----------------------------------------------------

    const obtenerMensajesNombre = () => ({
        min_size: traducir('login.nombreMinSize'),
        max_size: traducir('login.nombreMaxSize'),
        format: traducir('login.nombreFormat')
    });

    const obtenerMensajesApellidos = () => ({
        min_size: traducir('login.apellMinSize'),
        max_size: traducir('login.apellMaxSize'),
        format: traducir('login.apellFormat')
    });

    const obtenerMensajesTelefono = () => ({
        min_size: traducir('login.telefMinSize'),
        max_size: traducir('login.telefMaxSize'),
        format: traducir('login.telefFormat')
    });

    const obtenerMensajesFecha = () => ({
        format: traducir('login.fechaFormat')
    });


    // Validación al salir del campo (blur).
    registrarValidacion(nombreInput, () =>
        validarCampoTexto(
            nombreInput,
            REGLAS_CAMPOS.usuario.nombre_usuario,
            obtenerMensajesNombre()
        )
    );

    registrarValidacion(apellidosInput, () =>
        validarCampoTexto(
            apellidosInput,
            REGLAS_CAMPOS.usuario.apellidos,
            obtenerMensajesApellidos()
        )
    );

    registrarValidacion(telefonoInput, () =>
        validarCampoTexto(
            telefonoInput,
            REGLAS_CAMPOS.usuario.telefono,
            obtenerMensajesTelefono()
        )
    );

    registrarValidacion(fechaInput, () =>
        validarCampoFecha(
            fechaInput,
            REGLAS_CAMPOS.usuario.fecha,
            obtenerMensajesFecha()
        )
    );


    // Validar todos los campos antes de guardar.
    function validarFormularioEdicion() {

        let valido = true;

        if (!validarCampoTexto(
            nombreInput,
            REGLAS_CAMPOS.usuario.nombre_usuario,
            obtenerMensajesNombre()
        )) {
            valido = false;
        }

        if (!validarCampoTexto(
            apellidosInput,
            REGLAS_CAMPOS.usuario.apellidos,
            obtenerMensajesApellidos()
        )) {
            valido = false;
        }

        if (!validarCampoTexto(
            telefonoInput,
            REGLAS_CAMPOS.usuario.telefono,
            obtenerMensajesTelefono()
        )) {
            valido = false;
        }

        if (!validarCampoFecha(
            fechaInput,
            REGLAS_CAMPOS.usuario.fecha,
            obtenerMensajesFecha()
        )) {
            valido = false;
        }

        return valido;
    }


    // -----------------------------------------------------
    // UTILIDADES
    // -----------------------------------------------------

    function escaparHTML(valor) {

        return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[caracter]);
    }


    function obtenerIniciales(nombre) {

        return String(nombre || '')
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(palabra => palabra.charAt(0).toUpperCase())
            .join('');
    }


    function obtenerNombreCompleto(usuario) {

        return [
            usuario.nom_usuario,
            usuario.apell_usuario
        ]
            .filter(Boolean)
            .join(' ')
            .trim();
    }


    function obtenerRol(idGrupo) {

        const roles = {
            '1': traducir('usuarios.roles.administration'),
            '2': traducir('usuarios.roles.manager'),
            '3': traducir('usuarios.roles.consultation')
        };

        return roles[String(idGrupo)] || 'Sin perfil';
    }


    function mostrarMensaje(texto, tipo = 'info') {

        if (!mensaje) return;

        mensaje.textContent = texto;
        mensaje.className = `users-message users-message-${tipo}`;
        mensaje.hidden = false;
    }


    function ocultarMensaje() {

        if (!mensaje) return;

        mensaje.textContent = '';
        mensaje.hidden = true;
    }



    // -----------------------------------------------------
    // CARGA DE USUARIOS
    // -----------------------------------------------------

    async function cargarUsuarios() {

        if (cargando) return;

        cargando = true;

        tabla.innerHTML = '';

        if (paginacion) {
            paginacion.innerHTML = '';
        }

        mostrarMensaje(traducir('usuarios.messages.loading'), 'info');

        try {

            const usuariosCargados = [];

            let empieza = 0;
            let total = 0;

            do {

                const respuesta = await consultarAPI("usuario",'SEARCH', {
                    empieza,
                    filaspagina: registrosPorPagina
                });

                const registros = Array.isArray(respuesta.resource)
                    ? respuesta.resource
                    : [];

                total = Number(respuesta.total) || registros.length;

                if (registros.length === 0) {
                    break;
                }

                usuariosCargados.push(...registros);

                empieza += registros.length;

                if (registros.length < registrosPorPagina) {
                    break;
                }

            } while (usuariosCargados.length < total);


            // Conservamos todos los campos originales de la API.
            // No mostramos ni utilizamos el campo pass.
            usuarios = usuariosCargados.map(usuario => ({
                ...usuario,
                id: Number(usuario.id_usuario),
                nombre: obtenerNombreCompleto(usuario),
                correo: usuario.email || '',
                idGrupo: String(usuario.id_grupo ?? ''),
                activo: String(usuario.activo_usuario) === '1'
            }));

            // Mantener seleccionadas únicamente las solicitudes que siguen existiendo.
            solicitudesSeleccionadas = new Set(
                [...solicitudesSeleccionadas].filter(id =>
                    usuarios.some(usuario =>
                        usuario.id === id && !usuario.activo
                    )
                )
            );


            actualizarContadores();

            ocultarMensaje();

            renderizarTabla(true);

        } catch (error) {

            console.error('Error al cargar usuarios:', error);

            usuarios = [];

            actualizarContadores();

            renderizarTabla(true);

            mostrarMensaje(
                traducir('usuarios.messages.loadError')
                    .replace('{error}', error.message),
                'error'
            );

        } finally {

            cargando = false;
        }
    }


    // -----------------------------------------------------
    // CONTADORES DE LAS PESTAÑAS
    // -----------------------------------------------------

    function obtenerUsuariosDePestana() {

        return usuarios.filter(usuario =>
            pestanaActual === 'active'
                ? usuario.activo
                : !usuario.activo
        );
    }


    function actualizarContadores() {

        const activos = usuarios.filter(
            usuario => usuario.activo
        ).length;

        const solicitudes = usuarios.filter(
            usuario => !usuario.activo
        ).length;

        if (contadorActivos) {
            contadorActivos.textContent = activos;
        }

        if (contadorSolicitudes) {
            contadorSolicitudes.textContent = solicitudes;
        }
    }


    // -----------------------------------------------------
    // MODAL DE VISUALIZACIÓN Y EDICIÓN
    // -----------------------------------------------------

    function abrirModal(usuario, modo = 'view') {

        if (!modal || !formulario) {
            mostrarMensaje(
                traducir("usuarios.messages.notFound"),
                'error'
            );
            return;
        }

        const editando = modo === 'edit';


        document.getElementById('users-modal-title').textContent =
            editando
                ? traducir('usuarios.modal.editTitle')
                : traducir('usuarios.modal.viewTitle');

        document.getElementById('users-modal-description').textContent =
            editando
                ? traducir('usuarios.modal.editDescription')
                : traducir('usuarios.modal.viewDescription');


        // Rellenar campos.
        document.getElementById('user-id').value =
            usuario.id_usuario || '';

        document.getElementById('user-id-display').value =
            usuario.id_usuario || '';

        nombreInput.value =
            usuario.nom_usuario || '';

        apellidosInput.value =
            usuario.apell_usuario || '';

        document.getElementById('user-email').value =
            usuario.email || '';

        telefonoInput.value =
            usuario.telefono || '';

        document.getElementById('user-dni').value =
            usuario.dni || '';

        fechaInput.value =
            usuario.fech_nacimiento || '';

        formulario.querySelector('#user-role').value =
            String(usuario.id_grupo || '3');

        document.getElementById('user-building').value =
            usuario.id_edificio ?? '';

        document.getElementById('user-status').value =
            String(usuario.activo_usuario) === '1'
                ? traducir('usuarios.statuses.active')
                : traducir('usuarios.statuses.pending');


        // Limpiar errores de una edición anterior.
        limpiarErroresCampos(formulario);


        // Activar o bloquear campos según el modo.
        formulario.querySelectorAll(
            'input:not([type="hidden"]), select'
        ).forEach(campo => {

            const camposNoEditables = [
                'user-id-display',
                'user-status',
                'user-dni',
                'user-email',
                'user-building'
            ];

            if (camposNoEditables.includes(campo.id)) {
                campo.disabled = true;
            } else {
                campo.disabled = !editando;
            }
        });


        // Mostrar el botón guardar únicamente al editar.
        if (botonGuardar) {
            botonGuardar.hidden = !editando;
            botonGuardar.disabled = false;
        }


        if (mensajeModal) {
            mensajeModal.textContent = '';
            mensajeModal.hidden = true;
        }


        if (!controladorModal) {
            mostrarMensaje(
                traducir("usuarios.messages.modalInitError"),
                'error'
            );
            return;
        }

        controladorModal.abrir();
    }


    // -----------------------------------------------------
    // GUARDAR EDICIÓN
    // -----------------------------------------------------

    formulario?.addEventListener('submit', async event => {

        event.preventDefault();

        if (mensajeModal) {
            mensajeModal.textContent = '';
            mensajeModal.hidden = true;
        }


        // Comprobar los datos introducidos.
        const valido = validarFormularioEdicion();

        // Comprobar también los campos obligatorios del HTML,
        // incluido el selector de rol.
        if (!valido || !formulario.reportValidity()) {
            return;
        }


        // Preparar todos los campos que necesita EDIT.
        // También enviamos los valores de los campos bloqueados.
        if (!formulario.reportValidity()) return;

        const datos = {
            id_usuario: document.getElementById('user-id').value,
            nom_usuario: nombreInput.value.trim(),
            apell_usuario: apellidosInput.value.trim(),
            email: document.getElementById('user-email').value.trim(),
            telefono: telefonoInput.value.trim(),
            dni: document.getElementById('user-dni').value.trim(),
            fech_nacimiento: fechaInput.value,
            id_grupo: formulario.querySelector('#user-role').value,
            id_edificio: document.getElementById('user-building').value,
            activo_usuario: 1
        };


        try {

            if (botonGuardar) {
                botonGuardar.disabled = true;
            }

            await consultarAPI("usuario",'EDIT', datos);
            

            // Cerrar el modal correctamente.
            controladorModal?.cerrar();

            mostrarMensaje(
                traducir("usuarios.messages.updateSuccess"),
                'success'
            );

            await cargarUsuarios();

        } catch (error) {

            console.error('Error al editar usuario:', error);

            if (mensajeModal) {
                mensajeModal.textContent =
                traducir('usuarios.modal.editError')
                .replace('{error}', error.message),


                mensajeModal.hidden = false;
            }

        } finally {

            if (botonGuardar) {
                botonGuardar.disabled = false;
            }
        }
    });


    // -----------------------------------------------------
    // PESTAÑAS
    // -----------------------------------------------------

    function cambiarPestana(nuevaPestana) {

        if (
            nuevaPestana !== 'active' &&
            nuevaPestana !== 'requests'
        ) {
            return;
        }

        pestanaActual = nuevaPestana;
        paginaActual = 1;

        pestanas.forEach(pestana => {

            const seleccionada =
                pestana.dataset.usersTab === pestanaActual;

            solicitudesSeleccionadas.clear();

            pestana.classList.toggle('active', seleccionada);

            pestana.setAttribute(
                'aria-selected',
                String(seleccionada)
            );
        });


        const panel = document.getElementById('users-tab-panel');

        if (panel) {
            panel.setAttribute(
                'aria-labelledby',
                pestanaActual === 'active'
                    ? 'users-tab-active'
                    : 'users-tab-requests'
            );
        }

        renderizarTabla(true);
    }


    pestanas.forEach(pestana => {

        pestana.addEventListener('click', () => {
            cambiarPestana(pestana.dataset.usersTab);
        });
    });


    // -----------------------------------------------------
    // FILTRADO
    // -----------------------------------------------------

    function obtenerUsuariosFiltrados() {

        const busqueda = (buscador?.value || '')
            .trim()
            .toLowerCase();

        const rol = filtroRol?.value || '';

        return obtenerUsuariosDePestana().filter(usuario => {

            const coincideBusqueda =
                usuario.nombre.toLowerCase().includes(busqueda) ||
                usuario.correo.toLowerCase().includes(busqueda) ||
                obtenerRol(usuario.idGrupo).toLowerCase().includes(busqueda);

            const coincideRol =
                !rol || usuario.idGrupo === rol;

            return coincideBusqueda && coincideRol;
        });
    }


    // -----------------------------------------------------
    // PAGINACIÓN
    // -----------------------------------------------------

    function renderizarPaginacion(totalPaginas) {

        if (!paginacion) return;

        paginacion.innerHTML = '';

        if (totalPaginas <= 1) return;


        const crearBoton = (
            texto,
            pagina,
            deshabilitado,
            etiqueta
        ) => {

            const boton = document.createElement('button');

            boton.type = 'button';
            boton.textContent = texto;
            boton.disabled = deshabilitado;

            if (etiqueta) {
                boton.setAttribute('aria-label', etiqueta);
            }

            boton.addEventListener('click', () => {
                solicitudesSeleccionadas.clear();

                if (seleccionarPagina) {
                    seleccionarPagina.checked = false;
                    seleccionarPagina.indeterminate = false;
                }

                paginaActual = pagina;
                renderizarTabla();
            });

            return boton;
        };


        paginacion.appendChild(
            crearBoton(
                '‹',
                paginaActual - 1,
                paginaActual === 1,
                'Página anterior'
            )
        );


        for (let numero = 1; numero <= totalPaginas; numero++) {

            const boton = crearBoton(
                String(numero),
                numero,
                false,
                `Página ${numero}`
            );

            if (numero === paginaActual) {
                boton.classList.add('active');
                boton.setAttribute('aria-current', 'page');
            }

            paginacion.appendChild(boton);
        }


        paginacion.appendChild(
            crearBoton(
                '›',
                paginaActual + 1,
                paginaActual === totalPaginas,
                'Página siguiente'
            )
        );
    }

    function actualizarSeleccion() {
        const esPestanaSolicitudes = pestanaActual === 'requests';

        if (columnaSeleccion) {
            columnaSeleccion.hidden = !esPestanaSolicitudes;
        }

        if (!esPestanaSolicitudes) {
            if (accionesMasivas) accionesMasivas.hidden = true;

            if (seleccionarPagina) {
                seleccionarPagina.checked = false;
                seleccionarPagina.indeterminate = false;
            }

            return;
        }

        const checkboxesPagina = tabla.querySelectorAll('.request-checkbox');

        const seleccionadosEnPagina = Array.from(checkboxesPagina)
            .filter(checkbox => checkbox.checked).length;

        const totalPagina = checkboxesPagina.length;

        if (seleccionarPagina) {
            seleccionarPagina.checked =
                totalPagina > 0 && seleccionadosEnPagina === totalPagina;

            seleccionarPagina.indeterminate =
                seleccionadosEnPagina > 0 &&
                seleccionadosEnPagina < totalPagina;
        }

        const totalSeleccionados = solicitudesSeleccionadas.size;

        if (accionesMasivas) {
            accionesMasivas.hidden = totalSeleccionados === 0;
        }

        if (contadorSeleccionados) {
            contadorSeleccionados.textContent =
                totalSeleccionados === 1
                    ? traducir('usuarios.bulkDelete.selectedOne')
                    : traducir('usuarios.bulkDelete.selectedMany')
                        .replace('{count}', totalSeleccionados);
        }
}


    // -----------------------------------------------------
    // RENDERIZADO DE LA TABLA
    // -----------------------------------------------------

    function renderizarTabla(reiniciarPagina = false) {

        const usuariosFiltrados = obtenerUsuariosFiltrados();

        if (reiniciarPagina) {
            paginaActual = 1;
        }

        const totalPaginas = Math.ceil(
            usuariosFiltrados.length / registrosPorPagina
        );

        paginaActual = Math.max(
            1,
            Math.min(paginaActual, totalPaginas || 1)
        );

        const inicio = (paginaActual - 1) * registrosPorPagina;

        const usuariosPagina = usuariosFiltrados.slice(
            inicio,
            inicio + registrosPorPagina
        );

        tabla.innerHTML = '';


        if (usuariosPagina.length === 0) {

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td colspan="5" class="users-empty">
                    ${pestanaActual === 'active'
                        ? 'No hay usuarios activos que coincidan con la búsqueda.'
                        : 'No hay solicitudes que coincidan con la búsqueda.'}
                </td>
            `;

            tabla.appendChild(fila);

        } else {

            usuariosPagina.forEach(usuario => {

                const casillaSeleccion = pestanaActual === 'requests'
                ? `
                    <td>
                        <input
                            type="checkbox"
                            class="request-checkbox"
                            value="${usuario.id}"
                            aria-label="Seleccionar solicitud de ${escaparHTML(usuario.nombre)}"
                            ${solicitudesSeleccionadas.has(usuario.id) ? 'checked' : ''}
                        >
                    </td>
                `
                : '';

                const fila = document.createElement('tr');

                const claseEstado = usuario.activo
                    ? 'user-status-active'
                    : 'user-status-pending';

                const textoEstado = usuario.activo
                    ? traducir('usuarios.statuses.active')
                    : traducir('usuarios.statuses.pending');

                let acciones = '';


                // Acciones para solicitudes.
                if (pestanaActual === 'requests') {

                    acciones = `
                        <button
                            type="button"
                            class="user-action"
                            data-action="view"
                            data-user-id="${usuario.id}"
                            aria-label="Ver solicitud de ${escaparHTML(usuario.nombre)}"
                            title="Ver solicitud"
                        >
                            <span data-icon="eye" aria-hidden="true"></span>
                        </button>

                        <button
                            type="button"
                            class="user-action"
                            data-action="accept"
                            data-user-id="${usuario.id}"
                            aria-label="Aceptar solicitud de ${escaparHTML(usuario.nombre)}"
                            title="Aceptar solicitud"
                        >
                            <span data-icon="check" aria-hidden="true"></span>
                        </button>

                        <button
                            type="button"
                            class="user-action"
                            data-action="reject"
                            data-user-id="${usuario.id}"
                            aria-label="Rechazar solicitud de ${escaparHTML(usuario.nombre)}"
                            title="Rechazar solicitud"
                        >
                            <span data-icon="trash" aria-hidden="true"></span>
                        </button>
                    `;

                } else {

                    // Acciones para usuarios activos.
                    acciones = `
                        <button
                            type="button"
                            class="user-action"
                            data-action="view"
                            data-user-id="${usuario.id}"
                            aria-label="Ver usuario ${escaparHTML(usuario.nombre)}"
                            title="Ver usuario"
                        >
                            <span data-icon="eye" aria-hidden="true"></span>
                        </button>

                        <button
                            type="button"
                            class="user-action"
                            data-action="edit"
                            data-user-id="${usuario.id}"
                            aria-label="Editar usuario ${escaparHTML(usuario.nombre)}"
                            title="Editar usuario"
                        >
                            <span data-icon="edit" aria-hidden="true"></span>
                        </button>

                        <button
                            type="button"
                            class="user-action"
                            data-action="delete"
                            data-user-id="${usuario.id}"
                            aria-label="Eliminar usuario ${escaparHTML(usuario.nombre)}"
                            title="Eliminar usuario"
                        >
                            <span data-icon="trash" aria-hidden="true"></span>
                        </button>
                    `;
                }


                fila.innerHTML = `
                    ${casillaSeleccion}

                    <td class="column-user">
                        <div class="user-identity">

                            <div class="user-avatar" aria-hidden="true">
                                ${escaparHTML(obtenerIniciales(usuario.nombre))}
                            </div>

                            <div>
                                <p class="user-name">
                                    ${escaparHTML(usuario.nombre)}
                                </p>

                                <p class="user-email">
                                    ${escaparHTML(usuario.correo)}
                                </p>
                            </div>

                        </div>
                    </td>

                    <td>${escaparHTML(obtenerRol(usuario.idGrupo))}</td>

                    <td>
                        <span class="user-status ${claseEstado}">
                            ${textoEstado}
                        </span>
                    </td>

                    <td class="column-actions">
                        <div class="user-actions">
                            ${acciones}
                        </div>
                    </td>
                `;

                tabla.appendChild(fila);
            });
        }


        if (contador) {
            const total = usuariosFiltrados.length;

            contador.textContent = total === 1
                ? traducir('usuarios.userCountOne').replace('{count}', total)
                : traducir('usuarios.userCountMany').replace('{count}', total);
        }

        if (typeof window.renderIcons === 'function') {
            window.renderIcons(tabla);
        }

        renderizarPaginacion(totalPaginas);
        actualizarSeleccion();
    }


    // -----------------------------------------------------
    // ACCIONES DE LOS USUARIOS
    // -----------------------------------------------------

    tabla.addEventListener('click', async event => {

        const boton = event.target.closest('[data-action]');

        if (!boton || !tabla.contains(boton)) return;

        // Evitar dobles clics mientras se procesa una acción.
        if (boton.disabled) return;

        const id = Number(boton.dataset.userId);

        const usuario = usuarios.find(item => item.id === id);

        if (!usuario) return;

        const accion = boton.dataset.action;


        // -------------------------------------------------
        // VER USUARIO O SOLICITUD
        // -------------------------------------------------

        if (accion === 'view') {

            abrirModal(usuario, 'view');

            return;
        }


        // -------------------------------------------------
        // EDITAR USUARIO
        // -------------------------------------------------

        if (accion === 'edit') {

            abrirModal(usuario, 'edit');

            return;
        }


        // -------------------------------------------------
        // ACEPTAR SOLICITUD
        // -------------------------------------------------

        if (accion === 'accept') {

            const confirmar = await mostrarFeedbackModal({
                titulo: traducir('usuarios.confirmations.acceptTitle'),
                mensaje: traducir('usuarios.confirmations.acceptMessage')
                    .replace('{name}', usuario.nombre),
                textoConfirmar: traducir('usuarios.confirmations.acceptConfirm'),
                textoCancelar: traducir('usuarios.confirmations.cancel'),
                esConfirmacion: true
            });

            if (!confirmar) return;

            boton.disabled = true;

            try {

                await consultarAPI("usuario",'REACTIVAR', {
                    id_usuario: String(usuario.id)
                });

                mostrarMensaje(
                    traducir('usuarios.messages.acceptSuccess')
                        .replace('{name}', usuario.nombre),
                    'success'
                );

                await cargarUsuarios();

            } catch (error) {

                console.error('Error al aceptar solicitud:', error);

                mostrarMensaje(
                    traducir('usuarios.messages.acceptError')
                        .replace('{error}', error.message),
                    'error'
                );

                boton.disabled = false;
            }

            return;
        }


        // -------------------------------------------------
        // RECHAZAR SOLICITUD
        // -------------------------------------------------

        if (accion === 'reject') {

            const confirmar = await mostrarFeedbackModal({
                titulo: traducir('usuarios.confirmations.rejectTitle'),
                mensaje: traducir('usuarios.confirmations.rejectMessage')
                    .replace('{name}', usuario.nombre),
                textoConfirmar: traducir('usuarios.confirmations.rejectConfirm'),
                textoCancelar: traducir('usuarios.confirmations.cancel'),
                esConfirmacion: true
            });

            if (!confirmar) return;

            boton.disabled = true;

            try {

                await consultarAPI("usuario",'DELETE', {
                    id_usuario: String(usuario.id)
                });

                mostrarMensaje(
                    traducir('usuarios.messages.rejectSuccess'),
                    'success'
                );

                await cargarUsuarios();

            } catch (error) {

                console.error('Error al rechazar solicitud:', error);

                mostrarMensaje(
                    traducir('usuarios.messages.rejectError')
                        .replace('{error}', error.message),
                    'error'
                );

                boton.disabled = false;
            }

            return;
        }


        // -------------------------------------------------
        // ELIMINAR USUARIO ACTIVO
        // -------------------------------------------------

        if (accion === 'delete') {

            const confirmar = await mostrarFeedbackModal({
                titulo: traducir('usuarios.confirmations.deleteTitle'),
                mensaje: traducir('usuarios.confirmations.deleteMessage')
                    .replace('{name}', usuario.nombre),
                textoConfirmar: traducir('usuarios.confirmations.deleteConfirm'),
                textoCancelar: traducir('usuarios.confirmations.cancel'),
                esConfirmacion: true
            });

            if (!confirmar) return;

            boton.disabled = true;

            try {

                await consultarAPI("usuario",'DELETE', {
                    id_usuario: String(usuario.id)
                });

                mostrarMensaje(
                    traducir('usuarios.messages.deleteSuccess'),
                    'success'
                );

                await cargarUsuarios();

            } catch (error) {

                console.error('Error al eliminar usuario:', error);

                mostrarMensaje(
                    traducir('usuarios.messages.deleteError')
                        .replace('{error}', error.message),
                    'error'
                );

                boton.disabled = false;
            }
        }    
    });

    // Seleccionar o deseleccionar todas las solicitudes de la página actual.
    seleccionarPagina?.addEventListener('change', () => {

        const checkboxes = tabla.querySelectorAll('.request-checkbox');

        checkboxes.forEach(checkbox => {

            const id = Number(checkbox.value);

            checkbox.checked = seleccionarPagina.checked;

            if (checkbox.checked) {
                solicitudesSeleccionadas.add(id);
            } else {
                solicitudesSeleccionadas.delete(id);
            }
        });

        actualizarSeleccion();
    });

    // Eventos de selección individual.
    tabla.addEventListener('change', event => {
        const checkbox = event.target.closest('.request-checkbox');

        if (!checkbox) return;

        const id = Number(checkbox.value);

        if (checkbox.checked) {
            solicitudesSeleccionadas.add(id);
        } else {
            solicitudesSeleccionadas.delete(id);
        }

        actualizarSeleccion();
    });

    // -----------------------------------------------------
    // ELIMINACIÓN MÚLTIPLE DE SOLICITUDES
    // -----------------------------------------------------

    async function eliminarSolicitudesSeleccionadas() {

        const seleccionados = usuarios.filter(usuario =>
            !usuario.activo &&
            solicitudesSeleccionadas.has(usuario.id)
        );

        if (seleccionados.length === 0) return;

        const cantidad = seleccionados.length;

        const confirmar = await mostrarFeedbackModal({
            titulo: traducir('usuarios.bulkDelete.title'),
            mensaje: traducir('usuarios.bulkDelete.confirmMessage')
                .replace('{count}', cantidad),
            textoConfirmar: traducir('usuarios.bulkDelete.confirm'),
            textoCancelar: traducir('usuarios.confirmations.cancel'),
            esConfirmacion: true
        });

        if (!confirmar) return;

        botonEliminarSeleccionados.disabled = true;

        let eliminadas = 0;
        const errores = [];

        try {
            for (const usuario of seleccionados) {
                try {
                    await consultarAPI('usuario', 'DELETE', {
                        id_usuario: String(usuario.id)
                    });

                    eliminadas++;
                    solicitudesSeleccionadas.delete(usuario.id);

                } catch (error) {
                    console.error(
                        `Error al eliminar la solicitud ${usuario.id}:`,
                        error
                    );

                    errores.push(usuario);
                }
            }

            await cargarUsuarios();

            if (errores.length === 0) {
                mostrarMensaje(
                    traducir('usuarios.bulkDelete.success')
                        .replace('{count}', eliminadas),
                    'success'
                );
            } else {
                mostrarMensaje(
                    traducir('usuarios.bulkDelete.partialError')
                        .replace('{deleted}', eliminadas)
                        .replace('{failed}', errores.length),
                    'error'
                );
            }

                } finally {
            botonEliminarSeleccionados.disabled = false;
                }
            }

            // Registrar el evento del botón de eliminación múltiple.
            botonEliminarSeleccionados?.addEventListener(
                'click',
                eliminarSolicitudesSeleccionadas
            );


    // -----------------------------------------------------
    // BÚSQUEDA Y FILTROS
    // -----------------------------------------------------

    buscador?.addEventListener('input', () => {
        renderizarTabla(true);
    });


    botonFiltros?.addEventListener('click', () => {

        const abierto =
            botonFiltros.getAttribute('aria-expanded') === 'true';

        botonFiltros.setAttribute('aria-expanded', String(!abierto));

        if (panelFiltros) {
            panelFiltros.hidden = abierto;
        }
    });


    botonAplicarFiltros?.addEventListener('click', () => {

        renderizarTabla(true);

        if (panelFiltros) {
            panelFiltros.hidden = true;
        }

        botonFiltros?.setAttribute('aria-expanded', 'false');
    });


    botonLimpiarFiltros?.addEventListener('click', () => {

        if (filtroRol) {
            filtroRol.value = '';
        }

        if (buscador) {
            buscador.value = '';
        }

        renderizarTabla(true);

        if (panelFiltros) {
            panelFiltros.hidden = true;
        }

        botonFiltros?.setAttribute('aria-expanded', 'false');
    });


    // -----------------------------------------------------
    // CAMBIO DE IDIOMA
    // -----------------------------------------------------

    document.addEventListener('langChanged', () => {

        renderizarTabla();

        // Actualizar los mensajes de los errores visibles.
        // Los callbacks registrados se ejecutan desde validation.js.
    });


    // -----------------------------------------------------
    // INICIALIZACIÓN
    // -----------------------------------------------------

    cargarUsuarios();
}



// =========================================================
// MODAL PERSONALIZADO DE CONFIRMACIÓN
// Se utiliza para aceptar, rechazar y eliminar usuarios.
// =========================================================

let resolverFeedbackModal = null;
let elementoAnteriorFeedback = null;


// ---------------------------------------------------------
// MOSTRAR MODAL
// ---------------------------------------------------------

function mostrarFeedbackModal({
    titulo = traducir('usuarios.feedback.title'),
    mensaje = traducir('usuarios.feedback.message'),
    textoConfirmar = traducir('usuarios.confirmations.confirm'),
    textoCancelar = traducir('usuarios.confirmations.cancel'),
    esConfirmacion = true
} = {}) {

    const modal = document.getElementById('users-feedback-modal');

    const tituloElemento =
        document.getElementById('users-feedback-title');

    const mensajeElemento =
        document.getElementById('users-feedback-text');

    const botonConfirmar =
        document.getElementById('users-feedback-confirm');

    const botonCancelar =
        document.getElementById('users-feedback-cancel');


    if (
        !modal ||
        !tituloElemento ||
        !mensajeElemento ||
        !botonConfirmar ||
        !botonCancelar
    ) {
        console.error(
            'No se han encontrado todos los elementos del modal de confirmación.'
        );

        return Promise.resolve(false);
    }


    // Evitar abrir dos confirmaciones simultáneamente.
    if (resolverFeedbackModal) {
        return Promise.resolve(false);
    }


    // Guardar el elemento que tenía el foco.
    elementoAnteriorFeedback = document.activeElement;


    // Actualizar el contenido.
    tituloElemento.textContent = titulo;
    mensajeElemento.textContent = mensaje;

    botonConfirmar.textContent = textoConfirmar;
    botonCancelar.textContent = textoCancelar;


    // Mostrar u ocultar el botón cancelar.
    botonCancelar.hidden = !esConfirmacion;


    // Mostrar modal.
    modal.hidden = false;

    modal.setAttribute('aria-hidden', 'false');

    document.body.classList.add('modal-open');


    return new Promise(resolve => {

        resolverFeedbackModal = resolve;

        // Dar foco al botón principal.
        botonConfirmar.focus();
    });
}


// ---------------------------------------------------------
// CERRAR MODAL Y DEVOLVER RESULTADO
// ---------------------------------------------------------

function cerrarFeedbackModal(resultado) {

    const modal = document.getElementById('users-feedback-modal');

    if (!modal || !resolverFeedbackModal) return;

    modal.hidden = true;

    modal.setAttribute('aria-hidden', 'true');

    document.body.classList.remove('modal-open');


    const resolver = resolverFeedbackModal;

    resolverFeedbackModal = null;

    resolver(resultado);


    // Devolver el foco al elemento anterior.
    if (
        elementoAnteriorFeedback &&
        typeof elementoAnteriorFeedback.focus === 'function'
    ) {
        elementoAnteriorFeedback.focus();
    }

    elementoAnteriorFeedback = null;
}


// ---------------------------------------------------------
// CONFIGURAR EVENTOS DEL MODAL
// ---------------------------------------------------------

function configurarFeedbackModal() {

    const modal = document.getElementById('users-feedback-modal');

    if (!modal) {
        console.warn(
            'No se ha encontrado el modal personalizado de confirmación.'
        );
        return;
    }


    const botonConfirmar =
        document.getElementById('users-feedback-confirm');

    const botonCancelar =
        document.getElementById('users-feedback-cancel');

    const overlay =
        modal.querySelector('.users-feedback-overlay');


    if (!botonConfirmar || !botonCancelar) {
        console.error(
            'Faltan los botones del modal de confirmación.'
        );
        return;
    }


    // Confirmar acción.
    botonConfirmar.addEventListener('click', () => {
        cerrarFeedbackModal(true);
    });


    // Cancelar acción.
    botonCancelar.addEventListener('click', () => {
        cerrarFeedbackModal(false);
    });


    // Cerrar al pulsar fuera del contenido.
    overlay?.addEventListener('click', () => {
        cerrarFeedbackModal(false);
    });


    // Cerrar al pulsar Escape.
    document.addEventListener('keydown', event => {

        if (
            event.key === 'Escape' &&
            !modal.hidden &&
            resolverFeedbackModal
        ) {
            cerrarFeedbackModal(false);
        }
    });
}

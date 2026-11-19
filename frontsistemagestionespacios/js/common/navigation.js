
/****************************************************************/
/* Archivo: navigation.js                                       */
/* Descripción: Contiene las funciones comunes relacionadas     */
/* con la navegación entre las diferentes páginas y módulos.    */
/****************************************************************/

import { consultarAPI } from "../api/api.js";
import { traducir } from "../i18n/i18n.js";
import {
    validarCampoTexto,
    ocultarErrorFormulario,
    mostrarErrorFormulario,
    mostrarErrorCampo,
    ocultarErrorCampo
} from "./form-errors.js";

import {
    REGLAS_CAMPOS,
    registrarValidacion
} from "./validation.js";


// ============================================================
// ENLACES DEL MENÚ LATERAL
// ============================================================

const menuGroups = [
    {
        titleKey: 'navigation.general',
        links: [
            {
                page: 'bienvenida',
                href: 'bienvenida.html',
                icon: 'home',
                labelKey: 'navigation.welcome'
            }
        ]
    },
    {
        titleKey: 'navigation.management',
        links: [
            {
                page: 'usuarios',
                href: 'usuarios.html',
                icon: 'users',
                labelKey: 'navigation.users',
                require: "ADMIN"
            },
            {
                page: 'facultades',
                href: 'facultades.html',
                icon: 'faculty',
                labelKey: 'navigation.faculties'
            },
            {
                page: 'edificios',
                href: 'edificios.html',
                icon: 'building',
                labelKey: 'navigation.buildings'
            },
            {
                page: 'plantas',
                href: 'plantas.html',
                icon: 'layers',
                labelKey: 'navigation.floors'
            },
            {
                page: 'espacios',
                href: 'espacios.html',
                icon: 'space',
                labelKey: 'navigation.spaces'
            }
        ]
    },
    {
        titleKey: 'navigation.tests',
        links: [
            {
                page: 'test-backend',
                href: 'test-backend.html',
                icon: 'server',
                labelKey: 'navigation.backendTest'
            },
            {
                page: 'test-frontend',
                href: 'test-frontend.html',
                icon: 'code',
                labelKey: 'navigation.frontendTest'
            }
        ],
        require: "ADMIN"
    }
];


// ============================================================
// RENDERIZADO DEL MENÚ LATERAL
// ============================================================

function renderLink(link, currentPage) {

    const isActive = link.page === currentPage;
    const label = traducir(link.labelKey);

    return `
        <li>
            <a class="sidebar-link${isActive ? ' active' : ''}"
                href="${link.href}"
                ${isActive ? 'aria-current="page"' : ''}>

                <span data-icon="${link.icon}" aria-hidden="true"></span>
                ${label}

            </a>
        </li>
    `;
}


function renderSidebar(currentPage) {

    const rol = sessionStorage.getItem('nom_grupo');

    if (!rol) return '';

    const groups = menuGroups
        .filter(group => group.require === undefined || group.require === rol)
        .map(group => `
            <div class="sidebar-group">

                <span class="sidebar-group-title">
                    ${traducir(group.titleKey)}
                </span>

                <ul>
                    ${group.links
                        .filter(link => link.require === undefined || link.require === rol)
                        .map(link => renderLink(link, currentPage))
                        .join('')}
                </ul>

            </div>
        `).join('');

    return `
        <a class="brand-mark"
            href="bienvenida.html"
            aria-label="SGEU, Universidade de Vigo">

            <span>SGEU</span>
            <small>Universidade de Vigo</small>

        </a>

        <nav class="sidebar-nav" aria-label="Menú principal">
            ${groups}
        </nav>
    `;
}


// ============================================================
// RENDERIZADO DEL MENÚ SUPERIOR
// ============================================================

function renderTopbar() {

    return `
        <div class="topbar-left">

            <button type="button"
                class="sidebar-toggle"
                aria-label="Abrir menú"
                aria-controls="app-sidebar"
                aria-expanded="false">

                <span data-icon="menu" aria-hidden="true"></span>

            </button>

            <div class="course-select">

                <select id="course-select"
                    name="course"
                    aria-label="Curso académico">

                    <option value="2026-2027" selected>
                        Curso 2026/27
                    </option>

                </select>

                <span data-icon="chevron" aria-hidden="true"></span>

            </div>

        </div>

        <div class="topbar-right">

            <nav class="lang-switch" aria-label="Seleccionar idioma">

                <button type="button"
                    class="active"
                    aria-pressed="true"
                    lang="es">ES</button>

                <button type="button"
                    aria-pressed="false"
                    lang="gl">GL</button>

                <button type="button"
                    aria-pressed="false"
                    lang="en">EN</button>

            </nav>

            <div class="profile-dropdown" id="profile-dropdown">

                <button type="button"
                    class="user-menu"
                    id="user-menu"
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-controls="profile-menu">

                    <span class="user-avatar"
                        id="user-initials"
                        aria-hidden="true">AP</span>

                    <span class="user-info">
                        <strong id="user-name"></strong>
                        <small id="user-role">Usuario</small>
                    </span>

                    <span class="user-menu-arrow"
                        data-icon="chevron"
                        aria-hidden="true"></span>

                </button>

                <div class="profile-menu" id="profile-menu" hidden>

                    <button type="button" id="open-profile">
                        <span data-icon="users" aria-hidden="true"></span>
                        <span data-i18n="navigation.myProf">Mi Perfil</span>
                    </button>

                    <button type="button"
                        id="logout-button"
                        class="logout-option">

                        <span data-icon="logout" aria-hidden="true"></span>
                        <span data-i18n="navigation.closeSes">Cerrar Sesion</span>

                    </button>

                </div>

            </div>

        </div>

        <!-- MODAL DEL PERFIL -->

        <div class="profile-modal-backdrop"
            id="profile-modal"
            hidden>

            <section class="profile-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-modal-title">

                <div class="profile-modal-header">

                    <div>
                        <h2 id="profile-modal-title" data-i18n="navigation.myProf">Mi Perfil</h2>
                        <p data-i18n="navigation.consulta">
                            Consulta y modifica tus datos personales
                        </p>
                    </div>

                    <button type="button"
                        id="close-profile"
                        class="profile-modal-close"
                        aria-label="Cerrar ventana">

                        <span data-icon="close" aria-hidden="true"></span>

                    </button>

                </div>

                <form id="profile-form">

                    <div class="profile-form-grid">

                        <div class="field">
                            <label class="field-label" for="profile-name" data-i18n="login.name">
                                Nombre
                            </label>

                            <input class="field-input"
                                id="profile-name"
                                name="nombre_usuario"
                                type="text"
                                readonly
                                required>
                        </div>

                        <div class="field">
                            <label class="field-label" for="profile-surname" data-i18n="login.lastName">
                                Apellidos
                            </label>

                            <input class="field-input"
                                id="profile-surname"
                                name="apellidos"
                                type="text"
                                readonly
                                required>
                        </div>

                        <div class="field">
                            <label class="field-label" for="profile-email" data-i18n="login.userOrEmail">
                                Correo electrónico
                            </label>

                            <input class="field-input"
                                id="profile-email"
                                name="mail"
                                type="email"
                                readonly
                                required>
                        </div>

                        <div class="field">
                            <label class="field-label" for="profile-dni" data-i18n="login.dni">
                                DNI/NIE
                            </label>

                            <input class="field-input"
                                id="profile-dni"
                                name="dni"
                                type="text"
                                readonly>
                        </div>

                        <div class="field">
                            <label class="field-label" for="profile-phone" data-i18n="login.phone">
                                Teléfono
                            </label>

                            <input class="field-input"
                                id="profile-phone"
                                name="telefono"
                                type="tel"
                                readonly>
                        </div>

                        <div class="field">
                            <label class="field-label" for="profile-dob" data-i18n="login.birthDate">
                                Fecha
                            </label>

                            <input class="field-input"
                                id="profile-dob"
                                name="fecha"
                                type="date"
                                readonly>
                        </div>

                    </div>

                    <!-- CAMBIO DE CONTRASEÑA -->

                    <div class="profile-password-section"
                        id="profile-password-section"
                        hidden>

                        <br>

                        <h3 data-i18n="login.changePassword">Cambiar contraseña</h3>

                        <p data-i18n="login.changePasswordDescription">
                            Introduce tu contraseña actual para poder
                            establecer una nueva.
                        </p>

                        <div class="profile-form-grid">

                            <div class="field">
                                <label class="field-label"
                                    for="profile-current-password"
                                    data-i18n="login.actualPassword">
                                    Contraseña actual
                                </label>

                                <div class="input-wrap input-wrap-password">

                                    <input class="field-input"
                                        id="profile-current-password"
                                        name="password_actual"
                                        type="password"
                                        autocomplete="current-password"
                                        readonly>

                                    <button type="button"
                                        class="input-action"
                                        id="toggle-profile-current-password"
                                        aria-label="Mostrar contraseña"
                                        aria-controls="profile-current-password"
                                        aria-pressed="false">

                                        <span data-icon="eye" aria-hidden="true"></span>

                                    </button>

                                </div>
                            </div>

                            <div class="field">
                                <label class="field-label"
                                    for="profile-password"
                                    data-i18n="login.newPassword">
                                    Nueva contraseña
                                </label>

                                <div class="input-wrap input-wrap-password">

                                    <input class="field-input"
                                        id="profile-password"
                                        name="password"
                                        type="password"
                                        autocomplete="new-password"
                                        readonly>

                                    <button type="button"
                                        class="input-action"
                                        id="toggle-profile-password"
                                        aria-label="Mostrar contraseña"
                                        aria-controls="profile-password"
                                        aria-pressed="false">

                                        <span data-icon="eye" aria-hidden="true"></span>

                                    </button>

                                </div>
                            </div>

                            <div class="field">
                                <label class="field-label"
                                    for="profile-password-repeat"
                                    data-i18n="login.repeatNewPassword">
                                    Repetir nueva contraseña
                                </label>

                                <div class="input-wrap input-wrap-password">

                                    <input class="field-input"
                                        id="profile-password-repeat"
                                        type="password"
                                        autocomplete="new-password"
                                        readonly>

                                    <button type="button"
                                        class="input-action"
                                        id="toggle-profile-password-repeat"
                                        aria-label="Mostrar contraseña"
                                        aria-controls="profile-password-repeat"
                                        aria-pressed="false">

                                        <span data-icon="eye" aria-hidden="true"></span>

                                    </button>

                                </div>
                            </div>

                        </div>

                    </div>

                    <p id="profile-message"
                        role="status"
                        aria-live="polite"
                        hidden></p>

                    <div class="profile-modal-actions">

                        <button type="button"
                            class="btn"
                            id="cancel-profile"
                            data-i18n="login.cancelChanges"
                            hidden>
                            Cancelar
                        </button>

                        <button type="button"
                            class="btn btn-primary"
                            id="edit-profile"
                            data-i18n="login.modifyUser">
                            Modificar usuario
                        </button>

                        <button type="submit"
                            class="btn btn-primary"
                            id="save-profile"
                            data-i18n="login.saveChanges"
                            hidden>
                            Guardar cambios
                        </button>

                    </div>

                </form>

            </section>

        </div>
    `;
}


// ============================================================
// OCULTAR OPCIONES SIN PERMISOS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    const rolUsuario = sessionStorage.getItem('nom_grupo');

    const elementosRestringidos =
        document.querySelectorAll('[data-require]');

    elementosRestringidos.forEach(elemento => {

        const rolRequerido =
            elemento.getAttribute('data-require');

        if (rolRequerido && rolUsuario !== rolRequerido) {
            elemento.hidden = true;
        }

    });

});


// ============================================================
// CARGAR DATOS DEL USUARIO
// ============================================================

function rellenarDatosPerfil() {

    const storedUser = sessionStorage.getItem('sgeu_usuario');

    if (!storedUser) return;

    try {

        const user = JSON.parse(storedUser);

        const fields = {
            'profile-name': user.nom_usuario,
            'profile-surname': user.apell_usuario,
            'profile-email': user.email,
            'profile-phone': user.telefono,
            'profile-dob': user.fech_nacimiento,
            'profile-dni': user.dni
        };

        Object.entries(fields).forEach(([id, value]) => {

            const field = document.getElementById(id);

            if (field) {
                field.value = value || '';
            }

        });

        const name = user.nom_usuario || 'Usuario';
        const surname = user.apell_usuario || '';
        const fullName = `${name} ${surname}`.trim();

        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const initials = document.getElementById('user-initials');

        if (userName) {
            userName.textContent = fullName;
        }

        function obtenerRol(idGrupo) {
        
                const roles = {
                    '1': traducir('usuarios.roles.administration'),
                    '2': traducir('usuarios.roles.manager'),
                    '3': traducir('usuarios.roles.consultation')
                };
        
                return roles[String(idGrupo)] || 'Sin perfil';
            }
        

        if (userRole) {
            const roles = {
                'ADMIN': 'usuarios.roles.administration',
                'GESTOR': 'usuarios.roles.manager',
                'LECTOR': 'usuarios.roles.consultation'
            };

            userRole.textContent = traducir(
                roles[user.nom_grupo] || 'usuarios.roles.consultation'
            );
        }

        if (initials) {
            initials.textContent =
                `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
        }

    } catch (error) {

        console.error(
            'No se pudieron cargar los datos del perfil:',
            error
        );

    }

}


// ============================================================
// EDICIÓN DEL PERFIL
// ============================================================

function configurarEdicionPerfil() {

    const form = document.getElementById('profile-form');

    if (!form) return;

    const editButton = document.getElementById('edit-profile');
    const saveButton = document.getElementById('save-profile');
    const cancelButton = document.getElementById('cancel-profile');

    const passwordSection =
        document.getElementById('profile-password-section');

    const message = document.getElementById('profile-message');

    const nameInput = document.getElementById('profile-name');
    const lastnameInput = document.getElementById('profile-surname');
    const phoneInput = document.getElementById('profile-phone');

    const currentPasswordInput =
        document.getElementById('profile-current-password');

    const newPasswordInput =
        document.getElementById('profile-password');

    const repeatPasswordInput =
        document.getElementById('profile-password-repeat');

    const editableFields = [
        nameInput,
        lastnameInput,
        phoneInput,
        currentPasswordInput,
        newPasswordInput,
        repeatPasswordInput
    ];

    function setEditing(editing) {

        editableFields.forEach(field => {
            if (field) {
                field.readOnly = !editing;
            }
        });

        if (editButton) editButton.hidden = editing;
        if (saveButton) saveButton.hidden = !editing;
        if (cancelButton) cancelButton.hidden = !editing;

        if (passwordSection) {
            passwordSection.hidden = !editing;
        }

        if (!editing) {

            form.reset();

            rellenarDatosPerfil();

            // Limpiar errores de validación de todos los campos.
            editableFields.forEach(field => {
                if (field) {
                    ocultarErrorCampo(field);
                }
            });

            // Limpiar posibles errores generales.
            if (message) {
                ocultarErrorFormulario(message);
                message.hidden = true;
                message.textContent = '';
            }

        }

    }

    // Permitir que el cierre del modal restablezca la edición.
    restablecerEdicionPerfil = () => setEditing(false);


    // ACTIVAR EDICIÓN

    if (editButton) {

        editButton.addEventListener('click', () => {

            setEditing(true);

            const firstField = document.getElementById('profile-name');

            if (firstField) {
                firstField.focus();
            }

        });

    }


    // CANCELAR EDICIÓN

    if (cancelButton) {

        cancelButton.addEventListener('click', () => {
            setEditing(false);
        });

    }


    // MENSAJES DE VALIDACIÓN

    const obtenerMensajesNombre = () => ({
        min_size: traducir('login.nombreMinSize'),
        max_size: traducir('login.nombreMaxSize'),
        format: traducir('login.nombreFormat')
    });

    const obtenerMensajesApell = () => ({
        min_size: traducir('login.apellMinSize'),
        max_size: traducir('login.apellMaxSize'),
        format: traducir('login.apellFormat')
    });

    const obtenerMensajesTelef = () => ({
        min_size: traducir('login.telefMinSize'),
        max_size: traducir('login.telefMaxSize'),
        format: traducir('login.telefFormat')
    });

    const obtenerMensajesPass = () => ({
        min_size: traducir('login.passMinSize'),
        max_size: traducir('login.passMaxSize'),
        format: traducir('login.passFormat')
    });


    // REGISTRO DE VALIDACIONES

    registrarValidacion(
        nameInput,
        () => validarCampoTexto(
            nameInput,
            REGLAS_CAMPOS.usuario.nombre_usuario,
            obtenerMensajesNombre()
        )
    );

    registrarValidacion(
        lastnameInput,
        () => validarCampoTexto(
            lastnameInput,
            REGLAS_CAMPOS.usuario.apellidos,
            obtenerMensajesApell()
        )
    );

    registrarValidacion(
        phoneInput,
        () => validarCampoTexto(
            phoneInput,
            REGLAS_CAMPOS.usuario.telefono,
            obtenerMensajesTelef()
        )
    );


    // COINCIDENCIA DE CONTRASEÑAS

    function validarCoincidenciaPassword() {

        const coinciden =
            newPasswordInput.value === repeatPasswordInput.value;

        if (!coinciden) {

            const mensaje = traducir('login.passNotEq');

            mostrarErrorCampo(newPasswordInput, mensaje);
            mostrarErrorCampo(repeatPasswordInput, mensaje);

            return false;
        }

        ocultarErrorCampo(newPasswordInput);
        ocultarErrorCampo(repeatPasswordInput);

        return true;
    }


    // ENVÍO DEL FORMULARIO

    form.addEventListener('submit', async (event) => {

        event.preventDefault();

        ocultarErrorFormulario(message);

        let valido = true;

        // Validar datos personales modificables.

        if (!validarCampoTexto(
            nameInput,
            REGLAS_CAMPOS.usuario.nombre_usuario,
            obtenerMensajesNombre()
        )) {
            valido = false;
        }

        if (!validarCampoTexto(
            lastnameInput,
            REGLAS_CAMPOS.usuario.apellidos,
            obtenerMensajesApell()
        )) {
            valido = false;
        }

        if (!validarCampoTexto(
            phoneInput,
            REGLAS_CAMPOS.usuario.telefono,
            obtenerMensajesTelef()
        )) {
            valido = false;
        }


        // Las contraseñas solo se validan si se quiere cambiarlas.

        const quiereCambiarPassword =
            currentPasswordInput.value.trim() !== '' ||
            newPasswordInput.value.trim() !== '' ||
            repeatPasswordInput.value.trim() !== '';

        if (quiereCambiarPassword) {

            if (!validarCampoTexto(
                currentPasswordInput,
                REGLAS_CAMPOS.usuario.password,
                obtenerMensajesPass()
            )) {
                valido = false;
            }

            if (!validarCampoTexto(
                newPasswordInput,
                REGLAS_CAMPOS.usuario.password,
                obtenerMensajesPass()
            )) {
                valido = false;
            }

            if (!validarCampoTexto(
                repeatPasswordInput,
                REGLAS_CAMPOS.usuario.password,
                obtenerMensajesPass()
            )) {
                valido = false;
            }

            if (!validarCoincidenciaPassword()) {
                valido = false;
            }

        }

        if (!valido) return;


        // Recuperar todos los datos originales del usuario.

        let user;

        try {
            user = JSON.parse(sessionStorage.getItem('sgeu_usuario'));

            if (!user || !user.id_usuario) {
                throw new Error('No se encontraron los datos del usuario.');
            }

        } catch (error) {

            console.error(error);

            mostrarErrorFormulario(
                message,
                traducir('login.SERVER_ERROR')
            );

            return;
        }


        // Evitar envíos repetidos.

        saveButton.disabled = true;
        saveButton.textContent = traducir('login.LOADING');


        try {

            // Mantener los campos que no se pueden editar.
            // Se envían para evitar que el backend los sustituya
            // por valores predeterminados.

            const userData = {
                id_usuario: user.id_usuario,
                nom_usuario: nameInput.value.trim(),
                apell_usuario: lastnameInput.value.trim(),
                email: user.email,
                dni: user.dni,
                telefono: phoneInput.value.trim(),
                fech_nacimiento: user.fech_nacimiento,
                id_grupo: user.id_grupo,
                id_edificio: user.id_edificio,
                activo_usuario: 1
            };

            // Añadir datos de contraseña únicamente si se cambia.

            if (quiereCambiarPassword) {
                userData.pass = newPasswordInput.value;
                userData.oldPass = currentPasswordInput.value;
            }

            
            console.log("Usuario de sessionStorage:", user);
            console.log("Datos enviados a EDIT:", userData);
            console.table(
                Object.entries(userData).map(([campo, valor]) => ({
                    campo,
                    valor,
                    esUndefined: valor === undefined
                }))
            );

            const response = await consultarAPI('usuario', 'EDIT',userData);

            /*
             * IMPORTANTE:
             * Aquí se presupone que la respuesta del backend
             * contiene response.ok y response.resource.usuario,
             * tal como se había planteado en el código anterior.
             * Comprueba esos nombres en la pestaña Network.
             */

            if (!response.ok) {

                switch (response.code) {

                    case 'USUARIO_EDIT_PASS_KO':
                        mostrarErrorFormulario(
                            message,
                            traducir('navigation.USUARIO_EDIT_PASS_KO')
                        );
                        break;

                    default:
                        mostrarErrorFormulario(
                            message,
                            traducir('navigation.USUARIO_EDIT_DEF_KO')
                        );
                }

                return;
            }


            
            // Actualizar los datos de sesión con los valores guardados.

            const usuarioActualizado = {
                ...user,
                nom_usuario: userData.nom_usuario,
                apell_usuario: userData.apell_usuario,
                telefono: userData.telefono
            };

            sessionStorage.setItem(
                'sgeu_usuario',
                JSON.stringify(usuarioActualizado)
            );

            setEditing(false);

            const modal = document.getElementById('profile-modal');
            if (modal) modal.hidden = true;


            // Cerrar el modal.

            if (modal) {
                modal.hidden = true;
            }

        } catch (error) {

            console.error(
                'Error en el envío de la petición:',
                error
            );

            mostrarErrorFormulario(
                message,
                traducir('login.SERVER_ERROR')
            );

        } finally {

            saveButton.disabled = false;
            saveButton.textContent =
                traducir('login.saveChanges');

        }

    });


    // MODO CONSULTA INICIAL

    setEditing(false);

}

// ============================================================
// CIERRE DEL MODAL DEL PERFIL
// ============================================================

let restablecerEdicionPerfil = null;

function cerrarModalPerfil() {

    // Restablecer el formulario y limpiar los errores.
    if (typeof restablecerEdicionPerfil === 'function') {
        restablecerEdicionPerfil();
    }

    const modal = document.getElementById('profile-modal');

    if (modal) {
        modal.hidden = true;
    }

    // Permitir de nuevo el scroll de la página.
    document.body.classList.remove('profile-modal-open');

}


// ============================================================
// MENÚ DEL PERFIL
// ============================================================

function configurarMenuPerfil() {

    const userMenu = document.getElementById('user-menu');
    const profileMenu = document.getElementById('profile-menu');

    const openProfileButton =
        document.getElementById('open-profile');

    const logoutButton =
        document.getElementById('logout-button');

    const modal =
        document.getElementById('profile-modal');

    const closeProfileButton =
        document.getElementById('close-profile');

    if (!userMenu || !profileMenu || !modal) return;


    // ABRIR Y CERRAR DESPLEGABLE

    userMenu.addEventListener('click', () => {

        const isOpen = !profileMenu.hidden;

        profileMenu.hidden = isOpen;

        userMenu.setAttribute(
            'aria-expanded',
            String(!isOpen)
        );

    });


    // CERRAR MODAL

    function cerrarModal() {
        cerrarModalPerfil();
    }


    // ABRIR PERFIL

    if (openProfileButton) {

        openProfileButton.addEventListener('click', () => {

            profileMenu.hidden = true;

            userMenu.setAttribute('aria-expanded', 'false');

            rellenarDatosPerfil();

            modal.hidden = false;

            // Bloquear el scroll de la página de fondo.
            document.body.classList.add('profile-modal-open');

            const editButton =
                document.getElementById('edit-profile');

            if (editButton && !editButton.hidden) {
                // El formulario ya está en modo consulta.
                // No es necesario cambiar su estado.
            }

            const firstField =
                document.getElementById('profile-name');

            if (firstField) {
                firstField.focus();
            }

        });

    }


    // CERRAR DESDE EL BOTÓN SUPERIOR

    if (closeProfileButton) {
        closeProfileButton.addEventListener('click', cerrarModal);
    }


    // CERRAR AL PULSAR FUERA

    modal.addEventListener('click', (event) => {

        if (event.target === modal) {
            cerrarModal();
        }

    });


    // CERRAR SESIÓN

    if (logoutButton) {

        logoutButton.addEventListener('click', () => {

            sessionStorage.removeItem('sgeu_token');
            sessionStorage.removeItem('sgeu_usuario');
            sessionStorage.removeItem('nom_grupo');

            window.location.replace('bienvenida-publica.html');

        });

    }

}


// ============================================================
// CONTROL DE SESIÓN AL VOLVER A LA PÁGINA
// ============================================================

window.addEventListener('pageshow', function (event) {

    const navigationEntry =
        performance.getEntriesByType('navigation')[0];

    if (
        event.persisted ||
        navigationEntry?.type === 'back_forward'
    ) {

        if (!sessionStorage.getItem('sgeu_token')) {
            window.location.replace('login.html');
        }

    }

});


// ============================================================
// VISIBILIDAD DE LAS CONTRASEÑAS
// ============================================================

function configurarVisibilidadContrasenasPerfil() {

    const toggleButtons = [
        'toggle-profile-current-password',
        'toggle-profile-password',
        'toggle-profile-password-repeat'
    ];

    toggleButtons.forEach(buttonId => {

        const button = document.getElementById(buttonId);

        if (!button) return;

        button.addEventListener('click', () => {

            const input =
                button.parentElement.querySelector('input');

            if (!input) return;

            const isPassword = input.type === 'password';

            input.type = isPassword ? 'text' : 'password';

            button.setAttribute(
                'aria-label',
                isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            );

            button.setAttribute(
                'aria-pressed',
                String(isPassword)
            );

            const iconName = isPassword ? 'eye-off' : 'eye';

            button.innerHTML = `
                <span data-icon="${iconName}" aria-hidden="true"></span>
            `;

            if (typeof window.renderIcons === 'function') {
                window.renderIcons(button);
            }

        });

    });

}


// ============================================================
// CONTROL DEL MENÚ LATERAL EN MÓVILES
// ============================================================

function configurarSidebar() {

    // Evitar registrar el mismo evento varias veces.
    if (window.sidebarEventsConfigurados) {
        return;
    }

    window.sidebarEventsConfigurados = true;

    // Un único evento para toda la página.
    document.addEventListener('click', (event) => {

        // Buscar siempre los elementos actuales.
        const sidebar = document.querySelector('.app-sidebar');
        const toggleButton = document.querySelector('.sidebar-toggle');

        if (!sidebar || !toggleButton) return;

        // Si se pulsa el botón del menú.
        if (event.target.closest('.sidebar-toggle')) {

            const isOpen = sidebar.classList.toggle('open');

            toggleButton.setAttribute('aria-expanded', String(isOpen));
            toggleButton.setAttribute(
                'aria-label',
                isOpen ? 'Cerrar menú' : 'Abrir menú'
            );

            return;
        }

        // Si el menú está cerrado, no hay nada más que hacer.
        if (!sidebar.classList.contains('open')) return;

        // Si se selecciona una opción del menú, cerrarlo.
        if (event.target.closest('.sidebar-link')) {
            cerrarSidebar();
            return;
        }

        // Si se pulsa fuera del menú, cerrarlo.
        if (
            !sidebar.contains(event.target) &&
            !toggleButton.contains(event.target)
        ) {
            cerrarSidebar();
        }

        function cerrarSidebar() {
            sidebar.classList.remove('open');
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.setAttribute('aria-label', 'Abrir menú');
        }

    });

}


// ============================================================
// INICIALIZACIÓN DE LA NAVEGACIÓN
// ============================================================

document.addEventListener('langChanged', () => {

    const sidebar = document.querySelector('.app-sidebar');
    const topbar = document.querySelector('.app-topbar');

    // 1. Generar el menú lateral.

    if (sidebar) {
        sidebar.innerHTML =
            renderSidebar(document.body.dataset.page);
    }

    // 2. Generar la barra superior.

    if (topbar) {
        topbar.innerHTML = renderTopbar();
    }

    // 3. Aplicar traducciones al HTML recién insertado.

    if (typeof window.applyTranslations === 'function') {
        window.applyTranslations(topbar || document);
    }

    // 4. Renderizar iconos.

    if (typeof window.renderIcons === 'function') {
        window.renderIcons(document);
    }

    // 5. Configurar las funcionalidades del perfil.

    if (topbar) {

        rellenarDatosPerfil();

        configurarEdicionPerfil();

        configurarMenuPerfil();

        configurarVisibilidadContrasenasPerfil();

    }

     configurarSidebar();

});
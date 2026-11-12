/****************************************************************/
/* Archivo: auth.js                                             */
/* Descripción: Gestiona las interacciones de la página        */
/* de inicio de sesión de SGEU.                                 */
/* Tecnología: JavaScript nativo (ES11).                        */
/****************************************************************/

import {registerUser,loginUser} from "../api/api.js"
import { validarCampoTexto, mostrarErrorFormulario, ocultarErrorFormulario, validarCampoFecha, mostrarErrorCampo, ocultarErrorCampo } from "../common/form-errors.js";
import { REGLAS_CAMPOS,registrarValidacion } from "../common/validation.js";
import { traducir} from "../i18n/i18n.js";




// ============================================================
// MOSTRAR Y OCULTAR CONTRASEÑAS
// ============================================================

function configurarVisibilidadPassword(inputId, buttonId) {

    const passwordInput = document.getElementById(inputId);
    const togglePasswordButton = document.getElementById(buttonId);

    if (!passwordInput || !togglePasswordButton) {
        return;
    }

    togglePasswordButton.addEventListener('click', () => {

        const isPasswordHidden = passwordInput.type === 'password';

        passwordInput.type = isPasswordHidden ? 'text' : 'password';

        togglePasswordButton.setAttribute(
            'aria-label',
            isPasswordHidden ? 'Ocultar contraseña' : 'Mostrar contraseña'
        );

        togglePasswordButton.setAttribute(
            'aria-pressed',
            String(isPasswordHidden)
        );

        const icon = togglePasswordButton.querySelector('[data-icon]');

        if (icon && typeof getIcon === 'function') {
            icon.innerHTML = getIcon(
                isPasswordHidden ? 'eyeOff' : 'eye'
            );
        }
    });
}


// Configurar los tres botones de visibilidad
configurarVisibilidadPassword(
    'login-password',
    'toggle-password'
);

configurarVisibilidadPassword(
    'request-password',
    'toggle-request-password'
);

configurarVisibilidadPassword(
    'request-password-repeat',
    'toggle-request-password-repeat'
);


// ============================================================
// MOSTRAR Y OCULTAR FORMULARIO DE SOLICITUD
// ============================================================

const showRequestButton = document.getElementById('show-request-form');
const requestFormSection = document.getElementById('request-form-section');


if (showRequestButton && requestFormSection) {

    showRequestButton.setAttribute('aria-controls', 'request-form-section');
    showRequestButton.setAttribute('aria-expanded', 'false');

    function actualizarTextoSolicitud() {
        const clave = requestFormSection.hidden
            ? 'login.requestAuthorization'
            : 'login.closeRequest';

        const texto = showRequestButton.querySelector('[data-i18n]');

        if (texto) {
            texto.setAttribute('data-i18n', clave);
            texto.textContent = traducir(clave);
        }
    }

    showRequestButton.addEventListener('click', () => {

        const isHidden = requestFormSection.hidden;

        requestFormSection.hidden = !isHidden;

        showRequestButton.setAttribute(
            'aria-expanded',
            String(isHidden)
        );

        actualizarTextoSolicitud();

        if (isHidden) {
            const firstInput = requestFormSection.querySelector('input');

            if (firstInput) {
                firstInput.focus();
            }
        }
    });

    // Actualizar también al cambiar el idioma.
    document.addEventListener('langChanged', actualizarTextoSolicitud);
}



// ============================================================
// INICIO DE SESIÓN
// ============================================================

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

if (loginForm && loginMessage) {

    const userInput = document.getElementById('login-user');
    const passwordInput = document.getElementById('login-password');
    const submitButton = loginForm.querySelector('[type="submit"]');

    //todo aqui no traduce esto
    const obtenerMensajesEmail = () => ({
        min_size: traducir('login.emailMinSize'),
        max_size: traducir('login.emailMaxSize'),
        format: traducir('login.emailFormat')
    });

    const obtenerMensajesPass = () => ({
        min_size: traducir('login.passMinSize'),
        max_size: traducir('login.passMaxSize'),
        format: traducir('login.passFormat')
    });

    registrarValidacion(
        userInput,
        () => validarCampoTexto(
            userInput,
            REGLAS_CAMPOS.login.user,
            obtenerMensajesEmail()
        )
    );

    registrarValidacion(
        passwordInput,
        () => validarCampoTexto(
            passwordInput,
            REGLAS_CAMPOS.login.password,
            obtenerMensajesPass()
        )
    );


    loginForm.addEventListener('submit', async (event) => {

        event.preventDefault();

        ocultarErrorFormulario(loginMessage);


        const mail = userInput.value.trim();
        const password = passwordInput.value;

        let valido = true;
        if (!validarCampoTexto(userInput, REGLAS_CAMPOS.login.user, obtenerMensajesEmail())) valido = false;
        if (!validarCampoTexto(passwordInput, REGLAS_CAMPOS.login.password, obtenerMensajesPass())) valido = false;

        if (!valido) return;


        // Evitar envíos repetidos
        submitButton.disabled = true;
        submitButton.textContent = traducir('login.LOADING');

        try {

            const response = await loginUser(mail, password);

            if (!response.ok) {

                switch (response.code) {

                    case 'USUARIO_LOGIN_KO':
                        mostrarErrorFormulario(loginMessage, traducir("login.USUARIO_LOGIN_KO"));
                        break;

                    case 'USUARIO_INACTIVO_KO':
                        mostrarErrorFormulario(loginMessage, traducir("login.USUARIO_INACTIVO_KO"));
                        break;

                    default:
                        mostrarErrorFormulario(loginMessage, traducir("login.USUARIO_LOGIN_DEF_KO"));
                }

                return;
            }

            // Guardar token y datos del usuario durante la sesión
            const token = response.resource.token;
            const usuario = response.resource.usuario;
            const nom_grupo = response.resource.usuario.nom_grupo;

            sessionStorage.setItem('sgeu_token', token);
            sessionStorage.setItem('sgeu_usuario', JSON.stringify(usuario));
            sessionStorage.setItem('nom_grupo', nom_grupo);

            // Acceder a la página privada
            window.location.href = 'bienvenida.html';

        } catch (error) {

            console.error('Error en el inicio de sesión:', error);
            mostrarErrorFormulario(loginMessage, traducir("login.SERVER_ERROR"));

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = traducir("common.signIn");
        }
    });
}


const requestForm = document.getElementById('request-form');
const requestMessage = document.getElementById('request-message');

if (requestForm && requestMessage) {
    const nameInput = document.getElementById('request-name');
    const lastnameInput = document.getElementById('request-lastname');
    const emailInput = document.getElementById('request-email');
    const dniInput = document.getElementById('request-dni');
    const phoneInput = document.getElementById('request-phone');
    const birthdateInput = document.getElementById('request-birthdate');
    const passwordInput = document.getElementById('request-password');
    const repeatPasswordInput = document.getElementById('request-password-repeat');
    const requestSubmitButton = requestForm.querySelector('[type="submit"]');


    //Definir mensajes de traduccion de errores
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
    const obtenerMensajesEmail = () => ({
        min_size: traducir('login.emailMinSize'),
        max_size: traducir('login.emailMaxSize'),
        format: traducir('login.emailFormat')
    });
    const obtenerMensajesDNI = () => ({
        min_size: traducir('login.dniMinSize'),
        max_size: traducir('login.dniMaxSize'),
        format: traducir('login.dniFormat')
    });
    const obtenerMensajesTelef = () => ({
        min_size: traducir('login.telefMinSize'),
        max_size: traducir('login.telefMaxSize'),
        format: traducir('login.telefFormat')
    });
    const obtenerMensajesFecha = () => ({
        format: traducir('login.fechaFormat')
    });
    const obtenerMensajesPass = () => ({
        min_size: traducir('login.passMinSize'),
        max_size: traducir('login.passMaxSize'),
        format: traducir('login.passFormat')
    });


    registrarValidacion(
        birthdateInput,
        () => validarCampoFecha(
            birthdateInput,
            REGLAS_CAMPOS.usuario.fecha,
            obtenerMensajesFecha()
        )
    );

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
        emailInput,
        () => validarCampoTexto(
            emailInput,
            REGLAS_CAMPOS.usuario.mail,
            obtenerMensajesEmail()
        )
    );

    registrarValidacion(
        dniInput,
        () => validarCampoTexto(
            dniInput,
            REGLAS_CAMPOS.usuario.dni,
            obtenerMensajesDNI()
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

    registrarValidacion(
        passwordInput,
        () => validarCampoTexto(
            passwordInput,
            REGLAS_CAMPOS.usuario.password,
            obtenerMensajesPass()
        )
    );

    registrarValidacion(
        repeatPasswordInput,
        () => validarCampoTexto(
            repeatPasswordInput,
            REGLAS_CAMPOS.usuario.password,
            obtenerMensajesPass()
        )
    );


    function validarCoincidenciaPassword() {

        const coinciden = passwordInput.value === repeatPasswordInput.value;

        if (!coinciden) {
            const mensaje = traducir('login.passNotEq');

            mostrarErrorCampo(passwordInput, mensaje);
            mostrarErrorCampo(repeatPasswordInput, mensaje);

            return false;
        }

        ocultarErrorCampo(passwordInput);
        ocultarErrorCampo(repeatPasswordInput);

        return true;
    }


    requestForm.addEventListener('submit', async (event) => {

        event.preventDefault();
        ocultarErrorFormulario(requestMessage);

        let valido = true;
        if (!validarCampoFecha(birthdateInput, REGLAS_CAMPOS.usuario.fecha, obtenerMensajesFecha())) valido = false;
        if (!validarCampoTexto(nameInput, REGLAS_CAMPOS.usuario.nom_usuario, obtenerMensajesNombre())) valido = false;
        if (!validarCampoTexto(emailInput, REGLAS_CAMPOS.usuario.mail, obtenerMensajesEmail())) valido = false;
        if (!validarCampoTexto(lastnameInput, REGLAS_CAMPOS.usuario.apellidos, obtenerMensajesApell())) valido = false;
        if (!validarCampoTexto(dniInput, REGLAS_CAMPOS.usuario.dni, obtenerMensajesDNI())) valido = false;
        if (!validarCampoTexto(phoneInput, REGLAS_CAMPOS.usuario.telefono, obtenerMensajesTelef())) valido = false;
        if (!validarCampoTexto(passwordInput, REGLAS_CAMPOS.usuario.password, obtenerMensajesPass())) valido = false;
        if (!validarCampoTexto(repeatPasswordInput, REGLAS_CAMPOS.usuario.password, obtenerMensajesPass())) valido = false;

        if (!validarCoincidenciaPassword()) {
            valido = false;
        }

        if (!valido) return;

        // Evitar envíos repetidos
        requestSubmitButton.disabled = true;
        requestSubmitButton.textContent = traducir('login.LOADING');

        try {

            //Enviar request
            const response = await registerUser({
                nom_usuario: nameInput.value.trim(),
                apell_usuario: lastnameInput.value.trim(),
                email: emailInput.value.trim(),
                dni: dniInput.value.trim(),
                telefono: phoneInput.value.trim(),
                fech_nacimiento: birthdateInput.value,
                pass: passwordInput.value
            });

            //Procesar response
            if (!response.ok) {
                switch (response.code) {

                    case 'USUARIO_YA_EXISTE_KO':
                        mostrarErrorFormulario(requestMessage, traducir("login.USUARIO_YA_EXISTE_KO"));
                        break;
                    default:
                        mostrarErrorFormulario(requestMessage, traducir("login.USUARIO_REG_DEF_KO"));
                }
                return;
            }

            window.location.href = 'bienvenida-publica.html';

        } catch (error) {

            console.error('Error en el envio de registro:', error);
            mostrarErrorFormulario(requestMessage, traducir("login.SERVER_ERROR"));

        } finally {

            requestSubmitButton.disabled = false;
            requestSubmitButton.textContent = traducir("login.sendRequest");
        }

    });
}
// js/common/modal.js

window.SGEU = window.SGEU || {};

window.SGEU.crearModal = function ({
    modal,
    botonesAbrir = [],
    botonesCerrar = [],
    alAbrir = null,
    alCerrar = null
}) {
    if (!modal) {
        console.error('No se ha encontrado el elemento modal.');
        return;
    }

    function abrir() {
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        if (typeof alAbrir === 'function') {
            alAbrir();
        }
    }

    function cerrar() {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        if (typeof alCerrar === 'function') {
            alCerrar();
        }
    }

    botonesAbrir.forEach((boton) => {
        boton?.addEventListener('click', abrir);
    });

    botonesCerrar.forEach((boton) => {
        boton?.addEventListener('click', cerrar);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            cerrar();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) {
            cerrar();
        }
    });

    return { abrir, cerrar };
};
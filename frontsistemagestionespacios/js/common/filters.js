// js/common/filters.js

window.SGEU = window.SGEU || {};

window.SGEU.crearFiltros = function ({
    boton,
    panel,
    botonAplicar,
    botonLimpiar,
    alAplicar = null,
    alLimpiar = null
}) {
    if (!boton || !panel) {
        console.error('No se ha encontrado el botón o el panel de filtros.');
        return;
    }

    function alternar() {
        const estaAbierto = !panel.hidden;

        panel.hidden = estaAbierto;
        boton.setAttribute('aria-expanded', String(!estaAbierto));
    }

    function cerrar() {
        panel.hidden = true;
        boton.setAttribute('aria-expanded', 'false');
    }

    boton.addEventListener('click', alternar);

    botonAplicar?.addEventListener('click', () => {
        if (typeof alAplicar === 'function') {
            alAplicar();
        }

        cerrar();
    });

    botonLimpiar?.addEventListener('click', () => {
        if (typeof alLimpiar === 'function') {
            alLimpiar();
        }
    });

    return { alternar, cerrar };
};
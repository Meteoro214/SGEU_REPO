/**
 * Motor de ejecución de las pruebas declarativas del backend.
 *
 * Las pruebas se definen en arrays con el formato
 * <entidad>_backend_tests y se muestran en la página de pruebas actual.
 */
class Backend_Test {

    /**
     * Inicializa el runner para una entidad concreta.
     * @param {string} nombreEntidad Nombre de la entidad que se va a probar.
     */
    constructor(nombreEntidad) {
        this.nombreEntidad = nombreEntidad;
        this.dom = new DOM_class();
        this.casos = this._cargarCasos();
        this.fixtures = null;
        this.filasCreadas = [];
    }

    /**
     * Obtiene el array de pruebas global de la entidad seleccionada.
     * @returns {Array<object>} Casos declarados para la entidad.
     * @throws {Error} Si la entidad no tiene pruebas backend declaradas.
     */
    _cargarCasos() {
        const nombreCasos = this.nombreEntidad + '_backend_tests';
        const casos = eval('typeof ' + nombreCasos + ' !== "undefined" ? ' + nombreCasos + ' : null');

        if (!Array.isArray(casos)) {
            // Fallar aquí evita ejecutar una batería vacía y ocultar un error de configuración.
            throw new Error('No existen pruebas backend para la entidad: ' + this.nombreEntidad);
        }

        return casos;
    }

    /**
     * Prepara las fixtures, ejecuta los casos, muestra el resultado y limpia los datos QA.
     * @returns {Promise<Array<object>>} Resultados obtenidos por cada caso.
     */
    async ejecutar() {
        try {
            this.fixtures = await prepararFixtures();
        } catch (e) {
            console.error('No se pudieron preparar las fixtures de backend:', e);
            this.fixtures = null;
            this.errorFixtures = e;
        }
        try {
            const salida = await this._ejecutarCasos();
            this._mostrarResultados(salida);
            return salida;
        } finally {
            const limpieza = await limpiarFixtures(this.filasCreadas, this.fixtures);
            if (limpieza.omitidas && limpieza.omitidas.length > 0) {
                console.warn('Limpieza de fixtures QA: filas omitidas por seguridad ->', limpieza.omitidas);
            }
        }
    }

    /**
     * Ejecuta secuencialmente los casos de la entidad seleccionada.
     * @returns {Promise<Array<object>>} Filas que se mostrarán en el informe.
     */
    async _ejecutarCasos() {
        const salida = [];

        for (let i = 0; i < this.casos.length; i++) {
            const { accion, descripcion, overrides, esperado } = this.casos[i];

            // Se conserva una representación legible de los overrides para el informe HTML.
            const overridesVisibles = { ...overrides };
            const grupos = this.fixtures ? this.fixtures.grupos : null;
            const gruposFixture = {
                '__FIXTURE_ID_GRUPO__': grupos ? grupos.gestor : null,
                '__FIXTURE_ID_GRUPO_ADMIN__': grupos ? grupos.admin : null,
                '__FIXTURE_ID_GRUPO_LECTOR__': grupos ? grupos.lector : null
            };
            const usuariosReactivar = this.fixtures ? this.fixtures.idUsuariosReactivar : null;
            const usuariosReactivarFixture = {
                '__FIXTURE_ID_REACTIVAR_ADMIN__': usuariosReactivar ? usuariosReactivar.admin : null,
                '__FIXTURE_ID_REACTIVAR_GESTOR__': usuariosReactivar ? usuariosReactivar.gestor : null
            };
            const rechazar = this.fixtures ? {
                '__FIXTURE_ID_RECHAZAR__': this.fixtures.idUsuarioRechazar,
                '__FIXTURE_EMAIL_RECHAZAR__': this.fixtures.emailUsuarioRechazar
            } : {};
            const marcadoresFixture = { ...gruposFixture, ...usuariosReactivarFixture, ...rechazar };
            Object.keys(overridesVisibles).forEach((clave) => {
                const valor = overridesVisibles[clave];
                if (Object.prototype.hasOwnProperty.call(marcadoresFixture, valor) && marcadoresFixture[valor] !== null) {
                    overridesVisibles[clave] = marcadoresFixture[valor];
                }
            });
            const valorprueba = Object.keys(overridesVisibles)
                .map((clave) => clave + '=' + JSON.stringify(overridesVisibles[clave]))
                .join(' ');

            const resultado = this.fixtures
                ? await compararConBackend(this.nombreEntidad, accion, this.fixtures, overrides, esperado)
                : {
                    backend_code: this.errorFixtures?.message || 'no se pudieron preparar las fixtures',
                    backend_status: 'SIN_CONEXION'
                };

            if (resultado.filaCreada) this.filasCreadas.push(resultado.filaCreada);

            salida.push({
                entidad: this.nombreEntidad, accion, descripcion,
                valorprueba, respuestaesperada: esperado,
                backendcode: resultado.backend_code,
                backendstatus: resultado.backend_status
            });
        }

        return salida;
    }

    /**
     * Pinta los resultados en el contenedor de la página, sin abrir ventanas adicionales.
     * @param {Array<object>} salida Resultados de los casos ejecutados.
     * @returns {Array<object>} La misma salida recibida, para permitir su reutilización.
     */
    _mostrarResultados(salida) {
        const marcados = {
            backendstatus: { value: 'BACKEND_MAS_ESTRICTO', clase: 'table-danger' }
        };

        this.dom.showData('IU_Test_result_nofile', salida, marcados, true);
        return salida;
    }
}

/**
 * Conecta el selector y el botón de la página con el runner backend.
 * La ejecución se mantiene en la misma ventana y actualiza el estado visible.
 */
document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('run-tests');
    const selector = document.getElementById('entidad_select');
    const estado = document.getElementById('runner_status');

    if (!boton || !selector || !estado) {
        console.error('No se encontraron los controles de pruebas de backend.');
        return;
    }

    let ultimoEstado = {
        tipo: 'inicial',
        entidad: '',
        correctos: 0,
        total: 0,
        error: ''
    };

    function obtenerNombreEntidadTraducido(entidad) {
        if (!entidad) return '';
        const clave = 'tests.entities.' + entidad.toLowerCase();
        if (typeof window.traducir === 'function') {
            const trad = window.traducir(clave);
            if (trad && trad !== clave) return trad;
        }
        return entidad;
    }

    function actualizarMensajeEstado() {
        if (!estado) return;

        const entidadVisible = obtenerNombreEntidadTraducido(ultimoEstado.entidad);

        if (ultimoEstado.tipo === 'inicial') {
            estado.textContent = typeof window.traducir === 'function'
                ? window.traducir('tests.selectEntity')
                : 'Selecciona una entidad y pulsa "Ejecutar Tests".';
        } else if (ultimoEstado.tipo === 'ejecutando') {
            estado.textContent = typeof window.traducir === 'function'
                ? window.traducir('tests.runningTests', { entity: entidadVisible })
                : 'Ejecutando tests para ' + entidadVisible + '...';
        } else if (ultimoEstado.tipo === 'completado') {
            estado.textContent = typeof window.traducir === 'function'
                ? window.traducir('tests.completedSummary', {
                    entity: entidadVisible,
                    correct: ultimoEstado.correctos,
                    total: ultimoEstado.total
                })
                : 'Tests completados para ' + entidadVisible + ': ' +
                  ultimoEstado.correctos + ' de ' + ultimoEstado.total + ' correctos.';
        } else if (ultimoEstado.tipo === 'error') {
            estado.textContent = typeof window.traducir === 'function'
                ? window.traducir('tests.executionError', { error: ultimoEstado.error })
                : 'Error al ejecutar: ' + ultimoEstado.error;
        }
    }

    // Inicializar el mensaje de estado en el idioma activo
    actualizarMensajeEstado();

    // Actualizar el estado si el usuario cambia de idioma
    document.addEventListener('langChanged', () => {
        actualizarMensajeEstado();
    });

    boton.addEventListener('click', async () => {
        const nombreEntidad = selector.value;
        boton.disabled = true;

        ultimoEstado = {
            tipo: 'ejecutando',
            entidad: nombreEntidad,
            correctos: 0,
            total: 0,
            error: ''
        };
        actualizarMensajeEstado();

        try {
            const runner = new Backend_Test(nombreEntidad);
            const resultados = await runner.ejecutar();
            const correctos = resultados.filter((resultado) => resultado.backendstatus === 'OK').length;

            ultimoEstado = {
                tipo: 'completado',
                entidad: nombreEntidad,
                correctos: correctos,
                total: resultados.length,
                error: ''
            };
            actualizarMensajeEstado();
        } catch (e) {
            ultimoEstado = {
                tipo: 'error',
                entidad: nombreEntidad,
                correctos: 0,
                total: 0,
                error: e.message
            };
            actualizarMensajeEstado();
            console.error('Error en las pruebas de backend:', e);
        } finally {
            boton.disabled = false;
        }
    });
});

/****************************************************************/
/* Archivo: data.js                                             */
/* Descripción: Motor de las pruebas del frontend. Recorre      */
/* las pruebas definidas en test-frontend.js, las ejecuta       */
/* contra la clase de la entidad y muestra los resultados.      */
/* Tecnología: JavaScript nativo (ES11).                        */
/****************************************************************/

class Data_Test {

    /**
     * @param {class} entidad clase de la entidad a probar (js/tests/frontend/entidades/)
     */
    constructor(entidad) {

        this.actions = ['ADD', 'EDIT', 'SEARCH'];

        // se crea la entidad indicada en modo test
        this.entidad = new entidad('test');
        this.dom = new DOM_class();

        // se almacena la variable de definicion de test, pruebas no file y pruebas file
        this.array_def_tests = eval(this.entidad.entidad + '_def_tests');
        this.array_pruebas_nofile = eval(this.entidad.entidad + '_tests_fields');
        this.array_pruebas_file = eval(this.entidad.entidad + '_tests_files');

        // se invoca la realizacion de pruebas
        this.data_test_class();
    }

    data_test_data_nofile() {

        const pruebas = this.array_pruebas_nofile;
        const salidapruebas = [];

        for (let i = 0; i < pruebas.length; i++) {

            // se regenera el formulario de test para cada prueba
            this._crear_formulario_test('contenedor_IU_form');

            const resultadopruebas = {
                entidad: pruebas[i][0],
                campo: pruebas[i][1],
                NumDef: pruebas[i][2],
                NumPrueba: pruebas[i][3],
                descripcion: '',
                accion: pruebas[i][4],
                valorprueba: '',
                respuestaesperada: pruebas[i][6],
                resultadoprueba: '',
                pruebastatus: '',
                textoidiomaerror: ''
            };

            // recupero la definicion del test correspondiente a la prueba
            const def = this.devolver_def(resultadopruebas.NumDef);
            resultadopruebas.descripcion = def[4];
            const tipoelemento = def[2];

            // meto los valores de la prueba en el formulario
            for (const valores of pruebas[i][5]) {
                for (const nombrecampo in valores) {
                    const valorcampo = valores[nombrecampo];
                    resultadopruebas.valorprueba += nombrecampo + '=' + valorcampo + ' ';

                    if (tipoelemento === 'select') {
                        this.rellenarvalorselect(nombrecampo, valorcampo);
                    } else {
                        document.getElementById(nombrecampo).value = valorcampo;
                    }
                }
            }

            // llamo a la funcion de validacion del campo según su accion
            const validacion = this.entidad[resultadopruebas.accion + '_' + resultadopruebas.campo + '_validation'];
            resultadopruebas.resultadoprueba = (typeof validacion === 'function')
                ? validacion.call(this.entidad)
                : 'No existe ' + resultadopruebas.accion + '_' + resultadopruebas.campo + '_validation()';

            // compruebo si el resultado del test y la respuesta esperada es la misma
            resultadopruebas.pruebastatus = (resultadopruebas.resultadoprueba === resultadopruebas.respuestaesperada)
                ? 'CORRECTO'
                : 'INCORRECTO';

            resultadopruebas.textoidiomaerror = this.obtenerMensajeErrorTest(resultadopruebas.respuestaesperada);

            salidapruebas.push(resultadopruebas);
        }

        return salidapruebas;
    }

    /**
     * Se comprueban las pruebas definidas contra la clase de la entidad
     * y se muestran los resultados en la página.
     */
    data_test_class() {

        const salidapruebasnofile = this.data_test_data_nofile();
        const marcados = {
            pruebastatus: { value: 'INCORRECTO', clase: 'test-fail' }
        };

        this.dom.showData('IU_Test_result_nofile', salidapruebasnofile, marcados);

        // Pendiente: pruebas de campos de tipo fichero (data_test_data_file en Rodeiro)
        if (this.array_pruebas_file.length > 0) {
            console.warn('Las pruebas de ficheros todavía no están implementadas.');
        }

        this.resultados = salidapruebasnofile;
        return true;
    }

    /**
     * Rellena un select de elección única. Si el valor no existe
     * se crea como option y se marca como seleccionado.
     */
    rellenarvalorselect(id, valor) {

        const opciones = document.getElementById(id).options;
        let indexvalor = -1;

        for (let i = 0; i < opciones.length; i++) {
            if (opciones[i].value == valor) {
                opciones.selectedIndex = i;
                indexvalor = i;
            }
        }

        if (indexvalor == -1) {
            const mioption = document.createElement('option');
            mioption.value = valor;
            opciones[opciones.length] = mioption;
            opciones.selectedIndex = opciones.length - 1;
        }
    }

    /**
     * Construye un formulario mínimo de test con los campos que definen las pruebas.
     * Usa type="text" para todo excepto select, para que el navegador no
     * descarte valores inválidos (letras en type="number", etc.).
     */
    _crear_formulario_test(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const campos = new Map();
        for (const t of this.array_def_tests) {
            campos.set(t[1], t[2]); // campo -> tipo
        }

        let html = '<div>';
        campos.forEach((tipo, campo) => {
            if (tipo === 'select') {
                html += `<select id="${campo}" name="${campo}"><option value=""></option></select>`;
            } else {
                html += `<input type="text" id="${campo}" name="${campo}" value="">`;
            }
        });
        html += '</div>';

        container.innerHTML = html;
    }

    devolver_def(num_def) {
        for (let i = 0; i < this.array_def_tests.length; i++) {
            if (this.array_def_tests[i][3] == num_def) {
                return this.array_def_tests[i];
            }
        }
    }

    /**
     * Traduce el código KO esperado por la prueba a un texto legible
     */
    obtenerMensajeErrorTest(respuestaesperada) {
        if (respuestaesperada === true) return 'Valor correcto';

        const motivos = {
            min_size: 'no cumple el tamaño mínimo',
            max_size: 'supera el tamaño máximo',
            format: 'no cumple el formato'
        };

        const motivo = Object.keys(motivos).find((m) => respuestaesperada.endsWith('_' + m + '_KO'));
        if (!motivo) return respuestaesperada;

        const campo = respuestaesperada.slice(0, -(motivo.length + 4));
        return `${campo}: ${motivos[motivo]}`;
    }
}


// ============================================================
// EJECUCIÓN DESDE LA PÁGINA DE PRUEBAS
// ============================================================

// Entidades disponibles en el desplegable de test-frontend.html
const mapaEntidades = {
    usuarios
};

// Traduce un texto con i18n y si no está cargado usa el texto en español
function textoTest(clave, parametros, porDefecto) {
    if (typeof window.traducir !== 'function') return porDefecto;

    const texto = window.traducir(clave, parametros);
    return texto === clave ? porDefecto : texto;
}

function ejecutarTests() {

    const select = document.getElementById('entidad_select');
    const nombre = select.value;
    const etiqueta = select.options[select.selectedIndex].textContent.trim();
    const ClaseEntidad = mapaEntidades[nombre];
    const statusEl = document.getElementById('runner_status');

    if (!ClaseEntidad) {
        statusEl.textContent = textoTest('tests.entityNotFound', { entity: nombre },
            'Entidad no encontrada: ' + nombre
        );
        return;
    }

    statusEl.textContent = textoTest('tests.runningTests', { entity: etiqueta },
        'Ejecutando tests para ' + etiqueta + '...'
    );

    try {
        const test = new Data_Test(ClaseEntidad);
        const total = test.resultados.length;
        const correctas = total - test.resultados.filter((r) => r.pruebastatus === 'INCORRECTO').length;

        statusEl.textContent = textoTest('tests.completedSummary', { entity: etiqueta, correct: correctas, total },
            'Tests completados para ' + etiqueta + ': ' + correctas + ' de ' + total + ' correctos.'
        );
    } catch (e) {
        statusEl.textContent = textoTest('tests.executionError', { error: e.message },
            'Error al ejecutar: ' + e.message
        );
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('run-tests').addEventListener('click', ejecutarTests);
});

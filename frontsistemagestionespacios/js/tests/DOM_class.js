/****************************************************************/
/* Archivo: DOM_class.js                                        */
/* Descripción: Pinta los resultados de las pruebas en una      */
/* tabla genérica, marcando las filas incorrectas.              */
/****************************************************************/

class DOM_class {

    showData(containerId, filas, marcados, encabezadosMayusculas = false) {
        const contenedor = document.getElementById(containerId);
        if (!contenedor) return;

        if (!filas || filas.length === 0) {
            const noResultados = typeof window.traducir === 'function'
                ? window.traducir('tests.noResults')
                : 'No hay resultados.';
            contenedor.innerHTML = `<p class="test-empty">${noResultados}</p>`;
            return;
        }

        const columnas = Object.keys(filas[0]);
        let html =  `
                        <div class="table-card">
                            <div class="table-container test-report-container">
                                <table class="data-table test-report">
                    `;

        html += '<thead><tr>' +
            columnas.map((c) => `<th scope="col" data-col-field="${c}" data-col-upper="${Boolean(encabezadosMayusculas)}">${this._etiquetaColumna(c, encabezadosMayusculas)}</th>`).join('') +
            '</tr></thead><tbody>';

        filas.forEach((fila) => {
            let claseFila = '';

            for (const clave in marcados) {
                if (fila[clave] === marcados[clave].value) {
                    claseFila = marcados[clave].clase;
                }
            }

            html += `<tr class="${claseFila}">` +
                columnas.map((c) => `<td>${this._celda(c, fila[c])}</td>`).join('') +
                '</tr>';
        });

        html += `
                            </tbody>
                            </table>
                        </div>
                    </div>
                `;

        contenedor.innerHTML = html;
    }

    _celda(columna, valor) {
        if (columna === 'pruebastatus') {
            const esCorrecto = valor === 'CORRECTO';
            return `<span class="test-status ${esCorrecto ? 'test-status-ok' : 'test-status-ko'}">${valor}</span>`;
        }

        if (typeof valor !== 'string') return valor;

        // Se escapa siempre porque algunos valores de prueba son HTML (p. ej. '<script>')
        const escapado = valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (valor.length <= 60) return escapado;

        // Los valores muy largos (p. ej. 'A'.repeat(101)) se recortan y se muestra el total
        const recortado = escapado.slice(0, 60);
        return `<span title="${escapado.replace(/"/g, '&quot;')}">${recortado}… (${valor.length} car.)</span>`;
    }

    _etiquetaColumna(campo, mayusculas = false) {
        const clave = 'tests.columns.' + campo.toLowerCase();
        let texto = campo;

        if (typeof window.traducir === 'function') {
            const traducido = window.traducir(clave);
            if (traducido && traducido !== clave) {
                texto = traducido;
            } else {
                texto = campo.charAt(0).toUpperCase() + campo.slice(1);
            }
        } else {
            texto = campo.charAt(0).toUpperCase() + campo.slice(1);
        }

        return mayusculas ? texto.toUpperCase() : texto;
    }
}

// Actualizar automáticamente columnas y textos de tablas de pruebas al cambiar el idioma
if (typeof document !== 'undefined') {
    document.addEventListener('langChanged', () => {
        const dom = new DOM_class();
        document.querySelectorAll('table.test-report th[data-col-field]').forEach((th) => {
            const campo = th.getAttribute('data-col-field');
            const mayusculas = th.getAttribute('data-col-upper') === 'true';
            th.textContent = dom._etiquetaColumna(campo, mayusculas);
        });

        document.querySelectorAll('.test-empty').forEach((p) => {
            if (typeof window.traducir === 'function') {
                p.textContent = window.traducir('tests.noResults');
            }
        });
    });
}

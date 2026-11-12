
/****************************************************************/
/* Archivo: icons.js                                             */
/* Descripción: Centraliza los iconos SVG utilizados en SGEU.   */
/* Tecnología: JavaScript nativo (ES11).                        */
/****************************************************************/


// ============================================================
// CATÁLOGO DE ICONOS SVG
// ============================================================

const icons = {

    home: `
        <path d="M3 10.8 12 3l9 7.8"/>
        <path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7"/>
    `,

    faculty: `
        <path d="m3 9 9-5 9 5-9 5-9-5Z"/>
        <path d="M7 12v5.5c2.8 2 7.2 2 10 0V12M21 9v6"/>
    `,

    building: `
        <path d="M4 21V5l8-3v19M12 8h8v13M2 21h20"/>
        <path d="M7 7h2M7 11h2M7 15h2M15 12h2M15 16h2"/>
    `,

    layers: `
        <path d="m12 2 9 5-9 5-9-5 9-5Z"/>
        <path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>
    `,

    space: `
        <path d="M3 3h18v18H3z"/>
        <path d="M8 3v18M8 10h13M14 10v11"/>
    `,

    users: `
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    `,

    history: `
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
        <path d="M3 3v5h5M12 7v5l3 2"/>
    `,

    search: `
        <circle cx="11" cy="11" r="7"/>
        <path d="m20 20-4-4"/>
    `,

    plus: `
        <path d="M12 5v14M5 12h14"/>
    `,

    chevron: `
        <path d="m9 18 6-6-6-6"/>
    `,

    more: `
        <circle cx="5" cy="12" r="1"/>
        <circle cx="12" cy="12" r="1"/>
        <circle cx="19" cy="12" r="1"/>
    `,

    bell: `
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>
    `,

    menu: `
        <path d="M4 6h16M4 12h16M4 18h16"/>
    `,

    close: `
        <path d="m6 6 12 12M18 6 6 18"/>
    `,

    edit: `
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
    `,

    trash: `
        <path d="M3 6h18M8 6V3h8v3M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>
    `,

    filter: `
        <path d="M4 5h16M7 12h10M10 19h4"/>
    `,

    arrow: `
        <path d="M5 12h14M13 6l6 6-6 6"/>
    `,

    check: `
        <path d="m5 12 4 4L19 6"/>
    `,

    warning: `
        <path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/>
        <path d="M12 9v4M12 17h.01"/>
    `,

    book: `
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/>
        <path d="M4 19.5V5.5"/>
    `,

    logout: `
        <path d="M10 17l5-5-5-5M15 12H3M15 3h6v18h-6"/>
    `,

    eye: `
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/>
        <circle cx="12" cy="12" r="2.5"/>
    `,

    eyeOff: `
        <path d="m3 3 18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2 2.7M6.7 6.7C3.6 8.5 2 12 2 12s3.5 6 10 6a10 10 0 0 0 3.3-.5M10 10a2.8 2.8 0 0 0 4 4"/>
    `,

    lock: `
        <rect x="4" y="10" width="16" height="11" rx="2"/>
        <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
    `,

    map: `
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/>
        <path d="M9 3v15M15 6v15"/>
    `,

    download: `
        <path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>
    `,

    server: `
        <rect x="3" y="3" width="18" height="7" rx="2"/>
        <rect x="3" y="14" width="18" height="7" rx="2"/>
        <path d="M7 6.5h.01M7 17.5h.01M11 6.5h7M11 17.5h7"/>
    `,

    code: `
        <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>
    `
};


// ============================================================
// FUNCIÓN PARA OBTENER UN ICONO
// ============================================================

function getIcon(name, size = 20) {

    const path = icons[name];

    if (!path) {
        console.warn(`Icono "${name}" no encontrado.`);
        return '';
    }

    return `
        <svg
            aria-hidden="true"
            class="icon"
            width="${size}"
            height="${size}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            ${path}
        </svg>
    `;
}



/**
 * Inserta los iconos SVG en los elementos
 * que tengan el atributo data-icon.
 */
function renderIcons(container = document) {
    container.querySelectorAll('[data-icon]').forEach((element) => {
        const name = element.dataset.icon;

        // Evita insertar el icono varias veces.
        if (element.querySelector('svg')) {
            return;
        }

        element.innerHTML = getIcon(name);
    });
}

// Inserta los iconos iniciales de la página.
renderIcons();

// Permite utilizar la función desde otros archivos JS.
window.renderIcons = renderIcons;

# PDP
Repositorio para el proyecto de la asignatura Planificación e Dirección de Proxectos (PDP) del Master en Ingeniería Informática de la ESEI, Universidade de Vigo.

## Estructura del proyecto

El proyecto SGEU se organiza en dos partes principales, separadas para mantener la independencia entre el frontend y el backend:

- **`backstistemagestionespacios/`**: contiene el desarrollo del backend del sistema.
- **`frontsistemagestionespacios/`**: contiene la estructura y los recursos destinados al desarrollo del frontend.

### Organización del frontend

El frontend se ha organizado mediante una estructura de directorios que separa los recursos gráficos, los estilos, la lógica JavaScript y las páginas HTML.

| Directorio | Descripción |
|---|---|
| `assets/` | Contiene los recursos gráficos utilizados en el frontend. |
| `assets/icons/` | Almacena los iconos utilizados en los diferentes elementos de la interfaz. |
| `assets/images/` | Contiene las imágenes de la aplicación, como logotipos, ilustraciones y otros recursos visuales. |
| `assets/fonts/` | Almacena los archivos de fuentes tipográficas locales o personalizadas utilizados en la interfaz. |
| `css/` | Contiene los archivos de estilos de la interfaz. |
| `css/components/` | Destinado a los estilos de los componentes reutilizables. |
| `css/pages/` | Destinado a los estilos específicos de las diferentes páginas. |
| `js/` | Contiene la lógica JavaScript del frontend. |
| `js/api/` | Gestiona la comunicación con los servicios de la API REST. |
| `js/auth/` | Agrupa la lógica relacionada con la autenticación. |
| `js/common/` | Contiene funciones y utilidades compartidas. |
| `js/i18n/` | Agrupa los recursos relacionados con la internacionalización. |
| `js/modules/` | Organiza la lógica de los diferentes módulos de gestión. |
| `js/tests/` | Destinado a los archivos relacionados con las pruebas. |
| `pages/` | Contiene las páginas HTML de la aplicación. |
| `index.html` | Constituye el punto de entrada del frontend. |

### Estado actual del frontend

Actualmente se ha definido y creado la estructura inicial de directorios del frontend, estableciendo una separación de responsabilidades para facilitar su desarrollo, mantenimiento y organización.

La estructura contempla las páginas de bienvenida pública y privada, autenticación, gestión de usuarios, facultades, edificios, plantas y espacios, así como las páginas destinadas a las pruebas del sistema.

La implementación de las interfaces, los estilos y las funcionalidades se desarrollará posteriormente.
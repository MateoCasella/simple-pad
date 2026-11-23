# Simple Pad

Bloc de notas técnico, liviano y 100% offline pensado para estudiantes de ingeniería, ciencias y desarrolladores. Combina la velocidad del Bloc de Notas clásico con bloques interactivos de diagramas, tablas, código y notación científica (Matemática, Física y Química).

## Características principales

- **Dos estilos visuales intercambiables** (`Formato → Estilo visual`):
  - **Clásico (Windows 98)**: interfaz retro con biseles 3D, barra azul clásica y tipografía monoespaciada tradicional.
  - **Moderno**: diseño afilado y productivo con tipografías **Saira** y **Share Tech Mono**.
  - Ambos estilos incluyen **Modo oscuro** (`Alt+T`).
- **Comandos rápidos en línea (`/`) y menciones (`@`)**:
  - Formato de línea completa (`/grande`, `/mediano`, `/chico`, `/negrita`, `/cursiva`, `/subrayado`, `/tachado`, `/resaltado`).
  - Componentes interactivos (`/tabla`, `/diagrama`, `/matematica`, `/fisica`, `/quimica`, `/js`, `/py`, `/c`, `/sql`, `/html`, `/json`).
  - Menciones a otras pestañas y fecha/hora (`@hoy`, `@hora`, `@fecha`).
- **Bloques de Ciencias (Matemática, Física y Química)**:
  - Motor compartido con fracciones anidadas, límites, integrales, sumatorias, matrices, vectores (`\vec{F}`), fórmulas e iones (`\ce{H2SO4}`, `\ce{SO4^2-}`), equilibrio químico (`\rightleftharpoons`), isótopos (`\iso{14}{6}{C}`), autocompletado con `\` y guía copiable desde `?`.
- **Pizarra de diagramas integrada**: formas redimensionables, texto libre, conectores con o sin flechas y formato interno.
- **Exportación e importación limpia**:
  - `.txt` 100% texto plano limpio.
  - `.md` bidireccional que reconstruye títulos, formato, tablas, código, ciencias y **coordenadas exactas de pizarras** usando comentarios nativos `%%` de Mermaid.
  - PDF limpio (`@media print`), `.html`, respaldo completo `.json` y botón **Copiar para IA (Markdown)** con estimador de tokens.
- **Productividad**: pestañas con Papelera de 15 días, vista dividida (`Alt+D`), búsqueda local (`Ctrl+F`) y global (`Ctrl+Shift+F`), autocompletado de palabras del apunte y autocorrector ortográfico.

## Estructura del proyecto

```text
simple-pad/
├── index.html
├── src/
│   ├── styles/
│   │   ├── base.css
│   │   ├── theme-win98.css
│   │   └── theme-modern.css
│   └── js/
│       ├── state.js
│       ├── diagram.js
│       ├── table-code.js
│       ├── science.js
│       ├── tabs-trash.js
│       ├── editor.js
│       ├── io-markdown.js
│       └── ui-search.js
├── electron/
│   └── main.js
├── package.json
├── LICENSE
└── README.md
```

## Cómo usarlo o compilarlo

### Opción 1: Web / GitHub Pages (sin instalación)
Abrí `index.html` directamente en tu navegador o activá **GitHub Pages** desde **Settings → Pages** apuntando a la rama `main` y carpeta `/` ([documentación oficial](https://docs.github.com/es/pages/getting-started-with-github-pages/creating-a-github-pages-site)).

### Opción 2: App de escritorio para Windows (`.exe`)
Requiere Node.js instalado ([Electron Docs](https://electronjs.org/docs/latest) / [electron-builder](https://www.electron.build/docs/)):

```bash
npm install
npm start            # Probar en ventana de escritorio
npm run dist         # Generar instalador .exe y portable en dist/
```

## Licencia

Distribuido bajo licencia **MIT**. Consultá el archivo `LICENSE` para más información.

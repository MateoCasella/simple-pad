# Simple Pad

Bloc de notas técnico, liviano y 100% offline. Combina la velocidad del Bloc de Notas clásico con bloques interactivos de diagramas, tablas, código y notación científica (Matemática, Física y Química).

- **Probar online (sin instalar):** https://mateocasella.github.io/simple-pad/
- **Descargar para Windows (`.exe` / Portable):** https://github.com/MateoCasella/simple-pad/releases/latest

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

## Instalación y uso

### 1. Versión Web (sin instalación)
Abrí directamente https://mateocasella.github.io/simple-pad/ en tu navegador (podés instalarlo como app de escritorio desde el menú del navegador: *Instalar página como app*).

### 2. Instalador para Windows (`.exe`)
Descargá el instalador o la versión portable desde [GitHub Releases](https://github.com/MateoCasella/simple-pad/releases/latest) (compilados automáticamente con GitHub Actions).

### 3. Ejecutar o compilar desde código fuente (`npm`)
Requiere [Node.js](https://nodejs.org/) instalado:

```bash
git clone [https://github.com/MateoCasella/simple-pad.git](https://github.com/MateoCasella/simple-pad.git)
cd simple-pad
npm install
npm start          # Abrir Simple Pad en ventana de escritorio (Electron)
```

Para generar los ejecutables `.exe` localmente en `dist/`:

```bash
npm run dist
```

## Estructura del proyecto

```text
simple-pad/
├── .github/
│   └── workflows/
│       └── release.yml
├── electron/
│   └── main.js
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
├── index.html
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## Licencia

Distribuido bajo licencia **MIT**. Consultá el archivo `LICENSE` para más información.

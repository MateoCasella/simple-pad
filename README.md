# Simple Pad

A lightweight, 100% offline technical notepad. It combines the speed of classic Notepad with interactive blocks for diagrams, tables, code, and scientific notation (Math, Physics, and Chemistry).

- **Try online (no installation required):** https://mateocasella.github.io/simple-pad/
- **Download for Windows (`.exe` / Portable):** https://github.com/MateoCasella/simple-pad/releases/latest

## Key Features

- **Two switchable visual themes** (`Format → Visual Style`):
  - **Classic (Windows 98)**: retro interface with 3D bevels, classic blue title bar, and traditional monospace typography.
  - **Modern**: sharp, productivity-focused design using **Saira** and **Share Tech Mono** fonts.
  - Both themes include **Dark Mode** (`Alt+T`).
- **Quick inline commands (`/`) and mentions (`@`)**:
  - Full-line formatting (`/grande`, `/mediano`, `/chico`, `/negrita`, `/cursiva`, `/subrayado`, `/tachado`, `/resaltado`).
  - Interactive components (`/tabla`, `/diagrama`, `/matematica`, `/fisica`, `/quimica`, `/js`, `/py`, `/c`, `/sql`, `/html`, `/json`).
  - Mentions to other tabs and date/time (`@hoy`, `@hora`, `@fecha`).
- **Science Blocks (Math, Physics, and Chemistry)**:
  - Shared engine supporting nested fractions, limits, integrals, summations, matrices, vectors (`\vec{F}`), formulas and ions (`\ce{H2SO4}`, `\ce{SO4^2-}`), chemical equilibrium (`\rightleftharpoons`), isotopes (`\iso{14}{6}{C}`), autocomplete with `\`, and a copyable reference guide via `?`.
- **Built-in diagram canvas**: resizable shapes, free text, connectors with or without arrows, and internal formatting.
- **Clean export and import**:
  - 100% clean plain text `.txt`.
  - Bidirectional `.md` that reconstructs headings, formatting, tables, code, science blocks, and **exact canvas coordinates** using native Mermaid `%%` comments.
  - Clean PDF (`@media print`), `.html`, full `.json` backup, and a **Copy for AI (Markdown)** button with a token estimator.
- **Productivity**: tabs with a 15-day Trash bin, split view (`Alt+D`), local (`Ctrl+F`) and global (`Ctrl+Shift+F`) search, note-based word autocomplete, and spellcheck.

## Installation and Usage

### 1. Web Version (No Installation)
Open https://mateocasella.github.io/simple-pad/ directly in your browser (you can install it as a desktop app from your browser's menu: *Install page as app*).

### 2. Windows Installer (`.exe`)
Download the installer or portable version from [GitHub Releases](https://github.com/MateoCasella/simple-pad/releases/latest) (automatically built with GitHub Actions).

### 3. Run or Build from Source (`npm`)
Requires [Node.js](https://nodejs.org/) installed:

```bash
git clone [https://github.com/MateoCasella/simple-pad.git](https://github.com/MateoCasella/simple-pad.git)
cd simple-pad
npm install
npm start          # Open Simple Pad in

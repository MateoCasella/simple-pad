    // ==========================================
    // BILINGUAL INTERFACE ENGINE (ES / EN)
    // ==========================================
    const I18N_TEXT_MAP = {
      en: {
        // Top menus (innerHTML for mnemonic underline preservation)
        'Archivo': '<u>F</u>ile',
        'Edición': '<u>E</u>dit',
        'Formato': 'F<u>o</u>rmat',
        'Ver': '<u>V</u>iew',

        // Menu Archivo
        'Nueva pestaña': 'New tab',
        'Abrir archivo (.txt, .md)...': 'Open file (.txt, .md)...',
        'Guardar solo texto (.TXT)': 'Save plain text (.TXT)',
        'Guardar con formato (.MD)': 'Save formatted (.MD)',
        'Exportar como PDF limpio...': 'Export clean PDF...',
        'Exportar HTML (.HTML)': 'Export HTML (.HTML)',
        'Respaldo completo (.JSON)': 'Full backup (.JSON)',
        'Papelera de reciclaje': 'Recycle Bin',
        'Cerrar pestaña actual': 'Close current tab',
        '15 días': '15 days',

        // Menu Edicion
        'Deshacer': 'Undo',
        'Rehacer': 'Redo',
        'Cortar': 'Cut',
        'Copiar': 'Copy',
        'Seleccionar todo': 'Select all',
        'Buscar y reemplazar': 'Find & replace',
        'Buscar en todas las pestañas': 'Search all tabs',

        // Menu Formato
        'Ajuste de línea': 'Word wrap',
        'Autocompletado de palabras': 'Word autocomplete',
        'Autocorrector ortográfico': 'Spellcheck & autocorrect',
        'Convertir a MAYÚSCULAS': 'Convert to UPPERCASE',
        'Convertir a minúsculas': 'Convert to lowercase',
        'Estilo visual': 'Visual style',
        'Moderno': 'Modern',
        'Clásico (Windows 98)': 'Classic (Windows 98)',
        'Idioma': 'Language',

        // Menu Ver
        'Acercar zoom': 'Zoom in',
        'Alejar zoom': 'Zoom out',
        'Restablecer zoom (100%)': 'Reset zoom (100%)',
        'Números de línea': 'Line numbers',
        'Barra de estado': 'Status bar',
        'Vista dividida': 'Split view',
        'Modo oscuro': 'Dark mode',
        'Atajos de teclado': 'Keyboard shortcuts',
        'Comandos en línea': 'Inline commands',
        'Notación de ciencias': 'Science notation',

        // Formatting & Insert dropdowns
        'Tamaño': 'Size',
        'Grande': 'Large',
        'Mediano': 'Medium',
        'Chico': 'Small',
        'Estilo': 'Style',
        'Negrita': 'Bold',
        'Cursiva': 'Italic',
        'Subrayado': 'Underline',
        'Tachado': 'Strikethrough',
        'Viñetas': 'Bullets',
        'Círculos': 'Circles',
        'Cuadradas': 'Squares',
        'Guiones': 'Dashes',
        'Numeradas': 'Numbered',
        'Alfabéticas': 'Alphabetic',
        'Romanas': 'Roman',
        'Componentes': 'Components',
        'Tabla': 'Table',
        'Pizarra de diagramas': 'Diagram board',
        'Ciencias': 'Sciences',
        'Bloque de matemática': 'Math block',
        'Bloque de física': 'Physics block',
        'Bloque de química': 'Chemistry block',
        'Bloque de código': 'Code block',

        // Find & Replace & Context Menus
        'Resaltar palabra': 'Highlight match',
        'Resaltado múltiple': 'Multi-highlight',
        'Reemplazar': 'Replace',
        'Todos': 'All',
        'Renombrar pestaña': 'Rename tab',
        'Abrir en vista dividida': 'Open in split view',
        'Cerrar pestaña': 'Close tab',

        // Modals
        'Comandos de notación científica': 'Science notation commands',
        'Todas': 'All',
        'Matemática': 'Math',
        'Física': 'Physics',
        'Química': 'Chemistry',
        'Hacé clic en copiar para pegar el comando en tu bloque': 'Click copy to paste the command into your block',
        // Exact View menu items
        'Acercar zoom (+10%)': 'Zoom in (+10%)',
        'Alejar zoom (-10%)': 'Zoom out (-10%)',
        'Restaurar zoom predeterminado': 'Reset default zoom',
        'Numeración de líneas': 'Line numbers',
        'Barra de estado inferior': 'Bottom status bar',
        '/ y @': '/ & @',

        // Token calculator popover
        'Tokens estimados': 'Estimated tokens',
        'Compañía:': 'Provider:',
        'Palabras': 'Words',
        'Caracteres': 'Characters',
        'Car/tok': 'Char/tok',
        'Selección actual': 'Current selection',

        // Recycle Bin modal
        'Vaciar papelera': 'Empty Recycle Bin',
        'Restaurar': 'Restore',
        'Restaurar todo': 'Restore all',
        'Eliminar': 'Delete',
        'Nombre': 'Name',
        'Fecha de eliminación': 'Date deleted',
        'Vence en': 'Expires in',
        'Tamaño': 'Size',
        'Retención automática: 15 días': 'Auto-retention: 15 days',
        'La papelera está vacía': 'Recycle Bin is empty',

        // Global search & Shortcuts modal
        'Guía de atajos de teclado': 'Keyboard shortcuts guide',
        'Solo vista': 'Preview',
        'Editar': 'Edit',
        'Símbolos': 'Symbols',
        'Copiar para IA (Markdown)': 'Copy for AI (Markdown)'
      }
    };

    // Build reverse map (EN -> ES) so switching back to Spanish restores exact original labels
    const I18N_REVERSE_ES = {};
    Object.keys(I18N_TEXT_MAP.en).forEach(esKey => {
      const enVal = I18N_TEXT_MAP.en[esKey].replace(/<[^>]+>/g, '');
      I18N_REVERSE_ES[enVal] = esKey;
    });

    function t(esStr, enStr) {
      return appState.lang === 'en' ? (enStr || esStr) : esStr;
    }

    function applyLanguage(langCode, silent = false) {
      const lang = langCode === 'en' ? 'en' : 'es';
      appState.lang = lang;
      document.documentElement.lang = lang;

      // Update checkmarks in Formato -> Idioma
      const chkEs = document.getElementById('checkLangEs');
      const chkEn = document.getElementById('checkLangEn');
      if (chkEs) chkEs.textContent = lang === 'es' ? '✓' : '';
      if (chkEn) chkEn.textContent = lang === 'en' ? '✓' : '';

      // Translate top menu triggers (Archivo / Edición / Formato / Ver)
      const topTriggers = [
        { sel: 'button[onclick="toggleMenu(\'menuArchivo\')"]', es: '<u>A</u>rchivo', en: '<u>F</u>ile' },
        { sel: 'button[onclick="toggleMenu(\'menuEdicion\')"]', es: '<u>E</u>dición', en: '<u>E</u>dit' },
        { sel: 'button[onclick="toggleMenu(\'menuFormato\')"]', es: '<u>F</u>ormato', en: 'F<u>o</u>rmat' },
        { sel: 'button[onclick="toggleMenu(\'menuVer\')"]',     es: '<u>V</u>er',     en: '<u>V</u>iew' }
      ];
      topTriggers.forEach(item => {
        const el = document.querySelector(item.sel);
        if (el) el.innerHTML = lang === 'en' ? item.en : item.es;
      });

      // Translate all static labels inside menus, dropdowns, context menus & modals
      const containers = [
        '#menuArchivo', '#menuEdicion', '#menuFormato', '#menuVer',
        '#menuTextFormats', '#menuListTypes', '#menuInsertWidgets',
        '#findHighlightMenu', '#tabContextMenu', '#scienceCommandsModal',
        '#tokenCalculatorPopover', '#findReplaceBar', '#trashModal', '#globalSearchModal', '#shortcutsGuideModal'
      ];
      containers.forEach(sel => {
        const root = document.querySelector(sel);
        if (!root) return;
        root.querySelectorAll('span, div, button, th, label, kbd').forEach(el => {
          // Only leaf text elements (no child elements)
          if (el.children.length > 0) return;
          const raw = (el.textContent || '').trim();
          if (!raw) return;
          if (!el.dataset.i18nEs) {
            if (I18N_TEXT_MAP.en[raw]) {
              el.dataset.i18nEs = raw;
            } else if (I18N_REVERSE_ES[raw]) {
              el.dataset.i18nEs = I18N_REVERSE_ES[raw];
            }
          }
          if (el.dataset.i18nEs) {
            const esBase = el.dataset.i18nEs;
            el.textContent = lang === 'en'
              ? (I18N_TEXT_MAP.en[esBase] || esBase).replace(/<[^>]+>/g, '')
              : esBase;
          }
        });
      });

      // Translate placeholders
      const editor = document.getElementById('liveSheetEditor');
      if (editor) {
        editor.setAttribute('data-placeholder', lang === 'en' ? 'Write your notes here...' : 'Escribí acá tus notas...');
      }
      const findInput = document.getElementById('findInput');
      if (findInput) findInput.placeholder = lang === 'en' ? 'Find...' : 'Buscar...';
      const replaceInput = document.getElementById('replaceInput');
      if (replaceInput) replaceInput.placeholder = lang === 'en' ? 'Replace...' : 'Reemplazar...';
      const globalInput = document.getElementById('globalSearchInput');
      if (globalInput) globalInput.placeholder = lang === 'en' ? 'Search across all open tabs...' : 'Buscar en todas las pestañas abiertas...';
      const trashInput = document.getElementById('trashSearchInput');
      if (trashInput) trashInput.placeholder = lang === 'en' ? 'Search Recycle Bin...' : 'Buscar en la Papelera...';

      // Translate status bar wrap label & metrics
      if (typeof updateCursorMetrics === 'function') updateCursorMetrics();
      if (typeof applyZoomAndViewSettings === 'function') applyZoomAndViewSettings();
      const wrapStatus = document.getElementById('statusWrapLabel') || document.getElementById('statusWordWrap');
      if (wrapStatus) {
        wrapStatus.textContent = lang === 'en'
          ? `Word wrap: ${appState.wordWrap ? 'On' : 'Off'}`
          : `Ajuste de línea: ${appState.wordWrap ? 'Sí' : 'No'}`;
      }
      if (typeof renderTabsStrip === 'function') renderTabsStrip();
      renderInlineCommandsDocs();
      if (typeof mountAllMathWidgetsInEditor === 'function') mountAllMathWidgetsInEditor(document.getElementById('liveSheetEditor'));
      if (typeof renderTrashModal === 'function') renderTrashModal();

      saveTabsToStorage();
      if (!silent) {
        showToast(lang === 'en' ? 'Language: English' : 'Idioma: Español');
      }
    }

    function setLanguage(langCode) {
      applyLanguage(langCode, false);
    }


    function renderInlineCommandsDocs() {
      const sec = document.getElementById('inlineCommandsSection');
      if (!sec) return;
      const isEn = appState.lang === 'en';
      const pair = (es, en) => isEn ? `${en} · ${es}` : `${es} · ${en}`;
      const rows = [
        { desc: isEn ? 'Text sizes' : 'Tamaños de texto',
          cmds: isEn ? '/large · /medium · /small (/grande · /mediano · /chico)' : '/grande · /mediano · /chico (/large · /medium · /small)' },
        { desc: isEn ? 'Heading & body aliases' : 'Alias de título, subtítulo y texto',
          cmds: isEn ? '/title · /subtitle · /text (/titulo · /subtitulo · /texto)' : '/titulo · /subtitulo · /texto (/title · /subtitle · /text)' },
        { desc: isEn ? 'Full-line text formatting' : 'Formato a toda la línea actual',
          cmds: isEn ? '/bold · /italic · /underline · /strike · /highlight (/negrita · /cursiva · /subrayado · /tachado · /resaltado)' : '/negrita · /cursiva · /subrayado · /tachado · /resaltado (/bold · /italic · /underline · /strike · /highlight)' },
        { desc: isEn ? 'Bulleted or numbered list' : 'Lista con viñetas o numerada',
          cmds: isEn ? '/list · /numbered (/lista · /numerada)' : '/lista · /numerada (/list · /numbered)' },
        { desc: isEn ? 'Insert current date, time or timestamp' : 'Insertar fecha actual, hora o timestamp',
          cmds: isEn ? '/today · /time · /date (/hoy · /hora · /fecha)' : '/hoy · /hora · /fecha (/today · /time · /date)' },
        { desc: isEn ? 'Insert interactive table' : 'Insertar tabla interactiva',
          cmds: pair('/tabla', '/table') },
        { desc: isEn ? 'Insert diagram board' : 'Insertar pizarra de diagramas',
          cmds: pair('/diagrama', '/diagram') },
        { desc: isEn ? 'Insert Math, Physics or Chemistry block' : 'Insertar bloque de matemática, física o química',
          cmds: isEn ? '/math · /physics · /chemistry (/matematica · /fisica · /quimica)' : '/matematica · /fisica · /quimica (/math · /physics · /chemistry)' },
        { desc: isEn ? 'Insert syntax-highlighted code block' : 'Insertar bloque de código por lenguaje',
          cmds: '/js · /py · /c · /sql · /html · /json' },
        { desc: isEn ? 'Insert clickable link to another open tab' : 'Insertar enlace clickeable a otra pestaña abierta',
          cmds: isEn ? '@file_name' : '@nombre_archivo' }
      ];
      const title = isEn ? 'Inline commands (/ and @)' : 'Comandos en línea (/ y @)';
      const rowsHtml = rows.map(r =>
        `<div class="px-3 py-1.5 flex items-center justify-between gap-2"><span class="text-slate-700 dark:text-zinc-200">${escapeHtml(r.desc)}</span><kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-[10.5px] text-right">${escapeHtml(r.cmds)}</kbd></div>`
      ).join('');
      sec.innerHTML = `<div class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">${title}</div><div class="divide-y divide-slate-100 dark:divide-zinc-800/70 border border-slate-200 dark:border-zinc-800 rounded-md">${rowsHtml}</div>`;
    }

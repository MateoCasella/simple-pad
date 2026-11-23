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
        '#tokenCalculatorPopover', '#findReplaceBar'
      ];
      containers.forEach(sel => {
        const root = document.querySelector(sel);
        if (!root) return;
        root.querySelectorAll('span, div, button').forEach(el => {
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
      const wrapStatus = document.getElementById('statusWordWrap');
      if (wrapStatus) {
        wrapStatus.textContent = lang === 'en'
          ? `Word wrap: ${appState.wordWrap ? 'On' : 'Off'}`
          : `Ajuste de línea: ${appState.wordWrap ? 'Sí' : 'No'}`;
      }
      if (typeof renderTabsStrip === 'function') renderTabsStrip();

      saveTabsToStorage();
      if (!silent) {
        showToast(lang === 'en' ? 'Language: English' : 'Idioma: Español');
      }
    }

    function setLanguage(langCode) {
      applyLanguage(langCode, false);
    }

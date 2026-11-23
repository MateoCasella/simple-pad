const STORAGE_KEY = 'notepad_pro_single_live_v12';
    const TRASH_RETENTION_MS = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds

    const SAMPLE_DIAGRAM_STATE = JSON.stringify({
      canvasW: 660,
      canvasH: 300,
      shapes: [
        { id: 'sh-1', type: 'square', x: 34, y: 74, w: 120, h: 120, html: '<div><strong>Inicio</strong></div><div class="txt-chico">(Cuadrado)</div>' },
        { id: 'sh-2', type: 'rect', x: 225, y: 90, w: 168, h: 88, html: '<div>Proceso <span style="background-color:#fef08a;color:#0f172a;">Activo</span></div>' },
        { id: 'sh-3', type: 'circle', x: 470, y: 74, w: 120, h: 120, html: '<div><em>Salida</em></div>' }
      ],
      connectors: [
        { id: 'conn-1', from: 'sh-1', to: 'sh-2', type: 'arrow' },
        { id: 'conn-2', from: 'sh-2', to: 'sh-3', type: 'double-arrow' }
      ]
    });

    const SAMPLE_TABLE_STATE = JSON.stringify({
      headers: ['Módulo', 'Estado', 'Detalle'],
      rows: [
        ['Pizarra y Formas', 'Listo', 'Redimensionables + formato interno'],
        ['Tablas (+)', 'Listo', 'Botón verde + para filas y columnas'],
        ['Papelera .txt', 'Listo', 'Recuperación dentro de 15 días']
      ]
    });

    const SAMPLE_CODE_STATE = JSON.stringify({
      lang: 'javascript',
      code: `// Seleccioná el lenguaje arriba para resaltar la sintaxis\nfunction calcularRetencion(diasTranscurridos) {\n  const PLAZO_MAXIMO = 15;\n  if (diasTranscurridos <= PLAZO_MAXIMO) {\n    return "Archivo recuperable en Papelera";\n  }\n  return null;\n}`
    });

    const INITIAL_TABS = [
      {
        id: 'tab-1',
        title: 'notas_rapidas.txt',
        html: `<div class="txt-grande">Bloc de Notas con Pestañas, Diagramas y Código</div>
<div class="txt-mediano">Probá elegir formas y tipos de conexiones desde las listas de la pizarra, arrastrar los bordes para cambiar su tamaño, aplicar formato dentro de las figuras, sumar/borrar filas o columnas en la tabla o cambiar el lenguaje del código:</div>
<div class="diagram-widget" contenteditable="false" data-diagram-id="diag-initial" data-state='${SAMPLE_DIAGRAM_STATE.replace(/'/g, "&#39;")}'></div>
<div class="table-widget" contenteditable="false" data-table-id="tbl-initial" data-state='${SAMPLE_TABLE_STATE.replace(/'/g, "&#39;")}'></div>
<div class="code-widget" contenteditable="false" data-code-id="code-initial" data-state='${SAMPLE_CODE_STATE.replace(/'/g, "&#39;")}'></div>`
      },
      {
        id: 'tab-3',
        title: 'borrador_codigo.txt',
        html: `<div class="txt-grande">Borrador de Scripts y Consultas</div><div class="txt-mediano">Notas rápidas de arquitectura y pruebas de sintaxis coloreada por lenguaje.</div>`
      },
      {
        id: 'tab-2',
        title: 'apuntes_reunion.txt',
        html: `<div class="txt-grande">Apuntes de Reunión — Producto</div>
<div class="txt-chico">Seguimiento semanal del proyecto</div>
<div><br></div>
<ol class="list-decimal-style">
  <li>Pizarra y figuras redimensionables con soporte completo de formato de texto adentro de cada figura.</li>
  <li>Tablas interactivas con botones verdes <strong>+</strong> para insertar filas y columnas.</li>
  <li>Papelera con retención de <strong>15 días</strong> para restaurar cualquier <code>.txt</code> eliminado.</li>
</ol>`
      }
    ];

    const INITIAL_TRASH = [
      {
        id: 'trash-sample-1',
        title: 'borrador_anterior.txt',
        html: `<div class="txt-grande">Borrador de arquitectura previa</div><div>Este archivo .txt fue eliminado hace 2 días y puede restaurarse desde la Papelera dentro del plazo de 15 días.</div>`,
        deletedAt: Date.now() - (2 * 24 * 60 * 60 * 1000)
      }
    ];

    let appState = {
      tabs: JSON.parse(JSON.stringify(INITIAL_TABS)),
      trash: JSON.parse(JSON.stringify(INITIAL_TRASH)),
      activeTabId: 'tab-1',
      contextMenuTabId: null,
      renamingTabId: null,
      activeDiagramId: null,
      activeShapeContext: null, // { diagId, shapeId, textEl }
      activeSize: 'mediano',
      highlightTypingActive: false,
      savedRange: null,
      zoomPercent: 100,
      wordWrap: true,
      wordAutocomplete: true,
      autocorrect: true,
      showLineNumbers: true,
      showStatusBar: true,
      darkMode: false,
      uiStyle: 'modern',
      lang: 'es',
      findCaseSensitive: false,
      findUseRegex: false,
      splitView: false,
      splitTabId: null,
      globalSearchCase: false
    };

    const diagramRuntime = {};
    const tabHistory = {}; // tabId -> { undo: string[], redo: string[] }
    let historyDebounceTimer = null;
    let isRestoringHistory = false;

    function getTabHistory(tabId) {
      if (!tabHistory[tabId]) {
        const t = appState.tabs.find(x => x.id === tabId);
        tabHistory[tabId] = {
          undo: [t ? (t.html || '') : ''],
          redo: []
        };
      }
      return tabHistory[tabId];
    }

    function recordHistorySnapshotNow(tabId, htmlStr) {
      if (isRestoringHistory || !tabId) return;
      const hist = getTabHistory(tabId);
      const val = htmlStr || '';
      if (hist.undo.length > 0 && hist.undo[hist.undo.length - 1] === val) return;
      hist.undo.push(val);
      if (hist.undo.length > 60) hist.undo.shift();
      hist.redo = [];
    }

    function scheduleHistorySnapshot(tabId, immediate) {
      if (isRestoringHistory || !tabId) return;
      const editor = document.getElementById('liveSheetEditor');
      const tab = appState.tabs.find(t => t.id === tabId);
      if (!editor || !tab) return;
      if (historyDebounceTimer) {
        clearTimeout(historyDebounceTimer);
        historyDebounceTimer = null;
      }
      if (immediate) {
        recordHistorySnapshotNow(tabId, editor.innerHTML);
      } else {
        historyDebounceTimer = setTimeout(() => {
          historyDebounceTimer = null;
          const curTab = getActiveTab();
          const ed = document.getElementById('liveSheetEditor');
          if (curTab && curTab.id === tabId && ed) {
            recordHistorySnapshotNow(tabId, ed.innerHTML);
          }
        }, 380);
      }
    }

    function applyHistoryHtmlToActiveTab(targetHtml) {
      closeCommandPalette();
      closeWordAutocomplete();
      const tab = getActiveTab();
      const editor = document.getElementById('liveSheetEditor');
      if (!tab || !editor) return;
      isRestoringHistory = true;
      tab.html = targetHtml || '<div><br></div>';
      editor.innerHTML = tab.html;
      mountAllDiagramsInEditor();
      mountAllTablesInEditor();
      mountAllCodeWidgetsInEditor();
        mountAllMathWidgetsInEditor();
      saveTabsToStorage();
      updateLineNumbersGutter();
      updateCursorMetrics();
      if (appState.splitView && appState.splitTabId === tab.id) {
        renderSplitPane();
      }
      isRestoringHistory = false;
    }

    function undoEdit() {
      const tab = getActiveTab();
      const editor = document.getElementById('liveSheetEditor');
      if (!tab || !editor) return;
      if (historyDebounceTimer) {
        clearTimeout(historyDebounceTimer);
        historyDebounceTimer = null;
      }
      const hist = getTabHistory(tab.id);
      const currentHtml = editor.innerHTML;
      if (hist.undo.length > 0 && hist.undo[hist.undo.length - 1] !== currentHtml) {
        hist.undo.push(currentHtml);
      }
      if (hist.undo.length <= 1) {
        showToast('Nada para deshacer');
        return;
      }
      const popped = hist.undo.pop();
      hist.redo.push(popped);
      const prevHtml = hist.undo[hist.undo.length - 1];
      applyHistoryHtmlToActiveTab(prevHtml);
      showToast('Deshacer (Ctrl+Z)');
    }

    function redoEdit() {
      const tab = getActiveTab();
      if (!tab) return;
      const hist = getTabHistory(tab.id);
      if (hist.redo.length === 0) {
        showToast('Nada para rehacer');
        return;
      }
      const nextHtml = hist.redo.pop();
      hist.undo.push(nextHtml);
      applyHistoryHtmlToActiveTab(nextHtml);
      showToast('Rehacer (Ctrl+Y)');
    }
    const tableActiveCell = {}; // tblId -> { rowIdx, colIdx }
    let activeDrag = null; // shape move, shape resize, or board resize
    appState.copiedWidget = null; // { type: 'diagram'|'table', state: {...}, plainText: '...' }
    appState.copiedDiagramShape = null; // cloned shape/text object
    appState.diagramContext = null; // { diagId, targetType, targetId, canvasX, canvasY }

    function purgeExpiredTrash() {
      const now = Date.now();
      appState.trash = (appState.trash || []).filter(item => {
        const age = now - (item.deletedAt || now);
        return age <= TRASH_RETENTION_MS;
      });
    }

    function loadSavedTabs() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
            appState.tabs = parsed.tabs;
            appState.trash = Array.isArray(parsed.trash) ? parsed.trash : INITIAL_TRASH;
            appState.activeTabId = parsed.activeTabId || parsed.tabs[0].id;
            appState.zoomPercent = parsed.zoomPercent || 100;
            appState.wordWrap = typeof parsed.wordWrap === 'boolean' ? parsed.wordWrap : true;
            appState.wordAutocomplete = typeof parsed.wordAutocomplete === 'boolean' ? parsed.wordAutocomplete : true;
            appState.autocorrect = typeof parsed.autocorrect === 'boolean' ? parsed.autocorrect : true;
            appState.showLineNumbers = typeof parsed.showLineNumbers === 'boolean' ? parsed.showLineNumbers : true;
            appState.darkMode = Boolean(parsed.darkMode);
            appState.uiStyle = parsed.uiStyle === 'win98' ? 'win98' : 'modern';
            appState.lang = parsed.lang === 'en' ? 'en' : 'es';
          }
        }
      } catch (e) {}
      purgeExpiredTrash();
    }

    function saveTabsToStorage() {
      purgeExpiredTrash();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          tabs: appState.tabs,
          trash: appState.trash,
          activeTabId: appState.activeTabId,
          zoomPercent: appState.zoomPercent,
          wordWrap: appState.wordWrap,
          wordAutocomplete: appState.wordAutocomplete,
          autocorrect: appState.autocorrect,
          showLineNumbers: appState.showLineNumbers,
          darkMode: appState.darkMode,
          uiStyle: appState.uiStyle,
          lang: appState.lang
        }));
      } catch (e) {}
      updateTrashBadge();
    }

    let saveStorageTimer = null;
    function scheduleSaveTabsToStorage(delayMs = 350) {
      if (saveStorageTimer) clearTimeout(saveStorageTimer);
      saveStorageTimer = setTimeout(() => {
        saveStorageTimer = null;
        saveTabsToStorage();
      }, delayMs);
    }

    window.addEventListener('beforeunload', () => {
      if (saveStorageTimer) {
        clearTimeout(saveStorageTimer);
        saveStorageTimer = null;
        saveTabsToStorage();
      }
    });

    function getActiveTab() {
      return appState.tabs.find(t => t.id === appState.activeTabId) || appState.tabs[0];
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function getActiveEditableRoot() {
      // If user is currently editing text inside a diagram shape, return that shape's text element!
      if (appState.activeShapeContext && appState.activeShapeContext.textEl && document.body.contains(appState.activeShapeContext.textEl)) {
        return appState.activeShapeContext.textEl;
      }
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.anchorNode) {
        const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
        if (el) {
          const shapeText = el.closest('.diagram-shape-text');
          if (shapeText) return shapeText;
          const tableCell = el.closest('.table-widget th, .table-widget td');
          if (tableCell) return tableCell;
        }
      }
      return document.getElementById('liveSheetEditor');
    }

    function saveCurrentSelection() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.anchorNode) {
        const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
        if (el) {
          const shapeText = el.closest('.diagram-shape-text');
          if (shapeText) {
            const widget = shapeText.closest('.diagram-widget');
            const shapeEl = shapeText.closest('.diagram-shape');
            if (widget && shapeEl) {
              appState.activeShapeContext = {
                diagId: widget.getAttribute('data-diagram-id'),
                shapeId: shapeEl.getAttribute('data-shape-id'),
                textEl: shapeText
              };
            }
            appState.savedRange = sel.getRangeAt(0).cloneRange();
            return;
          }
        }
        const editor = document.getElementById('liveSheetEditor');
        if (editor && editor.contains(sel.anchorNode)) {
          appState.savedRange = sel.getRangeAt(0).cloneRange();
        }
      }
    }

    function restoreSavedSelection() {
      const targetRoot = getActiveEditableRoot();
      if (targetRoot) targetRoot.focus();
      if (appState.savedRange) {
        try {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(appState.savedRange);
        } catch (e) {}
      }
    }

    function persistShapeTextIfActive() {
      if (appState.activeShapeContext && appState.activeShapeContext.textEl) {
        const { diagId, shapeId, textEl } = appState.activeShapeContext;
        const widget = getDiagramWidgetById(diagId);
        if (widget && document.body.contains(textEl)) {
          const st = parseDiagramState(widget);
          const sh = st.shapes.find(s => s.id === shapeId);
          if (sh) {
            sh.html = textEl.innerHTML;
            sh.text = textEl.innerText;
            saveDiagramState(widget, st);
          }
        }
      }
    }

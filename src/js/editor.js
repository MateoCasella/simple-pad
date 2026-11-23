// ==========================================
    // SINGLE LIVE SHEET & SHAPE FORMATTING ENGINE
    // ==========================================
    function getPlainTextFromEditor() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return '';
      return editor.innerText || '';
    }

    function normalizeHighlightsInEditor(rootEl) {
      if (!rootEl) return;
      rootEl.querySelectorAll('mark').forEach(m => {
        const span = document.createElement('span');
        span.style.backgroundColor = '#fef08a';
        span.style.color = '#0f172a';
        while (m.firstChild) span.appendChild(m.firstChild);
        m.replaceWith(span);
      });
      rootEl.querySelectorAll('.hl-yellow, span[style], font[style]').forEach(el => {
        const bg = (el.style && el.style.backgroundColor) ? el.style.backgroundColor.toLowerCase() : '';
        if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)' || bg === 'initial' || bg === 'inherit') {
          el.classList.remove('hl-yellow');
          el.style.backgroundColor = '';
          el.style.color = '';
        } else if (el.classList.contains('hl-yellow')) {
          el.classList.remove('hl-yellow');
          el.style.backgroundColor = '#fef08a';
          el.style.color = '#0f172a';
        }
      });
    }

    function getOrWrapActiveLineBlock(rootEl, targetNode) {
      let child = targetNode;
      while (child && child.parentNode !== rootEl && child !== rootEl) {
        child = child.parentNode;
      }
      if (!child || child === rootEl) return null;

      const blockTags = ['DIV', 'P', 'H1', 'H2', 'H3', 'UL', 'OL', 'TABLE', 'PRE', 'BLOCKQUOTE'];
      if (child.nodeType === 1 && blockTags.includes(child.tagName)) {
        return child;
      }

      let startNode = child;
      while (startNode.previousSibling) {
        const prev = startNode.previousSibling;
        if (prev.nodeType === 1 && (blockTags.includes(prev.tagName) || prev.tagName === 'BR')) break;
        startNode = prev;
      }
      let endNode = child;
      while (endNode.nextSibling) {
        const next = endNode.nextSibling;
        if (next.nodeType === 1 && (blockTags.includes(next.tagName) || next.tagName === 'BR')) break;
        endNode = next;
      }

      const wrapper = document.createElement('div');
      rootEl.insertBefore(wrapper, startNode);
      let cur = startNode;
      while (cur) {
        const next = cur === endNode ? null : cur.nextSibling;
        wrapper.appendChild(cur);
        cur = next;
      }
      if (wrapper.nextSibling && wrapper.nextSibling.nodeType === 1 && wrapper.nextSibling.tagName === 'BR') {
        wrapper.nextSibling.remove();
      }
      return wrapper;
    }

    // ==========================================
    // SLASH (/) & AT (@) INLINE COMMAND PALETTE
    // ==========================================
    const SLASH_COMMANDS = [
      // 1. Formato de texto (prioridad)
      { id: 'grande',     label: 'Texto grande',       hint: '/grande',     keywords: 'grande titulo h1 tamano tamaño',   run: () => applyDirectSizeFormat('grande') },
      { id: 'mediano',    label: 'Texto mediano',      hint: '/mediano',    keywords: 'mediano normal texto tamano tamaño',run: () => applyDirectSizeFormat('mediano') },
      { id: 'chico',      label: 'Texto chico',        hint: '/chico',      keywords: 'chico pequeno pequeño nota tamano', run: () => applyDirectSizeFormat('chico') },
      { id: 'negrita',    label: 'Negrita (línea)',    hint: '/negrita',    keywords: 'negrita bold fuerte formato',       run: () => applyLineFormatFromSlash('bold') },
      { id: 'cursiva',    label: 'Cursiva (línea)',    hint: '/cursiva',    keywords: 'cursiva italic inclinada formato',  run: () => applyLineFormatFromSlash('italic') },
      { id: 'subrayado',  label: 'Subrayado (línea)',  hint: '/subrayado',  keywords: 'subrayado underline linea formato', run: () => applyLineFormatFromSlash('underline') },
      { id: 'tachado',    label: 'Tachado (línea)',    hint: '/tachado',    keywords: 'tachado strike tachar formato',     run: () => applyLineFormatFromSlash('strike') },
      { id: 'resaltado',  label: 'Resaltado (línea)',  hint: '/resaltado',  keywords: 'resaltado highlight mark formato',  run: () => applyLineFormatFromSlash('highlight') },
      // 2. Listas
      { id: 'lista',      label: 'Lista con viñetas',  hint: '/lista',      keywords: 'lista vinetas viñetas bullets',     run: () => applyListType('disc') },
      { id: 'numerada',   label: 'Lista numerada',     hint: '/numerada',   keywords: 'numerada lista numeros',            run: () => applyListType('decimal') },
      // 3. Componentes
      { id: 'tabla',      label: 'Tabla',              hint: '/tabla',      keywords: 'tabla table filas columnas',        run: () => insertTableInSheet() },
      { id: 'diagrama',   label: 'Pizarra diagramas',  hint: '/diagrama',   keywords: 'diagrama pizarra formas draw',      run: () => insertDiagramInSheet() },
      { id: 'matematica', label: 'Bloque matemática',  hint: '/matematica', keywords: 'matematica math formula ecuacion calculo analisis algebra', run: () => insertMathWidgetInSheet(null, 'math') },
      { id: 'fisica',     label: 'Bloque física',      hint: '/fisica',     keywords: 'fisica physics vector fuerza energia cinematica dinamica formula', run: () => insertMathWidgetInSheet(null, 'physics') },
      { id: 'quimica',    label: 'Bloque química',     hint: '/quimica',    keywords: 'quimica chemistry reaccion molecula formula equilibrio estequiometria', run: () => insertMathWidgetInSheet(null, 'chemistry') },
      { id: 'js',         label: 'Código JavaScript',  hint: '/js',         keywords: 'codigo code js javascript',         run: () => insertCodeWidgetWithLang('javascript') },
      { id: 'py',         label: 'Código Python',      hint: '/py',         keywords: 'codigo code py python',             run: () => insertCodeWidgetWithLang('python') },
      { id: 'c',          label: 'Código C / C++',     hint: '/c',          keywords: 'codigo code c cpp',                 run: () => insertCodeWidgetWithLang('c') },
      { id: 'sql',        label: 'Código SQL',         hint: '/sql',        keywords: 'codigo code sql query db',          run: () => insertCodeWidgetWithLang('sql') },
      { id: 'html',       label: 'Código HTML / CSS',  hint: '/html',       keywords: 'codigo code html css web',          run: () => insertCodeWidgetWithLang('html') },
      { id: 'json',       label: 'Código JSON',        hint: '/json',       keywords: 'codigo code json',                  run: () => insertCodeWidgetWithLang('json') }
    ];

    function applyLineFormatFromSlash(fmtType) {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const lineBlock = getOrWrapActiveLineBlock(editor, sel.anchorNode);
      if (!lineBlock || lineBlock === editor) {
        applyDirectFormat(fmtType);
        return;
      }

      const hasText = (lineBlock.innerText || '').trim().length > 0;
      if (hasText) {
        // Select the entire current line block, apply format, then collapse caret to end of the same line (zero line break)
        const r = document.createRange();
        r.selectNodeContents(lineBlock);
        sel.removeAllRanges();
        sel.addRange(r);
        saveCurrentSelection();
        applyDirectFormat(fmtType);

        const endRange = document.createRange();
        endRange.selectNodeContents(lineBlock);
        endRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(endRange);
        saveCurrentSelection();
      } else {
        // Empty line: activate format directly at caret without adding any line break
        applyDirectFormat(fmtType);
      }
      const t = getActiveTab();
      if (t) scheduleHistorySnapshot(t.id, true);
    }

    let cmdPaletteState = {
      open: false,
      trigger: null,
      query: '',
      items: [],
      selectedIdx: 0,
      textNode: null,
      triggerOffset: 0,
      endOffset: 0
    };

    function closeCommandPalette() {
      cmdPaletteState.open = false;
      cmdPaletteState.items = [];
      const pop = document.getElementById('commandPalettePopup');
      if (pop) pop.classList.add('hidden');
    }

    function openMentionedTab(tabId) {
      const exists = appState.tabs.some(t => t.id === tabId);
      if (exists) {
        switchTab(tabId);
      } else {
        showToast('Esa pestaña fue cerrada (revisá la Papelera)');
      }
    }

    function getMentionItems(query) {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const items = [];
      (appState.tabs || []).forEach(t => {
        items.push({
          id: 'tab:' + t.id,
          label: t.title || 'Sin título.txt',
          hint: 'Pestaña',
          keywords: (t.title || '').toLowerCase(),
          run: () => insertTabMentionChip(t.id, t.title || 'Sin título.txt')
        });
      });
      items.push({
        id: 'date:hoy',
        label: `Hoy (${dateStr})`,
        hint: '@hoy',
        keywords: 'hoy fecha date',
        run: () => insertPlainTextAtCaret(dateStr)
      });
      items.push({
        id: 'date:hora',
        label: `Hora actual (${timeStr})`,
        hint: '@hora',
        keywords: 'hora time reloj',
        run: () => insertPlainTextAtCaret(timeStr)
      });
      items.push({
        id: 'date:fecha',
        label: `Fecha y hora`,
        hint: '@fecha',
        keywords: 'fecha hora timestamp',
        run: () => insertPlainTextAtCaret(`${dateStr} ${timeStr}`)
      });

      const q = (query || '').toLowerCase();
      if (!q) return items;
      return items.filter(it => it.label.toLowerCase().includes(q) || it.keywords.includes(q) || it.hint.toLowerCase().includes(q));
    }

    function ensureSelectionInsideEditor() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        return sel;
      }
      editor.focus();
      const r = document.createRange();
      r.selectNodeContents(editor);
      r.collapse(false);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(r);
      }
      return sel;
    }

    function insertPlainTextAtCaret(text) {
      const sel = ensureSelectionInsideEditor();
      if (!sel || sel.rangeCount === 0) return;
      const r = sel.getRangeAt(0);
      r.deleteContents();
      const tn = document.createTextNode(text);
      r.insertNode(tn);
      r.setStartAfter(tn);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
      handleLiveSheetInput();
      const t = getActiveTab();
      if (t) scheduleHistorySnapshot(t.id, true);
    }

    function insertTabMentionChip(tabId, tabTitle) {
      const sel = ensureSelectionInsideEditor();
      if (!sel || sel.rangeCount === 0) return;
      const r = sel.getRangeAt(0);
      r.deleteContents();
      const chip = document.createElement('span');
      chip.className = 'tab-mention-chip';
      chip.setAttribute('contenteditable', 'false');
      chip.setAttribute('data-target-tab-id', tabId);
      chip.setAttribute('onclick', `openMentionedTab('${tabId}')`);
      chip.title = `Ir a ${tabTitle}`;
      chip.textContent = `@${tabTitle}`;
      const space = document.createTextNode('\u00A0');
      r.insertNode(space);
      r.insertNode(chip);
      r.setStartAfter(space);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
      handleLiveSheetInput();
      const t = getActiveTab();
      if (t) scheduleHistorySnapshot(t.id, true);
    }

    function evaluateCommandPaletteAtCaret() {
      const editor = document.getElementById('liveSheetEditor');
      const sel = window.getSelection();
      if (!editor || !sel || sel.rangeCount === 0 || !sel.isCollapsed) {
        closeCommandPalette();
      closeWordAutocomplete();
        return;
      }
      const node = sel.anchorNode;
      if (!node || node.nodeType !== 3 || !editor.contains(node)) {
        closeCommandPalette();
      closeWordAutocomplete();
        return;
      }
      if (node.parentElement && (node.parentElement.closest('.diagram-widget') || node.parentElement.closest('.code-widget') || node.parentElement.closest('.table-widget'))) {
        closeCommandPalette();
      closeWordAutocomplete();
        return;
      }

      const textBefore = (node.nodeValue || '').slice(0, sel.anchorOffset);
      // Anti-annoyance: only trigger / or @ at line start or after whitespace, never on // or emails (foo@bar)
      const match = textBefore.match(/(^|[\s\u00A0])([/@])([^\s/@]*)$/);
      if (!match) {
        closeCommandPalette();
      closeWordAutocomplete();
        return;
      }

      const trigger = match[2];
      const query = match[3] || '';
      const triggerOffset = sel.anchorOffset - query.length - 1;

      let items = [];
      if (trigger === '/') {
        const q = query.toLowerCase();
        items = q
          ? SLASH_COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.keywords.includes(q) || c.hint.includes(q))
          : SLASH_COMMANDS.slice();
      } else {
        items = getMentionItems(query);
      }

      if (items.length === 0) {
        closeCommandPalette();
      closeWordAutocomplete();
        return;
      }

      const nextIdx = (cmdPaletteState.open && cmdPaletteState.trigger === trigger && cmdPaletteState.selectedIdx < items.length)
        ? cmdPaletteState.selectedIdx
        : 0;

      cmdPaletteState = {
        open: true,
        trigger,
        query,
        items,
        selectedIdx: Math.max(0, nextIdx),
        textNode: node,
        triggerOffset,
        endOffset: sel.anchorOffset
      };

      renderCommandPalettePopup(sel.getRangeAt(0));
    }

    function renderCommandPalettePopup(caretRange) {
      const pop = document.getElementById('commandPalettePopup');
      const titleEl = document.getElementById('commandPaletteTitle');
      const listEl = document.getElementById('commandPaletteList');
      if (!pop || !listEl) return;

      if (titleEl) {
        titleEl.textContent = cmdPaletteState.trigger === '/' ? 'Insertar (/)' : 'Mencionar (@)';
      }

      listEl.innerHTML = cmdPaletteState.items.map((item, idx) => {
        const active = idx === cmdPaletteState.selectedIdx;
        return `
          <button
            type="button"
            onmousedown="event.preventDefault(); event.stopPropagation(); executeCommandPaletteItem(${idx});"
            onmousemove="handleCmdPaletteMouseMove(event, ${idx})"
            data-cmd-idx="${idx}"
            class="w-full px-2.5 py-1.5 text-left flex items-center justify-between gap-2 text-[11px] transition ${
              active
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold'
                : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }"
          >
            <span class="truncate">${escapeHtml(item.label)}</span>
            <span class="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0">${escapeHtml(item.hint)}</span>
          </button>
        `;
      }).join('');

      let rect = caretRange ? caretRange.getBoundingClientRect() : null;
      if (!rect || (rect.left === 0 && rect.top === 0)) {
        const ed = document.getElementById('liveSheetEditor');
        rect = ed ? ed.getBoundingClientRect() : { left: 80, bottom: 140 };
      }
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - 270);
      const top = Math.min(rect.bottom + 6, window.innerHeight - 250);
      pop.style.left = `${Math.round(left)}px`;
      pop.style.top = `${Math.round(top)}px`;
      pop.classList.remove('hidden');
    }

    let lastCmdPaletteMouse = { x: -1, y: -1 };
    function handleCmdPaletteMouseMove(ev, idx) {
      if (ev.clientX === lastCmdPaletteMouse.x && ev.clientY === lastCmdPaletteMouse.y) return;
      lastCmdPaletteMouse = { x: ev.clientX, y: ev.clientY };
      if (cmdPaletteState.selectedIdx !== idx) {
        cmdPaletteState.selectedIdx = idx;
        highlightCommandPaletteSelection(false);
      }
    }

    function highlightCommandPaletteSelection(shouldScroll = true) {
      const listEl = document.getElementById('commandPaletteList');
      if (!listEl) return;
      listEl.querySelectorAll('button[data-cmd-idx]').forEach((btn, idx) => {
        const active = idx === cmdPaletteState.selectedIdx;
        btn.className = `w-full px-2.5 py-1.5 text-left flex items-center justify-between gap-2 text-[11px] transition ${
          active
            ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold'
            : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
        }`;
        if (active && shouldScroll) {
          const top = btn.offsetTop;
          const bottom = top + btn.offsetHeight;
          if (top < listEl.scrollTop) {
            listEl.scrollTop = top;
          } else if (bottom > listEl.scrollTop + listEl.clientHeight) {
            listEl.scrollTop = bottom - listEl.clientHeight;
          }
        }
      });
    }

    function executeCommandPaletteItem(idx) {
      if (!cmdPaletteState.open) return;
      const item = cmdPaletteState.items[idx];
      if (!item) return;

      const { textNode, triggerOffset, endOffset } = cmdPaletteState;
      closeCommandPalette();
      closeWordAutocomplete();

      const editor = document.getElementById('liveSheetEditor');
      if (textNode && document.body.contains(textNode)) {
        const lineBlock = editor ? getOrWrapActiveLineBlock(editor, textNode) : null;
        const r = document.createRange();
        let safeStart = Math.min(triggerOffset, textNode.nodeValue.length);
        const safeEnd = Math.min(endOffset, textNode.nodeValue.length);
        if (safeStart > 0 && textNode.nodeValue[safeStart - 1] === ' ' && safeEnd === textNode.nodeValue.length) {
          safeStart -= 1;
        }
        r.setStart(textNode, safeStart);
        r.setEnd(textNode, safeEnd);
        r.deleteContents();

        const sel = window.getSelection();
        if (lineBlock && lineBlock !== editor && (lineBlock.textContent || '') === '' && !lineBlock.querySelector('.diagram-widget, .table-widget, .code-widget, .math-widget')) {
          if (!lineBlock.querySelector('br')) {
            lineBlock.innerHTML = '<br>';
          }
          const nr = document.createRange();
          nr.setStart(lineBlock, 0);
          nr.collapse(true);
          sel.removeAllRanges();
          sel.addRange(nr);
        } else {
          sel.removeAllRanges();
          sel.addRange(r);
        }
        saveCurrentSelection();
      }

      item.run();
    }

    // ==========================================
    // NOTEPAD++ WORD AUTOCOMPLETE (FROM ACTIVE .TXT)
    // ==========================================
    let wordAcState = {
      open: false,
      prefix: '',
      items: [],
      selectedIdx: 0,
      textNode: null,
      startOffset: 0,
      endOffset: 0
    };

    function toggleWordAutocomplete() {
      appState.wordAutocomplete = !appState.wordAutocomplete;
      const chk = document.getElementById('menuCheckAutocomplete');
      if (chk) chk.textContent = appState.wordAutocomplete ? '✓' : '';
      if (!appState.wordAutocomplete) closeWordAutocomplete();
      saveTabsToStorage();
      showToast(appState.wordAutocomplete ? 'Autocompletado activado' : 'Autocompletado desactivado');
    }

    function closeWordAutocomplete() {
      wordAcState.open = false;
      wordAcState.items = [];
      const pop = document.getElementById('wordAutocompletePopup');
      if (pop) pop.classList.add('hidden');
    }

    function collectWordsFromActiveSheet(excludePrefixLower) {
      const plain = getPlainTextFromEditor();
      const rawWords = plain.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_]{4,}/g) || [];
      const freq = new Map();
      const canonical = new Map();
      for (let i = 0; i < rawWords.length; i++) {
        const w = rawWords[i];
        const low = w.toLowerCase();
        freq.set(low, (freq.get(low) || 0) + 1);
        if (!canonical.has(low)) canonical.set(low, w);
      }
      if (excludePrefixLower && freq.has(excludePrefixLower)) {
        const c = freq.get(excludePrefixLower) - 1;
        if (c <= 0) freq.delete(excludePrefixLower);
        else freq.set(excludePrefixLower, c);
      }
      return { freq, canonical };
    }

    function evaluateWordAutocompleteAtCaret() {
      if (!appState.wordAutocomplete || cmdPaletteState.open) {
        closeWordAutocomplete();
        return;
      }
      const editor = document.getElementById('liveSheetEditor');
      const sel = window.getSelection();
      if (!editor || !sel || sel.rangeCount === 0 || !sel.isCollapsed) {
        closeWordAutocomplete();
        return;
      }
      const node = sel.anchorNode;
      if (!node || node.nodeType !== 3 || !editor.contains(node)) {
        closeWordAutocomplete();
        return;
      }
      if (node.parentElement && (node.parentElement.closest('.diagram-widget') || node.parentElement.closest('.code-widget') || node.parentElement.closest('.table-widget'))) {
        closeWordAutocomplete();
        return;
      }

      const fullVal = node.nodeValue || '';
      const textBefore = fullVal.slice(0, sel.anchorOffset);
      const textAfter = fullVal.slice(sel.anchorOffset);
      if (/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_]/.test(textAfter)) {
        closeWordAutocomplete();
        return;
      }

      const m = textBefore.match(/(^|[\s\u00A0(\[{.,;:¡¿"'-])([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_]{3,})$/);
      if (!m) {
        closeWordAutocomplete();
        return;
      }

      const prefix = m[2];
      const prefixLow = prefix.toLowerCase();
      const startOffset = sel.anchorOffset - prefix.length;

      const { freq, canonical } = collectWordsFromActiveSheet(prefixLow);
      const candidates = [];
      freq.forEach((count, low) => {
        if (low.startsWith(prefixLow) && low.length > prefixLow.length) {
          candidates.push({ word: canonical.get(low), count });
        }
      });

      if (candidates.length === 0) {
        closeWordAutocomplete();
        return;
      }

      candidates.sort((a, b) => b.count - a.count || a.word.length - b.word.length);
      const topItems = candidates.slice(0, 6).map(c => c.word);

      const nextIdx = (wordAcState.open && wordAcState.selectedIdx < topItems.length) ? wordAcState.selectedIdx : 0;
      wordAcState = {
        open: true,
        prefix,
        items: topItems,
        selectedIdx: Math.max(0, nextIdx),
        textNode: node,
        startOffset,
        endOffset: sel.anchorOffset
      };

      renderWordAutocompletePopup(sel.getRangeAt(0));
    }

    function renderWordAutocompletePopup(caretRange) {
      const pop = document.getElementById('wordAutocompletePopup');
      const listEl = document.getElementById('wordAutocompleteList');
      if (!pop || !listEl) return;

      const pLen = wordAcState.prefix.length;
      listEl.innerHTML = wordAcState.items.map((word, idx) => {
        const active = idx === wordAcState.selectedIdx;
        const head = escapeHtml(word.slice(0, pLen));
        const tail = escapeHtml(word.slice(pLen));
        return `
          <button
            type="button"
            onmousedown="event.preventDefault(); event.stopPropagation(); acceptWordAutocomplete(${idx});"
            onmousemove="if(wordAcState.selectedIdx!==${idx}){ wordAcState.selectedIdx=${idx}; highlightWordAutocompleteSelection(); }"
            data-ac-idx="${idx}"
            class="w-full px-2.5 py-1 text-left flex items-center justify-between text-[11px] transition ${
              active
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold'
                : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }"
          >
            <span class="truncate"><strong class="underline decoration-dotted">${head}</strong>${tail}</span>
          </button>
        `;
      }).join('');

      let rect = caretRange ? caretRange.getBoundingClientRect() : null;
      if (!rect || (rect.left === 0 && rect.top === 0)) {
        const ed = document.getElementById('liveSheetEditor');
        rect = ed ? ed.getBoundingClientRect() : { left: 80, bottom: 140 };
      }
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - 240);
      const top = Math.min(rect.bottom + 6, window.innerHeight - 210);
      pop.style.left = `${Math.round(left)}px`;
      pop.style.top = `${Math.round(top)}px`;
      pop.classList.remove('hidden');
    }

    function highlightWordAutocompleteSelection() {
      const listEl = document.getElementById('wordAutocompleteList');
      if (!listEl) return;
      listEl.querySelectorAll('button[data-ac-idx]').forEach((btn, idx) => {
        const active = idx === wordAcState.selectedIdx;
        btn.className = `w-full px-2.5 py-1 text-left flex items-center justify-between text-[11px] transition ${
          active
            ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold'
            : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
        }`;
        if (active) btn.scrollIntoView({ block: 'nearest' });
      });
    }

    function acceptWordAutocomplete(idx) {
      if (!wordAcState.open) return;
      const chosen = wordAcState.items[idx];
      if (!chosen) return;
      const { textNode, startOffset, endOffset } = wordAcState;
      closeWordAutocomplete();

      if (textNode && document.body.contains(textNode)) {
        const val = textNode.nodeValue || '';
        const safeStart = Math.min(startOffset, val.length);
        const safeEnd = Math.min(endOffset, val.length);
        textNode.nodeValue = val.slice(0, safeStart) + chosen + val.slice(safeEnd);
        const newPos = safeStart + chosen.length;
        const r = document.createRange();
        r.setStart(textNode, newPos);
        r.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        saveCurrentSelection();
        handleLiveSheetInput();
        const t = getActiveTab();
        if (t) scheduleHistorySnapshot(t.id, true);
      }
    }

    // ==========================================
    // SIMPLE AUTOCORRECTOR & SPELLCHECK (ES)
    // ==========================================
    const AUTOCORRECT_DICT = {
      'tambien': 'también', 'despues': 'después', 'ademas': 'además',
      'codigo': 'código', 'codigos': 'códigos', 'numero': 'número', 'numeros': 'números',
      'pagina': 'página', 'paginas': 'páginas', 'rapido': 'rápido', 'rapida': 'rápida',
      'facil': 'fácil', 'dificil': 'difícil', 'informacion': 'información',
      'configuracion': 'configuración', 'aplicacion': 'aplicación', 'funcion': 'función',
      'version': 'versión', 'reunion': 'reunión',
      'tecnico': 'técnico', 'tecnica': 'técnica', 'grafico': 'gráfico', 'logica': 'lógica',
      'practica': 'práctica', 'analisis': 'análisis', 'sintesis': 'síntesis',
      'proximo': 'próximo', 'proxima': 'próxima', 'ultimo': 'último', 'ultima': 'última',
      'unico': 'único', 'unica': 'única', 'metodo': 'método', 'metodos': 'métodos',
      'modulo': 'módulo', 'modulos': 'módulos', 'titulo': 'título', 'titulos': 'títulos',
      'linea': 'línea', 'lineas': 'líneas', 'area': 'área', 'areas': 'áreas',
      'dia': 'día', 'dias': 'días', 'aqui': 'aquí', 'asi': 'así',
      'todavia': 'todavía', 'podria': 'podría', 'deberia': 'debería',
      'habia': 'había', 'tenia': 'tenía', 'seria': 'sería', 'estaria': 'estaría',
      'pestanias': 'pestañas', 'pestana': 'pestaña', 'compania': 'compañía',
      'boton': 'botón', 'opcion': 'opción', 'edicion': 'edición', 'busqueda': 'búsqueda',
      'estadistica': 'estadística', 'automatico': 'automático', 'automatica': 'automática',
      'basico': 'básico', 'basica': 'básica', 'publico': 'público', 'publica': 'pública',
      'valido': 'válido', 'invalido': 'inválido', 'estandar': 'estándar',
      'simbolo': 'símbolo', 'indice': 'índice',
      'minimo': 'mínimo', 'maximo': 'máximo', 'multiple': 'múltiple', 'multiples': 'múltiples',
      'qeu': 'que', 'porq': 'porque', 'exaustivo': 'exhaustivo', 'pizzara': 'pizarra',
      'remplazo': 'reemplazo', 'componete': 'componente', 'elminar': 'eliminar',
      'teh': 'the', 'recieve': 'receive', 'seperate': 'separate'
    };

    function preserveWordCase(original, replacement) {
      if (original === original.toUpperCase() && original !== original.toLowerCase()) {
        return replacement.toUpperCase();
      }
      if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1);
      }
      return replacement;
    }

    function toggleAutocorrect() {
      appState.autocorrect = !appState.autocorrect;
      applyVisualPreferences();
      saveTabsToStorage();
      showToast(appState.autocorrect ? 'Autocorrector activado' : 'Autocorrector desactivado');
    }

    function runAutocorrectOnWordBoundary() {
      if (!appState.autocorrect || cmdPaletteState.open) return;
      const editor = document.getElementById('liveSheetEditor');
      const sel = window.getSelection();
      if (!editor || !sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      const node = sel.anchorNode;
      if (!node || node.nodeType !== 3 || !editor.contains(node)) return;
      if (node.parentElement && node.parentElement.closest('.code-widget')) return;

      const val = node.nodeValue || '';
      const pos = sel.anchorOffset;
      if (pos < 2) return;

      const prevChar = val[pos - 1];
      if (!/[\s\u00A0.,;:!?)]/.test(prevChar)) return;

      const beforeDelim = val.slice(0, pos - 1);
      const m = beforeDelim.match(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)$/);
      if (!m) return;

      const rawWord = m[1];
      const low = rawWord.toLowerCase();
      const fixedBase = AUTOCORRECT_DICT[low];
      if (!fixedBase || fixedBase === low) return;

      const fixed = preserveWordCase(rawWord, fixedBase);
      const wordStart = (pos - 1) - rawWord.length;
      const wordEnd = pos - 1;

      node.nodeValue = val.slice(0, wordStart) + fixed + val.slice(wordEnd);
      const newPos = wordStart + fixed.length + 1;
      const r = document.createRange();
      r.setStart(node, Math.min(newPos, node.nodeValue.length));
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
    }

    let cursorMetricsTimer = null;
    function scheduleCursorMetricsUpdate(delayMs = 120) {
      if (cursorMetricsTimer) clearTimeout(cursorMetricsTimer);
      cursorMetricsTimer = setTimeout(() => {
        cursorMetricsTimer = null;
        updateCursorMetrics();
      }, delayMs);
    }

    function handleLiveSheetInput() {
      const editor = document.getElementById('liveSheetEditor');
      const tab = getActiveTab();
      if (!editor || !tab) return;
      runAutocorrectOnWordBoundary();
      tab.html = editor.innerHTML;
      if (typeof scheduleSaveTabsToStorage === 'function') {
        scheduleSaveTabsToStorage(350);
      } else {
        saveTabsToStorage();
      }
      scheduleHistorySnapshot(tab.id, false);
      scheduleLineNumbersUpdate();
      scheduleCursorMetricsUpdate(120);
      if (!document.getElementById('findReplaceBar').classList.contains('hidden')) {
        runFindPreview();
      }
      evaluateCommandPaletteAtCaret();
      evaluateWordAutocompleteAtCaret();
    }

    function handleEditorPaste(e) {
      if (!appState.copiedWidget) return;
      const t = e.target;
      if (t && t.closest && (t.closest('.table-widget') || t.closest('.diagram-widget') || t.closest('.code-widget'))) {
        return; // inside a sub-editor, let normal text paste work
      }
      const clipText = (e.clipboardData && e.clipboardData.getData('text/plain')) || '';
      if (clipText && clipText.trim() !== '' && clipText.trim() !== (appState.copiedWidget.plainText || '').trim()) {
        return; // user copied something else externally since clicking Copiar
      }
      e.preventDefault();
      const editor = document.getElementById('liveSheetEditor');
      let refNode = null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        const lb = getOrWrapActiveLineBlock(editor, sel.anchorNode);
        if (lb && lb !== editor) refNode = lb;
      }
      if (appState.copiedWidget.type === 'diagram') {
        insertClonedDiagramAfter(refNode, appState.copiedWidget.state);
        { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
      showToast('✓ Pizarra pegada en la hoja');
      } else if (appState.copiedWidget.type === 'table') {
        insertClonedTableAfter(refNode, appState.copiedWidget.state);
        { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
      showToast('✓ Tabla pegada en la hoja');
      }
    }

    function handleEditorKeyDown(e) {
      if (cmdPaletteState.open) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          cmdPaletteState.selectedIdx = (cmdPaletteState.selectedIdx + 1) % cmdPaletteState.items.length;
          highlightCommandPaletteSelection();
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          cmdPaletteState.selectedIdx = (cmdPaletteState.selectedIdx - 1 + cmdPaletteState.items.length) % cmdPaletteState.items.length;
          highlightCommandPaletteSelection();
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          executeCommandPaletteItem(cmdPaletteState.selectedIdx);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeCommandPalette();
      closeWordAutocomplete();
          return;
        }
      }
      if (wordAcState.open) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          wordAcState.selectedIdx = (wordAcState.selectedIdx + 1) % wordAcState.items.length;
          highlightWordAutocompleteSelection();
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          wordAcState.selectedIdx = (wordAcState.selectedIdx - 1 + wordAcState.items.length) % wordAcState.items.length;
          highlightWordAutocompleteSelection();
          return;
        }
        if (e.key === 'Tab' || e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          acceptWordAutocomplete(wordAcState.selectedIdx);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeWordAutocomplete();
          return;
        }
      }
      const editor = document.getElementById('liveSheetEditor');
      const sel = window.getSelection();

      // Reset txt-grande / txt-chico heading line back to normal txt-mediano on Enter
      if (e.key === 'Enter' && !e.shiftKey && editor && sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        const anchorEl = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
        if (anchorEl && !anchorEl.closest('li, .table-widget, .diagram-widget, .code-widget, .math-widget')) {
          const lineBlock = getOrWrapActiveLineBlock(editor, sel.anchorNode);
          if (lineBlock && lineBlock !== editor && (lineBlock.classList.contains('txt-grande') || lineBlock.classList.contains('txt-chico'))) {
            e.preventDefault();
            const range = sel.getRangeAt(0);
            range.deleteContents();

            // Extract any trailing content after the caret into the new normal line
            const afterRange = document.createRange();
            afterRange.setStart(range.endContainer, range.endOffset);
            afterRange.setEnd(lineBlock, lineBlock.childNodes.length);
            const trailingFrag = afterRange.extractContents();

            if ((lineBlock.textContent || '') === '' && !lineBlock.querySelector('br')) {
              lineBlock.innerHTML = '<br>';
            }

            const newDiv = document.createElement('div');
            newDiv.className = 'txt-mediano';
            if ((trailingFrag.textContent || '').length > 0) {
              newDiv.appendChild(trailingFrag);
            } else {
              newDiv.innerHTML = '<br>';
            }
            lineBlock.insertAdjacentElement('afterend', newDiv);

            const nr = document.createRange();
            nr.setStart(newDiv, 0);
            nr.collapse(true);
            sel.removeAllRanges();
            sel.addRange(nr);
            setSizeCheckmarks('mediano');
            saveCurrentSelection();
            handleLiveSheetInput();
            const _t = getActiveTab();
            if (_t) scheduleHistorySnapshot(_t.id, true);
            return;
          }
        }
      }

      // Multi-level list indentation with Tab / Shift+Tab (1. -> a. -> i. and • -> ◦ -> ▪)
      if (e.key === 'Tab' && editor && sel && sel.rangeCount > 0) {
        const anchorEl = sel.anchorNode && (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode);
        if (anchorEl && anchorEl.closest('li') && !anchorEl.closest('.table-widget')) {
          e.preventDefault();
          handleListTabIndent(e.shiftKey, editor);
          return;
        }
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && editor && sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (!sel.isCollapsed) {
          const widgets = Array.from(editor.querySelectorAll('.diagram-widget, .table-widget, .code-widget'));
          let removedAny = false;
          widgets.forEach(w => {
            if (range.intersectsNode(w)) {
              w.remove();
              removedAny = true;
            }
          });
          if (removedAny) {
            handleLiveSheetInput();
          }
        } else if (editor.contains(sel.anchorNode)) {
          let block = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentNode : sel.anchorNode;
          while (block && block.parentNode !== editor && block !== editor) {
            block = block.parentNode;
          }

          if (block && block !== editor) {
            const isAtStart = range.startOffset === 0 && (sel.anchorNode === block || sel.anchorNode === block.firstChild);
            const isBlockEmpty = (block.innerText || '').trim() === '';

            if (e.key === 'Backspace' && (isAtStart || isBlockEmpty)) {
              const prev = block.previousElementSibling;
              if (prev && (prev.classList.contains('diagram-widget') || prev.classList.contains('table-widget') || prev.classList.contains('code-widget'))) {
                e.preventDefault();
                prev.remove();
                handleLiveSheetInput();
                showToast('Componente eliminado');
                return;
              }
            }
            if (e.key === 'Delete') {
              const next = block.nextElementSibling;
              if (next && (next.classList.contains('diagram-widget') || next.classList.contains('table-widget') || next.classList.contains('code-widget')) && isBlockEmpty) {
                e.preventDefault();
                next.remove();
                handleLiveSheetInput();
                showToast('Componente eliminado');
                return;
              }
            }
          }
        }
      }

      if (e.key === 'Tab') {
        if (sel && sel.rangeCount > 0 && editor && editor.contains(sel.anchorNode)) {
          let node = sel.anchorNode;
          let currentCell = null;
          while (node && node !== editor) {
            if (node.nodeType === 1 && (node.tagName === 'TD' || node.tagName === 'TH')) {
              currentCell = node;
              break;
            }
            node = node.parentNode;
          }
          if (currentCell) {
            e.preventDefault();
            const table = currentCell.closest('table');
            if (table) {
              const cells = Array.from(table.querySelectorAll('th, td'));
              const idx = cells.indexOf(currentCell);
              const nextIdx = e.shiftKey ? idx - 1 : idx + 1;
              if (nextIdx >= 0 && nextIdx < cells.length) {
                const targetCell = cells[nextIdx];
                const range = document.createRange();
                range.selectNodeContents(targetCell);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              }
            }
            return;
          }
          // Normal text line: insert 4 spaces at caret instead of blurring out of the sheet
          e.preventDefault();
          const r = sel.getRangeAt(0);
          r.deleteContents();
          const tabNode = document.createTextNode('    ');
          r.insertNode(tabNode);
          r.setStartAfter(tabNode);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
          handleLiveSheetInput();
        }
      }
    }

    let gutterRafId = null;
    function scheduleLineNumbersUpdate() {
      if (gutterRafId) cancelAnimationFrame(gutterRafId);
      gutterRafId = requestAnimationFrame(() => {
        gutterRafId = null;
        updateLineNumbersGutter();
      });
    }

    function updateLineNumbersGutter() {
      const gutter = document.getElementById('lineNumbersGutter');
      const editor = document.getElementById('liveSheetEditor');
      const wrap = document.getElementById('sheetScrollWrapper');
      if (!gutter || !editor || !wrap) return;

      const cs = getComputedStyle(editor);
      const padTop = parseFloat(cs.paddingTop) || 12;
      const fontSize = parseFloat(cs.fontSize) || 17;
      let rowH = parseFloat(cs.lineHeight);
      if (!Number.isFinite(rowH) || rowH < fontSize) {
        rowH = Math.round(fontSize * 1.55);
      }

      const editorTop = editor.getBoundingClientRect().top;
      let maxBottom = 0;

      Array.from(editor.childNodes).forEach(node => {
        if (node.nodeType === 3) {
          if (!(node.nodeValue || '').trim()) return;
          const r = document.createRange();
          r.selectNodeContents(node);
          const rect = r.getBoundingClientRect();
          if (rect.height > 0) {
            maxBottom = Math.max(maxBottom, rect.bottom - editorTop - padTop);
          }
        } else if (node.nodeType === 1) {
          const rect = node.getBoundingClientRect();
          if (rect.height > 0) {
            maxBottom = Math.max(maxBottom, rect.bottom - editorTop - padTop);
          }
        }
      });

      const totalRows = Math.max(1, Math.ceil((maxBottom - 2) / rowH));
      const trackHeight = Math.max(editor.scrollHeight, Math.ceil(padTop + totalRows * rowH + 24));

      const sig = `${totalRows}|${Math.round(padTop)}|${Math.round(rowH)}|${trackHeight}`;
      if (gutter._lastSig !== sig) {
        gutter._lastSig = sig;
        let itemsHtml = '';
        for (let i = 0; i < totalRows; i++) {
          const topPx = Math.round(padTop + i * rowH);
          itemsHtml += `<div class="gutter-num-item" style="top:${topPx}px;height:${rowH}px;line-height:${rowH}px;">${i + 1}</div>`;
        }
        gutter.innerHTML = `<div style="position:relative;height:${trackHeight}px;width:100%;">${itemsHtml}</div>`;
      }
      gutter.scrollTop = wrap.scrollTop;
    }

    function syncGutterScroll() {
      const wrap = document.getElementById('sheetScrollWrapper');
      const gutter = document.getElementById('lineNumbersGutter');
      if (wrap && gutter) {
        gutter.scrollTop = wrap.scrollTop;
      }
    }

    function setSizeCheckmarks(size) {
      appState.activeSize = size;
      const g = document.getElementById('checkSizeGrande');
      const m = document.getElementById('checkSizeMediano');
      const c = document.getElementById('checkSizeChico');
      if (g) g.textContent = size === 'grande' ? '✓' : '';
      if (m) m.textContent = size === 'mediano' ? '✓' : '';
      if (c) c.textContent = size === 'chico' ? '✓' : '';
    }

    function getEnclosingHighlightElement(node, rootEl) {
      let cur = node && node.nodeType === 3 ? node.parentElement : node;
      while (cur && cur !== rootEl && cur !== document.body) {
        if (cur.nodeType === 1) {
          if (cur.tagName === 'MARK' || cur.classList.contains('hl-yellow')) return cur;
          const bg = (cur.style && cur.style.backgroundColor) ? cur.style.backgroundColor.toLowerCase() : '';
          if (bg.includes('254, 240, 138') || bg.includes('#fef08a') || bg.includes('rgb(254,240,138)')) {
            return cur;
          }
        }
        cur = cur.parentElement;
      }
      return null;
    }

    function isNodeHighlighted(node, rootEl) {
      return Boolean(getEnclosingHighlightElement(node, rootEl));
    }

    function updateHighlightButtonVisual(isActive) {
      const btn = document.getElementById('btnHighlightYellow');
      if (!btn) return;
      if (isActive) {
        btn.classList.add('bg-yellow-100', 'dark:bg-yellow-900/40', 'ring-1', 'ring-yellow-400');
      } else {
        btn.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/40', 'ring-1', 'ring-yellow-400');
      }
    }

    function updateCursorMetrics() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;

      const plain = getPlainTextFromEditor();
      const words = plain.trim() ? plain.trim().split(/\s+/).length : 0;
      const chars = plain.length;
      const linesArr = plain.replace(/\n$/, '').split('\n');
      const totalLines = Math.max(1, plain ? linesArr.length : 1);

      let curLine = 1;
      let curCol = 1;
      let selectedLen = 0;

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
        if (!el || !el.closest('.diagram-widget')) {
          appState.activeShapeContext = null;
          setActiveDiagramFocus(null);
        }
        saveCurrentSelection();
        const range = sel.getRangeAt(0);
        selectedLen = range.toString().length;

        const preRange = range.cloneRange();
        preRange.selectNodeContents(editor);
        preRange.setEnd(range.endContainer, range.endOffset);
        const preText = preRange.toString();
        const preLines = preText.split('\n');
        curLine = Math.min(totalLines, Math.max(1, preLines.length));
        curCol = preLines[preLines.length - 1].length + 1;

        let node = sel.anchorNode;
        let detectedSize = 'mediano';
        while (node && node !== editor) {
          if (node.nodeType === 1) {
            if (node.classList.contains('txt-grande') || node.classList.contains('inline-grande') || node.tagName === 'H1') {
              detectedSize = 'grande';
              break;
            }
            if (node.classList.contains('txt-chico') || node.classList.contains('inline-chico') || node.tagName === 'SMALL') {
              detectedSize = 'chico';
              break;
            }
          }
          node = node.parentNode;
        }
        setSizeCheckmarks(detectedSize);

        const hlActive = isNodeHighlighted(sel.anchorNode, editor);
        updateHighlightButtonVisual(hlActive);
      }

      const posEl = document.getElementById('statusCursorPos');
      if (posEl) posEl.textContent = `Lín ${curLine}, Col ${curCol}`;

      const countEl = document.getElementById('statusWordCharCount');
      if (countEl) countEl.textContent = `${totalLines} lín | ${words} palabras, ${chars} caracteres`;

      const selEl = document.getElementById('statusSelectionCount');
      let selectedText = '';
      if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        selectedText = sel.getRangeAt(0).toString();
      }
      if (selEl) {
        if (selectedLen > 0) {
          selEl.textContent = `(${selectedLen} seleccionados)`;
          selEl.classList.remove('hidden');
        } else {
          selEl.classList.add('hidden');
        }
      }

      updateTokenCalculatorUI(plain, selectedText, words, chars);
    }

    const AI_TOKEN_PROFILES = {
      openai:    { label: 'OpenAI',    charsPerSubword: 4.9, accentPenalty: 0.15, punctWeight: 0.65, ctxLimit: 128000,  ctxLabel: 'Contexto 128K (OpenAI)' },
      google:    { label: 'Google',    charsPerSubword: 4.5, accentPenalty: 0.10, punctWeight: 0.70, ctxLimit: 1000000, ctxLabel: 'Contexto 1M (Gemini)' },
      anthropic: { label: 'Anthropic', charsPerSubword: 4.1, accentPenalty: 0.30, punctWeight: 0.75, ctxLimit: 200000,  ctxLabel: 'Contexto 200K (Claude)' },
      meta:      { label: 'Meta',      charsPerSubword: 4.4, accentPenalty: 0.25, punctWeight: 0.72, ctxLimit: 128000,  ctxLabel: 'Contexto 128K (Llama)' },
      deepseek:  { label: 'DeepSeek',  charsPerSubword: 4.3, accentPenalty: 0.25, punctWeight: 0.72, ctxLimit: 128000,  ctxLabel: 'Contexto 128K (DeepSeek)' },
      xai:       { label: 'xAI',       charsPerSubword: 4.4, accentPenalty: 0.20, punctWeight: 0.70, ctxLimit: 128000,  ctxLabel: 'Contexto 128K (Grok)' }
    };

    function estimateTokenCount(text, profileKey) {
      if (!text || !text.trim()) return 0;
      const key = profileKey || ((document.getElementById('tokenCalcProfile') || {}).value) || 'openai';
      const cfg = AI_TOKEN_PROFILES[key] || AI_TOKEN_PROFILES.openai;
      const segments = text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+|[0-9]+|[^\sA-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]|\n/g) || [];
      let tokens = 0;

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (seg === '\n') {
          tokens += 1;
        } else if (/^[0-9]+$/.test(seg)) {
          tokens += Math.ceil(seg.length / 3);
        } else if (/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/.test(seg)) {
          const hasAccent = /[ÁÉÍÓÚÜÑáéíóúüñ]/.test(seg);
          const extra = hasAccent ? cfg.accentPenalty : 0;
          tokens += Math.max(1, Math.ceil((seg.length + extra) / cfg.charsPerSubword));
        } else {
          tokens += cfg.punctWeight;
        }
      }
      return Math.max(1, Math.round(tokens));
    }

    function updateTokenCalculatorUI(plainText, selectedText, words, chars) {
      const profile = ((document.getElementById('tokenCalcProfile') || {}).value) || 'openai';
      const totalTokens = estimateTokenCount(plainText, profile);
      const selTokens = selectedText && selectedText.trim() ? estimateTokenCount(selectedText, profile) : 0;

      const statusBtn = document.getElementById('statusTokenCount');
      if (statusBtn) {
        statusBtn.textContent = selTokens > 0
          ? `~${totalTokens.toLocaleString('es-AR')} tokens (${selTokens} sel.)`
          : `~${totalTokens.toLocaleString('es-AR')} tokens`;
      }

      const activeTab = getActiveTab();
      const titleEl = document.getElementById('tokenCalcTitle');
      if (titleEl && activeTab) {
        titleEl.textContent = `Tokens · ${activeTab.title || 'Sin título.txt'}`;
      }

      const totalEl = document.getElementById('tokenCalcTotal');
      if (totalEl) totalEl.textContent = totalTokens.toLocaleString('es-AR');

      const selRow = document.getElementById('tokenCalcSelectionRow');
      const selVal = document.getElementById('tokenCalcSelectionVal');
      if (selRow && selVal) {
        if (selTokens > 0) {
          selVal.textContent = `~${selTokens.toLocaleString('es-AR')} tokens`;
          selRow.classList.remove('hidden');
        } else {
          selRow.classList.add('hidden');
        }
      }

      const wEl = document.getElementById('tokenCalcWords');
      const cEl = document.getElementById('tokenCalcChars');
      const rEl = document.getElementById('tokenCalcRatio');
      if (wEl) wEl.textContent = words.toLocaleString('es-AR');
      if (cEl) cEl.textContent = chars.toLocaleString('es-AR');
      if (rEl) rEl.textContent = totalTokens > 0 ? (chars / totalTokens).toFixed(1) : '0.0';

      const cfg = AI_TOKEN_PROFILES[profile] || AI_TOKEN_PROFILES.openai;
      const pctCtx = Math.min(100, (totalTokens / cfg.ctxLimit) * 100);
      const ctxLblEl = document.getElementById('tokenCalcCtxLabel');
      const pctEl = document.getElementById('tokenCalcCtx128');
      const barEl = document.getElementById('tokenCalcCtxBar');
      if (ctxLblEl) ctxLblEl.textContent = cfg.ctxLabel;
      if (pctEl) pctEl.textContent = `${pctCtx < 0.01 && totalTokens > 0 ? '<0.01' : pctCtx.toFixed(2)}%`;
      if (barEl) barEl.style.width = `${Math.max(totalTokens > 0 ? 1 : 0, pctCtx)}%`;
    }

    function toggleTokenCalculator(ev) {
      if (ev) ev.stopPropagation();
      const pop = document.getElementById('tokenCalculatorPopover');
      if (!pop) return;
      const isHidden = pop.classList.contains('hidden');
      closeAllMenus();
      if (isHidden) {
        updateCursorMetrics();
        pop.classList.remove('hidden');
      }
    }

    function closeTokenCalculator() {
      const pop = document.getElementById('tokenCalculatorPopover');
      if (pop) pop.classList.add('hidden');
    }

    // If a diagram shape is selected (even if not double-clicked yet), allow formatting buttons to format the shape's text!
    function ensureShapeTextReadyForFormatting() {
      if (appState.activeShapeContext && appState.activeShapeContext.textEl && document.body.contains(appState.activeShapeContext.textEl)) {
        return appState.activeShapeContext.textEl;
      }
      if (appState.activeDiagramId) {
        const rt = getDiagramRuntime(appState.activeDiagramId);
        if (rt && rt.selectedShapeId) {
          const widget = getDiagramWidgetById(appState.activeDiagramId);
          const shapeEl = widget ? widget.querySelector(`.diagram-shape[data-shape-id="${rt.selectedShapeId}"]`) : null;
          const textEl = shapeEl ? shapeEl.querySelector('.diagram-shape-text') : null;
          if (textEl) {
            textEl.setAttribute('contenteditable', 'true');
            rt.editingShapeId = rt.selectedShapeId;
            updateDiagramSelectionClasses(widget, appState.activeDiagramId);
            appState.activeShapeContext = {
              diagId: appState.activeDiagramId,
              shapeId: rt.selectedShapeId,
              textEl
            };
            const sel = window.getSelection();
            if (!sel || !textEl.contains(sel.anchorNode)) {
              const r = document.createRange();
              r.selectNodeContents(textEl);
              sel.removeAllRanges();
              sel.addRange(r);
              appState.savedRange = r.cloneRange();
            }
            return textEl;
          }
        }
      }
      return null;
    }

    function applyDirectSizeFormat(size) {
      const shapeTextEl = ensureShapeTextReadyForFormatting();
      const rootEl = shapeTextEl || getActiveEditableRoot();
      if (!rootEl) return;
      restoreSavedSelection();

      const sel = window.getSelection();
      if (!sel) return;

      const blockClassMap = {
        grande: 'txt-grande',
        mediano: 'txt-mediano',
        chico: 'txt-chico'
      };
      const targetBlockClass = blockClassMap[size] || 'txt-mediano';

      if (rootEl.childNodes.length === 0 || (rootEl.childNodes.length === 1 && rootEl.firstChild.nodeName === 'BR')) {
        rootEl.innerHTML = `<div class="${targetBlockClass}"><br></div>`;
        const range = document.createRange();
        range.setStart(rootEl.firstChild, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        setSizeCheckmarks(size);
        persistShapeTextIfActive();
        handleLiveSheetInput();
        return;
      }

      let node = (sel.rangeCount > 0 && rootEl.contains(sel.anchorNode)) ? sel.anchorNode : rootEl.lastChild;
      if (node === rootEl && sel.rangeCount > 0 && rootEl.childNodes.length > 0) {
        const idx = Math.max(0, Math.min(sel.anchorOffset, rootEl.childNodes.length - 1));
        node = rootEl.childNodes[idx];
      }
      const block = getOrWrapActiveLineBlock(rootEl, node);
      if (block && block !== rootEl && !block.classList.contains('diagram-widget')) {
        block.classList.remove('txt-grande', 'txt-mediano', 'txt-chico');
        block.classList.add(targetBlockClass);
        block.querySelectorAll('.inline-grande, .inline-mediano, .inline-chico').forEach(sp => {
          sp.classList.remove('inline-grande', 'inline-mediano', 'inline-chico');
        });
        if ((block.textContent || '') === '' && !block.querySelector('br, .diagram-widget, .table-widget, .code-widget, .math-widget')) {
          block.innerHTML = '<br>';
          const nr = document.createRange();
          nr.setStart(block, 0);
          nr.collapse(true);
          sel.removeAllRanges();
          sel.addRange(nr);
          saveCurrentSelection();
        }
      }

      setSizeCheckmarks(size);
      persistShapeTextIfActive();
      handleLiveSheetInput();
      showToast(`Tamaño: ${size.charAt(0).toUpperCase() + size.slice(1)}`);
    }

    function applyDirectFormat(type) {
      const shapeTextEl = ensureShapeTextReadyForFormatting();
      const rootEl = shapeTextEl || getActiveEditableRoot();
      if (!rootEl) return;
      restoreSavedSelection();

      // If formatting inside a shape and selection is collapsed, select the shape's contents so B/I/S/Highlight formats the shape text immediately
      const sel = window.getSelection();
      if (shapeTextEl && sel && sel.isCollapsed && (shapeTextEl.innerText || '').trim().length > 0) {
        const r = document.createRange();
        r.selectNodeContents(shapeTextEl);
        sel.removeAllRanges();
        sel.addRange(r);
      }

      if (type === 'bold') {
        document.execCommand('bold', false, null);
      } else if (type === 'italic') {
        document.execCommand('italic', false, null);
      } else if (type === 'underline') {
        document.execCommand('underline', false, null);
      } else if (type === 'strike') {
        document.execCommand('strikeThrough', false, null);
      } else if (type === 'highlight') {
        normalizeHighlightsInEditor(rootEl);

        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const startHl = getEnclosingHighlightElement(range.startContainer, rootEl);
        const endHl = getEnclosingHighlightElement(range.endContainer, rootEl);
        const alreadyHighlighted = Boolean(startHl && endHl);

        if (sel.isCollapsed) {
          if (alreadyHighlighted && startHl) {
            startHl.style.backgroundColor = '';
            startHl.style.color = '';
            startHl.classList.remove('hl-yellow');
            normalizeHighlightsInEditor(rootEl);
            appState.highlightTypingActive = false;
            updateHighlightButtonVisual(false);
          } else {
            document.execCommand('hiliteColor', false, '#fef08a');
            appState.highlightTypingActive = true;
            updateHighlightButtonVisual(true);
          }
        } else {
          if (alreadyHighlighted) {
            document.execCommand('hiliteColor', false, 'transparent');
            normalizeHighlightsInEditor(rootEl);
            updateHighlightButtonVisual(false);
          } else {
            document.execCommand('hiliteColor', false, '#fef08a');
            normalizeHighlightsInEditor(rootEl);
            updateHighlightButtonVisual(true);
          }
        }
      } else if (type === 'code') {
        insertCodeWidgetWithLang('javascript');
        return;
      }

      persistShapeTextIfActive();
      handleLiveSheetInput();
    }

    function handleListTabIndent(isOutdent, rootEl) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const anchorEl = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      const li = anchorEl ? anchorEl.closest('li') : null;
      if (!li || !rootEl.contains(li)) return;

      if (isOutdent) {
        document.execCommand('outdent', false, null);
      } else {
        const parentList = li.parentElement;
        const prevLi = li.previousElementSibling;
        if (parentList && (parentList.tagName === 'OL' || parentList.tagName === 'UL') && prevLi && prevLi.tagName === 'LI') {
          let subList = prevLi.querySelector(':scope > ' + parentList.tagName.toLowerCase());
          if (!subList) {
            subList = document.createElement(parentList.tagName.toLowerCase());
            prevLi.appendChild(subList);
          }
          subList.appendChild(li);
          const r = document.createRange();
          r.selectNodeContents(li);
          r.collapse(false);
          sel.removeAllRanges();
          sel.addRange(r);
        } else {
          document.execCommand('indent', false, null);
        }
      }

      // Strip explicit top-level list class from nested child lists so CSS 1. -> a. -> i. cascade applies cleanly
      rootEl.querySelectorAll('ol ol, ul ul').forEach(sub => {
        sub.classList.remove('list-decimal-style', 'list-disc-style', 'list-circle-style', 'list-square-style', 'list-dash-style', 'list-alpha-style', 'list-roman-style');
      });

      handleLiveSheetInput();
      const t = getActiveTab();
      if (t) scheduleHistorySnapshot(t.id, true);
    }

    function applyListType(styleType) {
      const shapeTextEl = ensureShapeTextReadyForFormatting();
      const rootEl = shapeTextEl || getActiveEditableRoot();
      if (!rootEl) return;
      restoreSavedSelection();

      const listClassMap = {
        'disc':        { ordered: false, cls: 'list-disc-style' },
        'circle':      { ordered: false, cls: 'list-circle-style' },
        'square':      { ordered: false, cls: 'list-square-style' },
        'dash':        { ordered: false, cls: 'list-dash-style' },
        'decimal':     { ordered: true,  cls: 'list-decimal-style' },
        'lower-alpha': { ordered: true,  cls: 'list-alpha-style' },
        'lower-roman': { ordered: true,  cls: 'list-roman-style' }
      };
      const spec = listClassMap[styleType] || listClassMap['disc'];
      const isOrdered = spec.ordered;
      const targetClass = spec.cls;

      const sel = window.getSelection();
      let existingList = null;
      if (sel && sel.rangeCount > 0) {
        let node = sel.anchorNode;
        while (node && node !== rootEl) {
          if (node.nodeType === 1 && (node.tagName === 'UL' || node.tagName === 'OL')) {
            existingList = node;
            break;
          }
          node = node.parentNode;
        }
      }

      if (existingList) {
        const desiredTag = isOrdered ? 'OL' : 'UL';
        if (existingList.tagName !== desiredTag) {
          const replacementList = document.createElement(desiredTag);
          replacementList.innerHTML = existingList.innerHTML;
          replacementList.className = targetClass;
          existingList.replaceWith(replacementList);
        } else if (!existingList.classList.contains(targetClass)) {
          // Switching to a different style of the same list kind (e.g. disc -> square or 1. -> a.)
          existingList.className = targetClass;
        } else {
          // Clicking the exact same active style toggles the list off
          document.execCommand(isOrdered ? 'insertOrderedList' : 'insertUnorderedList', false, null);
        }
      } else {
        document.execCommand(isOrdered ? 'insertOrderedList' : 'insertUnorderedList', false, null);
        const newSel = window.getSelection();
        if (newSel && newSel.rangeCount > 0) {
          let n = newSel.anchorNode;
          while (n && n !== rootEl) {
            if (n.nodeType === 1 && (n.tagName === 'UL' || n.tagName === 'OL')) {
              n.className = targetClass;
              break;
            }
            n = n.parentNode;
          }
        }
      }

      persistShapeTextIfActive();
      handleLiveSheetInput();
    }

    function renderActiveSheet() {
      const tab = getActiveTab();
      const editor = document.getElementById('liveSheetEditor');
      if (editor && tab) {
        editor.innerHTML = tab.html || '<div><br></div>';
        normalizeHighlightsInEditor(editor);
        mountAllDiagramsInEditor();
        mountAllTablesInEditor();
        mountAllCodeWidgetsInEditor();
        mountAllMathWidgetsInEditor();
        if (!tabHistory[tab.id]) {
          tabHistory[tab.id] = { undo: [editor.innerHTML], redo: [] };
        }
      }
      updateLineNumbersGutter();
      updateCursorMetrics();
      applyVisualPreferences();
    }

    function applyVisualPreferences() {
      const editor = document.getElementById('liveSheetEditor');
      const gutter = document.getElementById('lineNumbersGutter');
      const statusBar = document.getElementById('classicStatusBar');

      const computedPx = Math.round(17 * (appState.zoomPercent / 100));
      if (editor) {
        editor.style.fontSize = `${computedPx}px`;
        editor.style.whiteSpace = appState.wordWrap ? 'pre-wrap' : 'pre';
        editor.setAttribute('spellcheck', appState.autocorrect ? 'true' : 'false');
      }
      const splitEd = document.getElementById('splitSheetEditor');
      if (splitEd) { splitEd.style.fontSize = `${computedPx}px`; splitEd.setAttribute('spellcheck', appState.autocorrect ? 'true' : 'false'); }
      const checkAc = document.getElementById('menuCheckAutocomplete');
      if (checkAc) checkAc.textContent = appState.wordAutocomplete ? '✓' : '';
      const checkAuto = document.getElementById('menuCheckAutocorrect');
      if (checkAuto) checkAuto.textContent = appState.autocorrect ? '✓' : '';
      if (gutter) {
        gutter.style.fontSize = `${computedPx}px`;
        gutter.classList.toggle('hidden', !appState.showLineNumbers);
      }
      if (statusBar) {
        statusBar.classList.toggle('hidden', !appState.showStatusBar);
      }

      document.getElementById('menuCheckWrap').textContent = appState.wordWrap ? '✓' : '';
      document.getElementById('menuCheckLines').textContent = appState.showLineNumbers ? '✓' : '';
      document.getElementById('menuCheckStatus').textContent = appState.showStatusBar ? '✓' : '';
      document.getElementById('menuCheckDarkMode').textContent = appState.darkMode ? '✓' : '';

      document.getElementById('statusWrapLabel').textContent = `Ajuste de línea: ${appState.wordWrap ? 'Sí' : 'No'}`;
      document.getElementById('statusZoomLabel').textContent = `${appState.zoomPercent}%`;
    }

    // ==========================================
    // MENU BAR OPERATIONS
    // ==========================================
    function toggleMenu(menuId) {
      const menus = ['menuArchivo', 'menuEdicion', 'menuFormato', 'menuVer', 'menuTextFormats', 'menuListTypes', 'menuInsertWidgets', 'menuFindHighlight'];
      menus.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === menuId) {
          el.classList.toggle('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    }

    function closeAllMenus() {
      closeAllWidgetDropdowns();
      closeScienceAutocomplete();
      ['menuArchivo', 'menuEdicion', 'menuFormato', 'menuVer', 'menuTextFormats', 'menuListTypes', 'menuInsertWidgets', 'menuFindHighlight'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });
      closeTabContextMenu();
    }

    // undoEdit() and redoEdit() are powered by the unified per-tab History Stack above

    function cutSelection() {
      const rootEl = getActiveEditableRoot();
      if (!rootEl) return;
      rootEl.focus();
      document.execCommand('cut');
      persistShapeTextIfActive();
      handleLiveSheetInput();
      showToast('Texto cortado');
    }

    function copySelectionOrAll() {
      const sel = window.getSelection();
      const text = (sel && sel.toString()) ? sel.toString() : getPlainTextFromEditor();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
        } else {
          document.execCommand('copy');
        }
      } catch (e) {}
      showToast('✓ Copiado al portapapeles');
    }

    function selectAllText() {
      const rootEl = getActiveEditableRoot();
      if (!rootEl) return;
      rootEl.focus();
      const range = document.createRange();
      range.selectNodeContents(rootEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      updateCursorMetrics();
    }

    function transformSelectionCase(mode) {
      const sel = window.getSelection();
      if (!sel || !sel.toString()) {
        showToast('Seleccioná texto primero para cambiar mayúsculas/minúsculas');
        return;
      }
      const converted = mode === 'upper' ? sel.toString().toUpperCase() : sel.toString().toLowerCase();
      document.execCommand('insertText', false, converted);
      persistShapeTextIfActive();
      handleLiveSheetInput();
    }

    function toggleWordWrap() {
      appState.wordWrap = !appState.wordWrap;
      saveTabsToStorage();
      applyVisualPreferences();
      showToast(`Ajuste de línea: ${appState.wordWrap ? 'Activado' : 'Desactivado'}`);
    }

    function changeZoom(delta) {
      appState.zoomPercent = Math.min(200, Math.max(70, appState.zoomPercent + delta));
      saveTabsToStorage();
      applyVisualPreferences();
    }

    function resetZoom() {
      appState.zoomPercent = 100;
      saveTabsToStorage();
      applyVisualPreferences();
    }

    function toggleLineNumbers() {
      appState.showLineNumbers = !appState.showLineNumbers;
      saveTabsToStorage();
      applyVisualPreferences();
    }

    function toggleStatusBar() {
      appState.showStatusBar = !appState.showStatusBar;
      saveTabsToStorage();
      applyVisualPreferences();
    }

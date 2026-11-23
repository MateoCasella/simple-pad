// ==========================================
    // SPLIT VIEW (VISTA DIVIDIDA)
    // ==========================================
    function triggerSplitFromContextMenu() {
      const tid = appState.contextMenuTabId;
      closeTabContextMenu();
      if (!tid) return;
      appState.splitTabId = tid;
      toggleSplitView(true);
    }

    function toggleSplitView(forceState) {
      const next = typeof forceState === 'boolean' ? forceState : !appState.splitView;
      appState.splitView = next;
      if (next) {
        if (!appState.splitTabId || !appState.tabs.some(t => t.id === appState.splitTabId)) {
          const other = appState.tabs.find(t => t.id !== appState.activeTabId) || appState.tabs[0];
          appState.splitTabId = other ? other.id : null;
        }
      }
      renderSplitPane();
      const chk = document.getElementById('menuCheckSplit');
      if (chk) chk.textContent = appState.splitView ? '✓' : '';
      showToast(appState.splitView ? 'Vista dividida activada' : 'Vista dividida cerrada');
    }

    function selectSplitTab(tabId) {
      appState.splitTabId = tabId;
      renderSplitPane();
    }

    function renderSplitPane() {
      const container = document.getElementById('splitPaneContainer');
      const selectEl = document.getElementById('splitTabSelect');
      const editorEl = document.getElementById('splitSheetEditor');
      const chk = document.getElementById('menuCheckSplit');
      if (chk) chk.textContent = appState.splitView ? '✓' : '';
      if (!container || !selectEl || !editorEl) return;

      if (!appState.splitView) {
        container.classList.add('hidden');
        return;
      }

      if (!appState.splitTabId || !appState.tabs.some(t => t.id === appState.splitTabId)) {
        const fallback = appState.tabs.find(t => t.id !== appState.activeTabId) || appState.tabs[0];
        appState.splitTabId = fallback ? fallback.id : null;
      }

      container.classList.remove('hidden');
      selectEl.innerHTML = appState.tabs.map(t =>
        `<option value="${t.id}" ${t.id === appState.splitTabId ? 'selected' : ''}>${escapeHtml(t.title || 'Sin título.txt')}</option>`
      ).join('');

      const targetTab = appState.tabs.find(t => t.id === appState.splitTabId);
      if (targetTab) {
        editorEl.innerHTML = targetTab.html || '<div><br></div>';
        const px = Math.round(15 * (appState.zoomPercent / 100));
        editorEl.style.fontSize = `${px}px`;
        editorEl.style.whiteSpace = appState.wordWrap ? 'pre-wrap' : 'pre';
      }
    }

    function handleSplitSheetInput() {
      const editorEl = document.getElementById('splitSheetEditor');
      if (!editorEl || !appState.splitTabId) return;
      const targetTab = appState.tabs.find(t => t.id === appState.splitTabId);
      if (!targetTab) return;
      targetTab.html = editorEl.innerHTML;
      saveTabsToStorage();
      if (targetTab.id === appState.activeTabId) {
        const mainEd = document.getElementById('liveSheetEditor');
        if (mainEd) mainEd.innerHTML = targetTab.html;
        updateCursorMetrics();
      }
    }

    // ==========================================
    // GLOBAL SEARCH ACROSS ALL TABS (CTRL+SHIFT+F)
    // ==========================================
    function openGlobalSearchModal() {
      closeAllMenus();
      const modal = document.getElementById('globalSearchModal');
      const input = document.getElementById('globalSearchInput');
      if (!modal || !input) return;
      modal.classList.remove('hidden');
      input.focus();
      input.select();
      runGlobalSearch();
    }

    function closeGlobalSearchModal() {
      const modal = document.getElementById('globalSearchModal');
      if (modal) modal.classList.add('hidden');
    }

    function toggleGlobalSearchCase() {
      appState.globalSearchCase = !appState.globalSearchCase;
      const btn = document.getElementById('btnGlobalSearchCase');
      if (btn) {
        btn.classList.toggle('bg-sky-100', appState.globalSearchCase);
        btn.classList.toggle('dark:bg-sky-900/50', appState.globalSearchCase);
        btn.classList.toggle('text-sky-700', appState.globalSearchCase);
        btn.classList.toggle('dark:text-sky-300', appState.globalSearchCase);
      }
      runGlobalSearch();
    }

    function extractPlainLinesFromHtml(htmlStr) {
      const tmp = document.createElement('div');
      tmp.innerHTML = htmlStr || '';
      const text = (tmp.innerText || tmp.textContent || '').replace(/\r/g, '');
      return text.split('\n');
    }

    function runGlobalSearch() {
      const input = document.getElementById('globalSearchInput');
      const resultsEl = document.getElementById('globalSearchResults');
      const statusEl = document.getElementById('globalSearchStatus');
      if (!input || !resultsEl || !statusEl) return;

      const query = input.value;
      if (!query.trim()) {
        resultsEl.innerHTML = `<div class="h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 text-xs select-none">Ingresá un término para buscar en todas las pestañas.</div>`;
        statusEl.textContent = `${appState.tabs.length} pestaña${appState.tabs.length === 1 ? '' : 's'} abierta${appState.tabs.length === 1 ? '' : 's'}`;
        return;
      }

      const needle = appState.globalSearchCase ? query : query.toLowerCase();
      let totalMatches = 0;
      let matchedFiles = 0;
      let htmlOut = '';

      appState.tabs.forEach(tab => {
        const lines = extractPlainLinesFromHtml(tab.html || '');
        const fileHits = [];
        lines.forEach((line, idx) => {
          const hay = appState.globalSearchCase ? line : line.toLowerCase();
          const pos = hay.indexOf(needle);
          if (pos !== -1) {
            fileHits.push({ lineNum: idx + 1, lineText: line.trim(), pos });
          }
        });

        if (fileHits.length > 0) {
          matchedFiles++;
          totalMatches += fileHits.length;
          htmlOut += `
            <div class="border-b border-slate-200/80 dark:border-zinc-800">
              <div class="px-3 py-1.5 bg-slate-50 dark:bg-[#18181c] text-[11px] font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-between">
                <span>${escapeHtml(tab.title || 'Sin título.txt')}</span>
                <span class="text-[10px] font-normal text-slate-400">${fileHits.length} coincidencia${fileHits.length === 1 ? '' : 's'}</span>
              </div>
              <div class="divide-y divide-slate-100 dark:divide-zinc-800/60">
                ${fileHits.map(hit => {
                  const safeLine = escapeHtml(hit.lineText.slice(0, 140));
                  const safeQ = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const highlighted = safeLine.replace(new RegExp(safeQ, appState.globalSearchCase ? 'g' : 'gi'), m => `<mark class="bg-yellow-200 dark:bg-yellow-500/40 text-slate-900 dark:text-white rounded-xs px-0.5">${m}</mark>`);
                  return `
                    <button type="button" onclick="jumpToGlobalSearchMatch('${tab.id}', '${encodeURIComponent(query)}')" class="w-full px-3 py-1.5 text-left hover:bg-sky-50 dark:hover:bg-sky-950/30 flex items-baseline gap-2.5 transition">
                      <span class="text-[10px] text-slate-400 shrink-0 w-10">Lín ${hit.lineNum}</span>
                      <span class="text-[11.5px] text-slate-700 dark:text-zinc-300 truncate">${highlighted}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }
      });

      if (totalMatches === 0) {
        resultsEl.innerHTML = `<div class="h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 text-xs select-none">Sin coincidencias para "${escapeHtml(query)}".</div>`;
      } else {
        resultsEl.innerHTML = htmlOut;
      }
      statusEl.textContent = `${totalMatches} coincidencia${totalMatches === 1 ? '' : 's'} en ${matchedFiles} archivo${matchedFiles === 1 ? '' : 's'}`;
    }

    function jumpToGlobalSearchMatch(tabId, encodedQuery) {
      const q = decodeURIComponent(encodedQuery || '');
      closeGlobalSearchModal();
      switchTab(tabId);
      if (q) {
        toggleFindReplaceBar(true);
        const fi = document.getElementById('findInput');
        if (fi) {
          fi.value = q;
          runFindPreview();
          findNextMatch();
        }
      }
    }

    function downloadAllTabsBackup() {
      const payload = JSON.stringify({
        exportedAt: new Date().toISOString(),
        tabs: appState.tabs,
        trash: appState.trash
      }, null, 2);
      const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sesion_bloc_de_notas.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('⬇ Backup de pestañas descargado');
    }

    // ==========================================
    // FIND & REPLACE ENGINE (ACCESSIBLE ONLY VIA CTRL+F)
    // ==========================================
    let findMatchRanges = [];
    let findCurrentIdx = -1;

    function clearLiveFindHighlights() {
      if (typeof CSS !== 'undefined' && CSS.highlights) {
        CSS.highlights.delete('find-all');
        CSS.highlights.delete('find-current');
      }
      document.querySelectorAll('.diagram-shape.shape-find-match').forEach(el => {
        el.classList.remove('shape-find-match');
      });
    }

    function toggleReplaceSection(forceOpen) {
      const row = document.getElementById('replaceRowContainer');
      const btn = document.getElementById('btnToggleReplaceRow');
      if (!row) return;
      const open = typeof forceOpen === 'boolean' ? forceOpen : row.classList.contains('hidden');
      row.classList.toggle('hidden', !open);
      if (btn) {
        btn.classList.toggle('bg-white', open);
        btn.classList.toggle('dark:bg-zinc-700', open);
        btn.classList.toggle('text-sky-600', open);
        btn.classList.toggle('dark:text-sky-400', open);
      }
      if (open) {
        const rep = document.getElementById('replaceInput');
        if (rep) rep.focus();
      }
    }

    function syncDiagramStateForDomNode(domNode) {
      if (!domNode) return;
      const el = domNode.nodeType === 3 ? domNode.parentElement : domNode;
      if (!el) return;
      const shapeEl = el.closest('.diagram-shape');
      const widget = el.closest('.diagram-widget');
      if (shapeEl && widget) {
        const shapeId = shapeEl.getAttribute('data-shape-id');
        const textEl = shapeEl.querySelector('.diagram-shape-text');
        if (shapeId && textEl) {
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

    function toggleFindReplaceBar(forceOpen, openReplace) {
      const bar = document.getElementById('findReplaceBar');
      if (!bar) return;
      const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : bar.classList.contains('hidden');
      bar.classList.toggle('hidden', !shouldOpen);
      if (shouldOpen) {
        if (typeof openReplace === 'boolean') toggleReplaceSection(openReplace);
        const input = document.getElementById('findInput');
        if (input) {
          input.focus();
          input.select();
          runFindPreview();
        }
      } else {
        clearLiveFindHighlights();
        findMatchRanges = [];
        findCurrentIdx = -1;
      }
    }

    function toggleFindOption(opt) {
      if (opt === 'case') {
        appState.findCaseSensitive = !appState.findCaseSensitive;
        const btn = document.getElementById('btnToggleCase');
        btn.className = appState.findCaseSensitive
          ? 'px-1 py-0.5 rounded text-[10px] font-bold bg-slate-700 dark:bg-zinc-200 text-white dark:text-zinc-900 shrink-0'
          : 'px-1 py-0.5 rounded text-[10px] font-bold border border-transparent text-slate-500 hover:bg-slate-200/70 dark:hover:bg-zinc-800 shrink-0';
      } else if (opt === 'regex') {
        appState.findUseRegex = !appState.findUseRegex;
        const btn = document.getElementById('btnToggleRegex');
        btn.className = appState.findUseRegex
          ? 'px-1 py-0.5 rounded text-[10px] font-bold bg-slate-700 dark:bg-zinc-200 text-white dark:text-zinc-900 shrink-0'
          : 'px-1 py-0.5 rounded text-[10px] font-bold border border-transparent text-slate-500 hover:bg-slate-200/70 dark:hover:bg-zinc-800 shrink-0';
      }
      runFindPreview();
    }

    function buildSearchRegex(query, globalFlag) {
      if (!query) return null;
      const flags = (globalFlag ? 'g' : '') + (appState.findCaseSensitive ? '' : 'i');
      try {
        const pattern = appState.findUseRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(pattern, flags);
      } catch (e) {
        return null;
      }
    }

    function collectFindMatchesInEditor(regex) {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor || !regex) return [];
      const matches = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.nodeValue) continue;
        if (node.parentElement && (node.parentElement.closest('.diagram-toolbar') || node.parentElement.closest('.code-widget'))) continue;
        regex.lastIndex = 0;
        let m;
        while ((m = regex.exec(node.nodeValue)) !== null) {
          if (m[0].length === 0) {
            regex.lastIndex++;
            continue;
          }
          matches.push({ node, start: m.index, end: m.index + m[0].length, text: m[0] });
        }
      }
      return matches;
    }

    function paintLiveFindHighlights() {
      clearLiveFindHighlights();
      if (typeof CSS === 'undefined' || !CSS.highlights || typeof Highlight === 'undefined') return;
      if (!findMatchRanges.length) return;
      const allRanges = [];
      let curRange = null;
      findMatchRanges.forEach((m, idx) => {
        try {
          const r = document.createRange();
          r.setStart(m.node, m.start);
          r.setEnd(m.node, m.end);
          allRanges.push(r);
          if (idx === findCurrentIdx) curRange = r;
        } catch (e) {}
      });
      if (allRanges.length) CSS.highlights.set('find-all', new Highlight(...allRanges));
      if (curRange) CSS.highlights.set('find-current', new Highlight(curRange));
      const curMatch = findMatchRanges[findCurrentIdx];
      if (curMatch && curMatch.node && curMatch.node.parentElement) {
        const shapeEl = curMatch.node.parentElement.closest('.diagram-shape');
        if (shapeEl) shapeEl.classList.add('shape-find-match');
      }
    }

    function scrollMatchIntoView(matchObj) {
      if (!matchObj || !matchObj.node) return;
      try {
        const r = document.createRange();
        r.setStart(matchObj.node, matchObj.start);
        r.setEnd(matchObj.node, matchObj.end);
        const rect = r.getBoundingClientRect();
        if (rect && rect.height > 0 && matchObj.node.parentElement) {
          matchObj.node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (e) {}
    }

    function runFindPreview() {
      const input = document.getElementById('findInput');
      const counter = document.getElementById('findMatchCounter');
      const query = input ? input.value : '';
      if (!query) {
        findMatchRanges = [];
        findCurrentIdx = -1;
        clearLiveFindHighlights();
        if (counter) counter.textContent = '0/0';
        return;
      }
      const regex = buildSearchRegex(query, true);
      if (!regex) {
        findMatchRanges = [];
        findCurrentIdx = -1;
        clearLiveFindHighlights();
        if (counter) counter.textContent = 'Err';
        return;
      }
      findMatchRanges = collectFindMatchesInEditor(regex);
      findCurrentIdx = findMatchRanges.length > 0 ? 0 : -1;
      if (counter) {
        counter.textContent = findMatchRanges.length > 0
          ? `${findCurrentIdx + 1}/${findMatchRanges.length}`
          : '0/0';
      }
      paintLiveFindHighlights();
      updateMultiHighlightCheckIndicator();
    }

    function findNextMatch() {
      const query = document.getElementById('findInput').value;
      if (!query) return;
      if (findMatchRanges.length === 0) runFindPreview();
      if (findMatchRanges.length === 0) {
        showToast('No se encontraron coincidencias');
        return;
      }
      findCurrentIdx = (findCurrentIdx + 1) % findMatchRanges.length;
      const counter = document.getElementById('findMatchCounter');
      if (counter) counter.textContent = `${findCurrentIdx + 1}/${findMatchRanges.length}`;
      paintLiveFindHighlights();
      scrollMatchIntoView(findMatchRanges[findCurrentIdx]);
    }

    function findPrevMatch() {
      const query = document.getElementById('findInput').value;
      if (!query) return;
      if (findMatchRanges.length === 0) runFindPreview();
      if (findMatchRanges.length === 0) {
        showToast('No se encontraron coincidencias');
        return;
      }
      findCurrentIdx = (findCurrentIdx - 1 + findMatchRanges.length) % findMatchRanges.length;
      const counter = document.getElementById('findMatchCounter');
      if (counter) counter.textContent = `${findCurrentIdx + 1}/${findMatchRanges.length}`;
      paintLiveFindHighlights();
      scrollMatchIntoView(findMatchRanges[findCurrentIdx]);
    }

    function unwrapHighlightSpan(span) {
      if (!span || !span.parentNode) return false;
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
      parent.normalize();
      syncDiagramStateForDomNode(parent);
      return true;
    }

    function getEnclosingYellowSpan(node) {
      if (!node) return null;
      const el = node.nodeType === 3 ? node.parentElement : node;
      if (!el) return null;
      return el.closest('span.hl-yellow');
    }

    function updateMultiHighlightCheckIndicator() {
      const chk = document.getElementById('checkFindMultiHl');
      if (!chk) return;
      const allHighlighted = findMatchRanges.length > 0 && findMatchRanges.every(m => Boolean(getEnclosingYellowSpan(m.node)));
      chk.textContent = allHighlighted ? '✓' : '';
    }

    function wrapMatchWithYellowHighlight(matchObj, isMulti) {
      if (!matchObj || !matchObj.node || !document.body.contains(matchObj.node)) return false;
      if (getEnclosingYellowSpan(matchObj.node)) return false;
      try {
        const r = document.createRange();
        r.setStart(matchObj.node, matchObj.start);
        r.setEnd(matchObj.node, matchObj.end);
        const span = document.createElement('span');
        span.className = 'hl-yellow';
        if (isMulti) span.setAttribute('data-multi-hl', 'true');
        span.style.backgroundColor = '#fef08a';
        span.style.color = '#0f172a';
        r.surroundContents(span);
        syncDiagramStateForDomNode(span);
        return true;
      } catch (e) {
        return false;
      }
    }

    function highlightCurrentFindMatch() {
      const query = document.getElementById('findInput').value;
      if (!query) {
        showToast('Escribí una palabra primero');
        return;
      }
      if (findMatchRanges.length === 0) runFindPreview();
      if (findMatchRanges.length === 0) {
        showToast('No hay coincidencias para resaltar');
        return;
      }
      const idx = findCurrentIdx >= 0 ? findCurrentIdx : 0;
      const target = findMatchRanges[idx];
      const existingSpan = getEnclosingYellowSpan(target.node);
      if (existingSpan) {
        unwrapHighlightSpan(existingSpan);
        handleLiveSheetInput();
        runFindPreview();
        { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
      showToast('Resaltado quitado');
        return;
      }
      const ok = wrapMatchWithYellowHighlight(target, false);
      if (ok) {
        handleLiveSheetInput();
        runFindPreview();
        { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
      showToast('Palabra resaltada en amarillo');
      }
    }

    function highlightAllFindMatches() {
      const query = document.getElementById('findInput').value;
      if (!query) {
        showToast('Escribí una palabra primero');
        return;
      }
      const regex = buildSearchRegex(query, true);
      if (!regex) return;
      const matches = collectFindMatchesInEditor(regex);
      if (matches.length === 0) {
        showToast('No hay coincidencias para resaltar');
        return;
      }

      // Toggle behavior: if all matches are already highlighted, unwrap them back to normal!
      const alreadyAllHighlighted = matches.every(m => Boolean(getEnclosingYellowSpan(m.node)));
      if (alreadyAllHighlighted) {
        const spansToUnwrap = new Set();
        matches.forEach(m => {
          const sp = getEnclosingYellowSpan(m.node);
          if (sp) spansToUnwrap.add(sp);
        });
        let removed = 0;
        spansToUnwrap.forEach(sp => {
          if (unwrapHighlightSpan(sp)) removed++;
        });
        handleLiveSheetInput();
        runFindPreview();
        showToast(`Resaltado múltiple quitado (${removed})`);
        return;
      }

      // Otherwise highlight all unhighlighted matches in reverse order so offsets stay valid
      let count = 0;
      for (let i = matches.length - 1; i >= 0; i--) {
        if (wrapMatchWithYellowHighlight(matches[i], true)) count++;
      }
      if (count > 0) {
        handleLiveSheetInput();
        runFindPreview();
        showToast(`${count} coincidencia${count === 1 ? '' : 's'} resaltada${count === 1 ? '' : 's'}`);
      }
    }

    function openShortcutsGuideModal(sectionId) {
      closeAllMenus();
      const modal = document.getElementById('shortcutsGuideModal');
      if (!modal) return;
      modal.classList.remove('hidden');
      if (sectionId) {
        const sec = document.getElementById(sectionId);
        if (sec) setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
      }
    }

    function closeShortcutsGuideModal() {
      const modal = document.getElementById('shortcutsGuideModal');
      if (modal) modal.classList.add('hidden');
    }

    function replaceAcrossBlocksAndNodes(editor, regex, singleRegex, replacement, onlyFirst) {
      let replacedCount = 0;
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
      const nodes = [];
      let current;
      while ((current = walker.nextNode())) {
        if (current.parentElement && (current.parentElement.closest('.diagram-toolbar') || current.parentElement.closest('.code-widget'))) continue;
        nodes.push(current);
      }
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (regex.test(n.nodeValue)) {
          if (onlyFirst) {
            n.nodeValue = n.nodeValue.replace(singleRegex, replacement);
            syncDiagramStateForDomNode(n);
            replacedCount = 1;
            break;
          } else {
            const matches = n.nodeValue.match(regex) || [];
            replacedCount += matches.length;
            n.nodeValue = n.nodeValue.replace(regex, replacement);
            syncDiagramStateForDomNode(n);
          }
        }
      }
      if (!onlyFirst || replacedCount === 0) {
        const blocks = editor.querySelectorAll('div, li, p, td, th, pre');
        const targets = blocks.length > 0 ? Array.from(blocks) : [editor];
        for (let b = 0; b < targets.length; b++) {
          const blk = targets[b];
          if (blk.closest('.diagram-widget') || blk.closest('.code-widget') || blk.closest('.table-widget')) continue;
          if (blk.querySelector('div, ul, ol, table')) continue;
          const plainBlk = blk.innerText || '';
          if (regex.test(plainBlk)) {
            if (onlyFirst) {
              blk.innerText = plainBlk.replace(singleRegex, replacement);
              replacedCount = 1;
              break;
            } else {
              const m = plainBlk.match(regex) || [];
              replacedCount += m.length;
              blk.innerText = plainBlk.replace(regex, replacement);
            }
          }
        }
      }
      return replacedCount;
    }

    function replaceNextMatch() {
      const query = document.getElementById('findInput').value;
      const replacement = document.getElementById('replaceInput').value;
      const editor = document.getElementById('liveSheetEditor');
      if (!query || !editor) return;
      const regex = buildSearchRegex(query, true);
      const singleRegex = buildSearchRegex(query, false);
      if (!regex || !singleRegex) return;
      const count = replaceAcrossBlocksAndNodes(editor, regex, singleRegex, replacement, true);
      if (count > 0) {
        handleLiveSheetInput();
        showToast('1 coincidencia reemplazada');
      } else {
        showToast('No hay coincidencias');
      }
    }

    function replaceAllMatches() {
      const query = document.getElementById('findInput').value;
      const replacement = document.getElementById('replaceInput').value;
      const editor = document.getElementById('liveSheetEditor');
      if (!query || !editor) return;
      const regex = buildSearchRegex(query, true);
      const singleRegex = buildSearchRegex(query, false);
      if (!regex || !singleRegex) return;
      const count = replaceAcrossBlocksAndNodes(editor, regex, singleRegex, replacement, false);
      if (count > 0) {
        handleLiveSheetInput();
        showToast(`✓ ${count} coincidencias reemplazadas`);
      } else {
        showToast('No hay coincidencias');
      }
    }

    // ==========================================
    // THEME (INSIDE VER MENU) & SHORTCUTS
    // ==========================================
    function applyTheme() {
      const root = document.documentElement;
      if (appState.darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      const isWin98 = appState.uiStyle !== 'modern';
      root.classList.toggle('theme-win98', isWin98);
      root.classList.toggle('theme-modern', !isWin98);

      const checkDark = document.getElementById('menuCheckDarkMode');
      if (checkDark) checkDark.textContent = appState.darkMode ? '✓' : '';
      const chkMod = document.getElementById('checkStyleModern');
      const chk98 = document.getElementById('checkStyleWin98');
      if (chkMod) chkMod.textContent = !isWin98 ? '✓' : '';
      if (chk98) chk98.textContent = isWin98 ? '✓' : '';
    }

    function syncDesktopTitleBarOverlay() {
      if (!window.simplePadDesktop || !window.simplePadDesktop.isDesktop) return;
      document.documentElement.classList.add('is-desktop');
      if (typeof window.simplePadDesktop.setTitleBarTheme === 'function') {
        const isWin98 = appState.uiStyle === 'win98';
        const isDark = Boolean(appState.darkMode);
        let color = '#ececef';
        let symbolColor = '#18181b';
        if (isWin98) {
          color = isDark ? '#0b4a7a' : '#1084d0';
          symbolColor = '#ffffff';
        } else if (isDark) {
          color = '#111114';
          symbolColor = '#f4f4f5';
        }
        window.simplePadDesktop.setTitleBarTheme({ color, symbolColor });
      }
    }

    function setUiStyle(styleName) {
      appState.uiStyle = styleName === 'modern' ? 'modern' : 'win98';
      applyTheme();
      syncDesktopTitleBarOverlay();
      if (typeof applyLanguage === 'function') applyLanguage(appState.lang || 'es', true);
      renderTabsStrip();
      saveTabsToStorage();
      showToast(appState.uiStyle === 'win98' ? t('Estilo: Clásico (Windows 98)', 'Style: Classic (Windows 98)') : t('Estilo: Moderno', 'Style: Modern'));
    }

    function toggleRetroFullscreen() {
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      } catch (e) {
        showToast('Usá F11 para pantalla completa');
      }
    }

    function toggleTheme() {
      appState.darkMode = !appState.darkMode;
      applyTheme();
      syncDesktopTitleBarOverlay();
      saveTabsToStorage();
      showToast(appState.darkMode ? t('🌙 Modo oscuro activado', '🌙 Dark mode enabled') : t('☀️ Modo claro activado', '☀️ Light mode enabled'));
    }

    let toastTimer = null;
    function showToast(text) {
      const el = document.getElementById('notepadToast');
      const span = document.getElementById('notepadToastText');
      if (!el || !span) return;
      span.textContent = text;
      el.classList.remove('hidden');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
    }

    function renderAll() {
      renderTabsStrip();
      renderActiveSheet();
      renderSplitPane();
    }

    window.addEventListener('keydown', function(e) {
      // Unified Undo / Redo (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z) across text, tables, diagrams, and code blocks
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const k = e.key.toLowerCase();
        const activeEl = document.activeElement;
        const inModalInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && !activeEl.closest('#liveSheetEditor');
        if (!inModalInput) {
          if (k === 'z' && !e.shiftKey) {
            e.preventDefault();
            undoEdit();
            return;
          }
          if (k === 'y' || (k === 'z' && e.shiftKey)) {
            e.preventDefault();
            redoEdit();
            return;
          }
        }
      }
      if (appState.activeDiagramId) {
        const activeEl = document.activeElement;
        const isTypingInInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true');
        if (!isTypingInInput) {
          const keyLow = e.key.toLowerCase();
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            deleteSelectedInDiagram(appState.activeDiagramId);
            return;
          }
          if ((e.ctrlKey || e.metaKey) && keyLow === 'c') {
            e.preventDefault();
            copySelectedInDiagram(appState.activeDiagramId);
            return;
          }
          if ((e.ctrlKey || e.metaKey) && keyLow === 'x') {
            e.preventDefault();
            cutSelectedInDiagram(appState.activeDiagramId);
            return;
          }
          if ((e.ctrlKey || e.metaKey) && keyLow === 'v') {
            if (appState.copiedDiagramShape) {
              e.preventDefault();
              pasteInDiagram(appState.activeDiagramId);
              return;
            }
          }
        }
      }

      if (appState.activeDiagramId && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const rt = getDiagramRuntime(appState.activeDiagramId);
        const activeEl = document.activeElement;
        const isTypingInInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true');
        if (rt && rt.selectedShapeId && !rt.editingShapeId && !isTypingInInput) {
          enterShapeTextEditing(appState.activeDiagramId, rt.selectedShapeId);
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'u') {
        const ae = document.activeElement;
        if (ae && (ae.id === 'liveSheetEditor' || ae.closest('#liveSheetEditor') || ae.closest('.diagram-shape-text'))) {
          e.preventDefault();
          applyDirectFormat('underline');
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        openGlobalSearchModal();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFindReplaceBar(true, false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        toggleFindReplaceBar(true, true);
      } else if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleSplitView();
      } else if (e.key === 'F1') {
        e.preventDefault();
        openShortcutsGuideModal();
      } else if (e.key === 'Escape') {
        closeGlobalSearchModal();
        closeShortcutsGuideModal();
        closeScienceCommandsModal();
        const bar = document.getElementById('findReplaceBar');
        if (bar && !bar.classList.contains('hidden')) {
          toggleFindReplaceBar(false);
        }
        closeAllMenus();
      } else if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewTab();
      } else if (e.altKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        closeActiveTab();
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        quickSaveActiveTab();
      } else if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        downloadActiveTab('txt');
      } else if (e.altKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        triggerOpenFile();
      } else if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheme();
      }
    });

    window.addEventListener('click', function(e) {
      const findBar = document.getElementById('findReplaceBar');
      if (findBar && !findBar.classList.contains('hidden')) {
        if (e.target.closest('#liveSheetEditor') || e.target.closest('#splitSheetEditor')) {
          toggleFindReplaceBar(false);
        }
      }
      if (!e.target.closest('#tokenCalculatorPopover') && !e.target.closest('#statusTokenCount')) {
        closeTokenCalculator();
      }
      if (!e.target.closest('.menu-trigger') && !e.target.closest('.dropdown-panel') && !e.target.closest('.widget-dropdown-wrap')) {
        closeAllMenus();
      }
      if (!e.target.closest('.diagram-dropdown-container')) {
        Object.keys(diagramRuntime).forEach(did => {
          if (diagramRuntime[did].openDropdown) {
            diagramRuntime[did].openDropdown = null;
            const w = getDiagramWidgetById(did);
            if (w) mountDiagramWidget(w);
          }
        });
      }
      if (!e.target.closest('.diagram-widget') && !e.target.closest('nav')) {
        setActiveDiagramFocus(null);
      }
    });

    // Capture-phase listeners so context menus close reliably even when widgets call stopPropagation() or when scrolling
    window.addEventListener('mousedown', function(e) {
      const diagMenu = document.getElementById('diagramContextMenu');
      if (diagMenu && !diagMenu.classList.contains('hidden') && !e.target.closest('#diagramContextMenu')) {
        closeDiagramContextMenu();
      }
      const tabMenu = document.getElementById('tabContextMenu');
      if (tabMenu && !tabMenu.classList.contains('hidden') && !e.target.closest('#tabContextMenu')) {
        closeTabContextMenu();
      }
      const cmdPop = document.getElementById('commandPalettePopup');
      if (cmdPop && !cmdPop.classList.contains('hidden') && !e.target.closest('#commandPalettePopup')) {
        closeCommandPalette();
      closeWordAutocomplete();
      }
    }, true);

    window.addEventListener('contextmenu', function(e) {
      if (!e.target.closest('.diagram-widget')) {
        closeDiagramContextMenu();
      }
    }, true);

    window.addEventListener('scroll', function(e) {
      const t = e && e.target;
      if (t && t.nodeType === 1 && t.closest && (
        t.closest('#commandPalettePopup') ||
        t.closest('#wordAutocompletePopup') ||
        t.closest('#scienceAutocompletePopup') ||
        t.closest('.widget-dropdown-menu')
      )) {
        return;
      }
      closeDiagramContextMenu();
      closeTabContextMenu();
      closeCommandPalette();
      closeWordAutocomplete();
      closeScienceAutocomplete();
    }, true);

        function bootSimplePad() {
      loadSavedTabs();
      applyTheme();
      if (typeof applyLanguage === 'function') applyLanguage(appState.lang || 'es', true);
      renderAll();
      if (window.ResizeObserver) {
        const edForObs = document.getElementById('liveSheetEditor');
        if (edForObs) {
          new ResizeObserver(() => scheduleLineNumbersUpdate()).observe(edForObs);
        }
      }
      // Load optional web fonts lazily AFTER first paint so startup is never blocked
      setTimeout(() => {
        if (navigator.onLine && !document.getElementById('simplePadWebFonts')) {
          const link = document.createElement('link');
          link.id = 'simplePadWebFonts';
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css2?family=Saira:wght@400;600;700&family=Share+Tech+Mono&display=swap';
          document.head.appendChild(link);
        }
      }, 250);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootSimplePad, { once: true });
    } else {
      bootSimplePad();
    }

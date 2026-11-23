// ==========================================
    // 2. INTERACTIVE TABLE WIDGET (WITH GREEN + ROW & COLUMN BUTTONS)
    // ==========================================
    function parseTableState(widget) {
      try {
        const raw = widget.getAttribute('data-state');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.headers) && Array.isArray(parsed.rows)) {
            return parsed;
          }
        }
      } catch (e) {}
      return {
        headers: ['', '', ''],
        rows: [
          ['', '', ''],
          ['', '', '']
        ]
      };
    }

    function saveTableStateFromDOM(widget) {
      const headers = Array.from(widget.querySelectorAll('thead th')).map(th => th.innerHTML);
      const rows = Array.from(widget.querySelectorAll('tbody tr')).map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td => td.innerHTML)
      );
      widget.setAttribute('data-state', JSON.stringify({ headers, rows }));
      const editor = document.getElementById('liveSheetEditor');
      const tab = getActiveTab();
      if (editor && tab) {
        tab.html = editor.innerHTML;
        saveTabsToStorage();
      }
    }

    function recordTableCellFocus(tblId, rowIdx, colIdx) {
      tableActiveCell[tblId] = { rowIdx, colIdx };
    }

    function mountTableWidget(widget) {
      let tblId = widget.getAttribute('data-table-id');
      if (!tblId) {
        tblId = 'tbl-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        widget.setAttribute('data-table-id', tblId);
      }
      widget.setAttribute('contenteditable', 'false');
      widget.onclick = (ev) => {
        if (ev.target === widget) {
          ev.stopPropagation();
          let nextEl = widget.nextElementSibling;
          if (!nextEl || nextEl.getAttribute('contenteditable') === 'false') {
            nextEl = document.createElement('div');
            nextEl.innerHTML = '<br>';
            widget.after(nextEl);
          }
          const range = document.createRange();
          range.selectNodeContents(nextEl);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.getElementById('liveSheetEditor').focus();
        }
      };
      const st = parseTableState(widget);

      const thsHtml = st.headers.map((h, cIdx) =>
        `<th contenteditable="true" spellcheck="false" onfocus="recordTableCellFocus('${tblId}', -1, ${cIdx})" onclick="recordTableCellFocus('${tblId}', -1, ${cIdx})" onkeydown="handleTableCellKeyDown(event, '${tblId}', -1, ${cIdx})" oninput="handleTableCellInput('${tblId}')">${h || '<br>'}</th>`
      ).join('');
      const trsHtml = st.rows.map((row, rIdx) => {
        const tds = row.map((c, cIdx) =>
          `<td contenteditable="true" spellcheck="false" onfocus="recordTableCellFocus('${tblId}', ${rIdx}, ${cIdx})" onclick="recordTableCellFocus('${tblId}', ${rIdx}, ${cIdx})" onkeydown="handleTableCellKeyDown(event, '${tblId}', ${rIdx}, ${cIdx})" oninput="handleTableCellInput('${tblId}')">${c || '<br>'}</td>`
        ).join('');
        return `<tr>${tds}</tr>`;
      }).join('');

      widget.innerHTML = `
        <div class="inline-flex flex-col items-start gap-1">
          <div class="flex items-start gap-1">
            <table>
              <thead><tr>${thsHtml}</tr></thead>
              <tbody>${trsHtml}</tbody>
            </table>
            <!-- Compact Column Icons (+ / −) -->
            <div class="flex flex-col gap-1 pt-0.5">
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); addColumnToTableWidget('${tblId}')" title="Agregar columna" aria-label="Agregar columna" class="btn-add-col w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); removeColumnFromTableWidget('${tblId}')" title="Eliminar columna" aria-label="Eliminar columna" class="btn-del-col w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>
          <div class="w-full flex items-center justify-between gap-2 pr-6">
            <!-- Compact Row Icons (+ / −) -->
            <div class="flex items-center gap-1">
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); addRowToTableWidget('${tblId}')" title="Agregar fila" aria-label="Agregar fila" class="btn-add-row w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); removeRowFromTableWidget('${tblId}')" title="Eliminar fila" aria-label="Eliminar fila" class="btn-del-row w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
            <!-- Compact Gray Copy & Delete Table Icons -->
            <div class="flex items-center gap-0.5">
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); copyTableWidget('${tblId}', this)" title="Copiar tabla (Ctrl+V para pegar)" aria-label="Copiar tabla" class="btn-copy-table w-5 h-5 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center transition">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); removeTableWidget('${tblId}')" title="Eliminar tabla" aria-label="Eliminar tabla" class="btn-remove-table w-5 h-5 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center transition">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function handleTableCellInput(tblId) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (widget) saveTableStateFromDOM(widget);
    }

    function focusTableCell(tblId, rowIdx, colIdx) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (!widget) return;
      let targetCell = null;
      if (rowIdx < 0) {
        const ths = widget.querySelectorAll('thead th');
        targetCell = ths[Math.min(Math.max(0, colIdx), ths.length - 1)];
      } else {
        const trs = widget.querySelectorAll('tbody tr');
        const tr = trs[Math.min(Math.max(0, rowIdx), trs.length - 1)];
        if (tr) {
          const tds = tr.querySelectorAll('td');
          targetCell = tds[Math.min(Math.max(0, colIdx), tds.length - 1)];
        }
      }
      if (targetCell) {
        targetCell.focus();
        const r = document.createRange();
        r.selectNodeContents(targetCell);
        r.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
    }

    function handleTableCellKeyDown(e, tblId, rowIdx, colIdx) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (!widget) return;
      const st = parseTableState(widget);
      const totalCols = Math.max(1, st.headers.length);
      const totalRows = st.rows.length;

      // Tab / Shift+Tab cell navigation (and auto-add row on Tab at last cell)
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          if (colIdx > 0) {
            focusTableCell(tblId, rowIdx, colIdx - 1);
          } else if (rowIdx > -1) {
            focusTableCell(tblId, rowIdx - 1, totalCols - 1);
          }
        } else {
          if (colIdx < totalCols - 1) {
            focusTableCell(tblId, rowIdx, colIdx + 1);
          } else if (rowIdx < totalRows - 1) {
            focusTableCell(tblId, rowIdx + 1, 0);
          } else {
            // Last cell of last row -> insert new row and jump to its first cell
            addRowToTableWidget(tblId);
            focusTableCell(tblId, totalRows, 0);
          }
        }
        return;
      }

      // Direct Alt + Arrow shortcuts to add/remove rows and columns
      if (e.altKey) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          addRowToTableWidget(tblId);
          focusTableCell(tblId, totalRows, colIdx);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          recordTableCellFocus(tblId, rowIdx, colIdx);
          removeRowFromTableWidget(tblId);
          focusTableCell(tblId, Math.max(0, Math.min(rowIdx, totalRows - 2)), colIdx);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          addColumnToTableWidget(tblId);
          focusTableCell(tblId, rowIdx, totalCols);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          recordTableCellFocus(tblId, rowIdx, colIdx);
          removeColumnFromTableWidget(tblId);
          focusTableCell(tblId, rowIdx, Math.max(0, Math.min(colIdx, totalCols - 2)));
        }
      }
    }

    function addRowToTableWidget(tblId) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (!widget) return;
      saveTableStateFromDOM(widget);
      const st = parseTableState(widget);
      const colCount = Math.max(1, st.headers.length);
      st.rows.push(new Array(colCount).fill(''));
      widget.setAttribute('data-state', JSON.stringify(st));
      mountTableWidget(widget);
      saveTableStateFromDOM(widget);
      const _t = getActiveTab(); if (_t) scheduleHistorySnapshot(_t.id, true);
      showToast('+ Fila agregada a la tabla');
    }

    function removeRowFromTableWidget(tblId, explicitRowIdx) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (!widget) return;
      saveTableStateFromDOM(widget);
      const st = parseTableState(widget);
      if (st.rows.length <= 1) {
        showToast('La tabla debe mantener al menos 1 fila de datos');
        return;
      }
      const active = tableActiveCell[tblId];
      let targetRow = typeof explicitRowIdx === 'number'
        ? explicitRowIdx
        : (active && typeof active.rowIdx === 'number' && active.rowIdx >= 0 && active.rowIdx < st.rows.length
            ? active.rowIdx
            : st.rows.length - 1);
      st.rows.splice(targetRow, 1);
      if (active) active.rowIdx = Math.min(active.rowIdx, st.rows.length - 1);
      widget.setAttribute('data-state', JSON.stringify(st));
      mountTableWidget(widget);
      saveTableStateFromDOM(widget);
      const _t = getActiveTab(); if (_t) scheduleHistorySnapshot(_t.id, true);
      showToast('− Fila eliminada de la tabla');
    }

    function addColumnToTableWidget(tblId) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (!widget) return;
      saveTableStateFromDOM(widget);
      const st = parseTableState(widget);
      st.headers.push('');
      st.rows = st.rows.map(r => [...r, '']);
      widget.setAttribute('data-state', JSON.stringify(st));
      mountTableWidget(widget);
      saveTableStateFromDOM(widget);
      const _t = getActiveTab(); if (_t) scheduleHistorySnapshot(_t.id, true);
      showToast('+ Columna agregada a la tabla');
    }

    function removeColumnFromTableWidget(tblId, explicitColIdx) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (!widget) return;
      saveTableStateFromDOM(widget);
      const st = parseTableState(widget);
      if (st.headers.length <= 1) {
        showToast('La tabla debe mantener al menos 1 columna');
        return;
      }
      const active = tableActiveCell[tblId];
      let targetCol = typeof explicitColIdx === 'number'
        ? explicitColIdx
        : (active && typeof active.colIdx === 'number' && active.colIdx >= 0 && active.colIdx < st.headers.length
            ? active.colIdx
            : st.headers.length - 1);
      st.headers.splice(targetCol, 1);
      st.rows = st.rows.map(r => {
        const copy = [...r];
        copy.splice(targetCol, 1);
        return copy;
      });
      if (active) active.colIdx = Math.min(active.colIdx, st.headers.length - 1);
      widget.setAttribute('data-state', JSON.stringify(st));
      mountTableWidget(widget);
      saveTableStateFromDOM(widget);
      const _t = getActiveTab(); if (_t) scheduleHistorySnapshot(_t.id, true);
      showToast('− Columna eliminada de la tabla');
    }

    function formatTablePlainText(st) {
      const stripHtml = (raw) => {
        const d = document.createElement('div');
        d.innerHTML = raw || '';
        return (d.innerText || d.textContent || '').replace(/\s+/g, ' ').trim();
      };
      const headerLine = (st.headers || []).map(stripHtml).join('\t');
      const rowLines = (st.rows || []).map(r => r.map(stripHtml).join('\t'));
      return [headerLine, ...rowLines].join('\n');
    }

    function copyTableWidget(tblId, btnEl) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (!widget) return;
      saveTableStateFromDOM(widget);
      const st = parseTableState(widget);
      const plainText = formatTablePlainText(st);
      appState.copiedWidget = {
        type: 'table',
        state: JSON.parse(JSON.stringify(st)),
        plainText
      };
      writeTextToSystemClipboard(plainText);
      if (btnEl) {
        const origHtml = btnEl.innerHTML;
        btnEl.innerHTML = '<svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
          if (document.body.contains(btnEl)) btnEl.innerHTML = origHtml;
        }, 1400);
      }
      showToast('✓ Tabla copiada al portapapeles (podés pegarla con Ctrl+V)');
    }

    function insertClonedTableAfter(refNode, sourceState) {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return null;
      const newTblId = 'tbl-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const clonedState = JSON.parse(JSON.stringify(sourceState));
      const newWidget = document.createElement('div');
      newWidget.className = 'table-widget';
      newWidget.setAttribute('contenteditable', 'false');
      newWidget.setAttribute('data-table-id', newTblId);
      newWidget.setAttribute('data-state', JSON.stringify(clonedState));

      const trailingDiv = document.createElement('div');
      trailingDiv.innerHTML = '<br>';

      if (refNode && editor.contains(refNode)) {
        refNode.after(newWidget, trailingDiv);
      } else {
        editor.appendChild(newWidget);
        editor.appendChild(trailingDiv);
      }
      mountTableWidget(newWidget);
      handleLiveSheetInput();
      return newWidget;
    }

    function removeTableWidget(tblId) {
      const widget = document.querySelector(`.table-widget[data-table-id="${tblId}"]`);
      if (!widget) return;
      widget.remove();
      handleLiveSheetInput();
      const _t = getActiveTab(); if (_t) scheduleHistorySnapshot(_t.id, true);
      showToast('Tabla eliminada');
    }

    function mountAllTablesInEditor() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      editor.querySelectorAll('.table-widget').forEach(w => mountTableWidget(w));
    }

    function insertTableInSheet() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      editor.focus();

      const tblId = 'tbl-' + Date.now();
      const initialTableState = {
        headers: ['', '', ''],
        rows: [
          ['', '', ''],
          ['', '', '']
        ]
      };

      const widget = document.createElement('div');
      widget.className = 'table-widget';
      widget.setAttribute('contenteditable', 'false');
      widget.setAttribute('data-table-id', tblId);
      widget.setAttribute('data-state', JSON.stringify(initialTableState));

      const trailingDiv = document.createElement('div');
      trailingDiv.innerHTML = '<br>';

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        const lineBlock = getOrWrapActiveLineBlock(editor, sel.anchorNode);
        if (lineBlock && lineBlock !== editor) {
          lineBlock.after(widget, trailingDiv);
        } else {
          editor.appendChild(widget);
          editor.appendChild(trailingDiv);
        }
      } else {
        editor.appendChild(widget);
        editor.appendChild(trailingDiv);
      }

      mountTableWidget(widget);
      const firstCell = widget.querySelector('th, td');
      if (firstCell) firstCell.focus();
      handleLiveSheetInput();
      { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
      showToast('Tabla insertada (usá los botones verdes + para sumar filas/columnas)');
    }

    // ==========================================
    // 3. CODE WIDGET WITH LANGUAGE DROPDOWN & SYNTAX HIGHLIGHTING
    // ==========================================
    const LANGUAGE_LABELS = {
      javascript: 'JavaScript',
      python: 'Python',
      c: 'C / C++',
      sql: 'SQL',
      html: 'HTML / CSS',
      json: 'JSON'
    };

    function highlightCodeByLanguage(code, lang) {
      let text = escapeHtml(code || '');
      if (!text) return '';

      const placeholders = [];
      function stash(htmlSpan) {
        const token = `___TOK${placeholders.length}___`;
        placeholders.push(htmlSpan);
        return token;
      }

      // 1. Comments & Strings first so keywords inside strings/comments are not highlighted
      if (lang === 'python') {
        text = text.replace(/(#[^\n]*)/g, m => stash(`<span class="tok-com">${m}</span>`));
      } else if (lang === 'sql') {
        text = text.replace(/(--[^\n]*)/g, m => stash(`<span class="tok-com">${m}</span>`));
      } else if (lang === 'html') {
        text = text.replace(/(&lt;!--[\s\S]*?--&gt;)/g, m => stash(`<span class="tok-com">${m}</span>`));
      } else if (lang !== 'json') {
        text = text.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, m => stash(`<span class="tok-com">${m}</span>`));
      }

      // Strings
      text = text.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, m =>
        stash(`<span class="tok-str">${m}</span>`)
      );

      // Language-specific keywords & constructs
      if (lang === 'javascript') {
        text = text.replace(/\b(function|const|let|var|return|if|else|for|while|async|await|class|new|import|export|from|try|catch|true|false|null|undefined)\b/g, '<span class="tok-kw">$1</span>');
        text = text.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, '<span class="tok-fn">$1</span>');
      } else if (lang === 'python') {
        text = text.replace(/\b(def|class|return|if|elif|else|for|while|in|import|from|as|try|except|True|False|None|and|or|not|with|yield|lambda)\b/g, '<span class="tok-kw">$1</span>');
        text = text.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, '<span class="tok-fn">$1</span>');
      } else if (lang === 'c') {
        text = text.replace(/(#[a-zA-Z_]+)\b/g, '<span class="tok-type">$1</span>');
        text = text.replace(/\b(int|char|float|double|void|long|short|unsigned|signed|struct|typedef|return|if|else|for|while|do|switch|case|break|continue|sizeof|NULL|malloc| realloc|free|printf|scanf)\b/g, '<span class="tok-kw">$1</span>');
        text = text.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, '<span class="tok-fn">$1</span>');
      } else if (lang === 'sql') {
        text = text.replace(/\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|JOIN|INNER|LEFT|RIGHT|ON|GROUP|BY|ORDER|HAVING|AS|DISTINCT|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|REFERENCES|COUNT|SUM|AVG|MIN|MAX|PROCEDURE|BEGIN|END|DECLARE)\b/gi, '<span class="tok-kw">$1</span>');
      } else if (lang === 'html') {
        text = text.replace(/(&lt;\/?[a-zA-Z0-9_-]+)/g, '<span class="tok-kw">$1</span>');
        text = text.replace(/\b([a-zA-Z-]+)(?==)/g, '<span class="tok-type">$1</span>');
      } else if (lang === 'json') {
        text = text.replace(/\b(true|false|null)\b/g, '<span class="tok-kw">$1</span>');
      }

      // Numbers
      text = text.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');

      // Restore stashed strings & comments
      placeholders.forEach((htmlSpan, idx) => {
        text = text.replace(`___TOK${idx}___`, htmlSpan);
      });

      return text + '\n';
    }

    function parseCodeWidgetState(widget) {
      try {
        const raw = widget.getAttribute('data-state');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.code === 'string') {
            return {
              lang: parsed.lang || 'javascript',
              code: parsed.code
            };
          }
        }
      } catch (e) {}
      return { lang: 'javascript', code: '' };
    }

    function saveCodeWidgetState(widget, stateObj) {
      widget.setAttribute('data-state', JSON.stringify(stateObj));
      const editor = document.getElementById('liveSheetEditor');
      const tab = getActiveTab();
      if (editor && tab) {
        tab.html = editor.innerHTML;
        saveTabsToStorage();
      }
    }

    function mountCodeWidget(widget) {
      let codeId = widget.getAttribute('data-code-id');
      if (!codeId) {
        codeId = 'code-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        widget.setAttribute('data-code-id', codeId);
      }
      widget.setAttribute('contenteditable', 'false');
      const st = parseCodeWidgetState(widget);

      const langMenuId = `codeLangMenu-${codeId}`;
      const optionsHtml = Object.keys(LANGUAGE_LABELS).map(k => {
        const isSel = st.lang === k;
        return `<button type="button" onclick="event.stopPropagation(); changeCodeWidgetLang('${codeId}', '${k}'); closeAllWidgetDropdowns();" class="w-full px-2.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-between gap-2 text-slate-700 dark:text-zinc-200 text-[11px] ${isSel ? 'font-semibold bg-slate-50 dark:bg-zinc-800/60' : ''}">
          <span>${LANGUAGE_LABELS[k]}</span>
          <span class="text-[10px]">${isSel ? '✓' : ''}</span>
        </button>`;
      }).join('');

      widget.innerHTML = `
        <div class="code-widget-header px-3 py-1 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 text-[11px] font-mono">
          <div class="flex items-center gap-1.5">
            <div class="widget-dropdown-wrap relative">
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); toggleWidgetDropdown('${langMenuId}')" aria-label="Lenguaje del bloque de código" class="widget-dropdown-btn menu-trigger flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/80 dark:bg-zinc-800 border border-slate-300/80 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-[11px] hover:bg-white dark:hover:bg-zinc-700 transition">
                <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <span>${LANGUAGE_LABELS[st.lang] || st.lang}</span>
                <svg class="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"></path></svg>
              </button>
              <div id="${langMenuId}" class="widget-dropdown-menu dropdown-panel hidden absolute left-0 mt-1 w-40 rounded-md bg-white dark:bg-zinc-900 shadow-xl border border-slate-200 dark:border-zinc-700 py-1 z-50">
                ${optionsHtml}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-0.5">
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); copyCodeWidgetContent('${codeId}')" title="Copiar código" aria-label="Copiar código" class="w-6 h-6 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); removeCodeWidget('${codeId}')" title="Eliminar bloque de código" aria-label="Eliminar bloque de código" class="w-6 h-6 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div class="code-editor-area">
          <pre class="code-highlight-layer m-0">${highlightCodeByLanguage(st.code, st.lang)}</pre>
          <textarea
            class="code-input-layer"
            spellcheck="false"
            placeholder="Escribí tu código acá..."
            oninput="handleCodeWidgetInput('${codeId}', this)"
            onkeydown="event.stopPropagation()"
          >${escapeHtml(st.code)}</textarea>
        </div>
      `;

      const ta = widget.querySelector('textarea.code-input-layer');
      if (ta) {
        autoResizeCodeTextarea(ta, widget.querySelector('.code-highlight-layer'));
      }
    }

    function autoResizeCodeTextarea(ta, pre) {
      ta.style.height = 'auto';
      const h = Math.max(76, ta.scrollHeight);
      ta.style.height = `${h}px`;
      if (pre) pre.style.height = `${h}px`;
    }

    function handleCodeWidgetInput(codeId, textareaEl) {
      const widget = document.querySelector(`.code-widget[data-code-id="${codeId}"]`);
      if (!widget) return;
      const st = parseCodeWidgetState(widget);
      st.code = textareaEl.value;
      const pre = widget.querySelector('.code-highlight-layer');
      if (pre) {
        pre.innerHTML = highlightCodeByLanguage(st.code, st.lang);
      }
      autoResizeCodeTextarea(textareaEl, pre);
      saveCodeWidgetState(widget, st);
    }

    function changeCodeWidgetLang(codeId, newLang) {
      const widget = document.querySelector(`.code-widget[data-code-id="${codeId}"]`);
      if (!widget) return;
      const st = parseCodeWidgetState(widget);
      st.lang = newLang;
      const pre = widget.querySelector('.code-highlight-layer');
      if (pre) {
        pre.innerHTML = highlightCodeByLanguage(st.code, st.lang);
      }
      saveCodeWidgetState(widget, st);
      showToast(`Resaltado de código: ${LANGUAGE_LABELS[newLang] || newLang}`);
    }

    function copyCodeWidgetContent(codeId) {
      const widget = document.querySelector(`.code-widget[data-code-id="${codeId}"]`);
      if (!widget) return;
      const st = parseCodeWidgetState(widget);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(st.code || '');
        }
      } catch (e) {}
      showToast('✓ Código copiado');
    }

    function removeCodeWidget(codeId) {
      const widget = document.querySelector(`.code-widget[data-code-id="${codeId}"]`);
      if (!widget) return;
      widget.remove();
      handleLiveSheetInput();
      const _t = getActiveTab(); if (_t) scheduleHistorySnapshot(_t.id, true);
      showToast('Bloque de código eliminado');
    }

    function mountAllCodeWidgetsInEditor() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      editor.querySelectorAll('.code-widget').forEach(w => mountCodeWidget(w));
    }

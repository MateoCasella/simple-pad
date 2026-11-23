// ==========================================
    // FILE OPEN & SAVE
    // ==========================================
    function triggerOpenFile() {
      const input = document.getElementById('hiddenFileOpenInput');
      if (input) input.click();
    }

    function escapeAttrJson(obj) {
      return JSON.stringify(obj)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function detectScienceModeFromExpr(expr) {
      if (/\\ce\{|\\rightleftharpoons|\\xrightarrow|\\xrightleftharpoons|\\iso\{|\\bond\{/.test(expr)) return 'chemistry';
      if (/\\vec\{|\\hat\{|\\dot\{|\\ddot\{|\\hbar\b|\\degC\b|\\Omega\b|\\propto\b/.test(expr)) return 'physics';
      return 'math';
    }

    function normalizeImportedCodeLang(rawLang) {
      const l = (rawLang || '').trim().toLowerCase();
      if (l === 'js' || l === 'javascript' || l === 'ts' || l === 'typescript') return 'javascript';
      if (l === 'py' || l === 'python') return 'python';
      if (l === 'c' || l === 'cpp' || l === 'c++' || l === 'h') return 'c';
      if (l === 'sql') return 'sql';
      if (l === 'html' || l === 'css' || l === 'xml') return 'html';
      if (l === 'json') return 'json';
      return 'javascript';
    }

    function parseMarkdownInlineToHtml(text) {
      let s = escapeHtml(text || '');
      // Restore intentional <u>...</u> and <small>...</small> tags safely
      s = s.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi, '<u>$1</u>');
      // Highlight ==text==
      s = s.replace(/==([^=]+)==/g, '<span style="background-color: #fef08a; color: #0f172a;">$1</span>');
      // Bold **text**
      s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
      // Strike ~~text~~
      s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>');
      // Italic *text*
      s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<i>$1</i>');
      // Inline code `code`
      s = s.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[0.9em]">$1</code>');
      return s;
    }

    function buildDiagramWidgetHtmlFromMermaid(mermaidCode) {
      const shapes = [];
      const connectors = [];
      const idMap = {};
      const shapeByMermaidId = {};
      let explicitBoardHeight = null;
      const lines = (mermaidCode || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);

      lines.forEach(line => {
        if (/^(flowchart|graph)\b/i.test(line)) return;

        // Native Mermaid comment for board height: %% board h=320
        const boardMatch = line.match(/^%%\s*board\s+h=(\d+)/i);
        if (boardMatch) {
          explicitBoardHeight = Math.max(180, parseInt(boardMatch[1], 10));
          return;
        }

        // Native Mermaid comment for exact coordinates: %% pos N1 x=36 y=46 w=128 h=64 type=square
        const posMatch = line.match(/^%%\s*pos\s+([A-Za-z0-9_]+)\s+x=(-?\d+)\s+y=(-?\d+)\s+w=(\d+)\s+h=(\d+)(?:\s+type=([a-zA-Z0-9_-]+))?/i);
        if (posMatch) {
          const target = shapeByMermaidId[posMatch[1]];
          if (target) {
            target.x = parseInt(posMatch[2], 10);
            target.y = parseInt(posMatch[3], 10);
            target.w = Math.max(28, parseInt(posMatch[4], 10));
            target.h = Math.max(22, parseInt(posMatch[5], 10));
            if (posMatch[6]) target.type = posMatch[6];
          }
          return;
        }

        if (line.startsWith('%%')) return;

        // Node definitions: N1["Label"] or N2(("Circle"))
        const circleMatch = line.match(/^([A-Za-z0-9_]+)\(\("?([^")]+)"?\)\)$/);
        if (circleMatch) {
          const id = 'sh-' + Date.now() + '-' + shapes.length;
          idMap[circleMatch[1]] = id;
          const obj = {
            id,
            type: 'circle',
            x: 36 + (shapes.length % 4) * 165,
            y: 42 + Math.floor(shapes.length / 4) * 120,
            w: 112,
            h: 78,
            html: escapeHtml(circleMatch[2]),
            text: circleMatch[2]
          };
          shapes.push(obj);
          shapeByMermaidId[circleMatch[1]] = obj;
          return;
        }
        const rectMatch = line.match(/^([A-Za-z0-9_]+)\["?([^"\]]+)"?\]$/);
        if (rectMatch) {
          const id = 'sh-' + Date.now() + '-' + shapes.length;
          idMap[rectMatch[1]] = id;
          const obj = {
            id,
            type: 'rect',
            x: 36 + (shapes.length % 4) * 165,
            y: 46 + Math.floor(shapes.length / 4) * 120,
            w: 128,
            h: 64,
            html: escapeHtml(rectMatch[2]),
            text: rectMatch[2]
          };
          shapes.push(obj);
          shapeByMermaidId[rectMatch[1]] = obj;
          return;
        }
        // Connectors: N1 --> N2, N1 <--> N2, N1 --- N2
        const connMatch = line.match(/^([A-Za-z0-9_]+)\s*(<-->|-->|---)\s*([A-Za-z0-9_]+)$/);
        if (connMatch && idMap[connMatch[1]] && idMap[connMatch[3]]) {
          const cType = connMatch[2] === '<-->' ? 'double-arrow' : (connMatch[2] === '---' ? 'none' : 'arrow');
          connectors.push({
            id: 'cn-' + Date.now() + '-' + connectors.length,
            from: idMap[connMatch[1]],
            to: idMap[connMatch[3]],
            type: cType
          });
        }
      });

      if (shapes.length === 0) return null;
      const diagId = 'diag-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const maxBottom = shapes.reduce((acc, s) => Math.max(acc, (s.y || 0) + (s.h || 60) + 32), 240);
      const state = {
        canvasW: 660,
        canvasH: explicitBoardHeight || Math.max(300, maxBottom),
        shapes,
        connectors
      };
      return `<div class="diagram-widget" contenteditable="false" data-diagram-id="${diagId}" data-state="${escapeAttrJson(state)}"></div>`;
    }

    function convertMarkdownToTabHtml(mdText) {
      const lines = (mdText || '').replace(/\r\n/g, '\n').split('\n');
      const out = [];
      let i = 0;
      let widgetSeed = Date.now();

      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // 1. Fenced code block (```lang ... ```)
        const fenceMatch = trimmed.match(/^```([A-Za-z0-9_+\-]*)\s*$/);
        if (fenceMatch) {
          const rawLang = fenceMatch[1] || '';
          const buf = [];
          i++;
          while (i < lines.length && !lines[i].trim().startsWith('```')) {
            buf.push(lines[i]);
            i++;
          }
          if (i < lines.length) i++; // consume closing ```
          const codeStr = buf.join('\n');
          if (rawLang.toLowerCase() === 'mermaid') {
            const diagHtml = buildDiagramWidgetHtmlFromMermaid(codeStr);
            if (diagHtml) {
              out.push(diagHtml);
              continue;
            }
          }
          const codeId = 'code-' + (++widgetSeed);
          const lang = normalizeImportedCodeLang(rawLang);
          out.push(`<div class="code-widget" contenteditable="false" data-code-id="${codeId}" data-state="${escapeAttrJson({ lang, code: codeStr })}"></div>`);
          continue;
        }

        // 2. Math / Physics / Chemistry block ($$ ... $$)
        if (trimmed.startsWith('$$')) {
          let exprLines = [];
          if (trimmed.length > 4 && trimmed.endsWith('$$')) {
            exprLines.push(trimmed.slice(2, -2).trim());
            i++;
          } else {
            const firstRest = trimmed.slice(2).trim();
            if (firstRest) exprLines.push(firstRest);
            i++;
            while (i < lines.length && !lines[i].trim().endsWith('$$')) {
              exprLines.push(lines[i]);
              i++;
            }
            if (i < lines.length) {
              const lastPart = lines[i].trim().slice(0, -2).trim();
              if (lastPart) exprLines.push(lastPart);
              i++;
            }
          }
          const expr = exprLines.join('\n').trim();
          const mode = detectScienceModeFromExpr(expr);
          const mathId = 'math-' + (++widgetSeed);
          out.push(`<div class="math-widget" contenteditable="false" data-math-id="${mathId}" data-state="${escapeAttrJson({ expr, mode, previewOnly: false })}"></div>`);
          continue;
        }

        // 3. GFM Table (| col1 | col2 | followed by | --- | --- |)
        if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length && /^\|[\s:|\-]+\|$/.test(lines[i + 1].trim())) {
          const splitRow = r => r.trim().slice(1, -1).split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim());
          const headers = splitRow(trimmed).map(c => parseMarkdownInlineToHtml(c));
          i += 2; // skip header + separator
          const rows = [];
          while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
            const cells = splitRow(lines[i]).map(c => parseMarkdownInlineToHtml(c));
            while (cells.length < headers.length) cells.push('');
            rows.push(cells.slice(0, headers.length));
            i++;
          }
          if (rows.length === 0) rows.push(headers.map(() => ''));
          const tblId = 'tbl-' + (++widgetSeed);
          out.push(`<div class="table-widget" contenteditable="false" data-table-id="${tblId}" data-state="${escapeAttrJson({ headers, rows })}"></div>`);
          continue;
        }

        // 4. Unordered list (- item or * item)
        if (/^[-*]\s+/.test(trimmed)) {
          const items = [];
          while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
            items.push(`<li>${parseMarkdownInlineToHtml(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`);
            i++;
          }
          out.push(`<ul class="list-disc pl-6 my-1">${items.join('')}</ul>`);
          continue;
        }

        // 5. Ordered list (1. item)
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = [];
          while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
            items.push(`<li>${parseMarkdownInlineToHtml(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`);
            i++;
          }
          out.push(`<ol class="list-decimal pl-6 my-1">${items.join('')}</ol>`);
          continue;
        }

        // 6. Headings (# / ## -> txt-grande, ###+ -> bold txt-mediano)
        const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (hMatch) {
          const level = hMatch[1].length;
          const bodyHtml = parseMarkdownInlineToHtml(hMatch[2]);
          if (level <= 2) {
            out.push(`<div class="txt-grande">${bodyHtml}</div>`);
          } else {
            out.push(`<div class="txt-mediano"><b>${bodyHtml}</b></div>`);
          }
          i++;
          continue;
        }

        // 7. Small line (<small>...</small>)
        const smallMatch = trimmed.match(/^<small>([\s\S]*)<\/small>$/i);
        if (smallMatch) {
          out.push(`<div class="txt-chico">${parseMarkdownInlineToHtml(smallMatch[1])}</div>`);
          i++;
          continue;
        }

        // 8. Blank line or normal paragraph
        if (!trimmed) {
          out.push('<div class="txt-mediano"><br></div>');
        } else {
          out.push(`<div class="txt-mediano">${parseMarkdownInlineToHtml(line)}</div>`);
        }
        i++;
      }

      return out.length > 0 ? out.join('') : '<div class="txt-mediano"><br></div>';
    }

    function handleFileOpened(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const content = String(e.target.result || '');
        if (file.name.endsWith('.json')) {
          try {
            const parsed = JSON.parse(content);
            if (parsed && Array.isArray(parsed.tabs)) {
              appState.tabs = parsed.tabs;
              appState.activeTabId = parsed.tabs[0].id;
              saveTabsToStorage();
              renderAll();
              showToast('✓ Sesión de pestañas importada');
              return;
            }
          } catch (err) {}
        }
        let importedHtml = '';
        let restoredFormatted = false;
        const fmtMatch = content.match(/<!--NOTAFLOW_FMT_V1:([A-Za-z0-9+/=\s]+)-->/);
        if (/\.md$/i.test(file.name)) {
          importedHtml = convertMarkdownToTabHtml(content);
          restoredFormatted = true;
        } else if (/\.html?$/i.test(file.name)) {
          importedHtml = sanitizeImportedHtml(content);
          restoredFormatted = true;
        } else if (fmtMatch) {
          try {
            importedHtml = sanitizeImportedHtml(decodeUtf8Base64(fmtMatch[1]));
            restoredFormatted = true;
          } catch (err) {}
        }

        if (!importedHtml) {
          const cleanPlain = content.replace(/\n*<!--NOTAFLOW_FMT_V1:[A-Za-z0-9+/=\s]+-->\s*$/, '');
          importedHtml = cleanPlain.split(/\r?\n/).map(l => `<div class="txt-mediano">${escapeHtml(l) || '<br>'}</div>`).join('');
        }

        const newTab = {
          id: 'tab-' + Date.now(),
          title: file.name,
          html: importedHtml
        };
        appState.tabs.push(newTab);
        appState.activeTabId = newTab.id;
        saveTabsToStorage();
        renderAll();
        showToast(restoredFormatted ? `✓ "${file.name}" abierto con su formato completo` : `✓ Archivo "${file.name}" abierto en nueva pestaña`);
      };
      reader.readAsText(file);
      event.target.value = '';
    }

    // ==========================================
    // MARKDOWN CONVERTER, PDF EXPORT & COPY FOR AI
    // ==========================================
    function convertTabHtmlToMarkdown(htmlStr, title) {
      const container = document.createElement('div');
      container.innerHTML = htmlStr || '';

      function serializeInline(node) {
        if (node.nodeType === 3) return node.nodeValue || '';
        if (node.nodeType !== 1) return '';
        const tag = node.tagName.toLowerCase();
        if (tag === 'br') return '\n';
        const inner = Array.from(node.childNodes).map(serializeInline).join('');
        if (tag === 'strong' || tag === 'b') return inner.trim() ? `**${inner}**` : inner;
        if (tag === 'em' || tag === 'i') return inner.trim() ? `*${inner}*` : inner;
        if (tag === 's' || tag === 'strike' || tag === 'del') return inner.trim() ? `~~${inner}~~` : inner;
        if (tag === 'u') return inner.trim() ? `<u>${inner}</u>` : inner;
        if (tag === 'code') return `\`${inner}\``;
        if (tag === 'mark' || (node.style && node.style.backgroundColor && node.style.backgroundColor !== 'transparent')) {
          return inner.trim() ? `==${inner}==` : inner;
        }
        return inner;
      }

      function stripCellText(rawHtml) {
        const d = document.createElement('div');
        d.innerHTML = rawHtml || '';
        return (d.innerText || d.textContent || '').replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|');
      }

      const blocks = [];
      Array.from(container.childNodes).forEach(node => {
        if (node.nodeType === 3) {
          const t = (node.nodeValue || '').trim();
          if (t) blocks.push(t);
          return;
        }
        if (node.nodeType !== 1) return;

        if (node.classList.contains('table-widget')) {
          const st = parseTableState(node);
          const headers = (st.headers || []).map(h => stripCellText(h) || ' ');
          const sep = headers.map(() => '---');
          const lines = [
            `| ${headers.join(' | ')} |`,
            `| ${sep.join(' | ')} |`
          ];
          (st.rows || []).forEach(row => {
            const cells = headers.map((_, idx) => stripCellText(row[idx] || '') || ' ');
            lines.push(`| ${cells.join(' | ')} |`);
          });
          blocks.push(lines.join('\n'));
          return;
        }

        if (node.classList.contains('code-widget')) {
          const st = parseCodeWidgetState(node);
          const lang = st.lang || '';
          blocks.push('```' + lang + '\n' + (st.code || '') + '\n```');
          return;
        }

        if (node.classList.contains('math-widget')) {
          const st = parseMathWidgetState(node);
          blocks.push('$$\n' + (st.expr || '') + '\n$$');
          return;
        }

        if (node.classList.contains('diagram-widget')) {
          const st = parseDiagramState(node);
          const boardH = Math.round(st.canvasH || st.boardHeight || st.height || 300);
          const mLines = ['```mermaid', 'flowchart LR', `  %% board h=${boardH}`];
          const idMap = {};
          (st.shapes || []).forEach((s, idx) => {
            const mId = `N${idx + 1}`;
            idMap[s.id] = mId;
            const d = document.createElement('div');
            d.innerHTML = s.html !== undefined ? s.html : (s.text || '');
            const lbl = (d.innerText || d.textContent || '').replace(/\s+/g, ' ').trim().replace(/"/g, "'") || s.type;
            if (s.type === 'circle') {
              mLines.push(`  ${mId}(("${lbl}"))`);
            } else {
              mLines.push(`  ${mId}["${lbl}"]`);
            }
            const sx = Math.round(Number(s.x) || 0);
            const sy = Math.round(Number(s.y) || 0);
            const sw = Math.round(Number(s.w) || 120);
            const sh = Math.round(Number(s.h) || 60);
            const stype = s.type || 'rect';
            mLines.push(`  %% pos ${mId} x=${sx} y=${sy} w=${sw} h=${sh} type=${stype}`);
          });
          (st.connectors || []).forEach(c => {
            const a = idMap[c.from];
            const b = idMap[c.to];
            if (!a || !b) return;
            const cType = c.type || 'arrow';
            const link = cType === 'double-arrow' ? '<-->' : (cType === 'none' ? '---' : '-->');
            mLines.push(`  ${a} ${link} ${b}`);
          });
          mLines.push('```');
          blocks.push(mLines.join('\n'));
          return;
        }

        const tag = node.tagName.toLowerCase();
        if (tag === 'ul') {
          const items = Array.from(node.querySelectorAll(':scope > li')).map(li => `- ${serializeInline(li).trim()}`);
          if (items.length) blocks.push(items.join('\n'));
          return;
        }
        if (tag === 'ol') {
          const items = Array.from(node.querySelectorAll(':scope > li')).map((li, i) => `${i + 1}. ${serializeInline(li).trim()}`);
          if (items.length) blocks.push(items.join('\n'));
          return;
        }

        const lineText = serializeInline(node).replace(/\n+$/, '').trim();
        if (!lineText) return;
        if (node.classList.contains('txt-grande') || tag === 'h1') {
          blocks.push(`# ${lineText}`);
        } else {
          blocks.push(lineText);
        }
      });

      const body = blocks.join('\n\n');
      return title ? `<!-- Archivo: ${title} -->\n\n${body}\n` : `${body}\n`;
    }

    function encodeUtf8Base64(str) {
      const bytes = new TextEncoder().encode(str || '');
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    }

    function decodeUtf8Base64(b64) {
      const bin = atob(b64.trim());
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    }

    function sanitizeImportedHtml(rawHtml) {
      const tmp = document.createElement('div');
      tmp.innerHTML = rawHtml || '';
      tmp.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
      return tmp.innerHTML;
    }

    function buildTxtPayloadForTab(tab) {
      const editor = document.getElementById('liveSheetEditor');
      const liveHtml = (tab && tab.id === appState.activeTabId && editor) ? editor.innerHTML : (tab.html || '');
      const plain = getPlainTextFromEditor();
      const hasRichHtml = /<(b|strong|i|em|u|s|strike|mark|ul|ol|li|span|table)|class="[^"]*(txt-grande|txt-chico|hl-yellow|table-widget|code-widget|math-widget|diagram-widget|tab-mention-chip)/i.test(liveHtml);
      if (hasRichHtml) {
        return plain + '\n\n<!--NOTAFLOW_FMT_V1:' + encodeUtf8Base64(liveHtml) + '-->';
      }
      return plain;
    }

    function downloadActiveTab(ext) {
      const tab = getActiveTab();
      if (!tab) return;
      const editor = document.getElementById('liveSheetEditor');
      if (editor) tab.html = editor.innerHTML;
      let baseName = (tab.title || 'nota').replace(/\.(txt|md|html)$/i, '');
      const filename = `${baseName}.${ext}`;
      let payload = '';
      let mime = 'text/plain;charset=utf-8';
      if (ext === 'html') {
        payload = tab.html || '';
        mime = 'text/html;charset=utf-8';
      } else if (ext === 'md') {
        payload = convertTabHtmlToMarkdown(tab.html || '', null);
        mime = 'text/markdown;charset=utf-8';
      } else {
        payload = getPlainTextFromEditor();
      }
      const blob = new Blob([payload], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Guardado como ${filename}`);
    }

    function exportActiveTabToPDF() {
      const tab = getActiveTab();
      const origTitle = document.title;
      if (tab && tab.title) {
        document.title = tab.title.replace(/\.txt$/i, '');
      }
      closeAllMenus();
      showToast('Preparando vista limpia para PDF...');
      setTimeout(() => {
        try {
          window.print();
        } catch (e) {}
        document.title = origTitle;
      }, 120);
    }

    function copyActiveTabForAI(btnEl) {
      const tab = getActiveTab();
      if (!tab) return;
      const md = convertTabHtmlToMarkdown(tab.html || '', tab.title || 'nota.txt');
      writeTextToSystemClipboard(md);
      const tokCount = estimateTokenCount(md);
      if (btnEl) {
        const origHtml = btnEl.innerHTML;
        btnEl.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Copiado (~${tokCount.toLocaleString('es-AR')} tokens)</span>`;
        setTimeout(() => {
          if (document.body.contains(btnEl)) btnEl.innerHTML = origHtml;
        }, 1600);
      }
      showToast(`Copiado en Markdown listo para IA (~${tokCount} tokens)`);
    }

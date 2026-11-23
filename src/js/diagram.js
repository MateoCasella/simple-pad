// ==========================================
    // 1. DRAW.IO DIAGRAM ENGINE (RESIZABLE BOARD & SHAPES + RICH TEXT INSIDE SHAPES)
    // ==========================================
    const CONNECTOR_TYPES = [
      { id: 'arrow', label: 'Flecha simple', symbol: '→' },
      { id: 'double-arrow', label: 'Flecha doble', symbol: '↔' },
      { id: 'none', label: 'Sin flechas', symbol: '—' }
    ];

    function getDiagramRuntime(diagId) {
      if (!diagramRuntime[diagId]) {
        diagramRuntime[diagId] = {
          connectMode: false,
          connectType: 'arrow',
          connectSourceId: null,
          selectedShapeId: null,
          selectedConnectorId: null,
          editingShapeId: null,
          openDropdown: null
        };
      }
      return diagramRuntime[diagId];
    }

    function parseDiagramState(widget) {
      try {
        const raw = widget.getAttribute('data-state');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.shapes) && Array.isArray(parsed.connectors)) {
            return {
              canvasW: Number(parsed.canvasW) > 0 ? Number(parsed.canvasW) : 660,
              canvasH: Number(parsed.canvasH) > 0 ? Number(parsed.canvasH) : 300,
              shapes: parsed.shapes,
              connectors: parsed.connectors
            };
          }
        }
      } catch (e) {}
      return { canvasW: 660, canvasH: 300, shapes: [], connectors: [] };
    }

    function saveDiagramState(widget, stateObj) {
      widget.setAttribute('data-state', JSON.stringify(stateObj));
      const editor = document.getElementById('liveSheetEditor');
      const tab = getActiveTab();
      if (editor && tab) {
        tab.html = editor.innerHTML;
        saveTabsToStorage();
      }
    }

    function getShapeDimensions(shape) {
      const defaultsFor = (t) => {
        if (t === 'rect') return { w: 156, h: 84 };
        if (t === 'circle') return { w: 116, h: 116 };
        if (t === 'text') return { w: 180, h: 40 };
        return { w: 112, h: 112 };
      };
      if (shape && typeof shape === 'object') {
        const defaultDim = defaultsFor(shape.type);
        return {
          w: Number(shape.w) || defaultDim.w,
          h: Number(shape.h) || defaultDim.h
        };
      }
      return defaultsFor(shape);
    }

    function computeBoundaryPoint(shape, targetCenter) {
      const dim = getShapeDimensions(shape);
      const cx = shape.x + dim.w / 2;
      const cy = shape.y + dim.h / 2;
      const dx = targetCenter.x - cx;
      const dy = targetCenter.y - cy;
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        return { x: cx, y: cy };
      }
      if (shape.type === 'circle') {
        const rx = dim.w / 2;
        const ry = dim.h / 2;
        const angle = Math.atan2(dy, dx);
        return {
          x: cx + rx * Math.cos(angle),
          y: cy + ry * Math.sin(angle)
        };
      }
      const hw = dim.w / 2;
      const hh = dim.h / 2;
      const scaleX = Math.abs(dx) > 0.0001 ? hw / Math.abs(dx) : Infinity;
      const scaleY = Math.abs(dy) > 0.0001 ? hh / Math.abs(dy) : Infinity;
      const scale = Math.min(scaleX, scaleY);
      return {
        x: cx + dx * scale,
        y: cy + dy * scale
      };
    }

    function renderDiagramConnectorsSVG(widget, stateObj) {
      const svg = widget.querySelector('svg.diagram-svg-layer');
      if (!svg) return;
      const diagId = widget.getAttribute('data-diagram-id');
      const rt = getDiagramRuntime(diagId);
      const markerId = `arrow-${diagId}`;

      let svgHtml = `
        <defs>
          <marker id="${markerId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="currentColor" class="text-slate-600 dark:text-zinc-400" />
          </marker>
        </defs>
      `;

      stateObj.connectors.forEach(conn => {
        const fromShape = stateObj.shapes.find(s => s.id === conn.from);
        const toShape = stateObj.shapes.find(s => s.id === conn.to);
        if (!fromShape || !toShape) return;

        const dimFrom = getShapeDimensions(fromShape);
        const dimTo = getShapeDimensions(toShape);
        const centerFrom = { x: fromShape.x + dimFrom.w / 2, y: fromShape.y + dimFrom.h / 2 };
        const centerTo = { x: toShape.x + dimTo.w / 2, y: toShape.y + dimTo.h / 2 };

        const p1 = computeBoundaryPoint(fromShape, centerTo);
        const p2 = computeBoundaryPoint(toShape, centerFrom);
        const isSelected = rt.selectedConnectorId === conn.id;
        const cType = conn.type || 'arrow';

        let markerAttrs = '';
        if (cType === 'arrow') {
          markerAttrs = `marker-end="url(#${markerId})"`;
        } else if (cType === 'double-arrow') {
          markerAttrs = `marker-start="url(#${markerId})" marker-end="url(#${markerId})"`;
        }

        let cardHtml = '';
        if (cType === '1-n' || cType === 'n-1' || cType === '1-1') {
          const startLabel = cType === 'n-1' ? 'N' : '1';
          const endLabel = cType === '1-n' ? 'N' : '1';
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          // Offset along the line near each endpoint, and slightly perpendicular for readability
          const dist = Math.min(20, len * 0.25);
          const px = -uy * 12;
          const py = ux * 12;
          const sPos = { x: p1.x + ux * dist + px, y: p1.y + uy * dist + py };
          const ePos = { x: p2.x - ux * dist + px, y: p2.y - uy * dist + py };

          cardHtml = `
            <rect class="diagram-card-bg" x="${(sPos.x - 9).toFixed(1)}" y="${(sPos.y - 9).toFixed(1)}" width="18" height="18" rx="4" />
            <text class="diagram-card-text" x="${sPos.x.toFixed(1)}" y="${sPos.y.toFixed(1)}">${startLabel}</text>
            <rect class="diagram-card-bg" x="${(ePos.x - 9).toFixed(1)}" y="${(ePos.y - 9).toFixed(1)}" width="18" height="18" rx="4" />
            <text class="diagram-card-text" x="${ePos.x.toFixed(1)}" y="${ePos.y.toFixed(1)}">${endLabel}</text>
          `;
        }

        svgHtml += `
          <g class="diagram-connector-group ${isSelected ? 'connector-selected' : ''}" data-conn-id="${conn.id}" data-conn-type="${cType}" onmousedown="selectDiagramConnector(event, '${diagId}', '${conn.id}')" oncontextmenu="openDiagramContextMenu(event, '${diagId}', 'connector', '${conn.id}')">
            <line class="diagram-connector-hit" x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" />
            <line class="diagram-connector-line" x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" ${markerAttrs} />
            ${cardHtml}
          </g>
        `;
      });

      svg.innerHTML = svgHtml;
    }

    function setActiveDiagramFocus(diagId) {
      appState.activeDiagramId = diagId;
      document.querySelectorAll('.diagram-widget').forEach(w => {
        w.classList.toggle('widget-focused', w.getAttribute('data-diagram-id') === diagId);
      });
    }

    function enterShapeTextEditing(diagId, shapeId) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const rt = getDiagramRuntime(diagId);
      rt.selectedShapeId = shapeId;
      rt.editingShapeId = shapeId;
      rt.selectedConnectorId = null;
      updateDiagramSelectionClasses(widget, diagId);

      const shapeEl = widget.querySelector(`.diagram-shape[data-shape-id="${shapeId}"]`);
      const textEl = shapeEl ? shapeEl.querySelector('.diagram-shape-text') : null;
      if (textEl) {
        textEl.setAttribute('contenteditable', 'true');
        appState.activeShapeContext = { diagId, shapeId, textEl };
        textEl.focus();
        const range = document.createRange();
        range.selectNodeContents(textEl);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        saveCurrentSelection();
      }
    }

    function resizeDiagramBoard(diagId, deltaW, deltaH) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const stateObj = parseDiagramState(widget);
      const currentW = Number(stateObj.canvasW) || Math.round(widget.getBoundingClientRect().width) || 660;
      const currentH = Number(stateObj.canvasH) || 300;
      stateObj.canvasW = Math.round(Math.min(3000, Math.max(280, currentW + deltaW)));
      stateObj.canvasH = Math.round(Math.min(1800, Math.max(160, currentH + deltaH)));
      saveDiagramState(widget, stateObj);
      mountDiagramWidget(widget);
    }

    function resizeSelectedShapeInDiagram(diagId, delta) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const rt = getDiagramRuntime(diagId);
      if (!rt.selectedShapeId) {
        showToast('Seleccioná una figura primero para cambiar su tamaño');
        return;
      }
      const stateObj = parseDiagramState(widget);
      const sh = stateObj.shapes.find(s => s.id === rt.selectedShapeId);
      if (!sh) return;
      const dim = getShapeDimensions(sh);
      sh.w = Math.round(Math.min(600, Math.max(54, dim.w + delta)));
      sh.h = Math.round(Math.min(500, Math.max(44, dim.h + delta)));
      saveDiagramState(widget, stateObj);
      mountDiagramWidget(widget);
    }

    function formatDiagramPlainText(stateObj) {
      if (!stateObj || !Array.isArray(stateObj.shapes)) return '';
      const shapeMap = {};
      const lines = ['[Pizarra de Diagramas]'];
      stateObj.shapes.forEach(s => {
        const tmp = document.createElement('div');
        tmp.innerHTML = s.html !== undefined ? s.html : (s.text || '');
        const clean = (tmp.innerText || tmp.textContent || '').replace(/\s+/g, ' ').trim() || s.type;
        shapeMap[s.id] = clean;
        lines.push(`• (${s.type}) ${clean}`);
      });
      if (Array.isArray(stateObj.connectors) && stateObj.connectors.length > 0) {
        const arrows = {
          'arrow': '──>',
          'double-arrow': '<──>',
          'none': '───',
          '1-n': '─1──N─',
          'n-1': '─N──1─',
          '1-1': '─1──1─'
        };
        lines.push('Conexiones:');
        stateObj.connectors.forEach(c => {
          const sym = arrows[c.type || 'arrow'] || '──>';
          lines.push(`  [${shapeMap[c.from] || c.from}] ${sym} [${shapeMap[c.to] || c.to}]`);
        });
      }
      return lines.join('\n');
    }

    function writeTextToSystemClipboard(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
      } catch (e) {}
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      } catch (e) {}
    }

    function copyDiagramWidget(diagId, btnEl) {
      persistShapeTextIfActive();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const stateObj = parseDiagramState(widget);
      const plainText = formatDiagramPlainText(stateObj);
      appState.copiedWidget = {
        type: 'diagram',
        state: JSON.parse(JSON.stringify(stateObj)),
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
      showToast('✓ Pizarra copiada (usá Ctrl+V en la hoja o el botón Pegar copia)');
    }

    function duplicateDiagramWidget(diagId) {
      persistShapeTextIfActive();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const stateObj = parseDiagramState(widget);
      insertClonedDiagramAfter(widget, stateObj);
      showToast('✓ Copia de la pizarra insertada abajo');
    }

    function insertClonedDiagramAfter(refNode, sourceState) {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return null;
      const newDiagId = 'diag-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const clonedState = JSON.parse(JSON.stringify(sourceState));
      const idMap = {};
      clonedState.shapes = (clonedState.shapes || []).map((sh, idx) => {
        const newSid = 'sh-' + Date.now() + '-' + idx + '-' + Math.floor(Math.random() * 100);
        idMap[sh.id] = newSid;
        return { ...sh, id: newSid };
      });
      clonedState.connectors = (clonedState.connectors || []).map((c, idx) => ({
        id: 'conn-' + Date.now() + '-' + idx,
        from: idMap[c.from] || c.from,
        to: idMap[c.to] || c.to,
        type: c.type || 'arrow'
      }));

      const newWidget = document.createElement('div');
      newWidget.className = 'diagram-widget';
      newWidget.setAttribute('contenteditable', 'false');
      newWidget.setAttribute('data-diagram-id', newDiagId);
      newWidget.setAttribute('data-state', JSON.stringify(clonedState));

      const trailingDiv = document.createElement('div');
      trailingDiv.innerHTML = '<br>';

      if (refNode && editor.contains(refNode)) {
        refNode.after(newWidget, trailingDiv);
      } else {
        editor.appendChild(newWidget);
        editor.appendChild(trailingDiv);
      }
      mountDiagramWidget(newWidget);
      handleLiveSheetInput();
      return newWidget;
    }

    function mountDiagramWidget(widget) {
      let diagId = widget.getAttribute('data-diagram-id');
      if (!diagId) {
        diagId = 'diag-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        widget.setAttribute('data-diagram-id', diagId);
      }
      widget.setAttribute('contenteditable', 'false');
      widget.setAttribute('tabindex', '-1');

      const stateObj = parseDiagramState(widget);
      const rt = getDiagramRuntime(diagId);

      const canvasHeight = Number(stateObj.canvasH) || 300;
      widget.style.width = '100%';
      widget.style.maxWidth = '100%';

      const activeConnDef = CONNECTOR_TYPES.find(c => c.id === rt.connectType) || CONNECTOR_TYPES[0];
      const connMenuItemsHtml = CONNECTOR_TYPES.map(c => `
        <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); startDiagramConnectWithType('${diagId}', '${c.id}')" class="w-full px-2.5 py-1.5 rounded text-left text-[11px] font-mono flex items-center justify-between gap-2 transition ${
          rt.connectMode && rt.connectType === c.id
            ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold'
            : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
        }">
          <span>${c.label}</span>
          <span class="text-[11px] font-bold text-slate-500 dark:text-zinc-400">${c.symbol}</span>
        </button>
      `).join('');

      widget.innerHTML = `
        <div class="diagram-toolbar px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 text-[11px] font-mono">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Lista desplegable de Formas (solo icono, nombre en hover) -->
            <div class="relative diagram-dropdown-container">
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); toggleDiagramDropdown('${diagId}', 'shapes')" title="Formas" aria-label="Formas" class="btn-diagram-shapes-menu px-2 py-1 rounded bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center gap-1 transition">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"></rect><circle cx="17" cy="17" r="4"></circle></svg>
                <svg class="w-2.5 h-2.5 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </button>
              <div class="diagram-dropdown-menu diagram-shapes-dropdown ${rt.openDropdown === 'shapes' ? '' : 'hidden'}">
                <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); addShapeToDiagram('${diagId}', 'square')" class="w-full px-2.5 py-1.5 rounded text-left text-[11px] font-mono text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition">
                  <span class="inline-block w-3 h-3 border-2 border-current rounded-[2px]"></span>
                  <span>Cuadrado</span>
                </button>
                <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); addShapeToDiagram('${diagId}', 'rect')" class="w-full px-2.5 py-1.5 rounded text-left text-[11px] font-mono text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition">
                  <span class="inline-block w-4 h-2.5 border-2 border-current rounded-[2px]"></span>
                  <span>Rectángulo</span>
                </button>
                <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); addShapeToDiagram('${diagId}', 'circle')" class="w-full px-2.5 py-1.5 rounded text-left text-[11px] font-mono text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition">
                  <span class="inline-block w-3 h-3 border-2 border-current rounded-full"></span>
                  <span>Círculo</span>
                </button>
              </div>
            </div>

            <!-- Lista desplegable de Conexiones (solo icono, nombre en hover) -->
            <div class="relative diagram-dropdown-container">
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); toggleDiagramDropdown('${diagId}', 'connections')" title="${rt.connectMode ? 'Conexiones (' + activeConnDef.label + ')' : 'Conexiones'}" aria-label="Conexiones" class="btn-diagram-conns-menu px-2 py-1 rounded border flex items-center gap-1 transition ${
                rt.connectMode
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200'
              }">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="14 7 19 12 14 17"></polyline></svg>
                <svg class="w-2.5 h-2.5 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </button>
              <div class="diagram-dropdown-menu diagram-conns-dropdown ${rt.openDropdown === 'connections' ? '' : 'hidden'}">
                ${connMenuItemsHtml}
              </div>
            </div>

            <!-- Opción Texto libre en la pizarra (solo icono, nombre en hover) -->
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); addShapeToDiagram('${diagId}', 'text')" title="Texto" aria-label="Texto" class="btn-diagram-add-text px-2 py-1 rounded bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
            </button>
          </div>

          <!-- Iconos pequeños grises esquinados: Copiar y Cruz (Eliminar pizarra) -->
          <div class="flex items-center gap-0.5">
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); copyDiagramWidget('${diagId}', this)" title="Copiar pizarra (Ctrl+V para pegar)" aria-label="Copiar pizarra" class="btn-copy-diagram w-6 h-6 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); removeEntireDiagram('${diagId}')" title="Eliminar pizarra" aria-label="Eliminar pizarra" class="btn-remove-diagram w-6 h-6 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div class="diagram-canvas" style="height: ${canvasHeight}px;" onmousedown="handleDiagramCanvasMouseDown(event, '${diagId}')" oncontextmenu="openDiagramContextMenu(event, '${diagId}', 'canvas', null)">
          <svg class="diagram-svg-layer absolute inset-0 w-full h-full pointer-events-auto"></svg>
          <div class="diagram-shapes-layer absolute inset-0 w-full h-full pointer-events-none"></div>
          <div class="diagram-board-resizer-bottom" style="right: 0;" onmousedown="startDiagramBoardResize(event, '${diagId}', 'y')"></div>
        </div>
      `;

      const shapesLayer = widget.querySelector('.diagram-shapes-layer');
      stateObj.shapes.forEach(sh => {
        const dim = getShapeDimensions(sh);
        sh.w = dim.w;
        sh.h = dim.h;

        const shapeEl = document.createElement('div');
        const typeCls = sh.type === 'text' ? 'shape-text' : (sh.type === 'rect' ? 'shape-rect' : (sh.type === 'circle' ? 'shape-circle' : 'shape-square'));
        const selCls = rt.selectedShapeId === sh.id ? 'shape-selected' : '';
        const srcCls = rt.connectSourceId === sh.id ? 'shape-connect-source' : '';
        const editCls = rt.editingShapeId === sh.id ? 'shape-editing' : '';

        shapeEl.className = `diagram-shape pointer-events-auto ${typeCls} ${selCls} ${srcCls} ${editCls}`;
        shapeEl.setAttribute('data-shape-id', sh.id);
        shapeEl.style.left = `${sh.x}px`;
        shapeEl.style.top = `${sh.y}px`;
        shapeEl.style.width = `${dim.w}px`;
        shapeEl.style.height = `${dim.h}px`;

        shapeEl.onmousedown = (ev) => handleDiagramShapeMouseDown(ev, diagId, sh.id);
        shapeEl.ondblclick = (ev) => {
          ev.stopPropagation();
          enterShapeTextEditing(diagId, sh.id);
        };
        shapeEl.oncontextmenu = (ev) => openDiagramContextMenu(ev, diagId, 'shape', sh.id);

        // Shapes are deleted by selecting and pressing Delete / Backspace

        // Invisible border & corner resize zones (no visible squares)
        const resizeRight = document.createElement('div');
        resizeRight.className = 'diagram-shape-resize-right';
        resizeRight.onmousedown = (ev) => startDiagramShapeResize(ev, diagId, sh.id, 'x');
        shapeEl.appendChild(resizeRight);

        const resizeBottom = document.createElement('div');
        resizeBottom.className = 'diagram-shape-resize-bottom';
        resizeBottom.onmousedown = (ev) => startDiagramShapeResize(ev, diagId, sh.id, 'y');
        shapeEl.appendChild(resizeBottom);

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'diagram-shape-resize-handle';
        resizeHandle.onmousedown = (ev) => startDiagramShapeResize(ev, diagId, sh.id, 'xy');
        shapeEl.appendChild(resizeHandle);

        const textEl = document.createElement('div');
        textEl.className = 'diagram-shape-text';
        textEl.setAttribute('contenteditable', rt.editingShapeId === sh.id ? 'true' : 'false');
        textEl.setAttribute('spellcheck', 'false');
        textEl.setAttribute('data-placeholder', sh.type === 'text' ? 'Texto...' : 'Doble clic...');
        textEl.innerHTML = sh.html !== undefined ? sh.html : escapeHtml(sh.text || '');

        textEl.onmouseup = () => saveCurrentSelection();
        textEl.onkeyup = () => saveCurrentSelection();
        textEl.onclick = (ev) => {
          ev.stopPropagation();
          appState.activeShapeContext = { diagId, shapeId: sh.id, textEl };
          saveCurrentSelection();
        };

        textEl.onkeydown = (ev) => {
          ev.stopPropagation();
          if (ev.key === 'Tab') {
            const s = window.getSelection();
            const aEl = s && s.anchorNode && (s.anchorNode.nodeType === 3 ? s.anchorNode.parentElement : s.anchorNode);
            if (aEl && aEl.closest('li')) {
              ev.preventDefault();
              handleListTabIndent(ev.shiftKey, textEl);
              persistShapeTextIfActive();
              return;
            }
          }
          if (ev.key === 'Escape') {
            ev.preventDefault();
            rt.editingShapeId = null;
            appState.activeShapeContext = null;
            textEl.setAttribute('contenteditable', 'false');
            textEl.blur();
            updateDiagramSelectionClasses(widget, diagId);
          } else if ((ev.key === 'Backspace' || ev.key === 'Delete') && (textEl.innerText || '').trim() === '') {
            ev.preventDefault();
            deleteSpecificShapeInDiagram(diagId, sh.id);
          }
        };

        textEl.oninput = (ev) => {
          ev.stopPropagation();
          const currentState = parseDiagramState(widget);
          const targetShape = currentState.shapes.find(item => item.id === sh.id);
          if (targetShape) {
            targetShape.html = textEl.innerHTML;
            targetShape.text = textEl.innerText;
            saveDiagramState(widget, currentState);
          }
        };

        shapeEl.appendChild(textEl);
        shapesLayer.appendChild(shapeEl);
      });

      renderDiagramConnectorsSVG(widget, stateObj);
    }

    function startDiagramShapeResize(ev, diagId, shapeId, axis) {
      if (ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const rt = getDiagramRuntime(diagId);
      rt.selectedShapeId = shapeId;
      updateDiagramSelectionClasses(widget, diagId);

      const stateObj = parseDiagramState(widget);
      const targetShape = stateObj.shapes.find(s => s.id === shapeId);
      const shapeEl = widget.querySelector(`.diagram-shape[data-shape-id="${shapeId}"]`);
      if (!targetShape || !shapeEl) return;

      const dim = getShapeDimensions(targetShape);
      activeDrag = {
        mode: 'resize-shape',
        axis: axis || 'xy',
        diagId,
        widget,
        stateObj,
        shape: targetShape,
        shapeEl,
        startX: ev.clientX,
        startY: ev.clientY,
        origW: dim.w,
        origH: dim.h
      };
    }

    function startDiagramBoardResize(ev, diagId, axis) {
      if (ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const stateObj = parseDiagramState(widget);
      const canvasEl = widget.querySelector('.diagram-canvas');
      if (!canvasEl) return;

      const rect = widget.getBoundingClientRect();
      activeDrag = {
        mode: 'resize-board',
        axis: axis || 'xy',
        diagId,
        widget,
        canvasEl,
        stateObj,
        startX: ev.clientX,
        startY: ev.clientY,
        origW: Number(stateObj.canvasW) || Math.round(rect.width) || 660,
        origH: Number(stateObj.canvasH) || Math.round(canvasEl.getBoundingClientRect().height) || 300
      };
    }

    function updateDiagramSelectionClasses(widget, diagId) {
      const rt = getDiagramRuntime(diagId);
      widget.querySelectorAll('.diagram-shape').forEach(el => {
        const sid = el.getAttribute('data-shape-id');
        el.classList.toggle('shape-selected', rt.selectedShapeId === sid);
        el.classList.toggle('shape-connect-source', rt.connectSourceId === sid);
        el.classList.toggle('shape-editing', rt.editingShapeId === sid);
      });
      widget.querySelectorAll('.diagram-connector-group').forEach(g => {
        const cid = g.getAttribute('data-conn-id');
        g.classList.toggle('connector-selected', rt.selectedConnectorId === cid);
      });
    }

    function mountAllDiagramsInEditor() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      editor.querySelectorAll('.diagram-widget').forEach(widget => {
        mountDiagramWidget(widget);
      });
    }

    function getDiagramWidgetById(diagId) {
      return document.querySelector(`.diagram-widget[data-diagram-id="${diagId}"]`);
    }

    function insertDiagramInSheet() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      editor.focus();

      const diagId = 'diag-' + Date.now();
      const initialDiagramState = {
        canvasW: 660,
        canvasH: 300,
        shapes: [
          { id: 'sh-' + Date.now() + '-1', type: 'square', x: 50, y: 90, w: 112, h: 112, html: '<div>Cuadrado</div>' },
          { id: 'sh-' + Date.now() + '-2', type: 'rect', x: 250, y: 104, w: 156, h: 84, html: '<div>Rectángulo</div>' },
          { id: 'sh-' + Date.now() + '-3', type: 'circle', x: 480, y: 88, w: 116, h: 116, html: '<div>Círculo</div>' }
        ],
        connectors: [
          { id: 'conn-' + Date.now() + '-1', from: 'sh-' + Date.now() + '-1', to: 'sh-' + Date.now() + '-2' }
        ]
      };

      const widget = document.createElement('div');
      widget.className = 'diagram-widget';
      widget.setAttribute('contenteditable', 'false');
      widget.setAttribute('data-diagram-id', diagId);
      widget.setAttribute('data-state', JSON.stringify(initialDiagramState));

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

      mountDiagramWidget(widget);
      setActiveDiagramFocus(diagId);
      handleLiveSheetInput();
      { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
      showToast('Pizarra insertada');
    }

    function addShapeToDiagram(diagId, shapeType) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const stateObj = parseDiagramState(widget);
      const rt = getDiagramRuntime(diagId);
      const defaultDim = getShapeDimensions(shapeType);

      const offset = (stateObj.shapes.length % 5) * 28;
      const newId = 'sh-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const newShape = {
        id: newId,
        type: shapeType,
        x: 60 + offset,
        y: 60 + offset,
        w: defaultDim.w,
        h: defaultDim.h,
        html: '',
        text: ''
      };
      stateObj.shapes.push(newShape);
      rt.selectedShapeId = newId;
      rt.editingShapeId = newId;
      rt.selectedConnectorId = null;
      rt.connectMode = false;
      rt.connectSourceId = null;
      rt.openDropdown = null;

      saveDiagramState(widget, stateObj);
      mountDiagramWidget(widget);
      enterShapeTextEditing(diagId, newId);
      { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
    }

    function toggleDiagramDropdown(diagId, menuName) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const rt = getDiagramRuntime(diagId);
      rt.openDropdown = rt.openDropdown === menuName ? null : menuName;
      mountDiagramWidget(widget);
    }

    function startDiagramConnectWithType(diagId, connType) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const rt = getDiagramRuntime(diagId);
      rt.connectType = connType || 'arrow';
      rt.connectMode = true;
      rt.connectSourceId = null;
      rt.editingShapeId = null;
      rt.openDropdown = null;
      appState.activeShapeContext = null;
      mountDiagramWidget(widget);
      const def = CONNECTOR_TYPES.find(c => c.id === rt.connectType);
      showToast(`Conexión (${def ? def.label : rt.connectType}): hacé clic en la forma origen y luego en la destino`);
    }

    function toggleDiagramConnectMode(diagId) {
      startDiagramConnectWithType(diagId, 'arrow');
    }

    function selectDiagramConnector(ev, diagId, connId) {
      ev.preventDefault();
      ev.stopPropagation();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const rt = getDiagramRuntime(diagId);
      rt.selectedConnectorId = connId;
      rt.selectedShapeId = null;
      rt.editingShapeId = null;
      appState.activeShapeContext = null;
      updateDiagramSelectionClasses(widget, diagId);
    }

    function handleDiagramCanvasMouseDown(ev, diagId) {
      if (ev.button === 2) return;
      if (ev.target.closest('.diagram-shape') || ev.target.closest('.diagram-connector-group') || ev.target.closest('.diagram-board-resizer')) return;
      ev.stopPropagation();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const rt = getDiagramRuntime(diagId);
      rt.selectedShapeId = null;
      rt.selectedConnectorId = null;
      rt.editingShapeId = null;
      appState.activeShapeContext = null;
      rt.openDropdown = null;
      if (rt.connectMode) {
        rt.connectMode = false;
        rt.connectSourceId = null;
      }
      mountDiagramWidget(widget);
    }

    function handleDiagramShapeMouseDown(ev, diagId, shapeId) {
      if (ev.button === 2) return;
      if (ev.target.closest('.diagram-shape-resize-handle') || ev.target.closest('.diagram-shape-resize-right') || ev.target.closest('.diagram-shape-resize-bottom')) return;
      ev.stopPropagation();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const rt = getDiagramRuntime(diagId);
      const stateObj = parseDiagramState(widget);

      if (rt.editingShapeId === shapeId && !rt.connectMode) {
        const shapeEl = widget.querySelector(`.diagram-shape[data-shape-id="${shapeId}"]`);
        const textEl = shapeEl ? shapeEl.querySelector('.diagram-shape-text') : null;
        if (textEl) {
          appState.activeShapeContext = { diagId, shapeId, textEl };
        }
        return;
      }

      ev.preventDefault();
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }

      if (rt.connectMode) {
        if (!rt.connectSourceId) {
          rt.connectSourceId = shapeId;
          rt.selectedShapeId = shapeId;
          mountDiagramWidget(widget);
        } else if (rt.connectSourceId !== shapeId) {
          const existingConn = stateObj.connectors.find(
            c => c.from === rt.connectSourceId && c.to === shapeId
          );
          const chosenType = rt.connectType || 'arrow';
          if (existingConn) {
            existingConn.type = chosenType;
          } else {
            stateObj.connectors.push({
              id: 'conn-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
              from: rt.connectSourceId,
              to: shapeId,
              type: chosenType
            });
          }
          rt.connectMode = false;
          rt.connectSourceId = null;
          rt.selectedShapeId = shapeId;
          saveDiagramState(widget, stateObj);
          mountDiagramWidget(widget);
          showToast('✓ Formas conectadas');
      { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
        } else {
          rt.connectSourceId = null;
          mountDiagramWidget(widget);
        }
        return;
      }

      rt.selectedShapeId = shapeId;
      rt.selectedConnectorId = null;
      rt.editingShapeId = null;
      appState.activeShapeContext = null;
      updateDiagramSelectionClasses(widget, diagId);

      const targetShape = stateObj.shapes.find(s => s.id === shapeId);
      const shapeEl = widget.querySelector(`.diagram-shape[data-shape-id="${shapeId}"]`);
      const canvasEl = widget.querySelector('.diagram-canvas');
      if (!targetShape || !shapeEl || !canvasEl) return;

      activeDrag = {
        mode: 'move-shape',
        diagId,
        widget,
        stateObj,
        shape: targetShape,
        shapeEl,
        canvasRect: canvasEl.getBoundingClientRect(),
        startX: ev.clientX,
        startY: ev.clientY,
        origX: targetShape.x,
        origY: targetShape.y
      };
    }

    window.addEventListener('mousemove', function(ev) {
      if (!activeDrag) return;
      // Only move or resize while primary mouse button is actively held down
      if ((ev.buttons & 1) === 0) {
        saveDiagramState(activeDrag.widget, activeDrag.stateObj);
        activeDrag = null;
        return;
      }
      const dx = ev.clientX - activeDrag.startX;
      const dy = ev.clientY - activeDrag.startY;

      if (activeDrag.mode === 'move-shape') {
        const dim = getShapeDimensions(activeDrag.shape);
        const maxX = Math.max(10, activeDrag.canvasRect.width - dim.w - 6);
        const maxY = Math.max(10, activeDrag.canvasRect.height - dim.h - 6);

        activeDrag.shape.x = Math.round(Math.min(maxX, Math.max(6, activeDrag.origX + dx)));
        activeDrag.shape.y = Math.round(Math.min(maxY, Math.max(6, activeDrag.origY + dy)));

        activeDrag.shapeEl.style.left = `${activeDrag.shape.x}px`;
        activeDrag.shapeEl.style.top = `${activeDrag.shape.y}px`;
        renderDiagramConnectorsSVG(activeDrag.widget, activeDrag.stateObj);
      } else if (activeDrag.mode === 'resize-shape') {
        const ax = activeDrag.axis || 'xy';
        const isText = activeDrag.shape && activeDrag.shape.type === 'text';
        const minW = isText ? 28 : 48;
        const minH = isText ? 22 : 32;
        if (ax === 'x' || ax === 'xy') {
          activeDrag.shape.w = Math.round(Math.min(600, Math.max(minW, activeDrag.origW + dx)));
          activeDrag.shapeEl.style.width = `${activeDrag.shape.w}px`;
        }
        if (ax === 'y' || ax === 'xy') {
          activeDrag.shape.h = Math.round(Math.min(480, Math.max(minH, activeDrag.origH + dy)));
          activeDrag.shapeEl.style.height = `${activeDrag.shape.h}px`;
        }
        renderDiagramConnectorsSVG(activeDrag.widget, activeDrag.stateObj);
      } else if (activeDrag.mode === 'resize-board') {
        activeDrag.stateObj.canvasH = Math.round(Math.min(1800, Math.max(160, activeDrag.origH + dy)));
        activeDrag.canvasEl.style.height = `${activeDrag.stateObj.canvasH}px`;
        renderDiagramConnectorsSVG(activeDrag.widget, activeDrag.stateObj);
      }
    });

    window.addEventListener('mouseup', function() {
      if (!activeDrag) return;
      saveDiagramState(activeDrag.widget, activeDrag.stateObj);
      activeDrag = null;
      { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
    });

    window.addEventListener('blur', function() {
      if (!activeDrag) return;
      saveDiagramState(activeDrag.widget, activeDrag.stateObj);
      activeDrag = null;
    });

    function deleteSpecificShapeInDiagram(diagId, shapeId) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const rt = getDiagramRuntime(diagId);
      const stateObj = parseDiagramState(widget);
      stateObj.shapes = stateObj.shapes.filter(s => s.id !== shapeId);
      stateObj.connectors = stateObj.connectors.filter(c => c.from !== shapeId && c.to !== shapeId);
      if (rt.selectedShapeId === shapeId) rt.selectedShapeId = null;
      if (rt.editingShapeId === shapeId) rt.editingShapeId = null;
      appState.activeShapeContext = null;
      saveDiagramState(widget, stateObj);
      mountDiagramWidget(widget);
      showToast('Figura eliminada');
      { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
    }

    function deleteSelectedInDiagram(diagId) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const rt = getDiagramRuntime(diagId);
      const stateObj = parseDiagramState(widget);

      if (rt.selectedShapeId) {
        deleteSpecificShapeInDiagram(diagId, rt.selectedShapeId);
      } else if (rt.selectedConnectorId) {
        const cid = rt.selectedConnectorId;
        stateObj.connectors = stateObj.connectors.filter(c => c.id !== cid);
        rt.selectedConnectorId = null;
        saveDiagramState(widget, stateObj);
        mountDiagramWidget(widget);
        showToast('Conector eliminado');
      { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
      } else {
        removeEntireDiagram(diagId);
      }
    }

    function closeDiagramContextMenu() {
      const menu = document.getElementById('diagramContextMenu');
      if (menu) menu.classList.add('hidden');
      appState.diagramContext = null;
    }

    function openDiagramContextMenu(ev, diagId, targetType, targetId) {
      ev.preventDefault();
      ev.stopPropagation();
      closeAllMenus();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const rt = getDiagramRuntime(diagId);

      const canvasEl = widget.querySelector('.diagram-canvas');
      const rect = canvasEl ? canvasEl.getBoundingClientRect() : { left: 0, top: 0 };
      const canvasX = Math.max(10, Math.round(ev.clientX - rect.left));
      const canvasY = Math.max(10, Math.round(ev.clientY - rect.top));

      if (targetType === 'shape' && targetId) {
        rt.selectedShapeId = targetId;
        rt.selectedConnectorId = null;
        rt.editingShapeId = null;
        appState.activeShapeContext = null;
        updateDiagramSelectionClasses(widget, diagId);
      } else if (targetType === 'connector' && targetId) {
        rt.selectedConnectorId = targetId;
        rt.selectedShapeId = null;
        rt.editingShapeId = null;
        appState.activeShapeContext = null;
        updateDiagramSelectionClasses(widget, diagId);
      } else {
        rt.selectedShapeId = null;
        rt.selectedConnectorId = null;
        rt.editingShapeId = null;
        appState.activeShapeContext = null;
        updateDiagramSelectionClasses(widget, diagId);
      }

      appState.diagramContext = { diagId, targetType, targetId, canvasX, canvasY };

      const menu = document.getElementById('diagramContextMenu');
      const itemsContainer = document.getElementById('diagramContextMenuItems');
      if (!menu || !itemsContainer) return;

      const hasCopiedShape = Boolean(appState.copiedDiagramShape);
      let itemsHtml = '';

      if (targetType === 'shape') {
        itemsHtml = `
          <button type="button" onclick="copySelectedInDiagram('${diagId}'); closeDiagramContextMenu();
      closeTokenCalculator();
      closeCommandPalette();
      closeWordAutocomplete();" class="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-between">
            <span>Copiar</span><span class="text-[10px] text-slate-400">Ctrl+C</span>
          </button>
          <button type="button" onclick="cutSelectedInDiagram('${diagId}'); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-between">
            <span>Cortar</span><span class="text-[10px] text-slate-400">Ctrl+X</span>
          </button>
          <button type="button" ${hasCopiedShape ? '' : 'disabled'} onclick="pasteInDiagram('${diagId}', ${canvasX}, ${canvasY}); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left flex items-center justify-between ${hasCopiedShape ? 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200' : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed'}">
            <span>Pegar</span><span class="text-[10px] text-slate-400">Ctrl+V</span>
          </button>
          <div class="my-1 border-t border-slate-200 dark:border-zinc-800"></div>
          <button type="button" onclick="deleteSelectedInDiagram('${diagId}'); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>Eliminar</span><span class="text-[10px] opacity-70">Supr</span>
          </button>
        `;
      } else if (targetType === 'connector') {
        itemsHtml = `
          <button type="button" onclick="deleteSelectedInDiagram('${diagId}'); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>Eliminar conexión</span><span class="text-[10px] opacity-70">Supr</span>
          </button>
        `;
      } else {
        itemsHtml = `
          <button type="button" ${hasCopiedShape ? '' : 'disabled'} onclick="pasteInDiagram('${diagId}', ${canvasX}, ${canvasY}); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left flex items-center justify-between ${hasCopiedShape ? 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200' : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed'}">
            <span>Pegar elemento</span><span class="text-[10px] text-slate-400">Ctrl+V</span>
          </button>
          <button type="button" onclick="addShapeToDiagramAt('${diagId}', 'text', ${canvasX}, ${canvasY}); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-between">
            <span>Agregar texto aquí</span><span class="text-[10px] text-slate-400">T</span>
          </button>
          <div class="my-1 border-t border-slate-200 dark:border-zinc-800"></div>
          <button type="button" onclick="copySelectedInDiagram('${diagId}'); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-between">
            <span>Copiar pizarra</span><span class="text-[10px] text-slate-400">Ctrl+C</span>
          </button>
          <button type="button" onclick="cutSelectedInDiagram('${diagId}'); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-between">
            <span>Cortar pizarra</span><span class="text-[10px] text-slate-400">Ctrl+X</span>
          </button>
          <button type="button" onclick="removeEntireDiagram('${diagId}'); closeDiagramContextMenu();" class="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>Eliminar pizarra</span><span class="text-[10px] opacity-70">Supr</span>
          </button>
        `;
      }

      itemsContainer.innerHTML = itemsHtml;
      menu.style.left = `${Math.min(ev.clientX, window.innerWidth - 220)}px`;
      menu.style.top = `${Math.min(ev.clientY, window.innerHeight - 190)}px`;
      menu.classList.remove('hidden');
    }

    function addShapeToDiagramAt(diagId, shapeType, x, y) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      setActiveDiagramFocus(diagId);
      const stateObj = parseDiagramState(widget);
      const rt = getDiagramRuntime(diagId);
      const defaultDim = getShapeDimensions(shapeType);
      const newId = 'sh-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      stateObj.shapes.push({
        id: newId,
        type: shapeType,
        x: Math.max(8, Math.round(x)),
        y: Math.max(8, Math.round(y)),
        w: defaultDim.w,
        h: defaultDim.h,
        html: '',
        text: ''
      });
      rt.selectedShapeId = newId;
      rt.editingShapeId = newId;
      rt.selectedConnectorId = null;
      rt.connectMode = false;
      rt.connectSourceId = null;
      rt.openDropdown = null;
      saveDiagramState(widget, stateObj);
      mountDiagramWidget(widget);
      enterShapeTextEditing(diagId, newId);
    }

    function copySelectedInDiagram(diagId) {
      persistShapeTextIfActive();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const rt = getDiagramRuntime(diagId);
      const stateObj = parseDiagramState(widget);
      if (rt.selectedShapeId) {
        const sh = stateObj.shapes.find(s => s.id === rt.selectedShapeId);
        if (!sh) return;
        appState.copiedDiagramShape = JSON.parse(JSON.stringify(sh));
        const tmp = document.createElement('div');
        tmp.innerHTML = sh.html !== undefined ? sh.html : (sh.text || '');
        writeTextToSystemClipboard((tmp.innerText || tmp.textContent || '').trim());
        showToast('✓ Elemento copiado (Ctrl+V para pegar)');
      } else {
        copyDiagramWidget(diagId, widget.querySelector('.btn-copy-diagram'));
      }
    }

    function cutSelectedInDiagram(diagId) {
      persistShapeTextIfActive();
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      const rt = getDiagramRuntime(diagId);
      const stateObj = parseDiagramState(widget);
      if (rt.selectedShapeId) {
        const sh = stateObj.shapes.find(s => s.id === rt.selectedShapeId);
        if (!sh) return;
        appState.copiedDiagramShape = JSON.parse(JSON.stringify(sh));
        const tmp = document.createElement('div');
        tmp.innerHTML = sh.html !== undefined ? sh.html : (sh.text || '');
        writeTextToSystemClipboard((tmp.innerText || tmp.textContent || '').trim());
        deleteSpecificShapeInDiagram(diagId, sh.id);
        showToast('✂ Elemento cortado (Ctrl+V para pegar)');
      } else {
        copyDiagramWidget(diagId, null);
        removeEntireDiagram(diagId);
        showToast('✂ Pizarra cortada (Ctrl+V en la hoja para pegar)');
      }
    }

    function pasteInDiagram(diagId, targetX, targetY) {
      if (!appState.copiedDiagramShape) return false;
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return false;
      setActiveDiagramFocus(diagId);
      const stateObj = parseDiagramState(widget);
      const rt = getDiagramRuntime(diagId);
      const cloned = JSON.parse(JSON.stringify(appState.copiedDiagramShape));
      const newId = 'sh-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const canvasW = Number(stateObj.canvasW) || 660;
      const canvasH = Number(stateObj.canvasH) || 300;
      const dim = getShapeDimensions(cloned);
      const px = typeof targetX === 'number' ? targetX : (Number(cloned.x) || 40) + 24;
      const py = typeof targetY === 'number' ? targetY : (Number(cloned.y) || 40) + 24;
      cloned.id = newId;
      cloned.x = Math.round(Math.min(Math.max(8, canvasW - dim.w - 8), Math.max(8, px)));
      cloned.y = Math.round(Math.min(Math.max(8, canvasH - dim.h - 8), Math.max(8, py)));
      // Shift source reference slightly so repeated Ctrl+V cascades neatly
      appState.copiedDiagramShape.x = cloned.x;
      appState.copiedDiagramShape.y = cloned.y;

      stateObj.shapes.push(cloned);
      rt.selectedShapeId = newId;
      rt.selectedConnectorId = null;
      rt.editingShapeId = null;
      saveDiagramState(widget, stateObj);
      mountDiagramWidget(widget);
      { const _ht = getActiveTab(); if (_ht) scheduleHistorySnapshot(_ht.id, true); }
      showToast('✓ Elemento pegado en la pizarra');
      return true;
    }

    function removeEntireDiagram(diagId) {
      const widget = getDiagramWidgetById(diagId);
      if (!widget) return;
      if (appState.activeDiagramId === diagId) {
        appState.activeDiagramId = null;
      }
      appState.activeShapeContext = null;
      widget.remove();
      handleLiveSheetInput();
      const _t = getActiveTab(); if (_t) scheduleHistorySnapshot(_t.id, true);
      showToast('Pizarra de formas eliminada');
    }

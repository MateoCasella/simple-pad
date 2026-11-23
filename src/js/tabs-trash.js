// ==========================================
    // 4. 15-DAY TRASH BIN (PAPELERA DE .TXT BORRADOS)
    // ==========================================
    function updateTrashBadge() {
      purgeExpiredTrash();
      const badge = document.getElementById('trashCountBadge');
      if (badge) {
        badge.textContent = (appState.trash || []).length;
      }
    }

    let selectedTrashId = null;

    function openTrashModal() {
      purgeExpiredTrash();
      selectedTrashId = null;
      const searchEl = document.getElementById('trashSearchInput');
      if (searchEl) searchEl.value = '';
      renderTrashList();
      document.getElementById('trashModal').classList.remove('hidden');
    }

    function closeTrashModal() {
      selectedTrashId = null;
      document.getElementById('trashModal').classList.add('hidden');
    }

    function selectTrashItem(trashId) {
      selectedTrashId = trashId;
      renderTrashList();
    }

    function formatTrashDate(ts) {
      const d = new Date(ts || Date.now());
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function formatTrashSize(htmlStr) {
      const bytes = new Blob([htmlStr || '']).size;
      if (bytes < 1024) return `${bytes} B`;
      return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
    }

    function updateTrashToolbarState(filteredCount) {
      const total = (appState.trash || []).length;
      const hasSel = Boolean(selectedTrashId && (appState.trash || []).some(t => t.id === selectedTrashId));
      const btnEmpty = document.getElementById('btnTrashEmpty');
      const btnRestSel = document.getElementById('btnTrashRestoreSel');
      const btnRestAll = document.getElementById('btnTrashRestoreAll');
      const btnDelSel = document.getElementById('btnTrashDeleteSel');
      if (btnEmpty) btnEmpty.disabled = total === 0;
      if (btnRestAll) btnRestAll.disabled = total === 0;
      if (btnRestSel) btnRestSel.disabled = !hasSel;
      if (btnDelSel) btnDelSel.disabled = !hasSel;

      const statusLeft = document.getElementById('trashStatusLeft');
      if (statusLeft) {
        const base = `${filteredCount} elemento${filteredCount === 1 ? '' : 's'}`;
        statusLeft.textContent = hasSel ? `${base}  |  1 elemento seleccionado` : base;
      }
    }

    function renderTrashList() {
      const container = document.getElementById('trashListContainer');
      if (!container) return;
      purgeExpiredTrash();

      const query = ((document.getElementById('trashSearchInput') || {}).value || '').trim().toLowerCase();
      const allItems = appState.trash || [];
      const items = query
        ? allItems.filter(it => (it.title || '').toLowerCase().includes(query))
        : allItems;

      if (selectedTrashId && !items.some(it => it.id === selectedTrashId)) {
        selectedTrashId = null;
      }

      updateTrashToolbarState(items.length);

      if (items.length === 0) {
        container.innerHTML = `<div class="h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 text-xs select-none">${
          allItems.length === 0 ? 'Esta carpeta está vacía.' : 'No se encontraron elementos.'
        }</div>`;
        return;
      }

      const now = Date.now();
      const rowsHtml = items.map(item => {
        const elapsedMs = Math.max(0, now - (item.deletedAt || now));
        const remainingDays = Math.max(1, Math.ceil((TRASH_RETENTION_MS - elapsedMs) / (24 * 60 * 60 * 1000)));
        const isSel = selectedTrashId === item.id;
        return `
          <tr
            data-trash-id="${item.id}"
            onclick="selectTrashItem('${item.id}')"
            ondblclick="restoreTabFromTrash('${item.id}')"
            title="Clic para seleccionar · Doble clic para restaurar"
            class="trash-row cursor-default border-b border-slate-100 dark:border-zinc-800/60 transition ${
              isSel
                ? 'bg-sky-100/80 dark:bg-sky-900/40 text-slate-900 dark:text-white'
                : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-200'
            }"
          >
            <td class="py-1.5 pl-3 pr-2 font-mono text-[11.5px]">
              <div class="flex items-center gap-2 min-w-0">
                <svg class="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span class="truncate">${escapeHtml(item.title || 'Sin título.txt')}</span>
              </div>
            </td>
            <td class="py-1.5 px-2 text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">${formatTrashDate(item.deletedAt)}</td>
            <td class="py-1.5 px-2 text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">${remainingDays} día${remainingDays === 1 ? '' : 's'}</td>
            <td class="py-1.5 pl-2 pr-3 text-[11px] text-slate-500 dark:text-zinc-400 text-right whitespace-nowrap">${formatTrashSize(item.html)}</td>
          </tr>
        `;
      }).join('');

      container.innerHTML = `
        <table class="w-full border-collapse text-left select-none">
          <thead class="sticky top-0 bg-white dark:bg-[#1e1e22] border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
            <tr>
              <th class="py-1.5 pl-3 pr-2 font-normal">Nombre</th>
              <th class="py-1.5 px-2 font-normal w-36">Fecha de eliminación</th>
              <th class="py-1.5 px-2 font-normal w-24">Vence en</th>
              <th class="py-1.5 pl-2 pr-3 font-normal text-right w-20">Tamaño</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `;
    }

    function restoreSelectedTrashItem() {
      if (!selectedTrashId) return;
      restoreTabFromTrash(selectedTrashId);
    }

    function deleteSelectedTrashItem() {
      if (!selectedTrashId) return;
      deletePermanentlyFromTrash(selectedTrashId);
    }

    function restoreAllFromTrash() {
      if (!appState.trash || appState.trash.length === 0) return;
      const count = appState.trash.length;
      appState.trash.forEach((item, idx) => {
        appState.tabs.push({
          id: 'tab-' + Date.now() + '-' + idx,
          title: item.title || 'Restaurado.txt',
          html: item.html || '<div><br></div>'
        });
      });
      appState.trash = [];
      selectedTrashId = null;
      appState.activeTabId = appState.tabs[appState.tabs.length - 1].id;
      saveTabsToStorage();
      renderAll();
      renderTrashList();
      closeTrashModal();
      showToast(`${count} archivo${count === 1 ? '' : 's'} restaurado${count === 1 ? '' : 's'}`);
    }

    function restoreTabFromTrash(trashId) {
      const idx = (appState.trash || []).findIndex(t => t.id === trashId);
      if (idx === -1) return;
      const restored = appState.trash.splice(idx, 1)[0];
      const newTab = {
        id: 'tab-' + Date.now(),
        title: restored.title || 'Restaurado.txt',
        html: restored.html || '<div><br></div>'
      };
      appState.tabs.push(newTab);
      appState.activeTabId = newTab.id;
      selectedTrashId = null;
      saveTabsToStorage();
      renderAll();
      renderTrashList();
      closeTrashModal();
      showToast(`"${newTab.title}" restaurado`);
    }

    function deletePermanentlyFromTrash(trashId) {
      appState.trash = (appState.trash || []).filter(t => t.id !== trashId);
      if (selectedTrashId === trashId) selectedTrashId = null;
      saveTabsToStorage();
      renderTrashList();
      showToast('Archivo eliminado definitivamente');
    }

    function emptyAllTrash() {
      appState.trash = [];
      selectedTrashId = null;
      saveTabsToStorage();
      renderTrashList();
      showToast('Papelera vaciada');
    }

    // ==========================================
    // TABS MANAGEMENT (CLOSING SENDS TO 15-DAY TRASH)
    // ==========================================
    function renderTabsStrip() {
      const strip = document.getElementById('tabsStrip');
      if (!strip) return;
      strip.innerHTML = '';

      appState.tabs.forEach(tab => {
        const isActive = tab.id === appState.activeTabId;
        const tabEl = document.createElement('div');
        const isWin98 = appState.uiStyle !== 'modern';
        tabEl.className = isWin98
          ? `group flex items-center gap-2 px-3 py-1 text-[11.5px] cursor-pointer shrink-0 max-w-[210px] font-mono ${
              isActive
                ? 'bg-[#c0c0c0] dark:bg-[#2b2b2b] text-black dark:text-white font-bold border-t-2 border-l-2 border-white dark:border-[#555] border-r-2 border-r-[#404040] dark:border-r-[#111] relative top-[1px]'
                : 'bg-[#a8a8a8] dark:bg-[#1f1f1f] text-black/85 dark:text-zinc-300 border-t border-l border-[#dfdfdf] dark:border-[#3a3a3a] border-r border-r-[#404040] hover:bg-[#b8b8b8] dark:hover:bg-[#2a2a2a]'
            }`
          : `group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-[11.5px] cursor-pointer border-t border-x transition shrink-0 max-w-[210px] font-mono ${
              isActive
                ? 'bg-[#f9fafc] dark:bg-[#24262b] text-slate-900 dark:text-white font-semibold border-[#dce3ec] dark:border-[#30333b] shadow-2xs'
                : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-white/60 dark:hover:bg-[#24262b]/60 hover:text-slate-800 dark:hover:text-slate-200'
            }`;
        tabEl.title = 'Doble clic o clic derecho para renombrar';
        tabEl.onclick = () => switchTab(tab.id);
        tabEl.ondblclick = (ev) => {
          ev.stopPropagation();
          openRenameTabModal(tab.id);
        };
        tabEl.oncontextmenu = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          openTabContextMenu(ev.clientX, ev.clientY, tab.id);
        };

        const titleSpan = document.createElement('span');
        titleSpan.className = 'truncate select-none';
        titleSpan.textContent = tab.title || 'Sin título.txt';
        tabEl.appendChild(titleSpan);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'p-0.5 rounded hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-800 dark:hover:text-white text-[10px] leading-none';
        closeBtn.title = 'Enviar a Papelera (15 días)';
        closeBtn.textContent = '✕';
        closeBtn.onclick = (ev) => {
          ev.stopPropagation();
          closeTabById(tab.id);
        };
        tabEl.appendChild(closeBtn);

        strip.appendChild(tabEl);
      });
      updateTrashBadge();
    }

    function openTabContextMenu(x, y, tabId) {
      appState.contextMenuTabId = tabId;
      const menu = document.getElementById('tabContextMenu');
      if (!menu) return;
      const clampedX = Math.min(window.innerWidth - 200, Math.max(8, x));
      const clampedY = Math.min(window.innerHeight - 100, Math.max(8, y));
      menu.style.left = `${clampedX}px`;
      menu.style.top = `${clampedY}px`;
      menu.classList.remove('hidden');
    }

    function closeTabContextMenu() {
      const menu = document.getElementById('tabContextMenu');
      if (menu) menu.classList.add('hidden');
    }

    function triggerRenameFromContextMenu() {
      const targetId = appState.contextMenuTabId || appState.activeTabId;
      closeTabContextMenu();
      closeDiagramContextMenu();
      openRenameTabModal(targetId);
    }

    function triggerCloseFromContextMenu() {
      const targetId = appState.contextMenuTabId || appState.activeTabId;
      closeTabContextMenu();
      closeTabById(targetId);
    }

    function switchTab(tabId) {
      closeCommandPalette();
      closeWordAutocomplete();
      appState.activeTabId = tabId;
      appState.savedRange = null;
      appState.activeDiagramId = null;
      appState.activeShapeContext = null;
      saveTabsToStorage();
      renderAll();
      const editor = document.getElementById('liveSheetEditor');
      if (editor) editor.focus();
    }

    function createNewTab() {
      closeCommandPalette();
      closeWordAutocomplete();
      const nextNum = appState.tabs.length + 1;
      const newTab = {
        id: 'tab-' + Date.now(),
        title: `Sin título ${nextNum}.txt`,
        html: '<div><br></div>'
      };
      appState.tabs.push(newTab);
      appState.activeTabId = newTab.id;
      appState.savedRange = null;
      appState.activeDiagramId = null;
      appState.activeShapeContext = null;
      saveTabsToStorage();
      renderAll();
      const editor = document.getElementById('liveSheetEditor');
      if (editor) editor.focus();
      showToast('Nueva pestaña creada');
    }

    function closeTabById(tabId) {
      const targetTab = appState.tabs.find(t => t.id === tabId);
      if (targetTab) {
        appState.trash = appState.trash || [];
        appState.trash.unshift({
          id: 'trash-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          title: targetTab.title || 'Sin título.txt',
          html: targetTab.html || '',
          deletedAt: Date.now()
        });
      }

      if (appState.tabs.length <= 1) {
        appState.tabs[0] = {
          id: 'tab-' + Date.now(),
          title: 'Sin título 1.txt',
          html: '<div><br></div>'
        };
        appState.activeTabId = appState.tabs[0].id;
        saveTabsToStorage();
        renderAll();
        showToast('Enviado a Papelera (disponible por 15 días)');
        return;
      }
      const idx = appState.tabs.findIndex(t => t.id === tabId);
      appState.tabs = appState.tabs.filter(t => t.id !== tabId);
      if (appState.activeTabId === tabId) {
        const nextTab = appState.tabs[Math.max(0, idx - 1)];
        appState.activeTabId = nextTab.id;
      }
      saveTabsToStorage();
      renderAll();
      showToast('Enviado a Papelera (disponible por 15 días)');
    }

    function closeActiveTab() {
      closeTabById(appState.activeTabId);
    }

    function openRenameTabModal(tabId) {
      const targetId = tabId || appState.activeTabId;
      appState.renamingTabId = targetId;
      const tab = appState.tabs.find(t => t.id === targetId) || getActiveTab();
      if (!tab) return;
      const input = document.getElementById('renameTabInput');
      input.value = tab.title || '';
      document.getElementById('renameTabModal').classList.remove('hidden');
      input.focus();
      input.select();
    }

    function closeRenameTabModal() {
      document.getElementById('renameTabModal').classList.add('hidden');
    }

    function confirmRenameTab() {
      const val = document.getElementById('renameTabInput').value.trim();
      if (!val) return;
      const targetId = appState.renamingTabId || appState.activeTabId;
      const tab = appState.tabs.find(t => t.id === targetId) || getActiveTab();
      if (tab) {
        tab.title = val;
        saveTabsToStorage();
        renderTabsStrip();
        showToast('Pestaña renombrada');
      }
      closeRenameTabModal();
    }

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 800,
    minWidth: 760,
    minHeight: 520,
    title: 'Simple Pad',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    backgroundColor: '#f4f4f5',
    show: true,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: true
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Native right-click context menu on editable text / selections
  mainWindow.webContents.on('context-menu', (_event, params) => {
    const hasSelection = Boolean(params.selectionText && params.selectionText.trim().length > 0);
    if (!params.isEditable && !hasSelection) return;

    const template = [];

    if (params.misspelledWord && Array.isArray(params.dictionarySuggestions) && params.dictionarySuggestions.length > 0) {
      params.dictionarySuggestions.slice(0, 5).forEach(suggestion => {
        template.push({
          label: suggestion,
          click: () => mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents.replaceMisspelling(suggestion)
        });
      });
      template.push({ type: 'separator' });
    }

    if (params.isEditable) {
      template.push(
        { role: 'undo', label: 'Deshacer / Undo' },
        { role: 'redo', label: 'Rehacer / Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar / Cut', enabled: hasSelection },
        { role: 'copy', label: 'Copiar / Copy', enabled: hasSelection },
        { role: 'paste', label: 'Pegar / Paste' },
        { role: 'pasteAndMatchStyle', label: 'Pegar sin formato / Paste plain' },
        { type: 'separator' },
        { role: 'selectAll', label: 'Seleccionar todo / Select all' }
      );
    } else if (hasSelection) {
      template.push(
        { role: 'copy', label: 'Copiar / Copy' },
        { role: 'selectAll', label: 'Seleccionar todo / Select all' }
      );
    }

    if (template.length > 0 && mainWindow && !mainWindow.isDestroyed()) {
      const menu = Menu.buildFromTemplate(template);
      menu.popup({ window: mainWindow });
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
}

ipcMain.on('window:minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
});

ipcMain.on('window:toggleMaximize', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});

ipcMain.on('window:close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
});

ipcMain.handle('dialog:openFile', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Open file in Simple Pad',
    properties: ['openFile'],
    filters: [
      { name: 'Supported notes (.md, .txt, .html, .json)', extensions: ['md', 'txt', 'html', 'htm', 'json'] },
      { name: 'Markdown (.md)', extensions: ['md'] },
      { name: 'Plain text (.txt)', extensions: ['txt'] },
      { name: 'All files', extensions: ['*'] }
    ]
  });
  if (res.canceled || !res.filePaths || res.filePaths.length === 0) {
    return { canceled: true };
  }
  const filePath = res.filePaths[0];
  const content = await fs.readFile(filePath, 'utf-8');
  return {
    canceled: false,
    filePath,
    fileName: path.basename(filePath),
    content
  };
});

ipcMain.handle('dialog:saveFile', async (_event, { filePath, defaultName, content, ext }) => {
  let targetPath = filePath || '';
  if (!targetPath) {
    const extLower = (ext || 'md').toLowerCase();
    const filterMap = {
      md: { name: 'Formatted Markdown (.md)', extensions: ['md'] },
      txt: { name: 'Plain text (.txt)', extensions: ['txt'] },
      html: { name: 'HTML document (.html)', extensions: ['html'] },
      json: { name: 'Simple Pad backup (.json)', extensions: ['json'] }
    };
    const res = await dialog.showSaveDialog({
      title: 'Save in Simple Pad',
      defaultPath: defaultName || `note.${extLower}`,
      filters: [filterMap[extLower] || filterMap.md, { name: 'All files', extensions: ['*'] }]
    });
    if (res.canceled || !res.filePath) {
      return { canceled: true };
    }
    targetPath = res.filePath;
  }
  await fs.writeFile(targetPath, content || '', 'utf-8');
  return {
    canceled: false,
    filePath: targetPath,
    fileName: path.basename(targetPath)
  };
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  mainWindow = null;
  if (process.platform !== 'darwin') app.quit();
});

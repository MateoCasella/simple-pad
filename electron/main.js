const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');

function createWindow() {
  const win = new BrowserWindow({
    width: 1240,
    height: 800,
    minWidth: 760,
    minHeight: 520,
    title: 'Simple Pad',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    backgroundColor: '#c0c0c0',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));
}

ipcMain.handle('dialog:openFile', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Abrir nota en Simple Pad',
    properties: ['openFile'],
    filters: [
      { name: 'Notas compatibles (.md, .txt, .html, .json)', extensions: ['md', 'txt', 'html', 'htm', 'json'] },
      { name: 'Markdown (.md)', extensions: ['md'] },
      { name: 'Texto plano (.txt)', extensions: ['txt'] },
      { name: 'Todos los archivos', extensions: ['*'] }
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
      md: { name: 'Markdown con formato (.md)', extensions: ['md'] },
      txt: { name: 'Texto plano (.txt)', extensions: ['txt'] },
      html: { name: 'Documento HTML (.html)', extensions: ['html'] },
      json: { name: 'Respaldo Simple Pad (.json)', extensions: ['json'] }
    };
    const res = await dialog.showSaveDialog({
      title: 'Guardar en Simple Pad',
      defaultPath: defaultName || `nota.${extLower}`,
      filters: [filterMap[extLower] || filterMap.md, { name: 'Todos los archivos', extensions: ['*'] }]
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
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

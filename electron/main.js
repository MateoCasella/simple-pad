const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow = null;

// Single-instance lock: reopening Simple Pad focuses the running window instantly
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 800,
    minWidth: 760,
    minHeight: 520,
    title: 'Simple Pad',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    backgroundColor: '#f4f4f5',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
}

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
  if (process.platform !== 'darwin') app.quit();
});

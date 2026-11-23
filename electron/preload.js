const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('simplePadDesktop', {
  isDesktop: true,
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (opts) => ipcRenderer.invoke('dialog:saveFile', opts),
  setTitleBarTheme: (opts) => ipcRenderer.send('window:setTitleBarOverlay', opts)
});

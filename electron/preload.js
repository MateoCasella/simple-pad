const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('simplePadDesktop', {
  isDesktop: true,
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (opts) => ipcRenderer.invoke('dialog:saveFile', opts),
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggleMaximize'),
  close: () => ipcRenderer.send('window:close')
});

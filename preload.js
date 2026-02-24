const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNewTab: (callback) => ipcRenderer.on('new-tab', (event, url) => callback(url)),
  onCloseTab: (callback) => ipcRenderer.on('close-tab', callback),
  onGoBack: (callback) => ipcRenderer.on('go-back', callback),
  onGoForward: (callback) => ipcRenderer.on('go-forward', callback),

  sendNewTab: (url) => ipcRenderer.send('new-tab', url),

  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated', (event, data) => callback(data)),

  onDownload: (callback) => ipcRenderer.on('download-item', (event, item) => callback(item)),

  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
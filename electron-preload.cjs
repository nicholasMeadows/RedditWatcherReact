const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  checkForOrCreateConfigFolder: () =>
    ipcRenderer.invoke("checkForOrCreateConfigFolder"),
  checkForOrCreateConfigFile: (defaultFileValue) =>
    ipcRenderer.invoke("checkForOrCreateConfigFile", defaultFileValue),
  checkForOrCreateSubredditListsFile: (defaultFileValue) =>
    ipcRenderer.invoke("checkForOrCreateSubredditListsFile", defaultFileValue),
  readConfigFromFile: () => ipcRenderer.invoke("readConfigFromFile"),
  readSubredditListsFromFile: () =>
    ipcRenderer.invoke("readSubredditListsFromFile"),
  saveConfig: (encodedContent) =>
    ipcRenderer.invoke("saveConfig", encodedContent),
  saveSubredditLists: (encodedContent) =>
    ipcRenderer.invoke("saveSubredditLists", encodedContent),
});

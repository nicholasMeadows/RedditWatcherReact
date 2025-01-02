import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel as string, (event, ...args) => listener(event, ...args))
  },
  off(args: Parameters<typeof ipcRenderer.off>) {
    const [channel, listener] = args
    return ipcRenderer.off(channel as string, listener)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld("electronAPI", {
  checkForOrCreateConfigFolder: () =>
      ipcRenderer.invoke("checkForOrCreateConfigFolder"),
  checkForOrCreateConfigFile: (defaultFileValue: string | NodeJS.ArrayBufferView) =>
      ipcRenderer.invoke("checkForOrCreateConfigFile", defaultFileValue),
  checkForOrCreateSubredditListsFile: (defaultFileValue: string | NodeJS.ArrayBufferView) =>
      ipcRenderer.invoke("checkForOrCreateSubredditListsFile", defaultFileValue),
  readConfigFromFile: () => ipcRenderer.invoke("readConfigFromFile"),
  readSubredditListsFromFile: () =>
      ipcRenderer.invoke("readSubredditListsFromFile"),
  saveConfig: (encodedContent: string | NodeJS.ArrayBufferView) =>
      ipcRenderer.invoke("saveConfig", encodedContent),
  saveSubredditLists: (encodedContent: string | NodeJS.ArrayBufferView) =>
      ipcRenderer.invoke("saveSubredditLists", encodedContent),
  minimizeWindow: () => ipcRenderer.invoke("minimizeWindow")
});

import { app, BrowserWindow, globalShortcut, ipcMain, session, IpcMainInvokeEvent} from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import * as fs from "fs";
import AutoUpdater from "./auto-updater.ts";
import WindowPositionSizeManager, {
  WindowPositionSizeConfig
} from "./window-position-size-manager.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist', 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'react-app')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const autoUpdater = new AutoUpdater();

// SSL/TSL: this is the self signed certificate support
//@ts-expect-error The callback method requires these params but we dont need them.
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // On certificate error we disable default behaviour (stop loading the page)
  // and we then say "it is all fine - true" to the callback
  event.preventDefault();
  callback(true);
});
function createWindow(windowPositionSizeConfig: WindowPositionSizeConfig | undefined) {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    show: false
  })

  if(windowPositionSizeConfig !== undefined) {
    const size = windowPositionSizeConfig.size;
    const position = windowPositionSizeConfig.position;
    win.setSize(size.width, size.height);
    win.setPosition(position.x, position.y);
    if(windowPositionSizeConfig.isMaximized) {
      win.maximize();
    }
  }

  win.show();
  if(app.isPackaged) {
    win.removeMenu();
  }

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on("close", () => {
    if(win != null) {
      new WindowPositionSizeManager().saveWindowConfig(win);
    }
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  autoUpdater.destroy();
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    const windowConfig = new WindowPositionSizeManager().getWindowConfig();
    createWindow(windowConfig);
  }
})
setupIpcHandlers();
app.whenReady().then(() => {
  const windowConfig = new WindowPositionSizeManager().getWindowConfig();
  createWindow(windowConfig);
  autoUpdater.initAutoUpdater();
  setupGlobalShortcut()
  setupOriginHeaderRemoval();
})

function setupOriginHeaderRemoval() {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    let requestHeadersToReturn;
    if (details.requestHeaders["Origin"] != undefined) {
      details.requestHeaders["Origin"] = "*";
      requestHeadersToReturn = details.requestHeaders;
    } else {
      requestHeadersToReturn = { Origin: "*", ...details.requestHeaders };
    }
    callback({
      requestHeaders: requestHeadersToReturn,
    });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let responseHeaders;

    if (details.responseHeaders !== undefined && details.responseHeaders["access-control-allow-origin"] != undefined) {
      details.responseHeaders["access-control-allow-origin"] = ["*"];
      responseHeaders = details.responseHeaders;
    } else {
      responseHeaders = {
        "access-control-allow-origin": ["*"],
        ...details.responseHeaders,
      };
    }

    callback({
      responseHeaders: responseHeaders,
    });
  });
}

function setupIpcHandlers() {
  app.whenReady().then(() => {
    ipcMain.handle(
        "checkForOrCreateConfigFolder",
        checkForOrCreateConfigFolder
    );
    ipcMain.handle("checkForOrCreateConfigFile", checkForOrCreateConfigFile);
    ipcMain.handle(
        "checkForOrCreateSubredditListsFile",
        checkForOrCreateSubredditListsFile
    );
    ipcMain.handle("readConfigFromFile", readConfigFromFile);
    ipcMain.handle("readSubredditListsFromFile", readSubredditListsFromFile);
    ipcMain.handle("saveConfig", saveConfig);
    ipcMain.handle("saveSubredditLists", saveSubredditLists);
  });
}

function setupGlobalShortcut() {
  const quitAccelerator = "CommandOrControl+W";
  if (!globalShortcut.isRegistered(quitAccelerator)) {
    globalShortcut.register(quitAccelerator, () => {
      if (win !== null && win.isFocused()) {
        app.quit();
      }
    });
  }
  app.on("will-quit", () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
  });
}

const CONFIG_FOLDER = "config";
const CONFIG_FILE = "config.json";
const SUBREDDIT_LISTS_FILE = "subredditLists.json";
const APP_NAME = app.getName();
const getAbsoluteConfigDir = () => {
  const appDataDir = app.getPath("appData");
  return path.join(appDataDir, APP_NAME, CONFIG_FOLDER);
};
const getAbsoluteConfigFilePath = () => {
  return path.join(getAbsoluteConfigDir(), CONFIG_FILE);
};
const getAbsoluteSubredditListsFilePath = () => {
  return path.join(getAbsoluteConfigDir(), SUBREDDIT_LISTS_FILE);
};

const checkForOrCreateConfigFolder = async () => {
  const absConfigDir = getAbsoluteConfigDir();
  console.log(`checkForOrCreateConfigFolder - absConfigDir is ${absConfigDir}`);
  if (!fs.existsSync(absConfigDir)) {
    console.log(
        "checkForOrCreateConfigFolder - config director did not exist. Creating it now"
    );
    fs.mkdirSync(absConfigDir);
  }
};
const checkForOrCreateConfigFile = async (event: IpcMainInvokeEvent, defaultFileValue: string | NodeJS.ArrayBufferView) => {
  console.log(`Inside ${event} handler`)
  const absConfigFile = getAbsoluteConfigFilePath();
  console.log(`checkForOrCreateConfigFile - absConfigFile is ${absConfigFile}`);
  if (!fs.existsSync(absConfigFile)) {
    console.log(
        `checkForOrCreateConfigFile - config file did not exist. Creating it with default content ${defaultFileValue}`
    );
    fs.writeFileSync(absConfigFile, defaultFileValue);
  }
};
const checkForOrCreateSubredditListsFile = async (event: IpcMainInvokeEvent, defaultFileValue: string | NodeJS.ArrayBufferView) => {
  console.log(`Inside ${event} handler`)
  const absSubredditListsFile = getAbsoluteSubredditListsFilePath();
  console.log(
      `checkForOrCreateSubredditListsFile - absSubredditListsFile is ${absSubredditListsFile}`
  );
  if (!fs.existsSync(absSubredditListsFile)) {
    console.log(
        `checkForOrCreateSubredditListsFile - subreddit lists file did not exist. Creating it with default content ${defaultFileValue}`
    );
    fs.writeFileSync(absSubredditListsFile, defaultFileValue);
  }
};
const readConfigFromFile = async () => {
  const configFilePath = getAbsoluteConfigFilePath();
  console.log(
      `readConfigFromFile - reading config from file ${configFilePath}`
  );
  if (!fs.existsSync(configFilePath)) {
    console.log(
        `readConfigFromFile - config file did not exist. Returning "" instead.`
    );
    return "";
  } else {
    console.log(
        `readConfigFromFile - config file existed. Reading and returning file content.`
    );
    return fs.readFileSync(configFilePath).toString();
  }
};
const readSubredditListsFromFile = async () => {
  const subredditListsFilePath = getAbsoluteSubredditListsFilePath();
  console.log(
      `readSubredditListsFromFile - reading subreddit lists from file ${subredditListsFilePath}`
  );
  if (!fs.existsSync(subredditListsFilePath)) {
    console.log(
        `readSubredditListsFromFile - subreddit lists file did not exist. Returning "" instead.`
    );
    return "";
  } else {
    console.log(
        `readSubredditListsFromFile - subreddit lists file existed. Reading and returning file content.`
    );
    return fs.readFileSync(subredditListsFilePath).toString();
  }
};
const saveConfig = async (event: IpcMainInvokeEvent, encodedContent: string | NodeJS.ArrayBufferView) => {
  console.log(`Inside ${event} handler`)
  await checkForOrCreateConfigFolder();
  const configFilePath = getAbsoluteConfigFilePath();
  console.log(`saveConfig = saving config file to ${configFilePath}`);
  fs.writeFileSync(configFilePath, encodedContent);
};
const saveSubredditLists = async (event: IpcMainInvokeEvent, encodedContent: string | NodeJS.ArrayBufferView) => {
  console.log(`Inside ${event} handler`)
  await checkForOrCreateConfigFolder();
  const subredditListsFilePath = getAbsoluteSubredditListsFilePath();
  console.log(
      `saveSubredditLists - saving subreddit lists to ${subredditListsFilePath}`
  );
  fs.writeFileSync(subredditListsFilePath, encodedContent);
};

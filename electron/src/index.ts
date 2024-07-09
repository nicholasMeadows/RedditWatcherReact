import type { CapacitorElectronConfig } from "@capacitor-community/electron";
import {
  getCapacitorElectronConfig,
  setupElectronDeepLinking,
} from "@capacitor-community/electron";
import {
  app,
  globalShortcut,
  ipcMain,
  MenuItem,
  MenuItemConstructorOptions,
  session,
} from "electron";
import electronIsDev from "electron-is-dev";
import unhandled from "electron-unhandled";

import { ElectronCapacitorApp, setupReloadWatcher } from "./setup";
import electronSquirrelStartup from "electron-squirrel-startup";
import path from "node:path";
import * as fs from "fs";
import { updateElectronApp } from "update-electron-app";

updateElectronApp();
if (electronSquirrelStartup) process.exit();
// Graceful handling of unhandled errors.
unhandled();

// Define our menu templates (these are optional)
const trayMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  new MenuItem({ label: "Quit App", role: "quit" }),
];
const appMenuBarMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  { role: process.platform === "darwin" ? "appMenu" : "fileMenu" },
  { role: "viewMenu" },
];

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig =
  getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(
  capacitorFileConfig,
  trayMenuTemplate,
  appMenuBarMenuTemplate
);

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol:
      capacitorFileConfig.electron.deepLinkingCustomProtocol ??
      "mycapacitorapp",
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

// Run Application
(async () => {
  setupIpcHandlers();
  // Wait for electron app to be ready.
  await app.whenReady();
  setupGlobalShortcut();
  setupOriginHeaderRemoval();
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  // setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
  // Initialize our app, build windows, and load content.
  await myCapacitorApp.init();
  // Check for updates if we are in a packaged app.
})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on("activate", async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line
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
    if (details.responseHeaders["access-control-allow-origin"] != undefined) {
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
      if (myCapacitorApp.getMainWindow().isFocused()) {
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
const checkForOrCreateConfigFile = async (event, defaultFileValue) => {
  const absConfigFile = getAbsoluteConfigFilePath();
  console.log(`checkForOrCreateConfigFile - absConfigFile is ${absConfigFile}`);
  if (!fs.existsSync(absConfigFile)) {
    console.log(
      `checkForOrCreateConfigFile - config file did not exist. Creating it with default content ${defaultFileValue}`
    );
    fs.writeFileSync(absConfigFile, defaultFileValue);
  }
};
const checkForOrCreateSubredditListsFile = async (event, defaultFileValue) => {
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
const saveConfig = async (event, encodedContent) => {
  await checkForOrCreateConfigFolder();
  const configFilePath = getAbsoluteConfigFilePath();
  console.log(`saveConfig = saving config file to ${configFilePath}`);
  fs.writeFileSync(configFilePath, encodedContent);
};
const saveSubredditLists = async (event, encodedContent) => {
  await checkForOrCreateConfigFolder();
  const subredditListsFilePath = getAbsoluteSubredditListsFilePath();
  console.log(
    `saveSubredditLists - saving subreddit lists to ${subredditListsFilePath}`
  );
  fs.writeFileSync(subredditListsFilePath, encodedContent);
};

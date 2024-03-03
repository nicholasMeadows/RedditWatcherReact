const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("node:path");
const electronSquirrelStartup = require("electron-squirrel-startup");
const { ipcRenderer } = require("electron/renderer");
const fs = require("fs");

if (electronSquirrelStartup) app.quit();

const isDev = () => {
  return process.env.APP_DEV != undefined;
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  if (!isDev()) {
    win.removeMenu();
  }

  win.loadFile(path.join(__dirname, "dist", "index.html"));
  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
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
    }
  );

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
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
};
app.whenReady().then(() => {
  ipcMain.handle("checkForOrCreateConfigFolder", checkForOrCreateConfigFolder);
  ipcMain.handle("checkForOrCreateConfigFile", checkForOrCreateConfigFile);
  ipcMain.handle(
    "checkForOrCreateSubredditListsFile",
    checkForOrCreateSubredditListsFile
  );
  ipcMain.handle("readConfigFromFile", readConfigFromFile);
  ipcMain.handle("readSubredditListsFromFile", readSubredditListsFromFile);
  ipcMain.handle("saveConfig", saveConfig);
  ipcMain.handle("saveSubredditLists", saveSubredditLists);

  const quitAccelerator = "CommandOrControl+W";
  if (!globalShortcut.isRegistered(quitAccelerator)) {
    globalShortcut.register(quitAccelerator, () => {
      app.quit();
    });
  }
  createWindow();
});
app.on("will-quit", () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

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

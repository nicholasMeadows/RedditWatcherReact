import { app, BrowserWindow } from "electron";
import electronSquirrelStartup from "electron-squirrel-startup";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (electronSquirrelStartup) app.quit();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  // win.removeMenu();
  win.loadFile(path.resolve(__dirname, "dist", "index.html"));
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
  createWindow();
});

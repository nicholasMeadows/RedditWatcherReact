/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const { app, BrowserWindow } = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  win.removeMenu();
  win.loadFile(path.resolve(__dirname, "www", "index.html"));
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

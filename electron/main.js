/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const { app, BrowserWindow } = require("electron");
const path = require("path");
const express = require("express");

const expressApp = express();
expressApp.use(express.static(path.resolve(__dirname, "www")));
expressApp.get("*", (req, res) => {
  console.log("returning path", path.resolve(__dirname, "www", "index.html"));
  res.sendFile(path.resolve(__dirname, "www", "index.html"));
});
// if not in production use the port 5000
const PORT = 5000;
console.log("server started on port:", PORT);
expressApp.listen(PORT);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadURL("http://localhost:5000");
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

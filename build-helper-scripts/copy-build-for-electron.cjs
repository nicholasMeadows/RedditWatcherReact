const path = require("path");
const fs = require("fs");

const reactBuildFolder = path.join(__dirname, "..", "dist");
const electronDestinationFolder = path.join(
  __dirname,
  "..",
  "electron",
  "dist"
);
fs.cpSync(reactBuildFolder, electronDestinationFolder, { recursive: true });

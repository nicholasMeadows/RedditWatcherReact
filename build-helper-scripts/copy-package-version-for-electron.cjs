const basePackageJson = require("../package.json");
const electronPackageJson = require('../electron/package.json')
const fs = require("fs");
const path = require("node:path");

const appVersion = basePackageJson.version;
electronPackageJson.version = appVersion;

fs.writeFileSync(path.join(__dirname, "..", "electron", "package.json"), JSON.stringify(electronPackageJson, null, 2))
const path = require("path")
const fs = require("fs");

const reactProjectBuildOutFolder = path.join(__dirname, "..", "dist");
const electronAppBuildFolder = path.join(__dirname, "..", "electron", "dist")
const electronOutFolder = path.join(__dirname, "..", "electron", "out");

if (fs.existsSync(reactProjectBuildOutFolder)) {
    fs.rmSync(reactProjectBuildOutFolder, {recursive: true, force: true});
}

if (fs.existsSync(electronAppBuildFolder)) {
    fs.rmSync(electronAppBuildFolder, {recursive: true, force: true});
}
if (fs.existsSync(electronOutFolder)) {
    fs.rmSync(electronOutFolder, {recursive: true, force: true});
}
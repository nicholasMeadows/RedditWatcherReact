import * as path from "node:path";
import packageJson from "../package.json";

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, "app", "icon.ico"),
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        loadingGif: path.join(__dirname, "app", "icon.gif"),
        version: packageJson.version,
        setupExe: packageJson.name + "-" + packageJson.version + ".exe",
      },
    },
    {
      name: "@electron-forge/maker-zip",
    },
  ],
};

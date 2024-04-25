import * as path from "node:path";
import { config } from "dotenv";

config({ path: "../.env" });
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
      },
    },
    {
      name: "@electron-forge/maker-zip",
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "nicholasMeadows",
          name: "RedditWatcherReact",
        },
        prerelease: false,
        draft: false,
      },
    },
  ],
};

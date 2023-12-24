const path = require("path");

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, "public", "icon.ico"),
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "electron_quick_start",
        loadingGif: "public/icon.gif",
      },
    },
    {
      name: "@electron-forge/maker-zip",
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
};

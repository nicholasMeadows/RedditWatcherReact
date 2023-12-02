import fs from "fs";
function copyDir(src, dest) {
  if (
    fs.existsSync(src) &&
    fs.lstatSync(src).isDirectory() &&
    fs.existsSync(dest) &&
    fs.lstatSync(dest).isDirectory()
  ) {
    fs.readdirSync(src).forEach(function (file) {
      var curSrcPath = src + "/" + file;
      var curDestPath = dest + "/" + file;
      if (fs.lstatSync(curSrcPath).isDirectory()) {
        if (!fs.existsSync(curDestPath)) {
          fs.mkdirSync(curDestPath);
        }
        copyDir(curSrcPath, curDestPath);
      } else {
        fs.copyFileSync(curSrcPath, curDestPath);
      }
    });
  }
}

const src = "./dist";
const dest = "./electron/www";
console.log(`Copying from ${src} to ${dest}`);

copyDir(src, dest);

console.log("Successfully copied!!");

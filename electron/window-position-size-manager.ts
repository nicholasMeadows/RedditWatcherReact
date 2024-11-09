import {app, BrowserWindow} from "electron"
import path from "node:path";
import * as fs from "fs";

export type WindowPositionSizeConfig ={
    position: {
        x: number,
        y: number,
    },
    size: {
        width: number,
        height: number,
    },
    isMaximized: boolean
}
export default class WindowPositionSizeManager {
    saveWindowConfig(window: BrowserWindow) {
        const position = window.getPosition();
        const x = position[0];
        const y = position[1];

        const size = window.getSize();
        const width = size[0];
        const height = size[1];
        const isMaximized = window.isMaximized();

        const windowConfig: WindowPositionSizeConfig = {
            position: {
                x: x,
                y: y,
            },
            size: {
                width: width,
                height: height,
            },
            isMaximized: isMaximized
        }
        const jsonContentToWrite = JSON.stringify(windowConfig);
        const path = this.getConfigFilePath();
        console.log(`Saving window position/size to ${path})`);
        fs.writeFileSync(path, jsonContentToWrite);
    }

    getWindowConfig(): WindowPositionSizeConfig | undefined{
        const configFilePath = this.getConfigFilePath();
        if(!fs.existsSync(configFilePath)) {
            return undefined
        }
        const fileContent = fs.readFileSync(this.getConfigFilePath(), {encoding: "utf-8"});
        return JSON.parse(fileContent);
    }

    private getConfigFilePath() {
        const userDataPath = app.getPath("userData");
        const configFolder = path.join(userDataPath, "windowConfig");

        const folderExists = fs.existsSync(configFolder);
        if(!folderExists) {
            fs.mkdirSync(configFolder);
        }
        return path.join(configFolder, "windowConfig.json");
    }

}
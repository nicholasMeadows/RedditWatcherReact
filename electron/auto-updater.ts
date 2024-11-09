import { autoUpdater as electronAutoUpdater } from 'electron-updater';
import {dialog, MessageBoxOptions} from "electron"

export default class AutoUpdater {
    initAutoUpdater() {
        electronAutoUpdater.on('update-downloaded', () => {
            const dialogOpts: MessageBoxOptions = {
                    type: 'info',
                    buttons: ['Restart', 'Not Now. On next Restart'],
                    title: 'Update',
                    message: "Update available. Restart now?",
                    detail: 'A New Version has been Downloaded. Restart Now to Complete the Update.'
            }

            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) electronAutoUpdater.quitAndInstall()
            })
        })

        electronAutoUpdater.on('error', message => {
            console.error('There was a problem updating the application')
            console.error(message)
        })

        setInterval(() => {
            electronAutoUpdater.checkForUpdates()
        }, 60000);
        electronAutoUpdater.checkForUpdates()
    }

    destroy() {
        electronAutoUpdater.removeAllListeners();
    }
}
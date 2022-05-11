const { ipcMain, app } = require('electron');
const { exec, execFile } = require('child_process');
const path = require('path');

exports.initCmd = function (win) {
    ipcMain.on('DoCommand', (event, args) => {
        let file = path.join(app.getAppPath(), 'resources', args.Path);
        let cwd = path.join(app.getAppPath(), 'resources')
        let cmdArgs = args.Other.split(' ');
        execFile(file, cmdArgs, { cwd: cwd }, function (error, stdout, stderr) {
            win.webContents.send('CommandReturn', {
                error: error,
                stdout: stdout,
                stderr: stderr
            })
        })
    })
}
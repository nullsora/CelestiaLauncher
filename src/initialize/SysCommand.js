const { ipcMain } = require('electron');
const { exec } = require('child_process');

exports.InitCmdExecuteIn = function (win) {
    ipcMain.on('DoCmd', (event, args) => {
        let cwd = args.Cwd;
        let command = args.Cmds.join(' && ');
        console.log(command);
        let running = exec(command, { cwd: cwd, maxBuffer: Infinity }, (err, data, stderr) => {
            win.webContents.send('CmdReturn', {
                Return: data,
                Error: err,
                Stderr: stderr
            });
        });
        running.stdout.on('data', (data) => {
            win.webContents.send('CmdLog', {
                Data: data
            });
        });
    });
};
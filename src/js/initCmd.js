const { ipcMain, app } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const cmd = require('node-cmd');

exports.initCmd = function (win) {
    ipcMain.on('DoFileCommand', (event, args) => {
        let file = path.join(app.getAppPath(), 'resources', args.Path);
        let cwd = path.join(app.getAppPath(), 'resources', args.Cwd);
        let cmdArgs = args.Other.split(' ');
        let child = spawn(file, cmdArgs, {
            cwd: cwd,
            shell: true,
            encoding: 'gbk'
        });
        child.stdout.on('data', (data) => {
            win.webContents.send('FileCommandLog', {
                Log: data.toString()
            });
        });
        child.on('close', (code, signal) => {
            win.webContents.send('FileCommandReturn', {
                Return: code
            });
        });
    });
    ipcMain.on('DoSysCommand', (event, args) => {
        let cwd = path.join(app.getAppPath(), 'resources', args.Cwd);
        let command = 'cd ' + cwd;
        for (i in args.Command) {
            command += (' && ' + args.Command[i]);
        }
        cmd.run(command, function (err, data, stderr) {
            win.webContents.send('SysCommandReturn', {
                Return: data,
                Error: err,
                Stderr: stderr
            });
        });
    });
};
const { ipcMain, app } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');

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
        let command = 'chcp 65001 && ' + args.Command.join(' && ');
        console.log(command);
        exec(command, { cwd: cwd, maxBuffer: Infinity }, (err, data, stderr) => {
            win.webContents.send('SysCommandReturn', {
                Return: data,
                Error: err,
                Stderr: stderr
            });
        });
    });
};
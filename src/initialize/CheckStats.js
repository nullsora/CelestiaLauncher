const fs = require('fs');
const { app, ipcMain } = require('electron');
const path = require('path');
const ResPath = {
    JDK: path.join(app.getAppPath(), 'resources/jdk-17.0.3+7/bin/java.exe'),
    Mongo: path.join(app.getAppPath(), 'resources/mongodb-win32-x86_64-windows-5.0.8/bin/mongod.exe'),
    Git: path.join(app.getAppPath(), 'resources/git/cmd/git.exe'),
    GC: path.join(app.getAppPath(), 'resources/Grasscutter/gradlew'),
    GCR: path.join(app.getAppPath(), 'resources/Grasscutter_Resources/README.md'),
    GCConfig: path.join(app.getAppPath(), 'resources/Grasscutter/config.json')
};

exports.CheckFileStatsIn = function (win) {
    var stats = {
        hasJDK: false,
        hasMongo: false,
        hasGit: false,
        hasGC: false,
        hasGCR: false,
        hasGCConfig: false
    };
    ipcMain.on('GetStats', (event, args) => {
        try { fs.accessSync(ResPath.JDK); stats.hasJDK = true; } catch (e) { stats.hasJDK = false; }
        try { fs.accessSync(ResPath.Mongo); stats.hasMongo = true; } catch (e) { stats.hasMongo = false; }
        try { fs.accessSync(ResPath.Git); stats.hasGit = true; } catch (e) { stats.hasGit = false; }
        try { fs.accessSync(ResPath.GC); stats.hasGC = true; } catch (e) { stats.hasGC = false; }
        try { fs.accessSync(ResPath.GCR); stats.hasGCR = true; } catch (e) { stats.hasGCR = false; }
        try { fs.accessSync(ResPath.GCConfig); stats.hasGCConfig = true; } catch (e) { stats.hasGCConfig = false; }
        win.webContents.send('StatsReturn', { Stats: stats });
    });
};
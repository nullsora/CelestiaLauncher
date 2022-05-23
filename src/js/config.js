const { ipcRenderer } = require('electron');
const { shell } = require('electron');
const path = require('path');
const fs = require('fs');

let appPath, resPath, fileStats, launcherConf, gitPath, confPath = 'conf/config.json';

let CmdDialog = {
    dialog: new mdui.Dialog('#CmdDialog', { modal: true }),
    content: document.getElementById('CmdContent'),
    log: document.getElementById('CmdLog'),
    confirmBtn: document.getElementById('CmdConfirmBtn')
};

let GCSettings = {
    luaFolderPath: document.getElementById('LuaPath'),
    serverBindPort: document.getElementById('ServerPort'),
    serverIP: document.getElementById('ServerIP'),
    gameIP: document.getElementById('GameIP'),
    autoCreateAccount: document.getElementById('AutoAccount'),
    useStamia: document.getElementById('Stamina')
};

let Elements = {
    loadGCSettings: document.getElementById('LoadGCSettings'),
    openPluginFolder: document.getElementById('OpenPluginFolder')
};

window.onload = function () {
    ipcRenderer.send('GetAppPath', {});
    ipcRenderer.once('ReturnAppPath', (event, args) => {
        appPath = args.ProgramPath;
        resPath = args.ResourcesPath;
        console.log(appPath);
        ipcRenderer.send('ReadJson', { Path: path.join(resPath, confPath) });
        ipcRenderer.once('JsonContent', (event, args) => {
            launcherConf = args.Obj;
        });
        ipcRenderer.send('GetStats', {});
        ipcRenderer.once('StatsReturn', (event, args) => {
            fileStats = args.Stats;
            if (fileStats.hasGCConfig) {
                Elements.loadGCSettings.removeAttribute('disabled');
            }
        });
        try {
            fs.accessSync(path.join(appPath, 'game/Grasscutter/plugins'));
            Elements.openPluginFolder.removeAttribute('disabled');
        } catch (e) { }
    });
};

function Caution(message) {
    mdui.snackbar({ message: message });
}

function AsyncSysCmd(title, command, cwd) {
    CmdDialog.dialog.open();
    CmdDialog.content.innerHTML = title;
    let currentCwd = path.join(appPath, 'game', cwd);
    ipcRenderer.send('DoCmd', { Cmds: command, Cwd: currentCwd });
    ipcRenderer.on('CmdLog', (event, args) => {
        console.log(args.Data);
        CmdDialog.log.innerHTML += args.Data;
    });
    ipcRenderer.once('CmdReturn', (event, args) => {
        CmdDialog.confirmBtn.removeAttribute('disabled');
        ipcRenderer.removeAllListeners('CmdLog');
        if (args.Error == null) {
            CmdDialog.log.innerHTML = 'Success.\n' + args.Return;
            Caution('执行成功');
        } else {
            CmdDialog.log.innerHTML += 'Execute failed. Exit because of ' + args.Error;
            console.error(args.Error);
            Caution('执行失败');
        }
    });
}

CmdDialog.confirmBtn.addEventListener('click', () => {
    CmdDialog.log.innerHTML = '';
    CmdDialog.confirmBtn.setAttribute('disabled', 'true');
});

Elements.loadGCSettings.addEventListener('click', () => {
    let GCConfig;
    ipcRenderer.send('ReadJson', { Path: path.join(appPath, 'game/Grasscutter/config.json') });
    ipcRenderer.once('JsonContent', (event, args) => {
        GCConfig = args.Obj;
        console.log(GCConfig);
        document.getElementById('GCSettings').removeAttribute('class');
        GCSettings.luaFolderPath.value = GCConfig.folderStructure.scripts;
        GCSettings.serverBindPort.value = GCConfig.server.http.bindPort;
        GCSettings.serverIP.value = GCConfig.server.http.accessAddress;
        GCSettings.gameIP.value = GCConfig.server.game.accessAddress;
        GCConfig.account.autoCreate ? GCSettings.autoCreateAccount.setAttribute('checked', '') : {};
        GCConfig.server.game.gameOptions.staminaUsage ? GCSettings.useStamia.setAttribute('checked', '') : {};
        document.getElementById('SaveChanges').addEventListener('click', () => {
            GCConfig.folderStructure.scripts = GCSettings.luaFolderPath.value;
            GCConfig.server.http.bindPort = GCSettings.serverBindPort.value;
            GCConfig.server.http.accessAddress = GCSettings.serverIP.value;
            GCConfig.server.game.accessAddress = GCSettings.gameIP.value;
            GCConfig.account.autoCreate = GCSettings.autoCreateAccount.checked;
            GCConfig.server.game.gameOptions.staminaUsage = GCSettings.useStamia.checked;
            ipcRenderer.send('WriteJson', { Path: path.join(appPath, 'game/Grasscutter/config.json'), Obj: GCConfig });
        });
    });
});

Elements.openPluginFolder.addEventListener('click', () => {
    shell.openPath(path.join(appPath, 'game/Grasscutter/plugins'));
});
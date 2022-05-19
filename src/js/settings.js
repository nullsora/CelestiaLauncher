const { ipcRenderer } = require('electron');
const path = require('path');

let appPath, resPath, fileStats, launcherConf, confPath = 'conf/config.json';

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
    autoUpdate: document.getElementById('AutoUpdate'),
    useMongoService: document.getElementById('UseMongoService'),
    useJDKPath: document.getElementById('UseJDKPath'),
    useGitPath: document.getElementById('UseGitPath'),
    loadGCSettings: document.getElementById('LoadGCSettings'),
    resetConfig: document.getElementById('ResetConfig'),
    removeall: document.getElementById('RemoveAll')
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
            launcherConf.AutoUpdate ? Elements.autoUpdate.setAttribute('checked', true) : {};
            launcherConf.UseMongoService ? Elements.useMongoService.setAttribute('checked', true) : {};
            launcherConf.UseJDKPath ? Elements.useJDKPath.setAttribute('checked', true) : {};
            launcherConf.UseGitPath ? Elements.useGitPath.setAttribute('checked', true) : {};
        });
        ipcRenderer.send('GetStats', {});
        ipcRenderer.once('StatsReturn', (event, args) => {
            fileStats = args.Stats;
            if (fileStats.hasGCConfig) {
                Elements.loadGCSettings.removeAttribute('disabled');
            }
        });
    });
};

function Caution(message) {
    mdui.snackbar({ message: message, position: 'left-bottom' });
}

function WriteConf() {
    ipcRenderer.send('WriteJson', { Path: path.join(resPath, confPath), Obj: launcherConf });
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

function RemoveAll() {
    let commands = ['cd .\\'];
    if (fileStats.hasJDK) { commands.push('rd /q /s .\\jdk-17.0.3+7'); }
    if (fileStats.hasMongo) {
        commands.push('rd /q /s .\\mongodb-win32-x86_64-windows-5.0.8\\bin');
        commands.push('del /q /s .\\mongodb-win32-x86_64-windows-5.0.8\\data\\*.*');
    }
    if (fileStats.hasGit) { commands.push('rd /q /s .\\git'); }
    if (fileStats.hasGC) { commands.push('rd /q /s .\\Grasscutter'); }
    if (fileStats.hasGCR) { commands.push('rd /q /s .\\Grasscutter_Resources'); }
    AsyncSysCmd(
        '正在删除全部内容...',
        commands,
        ''
    );
}

Elements.autoUpdate.addEventListener('click', () => {
    if (Elements.autoUpdate.checked) {
        Caution('请确保已经存在Git并已在启动器中设置。打开后会在你每次进入配置页面时自动更新（不编译）。');
        launcherConf.AutoUpdate = true;
        WriteConf();
    } else {
        launcherConf.AutoUpdate = false;
        WriteConf();
    }
});

Elements.useMongoService.addEventListener('click', () => {
    if (Elements.useMongoService.checked) {
        Caution('请确保系统中已经设置并启用了MongoDB服务。');
        launcherConf.UseMongoService = true;
        WriteConf();
    } else {
        launcherConf.UseMongoService = false;
        WriteConf();
    }
});

Elements.useJDKPath.addEventListener('click', () => {
    if (Elements.useJDKPath.checked) {
        Caution('请确保系统中有JDK17以上的JDK环境，并且设置了Path和JAVA_HOME。');
        launcherConf.UseJDKPath = true;
        WriteConf();
    } else {
        launcherConf.UseJDKPath = false;
        WriteConf();
    }
});

Elements.useGitPath.addEventListener('click', () => {
    if (Elements.useGitPath.checked) {
        Caution('请确保设置了Git的环境变量。');
        launcherConf.UseGitPath = true;
        WriteConf();
    } else {
        launcherConf.UseGitPath = false;
        WriteConf();
    }
});

Elements.resetConfig.addEventListener('click', () => {
    ipcRenderer.send('ReadJson', { Path: path.join(resPath, 'conf/defaultconfig.json') });
    ipcRenderer.once('JsonContent', (event, args) => {
        ipcRenderer.send('WriteJson', { Path: path.join(resPath, confPath), Obj: args.Obj });
        location.reload();
    });
});

Elements.removeall.addEventListener('click', () => {
    mdui.snackbar({
        message: '您确定要删除所有已下载资源吗？',
        buttonText: '确定',
        onButtonClick: function () {
            RemoveAll();
        }
    });
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

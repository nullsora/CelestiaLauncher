var ipc = require('electron').ipcRenderer;
var path = require('path');

var confPath = 'conf/config.json';
var appPath, launcherConfig, stats;

var AutoUpdate = document.getElementById('AutoUpdate'),
    UseMongoService = document.getElementById('UseMongoService'),
    UseJDKPath = document.getElementById('UseJDKPath'),
    UseGitPath = document.getElementById('UseGitPath');

var configDialog = new mdui.Dialog('#Config', { modal: true });

var configContent = document.getElementById('ConfigContent'),
    configConfirm = document.getElementById('ConfigConfirm'),
    configLog = document.getElementById('ConfigLog'),
    loadGCS = document.getElementById('LoadGCSettings');

var GCS = {
    luaPath: document.getElementById('LuaPath'),
    sPort: document.getElementById('ServerPort'),
    sIP: document.getElementById('ServerIP'),
    gIP: document.getElementById('GameIP'),
    aAcc: document.getElementById('AutoAccount'),
    stm: document.getElementById('Stamina')
};

function Caution(message) {
    mdui.snackbar({ message: message, position: 'left-bottom' });
}

function WriteConf() {
    ipc.send('WriteConf', { Path: confPath, Obj: launcherConfig });
}

function AsyncSysCommand(title, command, cwd) {
    configDialog.open();
    configContent.innerHTML = title;
    ipc.send('DoSysCommand', {
        Command: command,
        Cwd: cwd
    });
    ipc.once('SysCommandReturn', (event, args) => {
        configConfirm.removeAttribute('disabled');
        console.log('return');
        if (args.Error == null) {
            configLog.innerHTML = 'success. ' + args.Return;
        } else {
            configLog.innerHTML = 'error.\n' + args.Error;
        }
        console.log(args.Return);
        console.error(args.Error);
        console.log(args.Stderr);
    });
}

window.onload = function () {
    ipc.send('GetAppPath', {});
    ipc.once('ReturnAppPath', (event, args) => {
        appPath = args.Path;
        console.log(appPath);
    });
    ipc.send('ReadConf', { Path: confPath });
    ipc.once('ConfContent', (event, args) => {
        launcherConfig = args.Obj;
        launcherConfig.AutoUpdate ? AutoUpdate.setAttribute('checked', true) : {};
        launcherConfig.UseMongoService ? UseMongoService.setAttribute('checked', true) : {};
        launcherConfig.UseJDKPath ? UseJDKPath.setAttribute('checked', true) : {};
        launcherConfig.UseGitPath ? UseGitPath.setAttribute('checked', true) : {};
    });
    ipc.send('GetStats', {});
    ipc.once('StatsReturn', (event, args) => {
        stats = args.Stats;
        if (stats.hasGC) {
            loadGCS.removeAttribute('disabled');
        }
    });
};

AutoUpdate.addEventListener('click', () => {
    if (AutoUpdate.checked) {
        Caution('请确保已经存在Git并已在启动器中设置。打开后会在你每次进入配置页面时自动更新（不编译）。');
        launcherConfig.AutoUpdate = true;
        WriteConf();
    } else {
        launcherConfig.AutoUpdate = false;
        WriteConf();
    }
});

UseMongoService.addEventListener('click', () => {
    if (UseMongoService.checked) {
        Caution('请确保系统中已经设置并启用了MongoDB服务。');
        launcherConfig.UseMongoService = true;
        WriteConf();
    } else {
        launcherConfig.UseMongoService = false;
        WriteConf();
    }
});

UseJDKPath.addEventListener('click', () => {
    if (UseJDKPath.checked) {
        Caution('请确保系统中有JDK17以上的JDK环境，并且设置了Path和JAVA_HOME。');
        launcherConfig.UseJDKPath = true;
        WriteConf();
    } else {
        launcherConfig.UseJDKPath = false;
        WriteConf();
    }
});

UseGitPath.addEventListener('click', () => {
    if (UseGitPath.checked) {
        Caution('请确保设置了Git的环境变量。');
        launcherConfig.UseGitPath = true;
        WriteConf();
    } else {
        launcherConfig.UseGitPath = false;
        WriteConf();
    }
});

function RemoveAll() {
    let commands = [];
    if (stats.hasJDK) { commands.push('rd /q /s .\\jdk17.0.3+7'); }
    if (stats.hasMongo) {
        commands.push('rd /q /s .\\mongodb-win32-x86_64-windows-5.0.8\\bin');
        commands.push('del /q /s .\\mongodb-win32-x86_64-windows-5.0.8\\data\\*.*');
    }
    if (stats.hasGit) { commands.push('rd /q /s .\\git'); }
    if (stats.hasGC) { commands.push('rd /q /s .\\Grasscutter'); }
    if (stats.hasGCR) { commands.push('rd /q /s .\\Grasscutter_Resources'); }
    AsyncSysCommand(
        '正在删除全部内容...',
        commands,
        ''
    );
}

document.getElementById('ResetConfig').addEventListener('click', () => {
    ipc.send('ReadConf', { Path: 'conf/defaultconfig.json' });
    ipc.once('ConfContent', (event, args) => {
        ipc.send('WriteConf', { Path: confPath, Obj: args.Obj });
        location.reload();
    });
});

document.getElementById('RemoveAll').addEventListener('click', () => {
    mdui.snackbar({
        message: '您确定要删除所有已下载资源吗？',
        buttonText: '确定',
        onButtonClick: function () {
            RemoveAll();
        }
    });
});

loadGCS.addEventListener('click', () => {
    let GCConfig;
    ipc.send('ReadConf', { Path: 'resources/Grasscutter/config.json' });
    ipc.once('ConfContent', (event, args) => {
        GCConfig = args.Obj;
        console.log(GCConfig);
        document.getElementById('GCSettings').removeAttribute('class');
        GCS.luaPath.value = GCConfig.folderStructure.scripts;
        GCS.sPort.value = GCConfig.server.http.bindPort;
        GCS.sIP.value = GCConfig.server.http.accessAddress;
        GCS.gIP.value = GCConfig.server.game.accessAddress;
        GCConfig.account.autoCreate ? GCS.aAcc.setAttribute('checked', '') : {};
        GCConfig.server.game.gameOptions.staminaUsage ? GCS.stm.setAttribute('checked', '') : {};
        document.getElementById('SaveChanges').addEventListener('click', () => {
            GCConfig.folderStructure.scripts = GCS.luaPath.value;
            GCConfig.server.http.bindPort = GCS.sPort.value;
            GCConfig.server.http.accessAddress = GCS.sIP.value;
            GCConfig.server.game.accessAddress = GCS.gIP.value;
            GCConfig.account.autoCreate = GCS.aAcc.checked;
            GCConfig.server.game.gameOptions.staminaUsage = GCS.stm.checked;
            ipc.send('WriteConf', { Path: 'resources/Grasscutter/config.json', Obj: GCConfig });
        });
    });
});

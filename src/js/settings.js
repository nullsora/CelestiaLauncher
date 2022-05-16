var ipc = require('electron').ipcRenderer;
var path = require('path');
var confPath = 'conf/config.json';
var appPath, launcherConfig;
var AutoUpdate = document.getElementById('AutoUpdate'),
    UseMongoService = document.getElementById('UseMongoService'),
    UseJDKPath = document.getElementById('UseJDKPath'),
    UseGitPath = document.getElementById('UseGitPath');
var configDialog = new mdui.Dialog('#Config', { modal: true });
var configContent = document.getElementById('ConfigContent'),
    configConfirm = document.getElementById('ConfigConfirm'),
    configLog = document.getElementById('ConfigLog');

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

document.getElementById('ResetConfig').addEventListener('click', () => {
    ipc.send('ReadConf', { Path: 'conf/defaultconfig.json' });
    ipc.once('ConfContent', (event, args) => {
        ipc.send('WriteConf', { Path: confPath, Obj: args.Obj });
        location.reload();
    });
});

document.getElementById('ClearAll').addEventListener('click', () => {
    mdui.snackbar({
        message: '您确定要删除所有已下载资源吗？',
        buttonText: '确定',
        onButtonClick: function () {
            mdui.alert('还没做呢（');
        }
    });
});
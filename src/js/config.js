var ipc = require('electron').ipcRenderer;
var shell = require('electron').shell;
var path = require('path');
var fs = require('fs');

var appPath, stats, config, confPath = 'conf/config.json';

var configDialog = new mdui.Dialog('#Config', { modal: true });

var configContent = document.getElementById('ConfigContent'),
    configConfirm = document.getElementById('ConfigConfirm'),
    configLog = document.getElementById('ConfigLog');

var GCUpdate = document.getElementById('GrasscutterUpdate'),
    GCCompile = document.getElementById('GrasscutterCompile'),
    GCPrecompile = document.getElementById('GrasscutterPrecompile'),
    configureGC = document.getElementById('ConfigureGC'),
    changeBranch = document.getElementById('ChangeBranch');

window.onload = function () {
    ipc.send('GetAppPath', {});
    ipc.once('ReturnAppPath', (event, args) => {
        appPath = args.Path;
        console.log(appPath);
    });
    ipc.send('ReadConf', { Path: confPath });
    ipc.once('ConfContent', (event, args) => {
        config = args.Obj;
        if (config.AutoUpdate) {
            FileCommand(
                '正在从github拉取更新...',
                config.UseGitPath ? 'git' : path.join(appPath, 'resources/git/cmd/git.exe'),
                'pull',
                'Grasscutter'
            );
        }
        setInterval(UpdateStats(), 500);
    });
};

function Caution(message) {
    mdui.snackbar({ message: message });
}

function UpdateStats() {
    ipc.send('GetStats', {});
    ipc.once('StatsReturn', (event, args) => {
        stats = args.Stats;
        if ((stats.hasGit || config.UseGitPath) && stats.hasGC) {
            GCUpdate.removeAttribute('disabled');
            changeBranch.removeAttribute('disabled');
        } else {
            GCUpdate.setAttribute('disabled', 'true');
            changeBranch.setAttribute('disabled', 'true');
        }
        if ((stats.hasJDK || config.UseJDKPath) && stats.hasGC) {
            if (stats.hasGCR) {
                configureGC.setAttribute('class', 'mdui-list-item mdui-ripple');
            } else {
                configureGC.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
            }
            GCCompile.removeAttribute('disabled');
            GCPrecompile.setAttribute('class', 'mdui-list-item mdui-ripple');
        } else {
            GCCompile.setAttribute('disabled', 'true');
            GCPrecompile.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
            configureGC.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
        }
    });
}

function FileCommand(title, path, other, cwd) {
    configDialog.open();
    configContent.innerHTML = title;
    ipc.send('DoFileCommand', {
        Path: path,
        Other: other,
        Cwd: cwd
    });
    ipc.once('FileCommandLog', (event, args) => {
        configLog.innerHTML = args.Log;
        console.log(args.Log);
    });
    ipc.once('FileCommandReturn', (event, args) => {
        configConfirm.removeAttribute('disabled');
        if (args.Return == 0) {
            configLog.innerHTML += 'success.';
            Caution('执行完毕');
        } else {
            configLog.innerHTML = 'execute failed. exit with code ' + args.Return;
            Caution('执行失败');
        }
    });
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
            Caution('执行完毕');
        } else {
            configLog.innerHTML = 'error.\n' + args.Error;
            Caution('执行失败');
        }
        console.log(args.Return);
        console.error(args.Error);
        console.log(args.Stderr);
    });
}

configConfirm.addEventListener('click', () => {
    configConfirm.setAttribute('disabled', 'true');
    configLog.innerHTML = '';
});

GCUpdate.addEventListener('click', () => {
    FileCommand(
        '正在从github拉取更新...',
        config.UseGitPath ? 'git' : path.join(appPath, 'resources/git/cmd/git.exe'),
        'pull',
        'Grasscutter'
    );
});

GCCompile.addEventListener('click', () => {
    let jdkPath = path.join(appPath, 'resources\\jdk-17.0.3+7');
    AsyncSysCommand(
        '正在编译为Jar File...',
        config.UseJDKPath ?
            ['.\\gradlew jar'] :
            ['set JAVA_HOME=' + jdkPath, '.\\gradlew jar'],
        'Grasscutter'
    );
});

GCPrecompile.addEventListener('click', () => {
    if ((stats.hasJDK || config.UseJDKPath) && stats.hasGC) {
        let jdkPath = path.join(appPath, 'resources/jdk-17.0.3+7');
        let gradlewBatPath = path.join(appPath, 'resources\\Grasscutter\\gradlew.bat');
        let gradlewBatClonePath = path.join(appPath, 'resources\\Grasscutter\\gradlewclone.bat');
        let gradlewBatContent;
        try {
            fs.accessSync(gradlewBatClonePath);
            gradlewBatContent = fs.readFileSync(gradlewBatClonePath);
        } catch (err) {
            gradlewBatContent = fs.readFileSync(gradlewBatPath);
            fs.writeFileSync(gradlewBatClonePath, gradlewBatContent);
        }
        fs.writeFileSync(gradlewBatPath, config.UseJDKPath ? '' : 'set JAVA_HOME=' + jdkPath + '\n');
        fs.appendFileSync(gradlewBatPath, gradlewBatContent);
        shell.openPath(gradlewBatPath);
    }
});

configureGC.addEventListener('click', () => {
    if ((stats.hasJDK || config.UseJDKPath) && stats.hasGC && stats.hasGCR) {
        AsyncSysCommand(
            '正在配置Grasscutter...',
            [
                'mkdir .\\Grasscutter\\resources',
                'xcopy /Q /H /E /Y .\\Grasscutter_Resources\\Resources .\\Grasscutter\\resources',
                'xcopy /H /E /Y .\\GC_res_fix\\AvatarCostumeExcelConfigData.json .\\Grasscutter\\resources\\ExcelBinOutput\\AvatarCostumeExcelConfigData.json'
            ],
            ''
        );
    }
});

changeBranch.addEventListener('click', () => {
    if ((stats.hasGit || config.UseGitPath) && stats.hasGC) {
        let branchName = document.getElementById('BranchInput').value;
        console.log(branchName);
        FileCommand(
            '正在切换分支到' + branchName,
            config.UseGitPath ? 'git' : path.join(appPath, 'resources/git/cmd/git.exe'),
            'checkout ' + branchName,
            'Grasscutter'
        );
    }
});
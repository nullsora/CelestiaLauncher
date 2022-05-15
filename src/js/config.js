var ipc = require('electron').ipcRenderer;
var shell = require('electron').shell;
var path = require('path');
var fs = require('fs');
var configDialog = new mdui.Dialog('#Config', { modal: true });
var appPath;

window.onload = function () {
    ipc.send('GetAppPath', {});
    ipc.on('ReturnAppPath', (event, args) => {
        appPath = args.Path;
        console.log(appPath);
    });
};

function FileCommand(title, path, other, cwd) {
    configDialog.open();
    document.getElementById('ConfigContent').innerHTML = title;
    ipc.send('DoFileCommand', {
        Path: path,
        Other: other,
        Cwd: cwd
    });
    ipc.once('FileCommandLog', (event, args) => {
        document.getElementById('ConfigLog').innerHTML = args.Log;
        console.log(args.Log);
    });
    ipc.once('FileCommandReturn', (event, args) => {
        document.getElementById('ConfigConfirm').removeAttribute('disabled');
        if (args.Return == 0) {
            document.getElementById('ConfigLog').innerHTML += 'success.';
        } else {
            document.getElementById('ConfigLog').innerHTML = 'execute failed. exit with code ' + args.Return;
        }
    });
}

function AsyncSysCommand(title, command, cwd) {
    configDialog.open();
    document.getElementById('ConfigContent').innerHTML = title;
    ipc.send('DoSysCommand', {
        Command: command,
        Cwd: cwd
    });
    ipc.once('SysCommandReturn', (event, args) => {
        document.getElementById('ConfigConfirm').removeAttribute('disabled');
        console.log('return');
        if (args.Error == null) {
            document.getElementById('ConfigLog').innerHTML = 'success. ' + args.Return;
        } else {
            document.getElementById('ConfigLog').innerHTML = 'error.\n' + args.Error;
        }
        console.log(args.Return);
        console.error(args.Error);
        console.log(args.Stderr);
    });
}

document.getElementById('ConfigConfirm').addEventListener('click', () => {
    document.getElementById('ConfigConfirm').setAttribute('disabled', 'true');
    document.getElementById('ConfigLog').innerHTML = '';
});

document.getElementById('GrasscutterUpdate').addEventListener('click', () => {
    FileCommand(
        '正在从github拉取更新...',
        'git/cmd/git.exe',
        'pull',
        'Grasscutter'
    );
});

document.getElementById('GrasscutterCompile').addEventListener('click', () => {
    let jdkPath = path.join(appPath, 'resources\\jdk-17.0.3+7');
    AsyncSysCommand(
        '正在编译为Jar File...',
        ['set JAVA_HOME=' + jdkPath, '.\\gradlew jar'],
        'Grasscutter'
    );
});

document.getElementById('GrasscutterPrecompile').addEventListener('click', () => {
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
    fs.writeFileSync(gradlewBatPath, 'set JAVA_HOME=' + jdkPath + '\n');
    fs.appendFileSync(gradlewBatPath, gradlewBatContent);
    shell.openPath(gradlewBatPath);
});

document.getElementById('ConfigureGC').addEventListener('click', () => {
    AsyncSysCommand(
        '正在配置Grasscutter...',
        [
            'mkdir .\\Grasscutter\\resources',
            'xcopy /Q /H /E /Y .\\Grasscutter_Resources\\Resources .\\Grasscutter\\resources',
            'xcopy /H /E /Y .\\GC_res_fix\\AvatarCostumeExcelConfigData.json .\\Grasscutter\\resources\\ExcelBinOutput\\AvatarCostumeExcelConfigData.json',
            'xcopy /H /E /Y .\\GC_res_fix\\Banners.json .\\Grasscutter\\data\\Banners.json'
        ],
        ''
    );
});

document.getElementById('ChangeBranch').addEventListener('click', () => {
    let branchName = document.getElementById('BranchInput').value;
    console.log(branchName);
    FileCommand(
        '正在切换分支到' + branchName,
        'git/cmd/git.exe',
        'checkout ' + branchName,
        'Grasscutter'
    );
});
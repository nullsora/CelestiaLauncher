var ipc = require('electron').ipcRenderer;
var shell = require('electron').shell;
var path = require('path');
var fs = require('fs');
var $ = mdui.$;
var jarSelect = new mdui.Select('#JarSelect');
var appPath, stats, config, confPath = 'conf/config.json';
var jarPath = [];

window.onload = function () {
    ipc.send('GetAppPath', {});
    ipc.once('ReturnAppPath', (event, args) => {
        appPath = args.Path;
        console.log(appPath);
        let filePath = path.join(appPath, 'resources\\Grasscutter');

        fs.readdir(filePath, function (err, files) {
            if (err) {
                console.warn(err, "读取文件夹错误！");
            } else {
                files.forEach(function (fileName) {
                    let fileDir = path.join(filePath, fileName);
                    fs.stat(fileDir, function (err, stats) {
                        if (err) {
                            console.warn('获取文件stats失败');
                        } else {
                            let isFile = stats.isFile();
                            if (isFile && path.extname(fileDir) == '.jar') {
                                let value = jarPath.push(fileDir);
                                $('#JarSelect').append('<option value="' + value + '">' + fileName + '</option>');
                                jarSelect.handleUpdate();
                                console.log(jarPath.toString());
                            }
                        }
                    });
                });
            }
        });
    });
    ipc.send('ReadConf', { Path: confPath });
    ipc.once('ConfContent', (event, args) => {
        config = args.Obj;
        UpdateStats();
    });
};

function UpdateStats() {
    ipc.send('GetStats', {});
    ipc.once('StatsReturn', (event, args) => {
        stats = args.Stats;
        if ((stats.hasJDK || config.UseJDKPath) && (stats.hasMongo || config.UseMongoService)) {
            document.getElementById('LaunchGame').removeAttribute('disabled');
        } else {
            document.getElementById('LaunchGame').setAttribute('disabled', 'true');
        }
    });
}

document.getElementById('LaunchGame').addEventListener('click', () => {
    let mongoPath = path.join(appPath, 'resources\\launchmongo.bat');
    let launchPath = path.join(appPath, 'resources\\launchgame.bat');
    let jdkPath = path.join(appPath, 'resources\\jdk-17.0.3+7\\bin\\java.exe');
    let value = document.getElementById('JarSelect').selectedIndex;
    let launchContent = '@echo off\ncd .\\Grasscutter\\\n' +
        (config.UseJDKPath ? 'java' : jdkPath) +
        ' -jar ' + jarPath[value];
    fs.writeFileSync(launchPath, launchContent);
    config.UseMongoService ? {} : shell.openPath(mongoPath);
    setTimeout(() => {
        shell.openPath(launchPath);
    }, 1000);
});
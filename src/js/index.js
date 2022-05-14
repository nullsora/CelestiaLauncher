var ipc = require('electron').ipcRenderer;
var shell = require('electron').shell;
var path = require('path');
var fs = require('fs');
var $ = mdui.$;
var jarSelect = new mdui.Select('#JarSelect');
var appPath;
var jarPath = [];

window.onload = function () {
    ipc.send('GetAppPath', {});
    ipc.on('ReturnAppPath', (event, args) => {
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
};

document.getElementById('LaunchGame').addEventListener('click', () => {
    let mongoPath = path.join(appPath, 'resources\\launchmongo.bat');
    let launchPath = path.join(appPath, 'resources\\launchgame.bat');
    let jdkPath = path.join(appPath, 'resources\\jdk-17.0.3+7\\bin\\java.exe');
    let value = document.getElementById('JarSelect').selectedIndex;
    let launchContent = '@echo off\ncd .\\Grasscutter\\\n' + jdkPath + ' -jar ' + jarPath[value];
    fs.writeFileSync(launchPath, launchContent);
    shell.openPath(mongoPath);
    setTimeout(() => {
        shell.openPath(launchPath);
    }, 1000);
});
var $ = mdui.$;
var Drawer;
var ipc = require('electron').ipcRenderer;


window.addEventListener('load', () => {
    var val =
        `<div class="mdui-appbar mdui-appbar-fixed dragline">
        <div class="mdui-toolbar mdui-color-theme">
            <a id="menu" class="mdui-btn mdui-btn-icon mdui-ripple">
                <i class="mdui-icon material-icons" mdui-tooltip="{content: '菜单'}">menu</i>
            </a>
            <a class="mdui-typo-title">Celestia Launcher</a>
            <div class="mdui-toolbar-spacer"></div>
            <a id="mini" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '最小化'}">
                <i class="mdui-icon material-icons">remove</i>
            </a>
            <a id="maxi" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '最大化'}">
                <i class="mdui-icon material-icons">airplay</i>
            </a>
            <a id="close" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '关闭'}">
                <i class="mdui-icon material-icons">close</i>
            </a>
        </div>
    </div>
    <div class="mdui-drawer mdui-drawer-close mdui-color-white" id="drawer">
        <div class="mdui-list">
            <li class="mdui-list-item mdui-ripple" id="link-main-page">
                <i class="mdui-list-item-avatar mdui-icon material-icons">apps</i>
                <div class="mdui-list-item-content">主页</div>
            </li>
            <li class="mdui-list-item mdui-ripple" id="link-download">
                <i class="mdui-list-item-avatar mdui-icon material-icons">cloud_download</i>
                <div class="mdui-list-item-content">下载</div>
            </li>
            <li class="mdui-list-item mdui-ripple" id="link-config">
                <i class="mdui-list-item-avatar mdui-icon material-icons">assignment</i>
                <div class="mdui-list-item-content">配置</div>
            </li>
        </div>
    </div>`;
    document.getElementById('base').innerHTML = val;
    
    Drawer = new mdui.Drawer('#drawer');
    document.getElementById('close').addEventListener('click', () => {
        ipc.send('window-close');
    })
    document.getElementById('maxi').addEventListener('click', () => {
        ipc.send('window-max');
    })
    document.getElementById('mini').addEventListener('click', () => {
        ipc.send('window-min');
    })

    document.getElementById('link-main-page').addEventListener('click', () => {
        setTimeout(window.open('./index.html', '_self'), 1500);
    })
    document.getElementById('link-download').addEventListener('click', () => {
        setTimeout(window.open('./download.html', '_self'), 1500);
    })
    document.getElementById('link-config').addEventListener('click', () => {
        setTimeout(window.open('./config.html', '_self'), 1500);
    })


    $('#menu').on('click', function () {
        Drawer.toggle();
    });
});




![csl.jpg](https://s2.loli.net/2022/05/14/7ajYoZDTyxrgRsN.jpg)

------------
中文 | [English](https://github.com/KL-kirito/CelestiaLauncher/blob/master/README_EN.md)

## 一个功能~~不~~强大的Grasscutter启动器

> 如果你还在为不会配置Grasscutter而烦恼，那么你一定要试试这款启动器。

## 简介：
考虑到Grasscutter配置的繁琐以及更新的速度之快，并且很多人并不会使用git来进行拉取，抑或是git的形式不适合于每一个人，在这样的条件下，**Celestia Launcher**应运而生。

Celestia Launcher使用node.js进行开发，使用mdui框架，保证其兼顾美观性的同时不失强大的性能。Electron的功能也使得Celestia Launcher有可能在未来成为全平台的GC启动器（画大饼）。

## 使用：
Celestia Launcher目前仅可在Windows平台使用。
在Release页面下载zip文件后，将它解压到一个剩余空间足够大的目录下，打开exe即可。


## 配置顺序：
请按照以下步骤完成Grasscutter的配置安装：
1. 点击左上角按钮，进入下载页面；
2. 下载Java、MongoDB以及Git，或者在偏好设置页面启用系统环境（如果您之前安装过）；
3. 下载Grasscutter和Grasscutter资源；

**请确保在此时Git已经下载完成！**

4. 进入配置页面，依次点击`配置Grasscutter`和`Grasscutter编译前准备`；

**请确保已经下载了Grasscutter和资源！**

到这里准备工作便全部完成了。

## 更新，编译和运行
配置页面中的两个按钮可以方便的拉取更新和编译Grasscutter。

您也可以在配置页面方便的切换Grasscutter的分支。

编译完成后，即可回到主页并运行。

**请注意：本启动器并不会帮助您设置代理。您可能需要手动设置。**

## 更新启动器
如果您在更新后不想再重新下载一遍文件，那么您应当保留`resources/app/resources`目录下的`jdk17.0.3+7`,`git`,`mongodb-win32-x86_64-windows-5.0.8`,`Grasscutter`和`Grasscutter_Resources`文件夹。

为了完全更新，您最好不要保留除上述文件夹外的其他文件和目录。

## 将要加入的特性：
手动配置环境；
应用内命令面板；
ID查询功能；
Grasscutter Config文件的便捷更改；

------------

如发现了各种问题，请到issues页面反馈。我会尽快修复bug。

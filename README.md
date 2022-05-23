![csl.jpg](https://s2.loli.net/2022/05/14/7ajYoZDTyxrgRsN.jpg)

一个便捷的 Grasscutter 依赖下载及启动工具

------

## 特性

- [x] 便捷且安全的下载依赖
- [x] 启动Grasscutter
- [x] 从Github更新Grasscutter并可编译
- [x] 允许使用系统环境变量
- [x] 便捷的对Grasscutter config文件进行更改
- [ ] 完善的自动更新功能
- [ ] 应用内命令面板
- [ ] ID查询

## 上手指南

以下内容将帮助您快速安装并上手Celestia Launcher。

### 安装要求

在下载并安装该软件前，请确保：

- 您的电脑运行着Windows 64位系统。
- 为软件及Grasscutter预留至少3GB的空间。

### 安装

您可以从Release页面下载该软件的最新版本。

- 如果您下载exe安装包，根据提示安装到有足够空间的目录下即可。
- 如果您下载zip压缩包，请解压到有足够空间的目录下。

随后，您便可以运行`Celestia Launcher.exe`以启动软件。

### 使用

启动软件后，您可以进入下载页面下载Grasscutter及其依赖。您也可以在偏好设置中选择使用系统环境变量。

#### 下载依赖

依次执行如下步骤：

- 下载`Git`，`Java`和`MongoDB`，或使用系统设置。
- 下载`Grasscutter`和`Grasscutter资源`。
- 点击`配置Grasscutter`和`Grasscutter编译前准备`。
- 点击下载页面左侧的`编译jar`按钮以生成Grasscutter Jar文件。

#### 运行Grasscutter

下载并配置全部依赖后，您可以回到主页，选择对应的jar文件并启动。

#### 更新Grasscutter

下载页面左侧的`更新Grasscutter`按钮可以帮您从github拉取最新更新。

在拉取完成后，仅需再次点击`编译jar`即可完成更新。

#### 切换Grasscutter分支

在下载页面中，您可以通过输入存在的Grasscutter分支名来切换到对应分支。

#### 配置Grasscutter

- 我们在配置页面实现了对Grasscutter常用配置的更改功能，您可以在配置文件生成后快速更改。
- 您也可以在配置页面快速打开插件文件夹。

#### 其他

- 页面中的内容不会在您完成对应依赖配置前可用。
- 下载页面会指示您对应依赖的下载状况。

### 更新

您可以通过保留安装目录下`game`目录中的内容来保留已下载的文件。其他目录或文件可以全部删除并替换。

## 从源码构建

您也可以通过源码运行或构建Celestia Launcher。

在构建之前，请确保您已经有`node.js`环境，并全局安装了`yarn`。

克隆源代码后，在目录下执行如下命令：

```shell
yarn install
yarn run build
```

完成后，在`bulid`目录下将会生成软件。

## 版本

您可以在[标签](https://github.com/KL-kirito/CelestiaLauncher/tags)中查看可用版本

## 作者

- **KL-kirito**

您可以在 [contributors](https://github.com/KL-kirito/CelestiaLauncher/contributors) 中查看所以参与项目的开发者。

## License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details.

## 反馈

您可以通过issues页面反馈bug或其他的问题。我会尽快解决。

![csl.jpg](https://s2.loli.net/2022/05/14/7ajYoZDTyxrgRsN.jpg)

A convenient Grasscutter dependency download and launch tool

------

## Features

- [x] Download dependencies easily and safely
- [x] Launch Grasscutter
- [x] Easily update and compile Grasscutter from Github
- [x] Allow use of system environment variables
- [x] Easily make changes to Grasscutter config files
- [ ] Perfect automatic update function
- [ ] In-App Command Panel
- [ ] ID query

## Getting started

The following will help you quickly install and get started with Celestia Launcher.

### Prerequisites

Before downloading and installing the software, make sure that:

- Your computer is running on Windows 64-bit system.
- Reserve at least 3GB of space for software and Grasscutter.

### Installing

You can download the latest version of the software from the Release page.

- If you download the exe installation package, install it to a directory with enough space as prompted.
- If you download the zip archive, please unzip it to a directory with enough space.

You can then run `Celestia Launcher.exe` to launch the software.

### Running

After starting the software, you can go to the download (`安装`) page to download Grasscutter and its dependencies. You can also choose to use system environment variables in Preferences (`偏好设置`) .

#### Download dependencies of Grasscutter

Perform the following steps in sequence:

- Download `Git`, `Java` and `MongoDB`, or use system settings.
- Download `Grasscutter` and Grasscutter resources(`Grasscutter资源`) .
- Click Configure Grasscutter (`配置Grasscutter`)  and Prepare Grasscutter to compile (`Grasscutter编译前准备`) .
- Click the Compile jar (`编译jar`)  button on the left side of the download page to generate the Grasscutter Jar file.

#### Launch Grasscutter

After downloading and configuring all dependencies, you can go back to the homepage (`主页`) , select the corresponding jar file and start it.

#### Update Grasscutter

The `更新 Grasscutter` button on the left side of the download page can help you pull the latest updates from github.

After the pull is complete, just click `编译jar` again to complete the update.

#### Switch Grasscutter branch

In the download page, you can switch to the corresponding branch by entering the name of the existing Grasscutter branch.

#### Configure Grasscutter

- We have implemented the function of changing the common configuration of Grasscutter on the configuration page, you can quickly change the configuration file after it is generated.
- You can also quickly open the plugin folder on the configuration page.

#### other

- The content in the page will not be available until you complete the corresponding dependency configuration.
- The download page will indicate the download status of your dependencies.

### Update

You can preserve downloaded files by preserving the contents of the `game` directory under the installation directory. Other directories or files can all be deleted and replaced.

## Build from source

You can also run or build Celestia Launcher from source.

Before building, make sure you already have a `node.js` environment with `yarn` installed globally.

After cloning the source code, execute the following command in the directory:

```shell
yarn install
yarn run build
````

After completion, the software will be generated in the `bulid` directory.

## Version

You can check the available versions at [tags](https://github.com/KL-kirito/CelestiaLauncher/tags)

## author

- **KL-kirito**

See also the list of [contributors](https://github.com/KL-kirito/CelestiaLauncher/contributors) who participated in this project.

## License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details.

## Feedback

You can report bugs or other issues through the issues page. I will fix it asap.

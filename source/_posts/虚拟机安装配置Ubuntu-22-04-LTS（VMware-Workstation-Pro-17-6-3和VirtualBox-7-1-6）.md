---
title: 虚拟机安装配置Ubuntu 22.04 LTS（VMware Workstation Pro 17.6.3和VirtualBox 7.1.6）
tags: [Ubuntu, VirtualBox, VMware]
categories: [虚拟机, Linux]
index_img: https://assets.soloeternity.me/images/posts/covers/ubuntu.webp
banner_img: https://assets.soloeternity.me/images/backgrounds/post_banner.webp
date: 2025-03-16 21:47:58
---

本文手把手教你用 VMware Workstation Pro 17.6.3 和 VirtualBox 7.1.6 安装并优化 Ubuntu 22.04 LTS 虚拟机环境，涵盖软件获取、系统安装、中文输入法、共享文件夹等全程要点。

<!-- more -->

## 一、前言

### 1.1 背景介绍

在当今数字化时代，操作系统的选择对于开发者、系统管理员以及技术爱好者来说至关重要。Ubuntu 22.04 LTS（Long Term Support，长期支持版本）作为一款广受欢迎的Linux发行版，凭借其稳定性和强大的社区支持，成为了许多用户的首选。它不仅适用于服务器部署，还广泛应用于开发环境、桌面系统以及学习和研究中。

虚拟化技术的出现，使得我们能够在同一台物理机上运行多个操作系统，极大地提高了资源利用率和开发效率。VMware Workstation Pro 和 VirtualBox 是两款主流的虚拟化软件，它们各自具有独特的功能和优势。VMware Workstation Pro 是一款功能强大的商业虚拟化工具，广泛应用于企业级环境，支持高级特性如快照、克隆和网络定制。而 VirtualBox 则是一款开源且免费的虚拟化软件，以其轻量级和易用性受到个人用户和开发者的青睐。

本文将详细介绍如何在 VMware Workstation Pro 17.6.3 和 VirtualBox 7.1.6 中安装并配置 Ubuntu 22.04 LTS，帮助读者在虚拟环境中快速搭建和使用这一优秀的操作系统。

### 1.2 文章目标与适用人群

#### 文章目标

本文旨在为读者提供一份详尽且易于操作的指南，帮助读者在 VMware Workstation Pro 和 VirtualBox 中成功安装和配置 Ubuntu 22.04 LTS。通过本文，读者将能够：

1. 了解如何下载和安装 VMware Workstation Pro 和 VirtualBox。
2. 掌握在虚拟机中安装 Ubuntu 22.04 LTS 的完整流程。
3. 学会配置虚拟机的网络、存储和其他关键设置。
4. 解决安装过程中可能遇到的常见问题。
5. 对比 VMware Workstation Pro 和 VirtualBox 的优缺点，选择适合自己的虚拟化工具。

#### 适用人群

本文适合以下几类读者：

1. **初学者**：对虚拟化技术感兴趣，希望在虚拟机中安装和使用 Ubuntu 的新手。
2. **开发者**：需要在虚拟环境中搭建开发环境，进行应用开发、测试或学习新技术的开发者。
3. **系统管理员**：需要在虚拟机中部署 Ubuntu 服务器，进行系统管理和维护的人员。
4. **技术爱好者**：希望探索不同虚拟化工具的特性和功能，提升技术能力的爱好者。

无论你是刚刚接触虚拟化技术的新手，还是有一定经验的技术人员，本文都将为你提供清晰的指导和实用的操作步骤。

## 二、环境准备

### 2.1 软件下载

#### 2.1.1 VMware Workstation Pro 17.6.3

由于博通（Broadcom）于2023年11月22日完成了对VMware的收购，所以网上绝大部分教程所提供的下载方式均已失效，~~chishi的~~官网也是基本没办法找到下载链接。博客[VMware Workstation Pro 17官网下载安装教程](https://blog.csdn.net/air__j/article/details/142798842)所提供的方法也在近日失效，目前已知有效的是[alanma2004](https://blog.csdn.net/alanma2004?type=blog)大神提供的[链接](https://support.broadcom.com/group/ecx/productfiles?subFamily=VMware%20Workstation%20Pro&displayGroup=VMware%20Workstation%20Pro%2017.0%20for%20Windows&release=17.6.3&os=&servicePk=undefined&language=EN&freeDownloads=true)。

打开页面后按下图提示操作（没有账户的按照指示注册完再次打开链接即可，如果需要补充信息就随便填一下）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/d605948a31724b7a8f16f2c3c7963d8c.webp)
安装过程一路下一步即可（系统PATH、安装位置、快捷方式可以自定义，下图中两个选项建议取消勾选）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/0baf268afcde4e7485b4138f2b1c1c58.webp)

#### 2.1.2 VirtualBox 7.1.6

官网下载地址：[https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads)

点击Windows hosts下载安装包

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/f00342396c284813aedb193104269307.webp)
无脑下一步即可

左上角 **“管理”** -> **“全局设定”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/e2d8b072314a446c834304aef73d7ecf.webp)
可以更改虚拟机默认存放位置

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/414137d5cc774cf8b9bb23ac65b91140.webp)

#### 2.1.3 Ubuntu 22.04 LTS 镜像

##### 官网下载

- **下载地址**：[64-bit PC (AMD64) desktop image](https://releases.ubuntu.com/22.04/ubuntu-22.04.5-desktop-amd64.iso)
- **步骤**：
  1. 访问 [Ubuntu 官方下载页面](https://ubuntu.com/download/desktop)。
  2. 点击 **“check out our alternative downloads”**。
 ![](https://assets.soloeternity.me/images/posts/ubuntu-vm/7c8df2c4c2824960b1cfe8dbc6ef7a95.webp)
  3. 点击 **“Past releases and other flavours
”** ，选择 **“Ubuntu 22.04 LTS (Jammy Jellyfish)”** 。
  ![](https://assets.soloeternity.me/images/posts/ubuntu-vm/22740f394ec64d1293365085439ff28b.webp)
  4. 点击 **“64-bit PC (AMD64) desktop image”** 下载ISO镜像文件
  
![](https://assets.soloeternity.me/images/posts/ubuntu-vm/bde695f4192648b9b98c56cdc73e3e07.webp)

##### 清华镜像站下载

- **下载地址**：[ubuntu-22.04.5-desktop-amd64.iso](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/22.04.5/ubuntu-22.04.5-desktop-amd64.iso)
- **步骤**：
  1. 访问 [清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/)。
  2. 在页面中找到 **“22.04.5”** 文件夹，进入后选择**`ubuntu-22.04.5-desktop-amd64.iso`**下载。

##### 注意事项

- 下载完成后，建议校验镜像文件的完整性。可以通过计算文件的 **SHA256 校验和** 来确保下载的文件未损坏。校验和可以在 [Ubuntu 官方发布页面](https://ubuntu.com/download/desktop) 找到。
- 官网下载速度可能较慢，推荐通过清华镜像站下载

### 2.2 硬件要求

在安装和运行虚拟机时，需要确保宿主机（即安装虚拟机软件的计算机）满足以下硬件要求，以保证虚拟机的正常运行和性能。

#### 1. 处理器

- 推荐使用 **Intel Core i5 或 AMD Ryzen 5** 及以上性能的处理器。
- 处理器需支持虚拟化技术（如 Intel VT-x 或 AMD-V），并确保在BIOS中已启用虚拟化功能。

#### 2. 内存

- 最低要求：4GB 内存（如果同时运行其他资源密集型应用，建议更高）。
- 推荐配置：8GB 或更高内存，以确保虚拟机运行流畅。

#### 3. 存储空间

- **磁盘空间**：至少需要为虚拟机分配 **20GB** 的磁盘空间（建议使用SSD以提高性能）。
- **总存储空间**：宿主机应至少有 **50GB** 的可用磁盘空间，以容纳虚拟机文件和操作系统镜像。

#### 4. 显卡

- 对于普通使用场景，集成显卡即可满足需求。
- 如果需要运行图形界面或进行图形密集型任务（如3D建模、游戏开发等），建议使用 **NVIDIA 或 AMD 独立显卡**，并确保驱动程序已正确安装。

#### 5. 网络

- 确保宿主机连接到稳定的网络环境，以便在安装过程中下载必要的软件包或更新。
- 如果需要虚拟机与外部网络通信，建议使用有线网络连接以提高稳定性。

#### 6. 其他

- **操作系统**：宿主机需运行 Windows 10/11（64位）、macOS（10.14及以上）或 Linux（支持虚拟化功能的操作系统）。
- **电源**：建议连接到稳定的电源，并开启电源管理功能，避免因电源不足导致虚拟机意外关机。

## 三、使用 VMware Workstation Pro 安装配置 Ubuntu 22.04 LTS

### 3.1 创建虚拟机

点击 **“创建新的虚拟机”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/2b1d71f976ad46b4b3e7a771e8fa4a96.webp)
选择 **“自定义(高级)”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/1c9b472ccc27473d8018f5128dc284ee.webp)
下一步

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/3d2cb6f6c64943e1ae37bdb94dddaf3c.webp)
选择 **“安装程序光盘映像文件”** ，然后点击 **“浏览”**打开刚下载的ISO文件

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/96712c0370ae463bb01ea7b7d7a098fd.webp)
![](https://assets.soloeternity.me/images/posts/ubuntu-vm/63b5f0801fb443ada43ab07a2473e574.webp)
出现下图红框中内容表示ISO文件正确

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/18959b2c48684f8697441b79f1b46ea4.webp)
设置用户名和密码

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/88bce790da7f438394df404888b33dd5.webp)
设置虚拟机名称和存储位置

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/ace9ca763fd540d782a640ce7913bc99.webp)
建议把内核数量调整为2

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/16982f725a94423596ef80142256585c.webp)
运行内存推荐4GB

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/bf5e5c27492340bfa7e4170f23e49298.webp)
网络类型先选NAT，后期有独立访问外网需求再改桥接

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/5b23692333f044a4848774cde704340b.webp)
下一步

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/2bd9008d2e0d4e45a31ed7632c68e0ac.webp)
下一步

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/291f62a4e615491e8e290bc41a905a49.webp)
下一步

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/c3a79695844346ef9a4dc2e8538ddbc6.webp)
设置磁盘大小（默认20GB，推荐60GB）
不建议勾选 **“立即分配所有磁盘空间”** （不勾选的话虚拟机实际占用的空间是根据实际情况动态增加的，即你用多少它占多少）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/fc08898cb57944f4ba51f784f7a471e1.webp)
下一步

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/149d87b266ce4536ab04ec4a1b14e59f.webp)
如果没有额外需求点击 **“完成”** 即可完成虚拟机的创建（如果你勾选了最下面的 **“创建后开启此虚拟机”** 那么点击 **“完成”** 后虚拟机会自动开启）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/5b9e7e6b35ef4c82ac5e51658b45bd6b.webp)

有自定义需求的可以点击 **“自定义硬件”** 进行硬件的添加、移除或配置（笔者这边就是针对USB控制器进行了配置）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/acf148197b8d4d9aadeacc8e65deb033.webp)

### 3.2 安装 Ubuntu 系统

点击 **“开启此虚拟机”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/bf9d076a336948a98f28a75bfbc6249f.webp)
功能区最后一个功能，点击下拉小箭头选择保持纵横比拉伸

语言先选Chinese-Chinese，后面可以根据需求选择英语

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/cfef06a8db2c4202b789f3cbd290095b.webp)
这边选择看个人需求：

 **“Minimal Installation（最简安装）”** 相较于默认的 **“Normal Installation（普通安装）”** 少了办公、游戏和媒体软件

 **“Download updates while installing Ubuntu（安装 Ubuntu 时下载更新）”** 可以先不勾选，等装完系统再更新

  **“Install third-party software for graphics and Wi-Fi hardware and additional media formats（为图形和 Wi-Fi 硬件以及其他媒体格式安装第三方软件）”** 没有特殊需求一般不用勾选

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/03246965c3944a5abd6c2b26d9269516.webp)
直接 **“Install Now”** （ **“Erase disk and Install Ubuntu（擦除硬盘并安装 Ubuntu）”** 擦除的是刚创建的虚拟硬盘而不是你的物理磁盘所以不用担心）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/5d6b0eae387b48698f58037f24f55caf.webp)
直接 **“Continue”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/f7a730b96fb84382a46f420c276c3c31.webp)
地图上大致标一下上海的位置，时区更改为 **“Shanghai”** 然后 **“Continue”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/725ee020b81c4896a03507a723ea2eae.webp)
设置姓名、电脑名、用户名和密码（登录用的是用户名和密码），点击 **“Continue”** 开始安装

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/c1cec9017c6443f09a8440d089ae3fc5.webp)
安装完成后直接 **“Restart Now”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/190ac5fda3864b5aa93f8b07e252f63d.webp)
看到下面这个界面说明系统已经成功安装

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/2e6f14a55c8d40debefe3bcd30ebe644.webp)

点击账号图标，输密码回车进入系统

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/f14db8854bf74f2195a07ab4e5882eea.webp)
关联账号，有需求可以关联下，没需求直接 **“Skip”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/73b824d8dc4a4039aaafd68fee862117.webp)
 **“Enable Ubuntu Pro（激活Ubuntu Pro）”** 这个一般不用激活，直接默认 **“Skip for now”** 然后右上角 **“Next”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/7d37679180e64ac4a997a24a85d40878.webp)
是否帮助改善Ubuntu，推荐选择 **“No, don’t send sysytem info”** 然后右上角 **“Next”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/04f85f5d00ef4b5492b80e4ae99d3432.webp)
是否启用定位服务，默认不启用即可，直接 **“Next”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/3f12b51e8f3046cab1d85b29c9717e50.webp)
点击 **“Done”** 结束

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/1177ecb718854d84b6df7bd0ec72506c.webp)

>#### 注意事项
>
>碰到这个弹窗先不要更新（还没更换国内源，更新速度较慢），先选 **“Remind me Later”**
>
>![](https://assets.soloeternity.me/images/posts/ubuntu-vm/a16977bdcaf941488a752ea0e75c7ff6.webp)
>碰到这个弹窗直接 **“Don't Upgrade”（装的就是22.04不用更新到24.04）
>
>![](https://assets.soloeternity.me/images/posts/ubuntu-vm/be691bac7a2f4ec78d9c0941d6777da8.webp)

### 3.3 配置虚拟机

#### 3.3.1 安装VMware Tools

参考[Ubuntu22.04如何安装VMware-tools（问题汇集）](https://zhuanlan.zhihu.com/p/619183346)

#### 3.3.2 更换国内镜像源

参考[Ubuntu 22.04换国内源 清华源 阿里源 中科大源 163源](https://blog.csdn.net/xiangxianghehe/article/details/122856771)

Tip：换源后安装软件包出现报错 **“E: 无法修正错误，因为您要求某些软件包保持现状，就是它们破坏了软件包间的依赖关系。”** 可以参考[最新ubuntu22.04 下列软件包有未满足的依赖关系 解决方案](https://blog.csdn.net/lishuaigell/article/details/124740342)解决

#### 3.3.4 安装Fcitx5中文输入法

参考[Ubuntu22.04安装Fcitx5中文输入法（详细）](https://zhuanlan.zhihu.com/p/508797663)

## 四、使用 VirtualBox 安装配置 Ubuntu 22.04 LTS

### 4.1 创建虚拟机

左上角 **“控制”** -> **“新建”** （不要点 **“创建”** ，那个是创建虚拟硬盘）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/728113df991943dd9644f59eb953cba9.webp)
依次设置虚拟机名称、存放位置以及镜像（之前下载的ISO文件），取消勾选 **“跳过自动安装”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/34f67176b300479b9fe9dd7d7828c077.webp)
切换到 **“硬件”** 选项卡，运存设为4096MB（4GB），CPU数量设为2

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/2bff189d96ed443f8c176a01e54b9bd1.webp)
切换到 **“虚拟硬盘”** 选项卡，硬盘大小调整为60GB（不要勾选 **“预先分配所有空间”** ！！！）

然后点击 **“完成”** 结束虚拟机的创建
![](https://assets.soloeternity.me/images/posts/ubuntu-vm/8ea3be266ba24ad0b679e42de516a6bb.webp)
最后更改两个配置

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/f786d24206ba42c8bed8dc8f60ceb1d7.webp)
取消勾选 **“软驱”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/45ca9f85ee074c338238e9ff8d6fdf20.webp)
显存设置为64MB

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/9a9c96de203846df8e86cfd9f73a03e3.webp)

### 4.2 安装 Ubuntu 系统

启动

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/9afc4805d69547a784b0aae1603db355.webp)
直接Enter

小Tip：可以右Ctrl + C切换至缩放模式然后再全屏

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/c133ad7afd01425cb3e0308cb38c3022.webp)
点击框中按钮隐藏侧边栏

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/3f84237091cb4a5bbac75061882acff5.webp)
 **“中文（简体）”** -> **“安装Ubuntu”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/3fa347ce1c324ca2ad6ca143f6fefdcd.webp)
继续

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/728562c0dfe348008d8d1f30e76d5451.webp)
选 **“最小安装”** ，取消勾选 **“安装Ubuntu时下载更新”**（这样安装速度最快~）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/f4d6fd9fc47e4b5598bac027e3a7dad2.webp)
现在安装

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/fe64d92c95534ac28a9f25db2ab90af2.webp)
继续

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/30ce6e5c9237483a8c935f06691adf2a.webp)
选择 **“Shanghai”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/044933e323f045cb933a7a11f30af24c.webp)
设置姓名、电脑名、用户名和密码（登录用的是用户名和密码）

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/26a78c484f244277919a7ea30347ee79.webp)
安装完成直接 **“现在重启”**

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/4a38ef24cd1b4c5b8b126b59b402637c.webp)
直接Enter

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/b80465524e9445cb8cbcae9e57ddac7d.webp)

点击头像输入密码进入系统

![](https://assets.soloeternity.me/images/posts/ubuntu-vm/cc4ccea929e8455ca6185163161cd0b6.webp)
一路下一步或跳过即可

### 4.3 配置虚拟机

#### 4.3.1 安装VirtualBox Guest Additions

参考[如何在Ubuntu 22.04上安装VirtualBox Guest Additions](https://zhuanlan.zhihu.com/p/655660233)

#### 4.3.2 设置共享文件夹和远程SSH连接

参考[配置共享文件夹和远程连接](https://www.cnblogs.com/lvrencat07-V/p/18777420#%E9%85%8D%E5%90%88%E5%85%B1%E4%BA%AB%E6%96%87%E4%BB%B6%E5%A4%B9)

#### 4.3.3 其余

参考3.3.3节

## 五、总结

### 6.1 VMware Workstation Pro 与 VirtualBox 的对比

VMware Workstation Pro 和 VirtualBox 都是广泛使用的虚拟化软件，但它们在功能、性能和用户体验上存在一些差异。以下是两者的对比：

#### 1.功能特性

- **VMware Workstation Pro**
  - 功能强大，支持高级网络配置（如NAT、桥接、主机模式等）。
  - 提供快照功能，方便用户快速恢复虚拟机状态。
  - 支持多种操作系统，包括Windows、Linux、macOS等。
  - 提供团队协作功能，便于多人同时管理虚拟机。
- **VirtualBox**
  - 开源免费，适合个人用户和轻量级虚拟化需求。
  - 支持多种操作系统，但对macOS的支持有限。
  - 提供快照功能，但功能相对简单。
  - 网络配置功能较为基础，适合简单场景。

#### 2. 性能表现

- **VMware Workstation Pro**
  - 性能优化较好，支持硬件加速，虚拟机运行效率高。
  - 支持多核CPU和大内存分配，适合高性能需求。
- **VirtualBox**
  - 性能表现中规中矩，适合日常使用。
  - 在某些复杂场景下，性能可能不如VMware Workstation Pro。

#### 3. 用户体验

- **VMware Workstation Pro**
  - 界面简洁，操作直观，适合新手和专业用户。
  - 提供丰富的文档和社区支持。
- **VirtualBox**
  - 界面简洁，但功能选项较为分散，新手可能需要一定时间熟悉。
  - 社区支持活跃，但官方文档相对较少。

#### 4. 价格

- **VMware Workstation Pro**
  - 免费
- **VirtualBox**
  - 免费

#### 5. 适用场景

- **VMware Workstation Pro**
  - 适合企业级用户、开发人员和需要高性能虚拟化环境的用户。
- **VirtualBox**
  - 适合个人用户、学生和轻量级虚拟化需求。

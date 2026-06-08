---
title: Kali Linux 虚拟机安装详解：轻松上手
tags: [Kali Linux, VMware]
categories: [虚拟机, Linux]
index_img: /img/cover/kali.png
banner_img: /img/post_banner.png
date: 2023-09-24 12:41:44
---

该文详解在 VMware Workstation 17 Pro 中从环境准备到虚拟机创建、系统初始化、桌面环境选择及快照备份的 Kali Linux 完整安装流程。

<!--more-->

## 1 安装环境准备

### 1.1 下载并安装VMware Workstation 17 Pro

下载地址：[https://www.vmware.com/cn/products/workstation-pro/workstation-pro-evaluation.html](https://www.vmware.com/cn/products/workstation-pro/workstation-pro-evaluation.html)

根据自身系统选择并点击立即下载即可

![](b04ae69e9643e6c8538cc501f40cf7aa.png)
下载完成后双击打开

![](cfc237544bce7f96d91cae15fe39120b.png)
一路"**下一步**"即可（可根据自身需求修改安装位置等配置）
![](8b64896daa2674a9574255fff3473169.png)
![](772f488e840abc27bd45ecbbfc934ad6.png)
![](57803797b22f5495adfcd2478073f71c.png)
![](50c4167f083f45721e570c343cd5cbad.png)
![](f3955371538675b5ca9cda19321d7dfb.png)

![](7e54112e803c7e69dc767a6ff34997d8.png)
![](367bb0fb8823f0cae645a594f32a32a1.png)
点击"**完成**"结束安装

![](068aad3d7c39ac66abd70b3c0899218e.png)
如果碰到如下所示的窗口，可点击"**许可证**"激活（否则只能免费试用30天）

激活方法请自行搜索

![](113790cf4cbb76beb791086c74092ab6.png)
![](d1001cb59d33b451b415b064f55e9f54.png)
![](5df0ee0fce628e1336d06318f0470ed3.png)
如果没有弹出上述窗口可打开VMware Workstation 17 Pro后手动激活（帮助-输入许可证密钥）

> ⚠️ 警告：由于博通（Broadcom）于2023年11月22日完成了对VMware的收购，所以上述方法已经失效，请参考[https://blog.csdn.net/flMHP/article/details/146284957?spm=1011.2415.3001.5331#211_VMware_Workstation_Pro_1763_29](https://blog.csdn.net/flMHP/article/details/146284957?spm=1011.2415.3001.5331#211_VMware_Workstation_Pro_1763_29)下载VMware Workstation Pro 17.6.3

### 1.2 下载Kali Linux最新版镜像

下载地址: [https://www.kali.org/get-kali/#kali-installer-images](https://www.kali.org/get-kali/#kali-installer-images)

点击下载即可（记住下载位置，备用）

![](f98cd54b30570afbdd078a2c86c582d0.png)

## 2 初始化Kali Linux

### 2.1 创建虚拟机

点击"**创建新的虚拟机**"

![](2691ddf71fbab6cd6da4c868ff8be67a.png)
选"**自定义(高级)(C)**"，下一步

![](f1b1f19ced4b37ab18ed6b2d1f413eaa.png)
兼容性选"**Workstation 17.x**"，下一步

![](b953e1e7f49beaf07c790e38195246c9.png)
选"**稍后安装操作系统(S)**"，下一步

![](aa1055784f59684528c011b5fa2fa7e7.png)
系统选"**Linux(L)**"，版本选"**Debian 11.x 64 位**"，下一步

![](234b56150f34e28448673b913a92c2f2.png)
虚拟机名称随意，保存位置自选（建议和ISO文件放在一起，同时要留有足够空间），下一步
![](f7f9df76093499a3a4dae48196d4915b.png)
处理器内核总数至少4个（建议2P2C），下一步

![](6f9dff974a55e3c64d853cf27d2ae8b5.png)
内存至少给2个G（推荐4个G），下一步

![](a59bd58d21629999c2f247c669d7cab5.png)
网络类型建议选"**使用网络地址转换(NAT)(E)**"
>**注意**：选"**使用桥接网络(R)**"笔者在后面配置网络时会报错，参考网上提供的方法都没能解决，所以建议先用NAT等装完系统后再改成桥接

![](8e021cb36fc5c80d9ee1f0ac4393fdc8.png)
一路"**下一步**"即可

![](09b5b97d7550fabe1f2cd94d6a585717.png)
![](5f44b5b68122c9324c0defe05555ee5c.png)
![](e6123683c43db51c4ced8a6e466da339.png)
磁盘容量至少给20个G（推荐40个G以上）

> ⚠️ **警告**：不要勾选"**立即分配所有磁盘空间(A)**"。（除非你硬盘空间足够）

选"**将虚拟磁盘存储为单个文件(O)**" （日后有在计算机之间移动虚拟机的需求的可以选"**将虚拟磁盘拆分成多个文件(M)**"）

![](577b9db677fc9e9143b69a69a89eb469.png)
下一步

![](237ac51ba4540b03bad392015f5c3eff.png)
自定义硬件

![](84d0d2f3550e0034520b511e018156c9.png)
打开"**新 CD/DVD (IDE)**"，在"**连接**"中选择"**使用 ISO 映像文件(M):**"，点击"**浏览(B)**"选择刚下好的ISO文件，然后"打开"

![](7de3fb3b951a518eb99029b99470a24c.png)
![](bbdc80fceb887ef1c94195ecf1532461.png)
![](45228d56bc1400ce8f767ca9fdb0090c.png)
打开"**USB 控制器**"，USB 兼容性选"**USB 3.1**"，勾选"**显示所有 USB 输入设备(S)**"（这一步没有需要的可以跳过）

![](e267f3a7c8ae456e80583ff017dc2b03.png)
打开"**打印机**"，点击"**移除(R)**"（此步也可跳过）

![](af7f0a6e681a244cf61d925f2f1dccf5.png)
关闭，点击"**完成**"

![](e39137d6e150c8848994fa06e2b3b90f.png)
至此，虚拟机创建完成，可以看到左侧"**我的计算机**"列表中已出现Kali Linux
![](52785730ef49fd7e4672096ec608565d.png)

### 2.2 初始化

点击"**开启此虚拟机**"打开虚拟机
![](3632e9222792994b5583e60e50fd223d.png)
点击"**确定**"忽略提示

![](1b9e57654569cc217518e154946541a2.png)
点击虚拟机屏幕，按下回车开始安装系统

![](a865f1d116dcb697989d4e612fa89ce4.png)
![](390c6758a71398a934ea94392d813958.png)

语言选择"**Englis**h"（简中也可以），然后Continue
注：下方出现VMware Tools的安装提示属正常现象，暂时先点击"**以后提醒我**"，该工具可用于虚拟机与物理机见拖拽传输文件等功能，推荐安装，笔者以后也会写一篇教程

![](77d773a46c8aa77b22ef0732fddefe81.png)
国家与地区选择"**Hong Kong**"（随意），然后Continue

![](8544cccccb7f61cabf3060677518576f.png)
键盘选择"**American English**"，然后Continue

![](b5305ac1456338407835612ed2804308.png)

自动检测安装介质以及下载安装组件

![](9c9da1420105dbe29dacb99d431c3a10.png)
![](d3f2e0f27f2c4675daf6e30e12781dd8.png)
自动检测网络

![](2e49beb551311dc3105ebf50510f7aa3.png)
 配置主机名（随意）

![](823751e73de5d0358eb78ee73b546e38.png)
配置域名 （随意）

![](be4b6680d3b975f5c022e6bb3ff48aa2.png)
设置账户名（随意）

![](e18f520cd7f59c9a54c2259b5d333f32.png)
设置用户名（登录用，牢记）

![](98f9932231d89c35fa86d52c4a8e1b13.png)
设置密码（登录用，牢记）

![](2c8b7de475fcdc609ac28e46ac7033ce.png)
自动设定时钟

![](91594cb45ce013284ca621601543d6b5.png)
自动检测磁盘

![](64f101bace407658bc499dba5b2fa958.png)
自动安装分区组件

![](439f1c7f95615d7e64d493d34542881e.png)
分区方法选择第一个，然后Continue

![](e455e2ea2c9c169fed8d164d92ebfafe.png)
确认磁盘，直接Continue

![](4b023b45a2e1bcc9d0e23126f8dd83a9.png)
分区方案选择第一个，然后Continue

![](f889db9ecd2596ba082d65555cae5610.png)
直接Continue结束分区向导

![](dd25599d1ba9b641d61bd55db30aff6c.png)
选择"**Yes**"，然后Continue

![](efb8cad4239c45752b6e279658e89df5.png)
自动安装系统基础部件（3min左右）

![](af8ca2d233655145acd58613c93e3aa0.png)
自动配置包管理器（apt）

![](d101b664bd33e20e7c97bd8a9f5ab1b9.png)
自动安装软件

![](62eec6401ea2b432dd3fc4256a2e38e5.png)
桌面环境选择Xface（或从GNOME、KDE桌面环境任选一个），其它选项默认即可，然后Continue
注：桌面环境的选择可参考[Linux的桌面环境比较与选择（gnome、kde、xfce、lxde 等）](https://blog.csdn.net/daobaqin/article/details/121029653)

![](545ec13ec210b176a271adb0ba0f7743.png)
继续自动下载软件（剩余时间笔者感觉不太准，大约要耗时35min）

![](1bdea9d6398ca704ccd6d96ab028897f.png)
自动安装GRUB启动程序

![](a2c66b2d5a4ea1c2e82527630823ec55.png)
选"**Yes**"，然后Continue

![](2295b964fffe977fd5f4673ffec720d5.png)
设备选第二个，然后Continue准备结束安装（大约需要耗时5min）

![](b8919dadb8db10b89b9b6c85d38a8681.png)
![](8d8fe991b1f91acbc1c3e1ea5603eed7.png)
点击"**Continue**"重启结束安装
![](e2ed40e84590506b65de1063cfa416b2.png)
重启完成，输入用户名和密码登陆即可

![](cd2026e7e147bb1baaa3c1fd2c0f5836.png)

## 2.3 拍摄快照

推荐拍个快照以便日后恢复初始状态

步骤：
1.回到主界面

![](d0de1f0cfdd20f10c210796281d72b05.png)
2.依次点击"**虚拟机(M)**" -> "**快照(N)**" -> "**拍摄快照(T)**"

![](5e9f12d1d5e49588f50f6c7811bd4a11.png)
3.再点击"**拍摄快照(T)**"完成拍摄

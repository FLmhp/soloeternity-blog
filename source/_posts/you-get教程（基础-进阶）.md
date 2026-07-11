---
title: you-get教程（基础+进阶）
tags: [Python, you-get]
categories: [Python]
index_img: https://assets.soloeternity.me/images/posts/covers/python.webp
banner_img: https://assets.soloeternity.me/images/backgrounds/post_banner.webp
date: 2022-09-10 21:05:20
---

you-get是一个小巧的网页媒体下载工具，可以从网页上下载视频、图片及音乐。本文将详细介绍其安装和使用方法。

<!-- more -->

## 1 准备工作

### 1.1 安装Python

#### 1.1.1 安装步骤

如果已安装过Python，请直接跳至1.1.2节进行检验。

下载地址：[https://www.python.org/downloads/](https://www.python.org/downloads/)

![](https://assets.soloeternity.me/images/posts/you-get/682aad7563074b828bcb4725c887a40a.webp)

也可以直接使用以下链接获取3.10.6安装包:
[https://www.aliyundrive.com/s/uc8zJhiCs3S](https://www.aliyundrive.com/s/uc8zJhiCs3S)

下载完成后双击打开安装包：
![](https://assets.soloeternity.me/images/posts/you-get/5bcabe0677e46badcd5ff4bdee2603f4.webp)

直接点击**Next**：
![](https://assets.soloeternity.me/images/posts/you-get/ab63afad6162a97249ef31c51d13a438.webp)
![](https://assets.soloeternity.me/images/posts/you-get/37e011370c5146feba562bc512148749.webp)

等待安装完成：
![](https://assets.soloeternity.me/images/posts/you-get/10b3c31fa5a4cde426a4a6d26a0a2c36.webp)

安装完成，(o゜▽゜)o☆[BINGO!]：
![](https://assets.soloeternity.me/images/posts/you-get/361c1b945ee9ae1ce1645237759a68c1.webp)

> **注意**：选择自定义安装时注意更改Python保存位置，否则接下来的操作可能无法完成。具体操作方法参考以下链接：
> [https://blog.csdn.net/Steve_Lee_/article/details/123169242#t5](https://blog.csdn.net/Steve_Lee_/article/details/123169242#t5)
>
> 而且要注意更改完保存位置后确保权限为完全控制（否则安装包时可能会提示无法写入）。
> 查看方法：右键**保存文件夹** → **属性** → **安全** → **Users**
>
> 正确示例：
> ![](https://assets.soloeternity.me/images/posts/you-get/e40eeb518b62d6486b1887b64a734279.webp)

#### 1.1.2 检验安装

1. 按 "**Win+R**" 打开运行框，输入 "**cmd**" 回车
   ![](https://assets.soloeternity.me/images/posts/you-get/c1a02adc57acb2e413711ccb2104f657.webp)

2. 输入 "**python**" 回车，出现以下代码说明安装成功
   ![](https://assets.soloeternity.me/images/posts/you-get/073f0e2656f94001285d5400ec670de1.webp)

#### 1.1.3 常见问题

1. 安装时出现未指定错误"**0x80072efd**"
   原因：误勾选了最后两个选项
   ![](https://assets.soloeternity.me/images/posts/you-get/b10f521e9ad7358be4ec9e22ce979318.webp)

   解决链接: [https://www.jianshu.com/p/bc1263f12c4f](https://www.jianshu.com/p/bc1263f12c4f)

2. 检验时显示"**python不是内部或外部命令，也不是可运行的程序或批处理文件**"
   原因：忘记勾选 "**Add Python 3.10 to PATH**"
   解决方案：记得安装路径的手动添加一下Path，不记得的还是重装快一点~
   参考链接: [https://www.php.cn/python-tutorials-424800.html](https://www.php.cn/python-tutorials-424800.html#:~:text=%E6%96%B9%E6%B3%95%E4%B8%80%EF%BC%9A%E4%BD%BF%E7%94%A8cmd%E5%91%BD%E4%BB%A4%E6%B7%BB%E5%8A%A0path%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%20%E5%9C%A8cmd%E4%B8%8B%E8%BE%93%E5%85%A5%EF%BC%9A%20path%3D%25path%25%3BD%3APython27,%E6%8E%A5%E7%9D%80%E6%8C%89%22Enter%22%E5%9B%9E%E8%BD%A6%E9%94%AE%E3%80%82%20%E5%85%B6%E4%B8%AD%3A%20D%3APython27%20%E6%98%AFPython%E7%9A%84%E5%AE%89%E8%A3%85%E7%9B%AE%E5%BD%95%E3%80%82)

3. 原本存在的python文件图标变白
   解决方案请参考[https://jingyan.baidu.com/article/db55b609c1d7b94ba30a2f97.html](https://jingyan.baidu.com/article/db55b609c1d7b94ba30a2f97.html)

### 1.2 安装pip

如果是按照上述方式安装的Python，pip已经自动安装在计算机上，请直接跳至1.3节安装you-get。

如果不确定是否安装请参考1.2.2节进行检验。

#### 1.2.1 安装步骤

以管理员身份运行cmd依次输入以下代码：

```shell
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py 
```

![](https://assets.soloeternity.me/images/posts/you-get/ce3a29c2df6f9b81199e6f98d547c097.webp)

```shell
python get-pip.py  
```

![](https://assets.soloeternity.me/images/posts/you-get/4fb1401480c0dec43517252608c42959.webp)

```shell
python -m pip install --upgrade pip 
```

![](https://assets.soloeternity.me/images/posts/you-get/6b42949ee3a67d8a198e84cc61ab2f7e.webp)

#### 1.2.2 检验安装

运行cmd输入pip回车，若出现如下信息说明安装成功：

![](https://assets.soloeternity.me/images/posts/you-get/138174f02a47147337f4f137944b826d.webp)

> **提示**：pip更详细的使用方法可参考：
>
> - [https://www.php.cn/python-tutorials-492847.html](https://www.php.cn/python-tutorials-492847.html)
> - [https://www.runoob.com/w3cnote/python-pip-install-usage.html](https://www.runoob.com/w3cnote/python-pip-install-usage.html)

### 1.3 安装you-get

#### 1.3.1 安装步骤

以管理员身份运行cmd输入：

```shell
pip install you-get
```

![](https://assets.soloeternity.me/images/posts/you-get/77489cd9c5f51f22c4c703d562828342.webp)

#### 1.3.2 检验安装

打开cmd输入：

```shell
you-get
```

回车，若出现以下信息说明安装成功：

![](https://assets.soloeternity.me/images/posts/you-get/a2df127d2566908eba908e59c87e8e50.webp)

## 2 基础使用

you-get的用途就是从网页上下载视频、图片及音乐。

最基础的使用方法如下所示：

1. 打开想要下载的资源的网址（url）并复制（有条件的精准复制）

2. 打开cmd或powershell输入：

```shell
you-get url
```

> **注意**：如果网址里有&，注意加引号，即把&改成"&"

示例（从B站上下载一个视频，图片、音乐的下载以此类推）：

```shell
you-get https://www.bilibili.com/video/BV16V4y1J7XL?spm_id_from=333.1007.tianma.4-1-9.click
```

> **提示**：默认下载位置在 `C:\Users\用户名` 目录下

## 3 进阶使用

you-get中文说明地址：[https://github.com/soimort/you-get/wiki/中文说明](https://github.com/soimort/you-get/wiki/%E4%B8%AD%E6%96%87%E8%AF%B4%E6%98%8E)（个人觉得还行，但很多参数都没讲）

进入正题，虽然上述方法已经可以实现下载的基本要求了，但对于大多数使用者（比如我）来说这还远远不够。。。

因此，我们需要借助you-get自带的参数（cmd输入 `you-get -h` 可以浏览所有参数）：

```text
you-get: version 0.4.1620, a tiny downloader that scrapes the web.
usage: you-get [OPTION]... URL...

A tiny downloader that scrapes the web

options:
  -V, --version         Print version and exit
  -h, --help            Print this help message and exit

Dry-run options:
  (no actual downloading)

  -i, --info            Print extracted information
  -u, --url             Print extracted information with URLs
  --json                Print extracted URLs in JSON format

Download options:
  -n, --no-merge        Do not merge video parts
  --no-caption          Do not download captions (subtitles, lyrics, danmaku, ...)
  --postfix             Postfix downloaded files with unique identifiers
  -f, --force           Force overwriting existing files
  --skip-existing-file-size-check
                        Skip existing file without checking file size
  -F STREAM_ID, --format STREAM_ID
                        Set video format to STREAM_ID
  -O FILE, --output-filename FILE
                        Set output filename
  -o DIR, --output-dir DIR
                        Set output directory
  -p PLAYER, --player PLAYER
                        Stream extracted URL to a PLAYER
  -c COOKIES_FILE, --cookies COOKIES_FILE
                        Load cookies.txt or cookies.sqlite
  -t SECONDS, --timeout SECONDS
                        Set socket timeout
  -d, --debug           Show traceback and other debug info
  -I FILE, --input-file FILE
                        Read non-playlist URLs from FILE
  -P PASSWORD, --password PASSWORD
                        Set video visit password to PASSWORD
  -l, --playlist        Prefer to download a playlist
  -a, --auto-rename     Auto rename same name different files
  -k, --insecure        ignore ssl errors
  -m, --m3u8            download video using an m3u8 url

Playlist optional options:
  --first FIRST         the first number
  --last LAST           the last number
  --size PAGE_SIZE, --page-size PAGE_SIZE
                        the page size number

Proxy options:
  -x HOST:PORT, --http-proxy HOST:PORT
                        Use an HTTP proxy for downloading
  -y HOST:PORT, --extractor-proxy HOST:PORT
                        Use an HTTP proxy for extracting only
  --no-proxy            Never use a proxy
  -s HOST:PORT or USERNAME:PASSWORD@HOST:PORT, --socks-proxy HOST:PORT or USERNAME:PASSWORD@HOST:PORT
                        Use an SOCKS5 proxy for downloading
```

看着很多其实常用的也就十个左右，接下来我就一一介绍：

### 1. 查看视频信息

```shell
-i, --info Print extracted information
```

很多网站对同一个视频会提供很多种格式和清晰度，所以在下载前可以通过 `-i` 参数来提取相关信息，示例如下：

```shell
you-get -i https://www.bilibili.com/video/BV16V4y1J7XL?spm_id_from=333.1007.tianma.4-1-9.click
```

![](https://assets.soloeternity.me/images/posts/you-get/cdf6b3d8ab2db37f4c2d5743e73c5d57.webp)

### 2. 指定视频格式

```shell
-F STREAM_ID, --format STREAM_ID Set video format to STREAM_ID
```

从上面的图中可以看到很多不同的格式和清晰度，如果要选择就需要使用 `-F/--format` 参数，示例如下：
![](https://assets.soloeternity.me/images/posts/you-get/5f54e29da9322d93c7165045b5d81c31.webp)

然后再加上网址，最终命令如下：

```shell
you-get --format=dash-flv720 https://www.bilibili.com/video/BV16V4y1J7XL?spm_id_from=333.1007.tianma.4-1-9.click
```

> **提示**：上面两个参数其实平常使用的并不多，因为下载时默认选择最高画质

### 3. 不下载字幕/弹幕

```shell
--no-caption Do not download captions (subtitles, lyrics, danmaku, ...)
```

细心的小伙伴可能已经发现了，我们每次下载除了我们想要的视频文件，还会有.xml格式的文件，打开发现是弹幕文件。这个时候我们就可以用 `--no-caption` 参数避免下载附加文件（如弹幕(.xml文件)）。

### 4. 指定输出文件名

```shell
-O FILE, --output-filename FILE Set output filename
```

`-O` 参数用于选择输出文件的名称，示例如下：

```shell
you-get -O 演示视频.flv https://www.bilibili.com/video/BV16V4y1J7XL?spm_id_from=333.1007.tianma.4-1-9.click
# 输出文件名为演示视频.flv
```

### 5. 指定输出目录

```shell
-o DIR, --output-dir DIR Set output directory
```

`-o` 参数用于选择输出文件夹，示例如下：

```shell
you-get -o D:\mhp https://www.bilibili.com/video/BV16V4y1J7XL?spm_id_from=333.1007.tianma.4-1-9.click
# 输出文件夹为D:\mhp
```

### 6. 直接播放视频

```shell
-p PLAYER, --player PLAYER Stream extracted URL to a PLAYER
```

有时我们需要直接播放视频，这个时候可以用 `-p` 参数，示例如下：

1. 进入播放器目录下（可以右键快捷方式，选择打开文件所在位置）
2. 按住Shift右键，选择在此处打开PowerShell
3. 输入以下代码回车：

```shell
you-get -p PotPlayerMini64.exe https://www.bilibili.com/video/BV16V4y1J7XL?spm_id_from=333.1007.tianma.4-1-9.click"&"vd_source=5398c273c88af14248fea9c85f8a2d8f"&"t=52.8
```

### 7. 使用Cookies下载会员内容

```shell
-c COOKIES_FILE, --cookies COOKIES_FILE Load cookies.txt or cookies.sqlite
```

有些视频需要会员才能下载，这个时候我们可以用会员的cookie下载。

关于cookies文件的获取大家可以去火狐浏览器上登一下任意一个B站大会员的账号，然后在资源管理器中搜索cookies.sqlite（路径中有Mozilla和Firefox是我们要找的），最后复制出来就能使用啦！

假设我把cookies文件放在了D盘根目录下，即我的cookies文件的绝对路径为‪D:\cookies.sqlite，那么我用该cookies下载视频的示例如下：

```shell
you-get -c D:\cookies.sqlite https://www.bilibili.com/video/BV16V4y1J7XL?spm_id_from=333.1007.tianma.4-1-9.click
```

### 8. 下载播放列表

```shell
-l, --playlist Prefer to download a playlist
```

如果需要下载视频列表（如下载电视剧/番剧的时候），则可以使用 `-l` 参数，示例如下：

```shell
you-get -l https://www.bilibili.com/bangumi/play/ep83810?from_spmid=666.25.episode.0"&"from_outer_spmid=666.4.0.0"&"t=4.4
```

这个命令可以依次下载整部剧，注意中途不要进行多余操作，否则会容易中断下载。

### 9. 跳过文件大小检查

```shell
--skip-existing-file-size-check Skip existing file without checking file size
```

you-get有断点续存的功能，但是在重新检测文件是否已经下载的时候可以使用此参数跳过文件大小检查，加快下载进程。

### 10. 组合使用多个参数

最后，注意实际运用时可以同时使用多个参数以实现多个功能，比如：

```shell
you-get -c D:\cookies.sqlite -l -o D:\mhp --no-caption https://www.bilibili.com/video/BV16V4y1J7XL?spm_id_from=333.1007.tianma.4-1-9.click
```

## 4 高级应用

学习you-get的命令行使用方法以后就可以结合Python编程实现一定的自动化。

下面就是一个简单的示例：

### 4.1 分析URL规律

1. 打开网页，对url进行分析

![](https://assets.soloeternity.me/images/posts/you-get/0b8185d18a4c8cf2b2b613a85c27ea43.webp)

第一集：`https://www.bilibili.com/bangumi/play/ep83810?from_spmid=666.25.episode.0&from_outer_spmid=666.4.0.0&t=1.5`
第二集：`https://www.bilibili.com/bangumi/play/ep83811?from_spmid=666.25.episode.0&from_outer_spmid=666.4.0.0&t=48.4`
第三集：`https://www.bilibili.com/bangumi/play/ep83812?from_spmid=666.25.episode.0&from_outer_spmid=666.4.0.0&t=2.1`

很尴尬地发现没啥规律，但是也不是一点用都没有，于是想可以将想要下载的url放一个txt文件里，用Python导入后进行多线程下载，提高下载速度（单独下载一个视频时，you-get不能充分利用内存）。于是乎有了以下思路：

### 4.2 实现思路

思路一：开多线程下载，尝试后发现由于只有一个运行框，导致虽然所有进程都在跑，但是真正在下载的只有一个，pass掉。

思路二：每开一个线程就运行一次powershell，这样就可以避免因运行框数量导致无法同时下载。尝试后发现自己不知道如何把输出定向到不同的窗口，再次pass掉。

思路三：生成多个py文件并写入下载命令，然后同时选中执行，然后发现py文件不能直接写入~于是便想到先生成txt文件，在写入命令后重命名为py文件即可，发现可行，源码如下：

```python
import os
import keyboard

def you_get(url,i):
    workpath = os.getcwd()
    with open(f'{workpath}\\{i}.txt','w', encoding="utf-8") as file:
            file.write('import os\n')
            file.write(f'os.system("you-get -c D:\cookies.sqlite -o D:\mhp\  --no-caption {url}")')
    origin = os.path.join(os.getcwd(),f'{i}.txt')
    current = os.path.join(os.getcwd(),f'{i}.py')
    os.rename(origin, current)

url_list = []
with open("./url.txt") as url_file:
    urls = url_file.read()
url_initial_list = urls.splitlines(keepends=False)
for i in url_initial_list:
    url = i.replace("&",r"\"&\"")
    url_list.append(url)
n = int(len(url_list))

for i in range(n):
    url = url_list[i]
    you_get(url,i+1)
```

使用方法：

1. 将上述代码保存为py文件（cookies和下载目录自己改一下）
2. 用 `pip install keyboard` 安装keyboard包
3. 新建url.txt并输入url（写完一个换行），和上述py文件保存在同一目录下
4. 运行py文件，这时会生成多个py文件，同时选中后按回车运行即可

> **提示**：有能力的小伙伴还可以结合爬虫技术实现更强大的功能，有好的想法可以在评论区一起探讨。

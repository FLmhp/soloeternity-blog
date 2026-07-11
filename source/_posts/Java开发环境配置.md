---
title: Java开发环境配置
tags: [Java]
categories: [Java]
index_img: https://assets.soloeternity.me/images/posts/covers/java.webp
banner_img: https://assets.soloeternity.me/images/backgrounds/post_banner.webp
date: 2022-07-21 18:50:40
---

在开发Java应用程序之前，我们需要正确配置Java开发环境。本文将详细介绍单JDK和双JDK环境的配置方法。

<!-- more -->

## 1 单JDK配置方法

### 1.1 下载并安装JDK

首先我们需要下载[Java开发工具包JDK](https://www.oracle.com/java/technologies/downloads/)。

在下载页面中根据自己的系统选择对应的版本，本文以Windows 64位系统为例：

![](https://assets.soloeternity.me/images/posts/java-environment/e6f7a7eb8f117d9e963c142b6d311bb0.webp)

下载后双击打开exe文件开始安装JDK：

1. 单击"**下一步**"
   ![](https://assets.soloeternity.me/images/posts/java-environment/36e3969c3e936c496962c3e316788605.webp)

2. 选择安装位置（建议更改为D盘）
   ![](https://assets.soloeternity.me/images/posts/java-environment/fa79360c27166f59a407ecd76a8f6125.webp)

   复制路径以备待用：`D:\Program Files\Java\jdk-18.0.2`

3. 单击"**下一步**"开始安装
   ![](https://assets.soloeternity.me/images/posts/java-environment/7c1379b58d3894fc907cf18489cf878e.webp)

4. 安装过程
   ![](https://assets.soloeternity.me/images/posts/java-environment/564c216fffbe5a9caf7b9d2322f51fbd.webp)

5. 安装完成
   ![](https://assets.soloeternity.me/images/posts/java-environment/85abf1c418655662eae8e277a0f9f4ca.webp)

> **提示**：安装JDK的时候也会安装JRE，无需额外安装。

### 1.2 配置环境变量

1. 安装完成后，右击"**此电脑**"，点击"**属性**"，选择"**高级系统设置**"；
   ![](https://assets.soloeternity.me/images/posts/java-environment/8fa128863dd55189a58d0281fab287a3.webp)

2. 选择"**高级**"选项卡，点击"**环境变量**"；
   ![](https://assets.soloeternity.me/images/posts/java-environment/b7e54cffbf56608ce1e957d91b8b1422.webp)
   ![](https://assets.soloeternity.me/images/posts/java-environment/2b02a59351b9b39ee2b834211e88cbc3.webp)

3. 按如下顺序配置系统变量（注意：是**系统变量**！新建、编辑按钮在下方！）：

> **提示**：每次修改完记得点确定！

#### 1) 新建变量`JAVA_HOME`

- 变量名：`JAVA_HOME`
- 变量值：`D:\Program Files\Java\jdk-18.0.2`（要根据自己的实际路径配置）

![](https://assets.soloeternity.me/images/posts/java-environment/b075a119ea2070c77238d48bb7be4c0d.webp)

#### 2) 新建变量`CLASSPATH`

- 变量名：`CLASSPATH`
- 变量值：`.;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar;`（记得前面有个"."）

![](https://assets.soloeternity.me/images/posts/java-environment/4b47877f3519bd3dee0ea093844f2d1b.webp)

#### 3) 编辑变量`PATH`

添加以下两个变量值：

- `%JAVA_HOME%\bin`
- `%JAVA_HOME%\jre\bin`

![](https://assets.soloeternity.me/images/posts/java-environment/dd0f9644338dcc9f26228944c8882822.webp)

> **提示**：建议将两个变量值全部上移至顶部以便于安装双JDK。

### 1.3 检验配置结果

1. 按住"**Win（徽标键）+R**"，打开运行框
   ![](https://assets.soloeternity.me/images/posts/java-environment/92e1d0e92ed7c0d463a1449caa77ec6b.webp)

2. 输入"**cmd**"，回车打开cmd
   ![](https://assets.soloeternity.me/images/posts/java-environment/260e78822b5424ab8fa494d13cec531b.webp)
   ![](https://assets.soloeternity.me/images/posts/java-environment/edbe6cc6c6810e4d52c195cd6e3446e1.webp)

3. 依次键入以下命令并回车:

```shell
java
java -version
javac
```

若出现以下信息则代表配置成功：

![](https://assets.soloeternity.me/images/posts/java-environment/bbbf84c7fc12c5e7ac4776336563c46f.webp)
![](https://assets.soloeternity.me/images/posts/java-environment/2620e23e497243882bf535c2fbfc3871.webp)

## 2 双JDK配置方法

### 2.1 下载并安装JDK

参见**1.1**

> **提示**：请装在同一目录下，便于环境变量配置

### 2.2 配置环境变量

1. 参照**1.2**打开环境变量

2. 按如下顺序配置系统变量（注意：是系统变量！新建、编辑按钮在下方！）：

> **提示**：每次修改完记得点确定！

#### 1) 编辑变量`JAVA_HOME`

- 变量名：`JAVA_HOME18`（注意这里有改动）
- 变量值：`D:\Program Files\Java\jdk-18.0.2`

![](https://assets.soloeternity.me/images/posts/java-environment/0cca0a8e9d4ab4361842f9bc3c0d5c74.webp)

#### 2) 新建变量`JAVA_HOME8`

- 变量名：`JAVA_HOME8`
- 变量值：`D:\Program Files\Java\jdk1.8.0_331`（要根据自己的实际路径配置）

![](https://assets.soloeternity.me/images/posts/java-environment/079130c9fab5ff317529c7cdeb24313a.webp)

#### 3) 新建变量`JAVA_HOME`

- 变量名：`JAVA_HOME`
- 变量值：`%JAVA_HOME18%`（需要改JDK时改成`%JAVA_HOME8%`）

![](https://assets.soloeternity.me/images/posts/java-environment/427dc9ac1e031e33168b44dfcb852cf7.webp)

### 2.3 检验配置结果

1. 参照**1.3**打开进行检验
   > **注意**：此时变量JAVA_HOME值为`%JAVA_HOME18%`

2. 将变量`JAVA_HOME`值改为`%JAVA_HOME8%`后
   ![](https://assets.soloeternity.me/images/posts/java-environment/c4a6055996f5f52bd7eec42f51708b66.webp)

3. 在cmd中键入`java -version`命令检验，若出现以下信息则代表配置成功：
   ![](https://assets.soloeternity.me/images/posts/java-environment/6054d7d970dc0861ce272e0e28e73563.webp)

> **提示**：如果版本号没变，请完成以下操作：
>
> 1. 检查`PATH`变量中`%JAVA_HOME%\bin`和`%JAVA_HOME%\jre\bin`是否位于最顶端，不是的话用上移按钮移至最顶端
> 2. 刷新cmd（关了重开）
> 3. 键入`java -version`，回车

---
title: PowerShell 7 美化与效率增强：打造可维护的 Windows Terminal 工作环境
tags: [PowerShell, Windows Terminal, Oh My Posh, Starship]
categories: [Windows, 开发环境]
index_img: https://assets.soloeternity.me/images/posts/covers/powershell-7.webp
banner_img: https://assets.soloeternity.me/images/backgrounds/post_banner.webp
date: 2026-07-15 09:07:08
---

我原来的 PowerShell 已经装了不少美化和效率工具，但入口、主题与 Profile 配置各管一摊。更麻烦的是，Profile 会在非交互环境中照常加载 PSReadLine，执行脚本时偶尔出现“句柄无效”。这次调整的重点不是单纯换个主题，而是把终端入口、Prompt、补全和常用工具整理成一套容易维护的配置。

最终环境以 Windows Terminal 和 PowerShell 7 为入口，默认使用 Oh My Posh，Starship 作为随时可切换的备用 Prompt；PSReadLine、fzf、zoxide、Terminal-Icons 和 posh-git 则负责补全、搜索、导航与 Git 状态显示。

<!-- more -->

## 1 改造目标与最终效果

这套配置完成后具备以下能力：

- Windows Terminal 默认打开 PowerShell 7
- 使用 Nerd Font 正常显示 Powerline 分隔符与文件图标
- 默认加载自定义 Oh My Posh 主题
- 当前会话可一键切换到 Starship，也能随时切回
- 支持菜单补全、历史预测、模糊历史搜索和模糊文件选择
- 支持目录智能跳转、文件图标和 Git 状态显示
- 非交互 PowerShell 不再加载依赖控制台的 UI 配置

我保留了 Windows PowerShell 5.1，没有把它从系统中移除。遇到只能在旧版环境运行的脚本时，它仍然可以作为兼容入口。

## 2 开始前的准备

### 2.1 基础环境

开始配置前，先准备以下组件：

- Windows Terminal
- PowerShell 7
- Oh My Posh
- Starship
- CaskaydiaCove Nerd Font
- zoxide
- Terminal-Icons
- posh-git
- fzf 与 PSFzf

Oh My Posh 和 Starship 的安装方式可能随版本变化，建议直接参考各自的官方文档：

- [Oh My Posh Windows 安装文档](https://ohmyposh.dev/docs/installation/windows)
- [Starship 安装与初始化指南](https://starship.rs/guide/)

安装完成后，可以先确认常用命令是否存在：

```powershell
Get-Command pwsh, oh-my-posh, starship, fzf, zoxide
Get-Module -ListAvailable Terminal-Icons, posh-git, PSFzf
```

### 2.2 安装 PowerShell 模块

posh-git 和 PSFzf 可以从 PowerShell Gallery 安装：

```powershell
Set-PSRepository -Name PSGallery -InstallationPolicy Trusted
Install-Module -Name posh-git, PSFzf -Scope CurrentUser -Force -AllowClobber
```

如果使用 Scoop 管理命令行工具，可以这样安装 fzf：

```powershell
scoop install fzf
```

### 2.3 字体名称要以系统识别结果为准

Nerd Fonts 下载页中的字体名称和 Windows Terminal 实际识别到的字体家族名不一定完全相同。我使用的是 Cascadia Code 的 Nerd Font 版本，系统中显示的名称为：

```text
CaskaydiaCove NF
```

如果 Prompt 图标变成方块，先到 Windows Terminal 的外观设置中确认字体名称，而不是照抄下载页面上的名字。字体可以从 [Nerd Fonts](https://www.nerdfonts.com/font-downloads) 获取。

## 3 Prompt 方案：Oh My Posh 为主，Starship 备用

我没有在 Oh My Posh 和 Starship 之间二选一。

Oh My Posh 对 Powerline 分段样式的支持比较成熟，现有配置迁移过去也省事，所以继续作为默认 Prompt。Starship 的配置集中在一个 TOML 文件里，而且可以跨 Shell 使用，适合作为备用方案。

最终策略很简单：

- 默认加载 Oh My Posh
- 执行 `Use-Starship`，在当前会话切换到 Starship
- 执行 `Use-OhMyPosh`，切回 Oh My Posh
- 新开终端后仍回到默认 Prompt

如果希望以后默认使用 Starship，可以在加载 Prompt 前设置：

```powershell
$env:POWERSHELL_PROMPT_ENGINE = 'starship'
```

Starship 主题以官方的 [Pastel Powerline 预设](https://starship.rs/zh-cn/presets/pastel-powerline) 为基础，删掉不常用的模块，再让路径、Git、运行时和时间的布局尽量接近 Oh My Posh。

## 4 先备份，再拆分 Profile

### 4.1 备份现有配置

改 Profile 和 Windows Terminal 设置前，先做备份：

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$terminalSettings = Join-Path $env:LOCALAPPDATA `
  'Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json'

Copy-Item $PROFILE "$PROFILE.backup-$stamp" -Force
Copy-Item $terminalSettings "$terminalSettings.backup-$stamp" -Force
```

如果系统中的 Windows Terminal 来自其他安装渠道，`settings.json` 的位置可能不同。可以直接在 Windows Terminal 中打开设置文件，确认实际路径后再备份。

### 4.2 建立配置目录

不要假定 Profile 一定在固定的用户目录中，直接从 `$PROFILE` 取父目录更稳妥：

```powershell
$profileRoot = Split-Path -Parent $PROFILE

New-Item -ItemType Directory -Force -Path `
  (Join-Path $profileRoot 'Profile.d'), `
  (Join-Path $profileRoot 'themes'), `
  (Join-Path $HOME '.config')
```

配置文件按下面的职责拆分：

```text
Microsoft.PowerShell_profile.ps1
Profile.d/
├── 00-core.ps1
├── 10-prompt.ps1
├── 20-readline.ps1
└── 30-functions.ps1
themes/
└── vermouth-powerline.omp.json
```

各文件的职责如下：

- `Microsoft.PowerShell_profile.ps1`：只负责按顺序加载配置片段
- `00-core.ps1`：保存公共路径、判断交互式会话、记录当前 Prompt 引擎
- `10-prompt.ps1`：加载 Terminal-Icons、posh-git、zoxide 和 Prompt
- `20-readline.ps1`：配置 PSReadLine、预测、快捷键和 PSFzf
- `30-functions.ps1`：保存日常函数与 Git 快捷命令

这样拆分不是为了追求目录整齐。真正的好处是出现问题时能迅速判断它属于 Prompt、输入体验还是自定义函数，不必在一个很长的 Profile 中逐行排查。

## 5 配置两套 Prompt

### 5.1 Oh My Posh

Oh My Posh 使用自定义的 `vermouth-powerline.omp.json`。主题的主要布局是：

- 左侧显示系统、路径、Git 状态和当前项目使用的语言运行时
- 右侧显示命令执行时间与当前时间
- 第二行只保留状态码和输入箭头

实际效果如下：

![Oh My Posh 与 Vermouth Powerline 主题效果](https://assets.soloeternity.me/images/posts/powershell-7/oh-my-posh.webp)

主题文件放在：

```powershell
Join-Path (Split-Path -Parent $PROFILE) 'themes\vermouth-powerline.omp.json'
```

日常调整配色、图标和分段顺序时，只修改主题文件，不把这些细节重新写进 Profile。

### 5.2 Starship

Starship 配置保存在：

```powershell
Join-Path $HOME '.config\starship.toml'
```

需要恢复官方 Pastel Powerline 预设时，可以重新生成：

```powershell
starship preset pastel-powerline -o ~/.config/starship.toml
```

重新生成会覆盖现有配置，执行前记得备份。修改 TOML 后，执行 `Reload-Profile` 再切换到 Starship 即可查看效果。

![Starship Pastel Powerline 主题效果](https://assets.soloeternity.me/images/posts/powershell-7/starship.webp)

## 6 设置 Windows Terminal 外观

Windows Terminal 的外观既可以通过设置界面调整，也可以直接编辑 `settings.json`。字段含义可以参考 [Windows Terminal 外观配置文档](https://learn.microsoft.com/zh-cn/windows/terminal/customize-settings/profile-appearance)。

我把通用字体、配色和光标放在 `profiles.defaults` 中，把背景图只放在 PowerShell 7 对应的 Profile 下。这样 cmd、WSL 和其他 Shell 不会被一起套上背景图。

背景图相关配置如下：

```json
{
  "backgroundImage": "C:\\Users\\<用户名>\\Pictures\\Vermouth.png",
  "backgroundImageAlignment": "center",
  "backgroundImageOpacity": 0.18,
  "backgroundImageStretchMode": "uniformToFill"
}
```

JSON 中不能直接照搬 PowerShell 的 `$HOME` 变量，上面的 `<用户名>` 需要替换为自己的实际路径。

背景透明度可以从 `0.18` 开始调整。我更在意文字可读性，通常不会超过 `0.24`。如果图案干扰命令输出，就继续降低，而不是反复修改 Prompt 配色来迁就背景。

还需要在 Windows Terminal 中完成两项设置：

1. 将默认 Profile 切换为 PowerShell 7
2. 将字体设置为系统实际识别到的 `CaskaydiaCove NF`

修改完成后重开 Windows Terminal。

## 7 输入、搜索与导航增强

### 7.1 PSReadLine

PSReadLine 负责命令行编辑、历史记录、预测和快捷键。当前配置启用：

| 按键 | 功能 |
| --- | --- |
| `Tab` | 打开菜单补全 |
| `UpArrow` | 按当前输入向上匹配历史 |
| `DownArrow` | 按当前输入向下匹配历史 |
| `Ctrl+r` | 模糊搜索历史命令 |
| `Ctrl+t` | 模糊选择当前目录树中的文件 |
| `Ctrl+z` | 撤销输入 |
| `Ctrl+y` | 重做输入 |

预测源使用 `HistoryAndPlugin`，显示方式使用 `ListView`。PSReadLine 的预测源、视图和快捷键配置可参考 [about_PSReadLine](https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline?view=powershell-7.6)。

例如输入：

```powershell
git ch
```

按下 `Tab` 后，可以从菜单中选择 `checkout`、`cherry-pick` 等候选命令。记得一部分命令时，`Ctrl+r` 往往比反复按方向键快得多。

### 7.2 fzf 与 PSFzf

fzf 提供底层模糊搜索，PSFzf 负责把它接入 PowerShell。

- `Ctrl+r`：从历史命令中搜索
- `Ctrl+t`：从当前目录树中选择文件，并把路径插入命令行

如果快捷键没有反应，先检查：

```powershell
Get-Command fzf
Get-Module -ListAvailable PSFzf
```

### 7.3 zoxide

zoxide 会记录常用目录，用关键词代替完整路径：

```powershell
z project
z github
z docs
```

它适合在几个深层项目目录之间来回切换。刚安装时还没有足够的访问记录，需要先正常使用一段时间。

### 7.4 Terminal-Icons 与 posh-git

Terminal-Icons 为 `Get-ChildItem` 的结果增加文件类型图标，posh-git 则补充 Git 命令体验。配合 Prompt，可以直接看到：

- 当前分支
- ahead 和 behind 状态
- 工作区修改
- 暂存区修改

常用 Git 快捷函数可以保持简短：

```text
gs      git status
ga      git add
gp      git push
gpush   git push
gpull   git pull
gcl     git clone
gcom    git add . 后提交
lazyg   添加、提交并推送
```

例如：

```powershell
gs
ga .
gcom "fix: update prompt colors"
gp
```

## 8 修复非交互环境中的 PSReadLine 报错

这次调整中最值得单独记录的是“句柄无效”问题。

旧 Profile 在每次 PowerShell 启动时都会执行 `Set-PSReadLineOption`。交互式终端有完整的控制台句柄，所以平时看不出问题；当编辑器、自动化工具或其他程序通过 `pwsh -Command` 启动非交互会话时，PSReadLine 仍然尝试初始化 UI，错误就出现了。

解决思路是在 `00-core.ps1` 中提供 `Test-InteractiveShell`，只在交互式会话加载 Prompt 和 PSReadLine：

```powershell
if (Test-InteractiveShell) {
    # 加载 10-prompt.ps1 与 20-readline.ps1
}
```

这里不需要吞掉异常，也不该在每个 PSReadLine 调用旁边分别加判断。把判断放在共同入口，所有非交互启动方式都会一起受益。

修复后用下面的命令验证：

```powershell
pwsh -Command "Get-Date"
```

命令应正常输出日期，不再出现 PSReadLine 的控制台句柄错误。

## 9 日常使用与维护命令

配置完成后，最常用的入口只有几个：

```powershell
Show-Help
Use-Starship
Use-OhMyPosh
Reload-Profile
Edit-Profile
Edit-TerminalSettings
```

它们分别用于查看帮助、切换 Prompt、重载配置以及打开两个主要配置文件。

文件和目录相关函数可以按自己的习惯保留：

```powershell
touch demo.txt
mkcd demo-folder
ff config.json
head .\README.md
sed file a b
```

进程与系统相关函数包括：

```powershell
pgrep code
pkill node
k9 chrome
uptime
```

这些函数适合放在 `30-functions.ps1`。新增函数前先确认 PowerShell 本身或现有模块是否已经提供同等能力，避免 Profile 逐渐变成另一套难维护的命令框架。

## 10 完成后的验证

建议按下面的顺序检查：

### 10.1 终端入口

1. 打开 Windows Terminal
2. 确认新标签页进入 PowerShell 7
3. 确认字体图标没有显示成方块
4. 确认背景图只出现在 PowerShell Profile

### 10.2 Prompt 切换

```powershell
Use-Starship
Use-OhMyPosh
```

两次切换都应立即生效。新开终端后，应恢复到设定的默认 Prompt。

### 10.3 补全与导航

- 按 `Tab` 查看补全菜单
- 按 `Ctrl+r` 搜索历史命令
- 按 `Ctrl+t` 选择文件
- 执行 `z <目录关键词>` 测试目录跳转
- 在 Git 仓库中确认分支和修改状态正常显示

### 10.4 非交互稳定性

```powershell
pwsh -Command "Get-Date"
```

这一步不要省。终端看起来正常，并不代表编辑器和自动化工具启动 PowerShell 时也正常。

## 11 常见问题

### 11.1 Prompt 没有加载

先确认 Oh My Posh 在 PATH 中：

```powershell
Get-Command oh-my-posh
```

然后执行：

```powershell
Reload-Profile
```

仍未恢复时，检查主题路径是否存在，以及 Profile 片段是否按正确顺序加载。

### 11.2 Starship 切换后没有生效

依次执行：

```powershell
Use-Starship
Reload-Profile
Use-Starship
```

同时检查：

```powershell
Get-Command starship
```

### 11.3 图标显示成方块

检查当前终端宿主是否为 Windows Terminal，再确认字体家族名是否为系统实际识别到的 Nerd Font。修改字体后，重开 Windows Terminal。

### 11.4 Ctrl+r 不是模糊搜索

检查 fzf 与 PSFzf：

```powershell
Get-Command fzf
Get-Module -ListAvailable PSFzf
```

两者都存在时，再检查 `20-readline.ps1` 是否在交互式会话中加载。

### 11.5 修改配置后出现异常

先恢复之前备份的 Profile 或 `settings.json`，再逐个加载 `Profile.d` 中的片段定位问题。模块化拆分的价值在这里最明显：一次只排查一类配置。

## 12 后续维护

这套环境稳定后，维护边界很清楚：

- 改 PowerShell 行为：编辑 `Profile.d` 中对应片段
- 改 Oh My Posh 外观：编辑 `.omp.json` 主题
- 改 Starship 外观：编辑 `starship.toml`
- 改终端字体、背景和透明度：编辑 Windows Terminal 设置
- 改完 PowerShell 配置：执行 `Reload-Profile`
- 改完 Windows Terminal 设置：重开终端

以后要增加新工具，也先判断它属于 Prompt、输入、导航还是自定义函数，再放进对应文件。配置可以继续长，但入口不必再乱。

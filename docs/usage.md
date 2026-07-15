# 博客使用手册

本文面向博客作者和日常维护者，覆盖本地写作、Decap CMS、媒体上传、动态服务、评论、统计和故障处理。

最后核验：`2026-07-15`。

## 1. 日常内容类型

| 内容 | 数据源 | 页面 | 发布方式 |
| --- | --- | --- | --- |
| 正式文章 | `source/_posts/*.md` | 首页、归档、分类、标签、文章页 | Git 或 Decap CMS |
| 随笔 | Memos `#essay` | `/essays/` | Memos |
| 动态 | Memos `#moment` | `/moments/` | Memos |
| 语录 | Hitokoto + 本地 fallback | `/quotes/` | 自动接口/代码配置 |
| 相册 | Chevereto 公开相册 | `/gallery/` | Chevereto 后台 |
| 看番记录 | Bangumi 用户 `soloeternity` | `/anime/` | Bangumi |
| 友链 | Fluid links 配置 | `/links/` | 修改仓库配置 |
| 留言 | Waline | `/message/` | 访客评论 |

正式文章属于 Git 真源；Memos、Waline、Chevereto 和 Umami 是独立数据库服务，不会被 Hexo 构建写入。

## 2. 本地写作

### 2.1 环境

- Node.js `20`
- pnpm `9.15.9`
- Git
- 可选 rclone `1.74.4`

安装：

```powershell
corepack enable
pnpm install --frozen-lockfile
```

### 2.2 新建文章

```powershell
pnpm exec hexo new post "文章标题"
```

或者直接在 `source/_posts/` 创建 Markdown。

推荐 front matter：

```yaml
---
title: 文章标题
date: 2026-07-15 12:00:00
categories:
  - 法律与社会
  - 知识产权
tags:
  - LV
  - 茉莉奶白
  - 商标法
index_img: https://assets.soloeternity.me/images/posts/covers/article-slug.webp
banner_img: https://assets.soloeternity.me/images/posts/covers/article-slug.webp
excerpt: 一段用于首页卡片和 SEO 的简短摘要。
---
```

多级分类是顺序数组。上例表示：

```text
法律与社会 > 知识产权
```

标签是平级数组，没有父子关系。

### 2.3 更新时间

项目设置：

```yaml
updated_option: empty
```

并通过 Git 历史脚本计算文章最后修改时间。这样部署配置、主题样式或其他文章变化不会批量刷新所有文章的更新时间。

真正修改文章正文并提交后，该文章更新时间才会变化。要获得正确结果，文章必须已纳入 Git。

### 2.4 本地预览

```powershell
pnpm clean
pnpm build
pnpm server
```

访问：

```text
http://localhost:4000
```

动态页面仍会请求生产 Memos、Chevereto、Bangumi 和 Hitokoto。若本地 Origin 未被 CORS 允许，动态内容可能无法读取；这不代表静态构建失败。

## 3. Decap CMS 在线写作

### 3.1 入口和链路

入口：

```text
https://soloeternity.me/admin/
```

链路：

```text
Decap CMS
  -> cms-auth.soloeternity.me/auth
  -> GitHub OAuth
  -> FLmhp/soloeternity-blog
  -> editorial_workflow
  -> GitHub PR/merge
  -> Actions 发布
```

在线写作不会直接修改服务器文件。

### 3.2 分类字段

Decap 中分类是列表字段。多个项目使用英文逗号 `,` 分隔：

```text
法律与社会, 知识产权
```

生成结果等价于：

```yaml
categories:
  - 法律与社会
  - 知识产权
```

顺序就是层级顺序。不要使用空格、中文顿号或斜杠作为分隔符。

错误示例：

```text
法律与社会 知识产权
法律与社会、知识产权
法律与社会/知识产权
```

这些通常会被当成一个分类名称。

### 3.3 标签字段

标签也是列表，使用英文逗号：

```text
LV, 茉莉奶白, 商标侵权, 商标法, 四叶花
```

生成：

```yaml
tags:
  - LV
  - 茉莉奶白
  - 商标侵权
  - 商标法
  - 四叶花
```

不要为了搜索而堆积大量近义标签。建议每篇 `3-8` 个，最多不超过 `12` 个。

### 3.4 日期

Decap 日期按浏览器当前时区录入。项目业务时区为 `Asia/Shanghai`。发布前确认日期没有被设到未来，否则 Hexo 可能不在当前构建显示文章。

### 3.5 封面和正文图片

Decap 内置媒体库当前仍指向仓库的 `source/uploads`，适合小图或临时附件。正式文章大图推荐：

1. 本地转为 WebP。
2. 上传 R2。
3. 验证公开 URL。
4. 把 URL 填入封面和 Markdown。

封面：

```text
https://assets.soloeternity.me/images/posts/covers/<slug>.webp
```

正文：

```text
https://assets.soloeternity.me/images/posts/<slug>/01.webp
```

Markdown：

```markdown
![图片说明](https://assets.soloeternity.me/images/posts/<slug>/01.webp)
```

### 3.6 编辑工作流

Decap 使用 `editorial_workflow`：

1. 保存草稿。
2. 设置为待审核。
3. 预览生成内容。
4. 发布并合并到 `main`。
5. 等待 Actions 成功。
6. 打开线上文章检查封面、目录、分类、标签和评论区。

如果“已发布”后网站未出现：

1. 查看文章日期是否在未来。
2. 查看 GitHub 是否真的合并到 `main`。
3. 查看 Actions 是否成功。
4. 查看 Markdown front matter 是否有效。
5. 查看 Cloudflare 是否仍缓存旧 HTML。

## 4. R2 媒体工作流

### 4.1 目录约定

```text
images/
  avatars/
  backgrounds/
  branding/
  link/
  posts/
    covers/
    <article-slug>/
  social/
live2d/
  models/
music/
  covers/
  lyrics/
  tracks/
```

友链头像统一在 `images/link/`。

### 4.2 文件格式

- 照片、文章配图、封面：WebP。
- 需要透明且 Live2D/工具链要求的贴图：PNG。
- 图标：优先 SVG/WebP，按来源格式决定。
- 音频：MP3。
- 歌词：UTF-8 LRC。
- 不把 PSD、ZIP、PNG 原稿和无损音频作为公开站点资源。

PNG 原稿应保存在本地归档或离线备份，不必重复上传到 R2。四叶花文章只需要 8 张 WebP，不上传 8 张 PNG 原稿。

### 4.3 rclone

rclone 路径：

```text
C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe
```

列目录：

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' lsd r2:soloeternity-assets
```

上传单文件：

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' copyto `
  '.\cover.webp' `
  'r2:soloeternity-assets/images/posts/covers/article-slug.webp' `
  --progress
```

上传正文目录：

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' copy `
  '.\article-slug' `
  'r2:soloeternity-assets/images/posts/article-slug' `
  --include '*.webp' `
  --progress
```

默认用 `copy`，不要随意使用 `sync`。`sync` 会删除远端多余文件，路径写错可能造成批量删除。

### 4.4 上传后检查

```powershell
curl.exe -I 'https://assets.soloeternity.me/images/posts/covers/article-slug.webp'
```

预期：

- HTTP `200`
- `Content-Type: image/webp`
- 文件大小合理
- 浏览器能直接显示

如果首页封面破图，优先检查 front matter 的完整 URL 和 R2 对象实际路径是否一致。文件名大小写敏感。

## 5. 随笔和动态

### 5.1 发布规则

在 Memos 创建公开内容：

- 随笔：包含 `#essay`
- 动态：包含 `#moment`

同一条内容可以同时包含两个标签，此时会在两个页面出现。

### 5.2 支持内容

博客页面支持：

- Memos Markdown 正文
- 标题、列表、引用、代码、链接
- 图片和其他附件
- 引用与被引用内容
- 地点
- 标签
- 本地时区日期

附件文件名不单独显示；图片直接预览。引用样式只显示纯文本摘要，但整块具有隐式超链接，可跳转到对应 Memos。

### 5.3 页面空白

检查：

```text
https://memos.soloeternity.me/api/v1/memos?filter=visibility=="PUBLIC"&pageSize=20
```

依次确认：

1. Memo 是 PUBLIC。
2. 标签拼写为英文 `#essay` 或 `#moment`。
3. API 能匿名返回。
4. 浏览器请求 Origin 为 `https://soloeternity.me`。
5. Caddy CORS 没有报错。
6. `memos-feed-v5.js?v=7` 没有被旧缓存覆盖。

Memos 使用 WAL，备份必须包含整个数据目录或使用 SQLite 一致性备份。

## 6. Gallery

### 6.1 管理相册

后台：

```text
https://gallery.soloeternity.me
```

操作：

1. 创建相册。
2. 填写相册标题、简述和标签。
3. 上传图片。
4. 将相册设为公开。
5. 匿名访问 `/explore/albums` 验证。

博客不显示 Chevereto 管理入口，只读取公开相册信息。

### 6.2 不显示相册

- 相册不是公开状态。
- Chevereto 登录 Cookie 掩盖了匿名权限问题。
- CORS 未允许博客主域。
- Chevereto 升级后 HTML 结构变化。
- Cloudflare 返回旧页面。

使用无痕窗口检查公开可见性。

## 7. Anime

数据源：

```text
https://bgm.tv/user/soloeternity
```

页面读取 Bangumi API 的动画收藏状态：

- 想看
- 看过
- 在看
- 搁置
- 抛弃

页面默认优先显示“在看”，浏览器 sessionStorage 缓存约 30 分钟。卡片包含封面、右上角评分、进度、标题、标签和简介，点击跳转 Bangumi 条目。

Bangumi 是外部依赖。服务器核验曾出现一次 API 超时；页面不能因此影响其他导航或全站构建。

## 8. Quotes

一言请求：

```text
https://v1.hitokoto.cn/?encode=json&c=a&c=b&c=c&c=d&c=h&c=j&c=k
```

类型：

- `a` 动画
- `b` 漫画
- `c` 游戏
- `d` 文学
- `h` 影视
- `j` 网易云
- `k` 哲学

交互：

- 初次加载显示动画。
- 点击句子请求下一条。
- 刷新后 3 秒内禁用再次点击，避免快速请求竞争。
- 请求失败使用本地 fallback。
- 正文与来源使用不同书法字体。

## 9. 音乐播放器

播放器在所有普通博客页面加载，默认不自动播放。

当前曲目来自 R2：

- 音频：`music/tracks/*.mp3`
- 封面：`music/covers/*.webp`
- R2 备份歌词：`music/lyrics/*.lrc`
- 站点运行时歌词：`/music/lyrics/*.lrc`

功能：

- 播放/暂停
- 上一首/下一首
- 进度拖动
- 音量调整
- 歌单展开/收起
- 播放模式切换
- 滚动歌词
- 整体隐藏

播放器在 `window.load` 后懒初始化，音频 `preload: none`，避免与首屏背景竞争。

若封面或歌词不显示：

1. 检查 R2 URL `200` 和 MIME。
2. 检查 LRC 是 UTF-8。
3. 检查曲目配置中的文件名完全一致。
4. 清除 localStorage 中旧播放器状态。
5. 检查控制台 CORS/404。

## 10. Live2D

Live2D 第一次访问默认隐藏，用户主动打开后记忆状态。当前默认模型为 IceGirl，另有四个替代模型。

状态使用 localStorage 跨页面同步：

- 显示/隐藏
- 当前模型
- 用户切换状态

资源：

- 站点同源 `/live2d-models/` 用于运行，避免 WebGL 跨域问题。
- R2 `live2d/models/` 保存镜像备份。

模型资源较大，初始化应晚于首屏。不要把所有模型一次性预加载。

## 11. Waline 评论与留言板

### 11.1 入口

- 文章页底部评论。
- `/message/` 留言板。
- 管理：`https://waline.soloeternity.me/ui`

### 11.2 预设文案

文章：

```text
欢迎大家来评论区灌水喵~
```

留言板：

```text
写下此刻的心跳，它便不再只是你的。每一行字，都会在风里找到归宿。
```

### 11.3 邮件

生产 SMTP 位于 `/opt/waline/.env`，使用 QQ 邮箱授权码。邮件应区分：

- 留言板：主题“你的博客网站收到了新的留言”。
- 文章：主题中包含文章标题或至少页面路径。

管理员本人发表评论可能不触发给自己的通知。测试步骤：

1. 退出 Waline 管理员登录。
2. 使用另一邮箱匿名评论。
3. 查看页面是否写入。
4. 查看 `docker logs waline`。
5. 检查收件箱和垃圾箱。

### 11.4 地理位置

Waline 根据服务端看到的访客公网 IP 解析位置。使用 Clash、VPN、代理或 Cloudflare 时，结果通常对应出口节点，而不是电脑物理位置。

例如代理出口 IP 位于约翰内斯堡，评论就可能显示约翰内斯堡。关闭代理或为博客域名配置 DIRECT 后重新评论，才能让服务器看到本地运营商出口 IP。

Caddy 必须保留 Cloudflare 真实 IP 头链路。不要信任访客可以自行伪造的任意 `X-Forwarded-For`；应只信任 Cloudflare 源地址或由 Caddy覆盖的头。

## 12. 统计

### 12.1 Busuanzi

用于页脚显示：

- 总访问量
- 总访客数

这是公开装饰统计，不用于详细分析。

### 12.2 Umami

后台：

```text
https://umami.soloeternity.me
```

可按具体页面查看：

- 浏览量、访客、会话
- 来源、设备、浏览器、系统、国家/地区
- 单页路径
- 实时用户
- Web Vitals：LCP、INP、CLS、FCP、TTFB
- 自定义事件和属性

自定义事件：

| 事件 | 关键属性 |
| --- | --- |
| `nav-click` | 导航目标 |
| `search-open` | 页面路径 |
| `theme-toggle` | 明暗主题 |
| `quote-refresh` | 页面 |
| `music-*` | 动作、曲目 |
| `live2d-open` | 页面 |
| `anime-filter` | 收藏状态 |
| `anime-subject-open` | 条目 ID |
| `outbound-link` | 目标 host |
| `download` | 文件名 |
| `friend-link` | 目标 host |
| `comment-start` | 页面路径 |
| `content-copy` | 页面类型 |
| `scroll-depth` | 50/90 |
| `engaged-time` | 30/120 秒 |

统计为 0 时检查：

1. 浏览器是否拦截 Umami。
2. `script.js` 是否返回 `200`。
3. website ID 是否匹配。
4. `data-domains` 是否允许 `soloeternity.me`。
5. Cloudflare CSP/WAF 是否拦截。
6. 隐私插件是否阻止分析脚本。

## 13. 发布

### 13.1 Git 发布

```powershell
git status
pnpm clean
pnpm build
git diff --check
git add <files>
git commit -m "docs: update blog documentation"
git push origin main
```

不要使用 `git add .` 盲目提交本地临时文件、原图、数据库或 `.env`。

### 13.2 Actions

发布成功标准：

- Build 成功。
- rsync 成功。
- 权限修正成功。
- 工作流绿色完成。
- 线上首页显示新提交。

再次发布会使用 `--delete` 清理旧页面。

## 14. 常见故障

### 构建失败

```powershell
pnpm install --frozen-lockfile
pnpm clean
pnpm build
```

检查 YAML 缩进、Markdown front matter、重复路径和 Node 版本。

### 首页封面破图

- R2 对象不存在。
- URL 路径错误。
- `covers` 目录漏写。
- 大小写不同。
- MIME 错误。
- Cloudflare 缓存了旧 404。

### Actions 成功但页面没更新

- 请求命中 Cloudflare 旧缓存。
- 浏览器缓存。
- 提交没有进入 `main`。
- 文章日期在未来。
- 实际域名打开的是其他环境。

### Waline 500

- SQLite 表未初始化或数据库损坏。
- 数据目录无写权限。
- 容器版本和旧数据库结构不匹配。
- `.env` 配置错误。

先备份，再执行完整性检查，不要直接删除数据库。

### Umami 性能数值很差

先按页面、设备和样本量筛选。当前曾观察到 P95 LCP/FCP 约 22 秒、TTFB 约 6.7 秒，但样本可能包含代理网络、首次加载大背景、外部 API 或低速设备。优化应优先：

1. 首屏背景尺寸和格式。
2. R2/Cloudflare 缓存命中。
3. Live2D 和音乐延迟加载。
4. Anime/Memos/Gallery 请求不阻塞首屏。
5. 字体改为本地托管或减少 Google Fonts 阻塞。
6. 用页面级和国家/设备筛选验证改动，不只看全站 P95。

## 15. 发布后人工检查

1. 首页文章卡片封面。
2. 文章目录和多级分类。
3. 归档、分类、标签导航一致。
4. Essays/Moments 的 Markdown、附件、引用和地点。
5. Quotes 点击刷新和 3 秒冷却。
6. Gallery 相册和图片。
7. Anime 筛选、评分和跳转。
8. 文章评论与留言板。
9. 音乐播放、进度、音量、歌词和隐藏。
10. Live2D 默认隐藏、模型状态跨页同步。
11. Umami 实时访问和自定义事件。
12. 桌面、手机、明暗主题。


# Cloudflare R2 媒体存储规划

## 目标

- Bucket：`soloeternity-assets`
- 自定义域名：`assets.soloeternity.me`
- 用途：图片、音乐、大附件，不把二进制资源塞进 Git 仓库。

## 目录约定

```text
images/
  backgrounds/
  branding/
  avatars/
  link/
  posts/
    covers/
    java-environment/
    kali-linux-vm/
    ubuntu-vm/
    you-get/
  social/
music/
  tracks/
  covers/
  lyrics/
downloads/
  docs/
  packages/
live2d/
  models/
memos/
  attachments/YYYY/MM/
```

其中 `images/link/` 保存友链头像；`images/avatars/` 保存站长头像。相册原图继续由 Chevereto 管理，不在 R2 中重复保存。

文章中直接引用：

```md
![示例图](https://assets.soloeternity.me/images/posts/example/image.webp)
```

音乐播放器配置在 `source/js/site-config-v3.js`：

```js
music: [
  {
    name: "歌曲名",
    artist: "作者",
    url: "https://assets.soloeternity.me/music/tracks/song.mp3",
    cover: "https://assets.soloeternity.me/music/covers/song.webp"
  }
]
```

## rclone 示例

Cloudflare R2 S3 API endpoint 格式：

```text
https://edc50ca92af82eb445c6be9cfc2253ff.r2.cloudflarestorage.com
```

上传示例：

```bash
rclone copy ./images r2:soloeternity-assets/images --progress
rclone copy ./music r2:soloeternity-assets/music --progress
```

v1 不做博客内上传后台；先使用 Cloudflare Dashboard、rclone 或 S3 客户端管理文件。

## 更方便的管理方式

Cloudflare 控制面板适合偶尔看一眼，不适合批量管理。日常建议用 S3 兼容客户端：

- `rclone`：最适合批量同步、脚本化上传、从本地目录镜像到 R2。
- WinSCP：Windows 图形界面，选择 `Amazon S3` 协议，填 R2 endpoint、Access Key、Secret Key。
- Cyberduck：图形界面也比较省心，适合拖拽上传和预览目录。
- S3 Browser：偏传统 Windows 客户端，适合只想管理 bucket 文件的人。

### rclone 配置

1. 在 Cloudflare R2 创建 API Token，权限至少需要目标 bucket 的对象读写。
2. 执行：

```bash
rclone config
```

3. 新建 remote，类型选择 `s3`，provider 选择 `Cloudflare`，endpoint 填：

```text
https://edc50ca92af82eb445c6be9cfc2253ff.r2.cloudflarestorage.com
```

4. 常用命令：

```bash
# 查看目录
rclone lsd r2:soloeternity-assets

# 上传单个文件
rclone copy ./cover.jpg r2:soloeternity-assets/images/posts/2026/example/ --progress

# 本地目录同步到 R2，R2 多余文件会被删除，谨慎使用
rclone sync ./gallery r2:soloeternity-assets/images/gallery/2026 --progress

# 只复制新增和变更，不删除远端
rclone copy ./gallery r2:soloeternity-assets/images/gallery/2026 --progress
```

## 当前站点使用的上传命令

当前博客配置使用新结构，不再保留旧 `img/` 兼容目录：

- 背景图：`images/backgrounds/`
- 友链头像：`images/link/`
- 社交图标：`images/social/`
- 音乐文件：`music/tracks/`
- 音乐封面：`music/covers/`
- 歌词文件：`music/lyrics/`

```bash
rclone copy ./deploy/r2/music r2:soloeternity-assets/music --progress
rclone copy ./music-upload r2:soloeternity-assets/music/tracks --include "*.mp3" --exclude "*" --progress
```

本地已为网页播放整理这些 R2 上传文件：

```text
music-upload/uchiage-hanabi.mp3 -> music/tracks/uchiage-hanabi.mp3
music-upload/the-last-rain.mp3 -> music/tracks/the-last-rain.mp3
music-upload/merry-christmas-mr-lawrence.mp3 -> music/tracks/merry-christmas-mr-lawrence.mp3
deploy/r2/music/covers/uchiage-hanabi.webp
deploy/r2/music/covers/the-last-rain.webp
deploy/r2/music/covers/merry-christmas-mr-lawrence.webp
deploy/r2/music/lyrics/uchiage-hanabi.lrc
deploy/r2/music/lyrics/the-last-rain.lrc
deploy/r2/music/lyrics/merry-christmas-mr-lawrence.lrc
```

音频源文件和转码后的 MP3 体积较大，只作为临时上传源，不放入 `source/`，也不提交进 Git。歌词由 Hexo 同源提供，R2 中保留一份备份。

旧目录清理命令：

```bash
rclone purge r2:soloeternity-assets/img
rclone deletefile "r2:soloeternity-assets/music/merry-christmas-mr-lawrence.mp3"
rclone deletefile "r2:soloeternity-assets/music/merry-christmas-mr-lawrence.lrc"
rclone deletefile "r2:soloeternity-assets/music/the-last-rain.mp3"
rclone deletefile "r2:soloeternity-assets/music/uchiage-hanabi.mp3"
rclone deletefile "r2:soloeternity-assets/music/坂本龍一 - Merry Christmas Mr. Lawrence.mp3"
rclone deletefile "r2:soloeternity-assets/music/坂本龍一 - Merry Christmas Mr. Lawrence.lrc"
rclone deletefile "r2:soloeternity-assets/music/lyrics/坂本龍一 - Merry Christmas Mr. Lawrence.lrc"
```

## 适合迁移到 R2 的文件

优先迁移体积大、变化少、无需参与 Hexo 构建的资源：

- 文章封面和正文大图：`source/_posts/**` 中引用的图片，以及 Decap CMS 的 `index_img`。
- 图集资源：`source/gallery/` 页面展示的图片，目标目录为 `images/gallery/YYYY/`。
- 全站背景和 banner：如首页、归档、分类、标签、页面 banner 等大图，目标目录为 `images/backgrounds/`。
- 音乐播放器文件：`music/tracks/` 放音频，`music/covers/` 放封面，`music/lyrics/` 放歌词。
- 头像、社交二维码和展示图：`avatars/`、`images/social/`。
- Live2D 模型和贴图：完整备份到 `live2d/models/`。站点仍使用同源 `/live2d-models/` 加载，避免跨域 WebGL 兼容问题。
- 可下载附件：PDF、压缩包、演示文件等放到 `downloads/`。

## 暂时保留在 Git 仓库的文件

- Markdown 正文、Hexo 配置、主题模板、部署脚本和文档。
- 小型站点脚本和样式：`source/js/`、`source/css/`。
- Decap CMS 配置：`source/admin/`。
- 极小且影响首屏稳定性的图标资源，例如 favicon；后续确认缓存策略后再迁。
- Waline、Memos 的 SQLite 数据库和服务配置，不属于静态媒体资源。

## Memos 附件说明

Memos 中上传的图片默认由 Memos 服务管理。若要把 Memos 附件也迁到 R2，应优先在 Memos 的存储设置里配置 S3/R2 兼容存储，而不是手动改博客页面里的附件链接。博客的 `/essays/` 和 `/moments/` 只读取公开文本流，不直接托管 Memos 附件。

## 推荐迁移顺序

1. 先迁音乐，改 `source/js/site-config-v3.js`；图集原图由 Chevereto 管理。
2. 再迁文章封面，把 Decap CMS 的封面字段统一填 `https://assets.soloeternity.me/images/posts/...`。
3. 最后迁全站背景和 Live2D 资源；这些资源影响页面观感，迁移后要完整跑一次 `npx hexo generate` 并线上检查首屏。

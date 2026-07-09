# Cloudflare R2 媒体存储规划

## 目标

- Bucket：`soloeternity-assets`
- 自定义域名：`assets.soloeternity.me`
- 用途：图片、音乐、大附件，不把二进制资源塞进 Git 仓库。

## 目录约定

```text
images/
  posts/YYYY/slug/
  gallery/YYYY/
  backgrounds/
  avatars/
  social/
music/
  tracks/
  covers/
downloads/
  docs/
  packages/
live2d/
  models/
memos/
  attachments/YYYY/MM/
```

文章中直接引用：

```md
![示例图](https://assets.soloeternity.me/images/posts/example.jpg)
```

音乐播放器配置在 `source/js/site-config.js`：

```js
music: [
  {
    name: "歌曲名",
    artist: "作者",
    url: "https://assets.soloeternity.me/music/song.mp3",
    cover: "https://assets.soloeternity.me/images/gallery/cover.jpg"
  }
]
```

## rclone 示例

Cloudflare R2 S3 API endpoint 格式：

```text
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

上传示例：

```bash
rclone copy ./images r2:soloeternity-assets/images --progress
rclone copy ./music r2:soloeternity-assets/music --progress
```

v1 不做博客内上传后台；先使用 Cloudflare Dashboard、rclone 或 S3 客户端管理文件。

## 适合迁移到 R2 的文件

优先迁移体积大、变化少、无需参与 Hexo 构建的资源：

- 文章封面和正文大图：`source/_posts/**` 中引用的图片，以及 Decap CMS 的 `index_img`。
- 图集资源：`source/gallery/` 页面展示的图片，目标目录为 `images/gallery/YYYY/`。
- 全站背景和 banner：如首页、归档、分类、标签、页面 banner 等大图，目标目录为 `images/backgrounds/`。
- 音乐播放器文件：`music/tracks/` 放音频，`music/covers/` 放封面。
- 头像、社交二维码和展示图：`images/avatars/`、`images/social/`。
- Live2D 模型贴图：模型体积变大后可迁到 `live2d/models/`，但要同步修改模型 JSON 内的相对资源路径。
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

1. 先迁音乐和图集图片，改 `source/js/site-config.js` 与 `source/gallery/index.md`。
2. 再迁文章封面，把 Decap CMS 的封面字段统一填 `https://assets.soloeternity.me/images/posts/...`。
3. 最后迁全站背景和 Live2D 资源；这些资源影响页面观感，迁移后要完整跑一次 `npx hexo generate` 并线上检查首屏。

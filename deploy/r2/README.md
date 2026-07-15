# Cloudflare R2 媒体存储

Bucket：`soloeternity-assets`。

公开域名：`https://assets.soloeternity.me`。

最后核验：`2026-07-15`。

## 1. 当前实际状态

- 约 `259` 个对象。
- 总体积约 `84.8 MiB`。
- 顶层只有 `images/`、`live2d/`、`music/`。
- 自定义域名可返回文章封面、背景、音乐和模型资源。
- `assets.soloeternity.me` 不指向 Ubuntu 服务器。
- 源站 Caddy 对该域名返回 404，用于发现 DNS 误配。
- 抽检没有确认所有对象稳定命中 Cloudflare 缓存，因此需要单独的 Cache Rule 和响应头验证。

## 2. 目录规范

```text
soloeternity-assets/
├─ images/
│  ├─ avatars/                 # 博主头像、通用人物头像
│  ├─ backgrounds/             # 全站和页面背景
│  ├─ branding/                # logo、品牌图形
│  ├─ link/                    # 友链头像
│  ├─ posts/
│  │  ├─ covers/               # 所有文章封面
│  │  └─ <article-slug>/       # 正文图片
│  └─ social/                  # QQ、社交平台图标或二维码
├─ live2d/
│  └─ models/                  # Live2D 模型镜像备份
└─ music/
   ├─ covers/                  # WebP 封面
   ├─ lyrics/                  # LRC 备份
   └─ tracks/                  # MP3
```

旧目录 `images/avatas/` 不再使用。友链头像本地和 R2 均统一为 `link`。

## 3. 文章资源

### 3.1 封面

统一：

```text
images/posts/covers/<article-slug>.webp
```

公开 URL：

```text
https://assets.soloeternity.me/images/posts/covers/<article-slug>.webp
```

Hexo front matter：

```yaml
index_img: https://assets.soloeternity.me/images/posts/covers/<article-slug>.webp
banner_img: https://assets.soloeternity.me/images/posts/covers/<article-slug>.webp
```

### 3.2 正文图片

```text
images/posts/<article-slug>/01.webp
images/posts/<article-slug>/02.webp
```

```markdown
![说明](https://assets.soloeternity.me/images/posts/<article-slug>/01.webp)
```

### 3.3 四叶花文章示例

只保留 8 张 WebP：

- `images/posts/covers/lv-molly-trademark-dispute.webp`
- `images/posts/lv-molly-trademark-dispute/case-timeline.webp`
- `images/posts/lv-molly-trademark-dispute/confusion-framework.webp`
- `images/posts/lv-molly-trademark-dispute/consumer-perception-path.webp`
- `images/posts/lv-molly-trademark-dispute/baoxianghua-cultural-motif.webp`
- `images/posts/lv-molly-trademark-dispute/private-rights-cultural-commons.webp`
- `images/posts/lv-molly-trademark-dispute/public-opinion-divide.webp`
- `images/posts/lv-molly-trademark-dispute/trademark-compliance-flow.webp`

不上传 8 张 PNG 原稿。PNG 原稿放本地离线归档即可。

## 4. 格式规范

| 类型 | 格式 | 备注 |
| --- | --- | --- |
| 文章封面 | WebP | 质量 78-85，固定比例 |
| 正文照片/插画 | WebP | 保持可读文字，必要时较高质量 |
| 页面背景 | WebP | 桌面和移动端可分版本 |
| 友链头像 | WebP/PNG | 有透明需求才用 PNG |
| Live2D 贴图 | 原模型格式 | 不强制转码，避免破坏 UV/透明度 |
| 音乐封面 | WebP | 正方形 |
| 音频 | MP3 | 不自动播放，不预加载 |
| 歌词 | LRC UTF-8 | 文件名与曲目配置一致 |

包含大量小字的信息图转 WebP 时要人工检查，不能只追求极小体积导致文字模糊。

## 5. 本地镜像

本地 `source/img` 的结构参考 R2 `images`：

```text
source/img/
├─ backgrounds/
├─ link/
├─ posts/
└─ social/
```

本地镜像用途：

- R2 故障时恢复。
- 构建前编辑和转码。
- 小型主题资源的同源 fallback。

不应把所有 R2 大媒体重复放进 Git。需要离线保留的大文件应放在仓库外的备份目录。

## 6. rclone 配置

本机程序：

```text
C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe
```

Cloudflare R2 S3 endpoint：

```text
https://<account-id>.r2.cloudflarestorage.com
```

Bucket 名不要重复写进 endpoint；rclone 目标中再写 bucket。

### 6.1 创建 R2 Token

Cloudflare Dashboard：

1. R2 Object Storage。
2. Manage R2 API Tokens。
3. Create API token。
4. 权限选择目标 bucket 的 Object Read & Write。
5. Scope 只包含 `soloeternity-assets`。
6. 记录 Access Key ID 与 Secret Access Key。

Secret 只显示一次。曾出现在截图或聊天中的凭据必须撤销并重新创建。

### 6.2 配置 remote

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' config
```

选择：

```text
n) New remote
name: r2
Storage: s3
provider: Cloudflare
access_key_id: <new access key>
secret_access_key: <new secret>
endpoint: https://<account-id>.r2.cloudflarestorage.com
region: auto
```

rclone 配置通常位于：

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' config file
```

该文件包含凭据，不得提交 Git。

### 6.3 验证

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' lsd r2:soloeternity-assets
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' size r2:soloeternity-assets
```

## 7. 常用命令

### 列出目录

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' lsf `
  r2:soloeternity-assets/images/posts/covers/
```

### 上传封面

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' copyto `
  '.\cover.webp' `
  'r2:soloeternity-assets/images/posts/covers/article-slug.webp' `
  --progress
```

### 上传正文 WebP

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' copy `
  '.\webp-output' `
  'r2:soloeternity-assets/images/posts/article-slug' `
  --include '*.webp' `
  --progress
```

### 检查差异

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' check `
  '.\webp-output' `
  'r2:soloeternity-assets/images/posts/article-slug' `
  --one-way
```

### 下载备份

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' copy `
  'r2:soloeternity-assets' `
  'D:\Backups\soloeternity-assets' `
  --progress
```

## 8. `copy`、`copyto` 与 `sync`

- `copyto`：一个本地文件到一个明确对象键，最适合封面。
- `copy`：复制目录中的新增/变化文件，不删除远端多余对象。
- `sync`：让目标完全等于源，可能删除远端文件。

日常上传使用 `copy`/`copyto`。只有在明确审查 dry-run 后才使用 `sync`：

```powershell
& 'C:\Program Files\rclone-v1.74.4-windows-amd64\rclone.exe' sync `
  '.\local-dir' `
  'r2:soloeternity-assets/some/exact/prefix' `
  --dry-run
```

确认输出中的删除对象全部合理后，才移除 `--dry-run`。

## 9. 音乐

```text
music/tracks/<slug>.mp3
music/covers/<slug>.webp
music/lyrics/<slug>.lrc
```

曲目配置在 `source/js/site-config-v3.js`。三个文件 slug 必须一致。

音频源文件、无损文件和转码中间文件不提交 Git。歌词在 R2 存备份，站点还保留同源 `/music/lyrics/`，以避免播放器跨域和缓存问题。

## 10. Live2D

R2：

```text
live2d/models/<model-name>/
```

必须保留模型完整相对路径：JSON、moc、贴图、动作、物理文件不能拆散。

站点当前仍优先从同源 `/live2d-models/` 加载运行模型。R2 是备份和未来迁移来源。若改为直接从 R2 加载，需要额外验证：

- CORS
- JSON 内相对路径
- MIME
- Range 请求
- WebGL 纹理加载
- Cloudflare 缓存

## 11. Cloudflare 缓存

建议创建 Cache Rule：

```text
Hostname equals assets.soloeternity.me
```

策略：

- Eligible for cache。
- Edge TTL 30 天或更长。
- Browser TTL 1-7 天。
- 对文件名版本化或内容不变的对象使用更长 TTL。

文章资源若需要原路径覆盖更新，应主动 purge 对象 URL。更稳妥的是改文件名，例如 `cover-v2.webp`。

验证：

```powershell
curl.exe -I 'https://assets.soloeternity.me/images/posts/covers/kali.webp'
curl.exe -I 'https://assets.soloeternity.me/images/posts/covers/kali.webp'
```

关注第二次响应是否出现：

```text
CF-Cache-Status: HIT
Age: ...
```

不能只看到 Cloudflare 响应头就认为对象已命中缓存。

## 12. CORS

公开图片通常可以匿名读取。音频、Live2D JSON、字体等被 JS/WebGL 请求时可能需要 CORS。

推荐只允许：

```text
https://soloeternity.me
```

若资源需要其他可信域名使用，再逐项添加。不要为私有 bucket 开启公共 `*`。

## 13. 不适合放 R2 的内容

- Markdown 真源
- Git 仓库
- `.env`
- R2/GitHub/SMTP 密钥
- Waline、Memos SQLite
- Umami PostgreSQL
- Chevereto MariaDB
- 未脱敏数据库导出
- 需要服务端执行的脚本

R2 是对象存储，不是服务器文件系统或数据库备份的唯一位置。

## 14. 文章发布检查

1. 文件名使用小写英文、数字和连字符。
2. 转 WebP。
3. 上传 cover 到 `images/posts/covers/`。
4. 上传正文图到 `images/posts/<slug>/`。
5. rclone check。
6. curl 验证 HTTP 200 和 MIME。
7. 在 Decap 填写完整 HTTPS URL。
8. 预览首页卡片和正文。
9. 发布后检查移动端和暗色主题。

## 15. 故障排查

### 404

- bucket/key 拼写错误。
- 漏写 `covers`。
- 大小写不一致。
- 自定义域名未绑定到该 bucket。
- Cloudflare 缓存旧 404。

### 403

- 对象或 bucket 不是公开访问。
- 请求打到了 S3 API endpoint，而不是公开自定义域名。
- WAF/Access 阻止。

### MIME 错误

重新上传并设置正确 Content-Type。WebP 应为 `image/webp`，MP3 应为 `audio/mpeg`，LRC 通常为 `text/plain; charset=utf-8`。

### rclone 认证失败

- Access Key/Secret 填反。
- Token 已撤销。
- endpoint 包含了重复 bucket。
- Token scope 不包含目标 bucket。
- 本地 rclone 使用了旧配置文件。

### 首页封面破图

先直接打开 front matter 中的 URL。若直接 URL 失败，就是对象路径问题；若直接 URL 正常，再检查生成 HTML、CSP、混合内容和缓存。

# 博客部署与迁移文档

本文同时记录最初的 GitHub Pages / Vercel / LeanCloud 架构、迁移过程和当前生产架构，供重装、换机、回滚和故障排查使用。

最后核验：`2026-07-15`。

## 1. 结论先行

当前生产方案为：

- Hexo `7.3.0` + Fluid 生成静态站。
- GitHub 仓库 `FLmhp/soloeternity-blog` 保存源码。
- GitHub Actions 在 Node.js `20`、pnpm `9.15.9` 下构建。
- Actions 通过 SSH/rsync 发布 `public/` 到 `/var/www/blog/current`。
- Docker Caddy 直接托管静态文件并反向代理动态服务。
- Waline 使用 Docker + SQLite，自托管在 `waline.soloeternity.me`。
- Memos、Umami、Chevereto、LobeHub、OpenList、SeaweedFS 和 FRPS 同机运行。
- Cloudflare 为公开域名提供 DNS、代理和 TLS 边缘层。
- Cloudflare R2 保存博客媒体，域名为 `assets.soloeternity.me`。
- Decap CMS 使用 Cloudflare Worker 完成 GitHub OAuth，域名为 `cms-auth.soloeternity.me`。

不再使用：

- GitHub Pages 作为主站托管。
- Vercel 作为 Waline 服务端。
- LeanCloud 作为评论数据库或访问统计数据库。
- Nginx 作为当前 `80/443` 入口。

## 2. 架构演进

### 2.1 原始架构

早期链路大致为：

```text
Hexo 源码
  -> 本地或 CI 构建
  -> FLmhp.github.io / GitHub Pages

博客评论组件
  -> Vercel Waline
  -> LeanCloud 数据库
```

这种方案的优点：

- 初始部署简单。
- GitHub Pages 无需维护服务器。
- Vercel 可快速运行 Waline。
- LeanCloud 曾提供较低门槛的数据服务。

长期问题：

- 静态站、评论后端和数据库分散在三个平台。
- 域名、构建、评论和数据库故障需要跨平台排查。
- LeanCloud 对外服务终止计划要求提前迁移。
- Vercel Waline 仓库只承担后端部署，容易与博客源码仓库混淆。
- GitHub Pages 仓库只保存构建产物，不适合作为新的源码真源。

完成迁移并验证历史评论后，旧 `waline-server`、旧 Vercel 项目、旧 LeanCloud 项目和旧 GitHub Pages 发布仓库才可以删除。删除前应保留：

1. LeanCloud 原始导出文件。
2. 导入后的 Waline SQLite 离线备份。
3. 旧仓库最终提交或压缩归档。
4. 一份域名、环境变量和数据表映射说明。

### 2.2 迁移后的职责拆分

| 能力 | 当前承载 |
| --- | --- |
| 博客源码 | GitHub `FLmhp/soloeternity-blog` |
| 静态构建 | GitHub Actions |
| 静态发布 | rsync 到 Ubuntu |
| HTTP/TLS 入口 | Docker Caddy |
| 评论 | Waline 1.41.3 + SQLite |
| 动态/随笔 | Memos + SQLite |
| 图床/相册 | Chevereto + MariaDB |
| 大媒体 | Cloudflare R2 |
| 访问分析 | Umami + PostgreSQL |
| 在线写作 | Decap CMS + GitHub OAuth Worker |
| 对话服务 | LobeHub，`chat.soloeternity.me` |
| 文件服务 | OpenList + SeaweedFS |
| 旧域名穿透 | FRPS + Caddy layer4 |

Hexo 仍然只负责静态内容。需要写数据库的功能放在独立服务中，没有把 Hexo 改造成后端应用。

## 3. 当前仓库构建

### 3.1 核心配置

`_config.yml`：

- `url: https://soloeternity.me`
- `language: zh-CN`
- `timezone: Asia/Shanghai`
- `theme: fluid`
- `post_asset_folder: true`
- `updated_option: empty`

`updated_option: empty` 用于避免每次构建都把文章更新时间刷新成构建时间。项目脚本按 Git 历史判断实际正文修改时间。

`package.json`：

```json
{
  "packageManager": "pnpm@9.15.9",
  "scripts": {
    "build": "npx hexo generate",
    "clean": "npx hexo clean",
    "server": "npx hexo server"
  }
}
```

本地验证：

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm clean
pnpm build
```

构建成功后至少检查：

```text
public/index.html
public/archives/index.html
public/categories/index.html
public/tags/index.html
public/essays/index.html
public/moments/index.html
public/gallery/index.html
public/anime/index.html
public/message/index.html
public/admin/index.html
```

### 3.2 GitHub Actions

工作流位于 `.github/workflows/deploy.yml`。

步骤：

1. `actions/checkout@v6`
2. `pnpm/action-setup@v6`
3. `actions/setup-node@v6`，Node `20`
4. `pnpm install --frozen-lockfile`
5. `pnpm build`
6. `webfactory/ssh-agent@v0.10.0` 导入部署私钥
7. `rsync -az --delete public/ ...:/var/www/blog/current/`
8. 远端规范化权限为目录 `755`、文件 `644`

工作流使用 concurrency，同一分支的新发布会取消旧的未完成发布，避免两次 rsync 竞争。

Secrets：

| 名称 | 内容 |
| --- | --- |
| `SSH_HOST` | `107.151.246.42` 或对应源站地址 |
| `SSH_PORT` | 当前为 `22` |
| `SSH_USER` | 当前为 `root` |
| `SSH_PRIVATE_KEY` | 部署专用私钥 |
| `SSH_KNOWN_HOSTS` | 可选，推荐固定服务器主机指纹 |

生产目前以 root 密钥发布。更严格的做法是创建专用 `deploy` 用户，只授予 `/var/www/blog/current` 写权限；这属于建议改进，并非当前已完成状态。

## 4. 服务器实际状态

### 4.1 操作系统与容量

- Ubuntu `22.04.5 LTS`
- Docker `29.5.3`
- Docker Compose `v5.1.4`
- 系统时区 `Etc/UTC`
- 约 `58 GiB` 磁盘，使用率约 `36%`
- 约 `7.8 GiB` 内存，无 Swap

Hexo 和 Waline 应用内使用 `Asia/Shanghai`，但服务器日志时间通常是 UTC。排查 GitHub Actions、Caddy 和 Docker 日志时，需要将 UTC 加 8 小时再与本地时间对照。

### 4.2 入口服务

生产入口是 `/root/docker/caddy` 中的 Docker Caddy，不是 systemd Caddy，也不是 Nginx。

监听状态：

- `22/tcp`：SSH
- `80/tcp`：HTTP
- `443/tcp`：HTTPS
- `443/udp`：HTTP/3
- `7000/tcp`：FRPS/layer4
- `127.0.0.1:8360`：Waline 宿主机回环映射
- `127.0.0.1:5230`：Memos 宿主机回环映射
- `127.0.0.1:3001`：Umami 宿主机回环映射
- `127.0.0.1:3210`：LobeHub 宿主机回环映射

Nginx 配置保留在仓库作为历史资料，生产服务是 inactive。不要同时启动 Nginx 与 Docker Caddy，否则会争用 `80/443`。

### 4.3 静态目录

```text
/var/www/blog/current
```

核验时约 `53 MiB`、`317` 个文件。线上 `index.html` 的 UTC 修改时间与最近一次成功 Actions 发布一致。

`/var/www/blog/backup-2026070801` 是历史手工备份，不是持续更新的回滚版本。日常回滚优先使用 Git revert 后重新运行 Actions，而不是依赖这个旧目录。

## 5. Caddy 路由与 HTTPS

### 5.1 Caddy 镜像

仓库 `deploy/caddy/Dockerfile` 构建自定义 Caddy，包含：

- Cloudflare DNS provider：用于 DNS-01 自动签发证书。
- layer4：用于 FRP TCP 转发。

源站证书抽检：

- 证书域名：`soloeternity.me`
- 颁发机构：Let's Encrypt `YE1`
- 有效期：`2026-06-17` 至 `2026-09-15`

Caddy会自动续期。服务器仍有历史 `certbot.timer`，但当前 HTTPS 不依赖 Certbot。

### 5.2 主要路由

- `soloeternity.me`：`root * /var/www/blog/current` + `file_server`
- `www.soloeternity.me`：永久重定向到主域名
- `waline.*`：反向代理 `waline:8360`
- `memos.*`：反向代理 `memos:5230`，只允许博客主域跨域读取公共内容
- `gallery.*`：反向代理 `chevereto:8080`，只允许博客主域跨域读取公开相册
- `umami.*`：反向代理 `umami:3000`
- `chat.*`：反向代理 `lobehub:3210`
- `openlist.*`：反向代理 `openlist:5244`
- `s3.*`：反向代理 `seaweedfs-s3:8333`
- `yiharmony.top` 及通配符：保留 FRP 反代
- `:7000`：layer4 转发到 `frps:7000`

`assets.*` 和 `cms-auth.*` 的 Caddy 404 仅用于防止 DNS 误指向源站；两者真实服务分别在 R2 和 Worker。

### 5.3 Cloudflare

已观察到主域及主要服务域名解析到 Cloudflare Anycast 地址，并带 Cloudflare 响应头。推荐保持：

- SSL/TLS：`Full (strict)`
- Always Use HTTPS：启用
- HTTP/3：可启用
- Brotli：可启用
- 主站 HTML：不要设置长期 immutable 缓存
- 带哈希或版本参数的静态资源：可长缓存
- `assets.soloeternity.me/*`：单独配置媒体 Cache Rule

当前抽检结果：

- HTML：`CF-Cache-Status: DYNAMIC`
- 站点 JS：Caddy 提供长期共享缓存头，Cloudflare 首次抽检为 `MISS`
- R2 对象：可正常访问，但抽检未确认稳定 `HIT`

因此不能在文档中笼统声称“所有资源均已 CDN 命中”。要以具体 URL 连续请求后的 `CF-Cache-Status` 为准。

## 6. Waline

### 6.1 运行状态

- 容器：`waline`
- 镜像：`lizheming/waline:1.41.3`
- 服务端包：`@waline/vercel 1.41.3`
- 数据库：`/opt/waline/data/waline.sqlite`
- 评论端点：`https://waline.soloeternity.me`
- 管理后台：`https://waline.soloeternity.me/ui`

核验时数据库中有：

- 用户 `1`
- 评论 `6`
- 计数器表记录 `0`

这些数字只是核验时快照，不应作为以后健康判断的固定期望值。

### 6.2 邮件

`/opt/waline/.env` 已配置 QQ SMTP，使用 `465` 端口和 SSL。仓库不保存授权码。

邮件逻辑：

- 文章评论预设文案：`欢迎大家来评论区灌水喵~`
- 留言板预设文案：`写下此刻的心跳，它便不再只是你的。每一行字，都会在风里找到归宿。`
- 留言板新评论邮件主题：`你的博客网站收到了新的留言`
- 文章新评论邮件应包含具体文章标题或路径

Waline 管理员本人发表评论时可能跳过给自己发通知。测试邮件应退出管理员账号，使用另一个邮箱匿名评论，并同时查看容器日志。

### 6.3 历史数据

LeanCloud 历史用户和评论已导入 SQLite。旧用户密码哈希沿用 LeanCloud 导出的 bcrypt 兼容形式。重置或再次导入前必须先做一致性备份，不要直接覆盖正在运行的数据库。

## 7. Memos 与动态页面

- 容器：`memos`
- 镜像：`neosmemo/memos:stable`
- 数据：`/opt/memos/data`
- 域名：`https://memos.soloeternity.me`

核验时存在 `3` 条 memo、`1` 个用户、数据库内附件记录 `0`。数据文件使用 SQLite WAL 模式，能看到 `memos_prod.db`、`memos_prod.db-wal` 和 `memos_prod.db-shm`。

博客读取策略：

- `/moments/`：筛选公开内容中的 `#moment`
- `/essays/`：筛选公开内容中的 `#essay`
- 优先 Memos v1 API，兼容旧 API 路径
- 支持 Markdown、附件、引用、被引用关系、地点和标签
- 浏览器端清洗 HTML，避免直接注入不可信内容

公共 API 抽检能返回 `3` 条公开内容。Memos 页面空白时，先检查公开可见性、标签、CORS、API 结构和浏览器控制台，而不是先重启服务器。

## 8. Chevereto 与 Gallery

- Chevereto 容器 + MariaDB `11.4`
- 图片目录：`/opt/chevereto/images`
- 数据库目录：`/opt/chevereto/database`
- 域名：`https://gallery.soloeternity.me`
- 核验时公开相册 `1` 个、图片 `21` 张

博客 Gallery 不显示 Chevereto 后台入口，而是读取：

```text
https://gallery.soloeternity.me/explore/albums
```

然后抓取公开相册页中的相册名、简述、标签和图片。该实现依赖公开 HTML 结构，并非稳定 API；每次升级 Chevereto 后必须测试 `/gallery/`。

Chevereto 当前图片存储在本机磁盘，不在 R2。R2 与 Chevereto 是两套不同用途的媒体系统：文章资源走 R2，相册由 Chevereto 管理。

## 9. Umami

- Umami 容器：PostgreSQL 版本镜像
- PostgreSQL：`postgres:16-alpine`
- 宿主机回环：`127.0.0.1:3001`
- 公网：`https://umami.soloeternity.me`
- 数据：`/opt/umami/db`
- `DISABLE_TELEMETRY=1`

核验时数据库中有 `1` 个网站、约 `61` 个会话和 `1314` 个事件。

博客 `_config.fluid.yml` 注入 Umami 脚本并启用性能采集。`source/js/analytics-v2.js` 额外记录：

- 导航、搜索、主题切换
- 一言刷新
- 音乐播放器显示、播放控制和曲目操作
- Live2D 打开
- Anime 筛选和番剧跳转
- 外部链接、下载、友链
- 评论开始、正文复制
- 50%/90% 阅读深度
- 30 秒/120 秒参与时长

Busuanzi 仍用于页脚公开展示总访问量，Umami 用于后台分析。两者职责不同。

## 10. R2

### 10.1 实际对象结构

Bucket：`soloeternity-assets`。

核验时约 `259` 个对象、`84.8 MiB`，顶层只有：

```text
images/
live2d/
music/
```

推荐结构：

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

友链头像统一使用 `images/link/`，不再使用拼写错误的 `avatas`。

文章封面统一：

```text
images/posts/covers/<slug>.webp
```

文章正文图统一：

```text
images/posts/<slug>/<序号或语义名>.webp
```

最近四叶花文章只上传 8 张 WebP：1 张封面和 7 张正文图；不上传 PNG 原稿。

### 10.2 不放入 R2 的数据

- Waline/Memos 数据库
- Umami/Chevereto 数据库
- GitHub OAuth secret
- SMTP 授权码
- `.env`
- Hexo Markdown 真源

## 11. Decap CMS

- 管理页：`https://soloeternity.me/admin/`
- 后端仓库：`FLmhp/soloeternity-blog`
- 分支：`main`
- OAuth：`https://cms-auth.soloeternity.me/auth`
- 工作流：`editorial_workflow`

Decap 保存内容后通过 GitHub 分支/PR 工作流进入仓库，再由 Actions 发布。生产验证中已经有 CMS 创建和合并提交的记录，因此 OAuth 和发布链路当前可用。

分类和标签字段使用列表：

- 多个项目使用英文逗号 `,` 分隔。
- 多级分类按父级到子级依次填写，例如：`法律与社会, 知识产权`。
- 标签没有层级，例如：`LV, 茉莉奶白, 商标侵权`。
- 只输入空格会被视为一个完整字符串，不能作为分隔符。

当前 Decap 媒体目录仍是仓库内 `source/uploads`。文章大图推荐先通过 rclone 上传 R2，再把 HTTPS URL 填入正文和封面字段，避免仓库膨胀。

## 12. 备份与恢复

### 12.1 当前事实

- 没有自动业务备份 cron。
- 没有业务备份 systemd timer。
- Waline 有历史手工备份。
- Memos 使用 WAL，直接复制单个 `.db` 不可靠。
- 静态站可从 GitHub 重新构建，不是最关键备份对象。

### 12.2 建议频率

| 数据 | 频率 | 保留 |
| --- | --- | --- |
| Waline SQLite | 每日 | 30 天 + 每月 12 份 |
| Memos 数据目录 | 每日 | 30 天 + 每月 12 份 |
| Umami PostgreSQL | 每日或每周 | 30 天 |
| Chevereto DB + images | 每日增量、每周全量 | 至少 4 周 |
| Caddy/Compose/.env | 每次改动后加密备份 | 最近 5 版 |
| R2 | 依赖版本控制/异地清单 | 定期导出对象清单 |

至少保留一份服务器之外的备份。恢复演练比“有备份文件”更重要。

### 12.3 静态站回滚

优先方式：

```bash
git revert <bad-commit>
git push origin main
```

Actions 会重新构建并覆盖 `current`。只有 GitHub 不可用时才考虑恢复旧静态目录。

### 12.4 动态服务恢复原则

1. 停止对应应用写入。
2. 备份当前损坏现场。
3. 恢复数据库和附件到新目录。
4. 先执行数据库一致性检查。
5. 启动容器并在回环地址测试。
6. 再通过公网域名测试。
7. 保留恢复记录和备份时间点。

## 13. 安全与密钥

密钥位置：

- GitHub 部署私钥：GitHub Actions Secrets
- Caddy Cloudflare Token：`/root/docker/caddy/.env`
- Waline JWT/SMTP：`/opt/waline/.env`
- Umami DB/App Secret：`/opt/umami/.env` 或 Compose 环境
- Chevereto DB Secret：`/opt/chevereto/.env`
- R2 S3 Key：本机 rclone 配置或安全凭据库
- Decap GitHub OAuth Secret：Cloudflare Worker secret

要求：

- 文件权限 `600`，目录 `700`。
- 不在 Markdown、截图、issue、Actions 日志中粘贴明文。
- 已经公开过的密钥立即撤销并重新生成。
- Worker 使用 secret binding，不在源码常量中写入 Client Secret。
- rclone 配置包含可解密凭据，不能提交到仓库。

## 14. 发布和巡检

### 14.1 每次提交前

```powershell
pnpm install --frozen-lockfile
pnpm clean
pnpm build
git diff --check
```

### 14.2 发布后

```bash
curl -I https://soloeternity.me
curl -I https://waline.soloeternity.me
curl -I https://memos.soloeternity.me
curl -I https://gallery.soloeternity.me/explore/albums
curl -I https://umami.soloeternity.me/script.js
curl -I https://assets.soloeternity.me/images/posts/covers/kali.webp
```

浏览器检查项目见 `docs/usage.md`。

## 15. 故障定位顺序

### 主站 502/空白

1. Cloudflare 是否正常。
2. Caddy 容器是否 Up。
3. `/var/www/blog/current/index.html` 是否存在。
4. Caddy bind mount 是否正确。
5. Actions 最近一次是否成功。

### 评论失败

1. 浏览器请求是否到 `waline.soloeternity.me`。
2. Waline 容器日志。
3. SQLite 权限与完整性。
4. `SECURE_DOMAINS`。
5. Cloudflare/WAF 是否拦截 POST。

### Memos 空白

1. 内容是否 `PUBLIC`。
2. 是否包含 `#moment` 或 `#essay`。
3. 公共 API 是否返回数据。
4. CORS 的 Origin 是否为 `https://soloeternity.me`。
5. `memos-feed-v5.js` 是否被旧缓存覆盖。

### Gallery 空白

1. Chevereto 相册是否公开。
2. `/explore/albums` 是否能匿名打开。
3. CORS 是否正常。
4. Chevereto 升级是否改变 HTML 结构。

### Anime 超时

1. Bangumi API 是否从访客网络可达。
2. 浏览器控制台是否是 CORS、429 或 timeout。
3. sessionStorage 缓存是否损坏。
4. 页面应保留重试入口，不要把外部 API 超时误判成 Caddy 故障。

## 16. 当前待办优先级

1. 建立自动离机备份并做恢复演练。
2. 在云安全组限制端口，评估 Docker 的 `DOCKER-USER` 规则。
3. 为浮动镜像建立版本锁定和升级记录。
4. 为 R2 媒体建立并验证 Cloudflare Cache Rule。
5. 创建最小权限部署用户，替代 root Actions 发布。
6. 评估 Swap 或 zram，降低瞬时内存压力风险。


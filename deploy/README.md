# 生产部署目录说明

本文是 `deploy/` 目录的总入口，记录可复用配置、生产服务器实际状态、部署顺序和运维边界。

最后只读核验时间：`2026-07-15`（文档时间使用 `Asia/Shanghai`；服务器系统时区实际为 `Etc/UTC`）。

> 本目录中的文件是配置模板和操作资料，不包含生产密钥。服务器上的 `.env`、GitHub Secrets、Cloudflare Token、SMTP 授权码、数据库密码不得提交到 Git。

## 1. 当前生产架构

```text
访客
  │
  ├─ Cloudflare 橙云 ── soloeternity.me ──┐
  ├─ Cloudflare 橙云 ── waline.*           │
  ├─ Cloudflare 橙云 ── memos.*            │
  ├─ Cloudflare 橙云 ── gallery.*          ├─> 107.151.246.42:443
  ├─ Cloudflare 橙云 ── umami.*            │      Docker Caddy
  ├─ Cloudflare 橙云 ── chat.*             │
  ├─ Cloudflare 橙云 ── openlist.*         │
  └─ Cloudflare 橙云 ── s3.*               ┘

  ├─ assets.soloeternity.me ── Cloudflare R2 自定义域名
  └─ cms-auth.soloeternity.me ── Cloudflare Worker
```

博客发布链路：

```text
GitHub main
  -> GitHub Actions
  -> pnpm install --frozen-lockfile
  -> Hexo generate
  -> rsync public/
  -> /var/www/blog/current
  -> Caddy file_server
```

动态服务均由 Docker 承载。数据库端口没有暴露到公网，应用端口只监听回环地址或 Docker 内部网络。

## 2. 已核验的服务器基线

| 项目 | 当前值 |
| --- | --- |
| 公网 IP | `107.151.246.42` |
| 操作系统 | Ubuntu `22.04.5 LTS` |
| 内核 | Linux `5.15.0-185` |
| 虚拟化 | KVM / x86_64 |
| 系统时区 | `Etc/UTC` |
| 时间同步 | NTP active |
| 磁盘 | 约 `58 GiB`，已用约 `21 GiB` |
| 内存 | 约 `7.8 GiB`，无 Swap |
| Docker | `29.5.3` |
| Docker Compose | `v5.1.4` |
| SSH | `22/tcp`，root 仅允许密钥登录 |
| HTTP/HTTPS | Docker Caddy 监听 `80/443`，并启用 HTTP/3 的 `443/udp` |
| FRP | Caddy layer4 监听 `7000/tcp` 转发到 FRPS |
| Nginx | systemd 服务 inactive，不参与生产流量 |
| 主机 Caddy 服务 | systemd 服务 inactive；生产 Caddy 在 Docker 中 |
| UFW | inactive |

SSH 有效策略：

- `PermitRootLogin without-password`
- `PubkeyAuthentication yes`
- `PasswordAuthentication no`
- `KbdInteractiveAuthentication no`

当前可公网访问的主要端口只有 `22`、`80`、`443` 和 FRP 使用的 `7000`。UFW 尚未启用，建议优先在云厂商安全组限制入口；Docker 发布端口可能绕过普通 UFW 规则，不能只依赖一条简单的 `ufw enable` 命令。

## 3. 目录与组件清单

### 3.1 仓库目录

| 路径 | 用途 | 生产状态 |
| --- | --- | --- |
| `deploy/caddy/` | Caddy 镜像、Compose、Caddyfile | 当前生产入口 |
| `deploy/waline/` | Waline Compose 与邮件主题脚本 | 当前生产评论服务 |
| `deploy/memos/` | Memos Compose | 当前生产动态服务 |
| `deploy/chevereto/` | Chevereto + MariaDB Compose | 当前生产图床 |
| `deploy/decap-oauth/` | Decap CMS OAuth Worker 文档 | Worker 已上线 |
| `deploy/r2/` | R2 目录约定、rclone 说明和本地歌词/封面 | R2 已上线 |
| `deploy/nginx/` | 旧 Nginx 配置 | 历史资料，不加载 |
| `deploy/server/bootstrap.sh` | 早期 Ubuntu 初始化脚本 | 仅供新机参考，不代表当前最终状态 |

### 3.2 服务器目录

| 路径 | 内容 |
| --- | --- |
| `/var/www/blog/current` | 当前线上静态站，约 `53 MiB`、`317` 个文件 |
| `/root/docker/caddy` | 生产 Caddy Compose、环境变量与配置 |
| `/opt/waline` | Waline Compose、`.env`、SQLite 数据 |
| `/opt/memos` | Memos Compose、SQLite/WAL 数据 |
| `/opt/umami` | Umami 与 PostgreSQL |
| `/opt/chevereto` | Chevereto、MariaDB、上传图片 |
| `/root/docker/lobehub` | `chat.soloeternity.me` 的 LobeHub |
| `/root/docker/openlist` | OpenList |
| `/root/docker/seaweedfs` | SeaweedFS S3/WebDAV |
| `/root/docker/frps` | FRP 服务端 |

不要在服务器上保存 Hexo 源码，也不要在服务器上执行 `hexo generate`。服务器只接收 GitHub Actions 生成后的 `public/`。

## 4. 运行中的容器

| 服务 | 镜像/版本特征 | 对外入口 | 数据位置 |
| --- | --- | --- | --- |
| Caddy | 自构建 `caddy2-custom`，Caddy `2.11.4` | `80/443/7000` | named volumes + `/root/docker/caddy/conf` |
| Waline | `lizheming/waline:1.41.3` | Caddy -> `waline:8360` | `/opt/waline/data` |
| Memos | `neosmemo/memos:stable` | Caddy -> `memos:5230` | `/opt/memos/data` |
| Umami | `umamisoftware/umami:postgresql-latest` | Caddy -> `umami:3000` | PostgreSQL volume `/opt/umami/db` |
| Chevereto | `ghcr.io/chevereto/chevereto:latest` | Caddy -> `chevereto:8080` | `/opt/chevereto/images` + MariaDB |
| LobeHub | `lobehub/lobe-chat:latest` | Caddy -> `lobehub:3210` | Docker volumes |
| OpenList | `openlistteam/openlist:latest-aio` | Caddy -> `openlist:5244` | Docker volumes |
| SeaweedFS | `chrislusf/seaweedfs:latest` | S3/OpenList 内部链路 | Docker volumes |
| FRPS | `snowdreamtech/frps:0.69.1` | `7000/tcp` | `/root/docker/frps` |

Waline 已固定到 `1.41.3`；其余多个服务仍使用 `latest` 或 `stable` 浮动标签。升级前必须先备份数据库和文件，再执行 `docker compose pull`，不能将 `pull && up -d` 作为无条件日常命令。

## 5. 域名与真实路由

| 域名 | 目标 | 当前预期结果 |
| --- | --- | --- |
| `soloeternity.me` | Caddy 静态站 | `200` |
| `www.soloeternity.me` | Caddy 永久重定向 | 最终到主域名 |
| `waline.soloeternity.me` | Waline | `200`，`x-waline-version: 1.41.3` |
| `memos.soloeternity.me` | Memos | `200` |
| `gallery.soloeternity.me` | Chevereto | `200` |
| `umami.soloeternity.me` | Umami | `200` |
| `chat.soloeternity.me` | LobeHub | `200` |
| `openlist.soloeternity.me` | OpenList | `200` |
| `s3.soloeternity.me` | SeaweedFS S3 | 未认证请求 `403` 属正常 |
| `assets.soloeternity.me` | Cloudflare R2 | 媒体对象 `200` |
| `cms-auth.soloeternity.me` | Cloudflare Worker | 根路径 `200`；无参数访问 `/auth` 返回 `400` 属正常 |

`assets` 和 `cms-auth` 在 Caddyfile 中保留 `404` 防误配占位。正常 DNS 请求不会到达这两个源站路由。

`yiharmony.top` 及其通配符路由仍由 Caddy 转发到 FRPS，属于必须保留的现有业务，修改 Caddyfile 时不得删除。

## 6. GitHub Actions 发布

工作流：`.github/workflows/deploy.yml`。

触发条件：

- `push` 到 `main`
- 手工 `workflow_dispatch`

构建环境：

- Node.js `20`
- pnpm `9.15.9`
- `pnpm install --frozen-lockfile`
- `pnpm build`，最终执行 `npx hexo generate`

发布命令使用 `rsync -az --delete`，目标为：

```text
/var/www/blog/current/
```

`--delete` 会删除源站中已经不在新 `public/` 里的旧页面，避免失效页面残留。远端只规范化目录 `755`、文件 `644`，不重启 Caddy。

仓库必须配置以下 GitHub Actions Secrets：

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- 可选 `SSH_KNOWN_HOSTS`

最近一次核验到的成功运行：Actions run `29388820274`，对应提交 `ec3576d`。当时线上 `index.html` 修改时间与工作流完成时间一致。连续检查的最近四次发布均成功。

## 7. 新服务器部署顺序

下面是灾备或换机时的推荐顺序，不表示每一步都需要在当前服务器重做。

1. 安装 Docker Engine、Compose、rsync、Git、curl 和基础诊断工具。
2. 配置 SSH 公钥登录，确认新会话可用后关闭密码登录。
3. 创建 `/var/www/blog/current`，让发布用户可写、Caddy 可读。
4. 部署 Caddy，自定义镜像必须包含 Cloudflare DNS 和 layer4 模块。
5. 恢复 `/opt/waline` 并校验 SQLite。
6. 恢复 `/opt/memos`，注意 SQLite WAL 一致性。
7. 恢复 Umami PostgreSQL。
8. 恢复 Chevereto MariaDB 和图片目录。
9. 恢复 LobeHub、OpenList、SeaweedFS 和 FRPS。
10. 更新 DNS 源站 IP，保持 `assets` 绑定 R2、`cms-auth` 绑定 Worker。
11. 运行一次 GitHub Actions，把静态站同步到新机。
12. 验证域名、证书、CORS、评论、动态、相册、统计和管理后台。

早期 `deploy/server/bootstrap.sh` 会安装 Nginx 和 Certbot。它可用于安装基础包，但不应直接视为当前最终配置；迁移到 Caddy 后必须确保 Nginx 不再占用 `80/443`。

## 8. 日常运维命令

### 8.1 Caddy

```bash
cd /root/docker/caddy
docker compose ps
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec caddy caddy fmt --diff /etc/caddy/Caddyfile
docker compose logs --tail=200 caddy
```

修改后：

```bash
cd /root/docker/caddy
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

生产配置当前可以通过校验，但 `caddy fmt --diff` 会提示格式差异。格式化前先备份，并确认不会改变 matcher 语义。

### 8.2 应用容器

```bash
cd /opt/waline && docker compose ps
cd /opt/memos && docker compose ps
cd /opt/umami && docker compose ps
cd /opt/chevereto && docker compose ps
```

日志：

```bash
docker logs --tail=200 waline
docker logs --tail=200 memos
docker logs --tail=200 umami
docker logs --tail=200 chevereto
```

### 8.3 静态站

```bash
find /var/www/blog/current -type f | wc -l
du -sh /var/www/blog/current
stat /var/www/blog/current/index.html
```

## 9. 备份现状与必须补齐的事项

本次核验没有发现 root crontab，也没有发现针对 Waline、Memos、Umami、Chevereto 的业务备份 systemd timer。服务器上存在少量历史手工备份，但不能视为可靠备份体系。

### 9.1 Waline SQLite

在线一致性备份可使用 Python SQLite backup API：

```bash
install -d -m 700 /var/backups/soloeternity/waline
python3 - <<'PY'
import datetime
import sqlite3
from pathlib import Path

src = Path('/opt/waline/data/waline.sqlite')
dst = Path('/var/backups/soloeternity/waline') / (
    'waline-' + datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '.sqlite'
)
with sqlite3.connect(src) as source, sqlite3.connect(dst) as target:
    source.backup(target)
print(dst)
PY
```

校验：

```bash
sqlite3 /var/backups/soloeternity/waline/waline-*.sqlite 'PRAGMA integrity_check;'
```

### 9.2 Memos SQLite/WAL

Memos 当前启用了 WAL。不能只复制体积很小的 `memos_prod.db` 而忽略 `-wal` 文件。最稳妥的方法是短暂停机后打包整个数据目录：

```bash
install -d -m 700 /var/backups/soloeternity/memos
cd /opt/memos
docker compose stop memos
tar -C /opt/memos -czf \
  "/var/backups/soloeternity/memos/memos-$(date -u +%Y%m%dT%H%M%SZ).tar.gz" data
docker compose start memos
```

### 9.3 Umami PostgreSQL

```bash
install -d -m 700 /var/backups/soloeternity/umami
docker exec umami-db pg_dump -U umami -d umami -Fc \
  > "/var/backups/soloeternity/umami/umami-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

### 9.4 Chevereto

数据库和图片必须成对备份：

```bash
install -d -m 700 /var/backups/soloeternity/chevereto
docker exec chevereto-db sh -lc \
  'mariadb-dump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > "/var/backups/soloeternity/chevereto/database-$(date -u +%Y%m%dT%H%M%SZ).sql"
tar -C /opt/chevereto -czf \
  "/var/backups/soloeternity/chevereto/images-$(date -u +%Y%m%dT%H%M%SZ).tar.gz" images
```

备份必须再同步到服务器之外。只放在同一块系统盘上不能抵御磁盘故障或误删。

## 10. 安全边界

- Cloudflare SSL/TLS 使用 `Full (strict)`；源站证书由 Caddy DNS-01 自动管理。
- 服务器直接证书核验时，主域名证书有效期为 `2026-06-17` 至 `2026-09-15`；无需手工依赖 Certbot 续期。
- 系统仍残留 `certbot.timer`，但生产 HTTPS 不依赖它。
- `/root/docker/caddy/.env`、`/opt/*/.env` 权限应为 `600`。
- `/opt/waline` 中存在多个历史 `.env.bak`。确认不再需要后应安全删除，至少不能保持宽松权限。
- 任何已经在聊天、截图或日志中暴露过的 OAuth、R2、SMTP、GitHub 密钥都应在对应平台轮换。
- 数据库端口不得发布到 `0.0.0.0`。
- `chat.soloeternity.me` 是现有 LobeHub，不能改去 Worker、R2 或其他服务。
- 修改 Caddyfile 时保留 `yiharmony.top` 与 FRP 路由。

## 11. 发布后检查清单

```bash
curl -I https://soloeternity.me
curl -I https://waline.soloeternity.me
curl -I https://memos.soloeternity.me
curl -I https://gallery.soloeternity.me/explore/albums
curl -I https://umami.soloeternity.me/script.js
curl -I https://chat.soloeternity.me
curl -I https://assets.soloeternity.me/images/posts/covers/kali.webp
```

还要在浏览器中检查：

1. 首页、文章、归档、分类和标签页。
2. Essays、Moments 能读取 Memos，并正确渲染 Markdown、附件、引用和地点。
3. Gallery 能读取 Chevereto 公开相册。
4. Anime 能读取 Bangumi；外部 API 超时时页面应显示可恢复错误，而不是破坏整页。
5. Waline 文章评论与留言板文案、邮件主题正确区分。
6. Decap CMS 可登录、保存草稿、创建 PR 并触发发布。
7. Umami 收到浏览、性能和自定义事件。
8. 音乐播放器、Live2D、移动端导航和主题切换正常。

## 12. 当前已知风险

- 没有自动化离机备份，这是最高优先级运维缺口。
- UFW 未启用，应通过云安全组或明确的 Docker 防火墙策略限制端口。
- 服务器无 Swap，内存突增时没有缓冲；当前内存充足，但应监控数据库和图片处理任务。
- 多个容器使用浮动镜像标签，升级存在不可重复风险。
- Gallery 通过 Chevereto 公开 HTML 提取相册，不是稳定 API；Chevereto 升级后必须回归测试。
- Anime 依赖 Bangumi 公共 API，服务器核验时出现过一次外部超时。
- R2 对象已通过自定义域名访问，但抽检响应未显示全局缓存命中；应在 Cloudflare Cache Rules 中单独配置媒体缓存并验证 `CF-Cache-Status`。

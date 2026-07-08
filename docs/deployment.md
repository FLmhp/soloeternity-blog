# 部署文档

## 1. 文档范围

本文档同时记录两套部署方式：

- 原始方案：`GitHub Pages + LeanCloud + Vercel`
- 当前方案：`GitHub Actions + Ubuntu + Caddy + Docker Waline/Memos/LobeHub + SQLite`

第一套方案保留为历史参考，不建议继续用于生产。当前实际运行以第二套方案为准。

## 1.1 当前真实状态（2026-07-08）

以下信息已经按线上和服务器实际情况核验过：

### 站点访问状态

- `https://soloeternity.me` 返回 `HTTP/1.1 200 OK`
- `https://waline.soloeternity.me` 返回 `HTTP/1.1 200 OK`
- `https://waline.soloeternity.me/ui` 返回 `HTTP/1.1 200 OK`

### 当前响应特征

- 主站响应头显示 `Server: Caddy`
- Waline 响应头显示 `X-Powered-By: thinkjs-4.0.0`
- Waline 响应头显示 `x-waline-version: 1.40.3`
- 本次核验时没有观测到 `cloudflare` 响应头

### 服务器运行状态

- 操作系统：`Ubuntu 22.04.5 LTS`
- Python：`3.10.12`
- Caddy：Docker 容器 `caddy`
- `caddy` 容器状态：`Up`
- `nginx` 服务状态：`inactive` 且 `disabled`
- `docker` 服务状态：`active`
- Waline 容器状态：`Up`

### 当前部署产物状态

- 线上首页文件：`/var/www/blog/current/index.html`
- 该文件最近修改时间：`2026-06-08 18:07:03`（由服务器文件时间换算）
- 当前线上主站响应头 `Last-Modified` 为 `Mon, 08 Jun 2026 10:07:03 GMT`

### 当前 Waline 数据状态

- `wl_Users = 1`
- `wl_Comment = 3`
- `wl_Counter = 0`
- 当前管理员：`FLmhp / 2122283196@qq.com / administrator`

### 当前 Waline 邮件通知状态

- 已配置 SMTP 主机：`smtp.qq.com`
- 已配置 SMTP 端口：`465`
- 当前发信账号：`fl-mhp@qq.com`
- 当前发件人名称：`SoloEternity`
- 当前站长通知邮箱：`fl-mhp@qq.com`

### 当前证书状态

- `soloeternity.me` 证书到期时间：`2026-09-06 01:54:37 GMT`
- `waline.soloeternity.me` 证书到期时间：`2026-09-06 02:57:40 GMT`

### 当前自动部署状态

- 仓库：`FLmhp/soloeternity-blog`
- 最近一次成功部署 run：`27130282506`
- 对应提交：`de815e9055f31fe32adf3b49f2d3369ee6a37de9`
- 工作流完成时间：`2026-06-08T10:07:18Z`

---

## 2. 仓库结构

当前仓库和部署相关的关键文件如下：

```text
.
├─ _config.yml                         # Hexo 主配置
├─ _config.fluid.yml                   # Fluid 主题配置
├─ .github/workflows/deploy.yml        # GitHub Actions 自动部署
├─ deploy/
│  ├─ README.md                        # Ubuntu / Waline 部署模板说明
│  ├─ caddy/
│  │  ├─ Caddyfile                     # 当前生产边缘入口配置
│  │  ├─ Dockerfile                    # 带 Cloudflare DNS 与 layer4 插件的 Caddy
│  │  └─ docker-compose.yml            # Caddy Compose
│  ├─ nginx/                           # 历史配置，仅作回滚参考
│  ├─ server/bootstrap.sh              # Ubuntu 初始化脚本
│  └─ waline/
│     ├─ docker-compose.yml            # Waline Compose
│     └─ .env.example                  # Waline 环境变量示例
└─ tools/import_waline_leancloud.py    # LeanCloud 历史数据导入脚本
```

---

## 3. 原始部署方案：GitHub Pages + LeanCloud + Vercel

### 3.1 架构说明

原始链路的职责拆分一般如下：

```text
本地 Hexo 源码
  ├─ hexo generate
  ├─ hexo deploy
  ▼
GitHub Pages / FLmhp.github.io
  └─ 托管 Hexo 生成后的静态页面

Waline 前端
  ▼
Vercel waline-server
  ▼
LeanCloud
  ├─ Users
  ├─ Comment
  └─ Counter
```

这套方案的优点是初期门槛低，缺点也很明确：

- 博客发布依赖 `hexo deploy`，部署产物和源码通常分离
- 评论服务与主站分散在不同平台
- LeanCloud 是评论和统计的外部依赖
- Waline 后端、数据库、静态站三者分散，排障链路较长

### 3.2 原始 Hexo 静态发布思路

历史上常见的 `GitHub Pages` 发布方式是：

```yaml
deploy:
  type: git
  repo: git@github.com:FLmhp/FLmhp.github.io.git
  branch: main
```

对应发布命令通常是：

```bash
npx hexo clean
npx hexo generate
npx hexo deploy
```

如果使用 `FLmhp.github.io` 作为 Pages 仓库，通常会把 `public/` 中的生成文件直接推送到该仓库。

### 3.3 原始 Waline / Vercel / LeanCloud 思路

原始评论系统通常是：

- 前端评论组件挂在博客文章页
- `serverURL` 指向一个 `Vercel` 上的 Waline 服务
- Waline 服务再连接 `LeanCloud`

典型环境变量示例：

```env
LEAN_ID=your-leancloud-app-id
LEAN_KEY=your-leancloud-app-key
LEAN_MASTER_KEY=your-leancloud-master-key
LEAN_SERVER=https://xxx.avoscloud.com
JWT_TOKEN=your-random-token
SITE_NAME=FLmhp's Blog
SITE_URL=https://flmhp.github.io
```

Vercel 的作用是跑 Waline 服务端，LeanCloud 的作用是保存：

- 用户表 `Users`
- 评论表 `Comment`
- 计数表 `Counter`

### 3.4 为什么迁移

迁移原因主要有三类：

1. 站点、评论、数据库分散在多个平台，维护成本高。
2. 评论和统计依赖 LeanCloud，存在外部平台约束。
3. GitHub Pages 适合纯静态托管，但不适合把评论系统、运维和证书管理统一收口。

---

## 4. 当前部署方案：GitHub Actions + Ubuntu + Caddy + Docker Waline

### 4.1 架构说明

当前生产架构如下：

```text
GitHub 源码仓库 (main)
  ▼
GitHub Actions
  ├─ pnpm install --frozen-lockfile
  ├─ pnpm build
  └─ rsync public/ 到服务器
      ▼
Ubuntu Server
  ├─ Caddy                           # 80/443/7000 公共入口
  ├─ /var/www/blog/current           # Hexo 静态文件
  ├─ /opt/waline/docker-compose.yml  # Waline 容器编排
  ├─ /opt/memos/docker-compose.yml   # Memos 容器编排
  └─ /opt/waline/data/waline.sqlite  # Waline SQLite 数据
```

域名划分：

- 博客主站：`https://soloeternity.me`
- 评论服务：`https://waline.soloeternity.me`

### 4.2 当前发布流程

当前仓库的 `package.json` 使用以下脚本：

```json
{
  "scripts": {
    "build": "npx hexo generate",
    "clean": "npx hexo clean",
    "server": "npx hexo server"
  }
}
```

GitHub Actions 工作流位于 `.github/workflows/deploy.yml`，核心流程如下：

```yaml
- uses: actions/checkout@v6
- uses: pnpm/action-setup@v6
- uses: actions/setup-node@v6
- run: pnpm install --frozen-lockfile
- run: pnpm build
- uses: webfactory/ssh-agent@v0.10.0
- run: rsync -az --delete public/ "${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/"
```

也就是说，服务器不参与 Hexo 构建，只负责接收构建产物。

补充说明：

- 当前自动部署链路是通的，但线上静态内容自 `2026-06-08` 后没有新的成功发布记录
- 如果你修改了文章或页面但线上没变化，优先检查是否只是最近没有新的 `main` 分支推送

---

## 5. 服务器初始化

### 5.1 初始化命令

当前仓库已提供 `deploy/server/bootstrap.sh`，建议直接执行：

```bash
scp deploy/server/bootstrap.sh root@your-server:/tmp/bootstrap.sh
ssh root@your-server 'bash /tmp/bootstrap.sh'
```

脚本会安装：

- `nginx`
- `certbot`
- `python3-certbot-nginx`
- `rsync`
- `docker-ce`
- `docker-compose-plugin`

并创建目录：

```bash
/var/www/blog/current
/opt/waline
/opt/waline/data
```

### 5.2 DNS 规划

需要先准备两条记录：

```text
soloeternity.me          -> 服务器公网 IP
waline.soloeternity.me   -> 服务器公网 IP
```

如果接入 Cloudflare：

- 主站和 Waline 都可以走橙云代理
- SSL 模式建议使用 `Full (strict)`

本次核验中，本地直接请求没有出现 `cloudflare` 响应头，因此文档应按“源站可直连”理解当前现状，而不是默认认为 Cloudflare 代理正在生效。

---

## 6. Caddy 与 HTTPS（当前生产）

当前生产环境已经从 Nginx 整体迁回 Caddy。Caddy 占用 `80/tcp`、`443/tcp`、`443/udp`、`7000/tcp`，Nginx 保留安装但处于 `inactive/disabled`。

配置文件：

- `deploy/caddy/Caddyfile`
- `deploy/caddy/docker-compose.yml`
- `deploy/caddy/Dockerfile`
- `deploy/caddy/.env.example`

服务器路径：

- `/root/docker/caddy/conf/Caddyfile`
- `/root/docker/caddy/docker-compose.yml`
- `/root/docker/caddy/Dockerfile`
- `/root/docker/caddy/.env`

更新 Caddy：

```bash
scp deploy/caddy/Caddyfile root@107.151.246.42:/tmp/Caddyfile
scp deploy/caddy/docker-compose.yml root@107.151.246.42:/tmp/docker-compose.yml
scp deploy/caddy/Dockerfile root@107.151.246.42:/tmp/Dockerfile
ssh root@107.151.246.42 <<'EOF'
cp /tmp/Caddyfile /root/docker/caddy/conf/Caddyfile
cp /tmp/docker-compose.yml /root/docker/caddy/docker-compose.yml
cp /tmp/Dockerfile /root/docker/caddy/Dockerfile
systemctl stop nginx || true
systemctl disable nginx || true
cd /root/docker/caddy
docker compose run --rm --no-deps --entrypoint caddy caddy2 validate --config /etc/caddy/Caddyfile
docker compose up -d --build
docker ps --filter name=caddy
EOF
```

当前 FRP 只用于 `yiharmony.top` 和 `*.yiharmony.top` 的后端转发，以及 `7000/tcp` 的 layer4 转发；`soloeternity.me`、Waline、Memos、LobeHub 均由 Caddy 直接反代到 Docker 网络内服务。

旧 Nginx 配置保留在下方，仅作为历史方案和紧急回滚参考，不再是当前生产入口。

## 6.1 Nginx 与 HTTPS（历史/回滚参考）

### 6.1 博客站点配置

文件：`deploy/nginx/soloeternity.me.conf`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name soloeternity.me;

    root /var/www/blog/current;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }
}
```

### 6.2 Waline 反向代理配置

文件：`deploy/nginx/waline.soloeternity.me.conf`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name waline.soloeternity.me;

    client_max_body_size 16m;

    location / {
        proxy_pass http://127.0.0.1:8360;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 启用配置与签发证书

```bash
scp deploy/nginx/*.conf root@your-server:/tmp/
ssh root@your-server <<'EOF'
cp /tmp/soloeternity.me.conf /etc/nginx/sites-available/soloeternity.me.conf
cp /tmp/waline.soloeternity.me.conf /etc/nginx/sites-available/waline.soloeternity.me.conf
ln -sf /etc/nginx/sites-available/soloeternity.me.conf /etc/nginx/sites-enabled/soloeternity.me.conf
ln -sf /etc/nginx/sites-available/waline.soloeternity.me.conf /etc/nginx/sites-enabled/waline.soloeternity.me.conf
nginx -t
systemctl reload nginx
certbot --nginx -d soloeternity.me -d waline.soloeternity.me
certbot renew --dry-run
EOF
```

---

## 7. Waline 部署

### 7.1 Docker Compose

文件：`deploy/waline/docker-compose.yml`

```yaml
services:
  waline:
    container_name: waline
    image: lizheming/waline:latest
    restart: always
    ports:
      - "127.0.0.1:8360:8360"
    env_file:
      - .env
    volumes:
      - /opt/waline/data:/app/data
```

### 7.2 首次部署命令

```bash
scp deploy/waline/docker-compose.yml root@your-server:/tmp/docker-compose.yml
scp deploy/waline/.env.example root@your-server:/tmp/waline.env

ssh root@your-server <<'EOF'
mkdir -p /opt/waline /opt/waline/data
curl -L https://raw.githubusercontent.com/walinejs/waline/main/assets/waline.sqlite -o /opt/waline/data/waline.sqlite
cp /tmp/docker-compose.yml /opt/waline/docker-compose.yml
cp /tmp/waline.env /opt/waline/.env
cd /opt/waline
docker compose up -d
EOF
```

### 7.3 核心环境变量

```env
TZ=Asia/Shanghai
SQLITE_PATH=/app/data
JWT_TOKEN=replace-with-a-long-random-string
SITE_NAME=FLmhp's Blog
SITE_URL=https://soloeternity.me
SERVER_URL=https://waline.soloeternity.me
SECURE_DOMAINS=soloeternity.me,waline.soloeternity.me
AUTHOR_EMAIL=your-email@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password-or-app-password
SMTP_SECURE=true
SENDER_NAME=SoloEternity
SENDER_EMAIL=your-email@example.com
```

注意：

- SQLite 不能从空文件自动建表，必须先下载官方模板库
- `SECURE_DOMAINS` 要同时包含主站域名和 Waline 子域名
- 如需中文邮件模板，建议以 `UTF-8` 编码编辑 `.env`

当前线上核验到的 SMTP 配置特征为：

- `SMTP_HOST=smtp.qq.com`
- `SMTP_PORT=465`
- `SMTP_USER=fl-mhp@qq.com`
- `SENDER_NAME=SoloEternity`
- 授权码未写入文档，继续只保留在服务器 `.env`

### 7.4 管理后台

初始化完成后：

```text
https://waline.soloeternity.me/ui
```

常用运维命令：

```bash
cd /opt/waline
docker compose ps
docker compose logs -f waline
docker compose restart waline
```

---

## 8. GitHub Actions 自动部署

### 8.1 需要配置的 Secrets

仓库 `Settings -> Secrets and variables -> Actions` 中至少需要：

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `SSH_KNOWN_HOSTS`（可选）

### 8.2 触发条件

工作流当前只在以下条件触发：

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

### 8.3 实际部署命令

本质上等价于：

```bash
pnpm install --frozen-lockfile
pnpm build
rsync -az --delete public/ root@server:/var/www/blog/current/
```

### 8.4 发布校验

推送后建议至少检查：

```bash
curl -I https://soloeternity.me
curl -I https://waline.soloeternity.me
```

如果你还想核对是否真的是最新静态文件，可再检查：

```bash
ssh root@your-server "stat -c '%y %n' /var/www/blog/current/index.html"
```

如果要从 GitHub CLI 检查工作流：

```bash
gh run list -R FLmhp/soloeternity-blog --workflow deploy.yml
gh run view <run-id> -R FLmhp/soloeternity-blog
```

---

## 9. LeanCloud 历史数据导入

### 9.1 导入脚本

当前仓库已提供：

```text
tools/import_waline_leancloud.py
```

该脚本会读取：

- `Users.0.jsonl`
- `Comment.0.jsonl`

然后写入：

- `wl_Users`
- `wl_Comment`

### 9.2 导入命令

```bash
python tools/import_waline_leancloud.py \
  --export-dir /path/to/leancloud-export \
  --db /opt/waline/data/waline.sqlite
```

### 9.3 重置为历史数据

如果要把 Waline 重置为 LeanCloud 历史导出状态，建议按下面顺序操作：

```bash
cp /opt/waline/data/waline.sqlite /opt/waline/data/waline.pre-reset-$(date +%Y%m%d%H%M%S).sqlite
curl -L https://raw.githubusercontent.com/walinejs/waline/main/assets/waline.sqlite -o /opt/waline/data/waline.sqlite
python tools/import_waline_leancloud.py \
  --export-dir /path/to/leancloud-export \
  --db /opt/waline/data/waline.sqlite
cd /opt/waline
docker compose up -d waline
```

### 9.4 导入后校验

```bash
python - <<'PY'
import sqlite3
conn = sqlite3.connect('/opt/waline/data/waline.sqlite')
cur = conn.cursor()
print('users', cur.execute('SELECT COUNT(*) FROM wl_Users').fetchone()[0])
print('comments', cur.execute('SELECT COUNT(*) FROM wl_Comment').fetchone()[0])
print('counters', cur.execute('SELECT COUNT(*) FROM wl_Counter').fetchone()[0])
PY
```

说明：

- 当前导出脚本不会自动恢复 `wl_Counter` 历史统计
- 页面 PV/UV 会从新的站点运行状态重新累计

---

## 10. 常见问题

### 10.1 `SQLITE_ERROR: no such table`

原因：`waline.sqlite` 是空文件或初始化方式错误。  
处理：

```bash
curl -L https://raw.githubusercontent.com/walinejs/waline/main/assets/waline.sqlite -o /opt/waline/data/waline.sqlite
docker compose up -d waline
```

### 10.2 GitHub Actions 绿了但页面没更新

先确认：

```bash
ssh root@your-server "ls -la /var/www/blog/current"
```

再检查是否有 CDN 缓存：

- Cloudflare 可先执行 `Purge Cache`
- 浏览器强制刷新 `Ctrl + F5`

如果本次核验和你看到的现象一致，还应检查一件更直接的事：

- 最近一次成功部署是否已经是很久之前的旧 run
- 当前仓库是否根本还没有新的 `main` 分支推送

### 10.3 Waline 邮件模板中文乱码

建议：

- 使用 `UTF-8` 保存 `.env`
- 尽量用支持 UTF-8 的编辑器远程修改
- 修改后执行：

```bash
cd /opt/waline
docker compose up -d waline
```

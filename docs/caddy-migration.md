# Caddy 边缘入口迁移手册

本文记录 `2026-07-08` 将服务器 `80/443` 从 Nginx 整体迁回 Caddy 后的真实状态、维护命令和后续人工流程。

## 当前状态

- 主入口：Caddy 容器，容器名 `caddy`。
- 端口归属：`80/tcp`、`443/tcp`、`443/udp`、`7000/tcp` 均由 Docker/Caddy 占用。
- Nginx 状态：`inactive` 且 `disabled`，保留安装仅用于回滚。
- Caddy 重启策略：`unless-stopped`。
- Caddy HTTPS：通过 Cloudflare DNS-01 自动签发证书，依赖 `/root/docker/caddy/.env` 中的 `CF_API_TOKEN`。
- FRP 状态：`soloeternity.me` 体系的主站、Waline、Memos、LobeHub 不经过 FRP；`yiharmony.top` 和 `*.yiharmony.top` 反代到 `frps:8080`，`7000/tcp` 通过 Caddy layer4 转发到 `frps:7000`。

## 线上路由

| 域名 | Caddy 行为 | 后端 |
| --- | --- | --- |
| `soloeternity.me` | 静态文件服务 | `/var/www/blog/current` |
| `www.soloeternity.me` | 301 跳转 | `https://soloeternity.me{uri}` |
| `waline.soloeternity.me` | HTTPS 反向代理 | `waline:8360` |
| `memos.soloeternity.me` | HTTPS 反向代理 | `memos:5230` |
| `chat.soloeternity.me` | HTTPS 反向代理 | `lobehub:3210` |
| `openlist.soloeternity.me` | HTTPS 反向代理 | `openlist:5244` |
| `s3.soloeternity.me` | HTTPS 反向代理 | `seaweedfs-s3:8333` |
| `assets.soloeternity.me` | 占位 404 | 应绑定 Cloudflare R2，不应走服务器 |
| `cms-auth.soloeternity.me` | 占位 404 | 预留给 Decap CMS OAuth |
| `www.yiharmony.top` | HTTPS 反向代理 | `frps:8080` |
| `*.yiharmony.top` | HTTPS 反向代理 | `frps:8080` |

## 关键文件

服务器文件：

- `/root/docker/caddy/docker-compose.yml`
- `/root/docker/caddy/conf/Caddyfile`
- `/root/docker/caddy/Dockerfile`
- `/root/docker/caddy/.env`

服务器备份：

- `/root/docker/caddy/docker-compose.yml.bak-20260708-nginx-to-caddy`
- `/root/docker/caddy/conf/Caddyfile.bak-20260708-nginx-to-caddy`

仓库模板：

- `deploy/caddy/docker-compose.yml`
- `deploy/caddy/Caddyfile`
- `deploy/caddy/Dockerfile`
- `deploy/caddy/.env.example`

## 日常维护命令

登录服务器：

```bash
ssh soloeternity-root
```

检查端口和服务：

```bash
docker ps --filter name=caddy
systemctl is-active nginx || true
systemctl is-enabled nginx || true
ss -ltnp | grep -E ':(80|443|7000)\s'
```

验证 Caddy 配置：

```bash
cd /root/docker/caddy
docker compose run --rm --no-deps --entrypoint caddy caddy2 validate --config /etc/caddy/Caddyfile
```

应用 Caddy 配置：

```bash
cd /root/docker/caddy
docker compose up -d --build
docker logs --tail 100 caddy
```

外部验证：

```bash
curl -I https://soloeternity.me/
curl -I https://waline.soloeternity.me/
curl -I https://memos.soloeternity.me/
curl -I https://chat.soloeternity.me/
```

Windows 如果遇到证书吊销检查离线，可临时使用：

```powershell
curl.exe --ssl-no-revoke -I https://soloeternity.me/
```

## 禁止事项

- 不要在 Caddy 运行时启动 Nginx，否则 `80/443` 会冲突。
- 不要删除 `/root/docker/caddy/.env`，否则 Cloudflare DNS-01 证书签发会失败。
- 不要让 `assets.soloeternity.me` 长期走服务器，媒体资源应绑定 Cloudflare R2。
- 不要把 `CF_API_TOKEN`、SMTP 授权码、GitHub 私钥提交到仓库。

## 回滚到 Nginx

仅当 Caddy 无法恢复时再执行：

```bash
cd /root/docker/caddy
docker compose down
cp docker-compose.yml.bak-20260708-nginx-to-caddy docker-compose.yml
cp conf/Caddyfile.bak-20260708-nginx-to-caddy conf/Caddyfile
systemctl enable --now nginx
systemctl status nginx --no-pager
```

回滚后立即验证：

```bash
ss -ltnp | grep -E ':(80|443)\s'
curl -I https://soloeternity.me/
curl -I https://waline.soloeternity.me/
```

## 后续人工操作流程

1. 在 Cloudflare DNS 中确认 `soloeternity.me`、`waline.soloeternity.me`、`memos.soloeternity.me`、`chat.soloeternity.me` 都指向 `107.151.246.42`，或由 `*.soloeternity.me` 覆盖。
2. 如需开启 Cloudflare CDN，将主站、Waline、Memos、Chat 记录切为橙云代理，SSL/TLS 模式使用 `Full (strict)`。
3. 在 Cloudflare 创建 R2 bucket 后，把 `assets.soloeternity.me` 绑定为 R2 自定义域名；完成后它不应再命中服务器上的 Caddy 404 占位。
4. 部署 Decap CMS OAuth Worker 或独立 OAuth 服务后，把 `cms-auth.soloeternity.me` 指向该服务；完成后删除或覆盖 Caddy 中的 404 占位。
5. 初始化 Memos 管理员账号，并发布带 `#moment` 的公开 memo，用于博客 `/moments/` 页面读取。
6. 确认 LobeHub 的 `chat.soloeternity.me` 登录和模型配置正常；该域名已经保留给 LobeHub，不要改给其它服务。
7. 推送博客仓库后，观察 GitHub Actions 是否重新发布到 `/var/www/blog/current`。
8. 修改 Caddy 配置时，先在服务器执行 `caddy validate`，再 `docker compose up -d --build`。
9. 每次改 DNS 或 CDN 后，分别用本机和服务器 `curl -I` 验证，避免本地代理 DNS 缓存误判。
10. Cloudflare CDN 开启后，如果页面资源没有更新，先清理 Cloudflare Cache，再重新访问。

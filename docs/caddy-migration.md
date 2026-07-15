# Caddy 入口迁移与运维

本文记录将服务器 `80/443` 从 Nginx 整体迁回 Docker Caddy 后的最终状态。最后核验：`2026-07-15`。

## 1. 当前结论

- 生产入口是 Docker 容器 `caddy`。
- systemd `caddy` 为 inactive。
- systemd `nginx` 为 inactive。
- Caddy 监听 `80/tcp`、`443/tcp`、`443/udp` 和 `7000/tcp`。
- TLS 使用 Caddy + Cloudflare DNS-01 自动管理。
- `soloeternity.me` 体系不经过 FRP。
- `yiharmony.top` 和公网 `7000` 的 FRP 链路必须保留。
- `assets.soloeternity.me` 已绑定 R2。
- `cms-auth.soloeternity.me` 已绑定 Cloudflare Worker。

## 2. 为什么使用 Caddy

当前配置同时需要：

- 静态文件服务。
- 多个 Docker 服务反向代理。
- Cloudflare DNS-01 自动证书。
- HTTP/3。
- CORS 和缓存头。
- layer4 TCP 转发 FRPS。

自构建 Caddy 可在一个入口中完成以上职责。Nginx 配置保留仅用于历史追溯和紧急回滚，不应与 Caddy 同时启动。

## 3. 文件位置

仓库模板：

```text
deploy/caddy/Dockerfile
deploy/caddy/docker-compose.yml
deploy/caddy/Caddyfile
```

生产目录：

```text
/root/docker/caddy/
  docker-compose.yml
  Dockerfile
  .env
  conf/
    Caddyfile
```

挂载：

- `/root/docker/caddy/conf` -> `/etc/caddy`
- `/var/www` -> `/var/www`
- named volume `caddy-data` -> `/data`
- named volume `caddy-config` -> `/config`

证书状态保存在 `/data` named volume。删除容器本身不会删除 named volume，但执行 `docker volume rm` 会破坏证书和 ACME 状态。

## 4. 自定义镜像

镜像通过 `xcaddy` 编译：

- `github.com/caddy-dns/cloudflare`
- `github.com/mholt/caddy-l4`

检查模块：

```bash
cd /root/docker/caddy
docker compose exec caddy caddy list-modules | grep -E 'dns.providers.cloudflare|layer4'
```

如果模块缺失，Cloudflare DNS-01 或 `:7000` layer4 路由会失败。不要用官方裸 `caddy` 镜像直接覆盖自定义镜像。

## 5. 路由表

| 路由 | 上游/目录 | 备注 |
| --- | --- | --- |
| `soloeternity.me` | `/var/www/blog/current` | 静态站，zstd/gzip |
| `www.soloeternity.me` | 主域名 | 永久重定向 |
| `waline.soloeternity.me` | `waline:8360` | 评论 API/UI |
| `memos.soloeternity.me` | `memos:5230` | 仅允许博客 Origin 跨域 GET/OPTIONS |
| `gallery.soloeternity.me` | `chevereto:8080` | 仅允许博客 Origin 读取公开相册 |
| `umami.soloeternity.me` | `umami:3000` | 统计后台和脚本 |
| `chat.soloeternity.me` | `lobehub:3210` | LobeHub，不能改用途 |
| `openlist.soloeternity.me` | `openlist:5244` | 文件服务 |
| `s3.soloeternity.me` | `seaweedfs-s3:8333` | 未认证 `403` 正常 |
| `assets.soloeternity.me` | 源站 `404` | 正常 DNS 走 R2，不应到源站 |
| `cms-auth.soloeternity.me` | 源站 `404` | 正常 DNS 走 Worker，不应到源站 |
| `yiharmony.top` | `frps:8080` | 保留旧业务 |
| `*.yiharmony.top` | `frps:8080` | 保留旧业务 |
| `:7000` | `frps:7000` | layer4 TCP |

## 6. 静态站缓存

当前原则：

- HTML 不设置 immutable，保证发布后可更新。
- 带版本参数的 JS/CSS 允许较长缓存。
- Live2D、widget 与 APlayer 等固定资源可使用 immutable。
- Caddy 启用 zstd 和 gzip。

Cloudflare 实际可能覆盖或扩展浏览器 TTL。排查缓存必须同时查看：

```bash
curl -I https://soloeternity.me/js/custom.js
curl -I https://soloeternity.me/
```

关注：

- `Cache-Control`
- `Age`
- `CF-Cache-Status`
- `ETag`
- `Last-Modified`

静态目录页不需要设置 `no-cache`。HTML 保持可验证更新的普通缓存策略即可；真正的版本化静态资源才适合 immutable。

## 7. CORS

Memos 和 Gallery 只允许：

```text
Origin: https://soloeternity.me
```

预检请求应返回允许的 Origin、方法和请求头。不要无条件配置 `Access-Control-Allow-Origin: *`，因为这些服务还包含管理界面和用户数据。

检查：

```bash
curl -i -X OPTIONS https://memos.soloeternity.me/api/v1/memos \
  -H 'Origin: https://soloeternity.me' \
  -H 'Access-Control-Request-Method: GET'

curl -i https://gallery.soloeternity.me/explore/albums \
  -H 'Origin: https://soloeternity.me'
```

## 8. 修改流程

### 8.1 备份

```bash
cd /root/docker/caddy
cp -a conf/Caddyfile "conf/Caddyfile.bak.$(date -u +%Y%m%dT%H%M%SZ)"
```

### 8.2 校验

```bash
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec caddy caddy fmt --diff /etc/caddy/Caddyfile
```

当前配置可通过 validate，但存在格式化提示。`fmt --overwrite` 前必须查看 diff。

### 8.3 热重载

```bash
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
docker compose logs --tail=100 caddy
```

仅修改 Caddyfile 不需要重建镜像。只有 Dockerfile 插件或基础版本变化时才需要：

```bash
docker compose build --no-cache caddy
docker compose up -d caddy
```

### 8.4 回滚

```bash
cp -a conf/Caddyfile.bak.<timestamp> conf/Caddyfile
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## 9. Cloudflare 配置

建议：

- 主域和服务器服务子域使用橙云。
- SSL/TLS 设为 `Full (strict)`。
- `assets.soloeternity.me` 通过 R2 Custom Domains 管理，不创建指向服务器的普通 A 记录。
- `cms-auth.soloeternity.me` 绑定 Worker Custom Domain，不指向服务器。
- `chat.soloeternity.me` 保持 LobeHub 路由。
- `s3` 是否橙云取决于客户端兼容性；修改前测试大文件上传、签名和 Range 请求。

源站 Caddy使用 Cloudflare API Token 完成 DNS-01。Token 最小权限只应包含目标 Zone 的 DNS 编辑和 Zone 读取。

## 10. HTTPS 排查

### 10.1 Cloudflare 526

检查：

1. Cloudflare 是否 `Full (strict)`。
2. Caddy 容器是否运行。
3. 源站证书是否包含对应域名。
4. Cloudflare DNS Token 是否仍有效。
5. Caddy `/data` volume 是否丢失。

### 10.2 端口占用

```bash
ss -lntup | grep -E ':(80|443|7000)\b'
systemctl is-active nginx caddy
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

预期是 Docker/Caddy 占用 80/443，systemd nginx/caddy 均 inactive。

### 10.3 证书抽检

```bash
echo | openssl s_client -connect 107.151.246.42:443 \
  -servername soloeternity.me 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

## 11. Nginx 回滚边界

只有满足以下条件才考虑回滚 Nginx：

1. 已备份 Caddy 配置和 volumes。
2. Nginx 配置已经覆盖所有当前域名。
3. 有独立方案承接 Cloudflare DNS-01 或证书文件。
4. 有方案承接 FRP layer4 `7000`。
5. 已停止 Docker Caddy，确认端口释放。

仓库中的旧 Nginx 文件不包含当前所有服务，不能直接启用作为完整回滚。

## 12. 巡检清单

```bash
cd /root/docker/caddy
docker compose ps
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose logs --tail=100 caddy
```

域名：

```bash
for host in \
  soloeternity.me \
  waline.soloeternity.me \
  memos.soloeternity.me \
  gallery.soloeternity.me \
  umami.soloeternity.me \
  chat.soloeternity.me \
  openlist.soloeternity.me; do
  curl -fsSIL --max-time 20 "https://$host" >/dev/null && echo "OK $host" || echo "FAIL $host"
done
```

额外确认：

- `assets` 的响应来自 Cloudflare R2。
- `cms-auth` 的响应来自 Worker。
- `s3` 无认证访问 `403`。
- `yiharmony.top` 路由未被误删。
- Caddy 日志没有持续的 ACME、upstream 或 CORS 错误。


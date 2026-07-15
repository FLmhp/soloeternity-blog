# Caddy 生产入口

本目录保存生产 Caddy 的可复用配置。线上实际工作目录是 `/root/docker/caddy`。

## 当前状态

- Caddy `2.11.4`
- Docker 容器名 `caddy`
- 监听 `80/tcp`、`443/tcp`、`443/udp`、`7000/tcp`
- `80/443` 不再由 Nginx 占用
- Cloudflare DNS-01 自动签发证书
- layer4 转发 FRPS `7000`

## 文件

- `Dockerfile`：通过 xcaddy 加入 Cloudflare DNS 与 layer4。
- `docker-compose.yml`：容器、网络、端口、卷。
- `Caddyfile`：站点、反代、缓存、CORS 和 FRP 路由。

## 环境变量

生产 `/root/docker/caddy/.env` 至少包含 Cloudflare API Token。不得提交真实值。

要求：

```bash
chmod 600 /root/docker/caddy/.env
```

Token 使用最小权限：

- Zone / DNS / Edit
- Zone / Zone / Read
- 仅限 `soloeternity.me` 和确实需要的 Zone

## 部署

```bash
cd /root/docker/caddy
docker compose build caddy
docker compose up -d
docker compose ps
```

首次启动前必须确认：

```bash
systemctl is-active nginx caddy
ss -lntup | grep -E ':(80|443|7000)\b'
```

systemd Nginx/Caddy 应为 inactive，端口不能被其他程序占用。

## 校验和重载

```bash
cd /root/docker/caddy
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec caddy caddy fmt --diff /etc/caddy/Caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
docker compose logs --tail=100 caddy
```

当前配置可以 validate，但 fmt 有格式提示。不要跳过 diff 直接覆盖。

## Docker 网络

Caddy 需要加入相应服务网络，才能通过容器名访问上游。当前涉及：

- `caddy`
- `waline_default`
- `memos_default`
- `umami_default`
- `chevereto_default`
- LobeHub、OpenList、SeaweedFS、FRPS 对应网络

若出现 `dial tcp: lookup <container>`，先检查 Caddy 是否加入上游网络，而不是改成公网 IP。

## 不能删除的路由

- `chat.soloeternity.me` -> LobeHub
- `yiharmony.top` 和通配符 -> FRPS
- `:7000` layer4 -> FRPS
- `assets.soloeternity.me` 和 `cms-auth.soloeternity.me` 的防误配 404

`assets` 实际走 R2，`cms-auth` 实际走 Worker；404 表示 DNS 误指源站时拒绝提供错误服务。

## 备份

```bash
install -d -m 700 /var/backups/soloeternity/caddy
tar -C /root/docker -czf \
  "/var/backups/soloeternity/caddy/config-$(date -u +%Y%m%dT%H%M%SZ).tar.gz" \
  caddy/Dockerfile caddy/docker-compose.yml caddy/conf caddy/.env
```

备份文件含密钥，必须加密并同步到离机位置。

named volumes 也应定期备份：

```bash
docker run --rm \
  -v caddy-data:/source:ro \
  -v /var/backups/soloeternity/caddy:/backup \
  alpine sh -c 'tar -C /source -czf /backup/caddy-data.tar.gz .'
```

实际 volume 名以 `docker volume ls` 为准。

## 健康检查

```bash
curl -I https://soloeternity.me
curl -I https://waline.soloeternity.me
curl -I https://memos.soloeternity.me
curl -I https://gallery.soloeternity.me/explore/albums
curl -I https://umami.soloeternity.me/script.js
curl -I https://chat.soloeternity.me
```

完整路由和回滚说明见 `docs/caddy-migration.md`。


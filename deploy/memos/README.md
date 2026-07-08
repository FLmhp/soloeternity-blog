# Memos 自托管部署

## 服务信息

- 域名：`memos.soloeternity.me`
- 服务端口：`127.0.0.1:5230`
- 数据目录：`/opt/memos/data`
- Compose 目录：`/opt/memos`

## 安装

```bash
mkdir -p /opt/memos/data
cd /opt/memos
cp /path/to/docker-compose.yml ./docker-compose.yml
docker compose up -d
```

## Caddy

```bash
cd /root/docker/caddy
docker compose run --rm --no-deps --entrypoint caddy caddy2 validate --config /etc/caddy/Caddyfile
docker compose up -d --build
```

## 使用

1. 访问 `https://memos.soloeternity.me` 初始化管理员。
2. 发布公开 memo，内容包含 `#moment`。
3. 博客 `/moments/` 会尝试读取公开 memo 并显示。

如果 `/moments/` 无法读取，先检查 Memos API 是否允许跨域访问，以及 Caddy/Cloudflare 是否正确代理。

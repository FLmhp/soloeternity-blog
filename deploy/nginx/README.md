# Nginx 历史配置

本目录不属于当前生产入口。

截至 `2026-07-15`：

- systemd Nginx 为 inactive。
- Docker Caddy 占用 `80/443`。
- 仓库中的 Nginx 文件只覆盖早期主站、Waline、Memos 和 Chat，不包含当前全部服务。
- 当前 TLS 使用 Caddy DNS-01，不依赖这些 Nginx 配置或 Certbot。

不要执行：

```bash
ln -s /etc/nginx/sites-available/... /etc/nginx/sites-enabled/
systemctl start nginx
```

除非已经：

1. 停止 Docker Caddy。
2. 为所有当前域名补全 Nginx 路由。
3. 准备证书方案。
4. 准备 FRPS `7000` 的 TCP 转发方案。
5. 验证 `chat.soloeternity.me` 和 `yiharmony.top` 不会中断。

完整迁移和回滚边界见 `docs/caddy-migration.md`。


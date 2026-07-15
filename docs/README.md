# SoloEternity 博客文档

本文档集对应当前仓库与生产服务器的真实状态。最后核验时间：`2026-07-15`。

## 文档入口

| 文档 | 内容 |
| --- | --- |
| [deployment.md](deployment.md) | 原始 GitHub Pages/Vercel/LeanCloud 架构、当前生产架构、发布、备份、恢复和安全 |
| [caddy-migration.md](caddy-migration.md) | Caddy 入口、Cloudflare、HTTPS、CORS、FRP 与 Nginx 回滚边界 |
| [usage.md](usage.md) | 本地写作、Decap CMS、分类标签、R2 图片、动态页面、评论、统计和排障 |
| [beautification.md](beautification.md) | Fluid 主题改造、毛玻璃、动画、音乐、Live2D、一言、性能和可访问性 |
| [../deploy/README.md](../deploy/README.md) | 生产组件清单、服务器目录、容器、备份命令和发布检查 |

## 当前生产快照

- 主站：`https://soloeternity.me`
- 源码仓库：`FLmhp/soloeternity-blog`
- 静态目录：`/var/www/blog/current`
- Web 入口：Docker Caddy `2.11.4`
- 评论：Waline `1.41.3` + SQLite
- 动态：Memos + SQLite WAL
- 相册：Chevereto + MariaDB
- 统计：Umami + PostgreSQL；页脚公开计数仍由 Busuanzi 展示
- 媒体：Cloudflare R2 `soloeternity-assets`
- 在线写作：Decap CMS + Cloudflare Worker OAuth
- 对话：`chat.soloeternity.me` 上的 LobeHub
- 自动发布：GitHub Actions -> rsync

## 文档用词

为防止建议与事实混淆，文档使用以下标签：

- **当前状态**：本次已从仓库、服务器或线上响应验证。
- **历史配置**：保留用于迁移追溯，不应直接加载。
- **建议**：尚未部署，需要人工评估和实施。
- **预期**：健康检查的正常响应，不是固定业务数据。

## 重要提醒

1. 服务器系统时区实际是 UTC，Hexo/Waline 业务时区是 Asia/Shanghai。
2. Nginx 已停用，生产 `80/443` 由 Docker Caddy 占用。
3. `assets.soloeternity.me` 属于 R2，`cms-auth.soloeternity.me` 属于 Worker。
4. `chat.soloeternity.me` 是 LobeHub，不能改去 R2 或 Worker。
5. `yiharmony.top` 与 FRP 路由必须保留。
6. 当前没有自动业务备份；部署文档中的备份自动化属于待办。
7. UFW 当前 inactive；安全组和 Docker 防火墙仍需加固。
8. 文档不得记录任何 OAuth Secret、SMTP 授权码、R2 Secret、JWT 或数据库密码。


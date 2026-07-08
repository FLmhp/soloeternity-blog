# Blog Docs

本目录整理当前博客的运维、使用与美化说明，按主题拆分为三份文档：

- [部署文档](./deployment.md)
- [使用文档](./usage.md)
- [美化文档](./beautification.md)
- [Caddy 边缘入口迁移手册](./caddy-migration.md)

最新核验时间：`2026-07-08`（`Asia/Shanghai`）

本次核验覆盖了：

- 线上主站与 Waline 的真实 HTTP 状态
- Ubuntu / Caddy / Docker / SQLite 当前运行状态
- GitHub Actions 最近成功部署记录
- 当前仓库中的使用与美化入口是否仍和线上行为一致

建议阅读顺序：

1. 新机器部署或迁移时先看 `deployment.md`
2. 日常写作、发布、评论管理时看 `usage.md`
3. 调整视觉效果、特效开关或样式参数时看 `beautification.md`

当前文档默认基于以下事实编写：

- 域名：`https://soloeternity.me`
- 评论服务：`https://waline.soloeternity.me`
- 边缘入口：Caddy，占用 `80/443/7000`
- 静态文件目录：`/var/www/blog/current`
- Waline 数据目录：`/opt/waline/data`
- 自动部署入口：`.github/workflows/deploy.yml`

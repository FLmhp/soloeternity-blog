# 服务器初始化脚本说明

`bootstrap.sh` 是早期 Ubuntu 初始化脚本，不是当前生产状态的完整声明。

脚本会安装 Nginx、Certbot、rsync、Docker 等基础组件。当前生产已经迁移到 Docker Caddy，因此：

- 可以复用软件安装和目录创建部分。
- 不应在最终状态启用 Nginx。
- 不需要通过 Certbot Nginx 插件管理当前证书。
- 动态服务需要按 `/opt/*` 和 `/root/docker/*` 的实际 Compose 逐个恢复。

新机建议流程：

1. 阅读脚本，不直接盲跑。
2. 更新系统并安装 Docker、Compose、rsync、curl、sqlite3、PostgreSQL/MariaDB 客户端。
3. 配置 SSH 密钥，关闭密码登录。
4. 创建 `/var/www/blog/current`。
5. 部署 Docker Caddy。
6. 恢复 Waline、Memos、Umami、Chevereto 等数据。
7. 通过 Actions 发布静态站。
8. 更新 DNS。
9. 完成域名、证书、备份和防火墙检查。

服务器当前系统时区是 UTC。若要改成上海时区：

```bash
timedatectl set-timezone Asia/Shanghai
timedatectl status
```

这属于可选变更。修改前要确认日志、数据库和备份脚本是否依赖 UTC。保持 UTC 也完全可行，只需在文档和排障中明确转换关系。


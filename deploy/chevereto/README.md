# Chevereto 图床部署

域名：`https://gallery.soloeternity.me`。

## 当前状态

- Chevereto：`ghcr.io/chevereto/chevereto:latest`
- 数据库：MariaDB `11.4`
- 图片目录：`/opt/chevereto/images`
- 数据库目录：`/opt/chevereto/database`
- 公网入口：Docker Caddy -> `chevereto:8080`
- 核验快照：21 张图片、1 个公开相册

Chevereto 当前使用服务器本地存储，不是 R2。博客文章媒体走 R2，相册管理走 Chevereto，两者不要混用目录。

## 部署

```bash
cd /opt/chevereto
chmod 600 .env
docker compose up -d
docker compose ps
docker logs --tail=100 chevereto
docker logs --tail=100 chevereto-db
```

`.env` 至少包含数据库名、用户、密码和 root 密码。仓库不得保存生产值。

## 首次配置

1. 打开 `https://gallery.soloeternity.me`。
2. 创建管理员。
3. 设置站点名、默认语言、时区和上传限制。
4. 修改默认发件人邮箱。
5. 配置 SMTP，或明确关闭依赖邮件的功能。
6. 新建公开相册并匿名测试。

管理员页面出现“未修改默认邮箱”“未配置邮件提供商”时，不影响基本上传，但会影响找回密码、通知和安全告警。应在 Chevereto Email settings 中填写独立 SMTP，不要把 Waline `.env` 直接复制过去。

## Gallery 对接

博客脚本读取：

```text
https://gallery.soloeternity.me/explore/albums
```

要求：

- 相册公开。
- 相册标题、简述和标签完整。
- 匿名访客可以打开相册页和图片。
- Caddy 对 `https://soloeternity.me` 返回正确 CORS。

博客会展示相册信息和图片，不显示 Chevereto 管理入口。

## 真实 IP

Chevereto 经过 Cloudflare 和 Caddy。应用应使用 Caddy 传递的可信客户端 IP 头，避免所有上传都记录为 Caddy 容器地址。

不要无条件信任任意访客传入的 `X-Forwarded-For`。只信任 Cloudflare/Caddy 链路。

## 备份

### 数据库

```bash
install -d -m 700 /var/backups/soloeternity/chevereto
docker exec chevereto-db sh -lc \
  'mariadb-dump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > "/var/backups/soloeternity/chevereto/database-$(date -u +%Y%m%dT%H%M%SZ).sql"
```

### 图片

```bash
tar -C /opt/chevereto -czf \
  "/var/backups/soloeternity/chevereto/images-$(date -u +%Y%m%dT%H%M%SZ).tar.gz" images
```

数据库和图片必须使用相近时间点成对保存。只备份其中一个会产生失效记录或孤立文件。

## 恢复

1. 停止 Chevereto 写入。
2. 恢复图片目录。
3. 创建空数据库。
4. 导入 SQL。
5. 启动容器。
6. 检查管理员登录、相册数量、缩略图和原图。
7. 检查博客 `/gallery/`。

导入示例：

```bash
cat /path/to/database.sql | docker exec -i chevereto-db sh -lc \
  'mariadb -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

## 升级

Chevereto 和 MariaDB 都使用可能变化的镜像标签。升级前：

1. 备份数据库和图片。
2. 记录镜像 digest。
3. 阅读 Chevereto 与 MariaDB 升级说明。
4. 先升级测试环境。
5. 验证公开 HTML 结构没有破坏 `gallery-feed-v1.js`。

## 故障排查

### 登录后黑屏/通知

- 检查浏览器控制台。
- 检查 Chevereto 容器日志。
- 配置默认邮箱和 SMTP。
- 清除 Cloudflare/浏览器缓存。

### Gallery 空白

- 相册是否公开。
- 匿名 `/explore/albums` 是否有内容。
- CORS。
- HTML 结构是否升级变化。
- 图片域名是否可访问。

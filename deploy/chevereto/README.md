# Chevereto 图床部署

当前生产地址：

- 图床入口：`https://gallery.soloeternity.me`
- Compose 目录：`/opt/chevereto`
- 图片数据目录：`/opt/chevereto/images`
- 数据库目录：`/opt/chevereto/database`

## 启动

```bash
cd /opt/chevereto
docker compose up -d
```

Chevereto 当前镜像实际由 Apache 监听 `8080`，Caddy 应反代到：

```caddyfile
gallery.soloeternity.me {
    encode zstd gzip
    reverse_proxy chevereto:8080
}
```

如果页面提示 `/images/` 无写权限，执行：

```bash
uid=$(docker exec chevereto id -u www-data)
gid=$(docker exec chevereto id -g www-data)
chown -R "$uid:$gid" /opt/chevereto/images
docker restart chevereto
```

## 初始化

打开：

```text
https://gallery.soloeternity.me/install
```

填写管理员用户名、邮箱和密码，完成安装。

## 管理员首次配置

个人图床建议使用以下最小配置：

1. `Dashboard > Settings > Website`：站点名设为 `SoloEternity Gallery`，站点 URL 保持 `https://gallery.soloeternity.me`。
2. `Dashboard > Settings > File uploads`：关闭游客上传和游客相册，开启登录用户上传；存储模式选 `Datefolders`，文件命名选 `Random`，最大上传大小建议 `20 MB`，按需移除 EXIF。
3. `Dashboard > Settings > Users`：不需要公开图床时关闭注册，只保留管理员账号。
4. `Dashboard > Settings > Email`：先修改默认发件人和管理员邮箱，再填写 SMTP。未配置邮件不会影响上传，只影响找回密码和通知。
5. 上传一张测试图，确认原图、缩略图和 Markdown 链接均能访问后，再在博客中使用图床 URL。

当前先使用 `/opt/chevereto/images` 本地持久化。需要把图床独立迁到 R2 时，建议新建专用 bucket 和图片域名，再在 `Dashboard > Settings > Upload storage` 中添加 `S3 compatible`，不要与博客静态资源共用同一个前缀。

## 验证

```bash
curl -I https://gallery.soloeternity.me/
docker ps --filter name=chevereto
docker logs --tail 80 chevereto
```

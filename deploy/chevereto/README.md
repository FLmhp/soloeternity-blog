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

## 验证

```bash
curl -I https://gallery.soloeternity.me/
docker ps --filter name=chevereto
docker logs --tail 80 chevereto
```

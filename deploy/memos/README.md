# Memos 生产部署

域名：`https://memos.soloeternity.me`。

## 当前状态

- 镜像：`neosmemo/memos:stable`
- 容器：`memos`
- 数据目录：`/opt/memos/data`
- 容器端口：`5230`
- 宿主机回环：`127.0.0.1:5230`
- 公网入口：Docker Caddy
- 核验快照：1 个用户、3 条 memo、0 条数据库附件记录

业务数字会随使用变化，只用于说明核验时数据库不是空实例。

## 启动

```bash
cd /opt/memos
docker compose up -d
docker compose ps
docker logs --tail=100 memos
```

初始化：

```text
https://memos.soloeternity.me
```

创建管理员后，公开内容必须选择 PUBLIC，博客才能匿名读取。

## 博客标签

- `#moment` -> `/moments/`
- `#essay` -> `/essays/`

页面支持 Markdown、图片附件、引用/被引用、地点和标签。

## 公共 API

前端按顺序尝试：

```text
/api/v1/memos?filter=visibility=="PUBLIC"&pageSize=20
/api/v1/memos?pageSize=20
/api/v1/memo?rowStatus=NORMAL&limit=20
```

检查：

```bash
curl -fsS 'https://memos.soloeternity.me/api/v1/memos?filter=visibility%3D%3D%22PUBLIC%22&pageSize=20'
```

Memos 版本变化可能改变 API 结构。升级后必须检查 `source/js/memos-feed-v5.js`。

## CORS

Caddy 只允许 `https://soloeternity.me` 读取公开 API。若需要本地 `http://localhost:4000` 调试，不建议永久放宽为 `*`；可临时添加精确 Origin，测试后删除。

预检：

```bash
curl -i -X OPTIONS https://memos.soloeternity.me/api/v1/memos \
  -H 'Origin: https://soloeternity.me' \
  -H 'Access-Control-Request-Method: GET'
```

## 附件位置

Memos 默认附件随数据目录保存，实际位置由版本和存储配置决定。应把整个 `/opt/memos/data` 视为不可分割的数据集，不要只备份单个数据库。

核验时数据库附件记录为 0，但数据目录中的 assets 仍应纳入备份，以免未来上传附件后遗漏。

## SQLite WAL

当前能看到：

```text
memos_prod.db
memos_prod.db-wal
memos_prod.db-shm
```

主 `.db` 体积很小时，最新数据可能仍在 `-wal`。直接复制单个 `.db` 可能得到不完整备份。

## 备份

短暂停机方案：

```bash
install -d -m 700 /var/backups/soloeternity/memos
cd /opt/memos
docker compose stop memos
tar -C /opt/memos -czf \
  "/var/backups/soloeternity/memos/memos-$(date -u +%Y%m%dT%H%M%SZ).tar.gz" data
docker compose start memos
```

确认恢复后，再清理旧备份。备份需要同步到服务器之外。

## 恢复

```bash
cd /opt/memos
docker compose stop memos
mv data "data.failed.$(date -u +%Y%m%dT%H%M%SZ)"
mkdir data
tar -C /opt/memos -xzf /path/to/memos-backup.tar.gz
docker compose start memos
docker logs --tail=100 memos
```

压缩包结构必须与备份命令一致。恢复前先用 `tar -tzf` 查看。

## 升级

1. 记录当前镜像 digest。
2. 备份整个数据目录。
3. 阅读 Memos release notes 和数据库迁移说明。
4. `docker compose pull`。
5. `docker compose up -d`。
6. 检查登录、公开 API、附件、`/moments/` 和 `/essays/`。

由于使用 `stable` 浮动标签，建议以后固定到经过验证的具体版本或 digest。

## 空白排查

1. 容器是否 Up。
2. Memo 是否 PUBLIC。
3. 标签是否精确。
4. API 是否返回内容。
5. CORS 是否允许主域。
6. 浏览器是否命中旧 `memos-feed-v5.js`。
7. Memos 升级是否改变附件或关系字段。


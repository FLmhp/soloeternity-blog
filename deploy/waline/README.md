# Waline 生产部署

线上 Waline：`https://waline.soloeternity.me`。

## 当前状态

- 镜像：`lizheming/waline:1.41.3`
- 服务端版本：`@waline/vercel 1.41.3`
- 容器：`waline`
- 端口：容器 `8360`，宿主机只绑定 `127.0.0.1:8360`
- 数据：`/opt/waline/data/waline.sqlite`
- 管理：`https://waline.soloeternity.me/ui`
- 时区：`Asia/Shanghai`

## 文件

- `docker-compose.yml`：生产模板。
- `config.js`：邮件标题和内容模板逻辑。
- `.env`：只存在服务器，仓库不得保存真实值。

## 环境变量

生产 `.env` 使用的键包括：

```text
TZ
SQLITE_PATH
JWT_TOKEN
SITE_NAME
SITE_URL
SERVER_URL
SECURE_DOMAINS
AUTHOR_EMAIL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_SECURE
SENDER_NAME
SENDER_EMAIL
MAIL_SUBJECT
MAIL_TEMPLATE
MAIL_SUBJECT_ADMIN
MAIL_TEMPLATE_ADMIN
```

QQ SMTP：

- host：`smtp.qq.com`
- port：`465`
- secure：`true`
- 用户名：完整 QQ 邮箱地址
- 密码：邮箱授权码，不是 QQ 登录密码

权限：

```bash
chmod 600 /opt/waline/.env
find /opt/waline -maxdepth 1 -name '.env.bak*' -ls
```

历史 `.env.bak` 可能包含有效密钥。确认不需要后安全删除，或者至少限制为 `600`。

## 启动

```bash
cd /opt/waline
docker compose pull
docker compose up -d
docker compose ps
docker logs --tail=100 waline
```

升级前不要直接 pull。先完成 SQLite 一致性备份并阅读上游变更。

## 初始化

全新实例不能创建一个空 `waline.sqlite` 就启动。让 Waline 初始化数据结构，或者使用已验证的历史数据库。

首次管理员注册：

```text
https://waline.soloeternity.me/ui/register
```

出现 `no such table: wl_Users` 时说明数据库结构没有初始化完成，不要手工只创建一个表；应检查 SQLite 路径、挂载、权限和初始化日志。

## 邮件区分

服务端模板根据页面路径区分：

- `/message/`：邮件提示“你的博客网站收到了新的留言”。
- 文章页：包含具体文章标题或路径。

前端 placeholder：

- 文章：`欢迎大家来评论区灌水喵~`
- 留言板：`写下此刻的心跳，它便不再只是你的。每一行字，都会在风里找到归宿。`

修改 `config.js` 后：

```bash
cd /opt/waline
docker compose up -d --force-recreate waline
docker logs --tail=100 waline
```

## 邮件测试

管理员本人评论可能不会给自己发通知。正确测试：

1. 退出 Waline 管理员。
2. 使用另一个邮箱匿名评论测试文章。
3. 再测试留言板。
4. 查看 `docker logs waline`。
5. 确认两个邮件主题不同。

## 地理位置

Waline 根据服务器看到的公网出口 IP 查询地理位置。Clash/VPN 用户显示的是代理出口城市。Caddy/Cloudflare 链路必须正确传递真实访客 IP，同时只信任已知代理来源，避免伪造头。

## 备份

```bash
install -d -m 700 /var/backups/soloeternity/waline
python3 - <<'PY'
import datetime
import sqlite3
from pathlib import Path

src = Path('/opt/waline/data/waline.sqlite')
dst = Path('/var/backups/soloeternity/waline') / (
    'waline-' + datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '.sqlite'
)
with sqlite3.connect(src) as source, sqlite3.connect(dst) as target:
    source.backup(target)
print(dst)
PY
```

校验：

```bash
sqlite3 /var/backups/soloeternity/waline/waline-*.sqlite 'PRAGMA integrity_check;'
```

## 恢复

```bash
cd /opt/waline
docker compose stop waline
cp -a data/waline.sqlite "data/waline.sqlite.failed.$(date -u +%Y%m%dT%H%M%SZ)"
cp -a /path/to/verified-backup.sqlite data/waline.sqlite
chown --reference=data data/waline.sqlite || true
docker compose start waline
docker logs --tail=100 waline
```

恢复后检查用户、评论、管理后台、文章评论和邮件。

## 健康检查

```bash
curl -I https://waline.soloeternity.me
curl -I https://waline.soloeternity.me/ui
docker exec waline node -p "require('@waline/vercel/package.json').version"
```


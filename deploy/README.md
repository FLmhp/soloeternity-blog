# Ubuntu Deployment

This repository now assumes Caddy owns the public edge ports on the Ubuntu server.

Current public endpoints include:

- `soloeternity.me` serves the generated Hexo static files from `/var/www/blog/current`
- `waline.soloeternity.me` reverse proxies the self-hosted Waline container on `127.0.0.1:8360`
- `memos.soloeternity.me` reverse proxies the self-hosted Memos container
- `chat.soloeternity.me` reverse proxies the existing LobeHub deployment

Current production checks were re-verified on `2026-07-08`:

- `https://soloeternity.me` returns `HTTP 200`
- `https://waline.soloeternity.me/ui` returns `HTTP 200`
- the live Waline service reports `x-waline-version: 1.41.3`
- the current static homepage file on the server is `/var/www/blog/current/index.html`
- Caddy owns `80/tcp`, `443/tcp`, `443/udp`, and `7000/tcp`
- Nginx is `inactive` and `disabled`
- the latest successful GitHub Actions deployment run is `27130282506`
- Waline SMTP is currently wired to `smtp.qq.com:465` with sender `SoloEternity <fl-mhp@qq.com>`

This file is now a deployment template plus a production checklist. Some placeholders remain in the example files by design, but the repository itself is already under Git and the Actions workflow is active.

## 1. Update project placeholders

Before you push to GitHub, replace the placeholder values in:

- `_config.yml`
- `_config.fluid.yml`
- `deploy/caddy/Caddyfile`
- `deploy/caddy/.env.example`
- `deploy/waline/.env.example`

## 2. Prepare Ubuntu

Create these DNS records first:

- `soloeternity.me` -> your server public IP
- `waline.soloeternity.me` -> your server public IP

Then copy and run the bootstrap script on the server if this is a fresh machine:

```bash
scp deploy/server/bootstrap.sh user@your-server:/tmp/bootstrap.sh
ssh user@your-server 'bash /tmp/bootstrap.sh'
```

The legacy bootstrap script installs `nginx`, `certbot`, `python3-certbot-nginx`, `rsync`, Docker and Docker Compose, then creates:

- `/var/www/blog/current`
- `/opt/waline`
- `/opt/waline/data`

If the script adds your user to the `docker` group, sign out and sign back in before running `docker compose`.

## 3. Install Caddy as the public edge

Caddy is the current production edge. It replaces both Nginx HTTPS server blocks and Certbot renewal for the public endpoints.

```bash
scp deploy/caddy/Caddyfile user@your-server:/tmp/Caddyfile
scp deploy/caddy/docker-compose.yml user@your-server:/tmp/docker-compose.yml
scp deploy/caddy/Dockerfile user@your-server:/tmp/Dockerfile
scp deploy/caddy/.env.example user@your-server:/tmp/caddy.env
ssh user@your-server <<'EOF'
sudo mkdir -p /root/docker/caddy/conf
sudo cp /tmp/Caddyfile /root/docker/caddy/conf/Caddyfile
sudo cp /tmp/docker-compose.yml /root/docker/caddy/docker-compose.yml
sudo cp /tmp/Dockerfile /root/docker/caddy/Dockerfile
sudo cp /tmp/caddy.env /root/docker/caddy/.env
sudo editor /root/docker/caddy/.env
sudo systemctl stop nginx || true
sudo systemctl disable nginx || true
cd /root/docker/caddy
docker compose run --rm --no-deps --entrypoint caddy caddy2 validate --config /etc/caddy/Caddyfile
docker compose up -d --build
docker ps --filter name=caddy
EOF
```

The current Caddy config also keeps FRP available:

- `7000/tcp` is forwarded by Caddy layer4 to `frps:7000`
- `www.yiharmony.top` and `*.yiharmony.top` are reverse proxied to `frps:8080`
- `soloeternity.me`, Waline, Memos, and LobeHub are direct Docker-network reverse proxies, not FRP proxies

Do not start Nginx while Caddy is running, because both services need `80/443`.

The old Nginx templates under `deploy/nginx/` are retained only as historical reference and emergency rollback material.

## 4. Deploy Waline

Waline uses Docker plus SQLite in `/opt/waline/data`.

```bash
scp deploy/waline/docker-compose.yml user@your-server:/tmp/docker-compose.yml
scp deploy/waline/.env.example user@your-server:/tmp/waline.env
ssh user@your-server <<'EOF'
sudo mkdir -p /opt/waline /opt/waline/data
sudo curl -L https://raw.githubusercontent.com/walinejs/waline/main/assets/waline.sqlite -o /opt/waline/data/waline.sqlite
sudo cp /tmp/docker-compose.yml /opt/waline/docker-compose.yml
sudo cp /tmp/waline.env /opt/waline/.env
sudo chown -R "$USER":"$USER" /opt/waline
cd /opt/waline
docker compose up -d
EOF
```

Edit `/opt/waline/.env` before the first `docker compose up -d` and set:

- `JWT_TOKEN` to a long random string
- `SITE_NAME` to your blog name
- `SITE_URL` to your real blog URL
- `SERVER_URL` to your Waline URL
- `AUTHOR_EMAIL` to your real email
- `MAIL_SUBJECT`, `MAIL_TEMPLATE`, `MAIL_SUBJECT_ADMIN`, and `MAIL_TEMPLATE_ADMIN` if you want custom reply/admin notification mail layouts

Current Waline documentation requires `SECURE_DOMAINS` to include both the blog domain and the Waline domain, so the example file uses both values.

Waline SQLite is not initialized from an empty file. Seed `/opt/waline/data/waline.sqlite` from the official `walinejs/waline` repository before the first `docker compose up -d`, otherwise registration and comments will fail with `SQLITE_ERROR: no such table`.

After the container starts:

- open `https://waline.soloeternity.me/ui`
- finish the admin initialization
- verify a blog post can load the comment widget

If you enable SMTP, the bundled `.env.example` also includes ready-to-edit `MAIL_*` templates for both the site owner notification and the visitor reply notification. They use Waline's documented `self`, `parent`, and `site` variables, so they render without any additional server-side customization.

## 5. Push updates and use GitHub Actions

The repository is already initialized and the workflow in `.github/workflows/deploy.yml` is active. For a fresh clone, the normal publish flow is:

```bash
git add .
git commit -m "Update blog content"
git push origin main
```

Then create these repository secrets:

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- optional `SSH_KNOWN_HOSTS`

The workflow in `.github/workflows/deploy.yml` will:

- install dependencies with `pnpm --frozen-lockfile`
- build the Hexo site
- sync `public/` to `/var/www/blog/current` with `rsync --delete`
- normalize remote file permissions without restarting Caddy

Recent production reference:

- latest successful run: `27130282506`
- workflow finish time: `2026-06-08 18:07:18` (`Asia/Shanghai`)
- latest deployed homepage mtime observed on the server: `2026-06-08 18:07:03` (`Asia/Shanghai`)

## 6. Import historical Waline data

If you exported the old Waline data from LeanCloud, this repository includes a migration script for the `Users` and `Comment` classes:

```bash
python tools/import_waline_leancloud.py \
  --export-dir /path/to/leancloud-export \
  --db /opt/waline/data/waline.sqlite
```

The script:

- skips the LeanCloud JSONL header rows automatically
- upserts `Users.0.jsonl` into `wl_Users`
- imports `Comment.0.jsonl` into `wl_Comment`
- preserves Waline bcrypt password hashes from the old `Users` class
- creates a timestamped SQLite backup before writing, unless `--no-backup` is passed

The provided LeanCloud export does not include page view counters for `wl_Counter`, so the script intentionally leaves PV/UV style counters untouched.

If you need to reset a self-hosted Waline instance back to the historical LeanCloud data set, use this sequence:

```bash
sudo cp /opt/waline/data/waline.sqlite /opt/waline/data/waline.pre-reset-$(date +%Y%m%d%H%M%S).sqlite
sudo curl -L https://raw.githubusercontent.com/walinejs/waline/main/assets/waline.sqlite -o /opt/waline/data/waline.sqlite
python tools/import_waline_leancloud.py \
  --export-dir /path/to/leancloud-export \
  --db /opt/waline/data/waline.sqlite
cd /opt/waline
docker compose up -d waline
```

Validate the reset with:

```bash
python - <<'PY'
import sqlite3
conn = sqlite3.connect('/opt/waline/data/waline.sqlite')
cur = conn.cursor()
print('users', cur.execute('SELECT COUNT(*) FROM wl_Users').fetchone()[0])
print('comments', cur.execute('SELECT COUNT(*) FROM wl_Comment').fetchone()[0])
print('counters', cur.execute('SELECT COUNT(*) FROM wl_Counter').fetchone()[0])
PY
```

The current live database state was preserved during the `2026-07-11` upgrade to Waline `1.41.3`:

- `wl_Users = 1`
- `wl_Comment = 3`
- `wl_Counter = 0`
- current administrator row: `FLmhp / 2122283196@qq.com / administrator`

The current live mail-notification settings verified on the server are:

- `SMTP_HOST=smtp.qq.com`
- `SMTP_PORT=465`
- `SMTP_USER=fl-mhp@qq.com`
- `SENDER_NAME=SoloEternity`
- `AUTHOR_EMAIL=fl-mhp@qq.com`

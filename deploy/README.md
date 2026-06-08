# Ubuntu Deployment

This repository now assumes two public endpoints:

- `soloeternity.me` serves the generated Hexo static files from `/var/www/blog/current`
- `waline.soloeternity.me` reverse proxies the self-hosted Waline container on `127.0.0.1:8360`

Replace any remaining placeholders before first deployment.

## 1. Update project placeholders

Before you push to GitHub, replace the placeholder values in:

- `_config.yml`
- `_config.fluid.yml`
- `deploy/nginx/soloeternity.me.conf`
- `deploy/nginx/waline.soloeternity.me.conf`
- `deploy/waline/.env.example`

## 2. Prepare Ubuntu

Create these DNS records first:

- `soloeternity.me` -> your server public IP
- `waline.soloeternity.me` -> your server public IP

Then copy and run the bootstrap script on the server:

```bash
scp deploy/server/bootstrap.sh user@your-server:/tmp/bootstrap.sh
ssh user@your-server 'bash /tmp/bootstrap.sh'
```

The script installs `nginx`, `certbot`, `python3-certbot-nginx`, `rsync`, Docker and Docker Compose, then creates:

- `/var/www/blog/current`
- `/opt/waline`
- `/opt/waline/data`

If the script adds your user to the `docker` group, sign out and sign back in before running `docker compose`.

## 3. Install Nginx configs and HTTPS

Copy the Nginx templates to the server, rename them to match your real domains if needed, then enable them:

```bash
scp deploy/nginx/*.conf user@your-server:/tmp/
ssh user@your-server <<'EOF'
sudo cp /tmp/soloeternity.me.conf /etc/nginx/sites-available/soloeternity.me.conf
sudo cp /tmp/waline.soloeternity.me.conf /etc/nginx/sites-available/waline.soloeternity.me.conf
sudo ln -sf /etc/nginx/sites-available/soloeternity.me.conf /etc/nginx/sites-enabled/soloeternity.me.conf
sudo ln -sf /etc/nginx/sites-available/waline.soloeternity.me.conf /etc/nginx/sites-enabled/waline.soloeternity.me.conf
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d soloeternity.me -d waline.soloeternity.me
sudo certbot renew --dry-run
EOF
```

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

Current Waline documentation requires `SECURE_DOMAINS` to include both the blog domain and the Waline domain, so the example file uses both values.

Waline SQLite is not initialized from an empty file. Seed `/opt/waline/data/waline.sqlite` from the official `walinejs/waline` repository before the first `docker compose up -d`, otherwise registration and comments will fail with `SQLITE_ERROR: no such table`.

After the container starts:

- open `https://waline.soloeternity.me/ui`
- finish the admin initialization
- verify a blog post can load the comment widget

## 5. Push to GitHub and enable Actions

This directory is not a Git repository yet, so GitHub Actions cannot run until you initialize and push it:

```bash
git init -b main
git add .
git commit -m "Prepare Ubuntu deployment"
git remote add origin git@github.com:<your-account>/<your-repo>.git
git push -u origin main
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
- normalize remote file permissions without restarting Nginx

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

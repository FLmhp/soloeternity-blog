#!/usr/bin/env bash

set -euo pipefail

OWNER_USER="${SUDO_USER:-$USER}"

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx rsync

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo mkdir -p /var/www/blog/current /opt/waline /opt/waline/data
sudo chown -R "$OWNER_USER":"$OWNER_USER" /var/www/blog /opt/waline
sudo chmod 755 /var/www/blog /var/www/blog/current /opt/waline /opt/waline/data
sudo usermod -aG docker "$OWNER_USER"

sudo systemctl enable --now nginx
sudo systemctl enable --now docker

echo "Bootstrap complete. Re-login before using docker without sudo."

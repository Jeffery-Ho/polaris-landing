#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this bootstrap script as root." >&2
  exit 1
fi

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
deploy_user="polaris-deploy"
site_root="/srv/polaris-landing"
http_config="/etc/nginx/conf.d/polaris-ai.work.conf"

dnf install -y nginx certbot python3-certbot-nginx nodejs rsync
id "$deploy_user" &>/dev/null || useradd --create-home --shell /bin/bash "$deploy_user"
install -d -o "$deploy_user" -g "$deploy_user" -m 0755 "$site_root/releases"

if [[ ! -L "$site_root/current" || ! -f "$site_root/current/index.html" ]]; then
  echo "Server prerequisites are ready. Publish the first release, then run this script again to request TLS." >&2
  exit 0
fi

: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL to the certificate renewal contact address.}"

cat > "$http_config" <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name polaris-ai.work www.polaris-ai.work;

    location ^~ /.well-known/acme-challenge/ {
        root /srv/polaris-landing/current;
        default_type text/plain;
    }
}
EOF

nginx -t
systemctl enable --now nginx
systemctl reload nginx

certbot certonly --webroot --non-interactive --agree-tos \
  --email "$CERTBOT_EMAIL" \
  -w "$site_root/current" \
  -d polaris-ai.work \
  -d www.polaris-ai.work

install -m 0644 "$repository_root/deploy/nginx/polaris-ai.work.conf" "$http_config"
nginx -t
systemctl reload nginx
systemctl enable --now certbot-renew.timer

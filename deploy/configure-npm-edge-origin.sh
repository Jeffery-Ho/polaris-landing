#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this source-origin configuration script as root." >&2
  exit 1
fi

: "${ACME_EMAIL:?Set ACME_EMAIL to the certificate renewal contact address.}"

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
npm_container="${NPM_CONTAINER:-nginx-app}"
origin_upstream="${ORIGIN_UPSTREAM:-172.17.0.1:8080}"
site_config="/data/nginx/custom/sites/polaris-ai.work.conf"
http_include="/data/nginx/custom/http.conf"
backup_dir="/data/nginx/custom/backups"
acme_root="/data/letsencrypt-acme-challenge"
acme_template="$repository_root/deploy/nginx/polaris-ai.work.npm-acme.conf"
final_template="$repository_root/deploy/nginx/polaris-ai.work.npm.conf"

docker inspect "$npm_container" >/dev/null
docker exec "$npm_container" mkdir -p /data/nginx/custom/sites "$backup_dir" "$acme_root"

if docker exec "$npm_container" test -f /data/nginx/proxy_host/7.conf; then
  if ! docker exec "$npm_container" grep -q 'server_name polaris-ai.work;' /data/nginx/proxy_host/7.conf; then
    echo "Refusing to move an unexpected NPM proxy_host/7.conf." >&2
    exit 1
  fi
  backup_name="polaris-ai.work.proxy_host-7.conf.$(date +%Y%m%d%H%M%S)"
  docker exec "$npm_container" mv /data/nginx/proxy_host/7.conf "$backup_dir/$backup_name"
fi

if docker exec "$npm_container" test -f "$site_config"; then
  backup_name="polaris-ai.work.custom.conf.$(date +%Y%m%d%H%M%S)"
  docker exec "$npm_container" cp "$site_config" "$backup_dir/$backup_name"
fi

docker cp "$acme_template" "$npm_container:/tmp/polaris-ai.work.npm-acme.conf"
docker exec "$npm_container" sh -c \
  "sed 's#__ORIGIN_UPSTREAM__#${origin_upstream}#g' /tmp/polaris-ai.work.npm-acme.conf > '$site_config'"

docker exec "$npm_container" sh -c '
  touch /data/nginx/custom/http.conf
  grep -Fqx "include /data/nginx/custom/sites/*.conf;" /data/nginx/custom/http.conf || \
    printf "\ninclude /data/nginx/custom/sites/*.conf;\n" >> /data/nginx/custom/http.conf
  nginx -t
  nginx -s reload
'

docker exec "$npm_container" certbot certonly --webroot --non-interactive --agree-tos \
  --email "$ACME_EMAIL" \
  --webroot-path "$acme_root" \
  --cert-name polaris-ai.work \
  -d polaris-ai.work -d www.polaris-ai.work

docker cp "$final_template" "$npm_container:/tmp/polaris-ai.work.npm.conf"
docker exec "$npm_container" sh -c \
  "sed 's#__ORIGIN_UPSTREAM__#${origin_upstream}#g' /tmp/polaris-ai.work.npm.conf > '$site_config'"
docker exec "$npm_container" nginx -t
docker exec "$npm_container" nginx -s reload

install -m 0755 "$repository_root/deploy/renew-npm-edge-origin.sh" /usr/local/sbin/polaris-renew-npm-edge-origin
install -m 0644 "$repository_root/deploy/polaris-renew-npm-edge-origin.service" /etc/systemd/system/polaris-renew-npm-edge-origin.service
install -m 0644 "$repository_root/deploy/polaris-renew-npm-edge-origin.timer" /etc/systemd/system/polaris-renew-npm-edge-origin.timer
systemctl daemon-reload
systemctl enable --now polaris-renew-npm-edge-origin.timer

#!/usr/bin/env bash
set -euo pipefail

npm_container="${NPM_CONTAINER:-nginx-app}"
docker exec "$npm_container" certbot renew --webroot-path /data/letsencrypt-acme-challenge
docker exec "$npm_container" nginx -t
docker exec "$npm_container" nginx -s reload

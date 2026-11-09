#!/usr/bin/env bash
# Publish a branch preview under https://polaris-ai.work/<name>/ without touching nginx.
#
#   deploy/preview.sh <name> [source-directory]
#
# The preview is built into $site_root/previews/<name> (marked noindex) and linked into the
# current release as <name>/. release.sh re-creates these links on every production release.
set -euo pipefail

name="${1:?Usage: preview.sh <name> [source-directory]}"
source_directory="${2:-$PWD}"
site_root="$(realpath "${POLARIS_SITE_ROOT:-/srv/polaris-landing}")"
preview_root="$site_root/previews"
current_link="$site_root/current"

if [[ ! "$name" =~ ^[a-z0-9][a-z0-9-]{0,30}$ ]]; then
  echo "Refusing an invalid preview name." >&2
  exit 1
fi
if [[ ! -L "$current_link" ]]; then
  echo "No current production release to attach the preview to." >&2
  exit 1
fi

public_entries=(assets blog checkout-return contact release-notes entry fonts icons support vendor
  index.html privacy.html terms.html safety.html refund.html support-config.js)

install -d -m 0755 "$preview_root"
staging="$(mktemp -d "$preview_root/.staging-$name.XXXXXX")"
trap 'rm -rf "$staging"' EXIT
for entry in "${public_entries[@]}"; do
  [[ -e "$source_directory/$entry" ]] || { echo "Expected public entry is missing: $entry" >&2; exit 1; }
  rsync -a "$source_directory/$entry" "$staging/"
done

# Previews must never compete with production in search results.
find "$staging" -name '*.html' -print0 | xargs -0 perl -0pi -e '
  s{<meta name="robots" content="[^"]*">}{<meta name="robots" content="noindex,nofollow">}g
    or s{<head>}{<head>\n  <meta name="robots" content="noindex,nofollow">};
'
chmod -R a+rX "$staging"

target="$preview_root/$name"
if [[ -e "$target" ]]; then
  mv "$target" "$target.old"
fi
mv "$staging" "$target"
trap - EXIT
rm -rf "$target.old"

ln -sfn "$target" "$(realpath "$current_link")/$name"
echo "Preview published: /$name/"

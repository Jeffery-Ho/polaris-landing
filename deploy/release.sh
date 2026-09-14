#!/usr/bin/env bash
set -euo pipefail

commit_sha="${1:?Usage: release.sh <40-character-commit-sha> [source-directory]}"
source_directory="${2:-$PWD}"
site_root="${POLARIS_SITE_ROOT:-/srv/polaris-landing}"
release_root="$site_root/releases"
current_link="$site_root/current"

if [[ ! "$commit_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Refusing an invalid commit SHA." >&2
  exit 1
fi

if [[ ! -f "$source_directory/index.html" ]]; then
  echo "The source directory does not contain index.html." >&2
  exit 1
fi

install -d -m 0755 "$release_root"
site_root="$(realpath "$site_root")"
release_root="$site_root/releases"
current_link="$site_root/current"
release_directory="$release_root/$commit_sha"
previous_release=""

if [[ -L "$current_link" ]]; then
  previous_release="$(realpath "$current_link")"
fi

prune_releases() {
  local candidate

  for candidate in "$release_root"/*; do
    [[ -d "$candidate" ]] || continue
    [[ "$(basename "$candidate")" =~ ^[0-9a-f]{40}$ ]] || continue
    [[ "$candidate" == "$release_directory" || "$candidate" == "$previous_release" ]] && continue
    rm -rf -- "$candidate"
  done
}

switch_current_release() {
  ln -sfn "$release_directory" "$current_link.new"
  node -e 'require("node:fs").renameSync(process.argv[1], process.argv[2])' \
    "$current_link.new" "$current_link"
}

if [[ -e "$release_directory" ]]; then
  switch_current_release
  prune_releases
  exit 0
fi

staging_directory="$(mktemp -d "$release_root/.staging-${commit_sha}.XXXXXX")"
cleanup() {
  rm -rf "$staging_directory"
}
trap cleanup EXIT

public_entries=(
  assets
  entry
  fonts
  icons
  support
  vendor
  index.html
  privacy.html
  robots.txt
  sitemap.xml
  support-config.js
)

for entry in "${public_entries[@]}"; do
  if [[ ! -e "$source_directory/$entry" ]]; then
    echo "Expected public entry is missing: $entry" >&2
    exit 1
  fi
  rsync -a "$source_directory/$entry" "$staging_directory/"
done

mv "$staging_directory" "$release_directory"
trap - EXIT
switch_current_release
prune_releases

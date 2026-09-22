#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this runner installation script as root." >&2
  exit 1
fi

: "${RUNNER_VERSION:?Set RUNNER_VERSION to the approved GitHub Actions runner version.}"
: "${RUNNER_SHA256:?Set RUNNER_SHA256 to the approved Linux x64 archive checksum.}"

runner_user="polaris-deploy"
runner_home="/home/$runner_user/actions-runner"
runner_cache_dir="${RUNNER_CACHE_DIR:-/var/cache/polaris-runner}"
runner_archive="$runner_cache_dir/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
runner_url="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

id "$runner_user" &>/dev/null || {
  echo "Run bootstrap-ecs.sh before installing the runner." >&2
  exit 1
}

install -d -m 0755 "$runner_cache_dir"

if ! echo "$RUNNER_SHA256  $runner_archive" | sha256sum --check --status 2>/dev/null; then
  curl_args=(
    --fail
    --location
    --retry 10
    --retry-delay 5
    --continue-at -
    --output "$runner_archive"
  )
  if curl --help all 2>/dev/null | grep -q -- "--retry-all-errors"; then
    curl_args+=(--retry-all-errors)
  fi
  curl "${curl_args[@]}" "$runner_url"
  echo "$RUNNER_SHA256  $runner_archive" | sha256sum --check --status
fi

if [[ "${RUNNER_DOWNLOAD_ONLY:-0}" == "1" ]]; then
  echo "Runner archive downloaded and verified: $runner_archive"
  exit 0
fi

: "${RUNNER_TOKEN:?Set RUNNER_TOKEN to a fresh repository runner registration token.}"

if [[ -e "$runner_home" ]]; then
  echo "Runner directory already exists: $runner_home" >&2
  exit 1
fi

install -d -o "$runner_user" -g "$runner_user" -m 0755 "$runner_home"
tar -xzf "$runner_archive" --directory "$runner_home"
"$runner_home/bin/installdependencies.sh"

runuser -u "$runner_user" -- "$runner_home/config.sh" \
  --unattended \
  --url https://github.com/Jeffery-Ho/polaris-landing \
  --token "$RUNNER_TOKEN" \
  --name polaris-landing-ecs \
  --labels self-hosted,linux,x64,polaris-landing \
  --work "$runner_home/_work"

"$runner_home/svc.sh" install "$runner_user"
"$runner_home/svc.sh" start

#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this runner installation script as root." >&2
  exit 1
fi

: "${RUNNER_TOKEN:?Set RUNNER_TOKEN to a fresh repository runner registration token.}"
: "${RUNNER_VERSION:?Set RUNNER_VERSION to the approved GitHub Actions runner version.}"
: "${RUNNER_SHA256:?Set RUNNER_SHA256 to the approved Linux x64 archive checksum.}"

runner_user="polaris-deploy"
runner_home="/home/$runner_user/actions-runner"
runner_archive="/tmp/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
runner_url="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

id "$runner_user" &>/dev/null || {
  echo "Run bootstrap-ecs.sh before installing the runner." >&2
  exit 1
}

if [[ -e "$runner_home" ]]; then
  echo "Runner directory already exists: $runner_home" >&2
  exit 1
fi

curl --fail --location --retry 3 --output "$runner_archive" "$runner_url"
echo "$RUNNER_SHA256  $runner_archive" | sha256sum --check --status

install -d -o "$runner_user" -g "$runner_user" -m 0755 "$runner_home"
tar -xzf "$runner_archive" --directory "$runner_home"
rm -f "$runner_archive"
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

#!/usr/bin/env bash

# This script is installed outside the repository as root. The restricted
# deployment account may call it through sudo only to activate one validated
# release path below /srv/greenmarket/releases.

set -Eeuo pipefail

readonly APP_ROOT="/srv/greenmarket"
readonly CURRENT_LINK="${APP_ROOT}/current"
readonly RELEASES_DIR="${APP_ROOT}/releases"
readonly SERVICE_NAME="greenmarket-staging.service"
readonly SYSTEMCTL_BIN="/usr/bin/systemctl"

if (( $# != 1 )); then
  echo "Exactly one release path is required." >&2
  exit 64
fi

candidate_release="$(readlink -f -- "$1")"
if [[ ! -d "$candidate_release" || "$(dirname -- "$candidate_release")" != "$RELEASES_DIR" ]]; then
  echo "Refusing to activate a release outside the allowed directory." >&2
  exit 64
fi

for required_file in package.json package-lock.json .node-version scripts/start-production.ts .next/BUILD_ID; do
  if [[ ! -f "${candidate_release}/${required_file}" ]]; then
    echo "Candidate release is missing a required build artifact." >&2
    exit 65
  fi
done

next_link="${APP_ROOT}/.current.next"
rm -f -- "$next_link"
ln -s -- "$candidate_release" "$next_link"
mv -Tf -- "$next_link" "$CURRENT_LINK"

"$SYSTEMCTL_BIN" restart "$SERVICE_NAME"

#!/usr/bin/env bash

# This script is installed outside the repository as a root-owned forced SSH
# command for the staging deploy account. It accepts only a source archive on
# standard input and never evaluates a command supplied by the SSH client.

set -Eeuo pipefail

readonly APP_ROOT="/srv/greenmarket"
readonly CURRENT_LINK="${APP_ROOT}/current"
readonly RELEASES_DIR="${APP_ROOT}/releases"
readonly INCOMING_DIR="${APP_ROOT}/incoming"
readonly APP_READ_GROUP="greenmarket-deploy"
readonly NPM_BIN="/usr/local/bin/npm"
readonly ACTIVATE_BIN="/usr/local/libexec/greenmarket-staging-activate"
readonly CURL_BIN="/usr/bin/curl"
readonly MAX_ARCHIVE_BYTES=$((32 * 1024 * 1024))
readonly MAX_ARCHIVE_FILES=20000
readonly MAX_EXTRACTED_BYTES=$((256 * 1024 * 1024))
readonly RELEASE_RETENTION_COUNT=5

export PATH="/usr/local/bin:/usr/bin:/bin"
umask 027

if [[ -n "${SSH_ORIGINAL_COMMAND:-}" ]]; then
  echo "Remote commands are not permitted for this account." >&2
  exit 64
fi

for required_path in "$APP_ROOT" "$RELEASES_DIR" "$INCOMING_DIR" "$NPM_BIN" "$ACTIVATE_BIN" "$CURL_BIN"; do
  if [[ ! -e "$required_path" ]]; then
    echo "Required deployment path is unavailable." >&2
    exit 70
  fi
done

if [[ ! -d "$RELEASES_DIR" ]]; then
  echo "Release directory is unavailable." >&2
  exit 70
fi

exec 9>"${INCOMING_DIR}/.staging-deploy.lock"
if ! flock -n 9; then
  echo "Another staging deployment is already running." >&2
  exit 75
fi

incoming_archive="$(mktemp "${INCOMING_DIR}/archive.XXXXXXXXXX")"
release_dir=""
previous_release=""
release_activated=false

cleanup() {
  rm -f -- "$incoming_archive"

  if [[ "$release_activated" != true && -n "$release_dir" && -d "$release_dir" ]]; then
    case "$(readlink -f -- "$release_dir")" in
      "${RELEASES_DIR}"/release.*)
        rm -rf --one-file-system -- "$release_dir"
        ;;
    esac
  fi
}

trap cleanup EXIT

if ! timeout --foreground 120s bash -c 'ulimit -f 262144; cat > "$1"' -- "$incoming_archive"; then
  echo "Unable to receive the release archive." >&2
  exit 65
fi

archive_size="$(stat --format=%s -- "$incoming_archive")"
if ((archive_size == 0 || archive_size > MAX_ARCHIVE_BYTES)); then
  echo "Release archive size is outside the allowed limit." >&2
  exit 65
fi

if ! tar --list --gzip --file "$incoming_archive" >/dev/null; then
  echo "Release archive is invalid." >&2
  exit 65
fi

if ! tar --list --verbose --numeric-owner --gzip --file "$incoming_archive" \
  | awk -v max_size="$MAX_EXTRACTED_BYTES" '
      $1 !~ /^[-d]/ || $3 !~ /^[0-9]+$/ { exit 1 }
      {
        total += $3
        if (total > max_size) {
          exit 1
        }
      }
    '; then
  echo "Release archive contains an unsupported entry or exceeds the unpacked size limit." >&2
  exit 65
fi

archive_file_count=0
while IFS= read -r archive_path; do
  archive_path="${archive_path#./}"
  [[ -z "$archive_path" || "$archive_path" == "." ]] && continue

  ((archive_file_count += 1))
  if ((archive_file_count > MAX_ARCHIVE_FILES)); then
    echo "Release archive contains too many files." >&2
    exit 65
  fi

  case "$archive_path" in
    /* | ../* | */../* | .. | */..)
      echo "Release archive contains an unsafe path." >&2
      exit 65
      ;;
    .deploy | .deploy/* | .env | .env.* | .git | .git/* | .github | .github/* | .next | .next/* | data/import | data/import/* | dist | dist/* | node_modules | node_modules/* | ops | ops/*)
      echo "Release archive contains a prohibited path." >&2
      exit 65
      ;;
  esac
done < <(tar --list --gzip --file "$incoming_archive")

release_dir="$(mktemp --directory "${RELEASES_DIR}/release.XXXXXXXXXX")"
if ! tar \
  --extract \
  --gzip \
  --file "$incoming_archive" \
  --directory "$release_dir" \
  --no-same-owner \
  --no-same-permissions \
  --delay-directory-restore; then
  echo "Unable to extract the release archive." >&2
  exit 65
fi

if find "$release_dir" -xdev -type l -print -quit | grep -q .; then
  echo "Release archive contains a link." >&2
  exit 65
fi

for required_file in package.json package-lock.json .node-version scripts/start-production.ts; do
  if [[ ! -f "${release_dir}/${required_file}" ]]; then
    echo "Release archive is missing a required file." >&2
    exit 65
  fi
done

if find "$release_dir" -type f \( -name '.env' -o -name '.env.*' \) -print -quit | grep -q .; then
  echo "Release archive contains an environment file." >&2
  exit 65
fi

(
  cd "$release_dir"
  "$NPM_BIN" ci --ignore-scripts --no-audit --fund=false
  "$NPM_BIN" run build
)

chgrp -R "$APP_READ_GROUP" -- "$release_dir"
chmod -R u=rwX,g=rX,o= -- "$release_dir"

if [[ -L "$CURRENT_LINK" ]]; then
  previous_release="$(readlink -- "$CURRENT_LINK")"
  case "$previous_release" in
    "${RELEASES_DIR}"/*)
      if [[ ! -d "$previous_release" ]]; then
        echo "Current release target is unavailable." >&2
        exit 70
      fi
      ;;
    *)
      echo "Current release path is outside the releases directory." >&2
      exit 70
      ;;
  esac
fi

rollback() {
  if [[ -z "$previous_release" ]] || ! sudo -n "$ACTIVATE_BIN" "$previous_release"; then
    return 1
  fi

  for rollback_attempt in $(seq 1 12); do
    if "$CURL_BIN" --fail --silent --show-error --max-time 5 http://127.0.0.1:3000/api/health | grep -qx '{"status":"ok"}'; then
      release_activated=false
      return 0
    fi

    sleep 2
  done

  return 1
}

prune_old_releases() {
  local release_record
  local release_path
  local retained_count=0

  while IFS= read -r -d '' release_record; do
    release_path="${release_record#* }"

    if [[ "$release_path" == "$release_dir" || "$release_path" == "$previous_release" ]]; then
      continue
    fi

    if [[ "$(stat --format=%U -- "$release_path")" != "$USER" ]]; then
      continue
    fi

    ((retained_count += 1))
    if ((retained_count <= RELEASE_RETENTION_COUNT)); then
      continue
    fi

    case "$(readlink -f -- "$release_path")" in
      "${RELEASES_DIR}"/release.*)
        rm -rf --one-file-system -- "$release_path"
        ;;
      *)
        echo "Refusing to prune an unexpected release path." >&2
        exit 70
        ;;
    esac
  done < <(
    find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -name 'release.*' -printf '%T@ %p\0' \
      | sort -znr
  )
}

if ! sudo -n "$ACTIVATE_BIN" "$release_dir"; then
  if rollback; then
    echo "Staging service activation failed. The previous release was restored." >&2
  else
    release_activated=true
    echo "Staging service activation and rollback failed. Manual recovery is required." >&2
  fi
  exit 70
fi

release_activated=true

for attempt in $(seq 1 12); do
  if "$CURL_BIN" --fail --silent --show-error --max-time 5 http://127.0.0.1:3000/api/health | grep -qx '{"status":"ok"}'; then
    prune_old_releases
    echo "Staging release activated."
    exit 0
  fi

  sleep 2
done

if rollback; then
  echo "Staging health check failed. The previous release was restored." >&2
else
  release_activated=true
  echo "Staging health check and rollback failed. Manual recovery is required." >&2
fi
exit 70

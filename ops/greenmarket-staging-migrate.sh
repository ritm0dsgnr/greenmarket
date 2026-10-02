#!/usr/bin/env bash

# Root-owned helper. The restricted deploy account may invoke it only through
# sudoers after SSH ForceCommand accepts the literal command "migrate".
# DATABASE_URL is read from the staging EnvironmentFile and never printed.

set -Eeuo pipefail

readonly APP_ROOT="/srv/greenmarket"
readonly CURRENT_LINK="${APP_ROOT}/current"
readonly BACKUP_DIR="${APP_ROOT}/backups"
readonly ENV_FILE="/etc/greenmarket/staging.env"
readonly SERVICE_NAME="greenmarket-staging.service"
readonly APP_USER="greenmarket"
readonly NPM_BIN="/usr/local/bin/npm"
readonly PSQL_BIN="/usr/bin/psql"
readonly PG_DUMP_BIN="/usr/bin/pg_dump"
readonly PG_ISREADY_BIN="/usr/bin/pg_isready"
readonly PG_RESTORE_BIN="/usr/bin/pg_restore"
readonly PYTHON_BIN="/usr/bin/python3"
readonly MAX_BACKUPS=10

export PATH="/usr/local/bin:/usr/bin:/bin"
umask 027

if (( EUID != 0 )); then
  echo "Staging migrate must run as root." >&2
  exit 64
fi

for required_path in \
  "$APP_ROOT" \
  "$CURRENT_LINK" \
  "$ENV_FILE" \
  "$NPM_BIN" \
  "$PSQL_BIN" \
  "$PG_DUMP_BIN" \
  "$PG_ISREADY_BIN" \
  "$PG_RESTORE_BIN" \
  "$PYTHON_BIN"; do
  if [[ ! -e "$required_path" ]]; then
    echo "Required migrate path is unavailable: ${required_path}" >&2
    if [[ "$required_path" == "$ENV_FILE" ]]; then
      echo "Create ${ENV_FILE} with DATABASE_URL and APP_BASE_URL, then retry." >&2
    elif [[ "$required_path" == "$PG_DUMP_BIN" || "$required_path" == "$PSQL_BIN" ]]; then
      echo "PostgreSQL client tools are missing. Run ops/install-staging-postgres.sh as root, then retry." >&2
    fi
    exit 70
  fi
done

if [[ ! -L "$CURRENT_LINK" || ! -d "$CURRENT_LINK" ]]; then
  echo "No active staging release. Deploy staging from main first." >&2
  exit 70
fi

if [[ ! -f "${CURRENT_LINK}/package.json" || ! -d "${CURRENT_LINK}/db/migrations" ]]; then
  echo "Active release is missing package.json or db/migrations." >&2
  exit 70
fi

install --directory --owner=root --group=postgres --mode=0750 "$BACKUP_DIR"
exec 9>"${BACKUP_DIR}/.staging-migrate.lock"
if ! flock -n 9; then
  echo "Another staging migration is already running." >&2
  exit 75
fi

DATABASE_URL=""
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ -z "$line" || "$line" == \#* ]] && continue
  case "$line" in
    DATABASE_URL=*)
      DATABASE_URL="${line#DATABASE_URL=}"
      DATABASE_URL="${DATABASE_URL#\"}"
      DATABASE_URL="${DATABASE_URL%\"}"
      DATABASE_URL="${DATABASE_URL#\'}"
      DATABASE_URL="${DATABASE_URL%\'}"
      ;;
  esac
done < "$ENV_FILE"

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL is missing in ${ENV_FILE}." >&2
  exit 70
fi

case "$DATABASE_URL" in
  postgres://* | postgresql://*)
    ;;
  *)
    echo "DATABASE_URL must use the PostgreSQL protocol." >&2
    exit 65
    ;;
esac

# Parse once into libpq env vars. Avoid putting the password on argv.
eval "$("$PYTHON_BIN" - "$DATABASE_URL" <<'PY'
import shlex
import sys
from urllib.parse import unquote, urlparse

source = urlparse(sys.argv[1])
if source.scheme not in {"postgres", "postgresql"}:
    raise SystemExit("unsupported scheme")
if not source.hostname or not source.path or source.path == "/":
    raise SystemExit("incomplete database URL")

def emit(name: str, value: str) -> None:
    print(f"export {name}={shlex.quote(value)}")

emit("PGHOST", source.hostname)
emit("PGPORT", str(source.port or 5432))
emit("PGUSER", unquote(source.username or ""))
emit("PGPASSWORD", unquote(source.password or ""))
emit("PGDATABASE", unquote(source.path.lstrip("/")))
PY
)"

export DATABASE_URL

if ! "$PG_ISREADY_BIN" -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -t 10 >/dev/null 2>&1; then
  echo "Staging PostgreSQL is unreachable with the configured DATABASE_URL." >&2
  echo "Install and configure the staging database (ops/install-staging-postgres.sh), then retry Migrate staging." >&2
  exit 70
fi

if ! "$PSQL_BIN" -v ON_ERROR_STOP=1 -Atqc 'SELECT 1' >/dev/null; then
  echo "Staging PostgreSQL accepted the connection string but rejected a probe query." >&2
  exit 70
fi

backup_stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${BACKUP_DIR}/pre-migrate-${backup_stamp}.dump"
restore_db="greenmarket_restore_${backup_stamp}"

cleanup_restore_db() {
  sudo -u postgres /usr/bin/dropdb --if-exists "$restore_db" >/dev/null 2>&1 || true
}

trap cleanup_restore_db EXIT

echo "Creating pre-migrate backup."
if ! "$PG_DUMP_BIN" --format=custom --file="$backup_file"; then
  echo "Backup failed. Migration was not started." >&2
  rm -f -- "$backup_file"
  exit 70
fi
chmod 0640 -- "$backup_file"
chgrp postgres -- "$backup_file"

echo "Verifying backup restore into an isolated database."
if ! sudo -u postgres /usr/bin/createdb --owner="$PGUSER" "$restore_db"; then
  echo "Unable to create restore probe database. Migration was not started." >&2
  exit 70
fi

if ! sudo -u postgres env PGDATABASE="$restore_db" \
  "$PG_RESTORE_BIN" --no-owner --no-acl --dbname="$restore_db" "$backup_file" >/dev/null; then
  echo "Backup restore probe failed. Migration was not started." >&2
  exit 70
fi

cleanup_restore_db
trap - EXIT

echo "Applying migrations from the active release."
if ! sudo -u "$APP_USER" -H env \
  DATABASE_URL="$DATABASE_URL" \
  PGHOST="$PGHOST" \
  PGPORT="$PGPORT" \
  PGUSER="$PGUSER" \
  PGPASSWORD="$PGPASSWORD" \
  PGDATABASE="$PGDATABASE" \
  bash -c "cd \"$CURRENT_LINK\" && \"$NPM_BIN\" run db:up"; then
  echo "Migration failed. Restore from the latest dump in ${BACKUP_DIR} if the schema is inconsistent." >&2
  exit 70
fi

required_relations=(
  categories
  products
  product_offers
  catalog_import_jobs
  catalog_source_mappings
  catalog_import_rows
  media_files
  product_images
  catalog_change_audit
  pgmigrations
)

for relation_name in "${required_relations[@]}"; do
  found="$("$PSQL_BIN" -v ON_ERROR_STOP=1 -Atqc \
    "SELECT to_regclass('public.${relation_name}') IS NOT NULL")"
  if [[ "$found" != "t" ]]; then
    echo "Migration finished but required relation is missing: ${relation_name}" >&2
    exit 70
  fi
done

retained=0
while IFS= read -r old_backup; do
  [[ -z "$old_backup" ]] && continue
  retained=$((retained + 1))
  if ((retained <= MAX_BACKUPS)); then
    continue
  fi
  rm -f -- "$old_backup"
done < <(
  find "$BACKUP_DIR" -maxdepth 1 -type f -name 'pre-migrate-*.dump' -printf '%T@ %p\n' \
    | sort -nr \
    | while IFS= read -r line; do
        printf '%s\n' "${line#* }"
      done
)

if systemctl is-active --quiet "$SERVICE_NAME"; then
  systemctl try-reload-or-restart "$SERVICE_NAME"
fi

echo "Staging migration applied. Backup kept under ${BACKUP_DIR}."

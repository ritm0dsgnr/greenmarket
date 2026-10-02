#!/usr/bin/env bash

# Run as root on the staging VPS once, before the first Migrate staging workflow:
#   ops/install-staging-postgres.sh
#
# Creates a local PostgreSQL role/database for the application and an
# EnvironmentFile consumed by greenmarket-staging.service and the migrate helper.
# Does not print generated passwords.

set -Eeuo pipefail

readonly APP_USER="greenmarket"
readonly APP_GROUP="greenmarket"
readonly DB_NAME="greenmarket_staging"
readonly DB_ROLE="greenmarket_app"
readonly ENV_DIR="/etc/greenmarket"
readonly ENV_FILE="${ENV_DIR}/staging.env"
readonly SERVICE_NAME="greenmarket-staging.service"

if (( EUID != 0 )); then
  echo "Run this installer as root." >&2
  exit 64
fi

if ! getent passwd "$APP_USER" >/dev/null || ! getent group "$APP_GROUP" >/dev/null; then
  echo "The staging application user or group is unavailable." >&2
  exit 70
fi

export DEBIAN_FRONTEND=noninteractive

if ! command -v psql >/dev/null 2>&1; then
  apt-get update
  apt-get install -y postgresql postgresql-client
fi

if ! systemctl is-active --quiet postgresql; then
  systemctl enable --now postgresql
fi

install --directory --owner=root --group=root --mode=0750 "$ENV_DIR"

existing_database_url=false
if [[ -f "$ENV_FILE" ]] && grep -Eq '^DATABASE_URL=' "$ENV_FILE"; then
  existing_database_url=true
  echo "Existing ${ENV_FILE} already defines DATABASE_URL; leaving credentials unchanged."
fi

db_password=""
if [[ "$existing_database_url" != true ]]; then
  db_password="$(openssl rand -base64 48 | tr -d '\n=/+' | head -c 40)"
  if [[ ${#db_password} -lt 24 ]]; then
    echo "Unable to generate a database password." >&2
    exit 70
  fi
fi

if [[ "$existing_database_url" == true ]]; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_ROLE}') THEN
    RAISE EXCEPTION 'Role ${DB_ROLE} is missing while ${ENV_FILE} already exists. Fix credentials manually.';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_ROLE}'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}')\gexec
SQL
else
  sudo -u postgres psql -v ON_ERROR_STOP=1 \
    -v db_role="$DB_ROLE" \
    -v db_name="$DB_NAME" \
    -v db_password="$db_password" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'db_role', :'db_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'db_role')\gexec

SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'db_role', :'db_password')
WHERE EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'db_role')\gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_role')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db_name')\gexec
SQL
fi

sudo -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -v db_role="$DB_ROLE" <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
GRANT USAGE, CREATE ON SCHEMA public TO :"db_role";
SQL

if [[ "$existing_database_url" != true ]]; then
  app_base_url="https://stage.greenmarket96.ru"
  if [[ -f "$ENV_FILE" ]] && grep -Eq '^APP_BASE_URL=' "$ENV_FILE"; then
    app_base_url="$(awk -F= '/^APP_BASE_URL=/{print substr($0, length($1)+2); exit}' "$ENV_FILE")"
    app_base_url="${app_base_url#\"}"
    app_base_url="${app_base_url%\"}"
  fi

  umask 077
  cat > "$ENV_FILE" <<EOF
DATABASE_URL=postgresql://${DB_ROLE}:${db_password}@127.0.0.1:5432/${DB_NAME}
APP_BASE_URL=${app_base_url}
EOF
  chown "root:${APP_GROUP}" "$ENV_FILE"
  chmod 0640 "$ENV_FILE"
fi

if systemctl cat "$SERVICE_NAME" >/dev/null 2>&1; then
  if ! systemctl show -p EnvironmentFiles "$SERVICE_NAME" --value | grep -Fq "$ENV_FILE"; then
    echo "Add EnvironmentFile=-${ENV_FILE} to ${SERVICE_NAME}, then: systemctl daemon-reload && systemctl restart ${SERVICE_NAME}" >&2
  else
    systemctl try-reload-or-restart "$SERVICE_NAME"
  fi
fi

echo "Staging PostgreSQL bootstrap finished."
echo "Next: reinstall deploy helpers (ops/install-staging-deploy.sh), Deploy staging, then Migrate staging."

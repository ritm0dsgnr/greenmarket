#!/usr/bin/env bash

# Run as root on the staging VPS:
#   install-staging-deploy.sh 'ssh-ed25519 AAAA... github-actions-staging'
#
# The public key is intentionally supplied as an argument. The private key
# remains only in the GitHub staging environment secret.

set -Eeuo pipefail

readonly DEPLOY_USER="greenmarket-deploy"
readonly APP_USER="greenmarket"
readonly APP_GROUP="greenmarket"
readonly APP_ROOT="/srv/greenmarket"
readonly SCRIPT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly SSH_HARDENING_FILE="/etc/ssh/sshd_config.d/00-greenmarket-hardening.conf"
readonly SSH_DEPLOY_FILE="/etc/ssh/sshd_config.d/10-greenmarket-deploy.conf"
readonly RECEIVER_PATH="/usr/local/libexec/greenmarket-staging-deploy"
readonly ACTIVATOR_PATH="/usr/local/libexec/greenmarket-staging-activate"
readonly SUDOERS_PATH="/etc/sudoers.d/greenmarket-staging-deploy"

if (( EUID != 0 )); then
  echo "Run this installer as root." >&2
  exit 64
fi

if (( $# != 1 )) || [[ ! "$1" =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+\ [^[:space:]]+$ ]]; then
  echo "Pass exactly one valid ed25519 public key with a non-empty comment." >&2
  exit 64
fi

readonly DEPLOY_PUBLIC_KEY="$1"

for required_path in \
  "${SCRIPT_DIRECTORY}/staging-deploy-receiver.sh" \
  "${SCRIPT_DIRECTORY}/greenmarket-staging-activate.sh" \
  "${SCRIPT_DIRECTORY}/greenmarket-staging-deploy.sudoers" \
  "${SCRIPT_DIRECTORY}/sshd-greenmarket-deploy.conf" \
  "$APP_ROOT" \
  "$SSH_HARDENING_FILE"; do
  if [[ ! -e "$required_path" ]]; then
    echo "Required installation path is unavailable." >&2
    exit 70
  fi
done

if ! getent passwd "$APP_USER" >/dev/null || ! getent group "$APP_GROUP" >/dev/null; then
  echo "The staging application user or group is unavailable." >&2
  exit 70
fi

if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$DEPLOY_USER"
else
  usermod --shell /bin/bash "$DEPLOY_USER"
fi

usermod --gid "$DEPLOY_USER" "$DEPLOY_USER"
usermod --append --groups "$DEPLOY_USER" "$APP_USER"

chown "$APP_USER:$APP_GROUP" "$APP_ROOT"
chmod 0711 "$APP_ROOT"
install --directory --owner="$DEPLOY_USER" --group="$DEPLOY_USER" --mode=2770 \
  "${APP_ROOT}/incoming" \
  "${APP_ROOT}/releases"

install --directory --owner="$DEPLOY_USER" --group="$DEPLOY_USER" --mode=0700 \
  "/home/${DEPLOY_USER}/.ssh"
printf '%s\n' "$DEPLOY_PUBLIC_KEY" > "/home/${DEPLOY_USER}/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "/home/${DEPLOY_USER}/.ssh/authorized_keys"
chmod 0600 "/home/${DEPLOY_USER}/.ssh/authorized_keys"

install --directory --owner=root --group=root --mode=0755 /usr/local/libexec
install --owner=root --group=root --mode=0755 \
  "${SCRIPT_DIRECTORY}/staging-deploy-receiver.sh" \
  "$RECEIVER_PATH"
install --owner=root --group=root --mode=0755 \
  "${SCRIPT_DIRECTORY}/greenmarket-staging-activate.sh" \
  "$ACTIVATOR_PATH"
install --owner=root --group=root --mode=0440 \
  "${SCRIPT_DIRECTORY}/greenmarket-staging-deploy.sudoers" \
  "$SUDOERS_PATH"
install --owner=root --group=root --mode=0644 \
  "${SCRIPT_DIRECTORY}/sshd-greenmarket-deploy.conf" \
  "$SSH_DEPLOY_FILE"

if grep -qxF 'AllowUsers ops' "$SSH_HARDENING_FILE"; then
  sed -i 's/^AllowUsers ops$/AllowUsers ops greenmarket-deploy/' "$SSH_HARDENING_FILE"
elif ! grep -Eq '^AllowUsers .*\<greenmarket-deploy\>' "$SSH_HARDENING_FILE"; then
  echo "The SSH AllowUsers policy requires a manual update." >&2
  exit 70
fi

if ! visudo --check --file "$SUDOERS_PATH"; then
  exit 65
fi

if ! sshd -t; then
  rm -f -- "$SSH_DEPLOY_FILE"
  sshd -t
  exit 65
fi

systemctl reload ssh.service

echo "Restricted staging deploy access is installed."

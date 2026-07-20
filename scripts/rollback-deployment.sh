#!/usr/bin/env bash
set -Eeuo pipefail

: "${LIGHTHOUSE_HOST:?必须设置 LIGHTHOUSE_HOST}"
: "${LIGHTHOUSE_USER:?必须设置 LIGHTHOUSE_USER}"
: "${LIGHTHOUSE_PORT:?必须设置 LIGHTHOUSE_PORT}"
: "${LIGHTHOUSE_PATH:?必须设置 LIGHTHOUSE_PATH}"

if [[ "$LIGHTHOUSE_USER" == "root" ]]; then
  echo "LIGHTHOUSE_USER 不得为 root；请使用专用部署用户。" >&2
  exit 2
fi
if [[ "$LIGHTHOUSE_PATH" != "/var/www/qiuhai" ]]; then
  echo "LIGHTHOUSE_PATH 必须为 /var/www/qiuhai。" >&2
  exit 2
fi

REMOTE="${LIGHTHOUSE_USER}@${LIGHTHOUSE_HOST}"
SSH=(ssh -p "$LIGHTHOUSE_PORT")

PREVIOUS_RELEASE="$("${SSH[@]}" "$REMOTE" "find '${LIGHTHOUSE_PATH}/releases' -mindepth 1 -maxdepth 1 -type d -print | sort -r | sed -n '2p'")"
if [[ -z "$PREVIOUS_RELEASE" ]]; then
  echo "没有可回滚的上一版本。" >&2
  exit 1
fi

"${SSH[@]}" "$REMOTE" "ln -sfn '${PREVIOUS_RELEASE}' '${LIGHTHOUSE_PATH}/current.next' && mv -Tf '${LIGHTHOUSE_PATH}/current.next' '${LIGHTHOUSE_PATH}/current'"
echo "已回滚到：${PREVIOUS_RELEASE}"

if [[ -n "${HEALTHCHECK_URL:-}" ]]; then
  ./scripts/verify-deployment.sh "$HEALTHCHECK_URL"
fi

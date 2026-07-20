#!/usr/bin/env bash
set -Eeuo pipefail

URL="${1:-${HEALTHCHECK_URL:-https://qiuhai.net.cn}}"
EXPECTED_TEXT="${HEALTHCHECK_EXPECTED_TEXT:-秋海}"

BODY="$(curl --fail --silent --show-error --location --max-time 15 "$URL")"
if [[ "$BODY" != *"$EXPECTED_TEXT"* ]]; then
  echo "健康检查失败：页面未包含预期文本。" >&2
  exit 1
fi

echo "健康检查通过：${URL}"

#!/usr/bin/env bash
set -Eeuo pipefail

DRY_RUN="false"
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="true"
elif [[ -n "${1:-}" ]]; then
  echo "用法：$0 [--dry-run]" >&2
  exit 2
fi

export SITE_URL="${SITE_URL:-https://qiuhai.net.cn}"
export PUBLIC_INDEXING="${PUBLIC_INDEXING:-true}"
export PUBLIC_SHOW_PRODUCT_PURCHASE="${PUBLIC_SHOW_PRODUCT_PURCHASE:-false}"
export ICP_NUMBER="${ICP_NUMBER:-闽ICP备2026028446号-1}"
export ICP_URL="${ICP_URL:-https://beian.miit.gov.cn/}"
export PUBLIC_SECURITY_NUMBER="${PUBLIC_SECURITY_NUMBER:-}"
export PUBLIC_SECURITY_URL="${PUBLIC_SECURITY_URL:-}"

if [[ "$PUBLIC_INDEXING" != "true" ]]; then
  echo "正式部署必须保持 PUBLIC_INDEXING=true。" >&2
  exit 2
fi
if [[ "$PUBLIC_SHOW_PRODUCT_PURCHASE" != "false" ]]; then
  echo "首次上线必须保持 PUBLIC_SHOW_PRODUCT_PURCHASE=false。" >&2
  exit 2
fi

npm run check
npm test
npm run build

if [[ "$DRY_RUN" == "true" ]]; then
  echo "dry-run 完成：本地验证与构建通过，未连接或修改远端服务器。"
  exit 0
fi

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

RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"
REMOTE="${LIGHTHOUSE_USER}@${LIGHTHOUSE_HOST}"
RELEASE_PATH="${LIGHTHOUSE_PATH}/releases/${RELEASE_ID}"
SSH=(ssh -p "$LIGHTHOUSE_PORT")

"${SSH[@]}" "$REMOTE" "mkdir -p '${RELEASE_PATH}'"
rsync -az --delete -e "ssh -p ${LIGHTHOUSE_PORT}" dist/ "${REMOTE}:${RELEASE_PATH}/"
"${SSH[@]}" "$REMOTE" "ln -sfn '${RELEASE_PATH}' '${LIGHTHOUSE_PATH}/current.next' && mv -Tf '${LIGHTHOUSE_PATH}/current.next' '${LIGHTHOUSE_PATH}/current'"

if ! ./scripts/verify-deployment.sh "${HEALTHCHECK_URL:-https://qiuhai.net.cn}"; then
  echo "健康检查失败；旧 release 已保留。确认后可运行 ./scripts/rollback-deployment.sh 回滚。" >&2
  exit 1
fi

echo "部署完成：${RELEASE_ID}"

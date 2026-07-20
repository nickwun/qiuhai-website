#!/usr/bin/env bash
set -Eeuo pipefail

MODE="dry-run"
DEPLOY_USER="qiuhai-deploy"
SSH_PORT="22"
WEB_ROOT="/var/www/qiuhai"

usage() {
  cat <<'EOF'
用法：server-bootstrap.sh [--dry-run | --apply] [--deploy-user USER] [--ssh-port PORT]

默认与 --dry-run 相同，只输出 Ubuntu 24.04 服务器初始化计划。
只有显式传入 --apply 才会修改当前服务器；脚本不会连接远程主机。
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --apply)
      MODE="apply"
      shift
      ;;
    --deploy-user)
      [[ -n "${2:-}" ]] || { echo "--deploy-user 需要用户名" >&2; exit 2; }
      DEPLOY_USER="$2"
      shift 2
      ;;
    --ssh-port)
      [[ -n "${2:-}" ]] || { echo "--ssh-port 需要端口" >&2; exit 2; }
      SSH_PORT="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      exit 2
      ;;
  esac
done

[[ "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || { echo "部署用户名格式无效" >&2; exit 2; }
[[ "$DEPLOY_USER" != "root" ]] || { echo "部署用户不得为 root" >&2; exit 2; }
[[ "$SSH_PORT" =~ ^[0-9]+$ ]] || { echo "SSH 端口必须是数字" >&2; exit 2; }
(( SSH_PORT >= 1 && SSH_PORT <= 65535 )) || { echo "SSH 端口超出范围" >&2; exit 2; }

print_plan() {
  cat <<EOF
server bootstrap dry-run（Ubuntu 24.04 LTS）
- 安装或检查：nginx rsync curl ufw
- 创建非 root 部署用户：${DEPLOY_USER}
- 创建发布目录：${WEB_ROOT}/releases
- 目录权限：${DEPLOY_USER}:${DEPLOY_USER}，0755；Nginx 仅需读取
- UFW 入站允许：${SSH_PORT}/tcp（SSH）、80/tcp（HTTP）、443/tcp（HTTPS）
- Nginx 安装后保持停止，不公开默认站点或正式域名
- 不写入私钥、密码或 authorized_keys
- 不安装 Docker、数据库、宝塔或 Node 服务
- 不修改 DNS，不申请 HTTPS 证书
dry-run 完成：未执行任何系统修改，也未连接远程服务器。
EOF
}

if [[ "$MODE" == "dry-run" ]]; then
  print_plan
  exit 0
fi

if [[ "$EUID" -ne 0 ]]; then
  echo "--apply 必须由服务器管理员使用 sudo 在目标 Ubuntu 服务器本机执行" >&2
  exit 1
fi

if [[ ! -r /etc/os-release ]]; then
  echo "无法确认操作系统；仅支持 Ubuntu 24.04 LTS" >&2
  exit 1
fi

# shellcheck disable=SC1091
source /etc/os-release
if [[ "${ID:-}" != "ubuntu" || "${VERSION_ID:-}" != "24.04" ]]; then
  echo "检测到 ${PRETTY_NAME:-未知系统}；仅支持 Ubuntu 24.04 LTS" >&2
  exit 1
fi

if [[ -n "${SSH_CONNECTION:-}" ]]; then
  ACTIVE_SSH_PORT="$(awk '{print $4}' <<<"$SSH_CONNECTION")"
  if [[ "$ACTIVE_SSH_PORT" != "$SSH_PORT" ]]; then
    echo "当前 SSH 连接端口为 ${ACTIVE_SSH_PORT}，与 --ssh-port ${SSH_PORT} 不一致；为避免断开连接已停止" >&2
    exit 1
  fi
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends nginx rsync curl ufw

if ! getent passwd "$DEPLOY_USER" >/dev/null; then
  useradd --create-home --shell /bin/bash --user-group "$DEPLOY_USER"
fi
passwd -l "$DEPLOY_USER" >/dev/null

install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 0755 "$WEB_ROOT"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 0755 "$WEB_ROOT/releases"

# 避免安装包自动启动默认站点；备案和正式部署获批后再由管理员启用。
systemctl disable --now nginx

ufw default deny incoming
ufw default allow outgoing
ufw allow "${SSH_PORT}/tcp" comment "SSH"
ufw allow 80/tcp comment "HTTP"
ufw allow 443/tcp comment "HTTPS"
ufw --force enable

echo "服务器基础准备完成。Nginx 当前保持停止，请先配置部署用户公钥并复核 UFW："
ufw status verbose

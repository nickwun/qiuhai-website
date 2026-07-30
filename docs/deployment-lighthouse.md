# 腾讯云轻量应用服务器部署

当前默认生产方案是 Astro 静态构建后，通过 SSH 与 rsync 上传到腾讯云轻量应用服务器，再由 Nginx 提供静态页面。ICP备案尚未完成，本阶段只准备配置和脚本，不连接服务器、不部署正式域名。

## 服务器准备

服务器使用 Ubuntu 24.04 LTS。首次部署前由管理员手动完成：

1. 按 `docs/server-bootstrap.md` 先做 dry-run，再由管理员在服务器本机安装 Nginx、rsync、curl、ufw 并创建专用部署用户。
2. 创建 `/var/www/qiuhai/releases/`，授权部署用户写入。
3. 将 `deploy/nginx/qiuhai.net.cn.conf` 安装到 Nginx 站点配置并检查语法。
4. 配置部署用户 SSH 公钥并在独立终端验证；私钥、密码、主机地址都不得写入仓库。

推荐目录：

```text
/var/www/qiuhai/
├── current -> releases/<release-id>
└── releases/
    ├── <previous-release-id>/
    └── <release-id>/
```

## 本地配置

正式构建至少设置：

```bash
export SITE_URL=https://qiuhai.net.cn
export PUBLIC_INDEXING=false
export PUBLIC_SHOW_PRODUCT_PURCHASE=false
export ICP_NUMBER=闽ICP备2026028446号-1
export ICP_URL=https://beian.miit.gov.cn/
export PUBLIC_SECURITY_NUMBER=
export PUBLIC_SECURITY_URL=
```

部署连接只从当前 shell 环境读取：

```bash
export LIGHTHOUSE_HOST=your-server-host
export LIGHTHOUSE_USER=your-deploy-user
export LIGHTHOUSE_PORT=your-ssh-port
export LIGHTHOUSE_PATH=/var/www/qiuhai
```

上述站点、索引、购买入口和备案信息均为公开构建配置；项目以 `.env.example` 和部署脚本中的安全默认值为准。主机地址、用户名、SSH 端口、私钥和其他凭据仍不得写进脚本、README、提交的 `.env` 或命令历史。

`LIGHTHOUSE_USER` 必须是非 root 专用部署用户，`LIGHTHOUSE_PATH` 固定为 `/var/www/qiuhai`。

如同一台服务器还承担微信公众号发布节点，博客部署必须继续使用独立的 `qiuhai-deploy` 用户和 `/var/www/qiuhai`，不得读取、修改或重启 `wechat-publisher` 用户下的程序、凭据与临时目录。

## 验证、部署与回滚

先做不连接远端的完整演练：

```bash
./scripts/deploy-manual.sh --dry-run
```

备案完成且用户另行明确授权后，才执行实际部署：

```bash
HEALTHCHECK_URL=https://qiuhai.net.cn ./scripts/deploy-manual.sh
```

脚本依次运行类型检查、测试、生产构建，上传到新的 release 目录，原子切换 `current` 软链接，再执行 HTTP 健康检查。健康检查失败不会删除旧 release；按输出提示回滚：

```bash
./scripts/rollback-deployment.sh
```

也可独立检查：

```bash
./scripts/verify-deployment.sh https://qiuhai.net.cn
```

## Nginx 与 HTTPS

仓库配置只包含 HTTP 静态站点模板，采用裸域名为主、`www` 跳转到裸域名的策略。ICP备案完成、DNS 经人工确认后，再由管理员申请证书并增加 HTTPS `listen`、证书路径和 HTTP 到 HTTPS 跳转；本阶段不修改 DNS、不申请或启用证书。

## EdgeOne Pages

EdgeOne Pages 仅保留为 `future_optional_deployment`。它不是当前默认部署目标；若未来启用，构建命令仍为 `npm run build`，输出目录仍为 `dist/`。

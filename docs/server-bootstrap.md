# Ubuntu 24.04 服务器初始化

本文件用于腾讯云广州轻量应用服务器的预部署准备。当前 ICP 备案尚未完成，因此只准备系统依赖、非 root 部署用户、发布目录和防火墙；不部署网站、不启用 Nginx、不修改 DNS、不申请证书，也不开放搜索引擎索引。

## 安全边界

`scripts/server-bootstrap.sh` 只操作它所在的服务器本机，不包含主机地址，也不会主动执行 SSH、rsync 或其他远程命令。默认模式就是 dry-run；只有管理员在目标服务器上显式传入 `--apply` 才会修改系统。

脚本不会：

- 写入私钥、密码、Token 或 `authorized_keys`；
- 安装 Docker、数据库、宝塔或 Node 常驻服务；
- 上传 `dist/`、配置正式域名或启动 Nginx；
- 修改 DNS、申请 HTTPS 证书或开启网站索引。

## 本地预演

在开发电脑的仓库根目录执行：

```bash
bash -n scripts/server-bootstrap.sh
./scripts/server-bootstrap.sh --dry-run
```

默认执行同样不会修改本机：

```bash
./scripts/server-bootstrap.sh
```

## 服务器执行步骤

以下步骤需要用户通过腾讯云现有登录通道进入服务器后人工执行。本仓库不会自动连接服务器。

1. 确认系统为 Ubuntu 24.04 LTS，并确认实际 SSH 端口。不要猜测端口。
2. 将本脚本复制到服务器临时工作目录，先阅读内容并执行 dry-run。
3. 使用当前管理员账号运行：

```bash
sudo bash server-bootstrap.sh --dry-run --ssh-port <当前实际端口>
sudo bash server-bootstrap.sh --apply --ssh-port <当前实际端口>
```

如需其他部署用户名，可显式指定：

```bash
sudo bash server-bootstrap.sh --apply --deploy-user qiuhai-deploy --ssh-port <当前实际端口>
```

脚本会安装或检查 `nginx`、`rsync`、`curl`、`ufw`，创建 `qiuhai-deploy` 用户和以下目录：

```text
/var/www/qiuhai/
└── releases/
```

目录由部署用户拥有，权限为 `0755`，Nginx 的 `www-data` 用户只需要读取权限。Nginx 安装后会保持停止，避免默认页面通过公网 IP 长期公开。

## SSH 公钥与防火墙确认

脚本会先允许传入的 SSH 端口，再允许 HTTP 80 和 HTTPS 443，随后启用 UFW。若脚本检测到当前 SSH 会话使用的端口与 `--ssh-port` 不一致，会立即停止，不修改系统。

脚本不会替部署用户写入公钥。初始化完成后，用户需要通过现有管理员通道完成以下人工步骤：

1. 把本机部署公钥加入 `qiuhai-deploy` 用户，不复制私钥到服务器；
2. 在保留当前管理员会话的同时，新开终端验证部署用户公钥登录；
3. 执行 `sudo ufw status numbered`，确认没有非 SSH、HTTP、HTTPS 的多余入站允许规则；
4. 确认腾讯云控制台防火墙仍允许实际 SSH 端口，不删除现有应急登录通道。

在部署用户公钥登录验证成功前，不关闭当前管理员会话，也不删除任何既有 SSH 配置。

## 备案通过后的后续步骤

ICP 通过并获得单独部署授权后，再依次执行：

1. 将 `deploy/nginx/qiuhai.net.cn.conf` 安装到 `/etc/nginx/sites-available/`；
2. 创建站点软链接并运行 `sudo nginx -t`，但在静态文件上传前不启动服务；
3. 在本地设置服务器连接环境变量，运行 `./scripts/deploy-manual.sh --dry-run`；
4. 首次上传 release 并确认 `/var/www/qiuhai/current` 原子切换成功；
5. 人工修改 DNS；
6. DNS 生效后申请并配置 HTTPS 证书；
7. 验证 HTTPS、回滚和 404 页面；
8. 填写真实备案号后再评估把 `PUBLIC_INDEXING` 改为 `true`。

每一步都需要单独确认。备案通过本身不等于自动授权部署、修改 DNS、申请证书或开启索引。

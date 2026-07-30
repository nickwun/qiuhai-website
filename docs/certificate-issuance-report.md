# 秋海个人网站 HTTPS 证书签发报告

更新日期：2026-07-30

## 执行边界

- 本阶段只安装 Certbot、签发证书并验证自动续期
- 未安装 HTTPS Nginx 站点配置
- 未开放或监听 TCP 443
- 未配置 HTTP 跳转 HTTPS、`www` 跳转或 HSTS
- 未修改 DNS、腾讯云实例防火墙、UFW、SSH、网站 Release、搜索索引或产品购买入口
- 未修改、重启或读取微信公众号发布程序及其应用数据和凭据
- 报告不记录完整邮箱、公网 IP、SSH 信息、证书私钥或微信发布节点细节

## Git 基线

- 签发前 main Commit：`0bf8dad4d338`
- `HEAD` 与 `origin/main` 一致
- 签发前工作树 clean，不存在其他未跟踪文件
- 公网 HTTP 验收报告已通过 PR #5 和必需 CI 合并 main

## 执行前检查

- `CERTBOT_EMAIL`：本地环境已配置，仅检查非空，未输出具体值
- 根域名和 `www`：三个独立公共 DNS 解析器的结果均指向当前服务器
- 两个域名的公网 HTTP：首页均返回 200
- Nginx：配置检查通过，服务 active
- Certbot：签发前未安装
- apt Certbot 包：不存在
- `/etc/letsencrypt`：签发前不存在
- 同名证书：不存在
- UFW：保持 inactive
- HTTP 80：监听正常
- HTTPS 443：未监听

## Certbot 安装

- 安装来源：官方 Snap
- Snap channel：`latest/stable`
- Certbot 版本：`5.7.0`
- 命令入口：由 `/usr/local/bin/certbot` 指向 Snap 管理的命令
- apt Certbot 包：安装后仍不存在
- 未安装 DNS 插件或其他 Certbot 来源

## Nginx 签发前备份

- 已在服务器创建 root-only 配置备份目录
- 备份包括当前站点配置、启用链接状态、配置校验值和 `nginx -T` 脱敏摘要
- 备份目录权限：700
- 备份文件权限：600
- 签发前后站点配置校验值一致
- 启用链接目标未变化

## 证书签发

- 执行模式：`certbot certonly --nginx`
- 验证方式：Nginx HTTP-01
- Certificate Name：`qiuhai.net.cn`
- 覆盖域名：
  - `qiuhai.net.cn`
  - `www.qiuhai.net.cn`
- 密钥类型：ECDSA
- 签发结果：成功
- 证书状态：有效
- 到期时间：2026-10-28 02:34:56 UTC
- `fullchain.pem`：存在
- `privkey.pem`：存在
- 私钥文件权限：600，所有者为 root
- 未读取、输出或复制私钥内容

## 自动续期

- `certbot renew --dry-run`：成功
- 两个域名的模拟续期：成功
- 自动续期机制：Snap `snap.certbot.renew.timer`
- Timer：enabled、active
- Certbot Cron：0，没有创建重复 Cron

## 签发后复核

- `nginx -t`：通过
- Nginx：active
- Nginx HTTP 站点配置：与签发前一致
- 网站 `current`：仍指向原有 Release
- HTTP 80：继续监听
- HTTPS 443：仍未监听
- 根域名和 `www` 的公网 HTTP：首页均返回 200
- 直接 IP Catch-all：继续主动关闭连接，不返回站点内容
- ICP 备案号：正常
- 搜索索引：保持关闭，页面仍包含 `noindex, nofollow`
- 产品购买入口：保持关闭
- UFW：保持 inactive
- 微信公众号发布节点：用户、既有目录权限、Cron 和进程状态与签发前一致

## 结论与下一阶段门禁

证书签发和自动续期 dry-run 已通过，当前具备进入 HTTPS Nginx 配置阶段的技术条件。

仍需用户单独批准后才能执行：

1. 开放腾讯云实例防火墙 TCP 443。
2. 通过 Git PR 准备并验收 HTTPS Nginx 配置。
3. 安装配置并执行 `nginx -t`。
4. 配置 HTTP 跳转 HTTPS、`www` 跳转裸域名。
5. 进行公网 HTTPS、证书链、续期和页面验收。

本阶段未启用 HTTPS，网站当前仍只通过 HTTP 提供服务。

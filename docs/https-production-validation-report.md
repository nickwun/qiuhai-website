# 秋海个人网站 HTTPS 正式上线验收报告

更新日期：2026-07-30

## 执行边界

- 本阶段通过版本管理的 Nginx 模板启用 HTTPS，并完成服务器内部及公网验收
- 腾讯云实例防火墙的 HTTPS 规则由用户人工开放，本阶段未调用云 API
- 未修改 DNS、UFW、远程登录策略、网站 Release、搜索索引或产品购买入口
- 未修改、重启或读取微信公众号发布程序及其应用数据和凭据
- 未启用 HSTS、OCSP stapling、反向代理或自定义 cipher 配置
- 报告不记录完整邮箱、公网 IP、远程登录信息、私钥、本机密钥路径或微信发布节点敏感细节

## Git 与配置基线

- HTTPS 功能 Commit：`5ec0519`
- HTTPS 功能 PR：#7
- 合并后的 main Commit：`120b26cd734f`
- GitHub `check-test-build`：通过
- 本地验证：
  - `npm run check`：通过，0 错误、0 警告
  - `npm test`：通过，27 项测试
  - 响应式检查：40 个路由/视口组合通过
  - `npm run build`：通过，生成 13 个静态页面
- Nginx 契约测试覆盖 HTTP/HTTPS 跳转、未知 Host、证书路径和禁用项

## Nginx 安装

- 安装来源：合并后的 main 中的 `deploy/nginx/qiuhai.net.cn.conf`
- 安装前已创建 root-only HTTP 配置备份
- 备份不包含证书或私钥副本
- 安装后配置校验值与 main 模板一致
- 启用链接目标未变化
- `/etc/nginx/nginx.conf` 未修改
- `nginx -t`：通过
- Nginx：active
- HTTP 80：正常监听
- HTTPS 443：正常监听
- UFW：保持 inactive

## 跳转与规范域名

- `https://qiuhai.net.cn/`：HTTP 200
- `https://www.qiuhai.net.cn/`：HTTP 301 至裸域名
- `http://qiuhai.net.cn/`：HTTP 301 至裸域名 HTTPS
- `http://www.qiuhai.net.cn/`：HTTP 301 至裸域名 HTTPS
- 路径与 query string：四种入口均按规则保留
- 未知 HTTP Host：连接关闭，不展示网站
- 未知 HTTPS Host：完成 TLS 后关闭连接，不展示网站
- 直接 IP 的 HTTP 与 HTTPS 请求：不展示正式网站

## TLS 与证书

- Certificate Name：`qiuhai.net.cn`
- 证书覆盖：
  - `qiuhai.net.cn`
  - `www.qiuhai.net.cn`
- 证书链：标准 CA 信任验证通过
- 主机名：两个域名均匹配
- 有效期：2026-07-30 至 2026-10-28
- 默认协商：TLS 1.3
- TLS 1.2：可用
- TLS 1.3：可用
- TLS 1.1：拒绝
- HSTS：未启用

## 双外部环境公网检查

- 外部环境一：从本地公网链路直连当前服务器
  - 裸域名 HTTPS 200
  - `www` HTTPS 301
  - 证书链、主机名与 TLS 验证通过
  - 页面、图片与发现文件检查通过
- 外部环境二：独立公共远程 HTTP 探测服务
  - 裸域名 HTTPS 200
  - `www` HTTPS 301
  - `www` 的 Location 指向裸域名
- 三个独立公共 DNS 解析器的根域名和 `www` 记录一致

## 页面与内容验收

- 首页、文章列表、三篇正式文章：HTTP 200
- 五张正式文章图片：HTTP 200，PNG/JPEG 类型正确且内容非空
- RSS、Sitemap index、Sitemap、robots：HTTP 200
- RSS 与 Sitemap XML：解析通过
- 不存在的页面：HTTP 404，并显示自定义 404 内容
- sample 文章与 sample 预览路由：HTTP 404
- ICP 备案号及工信部链接：正常
- 搜索索引：保持关闭，页面包含 `noindex, nofollow`
- `robots.txt`：保持 `Disallow: /`
- 产品购买入口：保持关闭
- 低心率慢跑手册文章不显示购买二维码、按钮、支付链接或交易入口

## Certbot 续期复测

- Certbot：官方 Snap 5.7.0
- `certbot renew --dry-run`：成功
- Certbot 最新日志确认所有模拟续期成功
- 自动续期 timer：enabled、active
- 未创建重复 Certbot Cron
- 续期复测后：
  - Nginx 配置校验值仍与 main 一致
  - Nginx 配置检查通过，服务 active
  - 裸域名 HTTPS 仍为 200
  - `www` 仍正确跳转裸域名

## 隔离性复核

- 网站 Release 与 `current` 未变化
- 博客部署用户权限未变化
- 微信公众号发布节点的用户、目录权限、Cron、timers 和进程状态与变更前一致
- UFW 保持 inactive
- DNS 未修改
- 云防火墙除用户人工开放 HTTPS 外，本阶段未修改
- 搜索索引和产品购买入口保持关闭
- Certbot 自动续期 timer 保持 enabled、active

## 最终结论

`qiuhai.net.cn` 已完成 HTTPS Nginx 配置、服务器内部验收、公网双环境验收和 Certbot 续期复测。

当前没有发现阻断 HTTPS 正式访问的代码、证书、Nginx 或内容问题。网站已可通过规范裸域名 HTTPS 访问，同时继续保持搜索索引与产品购买入口关闭。

后续事项不属于本阶段：

- 取得真实公安备案号前，不显示公安备案区域
- 是否开启搜索索引需单独人工批准
- 是否恢复产品购买入口需单独人工批准，并重新评估备案与合规要求
- 暂不启用 HSTS，留待网站稳定运行后的独立安全加固任务

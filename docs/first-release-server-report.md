# 秋海个人网站首个静态 Release 与 HTTP 内部验收报告

更新日期：2026-07-30

## 执行边界

- 代码基线：受保护的 `main` Commit `d2ab9a8`
- 本阶段仅完成正式静态构建、首个 release 上传、`current` 原子切换、HTTP Nginx 站点安装和服务器内部验收
- 未修改腾讯云实例防火墙、DNS、HTTPS、UFW、SSH 策略、搜索索引或产品购买入口
- 未修改、重启或读取微信公众号发布程序及其应用数据和凭据

## 构建与 Release

- 正式构建环境：
  - `SITE_URL=https://qiuhai.net.cn`
  - `PUBLIC_INDEXING=false`
  - `PUBLIC_SHOW_PRODUCT_PURCHASE=false`
  - ICP 备案号和工信部链接使用已确认的正式配置
  - 公安备案号保持为空
- `npm ci`：通过
- `npm run check`：通过，0 错误、0 警告
- `npm test`：通过，27 项测试；响应式检查覆盖 40 个路由/视口组合
- `npm run build`：通过，生成 13 个静态页面
- Release 名称：`20260730T025336Z-d2ab9a8`
- Release 路径：`/var/www/qiuhai/releases/<release-name>`
- 上传文件数：25
- `current`：已原子指向本次 release
- 上一版本：无；这是服务器上的首个网站 release

## Nginx 状态

- 配置来源：`deploy/nginx/qiuhai.net.cn.conf`
- 配置方式：独立站点文件，未覆盖 `/etc/nginx/nginx.conf`
- 默认欢迎站点：已禁用
- `nginx -t`：通过
- 服务状态：`enabled`、`active`
- HTTP 80：服务器内部正在监听 IPv4 和 IPv6
- HTTPS 443：未监听
- 未知 Host：返回 444，不公开默认站点
- `qiuhai.net.cn` 与 `www.qiuhai.net.cn`：内部 Host 请求均正常返回

## 内部健康检查

- 首页、文章列表、三篇正式文章、专题、关于页、图片：HTTP 200
- `robots.txt`、RSS、Sitemap：HTTP 200，XML 可解析
- 不存在的页面：HTTP 404，并显示网站 404 内容
- sample、draft 与样例预览路由：均未进入公开站点
- 首页标题：包含“跑步写作手记”
- ICP 备案号：可见，链接指向工信部备案官网
- 搜索索引：保持关闭，页面包含 `noindex`
- 产品购买入口：保持关闭；不显示购买二维码、按钮或交易链接
- 中性说明：显示“购买入口将在网站正式上线后补充。”

## 权限与发布节点隔离

- `qiuhai-deploy`：
  - 独立博客公钥登录通过
  - 不属于 sudo 组
  - 可以写入 release 目录
  - 不能写入 Nginx 配置目录
  - 不能读取微信公众号发布用户目录
- 静态文件可由 `www-data` 读取
- 微信公众号发布节点初始化前后对比：
  - 用户与既有目录仍存在
  - Home、SSH、授权密钥及应用相关目录权限未变化
  - 用户 Cron 数量未变化
  - 用户进程数量未变化
  - systemd timers 数量未变化
- UFW：保持 `inactive`

## 当前外部访问状态与阻断项

- 代码、静态构建、release、Nginx 配置和服务器内部 HTTP 健康检查没有发现阻断问题
- 腾讯云实例防火墙的 HTTP 80 入站规则仍按本阶段要求保持关闭
- HTTPS 443 未开放，证书未申请
- DNS 未修改，也未验证域名解析
- 因此本报告只证明服务器内部验收通过，不代表网站已从公网正式上线

## 下一阶段人工确认

1. 确认进入 DNS 与公网 HTTP 验证阶段。
2. 在腾讯云实例防火墙中按确认后的步骤开放 HTTP 80。
3. 为根域名和 `www` 设置并核验 DNS 记录。
4. 公网 HTTP 验收通过后，再单独批准安装 Certbot、开放 HTTPS 443 和申请免费证书。
5. HTTPS、跳转和续期 dry-run 全部通过后，再进行正式上线验收。

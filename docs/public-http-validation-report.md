# 秋海个人网站公网 HTTP 验收报告

更新日期：2026-07-30

## 验收边界

- 本阶段仅执行公网 DNS 与 HTTP 只读检查
- 未修改服务器文件、Nginx 配置、DNS、腾讯云实例防火墙、UFW 或 SSH
- 未开放 443，未安装或申请 HTTPS 证书
- 未修改搜索索引、产品购买入口或微信公众号发布节点
- 报告不记录服务器公网 IP、SSH 信息、本机密钥路径或密钥内容

## DNS 检查

- 使用三个独立公共 DNS 解析器交叉检查
- `qiuhai.net.cn`：A 记录均指向当前服务器
- `www.qiuhai.net.cn`：A 记录均指向同一台当前服务器
- 本轮未修改任何 DNS 记录

## 公网 HTTP 状态

- `http://qiuhai.net.cn/`：HTTP 200
- `http://www.qiuhai.net.cn/`：HTTP 200
- 文章列表、三篇正式文章、专题、作品、关于和现在页：HTTP 200
- `robots.txt`、RSS、Sitemap index 与 Sitemap：HTTP 200
- 五张正式文章图片：HTTP 200，类型分别为有效的 PNG 或 JPEG，响应内容非空
- 不存在的页面：HTTP 404，并显示网站自定义 404 内容
- sample 文章路由与 sample 预览路由：HTTP 404

## Catch-all

- 直接使用服务器公网 IP 发起 HTTP 请求时，Nginx Catch-all 主动关闭连接且不返回站点内容
- 该行为对应 Nginx 配置中的 444；在 curl 中表现为状态 `000`
- 未发现通过直接 IP 访问默认欢迎页或正式网站内容的情况

## 内容与合规检查

- 首页标题：`秋海｜跑步写作手记`
- ICP 备案号：可见
- ICP 链接：指向工信部备案官网
- 搜索索引：保持关闭，页面包含 `noindex, nofollow`
- `robots.txt`：包含 `Disallow: /`
- 产品购买入口：保持关闭
- 低心率慢跑手册文章不显示购买二维码、购买按钮、支付链接或交易入口
- 中性说明仍为：“购买入口将在网站正式上线后补充。”
- RSS、Sitemap index 与 Sitemap：XML 解析通过

## 验收结论

公网 HTTP 只读验收通过，未发现阻断进入 HTTPS 准备阶段的 HTTP、内容或 Nginx Catch-all 问题。

当前仍不是完整的正式上线状态：

- HTTPS 443 尚未开放
- HTTPS 证书尚未申请
- HTTP 尚未跳转到 HTTPS
- `www` 当前通过 HTTP 直接返回 200，规范域名跳转应在后续 HTTPS 阶段统一验收
- 搜索索引和产品购买入口仍保持关闭

## 下一阶段人工门

等待用户单独批准 HTTPS 阶段后，方可执行：

1. 开放腾讯云实例防火墙 HTTPS 443。
2. 安装 Certbot 与 Nginx 插件。
3. 为根域名和 `www` 申请免费证书。
4. 配置 HTTP 跳转 HTTPS，并将 `www` 跳转到裸域名。
5. 执行 `nginx -t`、证书续期 dry-run 和公网 HTTPS 验收。

# U5 随笔迁移（2026 年 10 月）

## 授权和范围

- 基线：`8c52153e9a33e28ff6794b9d0d71c3e141cc0465`，开始时 main 与 origin/main 一致，工作树干净。
- 分支：`codex/migrate-u5-essays-2026-10`。
- 用户批准 5 篇、4 处改题，并明确要求所有正文及此前讨论的内容保留。本轮不执行之前建议的压缩、去上下文或事实改写。
- 用户简称 U5C 01、U5R 01、UL 01、UL 02，分别对应 U5-C01、U5-R01、U5-L01、U5-L02；U5-C02 原题不变。
- 除下列 5 篇及本报告，只调整既有测试的正式文章数量断言（18 → 23）；不修改检查规则。
- 完成迁移、验证及 PR 后等待最终确认。本轮不合并、不部署、不连接生产服务器。

## 元数据与日期

|candidate_id|标题|publishedAt|category|tags|slug|
|---|---|---|---|---|---|
|U5-C01|变成自己写下的样子|2026-09-25|creation|写作、 自我观察、长期记录|becoming-what-i-wrote|
|U5-R01|雨没有想象中那么大|2026-09-05|running|跑步、日常观察、雨天|less-rain-than-i-imagined|
|U5-L01|白头发|2026-09-20|life|普通生活、中年、自我观察|gray-hair|
|U5-C02|与空气的较量|2026-09-22|creation|公开写作、公众号、自我观察|wrestling-with-air|
|U5-L02|理发卡|2026-09-19|life|普通生活、消费选择、理发|haircut-card|

全部来源类型为 `human_final`；全部 `date_source: generated_date_proxy`。源文没有 created_at，沿用用户已批准的首次加入知识库日期规则，不声称是已核实的首次公开发布日期；后续有可靠首发证据时可单独修正。不是迁移日期。

全部 `featured=false`、`draft=false`、`sample=false`。没有可靠首发平台或原文链接证据，不设置 originalPlatform、originalUrl；无图片，不设置 cover；仅格式处理，不设置 updatedAt。description 仅概括源文，不把个人判断包装成平台规则、消费指导或健康建议。

|编号|相对来源|首次加入知识库的提交|
|---|---|---|
|U5-C01|05_Output/风格进化/human_final/我慢慢变成了自己写下的样子_human_final.md|4cf421afc7580465506c7f3690624f88471ed91f|
|U5-R01|05_Output/风格进化/human_final/跑出去以后才发现雨没有想象中那么大_human_final.md|6915bb005fb6b0cac8c1bc7ffe4f5a28ec9acf0b|
|U5-L01|05_Output/风格进化/human_final/白头发多起来以后_human_final.md|8899e60197153f011c35629fe7faf4eb99787012|
|U5-C02|05_Output/风格进化/human_final/与空气的较量_human_final.md|f1b907c2645bb966a6639804006807976f7f1ed9|
|U5-L02|05_Output/风格进化/human_final/700元的理发卡我还是不太放心_human_final.md|0d41febfc590ab34921d0328876aebd078a3be93|

## 标题与格式差异

1. U5-C01：“我慢慢变成了自己写下的样子” → “变成自己写下的样子”。源文无 H1。
2. U5-R01：“跑出去以后，才发现雨没有想象中那么大” → “雨没有想象中那么大”。移除旧题重复 H1。
3. U5-L01：“白头发多起来以后” → “白头发”。移除旧题重复 H1。
4. U5-C02：“与空气的较量”保持不变。源文无 H1。
5. U5-L02：“700 元的理发卡，我还是不太放心” → “理发卡”。移除旧题重复 H1。

仅在迁移副本移除内部 frontmatter（source、source_material、ai_original，以及适用文件的 article_no、title、status），适配网站 Schema。每个原文逻辑行保留为原段落，段间补空行；未按句拆段、合并段落或调整顺序。源文没有需要删除的图片、尾部提示或硬换行反斜杠。没有实施删减“昨天”“今天”或上一篇指代的建议。

- 实质新增句子：每篇 0，总计 0。
- 实质删除句子：每篇 0，总计 0。
- 段落顺序变化：每篇 0，总计 0。
- 新增正文小标题：0。
- 正文既有用词、标点、个人判断与上下文原样保留；不擅自纠错或添加免责声明。
- 每篇无图，未添加本地/网络图片、截图、二维码、购买链接或配图。
- 用户已确认前轮提出的公开边界及表述问题，按原文保留；这项授权不等于第三方事实已经独立核实。本报告不复制私人讨论或新增身份细节。

## 一致性证据

迁移前重新完整读取 5 篇；原始哈希与筛选时一致。以下归一化方法：移除 frontmatter 和重复 H1，Unicode NFKC 后去空白，保留文字和标点。另做更严格的逐段逐字比较：源文非空逻辑行与迁移稿段落完全一致，不仅比较去空白结果。

|编号|段数|归一化字数|源文和迁移稿共用的归一化 SHA-256|结果|
|---|---:|---:|---|---|
|U5-C01|16|1369|4071a232508ee97295335abfdca13bc5eca5bc653c5eeabf57b68984ac675bba|MATCH|
|U5-R01|12|878|3dd1ea6d2b9994d96224f8011f09df240426d3bc42fe4eeb3b7ed906ee79b9d7|MATCH|
|U5-L01|14|1179|305dc4f8d6b95caf0e5bb55da7872aca29f29aea39cda5d1e10a264d4629fc1f|MATCH|
|U5-C02|19|1573|fac5cb26a6f6cc7323219c80aa153d5b132851026ceca85bf94e68a26d3def5d|MATCH|
|U5-L02|16|1198|fd48dffcc439af43e1959aad3ef6adeae0f884fdd11f0b37c9aecc162a29c86f|MATCH|

|编号|源文件原始 SHA-256|迁移文件原始 SHA-256|
|---|---|---|
|U5-C01|0ab24276b25c61ae072c5b84485053f36bfb50974db1a0eddc4b59f519cf9e73|a0c96d0352048621d166371df1750f35a0802a7f814204947e4b03ea84cdff46|
|U5-R01|31279c90a628fedbf7fdc2a4b855962ea20d2b14904da8a2270f1624eef89996|2a1edb32c5b60cf777d7dca49d10934310d0eb64976fa87eb04ed9bbb7872416|
|U5-L01|d82136abfe6f0c869c87f066813ab652b81241791b5d455379556e908a85127f|9014133d71812542c5e36e202e582231627e390546e1f7af498ef9d26317909e|
|U5-C02|3acff079b402a98a24ab698454d96a1a7cc2488b9743cf711ba37d303f99f573|47fa5dc66f9703590f0ea34d6e226b194e057b0bf6448dba4580d8c08608a074|
|U5-L02|fad08d741773b546babd77ebc4a7aaf0a3de155b82c34cb74e38403f4f862de4|2f9089007eb0761ac8617dd5331be07a99d130fe6f297deeec69fa3b8cf96f17|

## 主题邻接

- U5-C01 与《跟过去的自己打了个照面》入口相邻；前者写行动逐渐接近写下的方向，后者写语言与表达边界的变化。本次不强化结论来制造差别。
- U5-R01 与《跑者的感受力》同为跑中观察；本篇集中于局部感受的覆盖范围，不是四季感受的再论述。
- U5-L01 补充此前未充分覆盖的外貌与中年日常；不扩写为健康知识。
- U5-C02 与《公开写作以后，不是每条评论都要回应》都涉及判断边界；此篇的事件对象是平台账号提示与申诉，不是评论者。
- U5-L02 与《东西是用来用的》同属消费生活；此篇写预付服务的不确定性，不是工具保护与使用。

## 预览与验证

|编号|本地预览 URL|
|---|---|
|U5-C01|http://127.0.0.1:4321/articles/becoming-what-i-wrote/|
|U5-R01|http://127.0.0.1:4321/articles/less-rain-than-i-imagined/|
|U5-L01|http://127.0.0.1:4321/articles/gray-hair/|
|U5-C02|http://127.0.0.1:4321/articles/wrestling-with-air/|
|U5-L02|http://127.0.0.1:4321/articles/haircut-card/|

- `npm ci`：完成，package.json 和 lockfile 未修改。既有依赖审计提示 11 项（1 moderate、9 high、1 critical，直接依赖 Astro 标为 critical）；未执行自动修复。本次内容变更未引入依赖变化，也不将测试通过表述为依赖安全问题已解决，建议单独评估修复。
- `npm run check`：通过，0 errors、0 warnings、0 hints。
- `npm test`：29/29 测试通过；自动公开内容检查 23 篇、无规则命中；索引/购买开关构建合约通过；原有响应式检查 40 组通过。
- `PUBLIC_INDEXING=true PUBLIC_SHOW_PRODUCT_PURCHASE=false npm run build`：通过，33 个静态页面。
- 新文章在 360、390、768、1440px 下逐篇检查，共 20 组：HTTP 200、标题/日期/标签正确、无横向滚动、无正文配图或新增小标题，ICP 与公安备案正常。浏览器渲染后的 77 段正文与迁移稿段落完整逐字一致，无 pageerror。
- 新文章均进入文章列表、各自分类、RSS、Sitemap（20 项查验通过）；canonical 为各自正式域名 URL；robots 允许索引，购买入口关闭；sample/draft 排除与百度验证文件、WebSite JSON-LD 检查由现有测试覆盖并通过。
- 5 篇页面已截图目视检查：桌面检查 U5-C01、U5-C02、U5-L01，移动端检查 U5-R01、U5-L02。段落、标题与页脚排版正常。
- 本地 preview 保留在 `127.0.0.1:4321` 供最终人工确认。PR 的远端 CI 状态以当前提交检查为准，不代表已生产部署。

首页结构、固定文案、推荐标记、WebSite JSON-LD、现在页、关于页、项目页、既有文章、样式及基础设施不在修改范围内。新增文章按原有规则进入最新文章列表，故不声称首页生成 HTML 字节不变。购买入口保持关闭。

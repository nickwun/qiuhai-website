# 内容迁移报告：Batch 02

## 批次范围

- 分支：`codex/migrate-kb-content-batch-02`
- 批准迁移：5 篇（running 1、creation 2、life 2）
- 未迁移：B2-R01、B2-C03、B2-C04、B2-R03、B2-L03、B2-L04
- B2-R01 状态：暂缓，不改为 reject
- 图片策略：5 篇源文均无图片，以纯文字发布；未生成配图，未从网络寻找图片。
- 原始平台字段：没有可核实的原始公开链接或首发平台，因此未设置 `originalPlatform` 和 `originalUrl`，避免把知识库代理日期或写作平台背景表述成已核实首发信息。

## B2-R02

- candidate_id: B2-R02
- 文章标题: 跑者的感受力
- 来源类型: 成稿
- 脱敏相对来源: `01_Raw/flomo/memos/写作-日耕-57.md`
- publishedAt: `2025-03-17`
- date_source: frontmatter_created
- category: running
- tags: 跑步、感受力、四季
- slug: `runners-sensitivity`
- 正文处理: 移除知识库 frontmatter、主题标签和源标题；补充 Markdown 段落空行；按批准范围压缩外部演讲和书籍引入。少年时期的课堂感受、书籍归因、月相、四季及跑步观察的推进均保留。
- 删除或压缩的具体内容:
  1. 删除外部演讲后续教学方法及对自己语文老师的推测性评价段落；
  2. 《幸得诸君慰平生》相关段落只保留书名和作者感受力的归因，删除短引语、吃土豆的转述细节；
  3. 删除书中物种名称和自己一目十行的旁支段落。
- 图片情况: 源文无图片；迁移后无图片和外部图片热链。
- 隐私检查: 未新增人物、学校、班级、路线或健康信息；自动高风险扫描无命中。
- 正文一致性结果: 目标正文是源正文的纯删除子序列；归一化后源文 1437 字符、目标 998 字符，删除 439 字符，没有插入或改写正文。
- 本地预览 URL: `http://127.0.0.1:4321/articles/runners-sensitivity/`
- 待人工确认: 请重点确认三处压缩是否仍保留原有课堂到跑步观察的节奏。

## B2-C01

- candidate_id: B2-C01
- 文章标题: 难事与麻烦事
- 来源类型: human_final
- 脱敏相对来源: `05_Output/风格进化/human_final/难事与麻烦事_human_final.md`
- publishedAt: `2026-08-01`（文档首次加入知识库日期，不代表已核实的首次公开发布日期）
- date_source: generated_date_proxy
- category: creation
- tags: 个人网站、AI 编程、内容资产
- slug: `hard-things-and-troublesome-things`
- 正文处理: 移除知识库 frontmatter 和重复一级标题；补充 Markdown 段落空行。没有改造成教程，没有添加工具、步骤、技术架构或 AI 泛化结论。
- 删除或压缩的具体内容: 仅删除知识库元数据和重复标题；正文无删除、压缩或改写。
- 图片情况: 源文无图片；迁移后无图片和外部图片热链。
- 隐私检查: 未新增账号、服务器信息、凭据或个人资料；正文只保留源文已有公开域名和备案经历；自动高风险扫描无命中。
- 正文一致性结果: 去除源站与网站 frontmatter、重复标题和空白差异后，正文归一化一致（MATCH）。
- 本地预览 URL: `http://127.0.0.1:4321/articles/hard-things-and-troublesome-things/`
- 待人工确认: 代理日期及全文页面阅读。

## B2-C02

- candidate_id: B2-C02
- 文章标题: 时间多了以后，效率反而变低了
- 来源类型: human_final
- 脱敏相对来源: `05_Output/风格进化/human_final/时间多了以后效率反而变低了_human_final.md`
- publishedAt: `2026-07-07`
- date_source: frontmatter_created_at
- category: creation
- tags: 创作秩序、时间、自由
- slug: `more-time-lower-efficiency`
- 正文处理: 移除知识库 frontmatter 和重复一级标题；补充 Markdown 段落空行。未添加时间管理方法、效率工具、行动建议或自由职业指南，也未与《创作也需要跑休》合并或互相补写。
- 删除或压缩的具体内容: 仅删除知识库元数据和重复标题；正文无删除、压缩或改写。
- 图片情况: 源文无图片；迁移后无图片和外部图片热链。
- 隐私检查: 未补充或扩大配偶、孩子和家庭日程信息；自动高风险扫描无命中。
- 正文一致性结果: 去除源站与网站 frontmatter、重复标题和空白差异后，正文归一化一致（MATCH）。
- 本地预览 URL: `http://127.0.0.1:4321/articles/more-time-lower-efficiency/`
- 待人工确认: 全文页面阅读，尤其确认与《创作也需要跑休》的主题边界。

## B2-L01

- candidate_id: B2-L01
- 文章标题: 净水器坏了以后，我才想起要备点水
- 来源类型: human_final
- 脱敏相对来源: `05_Output/风格进化/human_final/净水器坏了以后我才想起要备点水_human_final.md`
- publishedAt: `2026-07-19`（文档首次加入知识库日期，不代表已核实的首次公开发布日期）
- date_source: generated_date_proxy
- category: life
- tags: 普通生活、家庭设备、备用方案
- slug: `water-purifier-broke`
- 正文处理: 移除知识库 frontmatter 和重复一级标题；补充 Markdown 段落空行。未添加品牌、商品链接、储水数量建议或应急指南。
- 删除或压缩的具体内容: 仅删除知识库元数据和重复标题；正文无删除、压缩或改写。
- 图片情况: 源文无图片；迁移后无图片和外部图片热链。
- 隐私检查: 未加入品牌、住址、固定路线或可识别跑友信息；自动高风险扫描无命中。
- 正文一致性结果: 去除源站与网站 frontmatter、重复标题和空白差异后，正文归一化一致（MATCH）。
- 本地预览 URL: `http://127.0.0.1:4321/articles/water-purifier-broke/`
- 待人工确认: 代理日期及全文页面阅读。

## B2-L02

- candidate_id: B2-L02
- 文章标题: 发了一条很久没发的朋友圈以后
- 来源类型: human_final
- 脱敏相对来源: `05_Output/风格进化/human_final/发了一条很久没发的朋友圈以后_human_final.md`
- publishedAt: `2026-06-08`（文档首次加入知识库日期，不代表已核实的首次公开发布日期）
- date_source: generated_date_proxy
- category: life
- tags: 朋友圈、中年生活、弱联系
- slug: `posting-to-moments-again`
- 正文处理: 仅补充网站 frontmatter 和 Markdown 段落空行。没有补充朋友身份、点赞评论人员、关系变化原因、私人聊天或平台生态判断。
- 删除或压缩的具体内容: 正文无删除、压缩或改写。
- 图片情况: 源文无图片；迁移后无图片和外部图片热链。
- 隐私检查: 未新增朋友、同事、孩子或其他人物信息；自动高风险扫描无命中。
- 正文一致性结果: 去除网站 frontmatter 和空白差异后，正文归一化一致（MATCH）。
- 本地预览 URL: `http://127.0.0.1:4321/articles/posting-to-moments-again/`
- 待人工确认: 代理日期及全文页面阅读，重点确认中年社交与弱联系主线。

## 统一检查结果

- 元数据: 5 篇均明确设置 `featured: false`、`draft: false`、`sample: false`；分类和标签符合批准范围；未设置 `updatedAt`、`cover`、`purchaseQr` 或空链接。
- 内容发现: 5 篇均进入文章归档、对应分类页、RSS、Sitemap 和独立文章页；首页“最新文章”按既有日期逻辑自然更新，没有设为推荐文章。
- 页面元数据: 5 篇 canonical 均为正式域名稳定 URL；robots 为 `index, follow`。
- 图片和购买: 5 篇正文图片数为 0，外部图片热链为 0，购买入口为 0；`PUBLIC_SHOW_PRODUCT_PURCHASE=false` 合约通过。
- 隐私和路径: 自动隐私扫描无命中；文章和报告不含知识库绝对路径、本机 Home 路径、账号凭据或私人联系方式。
- 备案与搜索: 百度验证文件哈希未变；ICP 和公安备案在新文章页正常显示；`PUBLIC_INDEXING=true` 合约通过。
- 首页基线: 首页结构、文案、样式和现有 featured 推荐文章未改；WebSite JSON-LD 未改。新文章仅按现有逻辑进入“最新文章”。
- 本地检查: `npm run check:content` 通过（15 篇正式文章、无自动风险命中）；`npm run check` 通过（0 errors、0 warnings）；`npm test` 通过（29/29，现有响应式检查 40 个组合通过）；`npm run build` 通过（25 个页面）。
- 新文章预览: 5 篇 × 360/390/768/1440px，共 20 个文章/视口组合通过；无横向溢出、控制台错误、标题/正文截断，文章页脚和备案区域正常。

## 人工门

在用户明确回复“第二批 5 篇文章内容、日期、隐私和页面预览均已确认，批准合并部署”之前，不合并 main，不创建生产 Release，不修改生产服务器，也不部署文章。

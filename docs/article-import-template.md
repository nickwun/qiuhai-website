# 正式文章导入模板

该模板只用于收到用户明确提供的公开终稿后进行格式整理。不得用标题、记忆、网络内容或私人知识库补全正文。

## Frontmatter

```yaml
---
title: 用户确认的原始标题
description: 从原文提取的简短摘要，待人工确认
publishedAt: 原始首次发布日期
category: running
tags:
  - 标签一
  - 标签二
slug: 待确认的英文短链接
featured: true
draft: false
sample: false
originalPlatform: 原始平台 # 可选
originalUrl: 原文链接 # 可选；没有时删除此字段
---
```

分类仅可使用 `running`、`creation`、`life`；标签保持 2—5 个。正式文章必须明确设置 `sample: false` 和 `draft: false`。

## 导入步骤

1. 核对来源文件确为用户指定的公开终稿，并记录首次发布时间。
2. 原样保留事实、观点、数字和叙事顺序，只清理 Markdown/HTML 格式。
3. 检查标题层级、段落、列表、引用、图片、空段落、重复段落和错误 HTML。
4. 移除微信平台样式、二维码及与正文无关的公众号尾部推广；在报告中逐项记录。
5. 外部图片先列入确认清单，不保留微信图片热链；没有本地合法图片时可不设置封面。
6. `description` 只从原文提取，不写成营销文案；`originalUrl` 为空时删除字段。
7. 运行 `npm run check:content`、`npm run check`、`npm test` 和 `npm run build`。
8. 人工确认隐私清单后，才可判定文章适合公开。

## 本批建议分类

- 《低心率慢跑真的有用吗？我用两年 24 次测试回答》：`running`
- 《我把判断自己的权力，交给了数据》：`running`
- 《在记忆消失之前，我想多了解一点爷爷》：`life`

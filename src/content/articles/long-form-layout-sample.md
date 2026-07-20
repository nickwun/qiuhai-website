---
title: 中文长文章排版压力测试：一个很长的标题与 LongEnglishIdentifierWithoutNaturalBreakPoints
description: 仅用于本地检查标题、列表、引用、表格、代码、长链接和中英文混排的排版样本。
publishedAt: 2026-07-20
category: creation
tags:
  - 排版测试
  - 长文章
slug: long-form-layout-sample
featured: false
draft: false
sample: true
---

> 说明：这是排版示例，不是正式文章，不代表站主经历、观点或建议。

这段文字用来观察中文长段落在窄屏上的行长、行高和段落间距。它会刻意混合 English words、数字 2026、全角标点与 `inlineCodeWithAnIntentionallyLongIdentifier`，以确认不同字符在系统字体中仍然保持稳定、清楚，而且不会把页面撑开。

## 二级标题：列表与缩进

无序列表用于检查项目符号和多行文本的缩进：

- 第一项包含较长的中文说明，换行以后仍应与正文保持清楚的层级；
- 第二项包含 LongEnglishIdentifierWithoutNaturalBreakPointsForResponsiveTesting；
- 第三项回到普通中文，不追求额外装饰。

有序列表用于检查连续步骤：

1. 先确认内容边界；
2. 再检查窄屏换行；
3. 最后确认没有横向滚动。

### 三级标题：引用和图片占位

> 引用块需要保留左侧强调线，但强调线、内边距和文字宽度的总和不能超过正文容器。

<figure class="sample-image-placeholder" role="img" aria-label="用于排版测试的图片占位区域">
  <span>图片占位 · 16:9</span>
  <figcaption>本地排版样本，不包含外部图片热链。</figcaption>
</figure>

## 表格与代码

| 项目 | 小屏处理 | 预期结果 |
| --- | --- | --- |
| 普通正文 | 自动换行 | 不产生横向滚动 |
| 表格 | 容器内横向滚动 | 不撑开整页 |
| 代码块 | 容器内横向滚动 | 保留代码格式 |

行内代码如 `npm run build` 应与正文自然混排。代码块可以单独滚动：

```ts
const extremelyLongVariableNameForResponsiveLayoutVerification = "sample-only";
console.log(extremelyLongVariableNameForResponsiveLayoutVerification);
```

## 长链接与中英文混排

下面的链接故意很长，用来确认 URL 能够换行而不扩大页面宽度：

[https://example.com/a-very-long-path/LongEnglishIdentifierWithoutNaturalBreakPointsForResponsiveTesting?source=local-layout-sample&viewport=320](https://example.com/a-very-long-path/LongEnglishIdentifierWithoutNaturalBreakPointsForResponsiveTesting?source=local-layout-sample&viewport=320)

最后一段再次混合中文和 English typography。样本的目标不是表达完整观点，而是让开发阶段可以反复验证真实的长文结构。

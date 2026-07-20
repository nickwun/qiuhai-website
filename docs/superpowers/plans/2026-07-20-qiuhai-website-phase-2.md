# Qiuhai Website Phase 2 Implementation Plan

> **For agentic workers:** Execute this plan in the current session without subagents. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Polish the responsive reading experience, isolate sample content from production output, centralize production configuration, and prepare a safe manual Tencent Lighthouse deployment workflow without deploying the site.

**Architecture:** Keep Astro static generation and the existing component structure. Add small shared helpers for public-content filtering and environment-derived site settings, a development-only sample preview route, a focused Playwright browser regression script, and shell scripts that prepare versioned rsync releases with an atomic `current` symlink.

**Tech Stack:** Astro 7, TypeScript, Markdown Content Collections, native CSS, Node test runner, shell, Nginx.

---

## Chunk 1: Baseline and regression contracts

### Task 1: Reproduce the responsive issue

- [x] Start the current static preview without changing source files.
- [x] Inspect homepage, article list, and article detail at 320, 360, 375, 390, 430, 768, 1024, and 1440 px.
- [x] Record `clientWidth`, `scrollWidth`, overflowing elements, card bounds, and homepage vertical positions.
- [x] Identify the actual overflow source before changing CSS.

### Task 2: Add failing content and environment contracts

**Files:**
- Modify: `tests/site-contract.test.mjs`
- Create: `tests/deploy-scripts.test.mjs`
- Create: `scripts/check-responsive.mjs`

- [x] Assert the `sample` schema field and sample frontmatter are present.
- [x] Assert production output excludes draft/sample entries from pages, RSS, and sitemap.
- [x] Assert indexing false/true builds produce the correct meta and robots behavior.
- [x] Assert empty filing variables do not render filing links.
- [x] Assert deployment dry-run performs no remote mutation.
- [x] Run the new tests and confirm they fail for missing behavior.

## Chunk 2: Content visibility and production settings

### Task 3: Centralize settings and visibility rules

**Files:**
- Create: `src/config.ts`
- Create: `src/lib/articles.ts`
- Modify: `astro.config.mjs`
- Modify: `.env.example`
- Modify: `src/content.config.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/SiteFooter.astro`

- [x] Add `SITE_URL`, `PUBLIC_INDEXING`, `ICP_NUMBER`, `ICP_URL`, `PUBLIC_SECURITY_NUMBER`, and `PUBLIC_SECURITY_URL` with safe defaults.
- [x] Default production URL to `https://qiuhai.net.cn` and indexing to false.
- [x] Add `sample: false` to the schema and central public-article filtering.
- [x] Render global robots meta and optional filing information from centralized settings.

### Task 4: Isolate and preview sample content

**Files:**
- Modify: `src/content/articles/*.md`
- Create: `src/content/articles/long-form-layout-sample.md`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/articles/index.astro`
- Modify: `src/pages/articles/[slug].astro`
- Modify: `src/pages/topics/index.astro`
- Modify: `src/pages/topics/[topic].astro`
- Modify: `src/pages/rss.xml.ts`
- Modify: `src/pages/robots.txt.ts`
- Create: `src/pages/preview/samples/[...slug].astro`

- [x] Mark all four layout articles as samples.
- [x] Exclude draft/sample entries from every public collection query and route.
- [x] Add a clearly labeled, always-noindex sample index and detail route.
- [x] Keep sample content available only when not building production.
- [x] Verify the content/environment tests pass.

## Chunk 3: Responsive and reading polish

### Task 5: Fix overflow and tighten homepage rhythm

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/pages/index.astro`
- Modify: `src/components/ArticleCard.astro`

- [x] Remove the diagnosed overflow cause instead of hiding body overflow.
- [x] Add shrink/wrap rules for cards, metadata, long strings, media, code, and tables.
- [x] Tighten mobile hero and first content section spacing while preserving desktop rhythm and copy.
- [x] Keep cards single-column and within their container through 880 px.
- [x] Run the browser regression script against the three required routes.

## Chunk 4: Lighthouse deployment preparation

### Task 6: Add safe deployment assets

**Files:**
- Create: `docs/deployment-lighthouse.md`
- Create: `deploy/nginx/qiuhai.net.cn.conf`
- Create: `scripts/deploy-manual.sh`
- Create: `scripts/verify-deployment.sh`
- Create: `scripts/rollback-deployment.sh`
- Modify: `README.md`
- Modify: `AGENTS.md`

- [x] Document static rsync releases, atomic symlink switching, rollback, HTTPS as a later manual step, and no DNS/production deployment in this phase.
- [x] Add Nginx static routing, 404, cache, gzip, and security headers without certificates.
- [x] Make deployment validate check/test/build first and support non-mutating `--dry-run`.
- [x] Keep EdgeOne documentation but mark it `future_optional_deployment`.

## Chunk 5: Final QA, security audit, and delivery

### Task 7: Complete current verification

**Files:**
- Create: `docs/visual-qa-report.md`

- [x] Run `npm run check`, `npm test`, and `npm run build` with production-safe defaults.
- [x] Validate indexing-on output in a separate temporary build.
- [x] Run all eight viewport checks across the required routes and capture browser-console results.
- [x] Audit tracked files for secrets, local absolute paths, public IPs, private keys, image hotlinks, drafts, samples, RSS, sitemap, and empty links.
- [x] Record the diagnosed cause, fixes, viewport results, limitations, and readiness decision.
- [x] Review exact changed paths, commit in logical units, push `codex/polish-qiuhai-website-v1`, and do not merge main.

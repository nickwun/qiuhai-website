# Qiuhai Real Content Phase 3 Implementation Plan

> **For agentic workers:** Execute this plan in the current session without subagents, as required by the repository's global instructions. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace template copy and project placeholders with user-provided real information, establish a privacy-safe article import baseline, and import only the formal articles whose user-approved final files are present.

**Architecture:** Preserve the existing Astro static site and Content Collection pipeline. Store project metadata in one typed data module and render it through one conditional-link card component. Keep article import as an explicit file-based workflow; missing finals remain documented blockers rather than generated content.

**Tech Stack:** Astro 7, TypeScript, Markdown Content Collections, native CSS, Node test runner.

---

## Chunk 1: Preconditions and failing contracts

### Task 1: Confirm source availability and branch

**Files:** None

- [x] Verify a clean worktree, correct origin, and second-stage commit `cfbfe2d`.
- [x] Search only the repository for the three specified titles.
- [x] Create `codex/add-qiuhai-real-content-v1` from `cfbfe2d`.
- [x] Record that all three final source files are missing without searching private storage.

### Task 2: Write content and project regression tests

**Files:**
- Modify: `tests/site-contract.test.mjs`
- Create: `tests/content-privacy.test.mjs`

- [ ] Test the exact homepage introduction, About copy, and footer line.
- [ ] Test all three typed projects, their statuses, ordering, and conditional links.
- [ ] Test that empty project links never produce `href=""`.
- [ ] Test that formal articles, when present, are public and sample content stays excluded.
- [ ] Test the repository privacy scanner and WeChat image hotlink rule.
- [ ] Run the new tests and verify they fail because the implementation is absent.

## Chunk 2: Real copy and projects

### Task 3: Implement project data and cards

**Files:**
- Create: `src/data/projects.ts`
- Create: `src/components/ProjectCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/works.astro`
- Modify: `src/styles/global.css`

- [ ] Define the seven required fields for the three user-provided projects.
- [ ] Render a link only when `link` and `linkLabel` are present; otherwise show a clear pending-link state.
- [ ] Reuse the three cards on the homepage and works page.
- [ ] Apply only the allowed card padding, label/title spacing, link-state, and About line-height adjustments.

### Task 4: Replace template copy

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/components/SiteFooter.astro`

- [ ] Use the exact user-provided homepage introduction and About paragraphs.
- [ ] Reuse the same approved personal copy on the About page without adding biographical claims.
- [ ] Change the footer line to “长期记录，诚实表达。”
- [ ] Run the content/project tests and verify they pass.

## Chunk 3: Import and privacy baseline

### Task 5: Add an explicit import template and report

**Files:**
- Create: `docs/article-import-template.md`
- Create: `docs/content-import-report.md`

- [ ] Document the required frontmatter, formatting-only cleanup rules, and public-content gates.
- [ ] Record each requested article as not imported because its final file and publication date are unavailable.
- [ ] Include the family/privacy confirmation checklist for the grandfather article.
- [ ] Do not create placeholder production articles.

### Task 6: Add repository-scoped public-content checks

**Files:**
- Create: `scripts/check-public-content.mjs`
- Modify: `package.json`
- Test: `tests/content-privacy.test.mjs`

- [ ] Scan only `src/content/articles/` entries marked `sample: false` and `draft: false`.
- [ ] Fail on known WeChat image hotlinks, identity numbers, phone numbers, payment credentials, or address-like high-risk patterns.
- [ ] Report missing expected article titles without treating fabricated content as a solution.
- [ ] Add the scanner to `npm test` and verify the clean current baseline.

## Chunk 4: Verification and delivery

### Task 7: Verify and hand off

**Files:** Existing project files

- [ ] Run `npm run check`, `npm test`, and `npm run build`.
- [ ] Confirm all eight responsive viewports still pass.
- [ ] Inspect homepage and works page in the local browser.
- [ ] Audit the exact diff and repository-scoped privacy output.
- [ ] Commit and push `codex/add-qiuhai-real-content-v1` without merging main or deploying production.
- [ ] Report the three missing finals as the remaining content blocker.

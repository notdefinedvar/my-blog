# Astro Static Site Testing Design

## Overview

Add testing infrastructure for the personal Astro site: type checking, build validation, content logic unit tests, and E2E smoke tests.

## Goals

- B: Build validation
- C: Content correctness
- Minimal CI overhead

## Test Layers

| Layer | Tool | Command |
|-------|------|---------|
| Type check | `astro check` | `npm run check` |
| Build | `astro build` | `npm run build` |
| Content unit tests | Vitest | `vitest` |
| E2E smoke | Playwright | `npx playwright test` |

## Files to Add

```
src/test/
  content.test.ts        — content collection schema validation
  twitter-format.test.ts — twitter format script tests
  wechat-format.test.ts  — wechat format script tests
e2e/
  smoke.spec.ts          — page load + console error checks
vitest.config.ts
playwright.config.ts
```

### content.test.ts
- `getCollection` returns only non-draft posts
- Frontmatter schema validation (title string, pubDate date, etc.)

### twitter-format.test.ts
- `parseFrontmatter` — extracts title, description, tags
- `stripMarkdown` — removes formatting, shortens code blocks
- `splitIntoThreadPosts` — splits into 280-char posts, handles long words

### wechat-format.test.ts
- Markdown to HTML conversion
- Title/description extraction
- Tag rendering

### smoke.spec.ts
- `/` → 200, no console errors
- `/blog` → 200, no console errors
- `/projects` → 200, no console errors
- `/about` → 200, no console errors

## Workflow: CI Test

Trigger: `pull_request` closed + merged to main (draft → main merge)

```yaml
name: Test & Deploy

on:
  pull_request:
    branches: [main]
    types: [closed]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  test-deploy:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node
      - install
      - run: npm run check
      - run: npm run build
      - name: Get changed blog posts
        id: changed
        run: |
          CHANGED_FILES=$(git diff --name-only ${{ github.event.pull_request.base.sha }}...HEAD -- 'src/content/blog/*.md')
          echo "changed_files=$CHANGED_FILES" >> $GITHUB_OUTPUT
      - name: Generate Twitter formats
        if: steps.changed.outputs.changed_files != ''
        run: ...
      - name: Generate WeChat formats
        if: steps.changed.outputs.changed_files != ''
        run: ...
      - name: Upload social artifacts
        if: steps.changed.outputs.changed_files != ''
        uses: actions/upload-artifact@v4
        ...
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

## Package.json Updates

Add:
```json
"test": "vitest",
"test:e2e": "playwright test",
"check": "astro check"
```

Add devDependencies:
- `vitest`
- `@vitest/ui`
- `playwright`
- `@playwright/test`

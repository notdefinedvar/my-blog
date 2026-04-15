# CI/CD Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the combined `test-deploy.yml` into two separate workflows: `ci.yml` (test + build) and `cd.yml` (artifact generation + deploy).

**Architecture:** CI runs on every branch push for fast feedback. CD runs only on main push for deployment. Artifacts (Twitter/WeChat formats) are generated in CD, not CI.

**Tech Stack:** GitHub Actions, Node.js 20, npm, Playwright, Astro

---

## Task 1: Create CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write ci.yml**

```yaml
name: CI

on:
  push:
    branches: ['**']
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Type check
        run: npm run check

      - name: Build
        run: npm run build

      - name: Unit tests
        run: npm test

      - name: E2E tests
        run: npx playwright test
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat: add CI workflow for test and build"
```

---

## Task 2: Create CD workflow

**Files:**
- Create: `.github/workflows/cd.yml` (content refactored from test-deploy.yml)

- [ ] **Step 1: Write cd.yml**

```yaml
name: CD

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  cd:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Get changed blog posts
        id: changed
        run: |
          CHANGED_FILES=$(git diff --name-only HEAD~1 -- 'src/content/blog/*.md')
          echo "changed_files=$CHANGED_FILES" >> $GITHUB_OUTPUT

      - name: Generate Twitter formats
        if: steps.changed.outputs.changed_files != ''
        run: |
          mkdir -p artifacts/twitter
          for file in ${{ steps.changed.outputs.changed_files }}; do
            filename=$(basename "$file" .md)
            node scripts/generate-twitter-format.js "$file" > "artifacts/twitter/${filename}.txt"
          done

      - name: Generate WeChat formats
        if: steps.changed.outputs.changed_files != ''
        run: |
          mkdir -p artifacts/wechat
          for file in ${{ steps.changed.outputs.changed_files }}; do
            filename=$(basename "$file" .md)
            node scripts/generate-wechat-format.js "$file" > "artifacts/wechat/${filename}.html"
          done

      - name: Upload Twitter artifacts
        if: steps.changed.outputs.changed_files != ''
        uses: actions/upload-artifact@v4
        with:
          name: twitter-formats
          path: artifacts/twitter/
          retention-days: 30

      - name: Upload WeChat artifacts
        if: steps.changed.outputs.changed_files != ''
        uses: actions/upload-artifact@v4
        with:
          name: wechat-formats
          path: artifacts/wechat/
          retention-days: 30

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/cd.yml
git commit -m "feat: add CD workflow for deploy"
```

---

## Task 3: Remove combined test-deploy.yml

**Files:**
- Delete: `.github/workflows/test-deploy.yml`

- [ ] **Step 1: Delete the file**

```bash
git rm .github/workflows/test-deploy.yml
```

- [ ] **Step 2: Commit**

```bash
git commit -m "refactor: remove combined test-deploy workflow (split into ci.yml and cd.yml)"
```

# Astro Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add testing infrastructure for the Astro static site: Vitest unit tests for content/twitter/wechat format logic, Playwright E2E smoke tests, merged CI workflow.

**Architecture:** Two test layers — Vitest for pure logic unit tests (content schema, twitter/wechat format scripts), Playwright for E2E page smoke tests. CI workflow merged from deploy.yml + publish.yml into a single test-deploy.yml triggered on PR merge to main.

**Tech Stack:** vitest, @vitest/ui, playwright, @playwright/test, astro, @astrojs/check

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add test scripts, devDependencies |
| `vitest.config.ts` | Create | Vitest configuration |
| `playwright.config.ts` | Create | Playwright configuration |
| `src/test/content.test.ts` | Create | Content schema Zod validation tests |
| `src/test/twitter-format.test.ts` | Create | Twitter format script unit tests |
| `src/test/wechat-format.test.ts` | Create | WeChat format script unit tests |
| `e2e/smoke.spec.ts` | Create | Page load smoke tests |
| `.github/workflows/deploy.yml` | Delete | Merged into test-deploy.yml |
| `.github/workflows/publish.yml` | Delete | Merged into test-deploy.yml |
| `.github/workflows/test-deploy.yml` | Create | Combined workflow |

---

### Task 1: Install test dependencies

**Files:**
- Modify: `package.json:1-22`

- [ ] **Step 1: Add devDependencies to package.json**

Run: (not needed — edit directly)

Add `"vitest"`, `"@vitest/ui"`, `"playwright"`, `"@playwright/test"` to devDependencies.

Add scripts:
```json
"test": "vitest",
"test:e2e": "playwright test",
"check": "astro check"
```

Existing `check` in package.json? Check — if not present, add it.

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: vitest, @vitest/ui, playwright, @playwright/test added to node_modules

---

### Task 2: Create Vitest config

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Write vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/test/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Verify config is valid**

Run: `npx vitest --version`
Expected: Vitest version printed

---

### Task 3: Create Playwright config

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Write playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 2: Install Playwright browser**

Run: `npx playwright install chromium`
Expected: Chromium downloaded and installed

---

### Task 4: Create content.test.ts

**Files:**
- Create: `src/test/content.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the blog schema from src/content/config.ts
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  author: z.string().default('Your Name'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

describe('Blog content schema', () => {
  it('parses valid frontmatter', () => {
    const valid = {
      title: 'Test Post',
      description: 'A test',
      pubDate: '2024-01-01',
      author: 'CJ',
      tags: ['tech'],
      draft: false,
    };
    const result = blogSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('coerces pubDate string to date', () => {
    const result = blogSchema.safeParse({
      title: 'Test',
      description: 'Test',
      pubDate: '2024-01-15',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pubDate).toBeInstanceOf(Date);
    }
  });

  it('applies defaults for missing optional fields', () => {
    const minimal = {
      title: 'Test',
      description: 'Test',
      pubDate: '2024-01-01',
    };
    const result = blogSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author).toBe('Your Name');
      expect(result.data.tags).toEqual([]);
      expect(result.data.draft).toBe(false);
    }
  });

  it('rejects missing required fields', () => {
    const incomplete = {
      title: 'Test',
      // missing description and pubDate
    };
    const result = blogSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects invalid tags type', () => {
    const invalid = {
      title: 'Test',
      description: 'Test',
      pubDate: '2024-01-01',
      tags: 'not-an-array',
    };
    const result = blogSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/content.test.ts`
Expected: FAIL — zod not found (need to install zod)

Wait — zod is a peer dep of astro, may not be directly importable. Check if zod is available:
Run: `node -e "import('zod').then(() => console.log('ok')).catch(() => console.log('not found'))"`

If not found, install it:
Run: `npm install --save-dev zod`

Then retry:
Run: `npx vitest run src/test/content.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add package.json vitest.config.ts playwright.config.ts src/test/content.test.ts
git commit -m "feat: add Vitest and Playwright config, content schema tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Create twitter-format.test.ts

**Files:**
- Create: `src/test/twitter-format.test.ts`
- Test: `scripts/generate-twitter-format.js`

Need to import `parseFrontmatter`, `stripMarkdown`, `splitIntoThreadPosts` from the script. Since the script uses ESM and `import.meta.url`, Vitest can handle it via the Node ESM loader. The functions are already exported (they're used internally but not explicitly — need to verify exports exist).

- [ ] **Step 1: Verify functions are importable**

Check if `generate-twitter-format.js` exports the functions. Read the file — functions are defined at module scope but NOT exported. They are internal. To test them, must add exports OR test via the public API (generateTwitterFormat reads a file).

Option A: Add exports to the script (minimal change)
Option B: Test only the public `generateTwitterFormat` function

Choose Option B — test `generateTwitterFormat` by creating temp .md files.

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '../../tmp/twitter-test');

beforeAll(() => {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
});

function writeTempMd(content: string): string {
  const filePath = path.join(TEMP_DIR, `test-${Date.now()}.md`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe('parseFrontmatter (via generateTwitterFormat)', () => {
  it('extracts title and description', async () => {
    const filePath = writeTempMd(`---
title: "Test Title"
description: "Test Description"
pubDate: 2024-01-01
tags: [tech, test]
---
Body content here.`);
    const { generateTwitterFormat } = await import('../../scripts/generate-twitter-format.js');
    const output = generateTwitterFormat(filePath);
    expect(output).toContain('Test Title');
    expect(output).toContain('Test Description');
  });

  it('handles posts with no tags', async () => {
    const filePath = writeTempMd(`---
title: "No Tags Post"
description: "No tags here"
pubDate: 2024-01-01
---
Body content.`);
    const { generateTwitterFormat } = await import('../../scripts/generate-twitter-format.js');
    const output = generateTwitterFormat(filePath);
    expect(output).not.toContain('#');
  });

  it('splits long content into thread posts', async () => {
    const longContent = '---\ntitle: Long Post\ndescription: Desc\npubDate: 2024-01-01\n---\n' + 'word '.repeat(300);
    const filePath = writeTempMd(longContent);
    const { generateTwitterFormat } = await import('../../scripts/generate-twitter-format.js');
    const output = generateTwitterFormat(filePath);
    // Should have 1/2 or 2/3 format due to length
    expect(output).toMatch(/\d\/\d+/);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/test/twitter-format.test.ts`
Expected: FAIL with import error or assertion failure

- [ ] **Step 4: Fix if needed**

If import fails due to ESM, may need to add `.toHaveProperty` check or use dynamic import differently. Adjust test code if needed.

- [ ] **Step 5: Commit**

```bash
git add src/test/twitter-format.test.ts
git commit -m "feat: add twitter format generation tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Create wechat-format.test.ts

**Files:**
- Create: `src/test/wechat-format.test.ts`
- Test: `scripts/generate-wechat-format.js`

Same approach as twitter — test via `generateWeChatFormat` public function.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '../../tmp/wechat-test');

beforeAll(() => {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
});

function writeTempMd(content: string): string {
  const filePath = path.join(TEMP_DIR, `test-${Date.now()}.md`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe('generateWeChatFormat', () => {
  it('extracts title and author', async () => {
    const filePath = writeTempMd(`---
title: "WeChat Test"
description: "Desc"
pubDate: 2024-01-01
author: CJ
tags: [test]
---
Body paragraph here.`);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('WeChat Test');
    expect(output).toContain('CJ');
  });

  it('converts markdown headers to HTML h1/h2/h3', async () => {
    const filePath = writeTempMd(`---
title: Headers
description: Desc
pubDate: 2024-01-01
---
# H1 Title
## H2 Section
### H3 Sub`);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('<h1>H1 Title</h1>');
    expect(output).toContain('<h2>H2 Section</h2>');
    expect(output).toContain('<h3>H3 Sub</h3>');
  });

  it('converts bold and italic', async () => {
    const filePath = writeTempMd(`---
title: Formatting
description: Desc
pubDate: 2024-01-01
---
This is **bold** and *italic*.`);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('<strong>bold</strong>');
    expect(output).toContain('<em>italic</em>');
  });

  it('handles code blocks', async () => {
    const filePath = writeTempMd(`---
title: Code
description: Desc
pubDate: 2024-01-01
---
\`\`\`js
console.log('hello');
\`\`\``);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('<pre><code>');
    expect(output).toContain("console.log('hello')");
  });

  it('renders tags as hashtags', async () => {
    const filePath = writeTempMd(`---
title: Tags
description: Desc
pubDate: 2024-01-01
tags: [tech, javascript]
---
Body.`);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('#tech');
    expect(output).toContain('#javascript');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/wechat-format.test.ts`
Expected: FAIL

- [ ] **Step 3: Commit**

```bash
git add src/test/wechat-format.test.ts
git commit -m "feat: add WeChat format generation tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Create E2E smoke tests

**Files:**
- Create: `e2e/smoke.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/blog', name: 'Blog' },
    { path: '/projects', name: 'Projects' },
    { path: '/about', name: 'About' },
  ];

  for (const page of pages) {
    test(`${page.name} (${page.path}) loads without errors`, async ({ page: p }) => {
      const errors: string[] = [];
      p.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      const response = await p.goto(page.path);
      expect(response?.status()).toBe(200);
      expect(errors).toHaveLength(0);
    });
  }
});
```

- [ ] **Step 2: Run test to verify it fails (no server running)**

Run: `npx playwright test e2e/smoke.spec.ts --project=chromium`
Expected: FAIL — server not running (webServer in config will start it)

If it passes, server started correctly.

- [ ] **Step 3: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "feat: add Playwright E2E smoke tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Merge workflows into test-deploy.yml

**Files:**
- Create: `.github/workflows/test-deploy.yml`
- Delete: `.github/workflows/deploy.yml`
- Delete: `.github/workflows/publish.yml`

- [ ] **Step 1: Write the combined workflow**

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
        run: npm ci

      - name: Type check
        run: npm run check

      - name: Build
        run: npm run build

      - name: Get changed blog posts
        id: changed
        run: |
          CHANGED_FILES=$(git diff --name-only ${{ github.event.pull_request.base.sha }}...HEAD -- 'src/content/blog/*.md')
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

- [ ] **Step 2: Delete old workflows**

Run: `rm .github/workflows/deploy.yml .github/workflows/publish.yml`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/test-deploy.yml
git rm .github/workflows/deploy.yml .github/workflows/publish.yml
git commit -m "feat: merge deploy and publish workflows into test-deploy.yml

- Combines type check, build, social format generation, and deploy
- Triggered on PR merge to main
- Keeps social format generation conditional on blog post changes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

- [ ] Spec coverage: all sections in spec have corresponding tasks
- [ ] No placeholders (TBD/TODO) — all code is concrete
- [ ] Type consistency: functions referenced in later tasks match earlier definitions
- [ ] Workflow delete steps: deploy.yml and publish.yml both marked for deletion
- [ ] `check` script: package.json check added (if missing from original)

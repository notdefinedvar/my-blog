# CI/CD Split Design

**Goal:** Split the combined Test & Deploy workflow into separate CI and CD workflows with clear responsibilities.

**Architecture:**

- **CI workflow** (`ci.yml`): Runs on every branch push and manually via `workflow_dispatch`. Runs all tests (unit + E2E) and build. No deploy.
- **CD workflow** (`cd.yml`): Runs on push to `main` (after PR merge). Generates Twitter/WeChat format artifacts for changed blog posts, then deploys to GitHub Pages.

**Trigger Conditions:**

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | `push` to any branch | Fast feedback on every change |
| `ci.yml` | `workflow_dispatch` | Manual trigger for debugging |
| `cd.yml` | `push` to `main` | Deploy after PR merge |

**CI Workflow Steps:**

1. Checkout
2. Setup Node
3. Install dependencies
4. Type check (`npm run check`)
5. Build (`npm run build`)
6. Unit tests (`npm test`)
7. E2E tests (Playwright, full smoke test)

**CD Workflow Steps:**

1. Checkout `main`
2. Setup Node
3. Install dependencies
4. Get changed blog posts: `git diff HEAD~1 --name-only -- 'src/content/blog/*.md'`
5. Generate Twitter formats for changed files
6. Generate WeChat formats for changed files
7. Upload Twitter artifact
8. Upload WeChat artifact
9. Deploy to GitHub Pages

**Artifact Generation:**

CD uses `git diff HEAD~1` to find which blog `.md` files changed in this push to main, then only generates Twitter/WeChat formats for those files. Artifacts are retained for 30 days.

**Why This Split:**

- CI runs on every push → fast feedback, no deploy side effects
- CD runs only on main push → cleaner separation of concerns
- Test artifacts (Twitter/WeChat) belong to CD, not CI — they are publishing artifacts, not test artifacts

**Files:**

- Create: `.github/workflows/ci.yml`
- Rename: `.github/workflows/test-deploy.yml` → `.github/workflows/cd.yml`
- Delete: no file deletion, just workflow content restructuring

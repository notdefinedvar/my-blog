# GitHub Pages Personal Website with Social Format Generator

## Context

This project builds a personal website hosted on GitHub Pages that showcases projects and articles. Blog posts are written in markdown and published using a code-release-style workflow: merge draft branch to main = publish.

When a post merges to main, the site deploys automatically and formatted content is generated for Twitter and WeChat - ready for copy/paste to each platform. No API credentials needed, no auto-posting.

**Code-release model:**
- `draft` branch = all draft posts, no auto-deploy
- `main` branch = live site, auto-deploys on merge
- Merge draft → main = publish

---

## Technology Stack

- **Static Site Generator**: Astro 4.x - Modern, fast, with built-in content collections
- **Hosting**: GitHub Pages - Free hosting with automatic deployment
- **Automation**: GitHub Actions - Native CI/CD
- **Language**: TypeScript/JavaScript with Node.js

---

## Core Architecture

### Branch Strategy

```
draft branch (all drafts)
    │
    │ merge
    ▼
main branch (live site)
    │
    ▼
GitHub Action triggered
    │
    ├─ Deploy to GitHub Pages
    ├─ Generate Twitter thread format (.txt artifact)
    └─ Generate WeChat HTML format (.html artifact)
```

### Blog Post Workflow

1. Write blog post in `src/content/blog/` on `draft` branch
2. Push to `draft` branch (no auto-deploy)
3. When ready, merge `draft` → `main`
4. Action triggers:
   - Deploy to GitHub Pages (site goes live)
   - Detect new/changed posts (compare against last main commit)
   - Generate Twitter thread text
   - Generate WeChat-compatible HTML
5. Artifacts attached to workflow run (downloadable .txt and .html files)
6. You copy/paste formatted content to Twitter and WeChat

### Two GitHub Actions Workflows

1. **deploy.yml**: Deploys to GitHub Pages when main branch receives push
2. **publish.yml**: Triggers on merge to main, generates social formats, attaches artifacts

---

## Critical Files to Create

### Configuration Files

- `astro.config.mjs` - Astro configuration with site URL
- `package.json` - Dependencies and scripts
- `src/content/config.ts` - Blog post schema validation

### Website Structure

- `src/layouts/Layout.astro` - Base layout
- `src/pages/index.astro` - Homepage
- `src/pages/blog/index.astro` - Blog listing
- `src/pages/blog/[slug].astro` - Individual posts
- `src/content/blog/*.md` - Blog posts in markdown

### GitHub Actions Workflows

- `.github/workflows/deploy.yml` - Deploy to GitHub Pages on main push
- `.github/workflows/publish.yml` - On merge to main: detect posts, generate formats, attach artifacts

### Format Generator Scripts

- `scripts/generate-twitter-format.js` - Convert markdown to Twitter thread
- `scripts/generate-wechat-format.js` - Convert markdown to WeChat HTML

---

## Implementation Steps

### Phase 1: Project Setup

1. Initialize npm project and install Astro dependencies
2. Create basic project structure
3. Set up Astro configuration
4. Initialize Git repository with `main` and `draft` branches

### Phase 2: Basic Website

1. Create base layout, header, and footer components
2. Build homepage and blog listing page
3. Implement dynamic blog post pages from markdown
4. Configure content collections with schema validation
5. Test locally with `npm run dev`

### Phase 3: GitHub Pages Deployment

1. Create GitHub repository
2. Configure Astro for GitHub Pages (site URL, base path)
3. Add deploy.yml workflow
4. Enable GitHub Pages in repository settings
5. Verify deployment

### Phase 4: Format Generation Scripts

1. Create `generate-twitter-format.js`:
   - Parse markdown frontmatter
   - Split content into 280-char segments for thread
   - Extract hashtags from tags
   - Number threads (1/n format)
2. Create `generate-wechat-format.js`:
   - Convert markdown to WeChat-compatible HTML subset
   - Handle tables, code blocks (WeChat-friendly)
   - Strip external CSS (inline only)
   - Note: images require manual WeChat upload
3. Test both scripts against sample posts

### Phase 5: Publish Workflow

1. Create `publish.yml`:
   - Trigger: `pull_request` event, `types: [closed]`, branch `main`, `merged: true`
   - Or trigger: `push` to main, detect merge commits
   - Step 1: Build Astro site
   - Step 2: Run format generators on changed .md files
   - Step 3: Upload artifacts (twitter-thread-*.txt, wechat-article-*.html)
2. Update deploy.yml to not re-run format generation (or consolidate into one workflow with conditional steps)

### Phase 6: Refinement

1. Add styling with `src/styles/global.css`
2. Create README.md with setup and workflow instructions
3. End-to-end testing

---

## Blog Post Structure

Blog posts are markdown files in `src/content/blog/` with YAML frontmatter:

```markdown
---
title: "My First Blog Post"
description: "A brief description"
pubDate: 2026-04-01
author: "Your Name"
tags: ["technology", "astro"]
---

# My First Blog Post

Content here...
```

---

## Format Output Examples

### Twitter Thread Output

```
1/ Here's my latest post: "My First Blog Post"

[First 280 chars of content...]

2/
[Next 280 chars...]

3/
[Remaining content...]

#technology #astro
```

### WeChat HTML Output

```html
<h1>My First Blog Post</h1>
<p>WeChat-compatible HTML here...</p>
<!-- Note: Images must be uploaded manually via WeChat后台 -->
```

---

## Verification & Testing

### Local Testing

1. Run `npm run dev` and visit http://localhost:4321
2. Verify blog posts render correctly from markdown
3. Test navigation between pages
4. Run format scripts manually: `node scripts/generate-twitter-format.js`

### GitHub Pages Testing

1. Merge draft → main
2. Check Actions tab for successful deployment
3. Visit GitHub Pages URL to verify site loads
4. Check workflow run for artifacts

### Social Format Testing

1. Create new blog post on draft branch
2. Merge to main
3. Download twitter-thread-*.txt artifact
4. Download wechat-article-*.html artifact
5. Verify formatting is correct for each platform

---

## Key Dependencies

- `astro@^4.11.0` - Static site generator
- `@astrojs/sitemap@^3.1.0` - Sitemap generation
- `@astrojs/check@^0.9.0` - Astro type checking
- `typescript@^5.4.0` - TypeScript support
- `prettier@^3.2.0` - Code formatting
- `prettier-plugin-astro@^0.13.0` - Astro Prettier plugin
- `marked@^12.0.0` - Markdown parsing (for format generators)

---

## Security Considerations

- No API credentials stored (no social posting)
- GitHub Actions use minimal required permissions
- Input validation on all user-provided content
- Error messages sanitized

---

## Maintenance

- Weekly: Check GitHub Actions workflow logs
- Monthly: Review workflow runs
- Annually: Update dependencies with `npm update`

---

## Estimated Timeline

Total: 6-8 hours across 6 phases

---

## Advantages

1. **Zero Cost**: Free GitHub Pages and Actions
2. **No API Keys**: No Twitter/WeChat API credentials needed
3. **Simple Workflow**: Standard git merge = publish
4. **Full Control**: Manual copy/paste to social platforms
5. **Clean**: No third-party dependencies

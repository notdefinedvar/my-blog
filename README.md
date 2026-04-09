# Personal Website

A personal website hosted on GitHub Pages with automated social media format generation.

## Features

- Static site built with Astro
- Blog with markdown content
- Code-release style publishing workflow
- Automated Twitter thread and WeChat article format generation

## Publishing Workflow

This project uses a **code-release model** for publishing:

1. **Draft**: Write blog posts on the `draft` branch
2. **Review**: Merge `draft` → `main` when ready
3. **Publish**: Action automatically:
   - Deploys to GitHub Pages
   - Generates Twitter thread format
   - Generates WeChat HTML format
   - Attaches artifacts to workflow run

### Branch Strategy

- `draft` branch: All draft blog posts (no auto-deploy)
- `main` branch: Live site (auto-deploys on merge)

### Social Media Artifacts

After merging to `main`, download the generated formats from the workflow run:

- **Twitter**: `twitter-formats/*.txt` - Thread-ready text
- **WeChat**: `wechat-formats/*.html` - WeChat-compatible HTML

## Setup

### Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:4321

### GitHub Pages Setup

1. Push to GitHub
2. Go to repository Settings → Pages
3. Select `main` branch and `/ (root)` folder
4. Save

### Build

```bash
npm run build
```

Output in `dist/` folder.

## Blog Post Format

```markdown
---
title: "Post Title"
description: "Brief description"
pubDate: 2026-04-08
author: "Your Name"
tags: ["tag1", "tag2"]
---

# Post Title

Your content here...
```

## Project Structure

```
personal-website/
├── src/
│   ├── content/
│   │   └── blog/          # Blog posts (markdown)
│   ├── layouts/            # Astro layouts
│   ├── pages/              # Astro pages
│   └── styles/             # Global CSS
├── scripts/
│   ├── generate-twitter-format.js
│   └── generate-wechat-format.js
├── .github/
│   └── workflows/
│       ├── deploy.yml      # Deploy to GitHub Pages
│       └── publish.yml     # Publish + generate formats
└── public/                 # Static assets
```

## License

MIT

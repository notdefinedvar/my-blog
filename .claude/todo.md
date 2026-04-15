# TODO

## 1. Research: npm optional dependency issue with package-lock.json

When installing Node modules, the CI workflow currently deletes both `node_modules` and `package-lock.json` to work around a known npm bug with optional dependencies (specifically `@rollup/rollup-linux-x64-gnu`).

**Current workaround:**
```yaml
- name: Install dependencies
  run: |
    rm -rf node_modules package-lock.json
    npm install
```

**Goal:** Find a way to keep `package-lock.json` while still resolving the optional dependency issue. Possible approaches:
- Use `npm ci --ignore-scripts` or similar flags
- Add a `npm rebuild` step after `npm ci`
- Pin specific optional dependency versions
- Use `npm install --legacy-peer-deps`

## 2. Add @astrojs/sitemap back

The `@astrojs/sitemap` integration was temporarily removed due to a build error:
```
Cannot read properties of undefined (reading 'reduce')
Location: @astrojs/sitemap/dist/index.js:85:37
```

**Goal:** Investigate and fix the issue, then restore the sitemap integration for SEO benefits.

import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cjg.github.io',
  base: '/',
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});

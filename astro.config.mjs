import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://notdefinedvar.github.io',
  base: '/',
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});

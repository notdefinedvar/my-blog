import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://notdefinedvar.github.io',
  base: '/my-blog',
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});

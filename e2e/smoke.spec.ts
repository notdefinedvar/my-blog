import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  const pages = [
    { path: '/my-blog/', name: 'Home' },
    { path: '/my-blog/blog', name: 'Blog' },
    { path: '/my-blog/projects', name: 'Projects' },
    { path: '/my-blog/about', name: 'About' },
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
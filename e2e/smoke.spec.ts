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
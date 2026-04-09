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
    expect(output).toContain('#tech');
    expect(output).toContain('#test');
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

describe('stripMarkdown', () => {
  it('strips markdown and shortens code blocks', async () => {
    const { stripMarkdown } = await import('../../scripts/generate-twitter-format.js');
    const result = stripMarkdown('This is **bold** with `code block`');
    expect(result).not.toContain('**');
    expect(result).not.toContain('`');
  });

  it('shortens long code blocks', async () => {
    const { stripMarkdown } = await import('../../scripts/generate-twitter-format.js');
    const longCode = '```js\n' + 'x'.repeat(200) + '\n```';
    const result = stripMarkdown(longCode);
    expect(result).toContain('[code:');
    expect(result).not.toContain('x'.repeat(200));
  });
});

describe('splitIntoThreadPosts', () => {
  it('truncates individual long words', async () => {
    const { splitIntoThreadPosts } = await import('../../scripts/generate-twitter-format.js');
    const longWord = 'a'.repeat(350);
    const result = splitIntoThreadPosts(longWord);
    expect(result[0]).toContain('...');
  });
});
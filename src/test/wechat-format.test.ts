import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '../../tmp/wechat-test');

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

describe('generateWeChatFormat', () => {
  it('extracts title and author', async () => {
    const filePath = writeTempMd(`---
title: "WeChat Test"
description: "Desc"
pubDate: 2024-01-01
author: CJ
tags: [test]
---
Body paragraph here.`);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('WeChat Test');
    expect(output).toContain('CJ');
  });

  it('converts markdown headers to HTML h1/h2/h3', async () => {
    const filePath = writeTempMd(`---
title: Headers
description: Desc
pubDate: 2024-01-01
---
# H1 Title
## H2 Section
### H3 Sub`);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('<h1>H1 Title</h1>');
    expect(output).toContain('<h2>H2 Section</h2>');
    expect(output).toContain('<h3>H3 Sub</h3>');
  });

  it('converts bold and italic', async () => {
    const filePath = writeTempMd(`---
title: Formatting
description: Desc
pubDate: 2024-01-01
---
This is **bold** and *italic*.`);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('<strong>bold</strong>');
    expect(output).toContain('<em>italic</em>');
  });

  it('handles code blocks', async () => {
    const filePath = writeTempMd(`---
title: Code
description: Desc
pubDate: 2024-01-01
---
\`\`\`js
console.log('hello');
\`\`\``);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('<pre><code>');
    expect(output).toContain("console.log('hello')");
  });

  it('renders tags', async () => {
    const filePath = writeTempMd(`---
title: Tags
description: Desc
pubDate: 2024-01-01
tags: [tech, javascript]
---
Body.`);
    const { generateWeChatFormat } = await import('../../scripts/generate-wechat-format.js');
    const output = generateWeChatFormat(filePath);
    expect(output).toContain('#tech');
    expect(output).toContain('#javascript');
  });
});

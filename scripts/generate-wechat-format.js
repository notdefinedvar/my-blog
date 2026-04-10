#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content };
  }

  const frontmatter = match[1];
  const body = match[2];
  const data = {};

  frontmatter.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''));
    }

    data[key] = value;
  });

  return { data, content: body };
}

function convertMarkdownToWeChatHTML(markdown) {
  let html = markdown;

  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `<a href="${escape(url)}">${escape(text)}</a>`;
  });

  html = html.replace(/!\[([^\]]*)\]\([^)]+\)/g, '<p style="color: #666; font-size: 0.9em;">[Image: $1 - upload manually to WeChat]</p>');

  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  const lines = html.split('\n');
  const processedLines = [];
  let inParagraph = false;
  let paragraphContent = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      if (inParagraph && paragraphContent.length > 0) {
        processedLines.push(`<p>${paragraphContent.join(' ')}</p>`);
        paragraphContent = [];
        inParagraph = false;
      }
      continue;
    }

    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<p ')
    ) {
      if (inParagraph && paragraphContent.length > 0) {
        processedLines.push(`<p>${paragraphContent.join(' ')}</p>`);
        paragraphContent = [];
        inParagraph = false;
      }
      processedLines.push(trimmed);
    } else {
      paragraphContent.push(trimmed);
      inParagraph = true;
    }
  }

  if (paragraphContent.length > 0) {
    processedLines.push(`<p>${paragraphContent.join(' ')}</p>`);
  }

  return processedLines.join('\n');
}

function generateWeChatFormat(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = parseFrontmatter(content);

  const title = data.title || 'Untitled';
  const author = data.author || 'Anonymous';
  const pubDate = data.pubDate
    ? new Date(data.pubDate).toLocaleDateString('zh-CN')
    : new Date().toLocaleDateString('zh-CN');
  const tags = Array.isArray(data.tags) ? data.tags : [];

  const articleHTML = convertMarkdownToWeChatHTML(body);

  const tagsHtml = tags.length > 0
    ? `<p style="color:#999;font-size:0.9em;">${tags.map((tag) => `#${tag}`).join(' ')}</p>`
    : '';

  const output = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.8; color: #333; max-width: 100%; padding: 0 15px; box-sizing: border-box;">
  <h1 style="font-size: 1.5em; text-align: center; margin: 30px 0;">${title}</h1>
  <p style="text-align: center; color: #999; font-size: 0.9em;">${author} | ${pubDate}</p>
  ${tagsHtml}
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  ${articleHTML}
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 0.8em; text-align: center;">本文由博客工具自动生成</p>
</body>
</html>`;

  return output;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-wechat-format.js <path-to-md-file>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const output = generateWeChatFormat(filePath);
  console.log(output);
}

export { generateWeChatFormat, parseFrontmatter, convertMarkdownToWeChatHTML };

const isMainModule = process.argv[1] === __filename;
if (isMainModule) {
  main();
}

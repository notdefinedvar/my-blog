#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const TWITTER_CHAR_LIMIT = 280;

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

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.slice(3, -3).replace(/.*\n/, '');
      return `[code: ${code.slice(0, 50)}...]`;
    })
    .replace(/`[^`]+`/g, (match) => match.slice(1, -1))
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/>\s+/g, '')
    .replace(/[-*+]\s+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitIntoThreadPosts(text, charLimit = TWITTER_CHAR_LIMIT) {
  const posts = [];
  const paragraphs = text.split('\n\n');
  let currentPost = '';

  for (const paragraph of paragraphs) {
    const stripped = stripMarkdown(paragraph);

    if (!stripped) continue;

    if (currentPost.length + stripped.length + 2 <= charLimit) {
      currentPost += (currentPost ? '\n\n' : '') + stripped;
    } else {
      if (currentPost) {
        posts.push(currentPost);
      }

      if (stripped.length <= charLimit) {
        currentPost = stripped;
      } else {
        const words = stripped.split(' ');
        currentPost = '';
        for (const word of words) {
          if (currentPost.length + word.length + 1 <= charLimit - 3) {
            currentPost += (currentPost ? ' ' : '') + word;
          } else {
            if (currentPost) posts.push(currentPost);
            currentPost = word.slice(0, charLimit - 3) + '...';
          }
        }
      }
    }
  }

  if (currentPost) {
    posts.push(currentPost);
  }

  return posts;
}

function generateTwitterFormat(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = parseFrontmatter(content);

  const title = data.title || 'Untitled';
  const tags = Array.isArray(data.tags) ? data.tags : [];

  const intro = `New post: "${title}"\n${data.description || ''}`;
  const strippedIntro = stripMarkdown(intro);

  const threadPosts = splitIntoThreadPosts(body);
  const totalPosts = threadPosts.length + 1;

  let output = `1/${totalPosts} ${strippedIntro}\n`;

  threadPosts.forEach((post, index) => {
    output += `\n${index + 2}/${totalPosts}\n${post}\n`;
  });

  if (tags.length > 0) {
    const hashtags = tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ');
    output += `\n${hashtags}`;
  }

  return output;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-twitter-format.js <path-to-md-file>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const output = generateTwitterFormat(filePath);
  console.log(output);
}

main();

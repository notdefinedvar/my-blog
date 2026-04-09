import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the blog schema from src/content/config.ts
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  author: z.string().default('Your Name'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

describe('Blog content schema', () => {
  it('parses valid frontmatter', () => {
    const valid = {
      title: 'Test Post',
      description: 'A test',
      pubDate: '2024-01-01',
      author: 'CJ',
      tags: ['tech'],
      draft: false,
    };
    const result = blogSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('coerces pubDate string to date', () => {
    const result = blogSchema.safeParse({
      title: 'Test',
      description: 'Test',
      pubDate: '2024-01-15',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pubDate).toBeInstanceOf(Date);
    }
  });

  it('applies defaults for missing optional fields', () => {
    const minimal = {
      title: 'Test',
      description: 'Test',
      pubDate: '2024-01-01',
    };
    const result = blogSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author).toBe('Your Name');
      expect(result.data.tags).toEqual([]);
      expect(result.data.draft).toBe(false);
    }
  });

  it('rejects missing required fields', () => {
    const incomplete = {
      title: 'Test',
      // missing description and pubDate
    };
    const result = blogSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects invalid tags type', () => {
    const invalid = {
      title: 'Test',
      description: 'Test',
      pubDate: '2024-01-01',
      tags: 'not-an-array',
    };
    const result = blogSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

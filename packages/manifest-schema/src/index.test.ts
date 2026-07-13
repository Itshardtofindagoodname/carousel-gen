import { describe, expect, test } from 'vitest';
import { validateManifest, safeValidateManifest } from './index.js';

describe('Manifest Schema Validation', () => {
  test('successfully validates a valid carousel manifest', () => {
    const validManifest = {
      brandId: 'my-brand',
      globalSettings: {
        theme: 'dark',
        aspectRatio: '4:5',
      },
      slides: [
        {
          type: 'cover',
          layout: 'hero',
          title: 'How to Build AI Agents',
          subtitle: 'A Step-by-Step Guide',
          badgeText: 'NEW GUIDE',
          components: ['badge', 'footer'],
        },
        {
          type: 'quote',
          layout: 'quote',
          title: 'Wise words',
          quote: 'Simple is better than complex.',
          author: 'Zen of Python',
        },
      ],
    };

    const parsed = validateManifest(validManifest);
    expect(parsed.slides[0]?.type).toBe('cover');
    expect(parsed.slides[1]?.type).toBe('quote');
    expect(parsed.slides[1]?.quote).toBe('Simple is better than complex.');
  });

  test('fails for empty slides array', () => {
    const invalidManifest = {
      slides: [],
    };

    const result = safeValidateManifest(invalidManifest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('At least one slide is required');
    }
  });

  test('fails for invalid layout or slide type', () => {
    const invalidManifest = {
      slides: [
        {
          type: 'invalid-type',
          layout: 'hero',
          title: 'Fail title',
        },
      ],
    };

    const result = safeValidateManifest(invalidManifest);
    expect(result.success).toBe(false);
  });
});

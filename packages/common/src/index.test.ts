import { describe, expect, test } from 'vitest';
import { greeting, wrapText } from './index.js';

describe('Common Utilities', () => {
  test('greeting exists', () => {
    expect(greeting).toBe('Hello from common');
  });

  describe('wrapText', () => {
    test('wraps text correctly based on width and font-size', () => {
      const text = 'This is a test of the text wrapping utility function.';
      // At font-size 16, avgCharWidth is ~8.32px.
      // With maxWidth 200px, maxCharsPerLine is ~24 chars.
      const result = wrapText(text, 200, 16, 1.2);

      expect(result.lines.length).toBeGreaterThan(1);
      expect(result.lineHeightInPx).toBe(16 * 1.2);
      expect(result.totalHeight).toBe(result.lines.length * 16 * 1.2);
    });

    test('handles manual newlines', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const result = wrapText(text, 500, 16, 1.5);

      expect(result.lines).toEqual(['Line 1', 'Line 2', 'Line 3']);
      expect(result.totalHeight).toBe(3 * 16 * 1.5);
    });
  });
});

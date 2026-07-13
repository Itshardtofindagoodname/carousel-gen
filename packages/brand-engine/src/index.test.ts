import * as path from 'path';
import { describe, expect, test } from 'vitest';
import { BrandEngine } from './index.js';

describe('BrandEngine', () => {
  const brandDir = path.resolve(__dirname, '../../../brand');

  test('successfully loads and validates brand directory config files', () => {
    const engine = new BrandEngine(brandDir);

    expect(engine.getBrandProfile().name).toBe('Acme Corp');
    expect(engine.getBrandProfile().handle).toBe('@acmecorp');
    expect(engine.getBrandProfile().website).toBe('https://acme.corp');
  });

  test('resolves semantic colors correctly', () => {
    const engine = new BrandEngine(brandDir);

    // Resolve semantic role
    expect(engine.getColor('background')).toBe('#0f172a');
    expect(engine.getColor('primary')).toBe('#6366f1');

    // Resolve direct palette name
    expect(engine.getColor('slate-100')).toBe('#f1f5f9');

    // Return hex directly if passed
    expect(engine.getColor('#ffffff')).toBe('#ffffff');
  });

  test('resolves gradients with target colors', () => {
    const engine = new BrandEngine(brandDir);
    const gradient = engine.getGradient('primary-grad');

    expect(gradient.type).toBe('linear');
    expect(gradient.colors).toEqual(['#6366f1', '#10b981']);
    expect(gradient.angle).toBe(135);
  });

  test('exposes semantic style helpers for rendering', () => {
    const engine = new BrandEngine(brandDir);

    expect(engine.getHeadlineStyle()).toMatchObject({
      fontSize: 48,
      fontWeight: '700',
      lineHeight: 1.05,
    });
    expect(engine.getBodyStyle()).toMatchObject({
      fontSize: 20,
      fontWeight: '400',
      lineHeight: 1.5,
    });
    expect(engine.getCTAStyle()).toMatchObject({
      color: '#6366f1',
      borderRadius: 9999,
    });
    expect(engine.getFooter()).toMatchObject({
      showHandle: true,
      showWebsite: true,
      alignment: 'spread',
    });
    expect(engine.getColorRole('surface')).toBe('#1e293b');
    expect(engine.getShadow('card')).toBe('0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
    expect(engine.getRadius('lg')).toBe(24);
    expect(engine.getBorder('thin')).toBe(1);
  });

  test('throws error when files are missing', () => {
    expect(() => new BrandEngine('./non-existent-dir')).toThrow();
  });

  test('throws error for invalid color name resolution', () => {
    const engine = new BrandEngine(brandDir);
    expect(() => engine.getColor('invalid-color-key')).toThrow();
  });
});

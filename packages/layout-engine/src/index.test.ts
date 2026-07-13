import * as path from 'path';
import { describe, expect, test } from 'vitest';
import { BrandEngine } from '@carousel-gen/brand-engine';
import { LayoutEngine } from './index.js';
import { Slide } from '@carousel-gen/manifest-schema';

describe('LayoutEngine', () => {
  const brandDir = path.resolve(__dirname, '../../../brand');
  const brand = new BrandEngine(brandDir);
  const engine = new LayoutEngine(brand);

  test('successfully resolves a hero slide layout', () => {
    const slide: Slide = {
      type: 'cover',
      layout: 'hero',
      title: 'Testing Layout Engine',
      subtitle: 'Validating placement rules',
      badgeText: 'UNIT TEST',
      components: ['badge', 'header', 'footer'],
    };

    const resolved = engine.resolveSlide(slide, 0, 5);

    expect(resolved.width).toBe(1080);
    expect(resolved.height).toBe(1350);
    expect(resolved.backgroundColor).toBe('#0f172a');

    // Should have header text, pagination, badge background, badge text, title, subtitle, and footer divider/text
    expect(resolved.nodes.length).toBeGreaterThan(5);

    // Verify presence of title node
    const titleNode = resolved.nodes.find(
      (n) => n.type === 'text' && n.text === 'Testing Layout Engine',
    );
    expect(titleNode).toBeDefined();
    expect(titleNode?.x).toBe(64); // margin
    if (titleNode && titleNode.type === 'text') {
      expect(titleNode.align).toBe('center');
    }
  });

  test('successfully resolves a split layout with illustration placeholder', () => {
    const slide: Slide = {
      type: 'content',
      layout: 'split',
      title: 'Split layout test',
      illustration: 'analytics-chart',
    };

    const resolved = engine.resolveSlide(slide, 1, 5);

    // Should contain an illustration node
    const illNode = resolved.nodes.find(
      (n) => n.type === 'illustration' && n.key === 'analytics-chart',
    );
    expect(illNode).toBeDefined();
    expect(illNode?.width).toBeCloseTo((1080 - 128 - 40) / 2);
  });

  test('successfully resolves a comparison layout', () => {
    const slide: Slide = {
      type: 'comparison',
      layout: 'comparison',
      title: 'Compare this',
      before: 'Old slow way',
      after: 'New fast way',
    };

    const resolved = engine.resolveSlide(slide, 2, 5);

    const beforeText = resolved.nodes.find((n) => n.type === 'text' && n.text === 'Old slow way');
    const afterText = resolved.nodes.find((n) => n.type === 'text' && n.text === 'New fast way');

    expect(beforeText).toBeDefined();
    expect(afterText).toBeDefined();
  });

  test('uses theme tokens for reusable badge and footer components', () => {
    const slide: Slide = {
      type: 'cover',
      layout: 'hero',
      title: 'Theme token test',
      subtitle: 'Subtitle',
      badgeText: 'BETA',
      components: ['badge', 'header', 'footer'],
    };

    const resolved = engine.resolveSlide(slide, 4, 5);
    const badgeRect = resolved.nodes.find((n) => n.type === 'rect' && n.stroke === '#6366f1');
    const footerDivider = resolved.nodes.find((n) => n.type === 'rect' && n.height === 1);

    expect(badgeRect).toBeDefined();
    expect(footerDivider).toBeDefined();
  });
});

import * as path from 'path';
import { describe, expect, test } from 'vitest';
import { BrandEngine } from '@carousel-gen/brand-engine';
import { LayoutEngine } from '@carousel-gen/layout-engine';
import { SvgRenderer } from './index.js';
import { Slide } from '@carousel-gen/manifest-schema';

describe('SvgRenderer', () => {
  const brandDir = path.resolve(__dirname, '../../../brand');
  const brand = new BrandEngine(brandDir);
  const layout = new LayoutEngine(brand);
  const renderer = new SvgRenderer(brand);

  test('renders a valid SVG markup string from resolved slide', () => {
    const slide: Slide = {
      type: 'cover',
      layout: 'hero',
      title: 'SVG Render Testing',
      subtitle: 'Deterministic output',
      badgeText: 'SVG ENGINE',
      components: ['badge', 'header', 'footer'],
    };

    const resolved = layout.resolveSlide(slide, 0, 1);
    const svg = renderer.render(resolved);

    // Root element checks
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('viewBox="0 0 1080 1350"');

    // Defs checks
    expect(svg).toContain('<defs>');
    expect(svg).toContain('@import url');
    expect(svg).toContain('id="primary-grad"');
    expect(svg).toContain('id="shadow-md"');

    // Element rendering checks
    expect(svg).toContain('SVG Render Testing');
    expect(svg).toContain('Deterministic output');
    expect(svg).toContain('SVG ENGINE');
    expect(svg).toContain('rect');
    expect(svg).toContain('text');
  });

  test('renders slide illustrations', () => {
    const slide: Slide = {
      type: 'content',
      layout: 'split',
      title: 'Testing Split Illustration',
      illustration: 'analytics-chart',
    };

    const resolved = layout.resolveSlide(slide, 0, 1);
    const svg = renderer.render(resolved);

    expect(svg).toContain('<g transform="translate');
    expect(svg).toContain('analytics-chart');
  });
});

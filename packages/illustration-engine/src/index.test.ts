import * as path from 'path';
import { describe, expect, test } from 'vitest';
import { BrandEngine } from '@carousel-gen/brand-engine';
import { IllustrationEngine } from './index.js';

describe('IllustrationEngine', () => {
  const brandDir = path.resolve(__dirname, '../../../brand');
  const brand = new BrandEngine(brandDir);
  const engine = new IllustrationEngine(brand);

  test('successfully draws standard shapes for registered keys', () => {
    const chartSvg = engine.draw('analytics-chart', 400, 300);
    expect(chartSvg).toContain('<rect');
    expect(chartSvg).toContain('circle');
    expect(chartSvg).toContain('path');
    expect(chartSvg).toContain('M 40');

    const quoteSvg = engine.draw('quote-marks', 100, 100);
    expect(quoteSvg).toContain('“');

    const flowSvg = engine.draw('flow-diagram', 500, 200);
    expect(flowSvg).toContain('PLAN');
    expect(flowSvg).toContain('BUILD');
    expect(flowSvg).toContain('LAUNCH');
  });

  test('falls back to default drawer for unknown keys', () => {
    const defaultSvg = engine.draw('unknown-illustration-key', 300, 300);
    expect(defaultSvg).toContain('circle');
    expect(defaultSvg).toContain('url(#primary-grad)');
  });
});

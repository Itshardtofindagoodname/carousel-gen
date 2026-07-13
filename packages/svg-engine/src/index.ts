import { BrandEngine } from '@carousel-gen/brand-engine';
import { ResolvedSlide, ResolvedNode } from '@carousel-gen/layout-engine';
import { wrapText } from '@carousel-gen/common';

export class SvgRenderer {
  private brand: BrandEngine;

  constructor(brand: BrandEngine) {
    this.brand = brand;
  }

  /**
   * Renders a resolved slide into a standalone SVG string.
   */
  render(resolved: ResolvedSlide): string {
    const { width, height, backgroundColor, nodes } = resolved;

    // Build defs (fonts, gradients, filters for shadows)
    const defs = this.buildDefs();

    // Render nodes to SVG elements
    const svgNodes = nodes.map((node) => this.renderNode(node)).join('\n  ');

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${defs}
  </defs>
  <!-- Slide Background -->
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  
  <!-- Slide Content -->
  ${svgNodes}
</svg>`;
  }

  private buildDefs(): string {
    const typography = this.brand.getTypographyConfig();
    const colorsConfig = this.brand.getColorsConfig();

    // 1. Google Fonts imports
    const titleFont = encodeURIComponent(typography.fonts.title);
    const bodyFont = encodeURIComponent(typography.fonts.body);
    const fontImport = `<style>
      @import url('https://fonts.googleapis.com/css2?family=${titleFont}:wght@400;500;700&amp;family=${bodyFont}:wght@400;500;700&amp;display=swap');
    </style>`;

    // 2. Shadows (drop shadow filters)
    const shadows = `
    <filter id="shadow-sm" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.1" />
    </filter>
    <filter id="shadow-md" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.15" />
    </filter>
    <filter id="shadow-lg" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000" flood-opacity="0.2" />
    </filter>
    `;

    // 3. Gradients
    let gradientsXml = '';
    if (colorsConfig.gradients) {
      for (const [name, grad] of Object.entries(colorsConfig.gradients)) {
        const resolvedColors = grad.colors.map((c) => this.brand.getColor(c));
        if (grad.type === 'linear') {
          const angle = grad.angle ?? 90;
          // Map angle to x1, y1, x2, y2 coordinates
          const angleRad = (angle * Math.PI) / 180;
          const x1 = Math.round(50 - Math.cos(angleRad) * 50);
          const y1 = Math.round(50 - Math.sin(angleRad) * 50);
          const x2 = Math.round(50 + Math.cos(angleRad) * 50);
          const y2 = Math.round(50 + Math.sin(angleRad) * 50);

          gradientsXml += `
    <linearGradient id="${name}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      ${resolvedColors.map((color, idx) => `<stop offset="${Math.round((idx / (resolvedColors.length - 1)) * 100)}%" stop-color="${color}" />`).join('\n      ')}
    </linearGradient>`;
        }
      }
    }

    return `${fontImport}
    ${shadows}
    ${gradientsXml}`;
  }

  private renderNode(node: ResolvedNode): string {
    switch (node.type) {
      case 'rect': {
        const x = node.x;
        const y = node.y;
        const w = node.width;
        const h = node.height;
        const rx = node.borderRadius ? ` rx="${node.borderRadius}"` : '';

        let fill = 'none';
        if (node.fill) {
          // If fill matches a gradient name, reference it
          const gradients = this.brand.getColorsConfig().gradients ?? {};
          if (node.fill in gradients) {
            fill = `url(#${node.fill})`;
          } else {
            fill = this.brand.getColor(node.fill);
          }
        }

        let stroke = '';
        if (node.stroke) {
          const strokeColor = this.brand.getColor(node.stroke);
          const strokeW = node.strokeWidth ?? 1;
          stroke = ` stroke="${strokeColor}" stroke-width="${strokeW}"`;
        }

        const filter = node.shadow ? ` filter="url(#shadow-${node.shadow})"` : '';

        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rx}${stroke}${filter} />`;
      }

      case 'text': {
        const align = node.align ?? 'left';
        let textAnchor = 'start';
        let lineX = node.x;

        if (align === 'center') {
          textAnchor = 'middle';
          lineX = node.x + node.width / 2;
        } else if (align === 'right') {
          textAnchor = 'end';
          lineX = node.x + node.width;
        }

        // Split text using the wrapText utility
        const wrapped = wrapText(node.text, node.width, node.fontSize, node.lineHeight);

        // Build tspans
        const tspans = wrapped.lines
          .map((line, idx) => {
            const dy = idx === 0 ? `${node.fontSize * 0.85}px` : `${wrapped.lineHeightInPx}px`;
            return `<tspan x="${lineX}" dy="${dy}">${this.escapeXml(line)}</tspan>`;
          })
          .join('\n      ');

        const weight = ` font-weight="${node.fontWeight}"`;

        return `<text x="${lineX}" y="${node.y}" font-family="${node.fontFamily}" font-size="${node.fontSize}"${weight} fill="${node.color}" text-anchor="${textAnchor}">
      ${tspans}
    </text>`;
      }

      case 'illustration': {
        // Return a beautiful procedurally generated vector group as a placeholder
        // until Milestone 6 (Illustration Engine) is fully active.
        return this.renderIllustrationPlaceholder(
          node.key,
          node.x,
          node.y,
          node.width,
          node.height,
        );
      }

      case 'image': {
        return `<image href="${node.path}" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" />`;
      }

      default:
        return '';
    }
  }

  private renderIllustrationPlaceholder(
    key: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ): string {
    const primaryColor = this.brand.getColor('primary');
    const successColor = this.brand.getColor('success');
    const surfaceColor = this.brand.getColor('surface');

    // Return different shapes depending on key to simulate dynamic illustrations
    if (key === 'analytics-chart') {
      return `<g transform="translate(${x}, ${y})"><!-- illustration: ${key} -->
        <!-- Background Grid -->
        <rect width="${w}" height="${h}" fill="${surfaceColor}" rx="12" opacity="0.5" />
        <!-- Graph Line -->
        <path d="M 30 ${h - 40} L ${w * 0.3} ${h * 0.5} L ${w * 0.6} ${h * 0.65} L ${w - 30} 40" fill="none" stroke="${primaryColor}" stroke-width="4" stroke-linecap="round" />
        <!-- Glowing Dots -->
        <circle cx="30" cy="${h - 40}" r="6" fill="${primaryColor}" />
        <circle cx="${w * 0.3}" cy="${h * 0.5}" r="6" fill="${primaryColor}" />
        <circle cx="${w * 0.6}" cy="${h * 0.65}" r="6" fill="${primaryColor}" />
        <circle cx="${w - 30}" cy="40" r="8" fill="${successColor}" />
      </g>`;
    }

    if (key === 'quote-marks') {
      return `<g transform="translate(${x}, ${y})"><!-- illustration: ${key} -->
        <text font-family="serif" font-size="${Math.min(w, h)}" fill="${primaryColor}" opacity="0.15" x="0" y="${h}">“</text>
      </g>`;
    }

    // Default geometric placeholder
    return `<g transform="translate(${x}, ${y})"><!-- illustration: ${key} -->
      <rect width="${w}" height="${h}" fill="${surfaceColor}" rx="16" opacity="0.6" />
      <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.25}" fill="${primaryColor}" opacity="0.8" />
      <circle cx="${w / 2 + 30}" cy="${h / 2 - 20}" r="${Math.min(w, h) * 0.15}" fill="url(#primary-grad)" opacity="0.9" />
    </g>`;
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case "'":
          return '&apos;';
        case '"':
          return '&quot;';
        default:
          return c;
      }
    });
  }
}

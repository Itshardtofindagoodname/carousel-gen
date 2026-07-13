import { BrandEngine } from '@carousel-gen/brand-engine';

export interface DrawParams {
  brand: BrandEngine;
  width: number;
  height: number;
}

export type DrawerFunction = (params: DrawParams) => string;

export class IllustrationEngine {
  private brand: BrandEngine;
  private registry = new Map<string, DrawerFunction>();

  constructor(brand: BrandEngine) {
    this.brand = brand;
    this.registerDefaults();
  }

  register(key: string, drawer: DrawerFunction) {
    this.registry.set(key, drawer);
  }

  draw(key: string, width: number, height: number): string {
    const drawer = this.registry.get(key) || this.registry.get('default');
    if (!drawer) {
      throw new Error(`No illustration drawer registered for key "${key}"`);
    }
    return drawer({ brand: this.brand, width, height });
  }

  private registerDefaults() {
    this.registry.set('analytics-chart', drawAnalyticsChart);
    this.registry.set('quote-marks', drawQuoteMarks);
    this.registry.set('flow-diagram', drawFlowDiagram);
    this.registry.set('growth-arrow', drawGrowthArrow);
    this.registry.set('tech-stack', drawTechStack);
    this.registry.set('default', drawDefault);
  }
}

// Concrete SVG drawing functions

function drawAnalyticsChart({ brand, width, height }: DrawParams): string {
  const primary = brand.getColor('primary');
  const success = brand.getColor('success');
  const surface = brand.getColor('surface');
  const textSecondary = brand.getColor('textSecondary');

  // Background card
  const bg = `<rect width="${width}" height="${height}" fill="${surface}" rx="16" opacity="0.4" />`;

  // Gridlines
  let gridLines = '';
  const rows = 4;
  for (let i = 1; i < rows; i++) {
    const y = (height / rows) * i;
    gridLines += `<line x1="20" y1="${y}" x2="${width - 20}" y2="${y}" stroke="${textSecondary}" stroke-width="1" opacity="0.1" stroke-dasharray="4" />\n`;
  }

  // Graph data points
  const p1 = { x: 40, y: height - 50 };
  const p2 = { x: width * 0.35, y: height * 0.55 };
  const p3 = { x: width * 0.65, y: height * 0.65 };
  const p4 = { x: width - 40, y: 50 };

  // Smooth cubic bezier path
  const controlPt1 = { x: (p1.x + p2.x) / 2, y: p1.y };
  const controlPt2 = { x: (p1.x + p2.x) / 2, y: p2.y };
  const controlPt3 = { x: (p2.x + p3.x) / 2, y: p2.y };
  const controlPt4 = { x: (p2.x + p3.x) / 2, y: p3.y };
  const controlPt5 = { x: (p3.x + p4.x) / 2, y: p3.y };
  const controlPt6 = { x: (p3.x + p4.x) / 2, y: p4.y };

  const pathD = `M ${p1.x} ${p1.y} 
                 C ${controlPt1.x} ${controlPt1.y}, ${controlPt2.x} ${controlPt2.y}, ${p2.x} ${p2.y}
                 C ${controlPt3.x} ${controlPt3.y}, ${controlPt4.x} ${controlPt4.y}, ${p3.x} ${p3.y}
                 C ${controlPt5.x} ${controlPt5.y}, ${controlPt6.x} ${controlPt6.y}, ${p4.x} ${p4.y}`;

  // Area under path
  const areaD = `${pathD} L ${p4.x} ${height - 30} L ${p1.x} ${height - 30} Z`;

  const fillArea = `<path d="${areaD}" fill="url(#primary-grad)" opacity="0.15" />`;
  const strokeLine = `<path d="${pathD}" fill="none" stroke="${primary}" stroke-width="5" stroke-linecap="round" />`;

  // Nodes/dots
  const dots = `
    <circle cx="${p1.x}" cy="${p1.y}" r="6" fill="${primary}" />
    <circle cx="${p2.x}" cy="${p2.y}" r="6" fill="${primary}" />
    <circle cx="${p3.x}" cy="${p3.y}" r="6" fill="${primary}" />
    <circle cx="${p4.x}" cy="${p4.y}" r="10" fill="${success}" stroke="${surface}" stroke-width="3" />
  `;

  return `${bg}
  ${gridLines}
  ${fillArea}
  ${strokeLine}
  ${dots}`;
}

function drawQuoteMarks({ brand, width, height }: DrawParams): string {
  const primary = brand.getColor('primary');
  const size = Math.min(width, height) * 0.8;
  return `<text font-family="serif" font-size="${size}" fill="${primary}" opacity="0.15" x="${(width - size) / 2}" y="${height * 0.85}">“</text>`;
}

function drawFlowDiagram({ brand, width, height }: DrawParams): string {
  const primary = brand.getColor('primary');
  const success = brand.getColor('success');
  const surface = brand.getColor('surface');
  const textPrimary = brand.getColor('textPrimary');

  const cardW = width * 0.26;
  const cardH = height * 0.5;
  const cardY = (height - cardH) / 2;

  const cards = [
    { x: width * 0.08, label: 'PLAN' },
    { x: width * 0.37, label: 'BUILD' },
    { x: width * 0.66, label: 'LAUNCH' },
  ];

  let svg = '';

  // Draw connecting arrows first
  for (let i = 0; i < cards.length - 1; i++) {
    const currentCard = cards[i]!;
    const nextCard = cards[i + 1]!;
    const startX = currentCard.x + cardW;
    const endX = nextCard.x;
    const arrowY = height / 2;

    svg += `<g opacity="0.5">
      <line x1="${startX + 10}" y1="${arrowY}" x2="${endX - 15}" y2="${arrowY}" stroke="${primary}" stroke-width="3" stroke-dasharray="4" />
      <polygon points="${endX - 15},${arrowY - 6} ${endX - 5},${arrowY} ${endX - 15},${arrowY + 6}" fill="${primary}" />
    </g>\n`;
  }

  // Draw cards
  cards.forEach((card, idx) => {
    const isLast = idx === cards.length - 1;
    const activeColor = isLast ? success : primary;

    svg += `
    <!-- Card box -->
    <rect x="${card.x}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${surface}" rx="12" stroke="${activeColor}" stroke-width="2" opacity="0.9" />
    <!-- Index circle -->
    <circle cx="${card.x + cardW / 2}" cy="${cardY + 36}" r="16" fill="${activeColor}" />
    <text x="${card.x + cardW / 2}" y="${cardY + 42}" font-family="sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">${idx + 1}</text>
    <!-- Label -->
    <text x="${card.x + cardW / 2}" y="${cardY + cardH - 24}" font-family="sans-serif" font-size="14" font-weight="700" fill="${textPrimary}" text-anchor="middle">${card.label}</text>
    `;
  });

  return svg;
}

function drawGrowthArrow({ brand, width, height }: DrawParams): string {
  const success = brand.getColor('success');
  const surface = brand.getColor('surface');

  // Draw growing bar charts
  const bars = [
    { h: height * 0.3, w: width * 0.12, x: width * 0.15 },
    { h: height * 0.45, w: width * 0.12, x: width * 0.35 },
    { h: height * 0.6, w: width * 0.12, x: width * 0.55 },
    { h: height * 0.75, w: width * 0.12, x: width * 0.75 },
  ];

  let svg = '';

  bars.forEach((bar) => {
    svg += `<rect x="${bar.x}" y="${height - bar.h - 20}" width="${bar.w}" height="${bar.h}" fill="${surface}" rx="8" opacity="0.6" />\n`;
  });

  // Diagonal ascending arrow path
  const arrowStartX = width * 0.15;
  const arrowStartY = height * 0.75;
  const arrowEndX = width * 0.85;
  const arrowEndY = height * 0.2;

  svg += `
    <path d="M ${arrowStartX} ${arrowStartY} Q ${width * 0.5} ${height * 0.6}, ${arrowEndX} ${arrowEndY}" fill="none" stroke="${success}" stroke-width="6" stroke-linecap="round" />
    <polygon points="${arrowEndX - 5},${arrowEndY + 20} ${arrowEndX},${arrowEndY} ${arrowEndX - 20},${arrowEndY + 5}" fill="${success}" />
  `;

  return svg;
}

function drawTechStack({ brand, width, height }: DrawParams): string {
  const primary = brand.getColor('primary');
  const surface = brand.getColor('surface');
  const textPrimary = brand.getColor('textPrimary');

  const stackW = width * 0.7;
  const layerH = height * 0.18;
  const startY = height * 0.2;
  const spacing = layerH + 16;

  const layers = [
    { name: 'Application Layer', color: brand.getColor('success') },
    { name: 'Logic / API Engine', color: primary },
    { name: 'Manifest Schema', color: brand.getColor('warning') },
  ];

  let svg = '';

  layers.forEach((layer, idx) => {
    const y = startY + idx * spacing;

    svg += `
    <!-- Layer Card -->
    <rect x="${(width - stackW) / 2}" y="${y}" width="${stackW}" height="${layerH}" fill="${surface}" rx="12" stroke="${layer.color}" stroke-width="2" />
    <!-- Colored accent indicator on the left side of card -->
    <rect x="${(width - stackW) / 2 + 2}" y="${y + 2}" width="8" height="${layerH - 4}" fill="${layer.color}" rx="4" />
    <!-- Label -->
    <text x="${width / 2}" y="${y + layerH / 2 + 6}" font-family="sans-serif" font-size="16" font-weight="700" fill="${textPrimary}" text-anchor="middle">${layer.name}</text>
    `;
  });

  return svg;
}

function drawDefault({ brand, width, height }: DrawParams): string {
  const primary = brand.getColor('primary');
  const surface = brand.getColor('surface');

  return `
    <rect width="${width}" height="${height}" fill="${surface}" rx="16" opacity="0.4" />
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.25}" fill="${primary}" opacity="0.6" />
    <circle cx="${width / 2 + 30}" cy="${height / 2 - 20}" r="${Math.min(width, height) * 0.18}" fill="url(#primary-grad)" opacity="0.8" />
  `;
}

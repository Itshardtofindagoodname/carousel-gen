import { BrandEngine } from '@carousel-gen/brand-engine';
import { Slide } from '@carousel-gen/manifest-schema';
import { wrapText } from '@carousel-gen/common';

export interface ResolvedTextNode {
  type: 'text';
  text: string;
  fontRole: 'title' | 'body' | 'caption';
  fontSize: number;
  fontWeight: string | number;
  lineHeight: number;
  color: string;
  x: number;
  y: number;
  width: number;
  align?: 'left' | 'center' | 'right';
  fontFamily: string;
}

export interface ResolvedRectNode {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shadow?: string;
}

export interface ResolvedIllustrationNode {
  type: 'illustration';
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResolvedImageNode {
  type: 'image';
  path: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResolvedNode =
  ResolvedTextNode | ResolvedRectNode | ResolvedIllustrationNode | ResolvedImageNode;

export interface ResolvedSlide {
  width: number;
  height: number;
  backgroundColor: string;
  nodes: ResolvedNode[];
}

export class LayoutEngine {
  private brand: BrandEngine;

  constructor(brand: BrandEngine) {
    this.brand = brand;
  }

  private renderBadge(nodes: ResolvedNode[], x: number, y: number, width: number, height: number, label: string) {
    const fill = this.brand.getColorRole('surface');
    const radius = this.brand.getRadius('full');
    const borderColor = this.brand.getColorRole('primary');

    nodes.push({
      type: 'rect',
      x,
      y,
      width,
      height,
      fill,
      borderRadius: radius,
      stroke: borderColor,
      strokeWidth: this.brand.getBorder('thin'),
      shadow: this.brand.getShadow('sm'),
    });

    nodes.push({
      type: 'text',
      text: label.toUpperCase(),
      fontRole: 'caption',
      fontSize: this.brand.getTypography('caption').fontSize,
      fontWeight: this.brand.getTypography('caption').fontWeight,
      lineHeight: this.brand.getTypography('caption').lineHeight,
      color: this.brand.getColorRole('primary'),
      x,
      y: y + height / 3,
      width,
      align: 'center',
      fontFamily: this.brand.getTypography('caption').fontFamily,
    });
  }

  private renderFooter(nodes: ResolvedNode[], contentX: number, contentWidth: number, y: number, footerConfig: ReturnType<BrandEngine['getFooter']>) {
    nodes.push({
      type: 'rect',
      x: contentX,
      y,
      width: contentWidth,
      height: 1,
      fill: this.brand.getColorRole('surface'),
    });

    if (footerConfig.showWebsite) {
      nodes.push({
        type: 'text',
        text: this.brand.getBrandProfile().website.replace(/^https?:\/\//, ''),
        fontRole: 'caption',
        fontSize: this.brand.getTypography('caption').fontSize,
        fontWeight: this.brand.getTypography('caption').fontWeight,
        lineHeight: this.brand.getTypography('caption').lineHeight,
        color: this.brand.getColorRole('textSecondary'),
        x: contentX,
        y: y + this.brand.getSpacing('md'),
        width: contentWidth / 2,
        align: 'left',
        fontFamily: this.brand.getTypography('caption').fontFamily,
      });
    }

    if (footerConfig.showHandle) {
      nodes.push({
        type: 'text',
        text: this.brand.getBrandProfile().handle,
        fontRole: 'caption',
        fontSize: this.brand.getTypography('caption').fontSize,
        fontWeight: this.brand.getTypography('caption').fontWeight,
        lineHeight: this.brand.getTypography('caption').lineHeight,
        color: this.brand.getColorRole('primary'),
        x: contentX + contentWidth / 2,
        y: y + this.brand.getSpacing('md'),
        width: contentWidth / 2,
        align: 'right',
        fontFamily: this.brand.getTypography('caption').fontFamily,
      });
    }
  }

  resolveSlide(slide: Slide, pageIndex: number, totalSlides: number): ResolvedSlide {
    const layoutConfig = this.brand.getLayoutConfig();
    const width = layoutConfig.slideWidth;
    const height = layoutConfig.slideHeight;
    const margin = layoutConfig.safeMargin;
    const spacing = this.brand.getSpacingScale();

    const nodes: ResolvedNode[] = [];

    // Background color
    const bgColor = this.brand.getColor('background');

    // Safe bounds
    const contentX = margin;
    const contentY = margin;
    const contentWidth = width - 2 * margin;

    // Fonts & Colors config
    const typography = this.brand.getTypographyConfig();
    const titleStyle = this.brand.getHeadlineStyle();
    const bodyStyle = this.brand.getBodyStyle();
    const captionStyle = this.brand.getTypography('caption');
    const titleFont = titleStyle.fontFamily;
    const bodyFont = bodyStyle.fontFamily;

    const colorTextPrimary = this.brand.getColorRole('textPrimary');
    const colorTextSecondary = this.brand.getColorRole('textSecondary');
    const colorPrimary = this.brand.getColorRole('primary');
    const colorSurface = this.brand.getColorRole('surface');

    // 1. Resolve Header (if header is enabled in components/slide)
    const showHeader = slide.components?.includes('header') ?? true;
    const headerHeight = spacing.md + spacing.sm;
    let activeTop = contentY;

    if (showHeader) {
      // Header Text: Brand Name
      nodes.push({
        type: 'text',
        text: this.brand.getBrandProfile().name,
        fontRole: 'caption',
        fontSize: captionStyle.fontSize,
        fontWeight: captionStyle.fontWeight,
        lineHeight: captionStyle.lineHeight,
        color: colorPrimary,
        x: contentX,
        y: contentY + 20,
        width: contentWidth / 2,
        align: 'left',
        fontFamily: captionStyle.fontFamily,
      });

      // Pagination
      const pageStr = `${String(pageIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
      nodes.push({
        type: 'text',
        text: pageStr,
        fontRole: 'caption',
        fontSize: captionStyle.fontSize,
        fontWeight: captionStyle.fontWeight,
        lineHeight: captionStyle.lineHeight,
        color: colorTextSecondary,
        x: contentX + contentWidth / 2,
        y: contentY + 20,
        width: contentWidth / 2,
        align: 'right',
        fontFamily: captionStyle.fontFamily,
      });

      activeTop += headerHeight;
    }

    // 2. Resolve Footer
    const showFooter = slide.components?.includes('footer') ?? true;
    const footerHeight = spacing.lg + spacing.sm;
    const activeBottom = showFooter ? height - margin - footerHeight : height - margin;

    if (showFooter) {
      const footerConfig = this.brand.getFooter();

      this.renderFooter(nodes, contentX, contentWidth, activeBottom, footerConfig);
    }

    // Compute active height for the layout
    const layoutHeight = activeBottom - activeTop;

    // 3. Resolve Layout Specific Content
    switch (slide.layout) {
      case 'hero': {
        // Centered text layout
        let yCursor = activeTop + layoutHeight * 0.22;

        // Badge
        if (slide.badgeText) {
          const badgeWidth = spacing.xl * 3;
          const badgeHeight = spacing.lg;
          this.renderBadge(
            nodes,
            contentX + (contentWidth - badgeWidth) / 2,
            yCursor,
            badgeWidth,
            badgeHeight,
            slide.badgeText,
          );

          yCursor += spacing.xl;
        }

        // Title
        const wrappedTitle = wrapText(
          slide.title,
          contentWidth,
          typography.sizes.title,
          typography.lineHeights.title,
        );
        nodes.push({
          type: 'text',
          text: slide.title,
          fontRole: 'title',
          fontSize: typography.sizes.title,
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.title,
          color: colorTextPrimary,
          x: contentX,
          y: yCursor,
          width: contentWidth,
          align: 'center',
          fontFamily: titleFont,
        });

        yCursor += wrappedTitle.totalHeight + 30;

        // Subtitle
        if (slide.subtitle) {
          nodes.push({
            type: 'text',
            text: slide.subtitle,
            fontRole: 'body',
            fontSize: typography.sizes.subtitle,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.body,
            color: colorTextSecondary,
            x: contentX,
            y: yCursor,
            width: contentWidth,
            align: 'center',
            fontFamily: bodyFont,
          });
        }

        // Illustration in hero layout
        if (slide.illustration) {
          const illSize = Math.min(260, width * 0.24);
          nodes.push({
            type: 'illustration',
            key: slide.illustration,
            x: contentX + (contentWidth - illSize) / 2,
            y: activeBottom - illSize - 40,
            width: illSize,
            height: illSize,
          });
        }
        break;
      }

      case 'split': {
        // Left side text, Right side illustration
        const colWidth = (contentWidth - 40) / 2;
        let yCursor = activeTop + layoutHeight * 0.15;

        // Badge
        if (slide.badgeText) {
          const badgeWidth = 140;
          const badgeHeight = 32;
          nodes.push({
            type: 'rect',
            x: contentX,
            y: yCursor,
            width: badgeWidth,
            height: badgeHeight,
            fill: colorSurface,
            borderRadius: 16,
          });

          nodes.push({
            type: 'text',
            text: slide.badgeText.toUpperCase(),
            fontRole: 'caption',
            fontSize: typography.sizes.caption,
            fontWeight: typography.weights.bold,
            lineHeight: 1.0,
            color: colorPrimary,
            x: contentX,
            y: yCursor + 8,
            width: badgeWidth,
            align: 'center',
            fontFamily: titleFont,
          });

          yCursor += 50;
        }

        // Title
        const wrappedTitle = wrapText(
          slide.title,
          colWidth,
          typography.sizes.title,
          typography.lineHeights.title,
        );
        nodes.push({
          type: 'text',
          text: slide.title,
          fontRole: 'title',
          fontSize: typography.sizes.title,
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.title,
          color: colorTextPrimary,
          x: contentX,
          y: yCursor,
          width: colWidth,
          align: 'left',
          fontFamily: titleFont,
        });

        yCursor += wrappedTitle.totalHeight + 20;

        // Subtitle / Description
        if (slide.subtitle) {
          nodes.push({
            type: 'text',
            text: slide.subtitle,
            fontRole: 'body',
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.body,
            color: colorTextSecondary,
            x: contentX,
            y: yCursor,
            width: colWidth,
            align: 'left',
            fontFamily: bodyFont,
          });
        }

        // Right side Illustration
        if (slide.illustration) {
          const illWidth = colWidth;
          const illHeight = Math.min(layoutHeight * 0.7, colWidth * 1.2);
          nodes.push({
            type: 'illustration',
            key: slide.illustration,
            x: contentX + colWidth + 40,
            y: activeTop + (layoutHeight - illHeight) / 2,
            width: illWidth,
            height: illHeight,
          });
        }
        break;
      }

      case 'comparison': {
        // Title on top, Before / After side by side below
        let yCursor = activeTop + 40;

        // Title
        const wrappedTitle = wrapText(
          slide.title,
          contentWidth,
          typography.sizes.subtitle,
          typography.lineHeights.title,
        );
        nodes.push({
          type: 'text',
          text: slide.title,
          fontRole: 'title',
          fontSize: typography.sizes.subtitle,
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.title,
          color: colorTextPrimary,
          x: contentX,
          y: yCursor,
          width: contentWidth,
          align: 'center',
          fontFamily: titleFont,
        });

        yCursor += wrappedTitle.totalHeight + 50;

        // Side-by-side cards
        const cardWidth = (contentWidth - 40) / 2;
        const cardHeight = Math.min(450, layoutHeight - wrappedTitle.totalHeight - 120);

        // Before Card
        nodes.push({
          type: 'rect',
          x: contentX,
          y: yCursor,
          width: cardWidth,
          height: cardHeight,
          fill: colorSurface,
          borderRadius: 16,
        });

        // "BEFORE" Label
        nodes.push({
          type: 'text',
          text: 'BEFORE',
          fontRole: 'caption',
          fontSize: typography.sizes.caption,
          fontWeight: typography.weights.bold,
          lineHeight: 1.0,
          color: this.brand.getColor('warning'),
          x: contentX + 24,
          y: yCursor + 24,
          width: cardWidth - 48,
          align: 'left',
          fontFamily: titleFont,
        });

        // Before Content
        if (slide.before) {
          nodes.push({
            type: 'text',
            text: slide.before,
            fontRole: 'body',
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.body,
            color: colorTextPrimary,
            x: contentX + 24,
            y: yCursor + 70,
            width: cardWidth - 48,
            align: 'left',
            fontFamily: bodyFont,
          });
        }

        // After Card
        nodes.push({
          type: 'rect',
          x: contentX + cardWidth + 40,
          y: yCursor,
          width: cardWidth,
          height: cardHeight,
          fill: colorSurface,
          borderRadius: 16,
          stroke: colorPrimary,
          strokeWidth: 2,
        });

        // "AFTER" Label
        nodes.push({
          type: 'text',
          text: 'AFTER',
          fontRole: 'caption',
          fontSize: typography.sizes.caption,
          fontWeight: typography.weights.bold,
          lineHeight: 1.0,
          color: this.brand.getColor('success'),
          x: contentX + cardWidth + 40 + 24,
          y: yCursor + 24,
          width: cardWidth - 48,
          align: 'left',
          fontFamily: titleFont,
        });

        // After Content
        if (slide.after) {
          nodes.push({
            type: 'text',
            text: slide.after,
            fontRole: 'body',
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.body,
            color: colorTextPrimary,
            x: contentX + cardWidth + 40 + 24,
            y: yCursor + 70,
            width: cardWidth - 48,
            align: 'left',
            fontFamily: bodyFont,
          });
        }
        break;
      }

      case 'quote': {
        let yCursor = activeTop + layoutHeight * 0.2;

        // Large Quote Icon Node
        nodes.push({
          type: 'text',
          text: '“',
          fontRole: 'title',
          fontSize: 120,
          fontWeight: '700',
          lineHeight: 1.0,
          color: colorPrimary,
          x: contentX,
          y: yCursor,
          width: contentWidth,
          align: 'center',
          fontFamily: titleFont,
        });

        yCursor += 100;

        // Quote text
        const quoteText = slide.quote ?? slide.title;
        const wrappedQuote = wrapText(quoteText, contentWidth - 80, typography.sizes.subtitle, 1.4);
        nodes.push({
          type: 'text',
          text: quoteText,
          fontRole: 'title',
          fontSize: typography.sizes.subtitle,
          fontWeight: typography.weights.medium,
          lineHeight: 1.4,
          color: colorTextPrimary,
          x: contentX + 40,
          y: yCursor,
          width: contentWidth - 80,
          align: 'center',
          fontFamily: titleFont,
        });

        yCursor += wrappedQuote.totalHeight + 40;

        // Author
        if (slide.author) {
          nodes.push({
            type: 'text',
            text: `— ${slide.author}`,
            fontRole: 'body',
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.bold,
            lineHeight: typography.lineHeights.body,
            color: colorTextSecondary,
            x: contentX,
            y: yCursor,
            width: contentWidth,
            align: 'center',
            fontFamily: bodyFont,
          });
        }
        break;
      }

      case 'steps': {
        let yCursor = activeTop + 40;

        // Title
        const wrappedTitle = wrapText(
          slide.title,
          contentWidth,
          typography.sizes.subtitle,
          typography.lineHeights.title,
        );
        nodes.push({
          type: 'text',
          text: slide.title,
          fontRole: 'title',
          fontSize: typography.sizes.subtitle,
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.title,
          color: colorTextPrimary,
          x: contentX,
          y: yCursor,
          width: contentWidth,
          align: 'left',
          fontFamily: titleFont,
        });

        yCursor += wrappedTitle.totalHeight + 40;

        // Steps cards
        const steps = slide.steps ?? [];
        const stepHeight = Math.min(
          100,
          (activeBottom - yCursor - (steps.length - 1) * 20) / steps.length,
        );

        steps.forEach((step, idx) => {
          const stepY = yCursor + idx * (stepHeight + 20);

          // Card Background
          nodes.push({
            type: 'rect',
            x: contentX,
            y: stepY,
            width: contentWidth,
            height: stepHeight,
            fill: colorSurface,
            borderRadius: 12,
          });

          // Number Circle Background
          const circleSize = 40;
          const circleY = stepY + (stepHeight - circleSize) / 2;
          nodes.push({
            type: 'rect',
            x: contentX + 20,
            y: circleY,
            width: circleSize,
            height: circleSize,
            fill: colorPrimary,
            borderRadius: circleSize / 2,
          });

          // Number Text
          nodes.push({
            type: 'text',
            text: String(idx + 1),
            fontRole: 'body',
            fontSize: 18,
            fontWeight: typography.weights.bold,
            lineHeight: 1.0,
            color: '#ffffff',
            x: contentX + 20,
            y: circleY + 11,
            width: circleSize,
            align: 'center',
            fontFamily: titleFont,
          });

          // Step Text
          nodes.push({
            type: 'text',
            text: step,
            fontRole: 'body',
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.medium,
            lineHeight: typography.lineHeights.body,
            color: colorTextPrimary,
            x: contentX + circleSize + 40,
            y: stepY + (stepHeight - typography.sizes.body * typography.lineHeights.body) / 2,
            width: contentWidth - circleSize - 60,
            align: 'left',
            fontFamily: bodyFont,
          });
        });
        break;
      }

      case 'bullets': {
        let yCursor = activeTop + 40;

        // Title
        const wrappedTitle = wrapText(
          slide.title,
          contentWidth,
          typography.sizes.subtitle,
          typography.lineHeights.title,
        );
        nodes.push({
          type: 'text',
          text: slide.title,
          fontRole: 'title',
          fontSize: typography.sizes.subtitle,
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.title,
          color: colorTextPrimary,
          x: contentX,
          y: yCursor,
          width: contentWidth,
          align: 'left',
          fontFamily: titleFont,
        });

        yCursor += wrappedTitle.totalHeight + 50;

        // Bullets list
        const bullets = slide.bullets ?? [];
        bullets.forEach((bullet) => {
          const dotSize = 12;
          nodes.push({
            type: 'rect',
            x: contentX + 10,
            y: yCursor + 8,
            width: dotSize,
            height: dotSize,
            fill: colorPrimary,
            borderRadius: dotSize / 2,
          });

          const bulletWidth = contentWidth - 40;
          const wrappedBullet = wrapText(
            bullet,
            bulletWidth,
            typography.sizes.body,
            typography.lineHeights.body,
          );

          nodes.push({
            type: 'text',
            text: bullet,
            fontRole: 'body',
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.body,
            color: colorTextPrimary,
            x: contentX + 40,
            y: yCursor,
            width: bulletWidth,
            align: 'left',
            fontFamily: bodyFont,
          });

          yCursor += wrappedBullet.totalHeight + 24;
        });
        break;
      }

      case 'cta': {
        let yCursor = activeTop + layoutHeight * 0.25;

        // Badge
        if (slide.badgeText) {
          const badgeWidth = 140;
          const badgeHeight = 32;
          nodes.push({
            type: 'rect',
            x: contentX + (contentWidth - badgeWidth) / 2,
            y: yCursor,
            width: badgeWidth,
            height: badgeHeight,
            fill: colorSurface,
            borderRadius: 16,
          });

          nodes.push({
            type: 'text',
            text: slide.badgeText.toUpperCase(),
            fontRole: 'caption',
            fontSize: typography.sizes.caption,
            fontWeight: typography.weights.bold,
            lineHeight: 1.0,
            color: colorPrimary,
            x: contentX,
            y: yCursor + 8,
            width: contentWidth,
            align: 'center',
            fontFamily: titleFont,
          });

          yCursor += 60;
        }

        // Title
        const wrappedTitle = wrapText(
          slide.title,
          contentWidth,
          typography.sizes.title,
          typography.lineHeights.title,
        );
        nodes.push({
          type: 'text',
          text: slide.title,
          fontRole: 'title',
          fontSize: typography.sizes.title,
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.title,
          color: colorTextPrimary,
          x: contentX,
          y: yCursor,
          width: contentWidth,
          align: 'center',
          fontFamily: titleFont,
        });

        yCursor += wrappedTitle.totalHeight + 30;

        // Subtitle / Description
        if (slide.subtitle) {
          nodes.push({
            type: 'text',
            text: slide.subtitle,
            fontRole: 'body',
            fontSize: typography.sizes.subtitle,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.body,
            color: colorTextSecondary,
            x: contentX,
            y: yCursor,
            width: contentWidth,
            align: 'center',
            fontFamily: bodyFont,
          });

          yCursor += 80;
        } else {
          yCursor += 50;
        }

        // CTA Button
        const buttonLabel = slide.ctaLabel ?? 'Learn More';
        const buttonWidth = 260;
        const buttonHeight = 60;
        const buttonX = contentX + (contentWidth - buttonWidth) / 2;

        nodes.push({
          type: 'rect',
          x: buttonX,
          y: yCursor,
          width: buttonWidth,
          height: buttonHeight,
          fill: colorPrimary,
          borderRadius: 30,
        });

        nodes.push({
          type: 'text',
          text: buttonLabel,
          fontRole: 'body',
          fontSize: 20,
          fontWeight: typography.weights.bold,
          lineHeight: 1.0,
          color: '#ffffff',
          x: contentX,
          y: yCursor + 20,
          width: contentWidth,
          align: 'center',
          fontFamily: titleFont,
        });
        break;
      }

      case 'features': {
        let yCursor = activeTop + 40;

        // Title
        const wrappedTitle = wrapText(
          slide.title,
          contentWidth,
          typography.sizes.subtitle,
          typography.lineHeights.title,
        );
        nodes.push({
          type: 'text',
          text: slide.title,
          fontRole: 'title',
          fontSize: typography.sizes.subtitle,
          fontWeight: typography.weights.bold,
          lineHeight: typography.lineHeights.title,
          color: colorTextPrimary,
          x: contentX,
          y: yCursor,
          width: contentWidth,
          align: 'center',
          fontFamily: titleFont,
        });

        yCursor += wrappedTitle.totalHeight + 40;

        // Feature grids
        const bullets = slide.bullets ?? [];
        const gridCols = 2;
        const cardW = (contentWidth - 24) / 2;
        const cardH = (activeBottom - yCursor - 24) / 2;

        for (let i = 0; i < Math.min(4, bullets.length); i++) {
          const col = i % gridCols;
          const row = Math.floor(i / gridCols);
          const cardX = contentX + col * (cardW + 24);
          const cardY = yCursor + row * (cardH + 24);

          // Card Background
          nodes.push({
            type: 'rect',
            x: cardX,
            y: cardY,
            width: cardW,
            height: cardH,
            fill: colorSurface,
            borderRadius: 16,
          });

          // Text content
          const text = bullets[i] ?? '';
          nodes.push({
            type: 'text',
            text,
            fontRole: 'body',
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.regular,
            lineHeight: typography.lineHeights.body,
            color: colorTextPrimary,
            x: cardX + 24,
            y: cardY + 24,
            width: cardW - 48,
            align: 'left',
            fontFamily: bodyFont,
          });
        }
        break;
      }
    }

    return {
      width,
      height,
      backgroundColor: bgColor,
      nodes,
    };
  }
}

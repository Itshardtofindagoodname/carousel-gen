import * as fs from 'fs';
import * as path from 'path';
import {
  BrandProfile,
  BrandProfileSchema,
  ColorsConfig,
  ColorsSchema,
  TypographyConfig,
  TypographySchema,
  ThemeConfig,
  ThemeSchema,
  ComponentConfig,
  ComponentConfigSchema,
  LayoutConfig,
  LayoutConfigSchema,
  WritingStyleConfig,
  WritingStyleSchema,
  FooterConfig,
  FooterSchema,
} from './schemas.js';

export class BrandEngine {
  private brandDir: string;
  private profile!: BrandProfile;
  private colors!: ColorsConfig;
  private typography!: TypographyConfig;
  private theme!: ThemeConfig;
  private components!: ComponentConfig;
  private layouts!: LayoutConfig;
  private writingStyle!: WritingStyleConfig;
  private footer!: FooterConfig;

  constructor(brandDir: string) {
    this.brandDir = brandDir;
    this.loadAndValidate();
  }

  private loadAndValidate() {
    this.profile = this.loadJson('brand-profile.json', BrandProfileSchema);
    this.colors = this.loadJson('colors.json', ColorsSchema);
    this.typography = this.loadJson('typography.json', TypographySchema);
    this.theme = this.loadJson('theme.json', ThemeSchema);
    this.components = this.loadJson('components.json', ComponentConfigSchema);
    this.layouts = this.loadJson('layouts.json', LayoutConfigSchema);
    this.writingStyle = this.loadJson('writing-style.json', WritingStyleSchema);
    this.footer = this.loadJson('footer.json', FooterSchema);
  }

  private loadJson<T>(filename: string, schema: { parse: (val: unknown) => T }): T {
    const filePath = path.resolve(this.brandDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Brand configuration file not found: ${filename} at ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      const parsed = JSON.parse(content);
      return schema.parse(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse/validate ${filename}: ${msg}`);
    }
  }

  // Getters
  getBrandProfile(): BrandProfile {
    return this.profile;
  }

  getColorsConfig(): ColorsConfig {
    return this.colors;
  }

  getTypographyConfig(): TypographyConfig {
    return this.typography;
  }

  getThemeConfig(): ThemeConfig {
    return this.theme;
  }

  getSpacing(name: keyof ThemeConfig['spacing']): number {
    return this.theme.spacing[name];
  }

  getRadius(name: keyof ThemeConfig['borderRadius']): number {
    return this.theme.borderRadius[name];
  }

  getBorder(name: keyof ThemeConfig['borderWidth']): number {
    return this.theme.borderWidth[name];
  }

  getShadow(name: string): string {
    const resolvedName = name === 'card' ? 'md' : name;
    return this.theme.shadows[resolvedName as keyof ThemeConfig['shadows']] ?? this.theme.shadows.md;
  }

  getSpacingScale(): ThemeConfig['spacing'] {
    return this.theme.spacing;
  }

  getTypography(role: 'title' | 'body' | 'caption') {
    const typography = this.typography;
    const map = {
      title: {
        fontFamily: typography.fonts.title,
        fontSize: typography.sizes.title,
        fontWeight: typography.weights.bold,
        lineHeight: typography.lineHeights.title,
      },
      body: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.body,
        fontWeight: typography.weights.regular,
        lineHeight: typography.lineHeights.body,
      },
      caption: {
        fontFamily: typography.fonts.body,
        fontSize: typography.sizes.caption,
        fontWeight: typography.weights.medium,
        lineHeight: typography.lineHeights.caption,
      },
    } as const;

    return map[role];
  }

  getHeadlineStyle() {
    return {
      fontFamily: this.typography.fonts.title,
      fontSize: this.typography.sizes.title,
      fontWeight: '700',
      lineHeight: 1.05,
    };
  }

  getBodyStyle() {
    return {
      fontFamily: this.typography.fonts.body,
      fontSize: this.typography.sizes.body,
      fontWeight: '400',
      lineHeight: 1.5,
    };
  }

  getCTAStyle() {
    return {
      color: this.getColor('primary'),
      borderRadius: this.getRadius('full'),
      paddingX: this.getSpacing('md'),
      paddingY: this.getSpacing('sm'),
    };
  }

  getFooter() {
    return {
      showLogo: this.footer.showLogo,
      showHandle: this.footer.showHandle,
      showWebsite: this.footer.showWebsite,
      alignment: this.footer.alignment,
    };
  }

  getIllustrationDensity(): 'low' | 'medium' | 'high' {
    return this.layouts.grid.columns >= 10 ? 'high' : this.layouts.grid.columns >= 6 ? 'medium' : 'low';
  }

  getPreferredLayouts(): string[] {
    return ['hero', 'split', 'comparison'];
  }

  getVisualRhythm(): 'compact' | 'balanced' | 'relaxed' {
    return this.getSpacing('md') >= 24 ? 'balanced' : 'compact';
  }

  getSlideDensity(): number {
    return this.layouts.grid.columns / 12;
  }

  getColorRole(name: string): string {
    return this.getColor(name);
  }

  getComponentConfig(): ComponentConfig {
    return this.components;
  }

  getLayoutConfig(): LayoutConfig {
    return this.layouts;
  }

  getWritingStyleConfig(): WritingStyleConfig {
    return this.writingStyle;
  }

  getFooterConfig(): FooterConfig {
    return this.footer;
  }

  /**
   * Resolves a color to a hex string.
   * If it matches a semantic role, it resolves it to the palette color.
   * If it matches a palette name, it returns the palette value.
   * If it is a valid hex color itself, it returns it directly.
   */
  getColor(nameOrRole: string): string {
    // 1. Check if it's a semantic role
    const semanticName = this.colors.semantic[nameOrRole];
    if (semanticName) {
      // Resolve the semantic target color
      return this.resolvePaletteColor(semanticName);
    }

    // 2. Check if it's a palette name directly
    return this.resolvePaletteColor(nameOrRole);
  }

  private resolvePaletteColor(name: string): string {
    const paletteColor = this.colors.palette[name];
    if (paletteColor) {
      return paletteColor;
    }

    // 3. Fallback: if it's a hex or already resolved color, return it.
    if (name.startsWith('#')) {
      return name;
    }

    throw new Error(`Color "${name}" could not be resolved in palette or semantic mappings.`);
  }

  /**
   * Resolves a gradient definition by name.
   */
  getGradient(name: string) {
    const grad = this.colors.gradients?.[name];
    if (!grad) {
      throw new Error(`Gradient "${name}" not found in colors config.`);
    }

    // Resolve color names inside the gradient using getColor
    return {
      ...grad,
      colors: grad.colors.map((c) => this.getColor(c)),
    };
  }
}

export * from './schemas.js';
export { BrandProfileSchema } from './schemas.js';

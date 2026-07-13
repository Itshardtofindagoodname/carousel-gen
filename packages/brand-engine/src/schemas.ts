import { z } from 'zod';

export const BrandProfileSchema = z.object({
  name: z.string(),
  handle: z.string(),
  website: z.string(),
  logoPath: z.string(),
  tagline: z.string().optional(),
});

export const ColorsSchema = z.object({
  palette: z.record(z.string(), z.string()),
  semantic: z.record(z.string(), z.string()),
  gradients: z
    .record(
      z.string(),
      z.object({
        type: z.enum(['linear', 'radial']),
        colors: z.array(z.string()),
        angle: z.number().optional(),
      }),
    )
    .optional(),
});

export const TypographySchema = z.object({
  fonts: z.object({
    title: z.string(),
    body: z.string(),
  }),
  sizes: z.object({
    title: z.number(),
    subtitle: z.number(),
    body: z.number(),
    caption: z.number(),
  }),
  weights: z.object({
    bold: z.union([z.string(), z.number()]),
    medium: z.union([z.string(), z.number()]),
    regular: z.union([z.string(), z.number()]),
  }),
  lineHeights: z.object({
    title: z.number(),
    body: z.number(),
    caption: z.number(),
  }),
});

export const ThemeSchema = z.object({
  spacing: z.object({
    xs: z.number(),
    sm: z.number(),
    md: z.number(),
    lg: z.number(),
    xl: z.number(),
  }),
  borderRadius: z.object({
    none: z.number(),
    sm: z.number(),
    md: z.number(),
    lg: z.number(),
    full: z.number(),
  }),
  borderWidth: z.object({
    none: z.number(),
    thin: z.number(),
    medium: z.number(),
    thick: z.number(),
  }),
  shadows: z.object({
    none: z.string(),
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
  }),
});

export const ComponentConfigSchema = z.object({
  card: z.object({
    padding: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    borderWidth: z.enum(['none', 'thin', 'medium', 'thick']),
    shadow: z.enum(['none', 'sm', 'md', 'lg']),
  }),
  badge: z.object({
    paddingX: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
    paddingY: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    textWeight: z.enum(['bold', 'medium', 'regular']),
    textSize: z.enum(['title', 'subtitle', 'body', 'caption']),
  }),
});

export const LayoutConfigSchema = z.object({
  slideWidth: z.number(),
  slideHeight: z.number(),
  safeMargin: z.number(),
  grid: z.object({
    columns: z.number(),
    gutter: z.number(),
  }),
});

export const WritingStyleSchema = z.object({
  tone: z.string(),
  guidelines: z.array(z.string()),
  maxWordsPerSlide: z.number(),
});

export const FooterSchema = z.object({
  showLogo: z.boolean(),
  showHandle: z.boolean(),
  showWebsite: z.boolean(),
  alignment: z.enum(['left', 'right', 'center', 'spread']),
});

export type BrandProfile = z.infer<typeof BrandProfileSchema>;
export type ColorsConfig = z.infer<typeof ColorsSchema>;
export type TypographyConfig = z.infer<typeof TypographySchema>;
export type ThemeConfig = z.infer<typeof ThemeSchema>;
export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;
export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;
export type WritingStyleConfig = z.infer<typeof WritingStyleSchema>;
export type FooterConfig = z.infer<typeof FooterSchema>;

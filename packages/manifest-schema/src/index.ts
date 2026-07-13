import { z } from 'zod';

export const SlideComponentTypeSchema = z.enum([
  'badge',
  'header',
  'footer',
  'illustration',
  'logo',
]);

export const SlideLayoutTypeSchema = z.enum([
  'hero',
  'split',
  'comparison',
  'quote',
  'steps',
  'bullets',
  'cta',
  'features',
]);

export const SlideTypeSchema = z.enum(['cover', 'content', 'comparison', 'quote', 'steps', 'cta']);

export const SlideSchema = z.object({
  type: SlideTypeSchema,
  layout: SlideLayoutTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  illustration: z.string().optional(),
  badgeText: z.string().optional(),
  components: z.array(SlideComponentTypeSchema).optional(),

  // Content type-specific optional fields
  bullets: z.array(z.string()).optional(),
  quote: z.string().optional(),
  author: z.string().optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  steps: z.array(z.string()).optional(),
  ctaLabel: z.string().optional(),
});

export const CarouselManifestSchema = z.object({
  brandId: z.string().optional(),
  globalSettings: z
    .object({
      theme: z.string().optional(),
      aspectRatio: z.enum(['1:1', '4:5']).default('4:5'),
    })
    .optional(),
  slides: z.array(SlideSchema).min(1, 'At least one slide is required'),
});

export type SlideComponentType = z.infer<typeof SlideComponentTypeSchema>;
export type SlideLayoutType = z.infer<typeof SlideLayoutTypeSchema>;
export type SlideType = z.infer<typeof SlideTypeSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type CarouselManifest = z.infer<typeof CarouselManifestSchema>;

export function validateManifest(data: unknown): CarouselManifest {
  return CarouselManifestSchema.parse(data);
}

export function safeValidateManifest(data: unknown) {
  return CarouselManifestSchema.safeParse(data);
}

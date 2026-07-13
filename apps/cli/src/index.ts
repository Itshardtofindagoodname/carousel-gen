#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { BrandEngine } from '@carousel-gen/brand-engine';
import { LayoutEngine } from '@carousel-gen/layout-engine';
import { SvgRenderer } from '@carousel-gen/svg-engine';
import { validateManifest } from '@carousel-gen/manifest-schema';
import { Resvg } from '@resvg/resvg-js';

const program = new Command();

program
  .name('carousel-gen')
  .description('AI-Powered Instagram Carousel Generation Engine CLI')
  .version('1.0.0');

// RENDER command
program
  .command('render')
  .description('Render a carousel manifest JSON to SVG and optional PNG slides')
  .requiredOption('-m, --manifest <path>', 'Path to carousel manifest JSON file')
  .requiredOption('-b, --brand <dir>', 'Path to brand assets directory')
  .requiredOption('-o, --output <dir>', 'Output directory for rendered slides')
  .option('--png', 'Export slides to PNG as well')
  .action(async (options) => {
    try {
      const manifestPath = path.resolve(options.manifest);
      const brandDir = path.resolve(options.brand);
      const outputDir = path.resolve(options.output);

      console.log(`Loading brand configuration from: ${brandDir}`);
      const brand = new BrandEngine(brandDir);

      console.log(`Reading & validating manifest from: ${manifestPath}`);
      if (!fs.existsSync(manifestPath)) {
        console.error(`Error: Manifest file not found at ${manifestPath}`);
        process.exit(1);
      }
      const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const manifest = validateManifest(rawManifest);

      console.log(`Initializing rendering engines...`);
      const layoutEngine = new LayoutEngine(brand);
      const svgRenderer = new SvgRenderer(brand);

      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const totalSlides = manifest.slides.length;
      console.log(`Rendering ${totalSlides} slides...`);

      for (let i = 0; i < totalSlides; i++) {
        const slide = manifest.slides[i]!;
        const indexStr = String(i + 1).padStart(2, '0');
        console.log(
          `[${indexStr}/${totalSlides}] Resolving layout for slide type: ${slide.type}...`,
        );

        // Resolve absolute layout positioning
        const resolvedSlide = layoutEngine.resolveSlide(slide, i, totalSlides);

        // Render to SVG XML
        const svgContent = svgRenderer.render(resolvedSlide);
        const svgPath = path.join(outputDir, `slide-${indexStr}.svg`);
        fs.writeFileSync(svgPath, svgContent, 'utf-8');

        // Optional PNG rendering
        if (options.png) {
          console.log(`[${indexStr}/${totalSlides}] Exporting to PNG...`);
          const resvg = new Resvg(svgContent, {
            fitTo: {
              mode: 'width',
              value: resolvedSlide.width,
            },
          });
          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();
          const pngPath = path.join(outputDir, `slide-${indexStr}.png`);
          fs.writeFileSync(pngPath, pngBuffer);
        }
      }

      console.log(`🎉 Success! Slides written to: ${outputDir}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Render failed:`, msg);
      process.exit(1);
    }
  });

// GENERATE command (Placeholder to be wired up in Milestone 8)
program
  .command('generate')
  .description('Generate a carousel manifest using AI')
  .requiredOption('-t, --topic <topic>', 'Topic to generate carousel for')
  .requiredOption('-b, --brand <dir>', 'Path to brand assets directory')
  .requiredOption('-o, --output <path>', 'Output file path for the generated manifest JSON')
  .action(async (options) => {
    console.log(`Generating carousel for topic: "${options.topic}"...`);
    console.log(`[Stub] AI providers will be wired up in the next milestone.`);

    // Output a dummy manifest matching manifest-schema
    const dummyManifest = {
      brandId: 'acme-brand',
      globalSettings: {
        theme: 'dark',
        aspectRatio: '4:5',
      },
      slides: [
        {
          type: 'cover',
          layout: 'hero',
          title: `AI Topic: ${options.topic}`,
          subtitle: 'Generated via Carousel Gen CLI',
          badgeText: 'AI DEMO',
          components: ['badge', 'header', 'footer'],
        },
        {
          type: 'content',
          layout: 'split',
          title: 'Procedural Elements',
          subtitle: 'Layouts are fully deterministic and styled by the theme.',
          illustration: 'analytics-chart',
          components: ['header', 'footer'],
        },
        {
          type: 'quote',
          layout: 'quote',
          title: 'AI Philosophy',
          quote:
            'The AI is only responsible for the copy and narrative. The layout engine enforces the branding.',
          author: 'Lead Architect',
          components: ['header', 'footer'],
        },
        {
          type: 'cta',
          layout: 'cta',
          title: 'Automate Your Socials',
          subtitle: 'Export manifest, render slide, post to Instagram.',
          ctaLabel: 'Get Started',
          components: ['badge', 'header', 'footer'],
          badgeText: 'NEXT STEP',
        },
      ],
    };

    const outPath = path.resolve(options.output);
    const parentDir = path.dirname(outPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(outPath, JSON.stringify(dummyManifest, null, 2), 'utf-8');
    console.log(`🎉 Stub manifest generated at: ${outPath}`);
  });

program.parse(process.argv);

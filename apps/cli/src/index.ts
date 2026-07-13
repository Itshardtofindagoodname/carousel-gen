#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { BrandEngine } from '@carousel-gen/brand-engine';
import { LayoutEngine } from '@carousel-gen/layout-engine';
import { SvgRenderer } from '@carousel-gen/svg-engine';
import { validateManifest } from '@carousel-gen/manifest-schema';
import { Resvg } from '@resvg/resvg-js';
import {
  GeminiProvider,
  OpenAIProvider,
  AnthropicProvider,
  GroqProvider,
} from '@carousel-gen/ai-providers';

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
  .option('--pdf', 'Export slides combined into a single PDF document')
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

      const pngBuffers: { buffer: Buffer; width: number; height: number }[] = [];

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
        if (options.png || options.pdf) {
          console.log(`[${indexStr}/${totalSlides}] Exporting to PNG...`);
          const resvg = new Resvg(svgContent, {
            fitTo: {
              mode: 'width',
              value: resolvedSlide.width,
            },
          });
          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();

          if (options.png) {
            const pngPath = path.join(outputDir, `slide-${indexStr}.png`);
            fs.writeFileSync(pngPath, pngBuffer);
          }

          if (options.pdf) {
            pngBuffers.push({
              buffer: pngBuffer,
              width: resolvedSlide.width,
              height: resolvedSlide.height,
            });
          }
        }
      }

      // Compile slides into a single PDF if requested
      if (options.pdf && pngBuffers.length > 0) {
        console.log(`Compiling slides into a single PDF document...`);
        const { PDFDocument } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.create();

        for (const item of pngBuffers) {
          const image = await pdfDoc.embedPng(item.buffer);
          const page = pdfDoc.addPage([item.width, item.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: item.width,
            height: item.height,
          });
        }

        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(outputDir, 'carousel.pdf');
        fs.writeFileSync(pdfPath, pdfBytes);
        console.log(`🎉 PDF generated successfully at: ${pdfPath}`);
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
  .option(
    '-p, --provider <provider>',
    'AI provider to use (gemini, openai, anthropic, groq)',
    'gemini',
  )
  .option('-m, --model <model>', 'Custom model name to use')
  .option('-k, --apiKey <key>', 'API key for the AI provider')
  .action(async (options) => {
    try {
      const brandDir = path.resolve(options.brand);
      const outPath = path.resolve(options.output);

      console.log(`Loading brand configuration from: ${brandDir}`);
      const brand = new BrandEngine(brandDir);
      const guidelines = brand.getWritingStyleConfig().guidelines;

      const providerName = options.provider.toLowerCase();

      let envKeyName = '';
      if (providerName === 'gemini') envKeyName = 'GEMINI_API_KEY';
      else if (providerName === 'openai') envKeyName = 'OPENAI_API_KEY';
      else if (providerName === 'anthropic') envKeyName = 'ANTHROPIC_API_KEY';
      else if (providerName === 'groq') envKeyName = 'GROQ_API_KEY';

      const apiKey = options.apiKey || (envKeyName ? process.env[envKeyName] : undefined);

      if (!apiKey) {
        console.error(
          `Error: API Key is required. Please set the ${envKeyName} environment variable or pass --apiKey.`,
        );
        process.exit(1);
      }

      let provider;
      if (providerName === 'gemini') {
        provider = new GeminiProvider({ apiKey, model: options.model });
      } else if (providerName === 'openai') {
        provider = new OpenAIProvider({ apiKey, model: options.model });
      } else if (providerName === 'anthropic') {
        provider = new AnthropicProvider({ apiKey, model: options.model });
      } else if (providerName === 'groq') {
        provider = new GroqProvider({ apiKey, model: options.model });
      } else {
        console.error(`Error: Unknown provider "${providerName}"`);
        process.exit(1);
      }

      console.log(
        `Generating manifest for topic: "${options.topic}" using provider "${providerName}"...`,
      );
      const manifest = await provider.generateManifest(options.topic, guidelines);

      const parentDir = path.dirname(outPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
      console.log(`🎉 Success! Manifest generated at: ${outPath}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Generation failed:`, msg);
      process.exit(1);
    }
  });

program.parse(process.argv);

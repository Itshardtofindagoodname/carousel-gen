# carousel-gen

carousel-gen is a monorepo for generating branded Instagram carousel slides from a semantic manifest. It combines a CLI renderer, a layout engine, a brand engine, and SVG export support.

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- A terminal with access to the repository root
- An API key if you want to generate manifests with AI providers

## Run With Node/npm

Install dependencies from the repository root:

```bash
npm install
```

Build the workspace packages:

```bash
npm run build
```

Render the sample manifest:

```bash
npm run render -- --manifest examples/demo-manifest.json --brand brand --output out/demo --png
```

This writes SVG and PNG files into the output folder.

## Generate A Manifest With AI

Set an API key for your preferred provider:

```bash
export GROQ_API_KEY=your_groq_api_key
```

Then generate a manifest:

```bash
npm run generate -- --topic "Design systems for startups" --brand brand --output out/manifest.json --provider groq
```

## Project structure

- apps/cli: command-line interface
- packages/layout-engine: slide layout resolution
- packages/brand-engine: brand tokens and style helpers
- packages/svg-engine: SVG rendering
- packages/manifest-schema: manifest validation
- brand: sample brand assets
- docs: architecture and component notes

## Notes

- The CLI uses the manifest schema to validate the input before rendering.
- The brand directory controls colors, spacing, typography, and layout defaults.
- The output folder will contain one SVG per slide, plus PNG files when --png is enabled.

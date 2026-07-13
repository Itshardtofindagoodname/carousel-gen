# carousel-gen

carousel-gen is a monorepo for generating branded Instagram carousel slides from a semantic manifest. It combines a CLI renderer, a layout engine, a brand engine, and SVG export support.

## Prerequisites

- Node.js 22+
- npm or pnpm
- A terminal with access to the repository root

## Install dependencies

From the repository root:

```bash
corepack enable
corepack pnpm install
```

## Build the project

```bash
corepack pnpm build
```

## Run tests

```bash
corepack pnpm test
```

## Run the CLI renderer

The main entrypoint is the CLI under apps/cli. The renderer expects:

- a manifest JSON file
- a brand directory containing JSON brand assets
- an output directory for generated SVG/PNG files

### Demo render

```bash
mkdir -p out/demo
node apps/cli/dist/index.js render \
  --manifest examples/demo-manifest.json \
  --brand brand \
  --output out/demo \
  --png
```

This will generate SVG and PNG files inside out/demo.

### Demo commands

1. Render the sample manifest:

```bash
node apps/cli/dist/index.js render --manifest examples/demo-manifest.json --brand brand --output out/demo --png
```

2. Generate a manifest from an AI provider (requires an API key):

```bash
node apps/cli/dist/index.js generate \
  --topic "Design systems for startups" \
  --brand brand \
  --output out/demo/manifest.json \
  --provider gemini
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

# Architecture Overview

## Rendering pipeline

1. The CLI loads a manifest and a brand directory.
2. The layout engine resolves semantic slide content into absolute node positions.
3. The SVG renderer converts the resolved nodes into SVG markup.
4. Brand-driven helpers provide spacing, typography, color, radius, and shadow values.

## Brand-driven rendering

The renderer now consumes semantic brand helpers instead of hardcoded values for the core visual primitives. The layout engine uses the brand engine for spacing, radius, shadow, and typography decisions while still respecting the manifest contract.

## Component evolution

The layout engine now exposes reusable helper building blocks for badges and footers so new component types can be composed on top of the same interface without re-implementing brand-aware styling rules.

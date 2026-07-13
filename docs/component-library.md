# Component Library

The renderer now uses a small, reusable component layer for the most common presentation primitives:

- Badge
- Header
- Footer
- Hero text block
- Comparison card shell

These components receive style tokens from the brand engine rather than embedding brand-specific values directly. This keeps the renderer deterministic while allowing the brand to steer the final look.

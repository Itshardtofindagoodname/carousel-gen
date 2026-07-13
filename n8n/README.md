# n8n Automation Workflow

This folder contains the pre-configured [n8n](https://n8n.io) workflow JSON for automating Instagram carousel generation.

The workflow acts as an API endpoint which:

1. Receives a webhook request with a `topic` and a `brandDir`.
2. Invokes the CLI `generate` command, which queries the AI Provider to design a structured `manifest.json`.
3. Runs the CLI `render` command to resolve layouts and output high-quality SVGs and PNGs.
4. Reads the generated PNG slide files.
5. Responds back with the file binary list or output details.

## Files

- [carousel-workflow.json](file:///c:/Users/tagorejeet/Documents/carousel-gen/n8n/carousel-workflow.json): The importable n8n workflow file.

## Setup Instructions

1. **Import the Workflow**:
   - Open your n8n dashboard.
   - Click on the top-right settings wheel -> **Import from File**.
   - Select `carousel-workflow.json`.

2. **Configure Environment Variables**:
   Ensure the following environment variables are set in your n8n container / server environment (or passed inside n8n Execute Command node):
   - `GEMINI_API_KEY`: Required if using Gemini provider (default).
   - `OPENAI_API_KEY`: Required if using OpenAI provider.
   - `ANTHROPIC_API_KEY`: Required if using Anthropic provider.
   - `GROQ_API_KEY`: Required if using Groq provider.

3. **Verify Node Command Access**:
   The workflow runs `node apps/cli/dist/index.js` commands. Ensure:
   - Node is installed in your n8n environment.
   - You have run `pnpm install` and `pnpm run build` in the monorepo root.

## API Usage

Once active, trigger the webhook by sending a `POST` request to the Webhook URL:

```json
{
  "topic": "Clean Code in TypeScript",
  "brandDir": "brand",
  "outputDir": "out/n8n"
}
```

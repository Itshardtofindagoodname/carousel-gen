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
- [Dockerfile](file:///c:/Users/tagorejeet/Documents/carousel-gen/n8n/Dockerfile): Custom n8n image that builds the carousel-gen CLI into `/workspace`.
- [docker-compose.yml](file:///c:/Users/tagorejeet/Documents/carousel-gen/n8n/docker-compose.yml): Local n8n runtime with persistent n8n data and generated output.
- [.env.example](file:///c:/Users/tagorejeet/Documents/carousel-gen/n8n/.env.example): Local environment template for API keys.

## Docker Setup

From the repository root, create your local n8n environment file:

```bash
cp n8n/.env.example n8n/.env
```

Edit `n8n/.env` and add the AI provider key you want to use. The default CLI provider is Gemini, so `GEMINI_API_KEY` is the usual minimum.

Build and start n8n:

```bash
docker-compose --env-file n8n/.env -f n8n/docker-compose.yml up --build
```

Open n8n at:

```text
http://localhost:5678
```

The container uses these paths:

- `/workspace`: the built carousel-gen monorepo inside the image.
- `/workspace/out`: mapped to the host `out/` directory.
- `/home/node/.n8n`: persisted in the Docker volume `n8n_data`.

To stop the container:

```bash
docker-compose --env-file n8n/.env -f n8n/docker-compose.yml down
```

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
   The workflow runs `node apps/cli/dist/index.js` commands from `/workspace`. The Docker image runs `pnpm install` and builds the monorepo during image creation.

## API Usage

Once active, trigger the webhook by sending a `POST` request to the Webhook URL:

```json
{
  "topic": "Clean Code in TypeScript",
  "brandDir": "brand",
  "outputDir": "out/n8n"
}
```

For the local Docker setup, the test webhook URL is typically:

```text
http://localhost:5678/webhook-test/generate-carousel
```

After activating the workflow, the production webhook URL is typically:

```text
http://localhost:5678/webhook/generate-carousel
```

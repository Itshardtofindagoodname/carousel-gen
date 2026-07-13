ARG N8N_IMAGE=n8nio/n8n:latest
FROM ${N8N_IMAGE}

USER root
WORKDIR /workspace

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.base.json ./
COPY --chown=node:node apps ./apps
COPY --chown=node:node packages ./packages
COPY --chown=node:node brand ./brand
COPY --chown=node:node examples ./examples
COPY --chown=node:node n8n ./n8n

RUN corepack enable \
  && corepack pnpm install --frozen-lockfile \
  && corepack pnpm --filter "./packages/*" --filter "./apps/*" build \
  && mkdir -p /workspace/out/n8n \
  && chown -R node:node /workspace

USER node
WORKDIR /workspace

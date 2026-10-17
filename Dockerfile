# syntax=docker/dockerfile:1

# Replace with the exact current LTS tag (or add @sha256:<digest>)
# use Nede 24 (LTS) with a "pinned version"
ARG NODE_IMAGE=node:24.21.0-alpine3.24

# Stage 1: production-only dependencies
# hadolint ignore=DL3006
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci --omit=dev

# Stage 2: build (dev dependencies + TypeScript)
# hadolint ignore=DL3006
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 3: runtime
# hadolint ignore=DL3006
FROM ${NODE_IMAGE} AS production
ENV ENV=production \
  PORT=3000
WORKDIR /app

COPY --chown=node:node package.json ./
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

# Switch to user "node" 1000 UID and 1000 GID
USER 1000:1000
EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["dist/index.js"]

# Production Dockerfile for SustainPro
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy workspace configuration and manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

# Install dependencies
RUN pnpm install --frozen-lockfile=false

# Build all packages (libraries, frontend SPAs, and API server)
RUN pnpm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/node_modules ./node_modules

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "run", "start"]

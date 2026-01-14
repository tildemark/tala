# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

RUN apk add --no-cache \
    libc6-compat \
    bash \
    curl

# Copy workspace manifests
COPY package.json package-lock.json* pnpm-workspace.yaml* ./
COPY apps/docs/package.json ./apps/docs/

# Stage 2: Dependencies (install only docs workspace)
FROM base AS dependencies
WORKDIR /app
RUN npm install --workspace=@tala/docs

# Stage 3: Development runtime
FROM dependencies AS development
WORKDIR /app

# Copy source
COPY apps/docs ./apps/docs
COPY .prettierrc ./

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3002 || exit 1

CMD ["npm", "run", "start", "--workspace=@tala/docs"]

# Stage 4: Build for production
FROM dependencies AS builder
WORKDIR /app
COPY apps/docs ./apps/docs
RUN npm run build --workspace=@tala/docs

# Stage 5: Production serve image
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache bash curl

COPY package.json package-lock.json* ./
COPY apps/docs/package.json ./apps/docs/
RUN npm install --production --workspace=@tala/docs
COPY --from=builder /app/apps/docs/build ./apps/docs/build

EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3002 || exit 1

CMD ["npm", "run", "serve", "--workspace=@tala/docs", "--", "--dir", "apps/docs/build", "--port", "3002", "--host", "0.0.0.0"]

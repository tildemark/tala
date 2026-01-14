# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache \
    libc6-compat \
    curl

# Copy package files
COPY package.json package-lock.json* pnpm-workspace.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Stage 2: Dependencies
FROM base AS dependencies
WORKDIR /app

# Install all dependencies
RUN npm install

# Stage 3: Development
FROM dependencies AS development
WORKDIR /app

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
COPY tsconfig.json ./
COPY .prettierrc ./
COPY config/tailwind.config.js ./config/

# Expose Next.js port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["npm", "run", "dev", "--workspace=@tala/web"]

# Stage 4: Builder (for production builds)
FROM dependencies AS builder
WORKDIR /app

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
COPY tsconfig.json ./
COPY config/tailwind.config.js ./config/

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build --workspace=@tala/web

# Stage 5: Production
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/

# Install production dependencies
RUN npm install --production --workspace=@tala/web

# Copy built Next.js application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.js ./apps/web/
COPY --from=builder /app/apps/web/package.json ./apps/web/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["npm", "run", "start", "--workspace=@tala/web"]

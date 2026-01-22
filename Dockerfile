# Base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Build the app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Re-declare ARG for runner stage if needed, though usually ENV is enough
# But next.js bakes at build time.
# If we want runtime config, we need a different strategy, but for now let's assume standard build


# Copy built artifacts from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY frontend/next.config.js ./

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]

# Multi-stage build for Windows Docker Desktop compatibility
# Stage 1: Build Angular app
FROM node:18-alpine AS angular-build

# Set working directory for Angular build
WORKDIR /app/client

# Copy Angular package files
COPY client/package*.json ./
RUN npm ci

# Copy Angular source code
COPY client/ ./

# Build Angular app for production
RUN npm run build

# Stage 2: Build Node.js server
FROM node:18-alpine AS server-build

# Set working directory for server
WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
RUN npm ci --only=production

# Stage 3: Final production image
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy server dependencies and code
COPY --from=server-build /app/server/node_modules ./node_modules
COPY server/ ./

# Copy built Angular app to server's public directory
COPY --from=angular-build /app/client/dist/client ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 8089
EXPOSE 8089

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8089/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["node", "index.js"]
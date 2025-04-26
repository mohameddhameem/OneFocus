# Stage 1: build
FROM node:lts-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: production
FROM node:lts-alpine
WORKDIR /app

# Install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --no-audit --no-optional

# Copy build artifacts and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose and start
EXPOSE 8080
CMD ["npm", "start"]
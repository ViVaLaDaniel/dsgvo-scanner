# Dockerfile for DSGVO Scanner

# Stage 1: Build the Next.js application
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy the built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Install Playwright browsers
RUN npx playwright install --with-deps

# Expose port 3000
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]

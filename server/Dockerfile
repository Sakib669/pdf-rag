FROM node:20-alpine

# Install Valkey (Redis-compatible)
RUN apk add --no-cache valkey

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build

# Copy and make start.sh executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose ports
EXPOSE 6379 8000

# Start everything
CMD ["/start.sh"]
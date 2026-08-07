FROM node:20-slim

# Install Redis server for local queue storage
RUN apt-get update \
  && apt-get install -y redis-server \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package metadata and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application source files and build TypeScript
COPY tsconfig.json ./
COPY index.ts worker.ts ./
RUN npm run build

# Copy the startup helper script and uploads directory
COPY start.sh ./
RUN chmod +x ./start.sh
COPY uploads ./uploads

EXPOSE 8000

CMD ["./start.sh"]

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Install concurrently globally (or use local)
RUN npm install -g concurrently

EXPOSE 8000

# Start both server and worker at the same time
CMD ["concurrently", "npm start", "npm run worker"]
# PDF RAG Backend

This backend is an Express API that receives PDF uploads, enqueues them into BullMQ, and serves a chat endpoint for retrieval-based question answering.

## Architecture

- `POST /upload/pdf` accepts a PDF file and saves it in `uploads/`
- A BullMQ job is created to process the PDF asynchronously
- `worker.ts` loads the PDF, splits it into chunks, generates embeddings using Google Gemini, and stores vectors in Qdrant
- `GET /chat?message=...` retrieves relevant chunks from Qdrant and uses Gemini chat to answer user questions

## Key Technologies

- Express.js + TypeScript
- BullMQ job queue
- Redis (Upstash or local Redis/Valkey)
- Qdrant Cloud vector database
- Gemini embeddings and chat models via LangChain
- Multer for file uploads

## Setup

Install dependencies and build:

```bash
cd server
npm install
npm run build
```

Create a `.env` file with:

```env
GEMINI_API_KEY="your_gemini_api_key"
QDRANT_URL="https://your-qdrant-cluster"
QDRANT_API_KEY="your_qdrant_api_key"
UPSTASH_REDIS_REST_URL="https://your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

Run the backend:

```bash
npm start
```

## Scripts

- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the Express API and worker concurrently
- `npm run worker` — run only the worker process

## Docker

A `Dockerfile` is provided to build the backend image.

### Build & run locally

```bash
cd server
docker build -t pdf-rag-backend .
docker run -p 8000:8000 --env-file .env pdf-rag-backend
```

## Notes

- Ensure the Qdrant collection exists or is created successfully at startup.
- The worker depends on Redis for BullMQ queue state.
- The backend currently uses Upstash Redis by default; you can switch to local Redis or Valkey if needed.

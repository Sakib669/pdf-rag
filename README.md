# PDF RAG System

## Overview

PDF RAG System is a full-stack Retrieval-Augmented Generation project that enables authenticated users to upload PDF documents, process them asynchronously, store semantic embeddings in a vector database, and interact with content through a chat interface.

The frontend is built with Next.js, TypeScript, Tailwind CSS, and Clerk authentication. The backend is an Express server with BullMQ job queues, Redis queue storage, Qdrant Cloud vector storage, and Google Gemini AI for embeddings and chat.

## Architecture

- **Frontend**: `client/` provides a secure UI with PDF upload and chat interfaces.
- **Backend**: `server/` provides REST endpoints for uploading documents and querying chat responses.
- **Worker**: `server/worker.ts` processes PDF jobs by loading, chunking, embedding, and storing document vectors.
- **Queue**: BullMQ + Redis coordinates asynchronous PDF processing.
- **Vector DB**: Qdrant Cloud stores semantic document vectors for retrieval.
- **AI**: Google Gemini generates embeddings and context-aware answers.

## Project Structure

- `client/` — Next.js frontend with Clerk auth, file upload, and chat UI
- `server/` — Express backend with job queue producer and AI integration
- `server/worker.ts` — BullMQ worker for PDF ingestion and vector writes
- `Dockerfile` — backend container build file
- `docker-compose.yml` — local container definitions for Redis and Qdrant
- `server/.env` — backend environment configuration
- `uploads/` — temporary storage for uploaded PDFs

## Key Features

1. Authenticated PDF upload via Clerk
2. Asynchronous file processing with BullMQ and Redis
3. PDF parsing and chunking for vector embeddings
4. Semantic embeddings via Gemini
5. Vector search using Qdrant Cloud
6. Chat-based query interface with context-aware Gemini responses

## Deployment

- **Frontend**: deployed on Vercel
- **Backend + Worker**: deployed on Render using a single Docker container
- **Queue Storage**: Upstash Redis
- **Vector Storage**: Qdrant Cloud

## Environment Variables

The backend requires:

- `GEMINI_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

The frontend requires:

- `NEXT_PUBLIC_API_BASE_URL`

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Sakib669/pdf-rag.git
   cd pdf-rag
   ```

2. Frontend setup:
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. Backend setup:
   ```bash
   cd ../server
   npm install
   npm run build
   npm start
   ```

4. Open the frontend in your browser at `http://localhost:3000`.

## Notes

- Make sure the backend is running before interacting with the frontend.
- The backend currently uses Upstash Redis for queue storage and Qdrant Cloud for vector store.
- `Dockerfile` is configured to run both the Express API and the worker together in one container.

## Recommended Improvements

- Add root-level auth for backend endpoints
- Consolidate environment variable usage for Redis and remove dead configs
- Add root `README.md` documentation for quick onboarding
- Improve prompt engineering and citation formatting in the chat response

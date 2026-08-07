# PDF RAG Frontend

This frontend is built with Next.js (App Router), TypeScript, Clerk authentication, and Tailwind CSS. It provides a secure UI for uploading PDFs and chatting with a retrieval-augmented generation system backed by a vector database and Gemini AI.

## Features

- Clerk-based authentication for protected access
- PDF upload UI with drag-and-click file selection
- Real-time chat interface for asking questions about uploaded PDFs
- API integration with Express backend for file uploads and semantic search
- Type-safe frontend services and reusable UI components

## Local Development

Install dependencies:

```bash
cd client
npm install
```

Run the development frontend:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment Variables

The frontend expects the following environment variable:

- `NEXT_PUBLIC_API_BASE_URL` — backend API base URL (example: `http://localhost:8000`)

Create a `.env.local` file in `client/` with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Production Deployment

This app is intended for deployment on Vercel or any Next.js-compatible hosting provider. Configure `NEXT_PUBLIC_API_BASE_URL` to point at the deployed backend API.

## Relevant Files

- `app/page.tsx` — main page rendering upload and chat views
- `app/layout.tsx` — global layout and Clerk provider
- `components/file-upload.tsx` — upload UI and file submission
- `components/chat.tsx` — chat UI and message handling
- `services/api.ts` — client-side API wrapper
- `types/index.ts` — shared message/document typings

## Notes

The frontend is designed to work with a backend that provides `/upload/pdf` and `/chat` endpoints. Ensure the server is running before using the UI.

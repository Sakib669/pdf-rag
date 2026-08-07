import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import "dotenv/config";

interface JobData {
  filename: string;
  destination: string;
  path: string;
}

// ============================================
// 1. UPSTASH REDIS CONNECTION (BullMQ compatible)
// ============================================
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn(
    "⚠️ Upstash Redis credentials not fully set. Falling back to localhost.",
  );
}

const redisConnection = new Redis(
  redisUrl
    ? redisUrl.replace(/^https:\/\//, "rediss://")
    : "redis://localhost:6379",
  {
    password: redisToken,
    tls: redisUrl ? {} : undefined,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    maxRetriesPerRequest: null, // ✅ Required for BullMQ
  },
);

// ============================================
// 2. GEMINI EMBEDDINGS
// ============================================
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GEMINI_API_KEY,
});

// ============================================
// 3. QDRANT CLOUD
// ============================================
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

try {
  await qdrantClient.getCollections();
  console.log("✅ Qdrant is running");
} catch {
  await qdrantClient.createCollection("documents", {
    vectors: { size: 768, distance: "Cosine" },
  });
  console.log("✅ Qdrant collection 'documents' created");
}

const vectorStore = new QdrantVectorStore(embeddings, {
  client: qdrantClient,
  collectionName: "langchain-js-testing",
});

// ============================================
// 4. TEXT SPLITTER
// ============================================
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// ============================================
// 5. BULLMQ WORKER (with graceful ENOENT handling)
// ============================================
const worker = new Worker(
  "file-upload-queue",
  async (job: Job) => {
    const data: JobData = JSON.parse(job.data);
    console.log(`📁 Processing: ${data.filename}`);
    console.log(`📂 Path: ${data.path}`);

    try {
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();
      console.log(`📄 Loaded ${docs.length} pages`);

      const chunks = await splitter.splitDocuments(docs);
      console.log(`✂️ Split into ${chunks.length} chunks`);

      await vectorStore.addDocuments(chunks);
      console.log(`✅ Stored ${chunks.length} chunks in Qdrant`);

      return {
        processed: true,
        filename: data.filename,
        chunks: chunks.length,
      };
    } catch (error: any) {
      // Gracefully handle missing files
      if (error.code === "ENOENT") {
        console.warn(`⚠️ File not found: ${data.path}. Skipping job.`);
        return; // Job completes without retry
      }
      console.error(`❌ Error processing ${data.filename}:`, error);
      throw error; // Retry other errors
    }
  },
  {
    concurrency: 100,
    connection: redisConnection,
    // Optional: remove completed/failed jobs after some time
    removeOnComplete: { age: 3600 }, // keep for 1 hour
    removeOnFail: { age: 3600 },
  },
);

// ============================================
// 6. EVENT HANDLERS
// ============================================
worker.on("completed", (job: Job) => {
  console.log(`🎉 Job ${job.id} completed successfully`);
});

worker.on("failed", (job: Job | undefined, err: Error) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

console.log("🚀 Gemini-powered worker is running...");
console.log("📋 Waiting for files to process...");

import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import "dotenv/config";
// ============================================
// 1. GEMINI CONFIG (FIXED MODEL NAME)
// ============================================
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // ✅ Latest stable text embedding model
    apiKey: process.env.GEMINI_API_KEY,
});
// ============================================
// 2. QDRANT CONFIG
// ============================================
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL, // ✅ Cloud URL from .env
    apiKey: process.env.QDRANT_API_KEY, // ✅ API Key from .env
});
try {
    const collectionsInfo = await qdrantClient.getCollections();
    const collections = collectionsInfo.collections.map((c) => c.name);
    if (!collections.includes("langchain-js-testing")) {
        await qdrantClient.createCollection("langchain-js-testing", {
            vectors: { size: 768, distance: "Cosine" },
        });
        console.log("✅ Qdrant collection 'langchain-js-testing' created");
    }
    else {
        console.log("✅ Qdrant collection 'langchain-js-testing' already exists");
    }
}
catch (err) {
    console.error("❌ Error checking/creating Qdrant collection:", err);
}
const vectorStore = new QdrantVectorStore(embeddings, {
    client: qdrantClient,
    collectionName: "langchain-js-testing",
});
// ============================================
// 3. TEXT SPLITTER
// ============================================
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
});
// ============================================
// 4. BULLMQ WORKER
// ============================================
const worker = new Worker("file-upload-queue", async (job) => {
    const data = JSON.parse(job.data);
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
    }
    catch (error) {
        console.error(`❌ Error processing ${data.filename}:`, error);
        throw error;
    }
}, {
    concurrency: 100,
    connection: { host: "localhost", port: 6379 },
});
// ============================================
// 5. EVENT HANDLERS
// ============================================
worker.on("completed", (job) => {
    console.log(`🎉 Job ${job.id} completed successfully`);
});
worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
console.log("🚀 Gemini-powered worker is running...");
console.log("📋 Waiting for files to process...");

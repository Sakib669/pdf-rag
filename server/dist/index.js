import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import { Queue } from "bullmq";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings, } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
const app = express();
app.use(express.json());
app.use(cors());
const queue = new Queue("file-upload-queue", {
    connection: { host: "localhost", port: 6379 },
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
const upload = multer({ storage: storage });
const PORT = process.env.PORT || 8000;
// ============================================
// 1. GEMINI EMBEDDINGS
// ============================================
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // ✅ Latest stable text embedding model
    apiKey: process.env.GEMINI_API_KEY,
});
// ============================================
// 2. QDRANT CONFIG
// ============================================
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
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
    collectionName: "langchain-js-testing", // ✅ Match your Qdrant collection name
});
// ============================================
// 3. GEMINI CHAT MODEL
// ============================================
const chatModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2,
});
// ============================================
// 4. ROUTES
// ============================================
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }
    await queue.add("file-ready", JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path,
    }));
    return res.json({ message: "File uploaded successfully." });
});
// ✅ CHAT ENDPOINT – now matches tutorial
app.get("/chat", async (req, res) => {
    const userQuery = typeof req.query.message === "string" ? req.query.message : 'what is the content of the pdf file?';
    if (!userQuery) {
        return res.status(400).json({ error: "Missing 'message' query parameter" });
    }
    console.log(`🔍 Query: ${userQuery}`);
    const retriever = vectorStore.asRetriever({
        k: 2,
    });
    const result = await retriever.invoke(userQuery);
    console.log(`📄 Retrieved ${result.length} chunks`);
    const SYSTEM_PROMPT = `
  You are a helpful AI Assistant who answers the user query based on the available context from the PDF File.
  Context:
  ${JSON.stringify(result)}
  `;
    const response = await chatModel.invoke([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
    ]);
    return res.json({
        message: response.content,
        docs: result,
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

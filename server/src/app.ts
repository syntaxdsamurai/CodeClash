import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv"; // Import dotenv
import { setupSocket } from "./socket";

dotenv.config(); // Load environment variables from .env file

const app = express();
const httpServer = createServer(app);

// 1. Setup CORS to allow frontend connection
app.use(cors({
    origin: "http://localhost:3000", // Trust your Next.js app
    methods: ["GET", "POST"]
}));

// 2. Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// 3. Connect Game Logic
setupSocket(io);

// 4. Basic Health Check Route
app.get("/", (req, res) => {
    res.send("CodeClash Game Engine is Running... 🚀");
});

// 5. Start Server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`\n⚡️ [SERVER]: Game Engine running on http://localhost:${PORT}`);
});
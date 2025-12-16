import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { setupSocket } from "./socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// 1. Setup CORS to allow ANY frontend connection (Fixes the issue)
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));

// 2. Initialize Socket.io with the same CORS rule
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow connection from Vercel
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
    console.log(`\n⚡️ [SERVER]: Game Engine running on port ${PORT}`);
});
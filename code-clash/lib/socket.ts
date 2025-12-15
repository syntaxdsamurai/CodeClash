// File: code-clash/lib/socket.ts
import { io } from "socket.io-client";

// IMPORTANT: This uses the environment variable, which we will set in Vercel.
// It falls back to localhost for local development.
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

export const socket = io(SERVER_URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'] // Ensure WebSocket is prioritized
});
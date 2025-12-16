import { io } from "socket.io-client";

// This reads the URL you set in Vercel, or defaults to localhost for testing
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const socket = io(URL, {
    autoConnect: false,
});
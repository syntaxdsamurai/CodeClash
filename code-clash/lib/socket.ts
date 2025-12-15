import { io } from "socket.io-client";

// Connect to your backend URL (which we set to port 4000)
const SERVER_URL = "http://localhost:4000";

export const socket = io(SERVER_URL, {
    autoConnect: false, // Important: prevents connecting immediately on load
});
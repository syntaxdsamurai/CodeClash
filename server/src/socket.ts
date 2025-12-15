import { Server, Socket } from "socket.io";

// Track active rooms in memory
const activeRooms = new Set<string>();

export const setupSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`User Connected: ${socket.id}`);

        // 1. HOST: Create a Room
        socket.on("create_room", (roomCode: string) => {
            activeRooms.add(roomCode); // Mark room as active
            socket.join(roomCode);
            console.log(`Room Created: ${roomCode} by ${socket.id}`);
        });

        // 2. PEER: Join a Room (With Validation)
        socket.on("join_room", (roomCode: string) => {
            if (activeRooms.has(roomCode)) {
                // Success: Room exists
                socket.join(roomCode);
                console.log(`User ${socket.id} joined room: ${roomCode}`);

                // Notify the HOST that someone joined (so they can redirect)
                socket.to(roomCode).emit("user_joined", socket.id);

                // Notify the JOINER that it was successful (so they can redirect)
                socket.emit("join_success", roomCode);
            } else {
                // Failure: Room does not exist
                socket.emit("join_error", "Invalid Room Code");
            }
        });

        // 3. Real-time Code Sync
        socket.on("code_change", (data: { room: string; code: string }) => {
            socket.to(data.room).emit("receive_code", data.code);
        });

        // 4. Disconnect
        socket.on("disconnect", () => {
            console.log("User Disconnected", socket.id);
        });
    });
};
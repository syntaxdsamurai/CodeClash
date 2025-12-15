import { Server, Socket } from "socket.io";

// Define a map to store room-specific data including problem and winner
interface RoomData {
    problemId: string;
    winnerId: string | null;
    hostName: string; // Storing the host's name
    peerName: string | null; // Storing the peer's name
}

// Map: roomCode -> RoomData
const activeRooms = new Map<string, RoomData>();

// Mock Problem IDs (Must match the IDs in the frontend's PROBLEM_SET)
const MOCK_PROBLEM_IDS = [
    'reverse-string',
    'sum-of-two',
    'climbing-stairs',
    'valid-anagram',
    'max-subarray',
    'merge-intervals',
    'two-sum',
    'longest-substring',
    'binary-tree-inorder',
    'rotate-image'
];

// Helper to select a random problem ID
const getRandomProblemId = () => {
    const randomIndex = Math.floor(Math.random() * MOCK_PROBLEM_IDS.length);
    return MOCK_PROBLEM_IDS[randomIndex];
}

// Mock MMR calculation (simplified: winner gains 25, loser loses 10)
const calculateMMRChange = (isWinner: boolean) => {
    return isWinner ? 25 : -10;
}

export const setupSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`User Connected: ${socket.id}`);

        // 1. HOST: Create a Room
        socket.on("create_room", (data: { roomCode: string, displayName: string }) => {
            const { roomCode, displayName } = data;
            // NEW: Assign a random problem to the new room
            const problemId = getRandomProblemId();

            // Store room data including the host's name
            activeRooms.set(roomCode, { problemId, winnerId: null, hostName: displayName, peerName: null });

            socket.join(roomCode);
            console.log(`Room Created: ${roomCode} by ${socket.id} (${displayName}). Problem: ${problemId}`);

            // Immediately inform the host of the problem
            socket.emit("receive_problem_state", { problemId, winnerId: null });
        });

        // 2. PEER: Join a Room (With Validation)
        socket.on("join_room", (data: { roomCode: string, displayName: string }) => {
            const { roomCode, displayName } = data;
            const roomData = activeRooms.get(roomCode);

            if (roomData) {
                // Check if room is full (max 2 players)
                if (roomData.peerName) {
                    socket.emit("join_error", "Room is already full.");
                    return;
                }

                // Success: Room exists and has space
                roomData.peerName = displayName; // Set the peer's name
                activeRooms.set(roomCode, roomData);
                socket.join(roomCode);
                console.log(`User ${socket.id} (${displayName}) joined room: ${roomCode}`);

                // Notify the HOST that someone joined
                socket.to(roomCode).emit("user_joined", socket.id);

                // Notify the JOINER that it was successful and send problem state
                socket.emit("join_success", roomCode);
                socket.emit("receive_problem_state", roomData);
            } else {
                // Failure: Room does not exist
                socket.emit("join_error", "Invalid Room Code");
            }
        });

        // 2b. Request Problem State (for rejoining/syncing)
        socket.on("request_problem_state", (roomCode: string) => {
            const roomData = activeRooms.get(roomCode);
            if (roomData) {
                socket.emit("receive_problem_state", roomData);
            }
        });

        // 3. Real-time Code Sync
        socket.on("code_change", (data: { room: string; code: string }) => {
            // Only broadcast if the game hasn't ended
            const roomData = activeRooms.get(data.room);
            if (roomData && !roomData.winnerId) {
                socket.to(data.room).emit("receive_code", data.code);
            }
        });

        // 4. Handle Submission (Game End Logic)
        socket.on("submit_solution", (data: { room: string; problemId: string; submitterId: string }) => {
            const { room, submitterId } = data;
            const roomData = activeRooms.get(room);

            if (!roomData) {
                socket.emit("submission_rejected", "Room not found.");
                return;
            }

            if (roomData.winnerId) {
                // Game already has a winner, reject submission
                socket.emit("submission_rejected", `The problem has already been solved by ${roomData.winnerId}.`);
                return;
            }

            // --- Mock Judge Logic: Declare Winner on the Server side ---
            const winnerMMRChange = calculateMMRChange(true);
            const loserMMRChange = calculateMMRChange(false);

            // 1. Declare Winner
            roomData.winnerId = submitterId;
            activeRooms.set(room, roomData);

            console.log(`WINNER in room ${room}: ${submitterId}`);

            // 2. Broadcast game end and winner information to ALL clients in the room
            io.to(room).emit("game_ended", {
                winnerId: submitterId,
                // Send the correct MMR change based on whether the recipient is the winner or not
                mmrChange: submitterId === data.submitterId ? winnerMMRChange : loserMMRChange
            });
        });


        // 5. Disconnect
        socket.on("disconnect", () => {
            console.log("User Disconnected", socket.id);
            // In a real system, you would handle room cleanup here.
        });
    });
};
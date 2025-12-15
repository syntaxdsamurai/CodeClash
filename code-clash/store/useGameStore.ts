import { create } from 'zustand';

interface GameState {
    code: string;
    output: string;
    isRunning: boolean;
    opponentProgress: number; // 0 to 100
    roomCode: string | null;  // Tracks the current room ID

    // Actions Definition
    setCode: (code: string) => void;
    setOutput: (output: string) => void;
    setRunning: (isRunning: boolean) => void;
    setOpponentProgress: (progress: number) => void;
    setRoomCode: (roomCode: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
    // Initial State
    code: "// Write your solution here...\n\nfunction solution() {\n  return true;\n}",
    output: "Ready to execute...",
    isRunning: false,
    opponentProgress: 0,
    roomCode: null,

    // Actions Implementation (FIXED: Added explicit types to parameters)
    setCode: (code: string) => set({ code }),
    setOutput: (output: string) => set({ output }),
    setRunning: (isRunning: boolean) => set({ isRunning }),
    setOpponentProgress: (progress: number) => set({ opponentProgress: progress }),
    setRoomCode: (roomCode: string | null) => set({ roomCode }),
}));
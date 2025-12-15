import { create } from 'zustand';

interface GameState {
    code: string;
    output: string;
    isRunning: boolean;
    opponentProgress: number; // 0 to 100

    // Actions to update state
    setCode: (code: string) => void;
    setOutput: (output: string) => void;
    setRunning: (isRunning: boolean) => void;
    setOpponentProgress: (progress: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
    code: "// Write your solution here...\n\nfunction solution() {\n  return true;\n}",
    output: "Ready to execute...",
    isRunning: false,
    opponentProgress: 0,

    setCode: (code) => set({ code }),
    setOutput: (output) => set({ output }),
    setRunning: (isRunning) => set({ isRunning }),
    setOpponentProgress: (progress) => set({ opponentProgress: progress }),
}));
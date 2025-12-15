"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import {
    ChevronLeft, Play, Send, Clock, ChevronDown, Check,
    Signal, Laptop2, Loader2, Award
} from 'lucide-react';
import Link from 'next/link';
import { socket } from '@/lib/socket';
import { useGameStore, PROBLEM_SET } from '@/store/useGameStore'; // Import PROBLEM_SET

// --- Mock Data ---
const LEADERBOARD = [
    { rank: 1, user: "Dhruv", score: 2400, language: "C++" },
    { rank: 2, user: "Abhya", score: 2350, language: "Python" },
    { rank: 3, user: "Parth", score: 2100, language: "Java" },
    { rank: 4, user: "Gaurav", score: 1950, language: "JS" },
];

const LANGUAGES = [
    { id: 'javascript', name: 'JAVASCRIPT', icon: 'JS' },
    { id: 'cpp', name: 'C++ (GCC 9.2)', icon: 'CPP' },
    { id: 'java', name: 'JAVA (JDK 13)', icon: 'JAVA' },
    { id: 'python', name: 'PYTHON 3.8', icon: 'PY' },
];

// Helper function to format seconds into MM:SS
const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Mock check for a "passing" solution. In a real app, this would be a full code execution sandbox.
const isMockSolutionCorrect = (code: string) => {
    // Arbitrary check for demonstration purposes - assume solution is correct if it includes a common keyword
    return code.toLowerCase().includes('function') || code.toLowerCase().includes('class');
}

export default function Arena() {
    // Fetched all required state and actions from the store
    const {
        code, setCode,
        roomCode, setRoomCode,
        output, setOutput,
        isRunning, setRunning,
        currentProblem, setCurrentProblem,
        winnerId, setWinnerId,
        userDisplayName
    } = useGameStore();

    const { theme, systemTheme } = useTheme();
    const searchParams = useSearchParams();

    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'problem' | 'leaderboard'>('problem');
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [isLangOpen, setIsLangOpen] = useState(false);
    // State for the live countdown timer, starting at 15 minutes (900 seconds)
    const [timeRemaining, setTimeRemaining] = useState(900);

    // Determine if the current user is the winner
    const isWinner = useMemo(() => winnerId === userDisplayName, [winnerId, userDisplayName]);

    // Derive Game State from URL
    const urlRoom = searchParams.get('room');
    const isTestMode = searchParams.get('mode') === 'test';
    const isPvP = !!urlRoom && !isTestMode;

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';

    // --- Initializers ---

    // 1. Initialize & Connect to Room on Load + Select Problem
    useEffect(() => {
        setMounted(true);
        setWinnerId(null); // Reset winner on component load

        // Randomly select a problem if not already set (for solo/host)
        if (!currentProblem) {
            const randomIndex = Math.floor(Math.random() * PROBLEM_SET.length);
            const initialProblem = PROBLEM_SET[randomIndex];
            setCurrentProblem(initialProblem);

            // Set initial code for the selected language
            const initialCode = initialProblem.starterCode[language.id as keyof typeof initialProblem.starterCode];
            setCode(initialCode);
        }

        // If URL has a room but Store doesn't, sync them
        if (urlRoom && !roomCode) {
            setRoomCode(urlRoom);
            if (!socket.connected) {
                socket.connect();
            }
            socket.emit("join_room", { roomCode: urlRoom, displayName: userDisplayName });

            // Request problem state from server upon joining
            socket.emit("request_problem_state", urlRoom);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlRoom, roomCode, setRoomCode, setCurrentProblem, setCode, setWinnerId, language.id]);

    // 2. Timer Logic
    useEffect(() => {
        // Only run timer if not in test mode AND game is not won
        if (isTestMode || winnerId) return;

        const timerId = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    setRunning(false);
                    setOutput("Time's up! The match has ended.");
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [isTestMode, winnerId, setRunning, setOutput]);

    // 3. Real-Time Code Sync Listener & Game End Listener
    useEffect(() => {
        if (!isPvP) return;

        // Listen for code changes from opponent
        socket.on("receive_code", (newCode: string) => {
            setCode(newCode);
        });

        // Listener for when a player solves the problem
        socket.on("game_ended", (data: { winnerId: string, mmrChange: number }) => {
            setWinnerId(data.winnerId);
            setRunning(false);

            if (data.winnerId === userDisplayName) {
                setOutput(`🏆 VICTORY! You solved the problem first and gained ${data.mmrChange} MMR!`);
            } else {
                // Determine if this user won or lost MMR (mock logic: winner +25, loser -10)
                const displayMMR = data.winnerId === userDisplayName ? `+${data.mmrChange}` : `${data.mmrChange}`;
                setOutput(`🚨 MATCH ENDED: ${data.winnerId} solved the problem first. Your MMR change: ${displayMMR}`);
            }
        });

        // Listener for syncing problem state when joining an existing room
        socket.on("receive_problem_state", (data: { problemId: string, winnerId: string | null }) => {
            const problem = PROBLEM_SET.find(p => p.id === data.problemId);
            if (problem) {
                setCurrentProblem(problem);
                // Reset code based on the loaded problem's boilerplate for the current language
                const currentLangId = language.id as keyof typeof problem.starterCode;
                const initialCode = problem.starterCode[currentLangId] || problem.starterCode.javascript;
                setCode(initialCode);
            }
            setWinnerId(data.winnerId);
        });

        socket.on("submission_rejected", (message: string) => {
            setRunning(false);
            setOutput(`Submission Rejected by Server: ${message}`);
        });


        return () => {
            socket.off("receive_code");
            socket.off("game_ended");
            socket.off("receive_problem_state");
            socket.off("submission_rejected");
        };
    }, [isPvP, setCode, setWinnerId, setCurrentProblem, setOutput, setRunning, userDisplayName, language.id]);

    // 4. Handle Typing (Broadcast to others)
    const handleEditorChange = (value: string | undefined) => {
        const newCode = value || "";
        setCode(newCode);

        if (isPvP && (roomCode || urlRoom)) {
            socket.emit("code_change", { room: roomCode || urlRoom, code: newCode });
        }
    };

    // 5. Handle Language Switch
    const handleLanguageChange = (langId: string) => {
        const selected = LANGUAGES.find(l => l.id === langId) || LANGUAGES[0];
        setLanguage(selected);

        // Use the current problem's boilerplate or fallback to default
        const boilerplate = currentProblem ?
            currentProblem.starterCode[langId as keyof typeof currentProblem.starterCode] || '' :
            '// Code boilerplate not available for this language/problem.';

        setCode(boilerplate);
        setIsLangOpen(false);

        // Broadcast language change reset (which triggers code sync)
        if (isPvP && (roomCode || urlRoom)) {
            socket.emit("code_change", { room: roomCode || urlRoom, code: boilerplate });
        }
    };

    // 6. Handle Run Button Logic
    const handleRun = () => {
        if (isRunning || winnerId || timeRemaining === 0) return;

        setRunning(true);
        setOutput(`Executing your code (Language: ${language.name})...`);

        // Simulating the Judge running the code
        setTimeout(() => {
            setRunning(false);
            if (isMockSolutionCorrect(code)) {
                setOutput(`✅ Execution Successful for Sample 1. Time: 1ms, Memory: 8MB.
            
Output: ${currentProblem?.output || 'No output data.'}`);
            } else {
                setOutput(`❌ Execution Failed for Sample 1.
Error: Solution timed out or failed a mock test case.`);
            }
        }, 1200);
    };

    // 7. Handle Submit Button Logic
    const handleSubmit = () => {
        if (isRunning || winnerId || timeRemaining === 0) return;

        // Perform local mock check first
        if (!isMockSolutionCorrect(code)) {
            setOutput("❌ Submission Rejected. Solution failed local mock check. Please fix errors before submitting.");
            return;
        }

        setRunning(true);
        setOutput("Submitting solution to the Judge System. Awaiting official verdict...");

        if (isTestMode) {
            // Mock delay for solo mode
            setTimeout(() => {
                setRunning(false);
                setOutput(`🎉 Submission Accepted in Diagnostic Mode! Passed mock tests.`);
            }, 1500);
        } else if (isPvP && currentProblem) {
            // Emit event to server to handle game-ending logic
            socket.emit("submit_solution", {
                room: roomCode || urlRoom,
                problemId: currentProblem.id,
                submitterId: userDisplayName
            });
        }
    };


    if (!mounted || !currentProblem) return null;

    return (
        <div className="flex flex-col h-screen bg-background text-foreground p-3 md:p-4 gap-4 overflow-hidden font-sans selection:bg-primary/20">

            {/* HEADER */}
            <header className="flex h-14 items-center justify-between border border-border bg-card shadow-sm z-20 shrink-0 px-4 rounded-lg">
                <div className="flex items-center gap-4">
                    <Link href="/" className="group flex items-center justify-center w-8 h-8 border border-border bg-secondary hover:bg-primary hover:text-primary-foreground transition-all rounded-md">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>

                    <div className="flex flex-col justify-center">
                        <h1 className="text-sm font-bold uppercase tracking-tight flex items-center gap-3">
                            {currentProblem.title}
                            <span className="px-1.5 py-0.5 border border-border bg-secondary/50 text-[10px] text-muted-foreground font-bold uppercase tracking-wider rounded-sm">{currentProblem.difficulty}</span>
                        </h1>

                        {/* Connection Status */}
                        <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-2">
                            {isPvP ? (
                                <>
                                    <Signal className={`w-3 h-3 ${winnerId ? 'text-red-500' : 'text-emerald-500 animate-pulse'}`} />
                                    <span className={`${winnerId ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}`}>
                                        {winnerId ? `MATCH ENDED (${winnerId} WON)` : `CONNECTED :: ROOM ${roomCode || urlRoom}`}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Laptop2 className="w-3 h-3 text-amber-500" />
                                    <span>OFFLINE :: DIAGNOSTIC MODE</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Avatar / Winner Badge */}
                <div className="flex items-center gap-4">
                    {isWinner && (
                        <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full animate-in fade-in zoom-in-90 duration-500">
                            <Award className="w-4 h-4 fill-primary text-primary" /> Winner!
                        </div>
                    )}
                    <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold rounded-md shadow-sm">
                        {userDisplayName.charAt(0)}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <div className="flex flex-1 gap-4 overflow-hidden">

                {/* LEFT PANEL */}
                <div className="w-1/3 min-w-[350px] flex flex-col border border-border bg-card shadow-sm overflow-hidden rounded-lg">
                    {/* Tabs */}
                    <div className="flex border-b border-border bg-secondary/30 p-1 gap-1">
                        <button onClick={() => setActiveTab('problem')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm ${activeTab === 'problem' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Problem</button>
                        <button onClick={() => setActiveTab('leaderboard')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm ${activeTab === 'leaderboard' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Leaderboard</button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        {activeTab === 'problem' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="prose prose-sm dark:prose-invert text-sm leading-relaxed text-muted-foreground">
                                    {/* Dynamic Problem Description */}
                                    <div dangerouslySetInnerHTML={{ __html: currentProblem.description }} />

                                    <div className="mt-6 border border-border bg-secondary/20 rounded-md p-4 grid gap-3 font-mono text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Input:</span>
                                            <span className="text-foreground">{currentProblem.input}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-border pt-2">
                                            <span className="text-muted-foreground">Output:</span>
                                            <span className="text-primary font-bold">{currentProblem.output}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'leaderboard' && (
                            <div className="space-y-1">
                                {LEADERBOARD.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-md hover:bg-secondary/50 transition-colors">
                                        <div className="flex items-center gap-3"><span className="font-mono text-xs font-bold text-muted-foreground">#{p.rank}</span><span className="text-sm font-medium">{p.user}</span></div>
                                        <span className="text-xs font-mono font-bold text-primary">{p.score} MMR</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Editor & Console */}
                <div className="flex-1 flex flex-col border border-border bg-card shadow-sm overflow-hidden relative rounded-lg">
                    {/* Toolbar */}
                    <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
                        <div className="relative">
                            <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-secondary transition-all text-xs font-bold uppercase tracking-wider">
                                <span className="text-primary">{language.icon}</span>{language.name}<ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                            {isLangOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                    <div className="absolute top-full left-0 mt-1 w-48 py-1 border border-border bg-popover shadow-xl z-50 rounded-md animate-in fade-in zoom-in-95 duration-100">
                                        {LANGUAGES.map((lang) => (
                                            <button key={lang.id} onClick={() => handleLanguageChange(lang.id)} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-secondary flex items-center justify-between">
                                                {lang.name}{language.id === lang.id && <Check className="w-3 h-3 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span>{formatTime(timeRemaining)}</span></div>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 relative bg-[#1e1e1e] overflow-hidden">
                        <Editor
                            height="100%"
                            language={language.id === 'cpp' ? 'cpp' : language.id}
                            value={code}
                            theme={isDark ? "vs-dark" : "light"}
                            onChange={handleEditorChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                automaticLayout: true,
                                padding: { top: 20, bottom: 20 },
                                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                cursorBlinking: 'smooth',
                                smoothScrolling: true,
                            }}
                        />
                    </div>

                    {/* Console Panel */}
                    <div className="h-40 border-t border-border bg-background flex flex-col p-3 shrink-0">
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Console
                        </div>
                        <pre className="flex-1 text-xs font-mono overflow-y-auto text-foreground/80 whitespace-pre-wrap">
                            {output}
                        </pre>
                    </div>

                    {/* Actions */}
                    <div className="absolute bottom-6 right-6 flex gap-3 z-10">
                        <button
                            onClick={handleRun}
                            disabled={isRunning || winnerId !== null || timeRemaining === 0}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider border shadow-sm rounded-md transition-all 
                                ${isRunning || winnerId !== null || timeRemaining === 0 ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'bg-card text-foreground border-border hover:bg-secondary'}`}
                        >
                            {isRunning ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" /> Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-3 h-3 fill-current" /> Run
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning || winnerId !== null || timeRemaining === 0}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg rounded-md transition-all 
                                ${isRunning || winnerId !== null || timeRemaining === 0 ? 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                        >
                            {isRunning ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-3 h-3" /> Submit
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
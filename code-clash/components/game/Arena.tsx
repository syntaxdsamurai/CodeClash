"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import {
    ChevronLeft, Play, Send, Clock, ChevronDown, Check,
    Signal, Laptop2
} from 'lucide-react';
import Link from 'next/link';
import { socket } from '@/lib/socket';
import { useGameStore } from '@/store/useGameStore';

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

const BOILERPLATES: Record<string, string> = {
    javascript: `function solution(s) {\n  // JavaScript Solution\n  return s.reverse();\n}`,
    cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // C++ Solution\n    }\n};`,
    java: `class Solution {\n    public void reverseString(char[] s) {\n        // Java Solution\n    }\n}`,
    python: `class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        """\n        Do not return anything, modify s in-place instead.\n        """\n        pass`,
};

export default function Arena() {
    const { theme, systemTheme } = useTheme();
    const searchParams = useSearchParams();

    // Global State
    const { code, setCode, roomCode, setRoomCode } = useGameStore();

    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'problem' | 'leaderboard'>('problem');
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [isLangOpen, setIsLangOpen] = useState(false);

    // Derive Game State from URL
    const urlRoom = searchParams.get('room');
    const isTestMode = searchParams.get('mode') === 'test';
    const isPvP = !!urlRoom && !isTestMode;

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';

    // 1. Initialize & Connect to Room on Load
    useEffect(() => {
        setMounted(true);

        // If URL has a room but Store doesn't, sync them
        if (urlRoom && !roomCode) {
            setRoomCode(urlRoom);
            if (!socket.connected) {
                socket.connect();
            }
            socket.emit("join_room", urlRoom);
        }
    }, [urlRoom, roomCode, setRoomCode]);

    // 2. Real-Time Code Sync Listener
    useEffect(() => {
        if (!isPvP) return;

        // Listen for code changes from opponent
        socket.on("receive_code", (newCode: string) => {
            // console.log("Received update:", newCode); // Uncomment for debugging
            setCode(newCode);
        });

        return () => {
            socket.off("receive_code");
        };
    }, [isPvP, setCode]);

    // 3. Handle Typing (Broadcast to others)
    const handleEditorChange = (value: string | undefined) => {
        const newCode = value || "";
        setCode(newCode);

        // IMPROVED: Check both store roomCode AND urlRoom for safety
        if (isPvP && (roomCode || urlRoom)) {
            socket.emit("code_change", { room: roomCode || urlRoom, code: newCode });
        }
    };

    // 4. Handle Language Switch
    const handleLanguageChange = (langId: string) => {
        const selected = LANGUAGES.find(l => l.id === langId) || LANGUAGES[0];
        setLanguage(selected);
        const newCode = BOILERPLATES[langId];
        setCode(newCode);
        setIsLangOpen(false);

        // IMPROVED: Broadcast language change reset
        if (isPvP && (roomCode || urlRoom)) {
            socket.emit("code_change", { room: roomCode || urlRoom, code: newCode });
        }
    };

    if (!mounted) return null;

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
                            Reverse String
                            <span className="px-1.5 py-0.5 border border-border bg-secondary/50 text-[10px] text-muted-foreground font-bold uppercase tracking-wider rounded-sm">Easy</span>
                        </h1>

                        {/* Connection Status */}
                        <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-2">
                            {isPvP ? (
                                <>
                                    {/* IMPROVED: Added pulse animation */}
                                    <Signal className="w-3 h-3 text-emerald-500 animate-pulse" />
                                    <span className="text-emerald-600 font-bold">CONNECTED :: ROOM {roomCode || urlRoom}</span>
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

                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold rounded-md shadow-sm">
                        D
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
                                    <p className="mb-4 text-foreground">Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.</p>
                                    <p>You must do this by modifying the input array <strong>in-place</strong> with <code>O(1)</code> extra memory.</p>

                                    <div className="mt-6 border border-border bg-secondary/20 rounded-md p-4 grid gap-3 font-mono text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Input:</span>
                                            <span className="text-foreground">s = ["h","e","l","l","o"]</span>
                                        </div>
                                        <div className="flex justify-between border-t border-border pt-2">
                                            <span className="text-muted-foreground">Output:</span>
                                            <span className="text-primary font-bold">["o","l","l","e","h"]</span>
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

                {/* RIGHT PANEL: Editor */}
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
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span>00:14:32</span></div>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 relative bg-[#1e1e1e]">
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

                    {/* Actions */}
                    <div className="absolute bottom-6 right-6 flex gap-3 z-10">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-card text-foreground text-xs font-bold uppercase tracking-wider border border-border shadow-sm hover:bg-secondary transition-all rounded-md"><Play className="w-3 h-3 fill-current" /> Run</button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-90 transition-all rounded-md"><Send className="w-3 h-3" /> Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
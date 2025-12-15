"use client";

import { useState } from "react";
import { Copy, Swords, Users, Loader2, ArrowRight, Bot, Terminal, X, ShieldCheck, Keyboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MatchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();
    const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
    const [roomCode, setRoomCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Mock function to generate a room code
    const createRoom = () => {
        setIsLoading(true);
        setTimeout(() => {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            setRoomCode(code);
            setMode('create');
            setIsLoading(false);
        }, 1000);
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomCode) return;
        setIsLoading(true);
        setTimeout(() => {
            router.push(`/arena?room=${roomCode}`);
        }, 1000);
    };

    const startTestMode = () => {
        setIsLoading(true);
        router.push('/arena?mode=test');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">

            {/* DIALOG CONTAINER */}
            <div className="w-full max-w-lg rounded-xl border-2 border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header - Technical Look */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-lg tracking-tight">System Access</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 md:p-8">

                    {/* MENU STATE */}
                    {mode === 'menu' && (
                        <div className="grid gap-4">
                            {/* Option 1: Create Room */}
                            <button
                                onClick={createRoom}
                                className="flex items-center justify-between p-6 rounded-lg border-2 border-border bg-card hover:border-primary/50 hover:bg-secondary/20 transition-all group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">Initialize Room</div>
                                        <div className="text-xs text-muted-foreground font-mono mt-1">HOST_PROTOCOL://PRIVATE</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>

                            {/* Option 2: Join Room */}
                            <button
                                onClick={() => setMode('join')}
                                className="flex items-center justify-between p-6 rounded-lg border-2 border-border bg-card hover:border-primary/50 hover:bg-secondary/20 transition-all group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                                        <Keyboard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">Join Session</div>
                                        <div className="text-xs text-muted-foreground font-mono mt-1">CONNECT://REMOTE_ID</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                            </button>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                            </div>

                            {/* Option 3: Test Mode */}
                            <button
                                onClick={startTestMode}
                                className="w-full py-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                            >
                                <Bot className="w-4 h-4" />
                                Run Solo / Diagnostic Mode
                            </button>
                        </div>
                    )}

                    {/* CREATE ROOM STATE */}
                    {mode === 'create' && (
                        <div className="text-center space-y-8">
                            <div className="p-8 bg-secondary/20 rounded-xl border-2 border-dashed border-border group relative overflow-hidden">
                                <div className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Access Code Generated</div>

                                <div className="text-5xl font-mono font-bold tracking-[0.2em] text-primary flex items-center justify-center gap-4">
                                    {roomCode}
                                </div>

                                <button
                                    onClick={() => navigator.clipboard.writeText(roomCode)}
                                    className="absolute top-4 right-4 p-2 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-primary"
                                    title="Copy Code"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                <span className="font-mono">WAITING_FOR_PEER_CONNECTION...</span>
                            </div>

                            <div className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                                <span className="font-bold text-primary">TIP:</span> Open a new tab and join with code <span className="font-mono bg-muted px-1 rounded">{roomCode}</span> to simulate a match.
                            </div>
                        </div>
                    )}

                    {/* JOIN ROOM STATE */}
                    {mode === 'join' && (
                        <form onSubmit={handleJoin} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Enter Access Token</label>
                                <input
                                    type="text"
                                    placeholder="XXXXXX"
                                    autoFocus
                                    className="w-full h-16 px-6 rounded-lg border-2 border-border bg-background text-3xl font-mono uppercase tracking-[0.5em] text-center focus:border-primary focus:ring-0 focus:outline-none placeholder:text-muted/30 transition-all"
                                    maxLength={6}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMode('menu')}
                                    className="flex-1 py-4 rounded-lg border border-border font-bold text-muted-foreground hover:bg-muted/50 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || roomCode.length < 3}
                                    className="flex-[2] py-4 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect'}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
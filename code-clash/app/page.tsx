"use client";

import React, { useState, useEffect } from "react";
// ADDED: ArrowUpRight to the imports
import {
    Terminal, Cpu, Zap, Globe,
    LayoutGrid, Bot, ArrowUpRight
} from "lucide-react";
import MatchDialog from "@/components/game/MatchDialog";
import { useRouter } from "next/navigation";

// --- Sub-Component: The Music Bar Animation ---
const MusicBars = () => (
    <div className="flex gap-[2px] items-end h-3 mb-0.5">
        <span className="music-bar bg-primary w-[3px]"></span>
        <span className="music-bar bg-primary w-[3px]"></span>
        <span className="music-bar bg-primary w-[3px]"></span>
    </div>
);

export default function LandingPage() {
    const router = useRouter();
    const [isMatchOpen, setIsMatchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col p-4 md:p-6 gap-6 selection:bg-foreground selection:text-background">

            {/* 1. HEADER: Clean & Minimal */}
            <header className="flex h-16 items-center justify-between border border-border bg-card px-8 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-lg">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <span>CodeClash</span>
                </div>

                {/* Name with Hover Animation */}
                <div className="group flex items-center gap-3 cursor-default">
                   <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                     Engineered by
                   </span>
                    <div className="flex items-end gap-2 px-3 py-1.5 rounded-md bg-secondary/50 group-hover:bg-secondary transition-colors">
                        <span className="font-bold text-sm">Dhruv</span>
                        <MusicBars />
                    </div>
                </div>
            </header>

            {/* 2. MAIN BENTO GRID */}
            <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* HERO BLOCK: Bold Typography */}
                <div className="md:col-span-8 border border-border bg-card rounded-xl p-10 md:p-16 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-500">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background text-xs font-bold uppercase tracking-wider mb-8 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            System Online
                        </div>
                        <h1 className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tight mb-8">
                            Master the <br/>
                            <span className="text-muted-foreground">Algorithm.</span>
                        </h1>
                    </div>

                    <div className="flex flex-col gap-6 border-l-2 border-primary/20 pl-6">
                        <p className="max-w-md text-lg text-muted-foreground leading-relaxed">
                            A real-time competitive coding environment.
                            Benchmark your runtime against the world's best engineers.
                        </p>

                        {/* HERO STATS: Technical Specs (Meaningful) */}
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-primary" /> Next.js 16 Powered
                            </div>
                            <span className="text-border">/</span>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" /> React 19 Core
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTION BLOCK: The "Enter" Interface */}
                <div className="md:col-span-4 flex flex-col gap-6">

                    {/* Primary Action: Enter Arena */}
                    <button
                        onClick={() => setIsMatchOpen(true)}
                        className="flex-1 bg-primary text-primary-foreground rounded-xl flex flex-col items-center justify-center gap-4 group hover:opacity-90 transition-all shadow-xl relative overflow-hidden"
                    >
                        {/* Decoration Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                        <Terminal className="w-10 h-10 relative z-10" />
                        <div className="text-center relative z-10">
                            <span className="block text-2xl font-bold tracking-tight">Enter Arena</span>
                            <span className="text-xs opacity-70 font-mono mt-1">Initialize Session_01</span>
                        </div>
                    </button>

                    {/* Secondary Action: Quick Diagnostic */}
                    <button
                        onClick={() => router.push('/arena?mode=test')}
                        className="h-40 border border-border bg-card rounded-xl p-8 flex flex-col justify-center hover:border-primary/30 transition-colors group cursor-pointer text-left"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <Bot className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold tracking-tight">Run Diagnostic</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                                Solo Sandbox Mode
                            </div>
                        </div>
                    </button>
                </div>

                {/* FEATURES STRIP */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Cpu, title: "Runtime Analysis", desc: "Detailed breakdown of Time & Space complexity." },
                        { icon: Globe, title: "Multi-Language", desc: "Support for C++, Python, Java, and JavaScript." },
                        { icon: Zap, title: "Low Latency", desc: "WebSocket infrastructure for instant syncing." },
                    ].map((feature, i) => (
                        <div key={i} className="border border-border bg-card rounded-xl p-6 hover:border-primary/20 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center mb-4 text-primary">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

            </main>

            {/* 3. FOOTER: Trimmed & Animated */}
            <footer className="h-14 border border-border bg-card rounded-xl flex items-center justify-center px-8 text-xs font-medium text-muted-foreground">
                <a href="https://github.com/syntaxdsamurai" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1 hover:text-foreground transition-colors">
                    <span>© 2025 CodeClash Systems | Engineered by Dhruv</span>
                    <span className="text-primary font-bold group-hover:hidden animate-pulse">_</span>
                    <span className="text-primary font-bold hidden group-hover:inline-block">;)</span>
                </a>
            </footer>

            <MatchDialog isOpen={isMatchOpen} onClose={() => setIsMatchOpen(false)} />
        </div>
    );
}
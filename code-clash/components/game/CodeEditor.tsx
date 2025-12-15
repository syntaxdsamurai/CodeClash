"use client";

import Editor from "@monaco-editor/react";
import { useGameStore } from "@/store/useGameStore";

export default function CodeEditor() {
    const { code, setCode } = useGameStore();

    return (
        <div className="h-full w-full flex flex-col bg-panel rounded-xl overflow-hidden border border-white/5 shadow-2xl">
            {/* Editor Header */}
            <div className="h-9 bg-black/40 border-b border-white/5 flex items-center px-4 justify-between select-none">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 group">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 group-hover:bg-red-500 transition-colors" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500 transition-colors" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 group-hover:bg-green-500 transition-colors" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono ml-3 uppercase tracking-wider">script.js</span>
                </div>
                <div className="text-[10px] text-zinc-600 font-mono">Read-Only Mode: OFF</div>
            </div>

            {/* Monaco Instance */}
            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        contextmenu: false,
                    }}
                />
            </div>
        </div>
    );
}
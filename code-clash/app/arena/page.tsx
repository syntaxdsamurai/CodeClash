import { Suspense } from "react";
import Arena from "@/components/game/Arena";

export default function ArenaPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-hidden">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Arena...</div>}>
                <Arena />
            </Suspense>
        </main>
    );
}
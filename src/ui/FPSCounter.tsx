import { useState, useEffect } from 'react';

export function FPSCounter() {
    const [fps, setFps] = useState(60);
    const [showFPS, setShowFPS] = useState(false);

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationId: number;

        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            const elapsed = currentTime - lastTime;

            if (elapsed >= 1000) {
                setFps(Math.round((frameCount * 1000) / elapsed));
                frameCount = 0;
                lastTime = currentTime;
            }

            animationId = requestAnimationFrame(updateFPS);
        };

        animationId = requestAnimationFrame(updateFPS);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    // TODO: Hook this up to settings
    useEffect(() => {
        const stored = localStorage.getItem('showFPS');
        if (stored) setShowFPS(JSON.parse(stored));
    }, []);

    if (!showFPS) return null;

    const getFPSColor = () => {
        if (fps >= 55) return 'text-green-400';
        if (fps >= 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="fixed top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700 z-50">
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">FPS:</span>
                <span className={`text-sm font-bold font-mono ${getFPSColor()}`}>
                    {fps}
                </span>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [performanceMode, setPerformanceMode] = useState<'low' | 'medium' | 'high'>('medium');
    const [showFPS, setShowFPS] = useState(false);

    const handleVolumeChange = (value: number) => {
        setVolume(value);
        // TODO: Actually set game volume
        if (value === 0) setIsMuted(true);
        else setIsMuted(false);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) setVolume(0);
        else setVolume(50);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-800">
                                <h2 className="text-xl font-bold text-white">Settings</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <span className="text-slate-400 text-xl">×</span>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Volume */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-slate-300">Volume</label>
                                        <button
                                            onClick={toggleMute}
                                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            {isMuted ? (
                                                <span className="text-slate-400">🔇</span>
                                            ) : (
                                                <span className="text-blue-400">🔊</span>
                                            )}
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={volume}
                                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-slate-500">0%</span>
                                        <span className="text-xs text-slate-400">{volume}%</span>
                                        <span className="text-xs text-slate-500">100%</span>
                                    </div>
                                </div>

                                {/* Performance Mode */}
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-3 block">
                                        Graphics Quality
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['low', 'medium', 'high'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setPerformanceMode(mode)}
                                                className={`px-4 py-3 rounded-lg font-medium transition-all ${performanceMode === mode
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {mode === 'low' && <span className="text-xl">🐌</span>}
                                                {mode === 'medium' && <span className="text-xl">⚡</span>}
                                                {mode === 'high' && <span className="text-xl">🚀</span>}
                                                <div className="text-xs capitalize">{mode}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {performanceMode === 'low' && 'Best for older devices'}
                                        {performanceMode === 'medium' && 'Balanced performance'}
                                        {performanceMode === 'high' && 'Maximum visual quality'}
                                    </p>
                                </div>

                                {/* FPS Counter */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-slate-300">Show FPS</label>
                                        <p className="text-xs text-slate-500 mt-1">Display performance counter</p>
                                    </div>
                                    <button
                                        onClick={() => setShowFPS(!showFPS)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${showFPS ? 'bg-blue-600' : 'bg-slate-700'
                                            }`}
                                    >
                                        <div
                                            className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${showFPS ? 'translate-x-6' : 'translate-x-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-800 text-xs text-slate-500 text-center">
                                HTM Academy v0.1.7 • Made with ❤️
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

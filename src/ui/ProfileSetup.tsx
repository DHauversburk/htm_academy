import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import { supabase } from '../lib/supabase';

export const ProfileSetup = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const {
        playerName, setPlayerName,
        difficulty, setDifficulty,
        completeSetup, setAuthMode,
        avatarColor, setAvatarColor
    } = useGameStore();

    const AVATAR_COLORS = [
        { hex: 0xffffff, label: 'Standard' },
        { hex: 0x4ade80, label: 'Bio' },
        { hex: 0x00ffff, label: 'Electric' },
        { hex: 0xc084fc, label: 'Plasma' },
        { hex: 0xf472b6, label: 'Alert' },
        { hex: 0xfacc15, label: 'Hazard' }
    ];

    // Quick Start: Guest mode, random name, easy difficulty, skip tutorial
    const handleQuickStart = () => {
        setAuthMode('guest');
        setPlayerName(`Guest_${Math.floor(Math.random() * 9999)}`);
        setDifficulty('easy');
        completeSetup();

        // Skip tutorial, go straight to game
        EventBus.emit('tutorial-complete');
    };

    // Customized Start: Save preferences, optional tutorial
    const handleCustomStart = async () => {
        if (!playerName.trim()) {
            setError('Please enter your operative name');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // If email provided, try auth
            if (email && password) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

                if (signUpError) {
                    // Try sign in instead
                    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                    if (signInError) {
                        setError('Authentication failed. Continuing as guest.');
                        setAuthMode('guest');
                    } else {
                        setAuthMode('authenticated');
                    }
                } else {
                    setAuthMode('authenticated');
                }
            } else {
                setAuthMode('guest');
            }

            completeSetup();
            EventBus.emit('start-tutorial');
        } catch (err) {
            setError('Setup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full p-8"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent mb-2">
                        HTM ACADEMY
                    </h1>
                    <p className="text-slate-400 text-lg">Biomedical Equipment Training Simulation</p>
                </div>

                {/* Quick Start Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 mb-4 cursor-pointer shadow-2xl border-2 border-blue-400"
                    onClick={handleQuickStart}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">⚡ Quick Start</h2>
                            <p className="text-blue-100 text-sm">Jump in immediately (Guest Mode, Easy Difficulty)</p>
                        </div>
                        <div className="text-4xl">→</div>
                    </div>
                </motion.div>

                {/* Customize Option */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <h3 className="text-lg font-semibold text-white">🎨 Customize Experience</h3>
                        <span className="text-slate-400">{showAdvanced ? '▼' : '▶'}</span>
                    </div>

                    {showAdvanced && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-6 space-y-4"
                        >
                            {/* Name */}
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Operative Name</label>
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your name..."
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    maxLength={20}
                                />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Clearance Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['easy', 'medium', 'hard'].map((diff) => (
                                        <button
                                            key={diff}
                                            onClick={() => setDifficulty(diff as any)}
                                            className={`px-4 py-3 rounded-lg font-semibold transition ${difficulty === diff
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                        >
                                            {diff === 'easy' && '👨‍🔧 Intern'}
                                            {diff === 'medium' && '🔧 BMET'}
                                            {diff === 'hard' && '🛠️ Expert'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Avatar Color */}
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Avatar Color</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {AVATAR_COLORS.map((color) => (
                                        <button
                                            key={color.hex}
                                            onClick={() => setAvatarColor(color.hex)}
                                            className={`w-12 h-12 rounded-lg transition ${avatarColor === color.hex ? 'ring-4 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                                                }`}
                                            style={{ backgroundColor: `#${color.hex.toString(16).padStart(6, '0')}` }}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Optional Auth */}
                            <details className="text-sm">
                                <summary className="text-slate-400 cursor-pointer hover:text-slate-200 py-2">
                                    + Cloud Sync (Optional)
                                </summary>
                                <div className="mt-3 space-y-2 pl-4">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email (optional)"
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                    />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password (optional)"
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                    />
                                    <p className="text-xs text-slate-500">Save progress across devices</p>
                                </div>
                            </details>

                            {error && (
                                <div className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Start Button */}
                            <button
                                onClick={handleCustomStart}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 shadow-lg"
                            >
                                {isLoading ? 'Initializing...' : '🚀 Start Training'}
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

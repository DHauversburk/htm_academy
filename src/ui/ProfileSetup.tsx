import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

export const ProfileSetup = () => {
    // Stage: 'auth' | 'badge'
    const [stage, setStage] = useState<'auth' | 'badge'>('auth');
    const [authModeState, setAuthModeState] = useState<'guest' | 'login' | 'signup'>('guest');

    // Form Stats
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Store
    const {
        playerName, setPlayerName,
        difficulty, setDifficulty,
        completeSetup, setAuthMode,
        avatarColor, setAvatarColor
    } = useGameStore();

    const AVATAR_COLORS = [
        { hex: 0xffffff, label: 'Standard' },
        { hex: 0x4ade80, label: 'Biohazard' },
        { hex: 0x00ffff, label: 'Electric' },
        { hex: 0xc084fc, label: 'Plasma' },
        { hex: 0xf472b6, label: 'Laser' },
        { hex: 0xfacc15, label: 'Caution' }
    ];

    const handleAuth = async () => {
        if (authModeState === 'guest') {
            setAuthMode('guest');
            setStage('badge');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Auto sign-up/in logic
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

            if (signUpError) {
                // Try Sign In if user exists
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
                if (signInData.user) {
                    setAuthMode('authenticated');
                    setStage('badge');
                }
            } else if (signUpData.user) {
                setAuthMode('authenticated');
                setStage('badge');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartFn = () => {
        completeSetup();
        EventBus.emit('start-tutorial');
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <AnimatePresence mode="wait">
                {stage === 'auth' ? (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-lg overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">H</div>
                                <div>
                                    <h1 className="text-white font-bold tracking-wider">HTM ACADEMY</h1>
                                    <p className="text-[10px] text-blue-400 uppercase tracking-widest">Enterprise Access Terminal</p>
                                </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6">
                            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm text-center">{error}</div>}

                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-lg">
                                <button
                                    onClick={() => setAuthModeState('guest')}
                                    className={clsx("py-2 text-sm font-bold rounded transition-all", authModeState === 'guest' ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200")}
                                >
                                    GUEST ACCESS
                                </button>
                                <button
                                    onClick={() => setAuthModeState('login')}
                                    className={clsx("py-2 text-sm font-bold rounded transition-all", authModeState !== 'guest' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200")}
                                >
                                    AUTHORIZED LOGIN
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {authModeState === 'guest' ? (
                                    <motion.div key="guest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                                        <p className="text-slate-400 text-sm mb-6">Restricted features enabled.<br />Progress saved locally to browser storage.</p>
                                        <button onClick={handleAuth} className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 rounded tracking-wide transition-colors">
                                            CONTINUE AS GUEST
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Corporate ID (Email)</label>
                                            <input
                                                type="email"
                                                className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-2 rounded focus:border-blue-500 outline-none transition-colors"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="tech@htm-academy.org"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Passthrough Key</label>
                                            <input
                                                type="password"
                                                className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-2 rounded focus:border-blue-500 outline-none transition-colors"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAuth}
                                            disabled={isLoading}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded tracking-wide transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'VERIFYING...' : 'AUTHENTICATE'}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                ) : (

                    <motion.div
                        key="badge"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
                    >
                        {/* LEFT: THE BADGE PREVIEW */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl transform transition-all hover:scale-[1.02] duration-500">
                            {/* Badge Header */}
                            <div className="bg-blue-900 p-4 flex justify-between items-center text-white">
                                <div className="font-bold tracking-wider">HTM ACADEMY</div>
                                <div className="text-[10px] opacity-70">CONFIDENTIAL</div>
                            </div>

                            {/* Badge Content */}
                            <div className="p-8 flex flex-col items-center text-slate-900 bg-slate-50 relative">
                                {/* Holographic Overlay Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent pointer-events-none" />

                                {/* Avatar */}
                                <div className="w-32 h-32 bg-slate-200 rounded-lg border-2 border-slate-300 mb-6 overflow-hidden relative shadow-inner">
                                    <img
                                        src="assets/sprite_technician_chonk.png"
                                        className="absolute top-0 left-0 w-full h-full object-none object-[0_-80px] scale-[2.5]"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                    <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: `#${avatarColor.toString(16).padStart(6, '0')}` }} />
                                </div>

                                {/* Name Field */}
                                <div className="w-full mb-4">
                                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Operative Name</label>
                                    <input
                                        type="text"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-slate-300 text-2xl font-bold text-slate-900 focus:border-blue-600 outline-none text-center font-mono py-1"
                                        placeholder="ENTER NAME"
                                        autoFocus
                                    />
                                </div>

                                {/* Clearance Stamp */}
                                <div className="w-full flex justify-between items-end border-t border-slate-200 pt-4 mt-2">
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">Clearance</div>
                                        <div className={clsx("text-lg font-bold uppercase",
                                            difficulty === 'easy' ? "text-green-600" :
                                                difficulty === 'medium' ? "text-yellow-600" : "text-red-600"
                                        )}>
                                            {difficulty === 'easy' ? 'Intern' : difficulty === 'medium' ? 'Tech II' : 'Manager'}
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 border-2 border-slate-300 rounded opacity-50 flex items-center justify-center">
                                        QR
                                    </div>
                                </div>
                            </div>

                            {/* Badge Footer */}
                            <div className="bg-blue-950 p-2 text-center">
                                <span className="text-[10px] text-blue-400 tracking-[0.2em]">{authModeState === 'guest' ? 'TEMP_BADGE_0041' : 'AUTH_BADGE_8829'}</span>
                            </div>
                        </div>

                        {/* RIGHT: CONFIGURATION */}
                        <div className="space-y-6">
                            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-xl">
                                <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Biometrics Calibration</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {AVATAR_COLORS.map(c => (
                                        <button
                                            key={c.label}
                                            onClick={() => setAvatarColor(c.hex)}
                                            className={clsx("h-10 rounded border transition-all flex items-center justify-center gap-2 text-xs font-bold",
                                                avatarColor === c.hex ? "border-white bg-slate-700 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                                            )}
                                        >
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `#${c.hex.toString(16).padStart(6, '0')}` }} />
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-xl">
                                <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Assignment Difficulty</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'easy', label: 'Intern', desc: 'Guided repairs. Low stress.' },
                                        { id: 'medium', label: 'Technician', desc: 'Standard workload. Timed events.' },
                                        { id: 'hard', label: 'Manager', desc: 'High volume. Audit mechanics.' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setDifficulty(opt.id as any)}
                                            className={clsx("w-full p-3 rounded border text-left flex justify-between items-center transition-all",
                                                difficulty === opt.id
                                                    ? "bg-blue-900/20 border-blue-500"
                                                    : "bg-slate-950 border-slate-800 hover:border-slate-600"
                                            )}
                                        >
                                            <div>
                                                <div className={clsx("font-bold text-sm", difficulty === opt.id ? "text-blue-200" : "text-slate-300")}>{opt.label}</div>
                                                <div className="text-xs text-slate-500">{opt.desc}</div>
                                            </div>
                                            {difficulty === opt.id && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleStartFn}
                                disabled={!playerName.trim()}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 tracking-wider text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                PRINT BADGE & CLOCK IN
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

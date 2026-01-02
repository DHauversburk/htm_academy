import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

// Simple SVG Icons for stability
const IconBack = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

export const ProfileSetup = () => {
    // Steps: 0=Intro, 1=Method(Auth), 2=Login(opt), 3=Avatar, 4=Identity, 5=Difficulty
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { playerName, setPlayerName, difficulty, setDifficulty, completeSetup, setAuthMode, avatarColor, setAvatarColor } = useGameStore();

    const navigate = (newStep: number) => {
        setDirection(newStep > step ? 1 : -1);
        setStep(newStep);
    };

    const handleComplete = () => {
        completeSetup();
        EventBus.emit('start-tutorial');
    };

    const handleAuth = async () => {
        if (!email || !password) return;
        setIsLoading(true);
        setAuthError(null);

        try {
            // Sign Up / Sign In Logic
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

            if (signUpError) {
                if (signUpError.message.includes("already registered") || signUpError.status === 400) {
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                    if (signInError) throw signInError;
                    if (signInData.user) {
                        setAuthMode('authenticated');
                        navigate(3); // Skip to Avatar
                    }
                } else {
                    throw signUpError;
                }
            } else if (signUpData.user) {
                setAuthMode('authenticated');
                navigate(3); // Skip to Avatar
            }
        } catch (err: any) {
            setAuthError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const AVATAR_COLORS = [
        { hex: 0xffffff, label: 'Standard White' },
        { hex: 0x4ade80, label: 'Biohazard Green' },
        { hex: 0x00ffff, label: 'Electric Cyan' },
        { hex: 0xc084fc, label: 'Plasma Purple' },
        { hex: 0xf472b6, label: 'Laser Pink' },
        { hex: 0xfacc15, label: 'Caution Yellow' }
    ];

    // Animation Variants
    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 50 : -50, opacity: 0 })
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">

            {/* Main Wizard Card */}
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]">

                {/* Header: Progress & Title */}
                <div className="bg-slate-800/50 p-6 border-b border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            {[0, 1, 2, 3, 4, 5].map(s => {
                                // Don't show confusing dots for sub-steps or if we skip them, 
                                // but for simplicity let's stick to logical "Stages": 
                                // 1: Intro, 2: Auth, 3: Avatar, 4: Name, 5: Role
                                const isActive = (step === 0 && s === 0) ||
                                    (step >= 1 && step <= 2 && s === 1) ||
                                    (step === 3 && s === 2) ||
                                    (step === 4 && s === 3) ||
                                    (step === 5 && s === 4);
                                if (s > 4) return null; // We map 5 logical steps
                                return (
                                    <div key={s} className={clsx("h-1.5 rounded-full transition-all duration-300",
                                        isActive ? "w-8 bg-blue-500" : "w-1.5 bg-slate-700"
                                    )} />
                                );
                            })}
                        </div>
                        {step > 0 && (
                            <button onClick={() => navigate(step === 2 ? 1 : step - 1)} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm transition-colors">
                                <IconBack /> Back
                            </button>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {step === 0 && "System Initialization"}
                        {step === 1 && "Access Protocol"}
                        {step === 2 && "Identity Verification"}
                        {step === 3 && "Visual Customization"}
                        {step === 4 && "Technician Profile"}
                        {step === 5 && "Clearance Level"}
                    </h2>
                </div>

                {/* Content Body */}
                <div className="flex-1 relative p-6 overflow-hidden flex flex-col items-center justify-center">
                    <AnimatePresence custom={direction} mode="wait">

                        {/* STEP 0: INTRO */}
                        {step === 0 && (
                            <motion.div key="0" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full text-center">
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                    Welcome to HTM Academy.<br />
                                    Configure your session to begin your shift at the hospital.
                                </p>
                                <button onClick={() => navigate(1)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/40 transition-all">
                                    Start Setup
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 1: AUTH CHOICE */}
                        {step === 1 && (
                            <motion.div key="1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full space-y-4">
                                <button onClick={() => { setAuthMode('guest'); navigate(3); }}
                                    className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-slate-500 p-4 rounded-xl text-left transition-all group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white">Guest Technician</span>
                                        <span className="text-[10px] uppercase bg-slate-700 text-slate-300 px-2 py-1 rounded">Local Save</span>
                                    </div>
                                    <p className="text-sm text-slate-400">Play immediately. Progress saved to browser.</p>
                                </button>

                                <button onClick={() => navigate(2)}
                                    className="w-full bg-blue-900/20 hover:bg-blue-900/30 border-2 border-blue-800 hover:border-blue-500 p-4 rounded-xl text-left transition-all group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-blue-200">Authorized Personnel</span>
                                        <span className="text-[10px] uppercase bg-blue-900 text-blue-300 px-2 py-1 rounded">Cloud Sync</span>
                                    </div>
                                    <p className="text-sm text-blue-300/70">Login/Signup to sync progress across devices.</p>
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: LOGIN FORM */}
                        {step === 2 && (
                            <motion.div key="2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full max-w-sm">
                                {authError && <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded mb-4">{authError}</div>}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-slate-800 border-slate-600 rounded-lg p-3 text-white focus:ring-2 ring-blue-500 outline-none" placeholder="tech@hospital.org" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-slate-800 border-slate-600 rounded-lg p-3 text-white focus:ring-2 ring-blue-500 outline-none" placeholder="••••••••" />
                                    </div>
                                    <button onClick={handleAuth} disabled={isLoading || !email || !password}
                                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all">
                                        {isLoading ? 'Authenticating...' : 'Submit Credentials'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: AVATAR */}
                        {step === 3 && (
                            <motion.div key="3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full flex flex-col items-center">
                                <div className="relative w-24 h-24 bg-slate-800 rounded-full border-2 border-slate-600 mb-6 overflow-hidden flex items-center justify-center">
                                    <img src="assets/sprite_technician_chonk.png" className="scale-[2.0] object-none object-[0_-64px]" style={{ imageRendering: 'pixelated' }} />
                                    <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: `#${avatarColor.toString(16).padStart(6, '0')}` }}></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 w-full mb-6">
                                    {AVATAR_COLORS.map(c => (
                                        <button key={c.label} onClick={() => setAvatarColor(c.hex)}
                                            className={clsx("p-2 rounded-lg border-2 flex flex-col items-center gap-1 transition-all",
                                                avatarColor === c.hex ? "border-blue-400 bg-slate-700" : "border-slate-700 hover:bg-slate-800")}>
                                            <div className="w-6 h-6 rounded-full border border-slate-900" style={{ backgroundColor: `#${c.hex.toString(16).padStart(6, '0')}` }} />
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => navigate(4)} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold">Looks Good</button>
                            </motion.div>
                        )}

                        {/* STEP 4: NAME */}
                        {step === 4 && (
                            <motion.div key="4" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Display Name</label>
                                <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
                                    className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-xl p-4 text-xl text-white outline-none mb-6"
                                    placeholder="Biomed Tech" autoFocus />
                                <button onClick={() => navigate(5)} disabled={!playerName.trim()}
                                    className="w-full bg-slate-700 hover:bg-blue-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-all">
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 5: DIFFICULTY */}
                        {step === 5 && (
                            <motion.div key="5" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full space-y-3">
                                <button onClick={() => setDifficulty('easy')}
                                    className={clsx("w-full p-4 rounded-xl border-2 text-left transition-all", difficulty === 'easy' ? "border-green-500 bg-green-500/10" : "border-slate-700 bg-slate-800")}>
                                    <h4 className="font-bold text-green-400">Intern (Tutorial Mode)</h4>
                                    <p className="text-xs text-slate-400">Guided instructions. Best for first time players.</p>
                                </button>
                                <button onClick={() => setDifficulty('medium')}
                                    className={clsx("w-full p-4 rounded-xl border-2 text-left transition-all", difficulty === 'medium' ? "border-yellow-500 bg-yellow-500/10" : "border-slate-700 bg-slate-800")}>
                                    <h4 className="font-bold text-yellow-400">Technician</h4>
                                    <p className="text-xs text-slate-400">Standard shift. No hand-holding.</p>
                                </button>
                                <button onClick={() => setDifficulty('hard')}
                                    className={clsx("w-full p-4 rounded-xl border-2 text-left transition-all", difficulty === 'hard' ? "border-red-500 bg-red-500/10" : "border-slate-700 bg-slate-800")}>
                                    <h4 className="font-bold text-red-400">Manager</h4>
                                    <p className="text-xs text-slate-400">Full audit mode. High stress.</p>
                                </button>
                                <button onClick={handleComplete} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/40 animate-pulse">
                                    Start Shift
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import clsx from 'clsx';

export const ProfileSetup = () => {
    const { setPlayerName, setDifficulty, completeSetup, setAuthMode, setJobTitle } = useGameStore();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [name, setName] = useState('');
    const [role, setRole] = useState<'intern' | 'tech' | 'manager'>('intern');

    const handleGuestStart = () => {
        setAuthMode('guest');
        setStep(2);
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length > 0) {
            setPlayerName(name);
            setStep(3);
        }
    };

    const handleFinalize = () => {
        setDifficulty(role === 'intern' ? 'easy' : role === 'manager' ? 'hard' : 'medium');
        setJobTitle(role === 'intern' ? 'Biomed Intern' : role === 'manager' ? 'HTM Manager' : 'BMET II');
        completeSetup();

        // Trigger the tutorial completion sequence (which starts generation)
        EventBus.emit('tutorial-complete');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white">
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.png')] opacity-10 pointer-events-none" />

            {/* Version Tag */}
            <div className="absolute top-4 left-4 text-xs font-mono text-slate-500 opacity-50">v0.1.7</div>

            <motion.div
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <img src="/knight_logo.png" alt="HTM Academy" className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
                    <h1 className="text-2xl font-extrabold tracking-wide">HTM ACADEMY</h1>
                    <p className="text-slate-400 text-sm font-mono mt-2">SYSTEM ACCESS TERMINAL</p>
                </div>

                {/* Content Area */}
                <div className="p-8 min-h-[300px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h2 className="text-lg font-semibold text-center mb-6">Select Authentication</h2>
                                <button
                                    onClick={handleGuestStart}
                                    className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-3"
                                >
                                    <span>👤</span> Guest Access
                                </button>
                                <button
                                    disabled
                                    className="w-full py-4 px-6 bg-slate-800 text-slate-500 rounded-lg font-bold border border-slate-700 cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <span>☁️</span> Cloud Login (Coming Soon)
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-lg font-semibold text-center mb-6">Technician Identification</h2>
                                <form onSubmit={handleNameSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-slate-400 mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Tech 117"
                                            className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!name.trim()}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-bold transition-all mt-4"
                                    >
                                        Confirm Identity &rarr;
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h2 className="text-lg font-semibold text-center mb-6">Select Clearance Level</h2>

                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => setRole('intern')}
                                        className={clsx(
                                            "p-4 rounded-xl border text-left transition-all",
                                            role === 'intern'
                                                ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500"
                                                : "bg-slate-800 border-slate-700 hover:border-slate-600"
                                        )}
                                    >
                                        <div className="font-bold text-indigo-300">Intern (Easy)</div>
                                        <div className="text-xs text-slate-400 mt-1">Fewer tickets, accurate descriptions. Good for training.</div>
                                    </button>

                                    <button
                                        onClick={() => setRole('manager')}
                                        className={clsx(
                                            "p-4 rounded-xl border text-left transition-all",
                                            role === 'manager'
                                                ? "bg-red-600/20 border-red-500 ring-1 ring-red-500"
                                                : "bg-slate-800 border-slate-700 hover:border-slate-600"
                                        )}
                                    >
                                        <div className="font-bold text-red-300">Manager (Hard)</div>
                                        <div className="text-xs text-slate-400 mt-1">Budget crisis, angry doctors, cryptic failures.</div>
                                    </button>
                                </div>

                                <button
                                    onClick={handleFinalize}
                                    className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold transition-all shadow-lg hover:shadow-emerald-500/20 animate-pulse"
                                >
                                    INITIALIZE SHIFT
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Progress Dots */}
                <div className="p-6 pt-0 flex justify-center gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={clsx("w-2 h-2 rounded-full transition-colors", step >= i ? "bg-indigo-500" : "bg-slate-800")} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

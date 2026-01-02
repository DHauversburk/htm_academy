import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import clsx from 'clsx';

export const ProfileSetup = () => {
    const [step, setStep] = useState(0); // 0 = Intro, 1 = AuthChoice, 2 = Avatar, 3 = Name, 4 = Difficulty
    const { playerName, setPlayerName, difficulty, setDifficulty, completeSetup, setAuthMode, avatarColor, setAvatarColor, loadProfile } = useGameStore();

    const handleComplete = () => {
        completeSetup();
        // Trigger the Tutorial Scene in Phaser
        EventBus.emit('start-tutorial');
    };

    const AVATAR_COLORS = [
        { hex: 0xffffff, label: 'Standard White' },
        { hex: 0x4ade80, label: 'Biohazard Green' },
        { hex: 0x00ffff, label: 'Electric Cyan' },
        { hex: 0xc084fc, label: 'Plasma Purple' },
        { hex: 0xf472b6, label: 'Laser Pink' },
        { hex: 0xfacc15, label: 'Caution Yellow' }
    ];

    return (
        <AnimatePresence mode="wait">
            {step === 0 && (
                <motion.div
                    key="intro"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8 text-center"
                >
                    <h2 className="text-3xl font-bold text-blue-400 mb-4 tracking-tight">Access Restricted</h2>
                    <p className="text-slate-300 max-w-md mb-8 leading-relaxed">
                        Welcome to the Biomedical Engineering Department. <br />
                        Please register your credentials to begin your shift.
                    </p>
                    <button
                        onClick={() => setStep(1)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/40"
                    >
                        Initialize Badge
                    </button>
                </motion.div>
            )}

            {step === 1 && (
                <motion.div
                    key="auth-select"
                    initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                    className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8"
                >
                    <div className="w-full max-w-md space-y-6">
                        <h3 className="text-white text-xl font-bold text-center mb-6">Select Access Protocol</h3>

                        {/* Guest Option */}
                        <div
                            onClick={() => {
                                setAuthMode('guest');
                                setStep(2);
                            }}
                            className="bg-slate-800 border-2 border-slate-700 hover:border-slate-500 p-6 rounded-xl cursor-pointer group transition-all"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-slate-200 font-bold text-lg group-hover:text-white">Guest Badge</h4>
                                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600">Local Only</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-3">
                                Temporary access. Progress is saved to this device only.
                            </p>
                            <div className="flex items-center gap-2 text-yellow-500 text-xs bg-yellow-500/10 p-2 rounded">
                                <span className="font-bold">⚠ WARNING:</span>
                                <span>Data lost if browser cache cleared.</span>
                            </div>
                        </div>

                        {/* Authenticated Option (Placeholder/Simulated for now) */}
                        <div
                            onClick={() => {
                                setAuthMode('authenticated');
                                loadProfile();
                                setStep(2);
                            }}
                            className="bg-blue-900/20 border-2 border-blue-800 hover:border-blue-500 p-6 rounded-xl cursor-pointer group transition-all relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-blue-200 font-bold text-lg group-hover:text-blue-100">Authorized Personnel</h4>
                                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded border border-blue-700">Cloud Sync</span>
                            </div>
                            <p className="text-blue-300/80 text-sm">
                                Secure login. Progress synced across all devices.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    key="avatar"
                    initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                    className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8"
                >
                    <div className="w-full max-w-sm flex flex-col items-center space-y-6">
                        <h3 className="text-white text-xl font-bold text-center">Select Uniform Tint</h3>

                        {/* Preview */}
                        <div className="relative w-32 h-32 bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                            {/* We use the stored image asset directly for preview, using filter for tint simulation if possible, 
                                but since CSS filter hue-rotate is imprecise, we will trust the Phaser tint engine.
                                For now, we show the base image and a colored overlay. */}
                            <img src="assets/sprite_technician_chonk.png" className="scale-[2.5] object-none object-[0_-64px]" style={{ imageRendering: 'pixelated' }} alt="Avatar Preview" />
                            <div className="absolute inset-0 mix-blend-multiply pointer-events-none" style={{ backgroundColor: `#${avatarColor.toString(16).padStart(6, '0')}` }}></div>
                        </div>

                        {/* Color Grid */}
                        <div className="grid grid-cols-3 gap-3 w-full">
                            {AVATAR_COLORS.map((color) => (
                                <button
                                    key={color.label}
                                    onClick={() => setAvatarColor(color.hex)}
                                    className={clsx(
                                        "p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 hover:scale-105",
                                        avatarColor === color.hex ? "border-white bg-slate-700" : "border-slate-700 bg-slate-800"
                                    )}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full border border-slate-900 shadow-sm"
                                        style={{ backgroundColor: `#${color.hex.toString(16).padStart(6, '0')}` }}
                                    ></div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">{color.label.split(' ')[1]}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full mt-4 bg-slate-700 hover:bg-blue-600 text-white py-4 rounded-xl font-medium transition-all"
                        >
                            Confirm Appearance
                        </button>
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div
                    key="name"
                    initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                    className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8"
                >
                    <div className="w-full max-w-sm">
                        <label className="block text-blue-400 text-sm font-bold mb-2 uppercase tracking-wider">Technician Name</label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="e.g. TECH-1138 or John Doe"
                            className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 outline-none text-white text-xl p-4 rounded-xl transition-all"
                            autoFocus
                        />
                        <button
                            disabled={!playerName.trim()}
                            onClick={() => setStep(4)}
                            className="w-full mt-6 bg-slate-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium transition-all"
                        >
                            Confirm Identity
                        </button>
                    </div>
                </motion.div>
            )}

            {step === 4 && (
                <motion.div
                    key="diff"
                    initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                    className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8"
                >
                    <div className="w-full max-w-sm space-y-4">
                        <h3 className="text-white text-xl font-bold text-center mb-6">Select Clearance Level</h3>

                        <div
                            onClick={() => setDifficulty('easy')}
                            className={clsx(
                                "p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                                difficulty === 'easy' ? "border-green-500 bg-green-500/10" : "border-slate-700 bg-slate-800"
                            )}
                        >
                            <h4 className="text-green-400 font-bold">Intern (Easy)</h4>
                            <p className="text-slate-400 text-sm">Guided instructions. High feedback. Ideal for learning.</p>
                        </div>

                        <div
                            onClick={() => setDifficulty('medium')}
                            className={clsx(
                                "p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                                difficulty === 'medium' ? "border-yellow-500 bg-yellow-500/10" : "border-slate-700 bg-slate-800"
                            )}
                        >
                            <h4 className="text-yellow-400 font-bold">Technician (Normal)</h4>
                            <p className="text-slate-400 text-sm">Standard workload. Symptom-based troubleshooting.</p>
                        </div>

                        <div
                            onClick={() => setDifficulty('hard')}
                            className={clsx(
                                "p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                                difficulty === 'hard' ? "border-red-500 bg-red-500/10" : "border-slate-700 bg-slate-800"
                            )}
                        >
                            <h4 className="text-red-400 font-bold">Manager (hard)</h4>
                            <p className="text-slate-400 text-sm">Full responsibility. Compliance audits. No hand-holding.</p>
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/40"
                        >
                            Begin Orientation
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

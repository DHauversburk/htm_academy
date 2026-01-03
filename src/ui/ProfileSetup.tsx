import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import clsx from 'clsx';

// Constants for the avatar colors
const AVATAR_COLORS = [
    { hex: 0xffffff, label: 'Standard White' },
    { hex: 0x4ade80, label: 'Biohazard Green' },
    { hex: 0x00ffff, label: 'Electric Cyan' },
    { hex: 0xc084fc, label: 'Plasma Purple' },
    { hex: 0xf472b6, label: 'Laser Pink' },
    { hex: 0xfacc15, label: 'Caution Yellow' }
];

export const ProfileSetup = () => {
    // Zustand Store
    const {
        playerName, setPlayerName,
        difficulty, setDifficulty,
        avatarColor, setAvatarColor,
        completeSetup, setAuthMode
    } = useGameStore();

    // Form validation is derived from the store state directly
    const isFormValid = playerName.trim().length > 2 && difficulty !== null;

    const handleStartShift = () => {
        if (!isFormValid) return;
        setAuthMode('guest'); // Default to guest mode
        completeSetup();
        EventBus.emit('start-tutorial');
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="w-full max-w-4xl bg-slate-800 border-2 border-slate-700 rounded-2xl shadow-2xl flex overflow-hidden"
            >
                {/* Left Side - Avatar Preview */}
                <div className="hidden md:block w-1/3 bg-slate-900 p-8 flex flex-col items-center justify-center space-y-6 border-r-2 border-slate-700">
                    <h3 className="text-white text-xl font-bold text-center">Technician ID</h3>
                    <div className="relative w-48 h-48 bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                        <img src="assets/sprite_technician_chonk.png" className="scale-[4] object-none object-[0_-100px]" style={{ imageRendering: 'pixelated' }} alt="Avatar Preview" />
                        <div className="absolute inset-0 mix-blend-multiply pointer-events-none" style={{ backgroundColor: `#${avatarColor.toString(16).padStart(6, '0')}` }}></div>
                    </div>
                    <p className="text-slate-400 text-center leading-relaxed">Customize your appearance and professional details.</p>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-2/3 p-8 space-y-8">
                    {/* Name Input */}
                    <div>
                        <label className="block text-blue-400 text-sm font-bold mb-2 uppercase tracking-wider">Technician Name</label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="e.g. TECH-1138"
                            className="w-full bg-slate-700/50 border-2 border-slate-600 focus:border-blue-500 outline-none text-white text-xl p-4 rounded-xl transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Avatar Color Selection */}
                    <div>
                        <label className="block text-blue-400 text-sm font-bold mb-2 uppercase tracking-wider">Uniform Tint</label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {AVATAR_COLORS.map((color) => (
                                <button
                                    key={color.label}
                                    onClick={() => setAvatarColor(color.hex)}
                                    className={clsx(
                                        "p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-2 hover:scale-105",
                                        avatarColor === color.hex ? "border-white bg-slate-700" : "border-slate-600 bg-slate-800/60"
                                    )}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-slate-900/50 shadow-md"
                                        style={{ backgroundColor: `#${color.hex.toString(16).padStart(6, '0')}` }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div>
                        <label className="block text-blue-400 text-sm font-bold mb-3 uppercase tracking-wider">Clearance Level</label>
                        <div className="grid md:grid-cols-3 gap-4">
                            <DifficultyOption
                                level="easy"
                                title="Intern"
                                description="Guided tasks, high feedback."
                                selected={difficulty}
                                onSelect={setDifficulty}
                            />
                            <DifficultyOption
                                level="medium"
                                title="Technician"
                                description="Standard workload, some autonomy."
                                selected={difficulty}
                                onSelect={setDifficulty}
                            />
                            <DifficultyOption
                                level="hard"
                                title="Manager"
                                description="High pressure, minimal guidance."
                                selected={difficulty}
                                onSelect={setDifficulty}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        <button
                            disabled={!isFormValid}
                            onClick={handleStartShift}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-lg py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                        >
                            Begin Shift
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


// Helper component for difficulty options
const DifficultyOption = ({ level, title, description, selected, onSelect }) => {
    const isSelected = selected === level;
    const colorClasses = {
        easy: { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400' },
        medium: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
        hard: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
    };

    return (
        <div
            onClick={() => onSelect(level)}
            className={clsx(
                "p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] text-center md:text-left",
                isSelected ? `${colorClasses[level].border} ${colorClasses[level].bg}` : "border-slate-700 bg-slate-800/60"
            )}
        >
            <h4 className={clsx("font-bold", isSelected ? colorClasses[level].text : 'text-slate-200')}>{title}</h4>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    );
};

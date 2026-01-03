// src/ui/InterruptionModal.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, Mail, User } from 'lucide-react';
import { useGameStore } from '../game/store';

const ICONS = {
    phone: <Phone size={24} className="text-green-400" />,
    email: <Mail size={24} className="text-blue-400" />,
    'in-person': <User size={24} className="text-orange-400" />,
};

export function InterruptionModal() {
    const { activeInterruption, setActiveInterruption } = useGameStore();

    const handleClose = () => {
        setActiveInterruption(null);
    };

    return (
        <AnimatePresence>
            {activeInterruption && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center gap-3">
                            {ICONS[activeInterruption.type]}
                            <h2 className="text-white font-semibold text-lg">{activeInterruption.title}</h2>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-slate-200 text-lg leading-relaxed">"{activeInterruption.message}"</p>
                            <p className="text-right text-slate-400 font-medium">- {activeInterruption.sender}</p>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleClose}
                                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-6 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

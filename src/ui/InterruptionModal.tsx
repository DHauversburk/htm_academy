import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { Phone, Mail, User } from 'lucide-react';

const ICONS: { [key: string]: React.ReactNode } = {
    phone_call: <Phone size={24} />,
    email: <Mail size={24} />,
    in_person: <User size={24} />,
};

export function InterruptionModal() {
    const { interruption, setInterruption } = useGameStore();

    const handleOptionClick = (action: string) => {
        console.log('Interruption action:', action);
        setInterruption(null);
    };

    return (
        <AnimatePresence>
            {interruption && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center gap-3">
                        <div className="text-yellow-400">
                            {interruption ? ICONS[interruption.type] : null}
                        </div>
                        <h2 className="text-white font-semibold text-lg">
                            {interruption?.title}
                        </h2>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-200 mb-6">{interruption?.message}</p>
                        <div className="flex gap-3">
                            {interruption?.options.map((option) => (
                                <button
                                    key={option.action}
                                    onClick={() => handleOptionClick(option.action)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                                >
                                    {option.text}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
    );
}

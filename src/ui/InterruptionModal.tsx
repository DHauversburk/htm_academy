import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../game/store";
import { InterruptionChoice } from "../game/types";
import { Phone, Mail, AlertTriangle } from 'lucide-react';
import { cn } from "../lib/utils";

const ICONS: Record<string, React.ReactNode> = {
    'phone': <Phone size={24} />,
    'email': <Mail size={24} />,
    'alert': <AlertTriangle size={24} />,
};

export const InterruptionModal = () => {
    const { activeInterruption, setActiveInterruption } = useGameStore();

    const handleChoice = (choice: InterruptionChoice) => {
        console.log(`Player chose: ${choice.action}`);
        // TODO: Implement the consequences of the choice
        setActiveInterruption(null);
    };

    return (
        <AnimatePresence>
            {activeInterruption && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className={cn(
                            "p-4 border-b border-slate-700 flex items-center gap-4",
                            activeInterruption.type === 'phone' && "bg-blue-900/50",
                            activeInterruption.type === 'email' && "bg-amber-900/50",
                        )}>
                            <div className="text-blue-300">
                                {ICONS[activeInterruption.type] || ICONS['alert']}
                            </div>
                            <div>
                                <h2 className="text-white font-semibold text-lg">{activeInterruption.title}</h2>
                                <p className="text-slate-400 text-sm">From: {activeInterruption.sender}</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-slate-200 whitespace-pre-wrap">{activeInterruption.body}</p>
                        </div>

                        {/* Choices */}
                        <div className="bg-slate-900/70 p-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                            {activeInterruption.choices.map((choice) => (
                                <button
                                    key={choice.action}
                                    onClick={() => handleChoice(choice)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl font-medium transition-all active:scale-95 text-center"
                                >
                                    {choice.text}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

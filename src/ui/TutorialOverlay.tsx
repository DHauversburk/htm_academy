import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus } from '../game/EventBus';

export function TutorialOverlay() {
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleMessage = (msg: string) => {
            setMessage(msg);
        };

        const handleComplete = () => {
            setMessage(null);
        };

        EventBus.on('tutorial-message', handleMessage);
        EventBus.on('tutorial-complete', handleComplete);

        return () => {
            EventBus.removeListener('tutorial-message', handleMessage);
            EventBus.removeListener('tutorial-complete', handleComplete);
        };
    }, []);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-40 max-w-sm w-full"
                >
                    <div className="bg-blue-600/90 backdrop-blur-md text-white p-4 rounded-xl shadow-xl border border-blue-400/30">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-blue-200 mb-1">
                                    Tutorial
                                </h3>
                                <p className="font-medium leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

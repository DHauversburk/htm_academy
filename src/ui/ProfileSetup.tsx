import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';

export const ProfileSetup = () => {
    const { setPlayerName, setDifficulty, completeSetup, setAuthMode } = useGameStore();

    useEffect(() => {
        // Auto-start as guest after 1 second
        const timer = setTimeout(() => {
            setAuthMode('guest');
            setPlayerName(`Guest_${Math.floor(Math.random() * 9999)}`);
            setDifficulty('easy');
            completeSetup();
            EventBus.emit('tutorial-complete'); // Skip tutorial, straight to game
        }, 1000);

        return () => clearTimeout(timer);
    }, [setAuthMode, setPlayerName, setDifficulty, completeSetup]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="text-8xl mb-6"
                >
                    🏥
                </motion.div>

                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent mb-4">
                    HTM ACADEMY
                </h1>

                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-slate-400 text-xl"
                >
                    Loading Hospital...
                </motion.div>

                <div className="mt-8 flex gap-2 justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-3 h-3 bg-blue-500 rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-3 h-3 bg-cyan-500 rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-3 h-3 bg-blue-500 rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
};

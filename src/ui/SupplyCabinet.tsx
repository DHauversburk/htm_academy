import React from 'react';
import { useGameStore, PARTS_CATALOGUE } from '../game/store';
import { motion } from 'framer-motion';

interface Props {
    onClose: () => void;
}

export const SupplyCabinet = ({ onClose }: Props) => {
    const { addToInventory, inventory } = useGameStore();

    const handleTake = (itemId: string) => {
        // In this simulation, taking parts costs the department budget? 
        // Or is it free until installed? Let's say taking it costs money (buying stock).
        // User said "Supply cabinets for bmets are always in the bmet shop".
        // Usually parts are alread purchased. Let's assume free to take, but costs budget when *ordered* (future feature).
        // For now, free to take.

        addToInventory(itemId, 1);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-600 flex flex-col max-h-[80vh]"
            >
                {/* Header */}
                <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Biomed Supply Cabinet</h2>
                        <p className="text-sm text-slate-400">Take what you need for the shift.</p>
                    </div>
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white font-bold transition-colors">
                        Close
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(PARTS_CATALOGUE).map(([id, item]) => {
                        const currentQty = inventory[id] || 0;

                        return (
                            <div key={id} className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex items-start gap-4 hover:border-blue-500/50 transition-colors">
                                <div className="bg-slate-800 w-12 h-12 rounded flex items-center justify-center text-2xl border border-slate-600">
                                    📦
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-100">{item.name}</h3>
                                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                                            {item.weight}kg
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2">{item.desc}</p>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-xs text-slate-500">
                                            Carrying: <span className="text-white font-bold">{currentQty}</span>
                                        </div>
                                        <button
                                            onClick={() => handleTake(id)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-bold transition-all active:scale-95"
                                        >
                                            Take 1
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

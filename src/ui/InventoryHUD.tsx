import React, { useState } from 'react';
import { useGameStore, PARTS_CATALOGUE } from '../game/store';
import { ContainerType } from '../game/types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const CONTAINER_CONFIG: Record<ContainerType, { label: string, slots: number, icon: string }> = {
    'hands': { label: 'Two Hands', slots: 2, icon: '👐' },
    'fanny_pack': { label: 'Tech Pouch', slots: 5, icon: '👝' },
    'backpack': { label: 'Backpack', slots: 10, icon: '🎒' },
    'cart': { label: 'Push Cart', slots: 20, icon: '🛒' },
    'auto_cart': { label: 'Auto-Cart', slots: 40, icon: '🤖' }
};

export const InventoryHUD = () => {
    const { inventory, container, stats, calculateSpeed } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);

    const config = CONTAINER_CONFIG[container];
    const itemIds = Object.keys(inventory);

    // Calculate Weight
    const currentWeight = itemIds.reduce((total, id) => {
        const item = PARTS_CATALOGUE[id];
        return total + (item ? item.weight * inventory[id] : 0);
    }, 0);

    const maxWeight = config.slots * 2; // rough approximation for display scaling
    const speed = calculateSpeed();

    return (
        <div className="absolute bottom-4 left-4 z-40 flex flex-col items-start gap-2">

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-800 border border-slate-600 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-2"
            >
                <span className="text-2xl">{config.icon}</span>
                {!isOpen && (
                    <div className="flex flex-col items-start text-xs">
                        <span className="font-bold">{config.label}</span>
                        <span className={clsx({
                            'text-green-400': speed > 150,
                            'text-yellow-400': speed <= 150 && speed > 80,
                            'text-red-400': speed <= 80
                        })}>
                            Speed: {Math.round(speed / 2)}%
                        </span>
                    </div>
                )}
            </button>

            {/* Inventory Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-xl p-4 w-72 shadow-2xl text-slate-100"
                    >
                        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                            <h3 className="font-bold text-lg">{config.label}</h3>
                            <span className="text-xs text-slate-400">Lvl {stats.level}</span>
                        </div>

                        {/* Encumbrance Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Load</span>
                                <span>{currentWeight.toFixed(1)} kg</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={clsx("h-full transition-all duration-500", {
                                        'bg-green-500': speed > 180,
                                        'bg-yellow-500': speed <= 180 && speed > 100,
                                        'bg-red-500': speed <= 100
                                    })}
                                    style={{ width: `${Math.min((currentWeight / maxWeight) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 italic">
                                Strength {stats.strength} reduces movement penalties.
                            </p>
                        </div>

                        {/* Item Grid */}
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                            {/* Fill with actual items */}
                            {itemIds.map(id => (
                                <InventorySlot key={id} id={id} qty={inventory[id]} />
                            ))}

                            {/* Fill remaining slots with placeholders */}
                            {Array.from({ length: Math.max(0, config.slots - itemIds.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square bg-slate-800/50 rounded border border-slate-700/50 flex items-center justify-center">
                                    <span className="text-slate-600 text-xs">.</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InventorySlot = ({ id, qty }: { id: string, qty: number }) => {
    if (qty <= 0) return null;
    const item = PARTS_CATALOGUE[id];

    return (
        <div className="aspect-square bg-slate-800 border border-slate-600 rounded flex flex-col items-center justify-center p-1 relative hover:border-blue-400 cursor-pointer group">
            <span className="text-lg">📦</span> {/* Placeholder icon */}
            <span className="absolute bottom-0 right-1 text-xs font-bold text-white drop-shadow-md">{qty}</span>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-black border border-slate-500 p-2 rounded hidden group-hover:block z-50">
                <p className="font-bold text-xs text-white">{item?.name || id}</p>
                <p className="text-[10px] text-slate-400">{item?.desc}</p>
                <p className="text-[10px] text-blue-400 mt-1">{item?.weight}kg</p>
            </div>
        </div>
    );
};

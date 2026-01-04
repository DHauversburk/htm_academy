import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import clsx from 'clsx';
import { GameDirector } from '../game/systems/Director';


interface WorkbenchTerminalProps {
    onClose: () => void;
}

export const WorkbenchTerminal = ({ onClose }: WorkbenchTerminalProps) => {
    const { workOrders, activeOrderId, setActiveOrder } = useGameStore();
    const [selectedId, setSelectedId] = useState<string | null>(activeOrderId);

    const activeOrder = workOrders.find(o => o.id === selectedId);
    const activeDevice = activeOrder ? GameDirector.getDeviceDetails(activeOrder.deviceId) : null;

    const handleAccept = () => {
        if (selectedId) {
            setActiveOrder(selectedId);
            // Close terminal and maybe guide player?
            onClose();
            EventBus.emit('tutorial-message', 'Go to SUPPLIES to get parts.');
            // Or if they already have parts, go to patient?
            // checking if we need to emit "start-work"
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-5xl h-[80vh] bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono"
            >
                {/* Top Bar */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="ml-4 text-slate-300 font-bold tracking-widest">BIOMED_OS v4.2.0 // WORKBENCH_TERMINAL</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white uppercase font-bold text-sm">
                        [ ESC ] LOGOUT
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Ticket List */}
                    <div className="w-1/3 border-r border-slate-700 bg-slate-900/50 overflow-y-auto">
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Available Contracts ({workOrders.length})</h3>
                            <div className="space-y-2">
                                {workOrders.map(order => (
                                    <button
                                        key={order.id}
                                        onClick={() => setSelectedId(order.id)}
                                        className={clsx(
                                            "w-full text-left p-3 rounded border transition-all relative overflow-hidden group",
                                            selectedId === order.id
                                                ? "bg-blue-900/30 border-blue-500/50"
                                                : "bg-slate-800/30 border-slate-700 hover:border-slate-500"
                                        )}
                                    >
                                        {/* Status Indicator Bar */}
                                        <div className={clsx(
                                            "absolute left-0 top-0 bottom-0 w-1",
                                            order.priority === 'emergency' ? "bg-red-500" :
                                                order.priority === 'urgent' ? "bg-orange-500" : "bg-blue-500"
                                        )} />

                                        <div className="pl-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-400">{order.id}</span>
                                                <span className="text-emerald-400 font-bold text-xs">${order.reward}</span>
                                            </div>
                                            <div className="font-bold text-slate-200 text-sm truncate">{order.reportedIssue}</div>
                                            <div className="text-[10px] text-slate-500 uppercase mt-1 flex justify-between">
                                                <span>{order.customer}</span>
                                                {selectedId === order.id && <span className="text-blue-400 animate-pulse">SELECTED</span>}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Details */}
                    <div className="flex-1 bg-slate-950 p-8 flex flex-col relative">
                        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.png')] opacity-5 pointer-events-none" />

                        {activeOrder ? (
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-2">{activeOrder.reportedIssue}</h1>
                                        <div className="flex gap-3 text-sm">
                                            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 border border-slate-700">
                                                ID: {activeOrder.id}
                                            </span>
                                            <span className={clsx("px-2 py-1 rounded font-bold uppercase border",
                                                activeOrder.priority === 'emergency' ? "bg-red-900/30 border-red-500 text-red-400" :
                                                    activeOrder.ticketType === 'PM' ? "bg-purple-900/30 border-purple-500 text-purple-400" :
                                                        "bg-blue-900/30 border-blue-500 text-blue-400"
                                            )}>
                                                {activeOrder.priority} • {activeOrder.ticketType === 'PM' ? 'MAINTENANCE' : 'REPAIR'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-emerald-400">${activeOrder.reward}</div>
                                        <div className="text-xs text-slate-500 uppercase">Contract Value</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="bg-slate-900 p-4 rounded border border-slate-800">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Location</h4>
                                        <div className="text-lg text-white">{activeOrder.locationDetails?.department || activeOrder.customer}</div>
                                        <div className="text-sm text-slate-400">
                                            {activeOrder.locationDetails?.room || 'General Area'}
                                            {activeOrder.locationDetails?.bed && <span className="text-slate-500"> • {activeOrder.locationDetails.bed}</span>}
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 p-4 rounded border border-slate-800">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Device</h4>
                                        <div className="text-lg text-white">{activeDevice?.name || activeOrder.deviceId}</div>
                                        <div className="text-sm text-slate-400">{activeDevice?.type || 'Unknown Device'}</div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-4 rounded border border-slate-800 flex-1 mb-8">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Technician Notes</h4>
                                    <p className="text-slate-300 leading-relaxed">
                                        User reported device is not functioning correctly. Initial triage required.
                                        Check for physical damage, power continuity, and verify calibration.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Difficulty Rating:</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className={clsx("w-2 h-4 rounded-sm", i <= activeOrder.difficulty ? "bg-yellow-500" : "bg-slate-800")} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-auto">
                                    <button
                                        onClick={handleAccept}
                                        disabled={activeOrderId === activeOrder.id}
                                        className={clsx(
                                            "px-8 py-3 rounded font-bold uppercase tracking-wider transition-all",
                                            activeOrderId === activeOrder.id
                                                ? "bg-green-600/20 text-green-500 border border-green-500/50 cursor-default"
                                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20"
                                        )}
                                    >
                                        {activeOrderId === activeOrder.id ? "ACTIVE CONTRACT" : "ACCEPT CONTRACT"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                <span className="text-4xl mb-4 opacity-20">🖥️</span>
                                <p>Select a ticket to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

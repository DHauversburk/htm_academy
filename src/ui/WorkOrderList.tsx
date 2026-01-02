import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import clsx from 'clsx';
import type { WorkOrder } from '../game/types';

export const WorkOrderList = () => {
    const { workOrders, activeOrderId, budget, inventory } = useGameStore();

    const handleSelectOrder = (order: WorkOrder) => {
        // Emit event to close the list UI and switch Phaser scene
        EventBus.emit('start-repair', {
            id: order.id,
            device: 'device_pump', // Hardcoded asset key for now, real app would use order.device.imageKey
            details: order
        });
    };

    return (
        <div className="absolute top-16 right-4 w-80 max-h-[80vh] z-10 space-y-3 pointer-events-auto">
            {/* Reporter Info Panel */}
            <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/90 text-white shadow-xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">Technician Status</h3>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Budget:</span>
                        <span className="font-mono text-green-400">${budget.toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="text-slate-400">Inventory:</span>
                        <ul className="mt-1 space-y-1 text-xs">
                            {inventory.map(part => (
                                <li key={part.id} className="flex justify-between items-center bg-slate-700/50 p-1 rounded">
                                    <span>{part.name}</span>
                                    <span className="font-mono bg-slate-900/50 px-2 rounded-sm">{part.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Scrollable Work Order List */}
            <div className='max-h-[60vh] overflow-y-auto space-y-3'>
                {workOrders.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSelectOrder(order)}
                        className={clsx(
                            "p-4 rounded-xl border border-slate-700 shadow-xl cursor-pointer transition-colors backdrop-blur-md",
                            activeOrderId === order.id ? "bg-blue-900/80 border-blue-500" : "bg-slate-800/90 hover:bg-slate-800"
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono text-slate-400">{order.id}</span>
                            {order.priority === 'emergency' && <span className="text-xs font-bold text-red-500 animate-pulse">EMERGENCY</span>}
                            {order.priority === 'urgent' && <span className="text-xs font-bold text-orange-400">URGENT</span>}
                        </div>

                        <h4 className="text-white font-medium mb-1 truncate">{order.reportedIssue}</h4>

                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>{order.customer}</span>
                            <span className={clsx(
                                "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold",
                                order.status === 'open' ? "bg-slate-700 text-slate-300" : "bg-green-900 text-green-300"
                            )}>
                                {order.status}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

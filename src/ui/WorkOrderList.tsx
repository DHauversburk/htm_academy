import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import clsx from 'clsx';

export const WorkOrderList = () => {
    const { workOrders, activeOrderId } = useGameStore();
    const activeOrder = workOrders.find(wo => wo.id === activeOrderId);

    if (!activeOrder) {
        return (
            <div className="absolute top-4 right-4 w-80 z-10 pointer-events-none">
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-4 rounded-xl border border-slate-700 shadow-xl bg-slate-800/90 hover:bg-slate-800 backdrop-blur-md text-center pointer-events-auto"
                >
                    <h4 className="text-white font-medium mb-1">No Active Objective</h4>
                    <p className="text-xs text-slate-400">Proceed to the 🔧 Workbench to accept a new contract.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="absolute top-4 right-4 w-80 z-10 pointer-events-none">
            <motion.div
                key={activeOrder.id}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={clsx(
                    "p-4 rounded-xl border border-blue-500 shadow-xl cursor-pointer transition-colors backdrop-blur-md bg-blue-900/80 pointer-events-auto"
                )}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-slate-400">OBJECTIVE: {activeOrder.id}</span>
                    {activeOrder.priority === 'emergency' && <span className="text-xs font-bold text-red-500 animate-pulse">EMERGENCY</span>}
                </div>
                <h4 className="text-white font-medium mb-1 truncate">{activeOrder.reportedIssue}</h4>
                <p className="text-xs text-slate-400">Proceed to the <span className="font-bold text-amber-300">{activeOrder.location}</span> to begin work.</p>
            </motion.div>
        </div>
    );
};

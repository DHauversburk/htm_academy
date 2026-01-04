import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import clsx from 'clsx';

export const WorkOrderList = () => {
    const { workOrders, activeOrderId } = useGameStore();

    const activeOrder = workOrders.find(order => order.id === activeOrderId);

    // This component now acts as the "Active Objective" display.
    const handleObjectiveClicked = () => {
        if (activeOrder) {
            // Potentially emit an event to highlight the objective's location on the map
            EventBus.emit('objective-ping', activeOrder.deviceId);
            EventBus.emit('show-toast', 'Objective location pinged on map.');
        } else {
            // Guide player to the workbench
            EventBus.emit('objective-ping', 'Workbench');
            EventBus.emit('show-toast', 'Find the Workbench to get a new contract.');
        }
    };

    return (
        <div className="absolute top-4 right-4 w-80 z-10 pointer-events-auto">
            {activeOrder ? (
                <motion.div
                    key={activeOrder.id}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleObjectiveClicked}
                    className="p-4 rounded-xl border border-blue-500 bg-blue-900/80 shadow-xl cursor-pointer transition-colors backdrop-blur-md"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-blue-300">{activeOrder.id}</span>
                        {/* Current Objective Title */}
                        <span className="text-xs font-bold text-blue-300 uppercase">ACTIVE CONTRACT</span>
                    </div>

                    {/* Body */}
                    <h4 className="text-white font-medium mb-1 truncate">{activeOrder.reportedIssue}</h4>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-xs text-slate-300 mt-2 pt-2 border-t border-blue-500/50">
                        <span>Go to: <span className="font-bold text-white">{activeOrder.customer}</span></span>
                        {activeOrder.priority === 'emergency' && <span className="font-bold text-red-400 animate-pulse">EMERGENCY</span>}
                        {activeOrder.priority === 'urgent' && <span className="font-bold text-orange-400">URGENT</span>}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={handleObjectiveClicked}
                    className="p-4 rounded-xl border border-slate-700 bg-slate-800/90 shadow-xl cursor-pointer transition-colors backdrop-blur-md"
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">NO ACTIVE CONTRACT</span>
                    </div>
                    <p className="text-slate-300 text-sm">Go to the <span className="font-bold text-yellow-400">WORKBENCH</span> to accept a new contract.</p>
                </motion.div>
            )}
        </div>
    );
};

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useGameStore } from '../game/store';

interface RepairMenuProps {
    activeOrderId: string;
    onClose: () => void;
    onComplete: (actionId: string) => void;
}


const REPAIR_ACTIONS = [
    { id: 'replace_cord', label: 'Replace Power Cord', icon: '🔌', partId: 'part-cord' },
    { id: 'replace_battery', label: 'Replace Battery', icon: '🔋', partId: 'part-battery' },
    { id: 'replace_inlet', label: 'Replace AC Inlet', icon: '🔧', partId: 'part-inlet' },
    { id: 'calibration', label: 'Perform Calibration', icon: '⚖️' },
    { id: 'clean_device', label: 'Clean & Decontaminate', icon: '✨' },
    { id: 'no_fault_found', label: 'No Fault Found (NFF)', icon: '🤷' },
];

export const RepairMenu = ({ activeOrderId, onClose, onComplete }: RepairMenuProps) => {
    const { inventory, completeWorkOrder } = useGameStore();

    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create a map for quick part lookup
    const inventoryMap = useMemo(() => new Map(inventory.map(p => [p.id, p.quantity])), [inventory]);

    const handleSubmit = () => {
        if (!selectedAction) return;
        setIsSubmitting(true);

        const action = REPAIR_ACTIONS.find(a => a.id === selectedAction);
        const partId = action?.partId;
        const partUsed = partId ? inventory.find(p => p.id === partId) : undefined;

        // Dispatch to the store
        completeWorkOrder(activeOrderId, partUsed ? [partUsed] : []);


        // Simulate a momentary delay for "Saving..."
        setTimeout(() => {
            onComplete(selectedAction);
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-600 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 bg-slate-900 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Service Report</h2>
                    <p className="text-slate-400 text-sm">Select the resolution for this work order.</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Action Selection */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Corrective Action</label>
                        <div className="grid grid-cols-2 gap-3">
                            {REPAIR_ACTIONS.map((action) => {
                                const hasPart = !action.partId || (inventoryMap.get(action.partId) ?? 0) > 0;
                                const isSelected = selectedAction === action.id;

                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => setSelectedAction(action.id)}
                                        disabled={!hasPart}
                                        className={clsx(
                                            "p-3 rounded-xl border text-left transition-all flex items-center space-x-2 relative",
                                            isSelected
                                                ? "bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                                : "bg-slate-700/50 border-slate-700 text-slate-300",
                                            hasPart
                                                ? "hover:bg-slate-700 hover:border-slate-500"
                                                : "opacity-40 cursor-not-allowed"
                                        )}
                                    >
                                        <span className="text-xl">{action.icon}</span>
                                        <span className="text-sm font-medium leading-tight">{action.label}</span>
                                        {!hasPart && (
                                            <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">OUT</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedAction || isSubmitting}
                        className={clsx(
                            "px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center space-x-2",
                            !selectedAction || isSubmitting
                                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-400 text-white hover:shadow-blue-500/25 active:scale-95"
                        )}
                    >
                        <span>{isSubmitting ? 'Submitting...' : 'Complete Ticket'}</span>
                        {!isSubmitting && <span>✓</span>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
